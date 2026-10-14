/**
 * Announcement Model (In-Memory)
 * 
 * Represents the Announcement entity and encapsulates all data-access
 * and business logic without requiring an external database connection yet.
 * 
 * Schema:
 * - id: number (auto-incremented)
 * - title: string (required)
 * - content: string (required)
 * - author: string (required)
 * - category: string (required - e.g. Genel, Etkinlik, Kariyer, Akademik)
 * - date: string (required - YYYY-MM-DD format)
 * - priority: string (optional - Normal, Önemli, Acil; default: Normal)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');

class AnnouncementModel {
    constructor() {
        // In-memory data store for announcements with file persistence
        this.announcements = [
            {
                id: 1,
                title: '2026 Mezunlar Buluşması Tarihi Belirlendi',
                content: 'Geleneksel yıllık mezunlar buluşmamız bu yıl 25 Ekim tarihinde ana kampüste gerçekleştirilecektir. Tüm mezunlarımız davetlidir.',
                author: 'Rektörlük Mezun Ofisi',
                category: 'Etkinlik',
                date: '2026-10-10',
                priority: 'Önemli'
            },
            {
                id: 2,
                title: 'Kariyer ve Mentorluk Ağı Başvuruları Başladı',
                content: 'Genç mezunlarımıza kariyer yolculuklarında rehberlik etmek isteyen deneyimli mezunlarımız için mentorluk kayıtları açılmıştır.',
                author: 'Kariyer Merkezi',
                category: 'Kariyer',
                date: '2026-10-12',
                priority: 'Normal'
            }
        ];
        this.currentId = 3;
        this._load();
    }

    _load() {
        try {
            if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
                const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.announcements = parsed;
                    this.currentId = Math.max(...this.announcements.map(a => a.id || 0)) + 1;
                }
            } else {
                this._save();
            }
        } catch (e) {
            // Keep in-memory
        }
    }

    _save() {
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
     * @param {Object} data - Announcement input payload
     * @param {boolean} isPartial - If true, only provided fields are validated (PATCH)
     * @param {string} [operation=''] - Optional operation name ('PUT' or 'POST')
     * @returns {{ isValid: boolean, error: string|null }}
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
     * Retrieve all announcements
     * @returns {Array<Object>} List of all announcement records
     */
    getAll() {
        return [...this.announcements];
    }

    /**
     * Retrieve all announcements (alias for getAll)
     * @returns {Array<Object>}
     */
    findAll() {
        return this.getAll();
    }

    /**
     * Find a single announcement by ID
     * @param {number|string} id - Announcement ID
     * @returns {Object|null} The announcement object or null if not found
     */
    getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        const announcement = this.announcements.find(a => a.id === numericId);
        return announcement ? { ...announcement } : null;
    }

    /**
     * Find a single announcement by ID (alias for getById)
     * @param {number|string} id
     * @returns {Object|null}
     */
    findById(id) {
        return this.getById(id);
    }

    /**
     * Create a new announcement
     * @param {Object} data - Object containing title, content, author, category, date, priority
     * @returns {{ success: boolean, announcement?: Object, error?: string }}
     */
    create(data) {
        const validation = this.validate(data, false, 'POST');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const today = new Date().toISOString().split('T')[0];

        const newAnnouncement = {
            id: this.currentId++,
            title: data.title.trim(),
            content: data.content.trim(),
            author: data.author.trim(),
            category: data.category ? data.category.trim() : 'Genel',
            date: data.date && data.date.trim() !== '' ? data.date.trim() : today,
            priority: data.priority ? data.priority.trim() : 'Normal'
        };

        this.announcements.push(newAnnouncement);
        this._save();
        return { success: true, announcement: { ...newAnnouncement } };
    }

    /**
     * Full update of an announcement (PUT)
     * @param {number|string} id - Announcement ID
     * @param {Object} updateData - Complete announcement data
     * @returns {{ success: boolean, announcement?: Object, error?: string, notFound?: boolean }}
     */
    update(id, updateData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid announcement ID' };
        }

        const index = this.announcements.findIndex(a => a.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const validation = this.validate(updateData, false, 'PUT');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const updatedAnnouncement = {
            id: numericId,
            title: updateData.title.trim(),
            content: updateData.content.trim(),
            author: updateData.author.trim(),
            category: updateData.category ? updateData.category.trim() : 'Genel',
            date: updateData.date ? updateData.date.trim() : this.announcements[index].date,
            priority: updateData.priority ? updateData.priority.trim() : 'Normal'
        };

        this.announcements[index] = updatedAnnouncement;
        this._save();
        return { success: true, announcement: { ...updatedAnnouncement } };
    }

    /**
     * Partial update of an announcement (PATCH)
     * @param {number|string} id - Announcement ID
     * @param {Object} partialData - Partial fields to update
     * @returns {{ success: boolean, announcement?: Object, error?: string, notFound?: boolean }}
     */
    patch(id, partialData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid announcement ID' };
        }

        const index = this.announcements.findIndex(a => a.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const validation = this.validate(partialData, true, 'PATCH');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const current = this.announcements[index];
        const patchedAnnouncement = {
            ...current,
            title: partialData.title !== undefined ? partialData.title.trim() : current.title,
            content: partialData.content !== undefined ? partialData.content.trim() : current.content,
            author: partialData.author !== undefined ? partialData.author.trim() : current.author,
            category: partialData.category !== undefined ? partialData.category.trim() : current.category,
            date: partialData.date !== undefined ? partialData.date.trim() : current.date,
            priority: partialData.priority !== undefined ? partialData.priority.trim() : current.priority
        };

        this.announcements[index] = patchedAnnouncement;
        this._save();
        return { success: true, announcement: { ...patchedAnnouncement } };
    }

    /**
     * Delete an announcement by ID
     * @param {number|string} id - Announcement ID
     * @returns {{ success: boolean, announcement?: Object, error?: string, notFound?: boolean }}
     */
    delete(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid announcement ID' };
        }

        const index = this.announcements.findIndex(a => a.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'Announcement not found' };
        }

        const [deleted] = this.announcements.splice(index, 1);
        this._save();
        return { success: true, announcement: deleted };
    }

    /**
     * Reset/clear all announcements
     */
    clear() {
        this.announcements = [];
        this.currentId = 1;
        this._save();
    }
}

// Export singleton instance as default, and the class as named export
const announcementModelInstance = new AnnouncementModel();
module.exports = announcementModelInstance;
module.exports.AnnouncementModel = AnnouncementModel;
