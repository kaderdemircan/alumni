/**
 * Announcement Model
 * 
 * Encapsulates data access and business logic for Announcement entity.
 * Uses PostgreSQL database connection pool via config/db.js, with
 * automatic fallback to local storage if database is unavailable.
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');

class AnnouncementModel {
    constructor() {
        this.announcements = [];
        this.currentId = 1;
        this._loadFallback();
    }

    _loadFallback() {
        try {
            if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
                const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.announcements = parsed;
                    this.currentId = Math.max(...this.announcements.map(a => a.id || 0)) + 1;
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
            fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(this.announcements, null, 2), 'utf8');
        } catch (e) {
            // Keep in-memory
        }
    }

    /**
     * Validate announcement input fields
     */
    validate(data, isPartial = false, operation = '') {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: 'Invalid announcement payload' };
        }

        if (!isPartial) {
            if (!data.title || !data.content || !data.author || !data.category) {
                const prefix = operation === 'PUT' ? 'Missing required fields for PUT: ' : 'Missing required fields: ';
                return { isValid: false, error: `${prefix}title, content, author, category` };
            }
        }

        if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim() === '')) {
            return { isValid: false, error: 'Title must be a non-empty string' };
        }

        if (data.content !== undefined && (typeof data.content !== 'string' || data.content.trim() === '')) {
            return { isValid: false, error: 'Content must be a non-empty string' };
        }

        if (data.author !== undefined && (typeof data.author !== 'string' || data.author.trim() === '')) {
            return { isValid: false, error: 'Author must be a non-empty string' };
        }

        return { isValid: true, error: null };
    }

    /**
     * Retrieve all announcements from PostgreSQL
     * @returns {Promise<Array<Object>>}
     */
    async getAll() {
        try {
            const res = await db.query(
                "SELECT id, title, content, author, category, priority, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM announcements ORDER BY id ASC;"
            );
            return res.rows.map(r => ({
                id: Number(r.id),
                title: r.title,
                content: r.content,
                author: r.author,
                category: r.category || 'Genel',
                priority: r.priority || 'Normal',
                date: r.date || ''
            }));
        } catch (error) {
            return [...this.announcements];
        }
    }

    async findAll() {
        return this.getAll();
    }

    /**
     * Find single announcement by ID from PostgreSQL
     * @param {number|string} id
     * @returns {Promise<Object|null>}
     */
    async getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(
                "SELECT id, title, content, author, category, priority, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM announcements WHERE id = $1 LIMIT 1;",
                [numericId]
            );
            if (res.rows.length > 0) {
                const r = res.rows[0];
                return {
                    id: Number(r.id),
                    title: r.title,
                    content: r.content,
                    author: r.author,
                    category: r.category || 'Genel',
                    priority: r.priority || 'Normal',
                    date: r.date || ''
                };
            }
            return null;
        } catch (error) {
            const announcement = this.announcements.find(a => a.id === numericId);
            return announcement ? { ...announcement } : null;
        }
    }

    async findById(id) {
        return this.getById(id);
    }

    /**
     * Create new announcement in PostgreSQL
     * @param {Object} data
     * @returns {Promise<{ success: boolean, announcement?: Object, error?: string }>}
     */
    async create(data) {
        const validation = this.validate(data, false, 'POST');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const today = new Date().toISOString().split('T')[0];
        const date = data.date && data.date.trim() !== '' ? data.date.trim() : today;
        const category = data.category ? data.category.trim() : 'Genel';
        const priority = data.priority ? data.priority.trim() : 'Normal';

        try {
            const res = await db.query(
                "INSERT INTO announcements (title, content, author, category, priority, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, content, author, category, priority, TO_CHAR(date, 'YYYY-MM-DD') AS date;",
                [data.title.trim(), data.content.trim(), data.author.trim(), category, priority, date]
            );

            if (res.rows.length > 0) {
                const r = res.rows[0];
                const newAnnouncement = {
                    id: Number(r.id),
                    title: r.title,
                    content: r.content,
                    author: r.author,
                    category: r.category,
                    priority: r.priority,
                    date: r.date
                };
                this.announcements.push(newAnnouncement);
                this._saveFallback();
                return { success: true, announcement: newAnnouncement };
            }
        } catch (error) {
            console.warn('DB create announcement fallback:', error.message);
        }

        const newAnnouncement = {
            id: this.currentId++,
            title: data.title.trim(),
            content: data.content.trim(),
            author: data.author.trim(),
            category,
            priority,
            date
        };

        this.announcements.push(newAnnouncement);
        this._saveFallback();
        return { success: true, announcement: { ...newAnnouncement } };
    }

    /**
     * Full update of an announcement in PostgreSQL (PUT)
     * @param {number|string} id
     * @param {Object} updateData
     * @returns {Promise<{ success: boolean, announcement?: Object, error?: string, notFound?: boolean }>}
     */
    async update(id, updateData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid announcement ID' };
        }

        const validation = this.validate(updateData, false, 'PUT');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const category = updateData.category ? updateData.category.trim() : 'Genel';
        const priority = updateData.priority ? updateData.priority.trim() : 'Normal';
        const date = updateData.date ? updateData.date.trim() : new Date().toISOString().split('T')[0];

        try {
            const res = await db.query(
                "UPDATE announcements SET title = $1, content = $2, author = $3, category = $4, priority = $5, date = $6, updated_at = NOW() WHERE id = $7 RETURNING id, title, content, author, category, priority, TO_CHAR(date, 'YYYY-MM-DD') AS date;",
                [updateData.title.trim(), updateData.content.trim(), updateData.author.trim(), category, priority, date, numericId]
            );

            if (res.rows.length > 0) {
                const r = res.rows[0];
                const updated = {
                    id: Number(r.id),
                    title: r.title,
                    content: r.content,
                    author: r.author,
                    category: r.category,
                    priority: r.priority,
                    date: r.date
                };
                const idx = this.announcements.findIndex(a => a.id === numericId);
                if (idx !== -1) this.announcements[idx] = updated;
                this._saveFallback();
                return { success: true, announcement: updated };
            } else {
                return { success: false, notFound: true, error: 'Announcement not found' };
            }
        } catch (error) {
            // Fallback
        }

        const index = this.announcements.findIndex(a => a.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const updatedAnnouncement = {
            id: numericId,
            title: updateData.title.trim(),
            content: updateData.content.trim(),
            author: updateData.author.trim(),
            category,
            priority,
            date
        };

        this.announcements[index] = updatedAnnouncement;
        this._saveFallback();
        return { success: true, announcement: { ...updatedAnnouncement } };
    }

    /**
     * Partial update of an announcement (PATCH)
     * @param {number|string} id
     * @param {Object} partialData
     * @returns {Promise<{ success: boolean, announcement?: Object, error?: string, notFound?: boolean }>}
     */
    async patch(id, partialData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid announcement ID' };
        }

        const validation = this.validate(partialData, true, 'PATCH');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const existing = await this.getById(numericId);
        if (!existing) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const title = partialData.title !== undefined ? partialData.title.trim() : existing.title;
        const content = partialData.content !== undefined ? partialData.content.trim() : existing.content;
        const author = partialData.author !== undefined ? partialData.author.trim() : existing.author;
        const category = partialData.category !== undefined ? partialData.category.trim() : existing.category;
        const priority = partialData.priority !== undefined ? partialData.priority.trim() : existing.priority;
        const date = partialData.date !== undefined ? partialData.date.trim() : existing.date;

        try {
            const res = await db.query(
                "UPDATE announcements SET title = $1, content = $2, author = $3, category = $4, priority = $5, date = $6, updated_at = NOW() WHERE id = $7 RETURNING id, title, content, author, category, priority, TO_CHAR(date, 'YYYY-MM-DD') AS date;",
                [title, content, author, category, priority, date, numericId]
            );

            if (res.rows.length > 0) {
                const r = res.rows[0];
                const updated = {
                    id: Number(r.id),
                    title: r.title,
                    content: r.content,
                    author: r.author,
                    category: r.category,
                    priority: r.priority,
                    date: r.date
                };
                const idx = this.announcements.findIndex(a => a.id === numericId);
                if (idx !== -1) this.announcements[idx] = updated;
                this._saveFallback();
                return { success: true, announcement: updated };
            }
        } catch (error) {
            // Fallback
        }

        const index = this.announcements.findIndex(a => a.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const local = {
            ...this.announcements[index],
            title,
            content,
            author,
            category,
            priority,
            date
        };

        this.announcements[index] = local;
        this._saveFallback();
        return { success: true, announcement: { ...local } };
    }

    /**
     * Delete an announcement by ID
     * @param {number|string} id
     * @returns {Promise<{ success: boolean, announcement?: Object, error?: string, notFound?: boolean }>}
     */
    async delete(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid announcement ID' };
        }

        try {
            const res = await db.query("DELETE FROM announcements WHERE id = $1 RETURNING id, title;", [numericId]);
            if (res.rows.length > 0) {
                const idx = this.announcements.findIndex(a => a.id === numericId);
                if (idx !== -1) this.announcements.splice(idx, 1);
                this._saveFallback();
                return { success: true, announcement: res.rows[0] };
            } else {
                return { success: false, notFound: true, error: 'Announcement not found' };
            }
        } catch (error) {
            // Fallback
        }

        const index = this.announcements.findIndex(a => a.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const [deleted] = this.announcements.splice(index, 1);
        this._saveFallback();
        return { success: true, announcement: deleted };
    }

    async clear() {
        try {
            await db.query("TRUNCATE TABLE announcements RESTART IDENTITY CASCADE;");
        } catch (e) {
            // Fallback
        }
        this.announcements = [];
        this.currentId = 1;
        this._saveFallback();
    }
}

const announcementModelInstance = new AnnouncementModel();
module.exports = announcementModelInstance;
module.exports.AnnouncementModel = AnnouncementModel;
