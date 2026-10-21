/**
 * Skill Model
 * 
 * Encapsulates data access and business logic for the Skill entity.
 * Schema based on migrations/001_create_alumni_schema.sql (skills table).
 * Includes relations with users (alumni_skills) and job postings (job_skills).
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'skills.json');

class SkillModel {
    constructor() {
        this.skills = [];
        this.currentId = 1;
        this._loadFallback();
    }

    _loadFallback() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.skills = parsed;
                    this.currentId = Math.max(...this.skills.map(s => s.id || 0)) + 1;
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
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.skills, null, 2), 'utf8');
        } catch (e) {
            // Keep in-memory
        }
    }

    /**
     * Validate skill data
     * @param {Object} data
     * @returns {{ isValid: boolean, error: string|null }}
     */
    validate(data) {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: 'Invalid skill payload' };
        }
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            return { isValid: false, error: 'Skill name is required' };
        }
        return { isValid: true, error: null };
    }

    /**
     * Retrieve all skills
     * @returns {Promise<Array<Object>>}
     */
    async getAll() {
        try {
            const res = await db.query('SELECT id, name, category FROM skills ORDER BY name ASC;');
            return res.rows.map(r => ({
                id: Number(r.id),
                name: r.name,
                category: r.category || ''
            }));
        } catch (e) {
            return [...this.skills];
        }
    }

    /**
     * Retrieve single skill by ID
     * @param {number|string} id
     * @returns {Promise<Object|null>}
     */
    async getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query('SELECT id, name, category FROM skills WHERE id = $1 LIMIT 1;', [numericId]);
            if (res.rows.length > 0) {
                const r = res.rows[0];
                return {
                    id: Number(r.id),
                    name: r.name,
                    category: r.category || ''
                };
            }
            return null;
        } catch (e) {
            const found = this.skills.find(s => s.id === numericId);
            return found ? { ...found } : null;
        }
    }

    /**
     * Create new skill
     * @param {Object} data
     * @returns {Promise<{ success: boolean, skill?: Object, error?: string }>}
     */
    async create(data) {
        const val = this.validate(data);
        if (!val.isValid) return { success: false, error: val.error };

        const name = data.name.trim();
        const category = data.category ? data.category.trim() : 'Genel';

        try {
            const res = await db.query(
                'INSERT INTO skills (name, category) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category RETURNING id, name, category;',
                [name, category]
            );
            if (res.rows.length > 0) {
                const r = res.rows[0];
                const skill = { id: Number(r.id), name: r.name, category: r.category };
                this.skills.push(skill);
                this._saveFallback();
                return { success: true, skill };
            }
        } catch (e) {
            // Fallback
        }

        const existing = this.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existing) return { success: true, skill: existing };

        const newSkill = {
            id: this.currentId++,
            name,
            category
        };
        this.skills.push(newSkill);
        this._saveFallback();
        return { success: true, skill: newSkill };
    }

    // =========================================================================
    // RELATIONSHIP QUERIES (with Users and JobPostings)
    // =========================================================================

    /**
     * Relationship: Get all skills tagged for a specific Job Posting (M:N via job_skills)
     * @param {number|string} jobId
     * @returns {Promise<Array<Object>>}
     */
    async getByJobId(jobId) {
        const numericJobId = parseInt(jobId, 10);
        if (isNaN(numericJobId)) return [];

        try {
            const res = await db.query(`
                SELECT s.id, s.name, s.category, js.is_mandatory
                FROM skills s
                JOIN job_skills js ON s.id = js.skill_id
                WHERE js.job_id = $1
                ORDER BY js.is_mandatory DESC, s.name ASC;
            `, [numericJobId]);

            return res.rows.map(r => ({
                id: Number(r.id),
                name: r.name,
                category: r.category || '',
                is_mandatory: Boolean(r.is_mandatory)
            }));
        } catch (e) {
            return [];
        }
    }

    /**
     * Relationship: Get all skills of an Alumnus (M:N via alumni_skills)
     * @param {number|string} userId
     * @returns {Promise<Array<Object>>}
     */
    async getByUserId(userId) {
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) return [];

        try {
            const res = await db.query(`
                SELECT s.id, s.name, s.category, als.proficiency_level
                FROM skills s
                JOIN alumni_skills als ON s.id = als.skill_id
                WHERE als.user_id = $1
                ORDER BY s.name ASC;
            `, [numericUserId]);

            return res.rows.map(r => ({
                id: Number(r.id),
                name: r.name,
                category: r.category || '',
                proficiency_level: r.proficiency_level || 'intermediate'
            }));
        } catch (e) {
            return [];
        }
    }
}

const skillModelInstance = new SkillModel();
module.exports = skillModelInstance;
module.exports.SkillModel = SkillModel;
