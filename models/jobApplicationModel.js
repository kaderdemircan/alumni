/**
 * JobApplication Model
 * 
 * Encapsulates data access and business logic for Job Application submissions.
 * Matches schema defined in migrations/005_update_job_applications_schema.sql and ddd.md.
 * 
 * Relationships:
 *   - belongsTo: JobPosting (job_id -> job_postings.id)
 *   - belongsTo: User (user_id -> users.id)
 * 
 * Business Integrity Rules:
 *   - Unique constraint: A user can only submit one active application per job_posting (job_id, user_id).
 *   - Status cycle: 'submitted', 'in_review', 'interview_scheduled', 'shortlisted', 'offered', 'accepted', 'rejected', 'withdrawn'
 *   - Numeric limits: expected_salary >= 0, notice_period_days >= 0, feedback_score 1..5.
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'job_applications.json');

const ALLOWED_STATUSES = [
    'submitted',
    'in_review',
    'interview_scheduled',
    'shortlisted',
    'offered',
    'accepted',
    'rejected',
    'withdrawn'
];

class JobApplicationModel {
    constructor() {
        this.applications = [];
        this.currentId = 1;
        this._loadFallback();
    }

    _loadFallback() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.applications = parsed.map(p => this._formatRow(p));
                    this.currentId = Math.max(...this.applications.map(a => a.id || 0)) + 1;
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
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.applications, null, 2), 'utf8');
        } catch (e) {
            // Keep in-memory
        }
    }

    /**
     * Validate job application input
     * @param {Object} data
     * @param {boolean} [isPatch=false]
     * @returns {{ isValid: boolean, error: string|null }}
     */
    validate(data, isPatch = false) {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: 'Invalid application payload' };
        }

        // Job ID validation
        if (!isPatch || data.job_id !== undefined) {
            if (data.job_id === undefined || data.job_id === null || isNaN(Number(data.job_id)) || Number(data.job_id) <= 0) {
                return { isValid: false, error: 'A valid positive job_id is required' };
            }
        }

        // User ID validation
        if (!isPatch || data.user_id !== undefined) {
            if (data.user_id === undefined || data.user_id === null || isNaN(Number(data.user_id)) || Number(data.user_id) <= 0) {
                return { isValid: false, error: 'A valid positive user_id (applicant) is required' };
            }
        }

        // Status validation
        if (data.status !== undefined && data.status !== null) {
            if (!ALLOWED_STATUSES.includes(data.status)) {
                return { 
                    isValid: false, 
                    error: `Invalid status "${data.status}". Allowed statuses: ${ALLOWED_STATUSES.join(', ')}` 
                };
            }
        }

        // Expected Salary validation
        if (data.expected_salary !== undefined && data.expected_salary !== null && data.expected_salary !== '') {
            const salary = Number(data.expected_salary);
            if (isNaN(salary) || salary < 0) {
                return { isValid: false, error: 'expected_salary must be a non-negative number' };
            }
        }

        // Notice Period validation
        if (data.notice_period_days !== undefined && data.notice_period_days !== null && data.notice_period_days !== '') {
            const notice = Number(data.notice_period_days);
            if (isNaN(notice) || notice < 0 || !Number.isInteger(notice)) {
                return { isValid: false, error: 'notice_period_days must be a non-negative integer' };
            }
        }

        // Feedback Score validation (1..5)
        if (data.feedback_score !== undefined && data.feedback_score !== null && data.feedback_score !== '') {
            const score = Number(data.feedback_score);
            if (isNaN(score) || score < 1 || score > 5 || !Number.isInteger(score)) {
                return { isValid: false, error: 'feedback_score must be an integer between 1 and 5' };
            }
        }

        // Interview Date validation
        if (data.interview_date !== undefined && data.interview_date !== null && data.interview_date !== '') {
            const parsed = Date.parse(data.interview_date);
            if (isNaN(parsed)) {
                return { isValid: false, error: 'interview_date must be a valid ISO date/timestamp' };
            }
        }

        return { isValid: true, error: null };
    }

    /**
     * Retrieve all applications (supports query filters)
     * @param {Object} [filters={}]
     * @param {number|string} [filters.job_id]
     * @param {number|string} [filters.user_id]
     * @param {string} [filters.status]
     * @returns {Promise<Array<Object>>}
     */
    async getAll(filters = {}) {
        const conditions = [];
        const values = [];

        if (filters.job_id) {
            values.push(Number(filters.job_id));
            conditions.push(`job_id = $${values.length}`);
        }
        if (filters.user_id) {
            values.push(Number(filters.user_id));
            conditions.push(`user_id = $${values.length}`);
        }
        if (filters.status) {
            values.push(filters.status);
            conditions.push(`status = $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        try {
            const res = await db.query(`
                SELECT 
                    id, job_id, user_id, resume_url, cover_letter, portfolio_url,
                    expected_salary, currency, notice_period_days, status, review_notes,
                    interview_date, rejection_reason, feedback_score, applied_at, updated_at
                FROM job_applications
                ${whereClause}
                ORDER BY id DESC;
            `, values);
            return res.rows.map(r => this._formatRow(r));
        } catch (e) {
            // Local fallback
            let results = [...this.applications];
            if (filters.job_id) {
                const jid = Number(filters.job_id);
                results = results.filter(a => a.job_id === jid);
            }
            if (filters.user_id) {
                const uid = Number(filters.user_id);
                results = results.filter(a => a.user_id === uid);
            }
            if (filters.status) {
                results = results.filter(a => a.status === filters.status);
            }
            return results;
        }
    }

    /**
     * Retrieve application by ID
     * @param {number|string} id
     * @returns {Promise<Object|null>}
     */
    async getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(`
                SELECT 
                    id, job_id, user_id, resume_url, cover_letter, portfolio_url,
                    expected_salary, currency, notice_period_days, status, review_notes,
                    interview_date, rejection_reason, feedback_score, applied_at, updated_at
                FROM job_applications
                WHERE id = $1 LIMIT 1;
            `, [numericId]);

            return res.rows.length > 0 ? this._formatRow(res.rows[0]) : null;
        } catch (e) {
            const found = this.applications.find(a => a.id === numericId);
            return found ? { ...found } : null;
        }
    }

    /**
     * Create / Submit new application
     * Enforces unique constraint (job_id, user_id)
     * @param {Object} data
     * @returns {Promise<{ success: boolean, application?: Object, error?: string, duplicate?: boolean }>}
     */
    async create(data) {
        const val = this.validate(data, false);
        if (!val.isValid) return { success: false, error: val.error };

        const job_id = Number(data.job_id);
        const user_id = Number(data.user_id);
        const resume_url = data.resume_url || null;
        const cover_letter = data.cover_letter || null;
        const portfolio_url = data.portfolio_url || null;
        const expected_salary = (data.expected_salary !== undefined && data.expected_salary !== null && data.expected_salary !== '')
            ? Number(data.expected_salary)
            : null;
        const currency = data.currency || 'TRY';
        const notice_period_days = (data.notice_period_days !== undefined && data.notice_period_days !== null && data.notice_period_days !== '')
            ? Number(data.notice_period_days)
            : 0;
        const status = data.status || 'submitted';
        const review_notes = data.review_notes || null;
        const interview_date = data.interview_date ? new Date(data.interview_date).toISOString() : null;
        const rejection_reason = data.rejection_reason || null;
        const feedback_score = (data.feedback_score !== undefined && data.feedback_score !== null && data.feedback_score !== '')
            ? Number(data.feedback_score)
            : null;

        // 1. Check duplicate application in PostgreSQL
        try {
            const dupCheck = await db.query(
                'SELECT id FROM job_applications WHERE job_id = $1 AND user_id = $2 LIMIT 1;',
                [job_id, user_id]
            );
            if (dupCheck.rows.length > 0) {
                return {
                    success: false,
                    duplicate: true,
                    error: `User #${user_id} has already applied to Job #${job_id}. Duplicate applications are forbidden.`
                };
            }

            const res = await db.query(`
                INSERT INTO job_applications (
                    job_id, user_id, resume_url, cover_letter, portfolio_url,
                    expected_salary, currency, notice_period_days, status, review_notes,
                    interview_date, rejection_reason, feedback_score
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING 
                    id, job_id, user_id, resume_url, cover_letter, portfolio_url,
                    expected_salary, currency, notice_period_days, status, review_notes,
                    interview_date, rejection_reason, feedback_score, applied_at, updated_at;
            `, [
                job_id, user_id, resume_url, cover_letter, portfolio_url,
                expected_salary, currency, notice_period_days, status, review_notes,
                interview_date, rejection_reason, feedback_score
            ]);

            if (res.rows.length > 0) {
                const app = this._formatRow(res.rows[0]);
                this.applications.push(app);
                this._saveFallback();
                return { success: true, application: app };
            }
        } catch (e) {
            // PostgreSQL unique constraint error handler
            if (e.code === '23505') {
                return {
                    success: false,
                    duplicate: true,
                    error: `User #${user_id} has already applied to Job #${job_id}. Duplicate applications are forbidden.`
                };
            }
            // Otherwise fallback to local memory
        }

        // 2. Check duplicate in local fallback
        const existing = this.applications.find(a => a.job_id === job_id && a.user_id === user_id);
        if (existing) {
            return {
                success: false,
                duplicate: true,
                error: `User #${user_id} has already applied to Job #${job_id}. Duplicate applications are forbidden.`
            };
        }

        const now = new Date().toISOString();
        const newApp = {
            id: this.currentId++,
            job_id,
            user_id,
            resume_url,
            cover_letter,
            portfolio_url,
            expected_salary,
            currency,
            notice_period_days,
            status,
            review_notes,
            interview_date,
            rejection_reason,
            feedback_score,
            applied_at: now,
            updated_at: now
        };

        this.applications.push(newApp);
        this._saveFallback();
        return { success: true, application: newApp };
    }

    /**
     * Full update of an existing application (PUT)
     * @param {number|string} id
     * @param {Object} data
     * @returns {Promise<{ success: boolean, application?: Object, error?: string, notFound?: boolean }>}
     */
    async update(id, data) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid application ID' };

        const val = this.validate(data, false);
        if (!val.isValid) return { success: false, error: val.error };

        const existing = await this.getById(numericId);
        if (!existing) return { success: false, notFound: true, error: 'Application not found' };

        const job_id = Number(data.job_id);
        const user_id = Number(data.user_id);
        const resume_url = data.resume_url || null;
        const cover_letter = data.cover_letter || null;
        const portfolio_url = data.portfolio_url || null;
        const expected_salary = (data.expected_salary !== undefined && data.expected_salary !== null && data.expected_salary !== '')
            ? Number(data.expected_salary)
            : null;
        const currency = data.currency || 'TRY';
        const notice_period_days = (data.notice_period_days !== undefined && data.notice_period_days !== null && data.notice_period_days !== '')
            ? Number(data.notice_period_days)
            : 0;
        const status = data.status || 'submitted';
        const review_notes = data.review_notes || null;
        const interview_date = data.interview_date ? new Date(data.interview_date).toISOString() : null;
        const rejection_reason = data.rejection_reason || null;
        const feedback_score = (data.feedback_score !== undefined && data.feedback_score !== null && data.feedback_score !== '')
            ? Number(data.feedback_score)
            : null;

        try {
            const res = await db.query(`
                UPDATE job_applications
                SET job_id = $1,
                    user_id = $2,
                    resume_url = $3,
                    cover_letter = $4,
                    portfolio_url = $5,
                    expected_salary = $6,
                    currency = $7,
                    notice_period_days = $8,
                    status = $9,
                    review_notes = $10,
                    interview_date = $11,
                    rejection_reason = $12,
                    feedback_score = $13,
                    updated_at = NOW()
                WHERE id = $14
                RETURNING 
                    id, job_id, user_id, resume_url, cover_letter, portfolio_url,
                    expected_salary, currency, notice_period_days, status, review_notes,
                    interview_date, rejection_reason, feedback_score, applied_at, updated_at;
            `, [
                job_id, user_id, resume_url, cover_letter, portfolio_url,
                expected_salary, currency, notice_period_days, status, review_notes,
                interview_date, rejection_reason, feedback_score, numericId
            ]);

            if (res.rows.length > 0) {
                const updated = this._formatRow(res.rows[0]);
                const idx = this.applications.findIndex(a => a.id === numericId);
                if (idx !== -1) this.applications[idx] = updated;
                this._saveFallback();
                return { success: true, application: updated };
            }
            return { success: false, notFound: true, error: 'Application not found' };
        } catch (e) {
            // Fallback
        }

        const idx = this.applications.findIndex(a => a.id === numericId);
        if (idx === -1) return { success: false, notFound: true, error: 'Application not found' };

        const updated = {
            id: numericId,
            job_id,
            user_id,
            resume_url,
            cover_letter,
            portfolio_url,
            expected_salary,
            currency,
            notice_period_days,
            status,
            review_notes,
            interview_date,
            rejection_reason,
            feedback_score,
            applied_at: existing.applied_at,
            updated_at: new Date().toISOString()
        };

        this.applications[idx] = updated;
        this._saveFallback();
        return { success: true, application: updated };
    }

    /**
     * Partial update of an application (PATCH)
     * @param {number|string} id
     * @param {Object} data
     * @returns {Promise<{ success: boolean, application?: Object, error?: string, notFound?: boolean }>}
     */
    async patch(id, data) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid application ID' };

        const val = this.validate(data, true);
        if (!val.isValid) return { success: false, error: val.error };

        const existing = await this.getById(numericId);
        if (!existing) return { success: false, notFound: true, error: 'Application not found' };

        const fields = [];
        const values = [];

        const assignable = [
            'resume_url', 'cover_letter', 'portfolio_url', 'expected_salary',
            'currency', 'notice_period_days', 'status', 'review_notes',
            'interview_date', 'rejection_reason', 'feedback_score'
        ];

        for (const field of assignable) {
            if (data[field] !== undefined) {
                let val = data[field];
                if (field === 'expected_salary') {
                    val = val !== null && val !== '' ? Number(val) : null;
                } else if (field === 'notice_period_days' || field === 'feedback_score') {
                    val = val !== null && val !== '' ? Number(val) : null;
                } else if (field === 'interview_date') {
                    val = val ? new Date(val).toISOString() : null;
                }
                values.push(val);
                fields.push(`${field} = $${values.length}`);
            }
        }

        if (fields.length === 0) {
            return { success: true, application: existing };
        }

        values.push(numericId);
        const query = `
            UPDATE job_applications
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${values.length}
            RETURNING 
                id, job_id, user_id, resume_url, cover_letter, portfolio_url,
                expected_salary, currency, notice_period_days, status, review_notes,
                interview_date, rejection_reason, feedback_score, applied_at, updated_at;
        `;

        try {
            const res = await db.query(query, values);
            if (res.rows.length > 0) {
                const updated = this._formatRow(res.rows[0]);
                const idx = this.applications.findIndex(a => a.id === numericId);
                if (idx !== -1) this.applications[idx] = updated;
                this._saveFallback();
                return { success: true, application: updated };
            }
            return { success: false, notFound: true, error: 'Application not found' };
        } catch (e) {
            // Fallback
        }

        const idx = this.applications.findIndex(a => a.id === numericId);
        if (idx === -1) return { success: false, notFound: true, error: 'Application not found' };

        const updated = { ...existing };
        for (const field of assignable) {
            if (data[field] !== undefined) {
                let val = data[field];
                if (field === 'expected_salary') {
                    val = val !== null && val !== '' ? Number(val) : null;
                } else if (field === 'notice_period_days' || field === 'feedback_score') {
                    val = val !== null && val !== '' ? Number(val) : null;
                } else if (field === 'interview_date') {
                    val = val ? new Date(val).toISOString() : null;
                }
                updated[field] = val;
            }
        }
        updated.updated_at = new Date().toISOString();

        this.applications[idx] = updated;
        this._saveFallback();
        return { success: true, application: updated };
    }

    /**
     * Update application status (with optional review notes and rejection reason)
     * @param {number|string} id
     * @param {string} status
     * @param {Object} [details={}]
     * @param {string} [details.review_notes]
     * @param {string} [details.rejection_reason]
     * @param {number} [details.feedback_score]
     * @returns {Promise<{ success: boolean, application?: Object, error?: string, notFound?: boolean }>}
     */
    async updateStatus(id, status, details = {}) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid application ID' };

        if (!ALLOWED_STATUSES.includes(status)) {
            return { 
                success: false, 
                error: `Invalid status "${status}". Allowed: ${ALLOWED_STATUSES.join(', ')}` 
            };
        }

        const patchPayload = { status };
        if (details.review_notes !== undefined) patchPayload.review_notes = details.review_notes;
        if (details.rejection_reason !== undefined) patchPayload.rejection_reason = details.rejection_reason;
        if (details.feedback_score !== undefined) patchPayload.feedback_score = details.feedback_score;

        return this.patch(numericId, patchPayload);
    }

    /**
     * Schedule an interview for an applicant
     * Sets interview_date and updates status to 'interview_scheduled'
     * @param {number|string} id
     * @param {string|Date} interviewDate
     * @param {string} [reviewNotes=null]
     * @returns {Promise<{ success: boolean, application?: Object, error?: string, notFound?: boolean }>}
     */
    async scheduleInterview(id, interviewDate, reviewNotes = null) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid application ID' };

        if (!interviewDate || isNaN(Date.parse(interviewDate))) {
            return { success: false, error: 'Valid interviewDate (ISO string or timestamp) is required' };
        }

        const patchPayload = {
            interview_date: new Date(interviewDate).toISOString(),
            status: 'interview_scheduled'
        };

        if (reviewNotes !== null && reviewNotes !== undefined) {
            patchPayload.review_notes = reviewNotes;
        }

        return this.patch(numericId, patchPayload);
    }

    /**
     * Delete application
     * @param {number|string} id
     * @returns {Promise<{ success: boolean, application?: Object, notFound?: boolean, error?: string }>}
     */
    async delete(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return { success: false, error: 'Invalid application ID' };

        try {
            const res = await db.query('DELETE FROM job_applications WHERE id = $1 RETURNING *;', [numericId]);
            if (res.rows.length > 0) {
                const deleted = this._formatRow(res.rows[0]);
                const idx = this.applications.findIndex(a => a.id === numericId);
                if (idx !== -1) this.applications.splice(idx, 1);
                this._saveFallback();
                return { success: true, application: deleted };
            }
            return { success: false, notFound: true, error: 'Application not found' };
        } catch (e) {
            // Fallback
        }

        const idx = this.applications.findIndex(a => a.id === numericId);
        if (idx === -1) return { success: false, notFound: true, error: 'Application not found' };
        const [deleted] = this.applications.splice(idx, 1);
        this._saveFallback();
        return { success: true, application: deleted };
    }

    // =========================================================================
    // RELATIONSHIPS & ASSOCIATIONS
    // =========================================================================

    /**
     * Relationship: BelongsTo -> JobPosting (via job_id)
     * @param {number|string} applicationId
     * @returns {Promise<Object|null>}
     */
    async getJob(applicationId) {
        const numericId = parseInt(applicationId, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(`
                SELECT jp.*
                FROM job_postings jp
                JOIN job_applications ja ON jp.id = ja.job_id
                WHERE ja.id = $1 LIMIT 1;
            `, [numericId]);

            return res.rows.length > 0 ? res.rows[0] : null;
        } catch (e) {
            try {
                const app = this.applications.find(a => a.id === numericId);
                if (!app) return null;
                const JobPostingModel = require('./jobPostingModel');
                return JobPostingModel.jobs.find(j => j.id === app.job_id) || null;
            } catch (err) {
                return null;
            }
        }
    }

    /**
     * Relationship: BelongsTo -> User (Applicant, via user_id)
     * @param {number|string} applicationId
     * @returns {Promise<Object|null>}
     */
    async getApplicant(applicationId) {
        const numericId = parseInt(applicationId, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(`
                SELECT u.id, u.name, u.surname, u.email, u.phone, u.city
                FROM users u
                JOIN job_applications ja ON u.id = ja.user_id
                WHERE ja.id = $1 LIMIT 1;
            `, [numericId]);

            return res.rows.length > 0 ? res.rows[0] : null;
        } catch (e) {
            try {
                const app = this.applications.find(a => a.id === numericId);
                if (!app) return null;
                const UserModel = require('./userModel');
                return UserModel.users.find(u => u.id === app.user_id) || null;
            } catch (err) {
                return null;
            }
        }
    }

    /**
     * Relationship: Get all applications for a specific Job Posting
     * @param {number|string} jobId
     * @returns {Promise<Array<Object>>}
     */
    async getByJobId(jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) return [];

        try {
            const res = await db.query(`
                SELECT 
                    ja.id, ja.job_id, ja.user_id, ja.resume_url, ja.cover_letter, ja.portfolio_url,
                    ja.expected_salary, ja.currency, ja.notice_period_days, ja.status, ja.review_notes,
                    ja.interview_date, ja.rejection_reason, ja.feedback_score, ja.applied_at, ja.updated_at,
                    u.name AS applicant_name, u.surname AS applicant_surname, u.email AS applicant_email
                FROM job_applications ja
                JOIN users u ON ja.user_id = u.id
                WHERE ja.job_id = $1
                ORDER BY ja.applied_at DESC;
            `, [numericId]);

            return res.rows.map(r => ({
                ...this._formatRow(r),
                applicant: {
                    name: r.applicant_name,
                    surname: r.applicant_surname,
                    email: r.applicant_email
                }
            }));
        } catch (e) {
            return this.applications.filter(a => a.job_id === numericId);
        }
    }

    /**
     * Relationship: Get all applications made by a specific User
     * @param {number|string} userId
     * @returns {Promise<Array<Object>>}
     */
    async getByUserId(userId) {
        const numericId = parseInt(userId, 10);
        if (isNaN(numericId)) return [];

        try {
            const res = await db.query(`
                SELECT 
                    ja.id, ja.job_id, ja.user_id, ja.resume_url, ja.cover_letter, ja.portfolio_url,
                    ja.expected_salary, ja.currency, ja.notice_period_days, ja.status, ja.review_notes,
                    ja.interview_date, ja.rejection_reason, ja.feedback_score, ja.applied_at, ja.updated_at,
                    jp.title AS job_title, jp.company_name, jp.location AS job_location
                FROM job_applications ja
                JOIN job_postings jp ON ja.job_id = jp.id
                WHERE ja.user_id = $1
                ORDER BY ja.applied_at DESC;
            `, [numericId]);

            return res.rows.map(r => ({
                ...this._formatRow(r),
                job: {
                    title: r.job_title,
                    company_name: r.company_name,
                    location: r.job_location
                }
            }));
        } catch (e) {
            return this.applications.filter(a => a.user_id === numericId);
        }
    }

    _formatRow(r) {
        return {
            id: Number(r.id),
            job_id: Number(r.job_id),
            user_id: Number(r.user_id),
            resume_url: r.resume_url || null,
            cover_letter: r.cover_letter || null,
            portfolio_url: r.portfolio_url || null,
            expected_salary: (r.expected_salary !== null && r.expected_salary !== undefined) ? Number(r.expected_salary) : null,
            currency: r.currency || 'TRY',
            notice_period_days: (r.notice_period_days !== null && r.notice_period_days !== undefined) ? Number(r.notice_period_days) : 0,
            status: r.status || 'submitted',
            review_notes: r.review_notes || null,
            interview_date: r.interview_date ? new Date(r.interview_date).toISOString() : null,
            rejection_reason: r.rejection_reason || null,
            feedback_score: (r.feedback_score !== null && r.feedback_score !== undefined) ? Number(r.feedback_score) : null,
            applied_at: r.applied_at ? new Date(r.applied_at).toISOString() : new Date().toISOString(),
            updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        };
    }
}

const jobApplicationModelInstance = new JobApplicationModel();
module.exports = jobApplicationModelInstance;
module.exports.JobApplicationModel = JobApplicationModel;
