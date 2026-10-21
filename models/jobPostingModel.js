/**
 * JobPosting Model
 * 
 * Encapsulates data access and business logic for the JobPosting entity.
 * Schema based on migrations/004_update_job_postings_schema.sql and migrations/006_decouple_user_and_job_postings.sql.
 * 
 * Note: Job postings are independent corporate listings (not tied directly to a specific user).
 * Alumni users interact with job postings exclusively via Job Applications (job_applications).
 * 
 * Relationships:
 *   - hasMany: JobApplication (job_applications.job_id -> job_postings.id)
 *   - belongsToMany: Skill (via job_skills junction table)
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'job_postings.json');
const JOB_SKILLS_FILE = path.join(DATA_DIR, 'job_skills.json');

class JobPostingModel {
    constructor() {
        this.jobs = [];
        this.jobSkills = []; // [{ job_id, skill_id, is_mandatory }]
        this.currentId = 1;
        this._loadFallback();
    }

    _loadFallback() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.jobs = parsed;
                    this.currentId = Math.max(...this.jobs.map(j => j.id || 0)) + 1;
                }
            }
            if (fs.existsSync(JOB_SKILLS_FILE)) {
                const rawSkills = fs.readFileSync(JOB_SKILLS_FILE, 'utf8');
                const parsedSkills = JSON.parse(rawSkills);
                if (Array.isArray(parsedSkills)) {
                    this.jobSkills = parsedSkills;
                }
            }
        } catch (e) {
            // Keep in-memory
        }
    }

    _saveFallback() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.jobs, null, 2), 'utf8');
            fs.writeFileSync(JOB_SKILLS_FILE, JSON.stringify(this.jobSkills, null, 2), 'utf8');
        } catch (e) {
            // Keep in-memory
        }
    }

    /**
     * Validate job posting data
     * @param {Object} data
     * @param {boolean} isPartial - If true (PATCH), only provided fields are checked
     * @returns {{ isValid: boolean, error: string|null }}
     */
    validate(data, isPartial = false) {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: 'Invalid job posting payload' };
        }

        if (!isPartial) {
            if (!data.company_name || !data.title || !data.description || !data.location) {
                return { isValid: false, error: 'Missing required fields: company_name, title, description, location' };
            }
        }

        if (data.salary_min !== undefined && data.salary_min !== null && Number(data.salary_min) < 0) {
            return { isValid: false, error: 'salary_min cannot be negative' };
        }

        if (data.salary_min !== undefined && data.salary_max !== undefined && 
            data.salary_min !== null && data.salary_max !== null && 
            Number(data.salary_max) < Number(data.salary_min)) {
            return { isValid: false, error: 'salary_max must be greater than or equal to salary_min' };
        }

        return { isValid: true, error: null };
    }

    /**
     * Retrieve all job postings from database or fallback (supports query filters)
     * @param {Object} filters
     * @returns {Promise<Array<Object>>}
     */
    async getAll(filters = {}) {
        try {
            let sql = `
                SELECT 
                    id, company_name, company_logo_url, title, category,
                    description, requirements, benefits, employment_type, workplace_type,
                    experience_level, location, salary_min, salary_max, currency,
                    is_salary_visible, application_url, contact_email,
                    TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline, status, is_featured,
                    views_count, created_at, updated_at
                FROM job_postings
                WHERE 1=1
            `;
            const params = [];

            if (filters.status) {
                params.push(filters.status);
                sql += ` AND status = $${params.length}`;
            }
            if (filters.category) {
                params.push(filters.category);
                sql += ` AND category = $${params.length}`;
            }
            if (filters.workplace_type) {
                params.push(filters.workplace_type);
                sql += ` AND workplace_type = $${params.length}`;
            }
            if (filters.employment_type) {
                params.push(filters.employment_type);
                sql += ` AND employment_type = $${params.length}`;
            }
            if (filters.is_featured !== undefined) {
                params.push(Boolean(filters.is_featured));
                sql += ` AND is_featured = $${params.length}`;
            }

            sql += ` ORDER BY is_featured DESC, id DESC;`;

            const res = await db.query(sql, params);
            return res.rows.map(r => this._formatRow(r));
        } catch (e) {
            let result = [...this.jobs];
            if (filters.status) result = result.filter(j => j.status === filters.status);
            if (filters.category) result = result.filter(j => j.category === filters.category);
            if (filters.workplace_type) result = result.filter(j => j.workplace_type === filters.workplace_type);
            return result;
        }
    }

    /**
     * Retrieve a single job posting by ID
     * @param {number|string} id
     * @returns {Promise<Object|null>}
     */
    async getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(`
                SELECT 
                    id, company_name, company_logo_url, title, category,
                    description, requirements, benefits, employment_type, workplace_type,
                    experience_level, location, salary_min, salary_max, currency,
                    is_salary_visible, application_url, contact_email,
                    TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline, status, is_featured,
                    views_count, created_at, updated_at
                FROM job_postings
                WHERE id = $1 LIMIT 1;
            `, [numericId]);

            if (res.rows.length > 0) {
                return this._formatRow(res.rows[0]);
            }
            return null;
        } catch (e) {
            const found = this.jobs.find(j => j.id === numericId);
            return found ? { ...found } : null;
        }
    }

    /**
     * Create a new job posting in database
     * @param {Object} data
     * @returns {Promise<{ success: boolean, job?: Object, error?: string }>}
     */
    async create(data) {
        const val = this.validate(data, false);
        if (!val.isValid) return { success: false, error: val.error };

        const company_name = data.company_name.trim();
        const company_logo_url = data.company_logo_url || null;
        const title = data.title.trim();
        const category = data.category ? data.category.trim() : 'Genel';
        const description = data.description.trim();
        const requirements = data.requirements || null;
        const benefits = data.benefits || null;
        const employment_type = data.employment_type || 'full-time';
        const workplace_type = data.workplace_type || 'hybrid';
        const experience_level = data.experience_level || 'mid';
        const location = data.location.trim();
        const salary_min = data.salary_min !== undefined && data.salary_min !== null ? Number(data.salary_min) : null;
        const salary_max = data.salary_max !== undefined && data.salary_max !== null ? Number(data.salary_max) : null;
        const currency = data.currency || 'TRY';
        const is_salary_visible = Boolean(data.is_salary_visible);
        const application_url = data.application_url || null;
        const contact_email = data.contact_email || null;
        const deadline = data.deadline || null;
        const status = data.status || 'open';
        const is_featured = Boolean(data.is_featured);

        try {
            const res = await db.query(`
                INSERT INTO job_postings (
                    company_name, company_logo_url, title, category,
                    description, requirements, benefits, employment_type, workplace_type,
                    experience_level, location, salary_min, salary_max, currency,
                    is_salary_visible, application_url, contact_email, deadline, status, is_featured
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                RETURNING 
                    id, company_name, company_logo_url, title, category,
                    description, requirements, benefits, employment_type, workplace_type,
                    experience_level, location, salary_min, salary_max, currency,
                    is_salary_visible, application_url, contact_email,
                    TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline, status, is_featured,
                    views_count, created_at, updated_at;
            `, [
                company_name, company_logo_url, title, category,
                description, requirements, benefits, employment_type, workplace_type,
                experience_level, location, salary_min, salary_max, currency,
                is_salary_visible, application_url, contact_email, deadline, status, is_featured
            ]);

            if (res.rows.length > 0) {
                const job = this._formatRow(res.rows[0]);
                this.jobs.push(job);
                this._saveFallback();
                return { success: true, job };
            }
        } catch (e) {
            console.warn('JobPosting create DB fallback:', e.message);
        }

        const newJob = {
            id: this.currentId++,
            company_name,
            company_logo_url,
            title,
            category,
            description,
            requirements,
            benefits,
            employment_type,
            workplace_type,
            experience_level,
            location,
            salary_min,
            salary_max,
            currency,
            is_salary_visible,
            application_url,
            contact_email,
            deadline,
            status,
            is_featured,
            views_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.jobs.push(newJob);
        this._saveFallback();
        return { success: true, job: newJob };
    }

    /**
     * Update job posting (PUT)
     * @param {number|string} id
     * @param {Object} data
     */
    async update(id, data) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid ID' };

        const val = this.validate(data, false);
        if (!val.isValid) return { success: false, error: val.error };

        try {
            const res = await db.query(`
                UPDATE job_postings SET
                    company_name = $1, company_logo_url = $2, title = $3, category = $4,
                    description = $5, requirements = $6, benefits = $7, employment_type = $8,
                    workplace_type = $9, experience_level = $10, location = $11,
                    salary_min = $12, salary_max = $13, currency = $14, is_salary_visible = $15,
                    application_url = $16, contact_email = $17, deadline = $18, status = $19,
                    is_featured = $20, updated_at = NOW()
                WHERE id = $21
                RETURNING 
                    id, company_name, company_logo_url, title, category,
                    description, requirements, benefits, employment_type, workplace_type,
                    experience_level, location, salary_min, salary_max, currency,
                    is_salary_visible, application_url, contact_email,
                    TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline, status, is_featured,
                    views_count, created_at, updated_at;
            `, [
                data.company_name.trim(), data.company_logo_url || null, data.title.trim(), data.category || 'Genel',
                data.description.trim(), data.requirements || null, data.benefits || null, data.employment_type || 'full-time',
                data.workplace_type || 'hybrid', data.experience_level || 'mid', data.location.trim(),
                data.salary_min !== undefined ? Number(data.salary_min) : null,
                data.salary_max !== undefined ? Number(data.salary_max) : null,
                data.currency || 'TRY', Boolean(data.is_salary_visible),
                data.application_url || null, data.contact_email || null, data.deadline || null,
                data.status || 'open', Boolean(data.is_featured), numericId
            ]);

            if (res.rows.length > 0) {
                const updated = this._formatRow(res.rows[0]);
                const idx = this.jobs.findIndex(j => j.id === numericId);
                if (idx !== -1) this.jobs[idx] = updated;
                this._saveFallback();
                return { success: true, job: updated };
            }
            return { success: false, notFound: true, error: 'Job posting not found' };
        } catch (e) {
            // Fallback
        }

        const idx = this.jobs.findIndex(j => j.id === numericId);
        if (idx === -1) return { success: false, notFound: true, error: 'Job posting not found' };

        const updatedLocal = {
            ...this.jobs[idx],
            ...data,
            id: numericId,
            updated_at: new Date().toISOString()
        };
        this.jobs[idx] = updatedLocal;
        this._saveFallback();
        return { success: true, job: updatedLocal };
    }

    /**
     * Partial update (PATCH)
     * @param {number|string} id
     * @param {Object} data
     */
    async patch(id, data) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid ID' };

        const val = this.validate(data, true);
        if (!val.isValid) return { success: false, error: val.error };

        const existing = await this.getById(numericId);
        if (!existing) return { success: false, notFound: true, error: 'Job posting not found' };

        const merged = { ...existing, ...data };
        return this.update(numericId, merged);
    }

    /**
     * Delete job posting
     * @param {number|string} id
     */
    async delete(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid ID' };

        try {
            const res = await db.query('DELETE FROM job_postings WHERE id = $1 RETURNING id, title;', [numericId]);
            if (res.rows.length > 0) {
                const idx = this.jobs.findIndex(j => j.id === numericId);
                if (idx !== -1) this.jobs.splice(idx, 1);
                this._saveFallback();
                return { success: true, job: res.rows[0] };
            }
            return { success: false, notFound: true, error: 'Job posting not found' };
        } catch (e) {
            // Fallback
        }

        const idx = this.jobs.findIndex(j => j.id === numericId);
        if (idx === -1) return { success: false, notFound: true, error: 'Job posting not found' };
        const [deleted] = this.jobs.splice(idx, 1);
        this._saveFallback();
        return { success: true, job: deleted };
    }

    /**
     * Increment views count
     * @param {number|string} id
     */
    async incrementViews(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return;
        try {
            await db.query('UPDATE job_postings SET views_count = views_count + 1 WHERE id = $1;', [numericId]);
        } catch (e) {
            const job = this.jobs.find(j => j.id === numericId);
            if (job) job.views_count = (job.views_count || 0) + 1;
        }
    }

    /**
     * Clear all job postings and associated skills (used by seeder / reset)
     */
    async clear() {
        try {
            await db.query("TRUNCATE TABLE job_postings RESTART IDENTITY CASCADE;");
        } catch (e) {
            // Fallback
        }
        this.jobs = [];
        this.jobSkills = [];
        this.currentId = 1;
        this._saveFallback();
    }

    // =========================================================================
    // RELATIONSHIPS & ASSOCIATIONS (Defined using migration schema)
    // =========================================================================

    /**
     * Relationship: BelongsToMany -> Skills (via job_skills)
     * Fetches all skills tagged for this job posting
     * @param {number|string} jobId
     * @returns {Promise<Array<Object>>}
     */
    async getSkills(jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) return [];

        try {
            const res = await db.query(`
                SELECT s.id, s.name, s.category, js.is_mandatory
                FROM skills s
                JOIN job_skills js ON s.id = js.skill_id
                WHERE js.job_id = $1
                ORDER BY js.is_mandatory DESC, s.name ASC;
            `, [numericId]);

            return res.rows.map(r => ({
                id: Number(r.id),
                name: r.name,
                category: r.category,
                is_mandatory: Boolean(r.is_mandatory)
            }));
        } catch (e) {
            return this.jobSkills
                .filter(js => js.job_id === numericId)
                .map(js => ({ id: js.skill_id, name: js.name || 'Skill', is_mandatory: js.is_mandatory }));
        }
    }

    /**
     * Relationship Action: Attach a skill to this job posting
     * @param {number|string} jobId
     * @param {number|string} skillId
     * @param {boolean} [isMandatory=true]
     */
    async attachSkill(jobId, skillId, isMandatory = true) {
        const jId = parseInt(jobId, 10);
        const sId = parseInt(skillId, 10);
        if (isNaN(jId) || isNaN(sId)) return { success: false, error: 'Invalid ID' };

        try {
            await db.query(`
                INSERT INTO job_skills (job_id, skill_id, is_mandatory)
                VALUES ($1, $2, $3)
                ON CONFLICT (job_id, skill_id) DO UPDATE SET is_mandatory = EXCLUDED.is_mandatory;
            `, [jId, sId, isMandatory]);
            return { success: true };
        } catch (e) {
            const existingIndex = this.jobSkills.findIndex(js => js.job_id === jId && js.skill_id === sId);
            if (existingIndex !== -1) {
                this.jobSkills[existingIndex].is_mandatory = isMandatory;
            } else {
                this.jobSkills.push({ job_id: jId, skill_id: sId, is_mandatory: isMandatory });
            }
            this._saveFallback();
            return { success: true };
        }
    }

    /**
     * Relationship Action: Detach a skill from this job posting
     * @param {number|string} jobId
     * @param {number|string} skillId
     */
    async detachSkill(jobId, skillId) {
        const jId = parseInt(jobId, 10);
        const sId = parseInt(skillId, 10);
        if (isNaN(jId) || isNaN(sId)) return { success: false, error: 'Invalid ID' };

        try {
            await db.query(`DELETE FROM job_skills WHERE job_id = $1 AND skill_id = $2;`, [jId, sId]);
            return { success: true };
        } catch (e) {
            const idx = this.jobSkills.findIndex(js => js.job_id === jId && js.skill_id === sId);
            if (idx !== -1) this.jobSkills.splice(idx, 1);
            this._saveFallback();
            return { success: true };
        }
    }

    /**
     * Relationship: HasMany -> JobApplications (job_applications.job_id -> job_postings.id)
     * Fetches all applicant submissions for this job posting
     * @param {number|string} jobId
     * @returns {Promise<Array<Object>>}
     */
    async getApplications(jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) return [];
        const JobApplicationModel = require('./jobApplicationModel');
        return JobApplicationModel.getByJobId(numericId);
    }

    /**
     * Internal helper to normalize row data
     */
    _formatRow(r) {
        return {
            id: Number(r.id),
            company_name: r.company_name,
            company_logo_url: r.company_logo_url || '',
            title: r.title,
            category: r.category || 'Genel',
            description: r.description,
            requirements: r.requirements || '',
            benefits: r.benefits || '',
            employment_type: r.employment_type || 'full-time',
            workplace_type: r.workplace_type || 'hybrid',
            experience_level: r.experience_level || 'mid',
            location: r.location,
            salary_min: r.salary_min !== null ? Number(r.salary_min) : null,
            salary_max: r.salary_max !== null ? Number(r.salary_max) : null,
            currency: r.currency || 'TRY',
            is_salary_visible: Boolean(r.is_salary_visible),
            application_url: r.application_url || '',
            contact_email: r.contact_email || '',
            deadline: r.deadline || '',
            status: r.status || 'open',
            is_featured: Boolean(r.is_featured),
            views_count: Number(r.views_count || 0),
            created_at: r.created_at,
            updated_at: r.updated_at
        };
    }
}

const jobPostingModelInstance = new JobPostingModel();
module.exports = jobPostingModelInstance;
module.exports.JobPostingModel = JobPostingModel;
