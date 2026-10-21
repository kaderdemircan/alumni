/**
 * User Model
 * 
 * Encapsulates data access and business logic for User/Alumni entity.
 * Uses PostgreSQL database connection pool via config/db.js, with
 * automatic fallback to local storage if database is unavailable.
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

class UserModel {
    constructor() {
        this.users = [];
        this.currentId = 1;
        this._loadFallback();
    }

    _loadFallback() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    this.users = parsed;
                    if (this.users.length > 0) {
                        this.currentId = Math.max(...this.users.map(u => u.id || 0)) + 1;
                    }
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
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.users, null, 2), 'utf8');
        } catch (e) {
            // Fallback gracefully
        }
    }

    /**
     * Validate user input fields
     * @param {Object} data - User input payload
     * @param {boolean} isPartial - If true, only provided fields are validated (PATCH)
     * @param {string} [operation=''] - Optional operation name ('PUT' or 'POST')
     * @returns {{ isValid: boolean, error: string|null }}
     */
    validate(data, isPartial = false, operation = '') {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: 'Invalid user payload' };
        }

        if (!isPartial) {
            if (!data.name || !data.surname || !data.age || !data.birthday) {
                const prefix = operation === 'PUT' ? 'Missing required fields for PUT: ' : 'Missing required fields: ';
                return { isValid: false, error: `${prefix}name, surname, age, birthday` };
            }
        }

        if (data.age !== undefined && (typeof Number(data.age) !== 'number' || isNaN(Number(data.age)) || Number(data.age) < 0)) {
            return { isValid: false, error: 'Age must be a valid non-negative number' };
        }

        return { isValid: true, error: null };
    }

    /**
     * Retrieve all users from PostgreSQL (or fallback)
     * @returns {Promise<Array<Object>>}
     */
    async getAll() {
        try {
            const res = await db.query(
                "SELECT id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city FROM users ORDER BY id ASC;"
            );
            return res.rows.map(r => ({
                id: Number(r.id),
                name: r.name,
                surname: r.surname,
                age: Number(r.age),
                birthday: r.birthday || '',
                email: r.email || '',
                city: r.city || ''
            }));
        } catch (error) {
            return [...this.users];
        }
    }

    async findAll() {
        return this.getAll();
    }

    /**
     * Find a single user by ID from PostgreSQL
     * @param {number|string} id
     * @returns {Promise<Object|null>}
     */
    async getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(
                "SELECT id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city FROM users WHERE id = $1 LIMIT 1;",
                [numericId]
            );
            if (res.rows.length > 0) {
                const r = res.rows[0];
                return {
                    id: Number(r.id),
                    name: r.name,
                    surname: r.surname,
                    age: Number(r.age),
                    birthday: r.birthday || '',
                    email: r.email || '',
                    city: r.city || ''
                };
            }
            return null;
        } catch (error) {
            const user = this.users.find(u => u.id === numericId);
            return user ? { ...user } : null;
        }
    }

    async findById(id) {
        return this.getById(id);
    }

    /**
     * Create a new user in PostgreSQL
     * @param {Object} userData
     * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
     */
    async create(userData) {
        const validation = this.validate(userData, false, 'POST');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const email = userData.email || `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}${Date.now() % 10000}@example.com`;

        try {
            const res = await db.query(
                "INSERT INTO users (name, surname, age, birthday, email, city) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city;",
                [userData.name.trim(), userData.surname.trim(), Number(userData.age), userData.birthday, email, userData.city || '']
            );

            if (res.rows.length > 0) {
                const r = res.rows[0];
                const newUser = {
                    id: Number(r.id),
                    name: r.name,
                    surname: r.surname,
                    age: Number(r.age),
                    birthday: r.birthday,
                    email: r.email,
                    city: r.city
                };
                this.users.push(newUser);
                this._saveFallback();
                return { success: true, user: newUser };
            }
        } catch (error) {
            // In case of DB constraint or offline, fallback to local storage
            console.warn('DB create fallback:', error.message);
        }

        const newUser = {
            id: this.currentId++,
            name: userData.name.trim(),
            surname: userData.surname.trim(),
            age: Number(userData.age),
            birthday: userData.birthday
        };

        this.users.push(newUser);
        this._saveFallback();
        return { success: true, user: { ...newUser } };
    }

    /**
     * Replace an existing user (Full update - PUT)
     * @param {number|string} id
     * @param {Object} updateData
     * @returns {Promise<{ success: boolean, user?: Object, error?: string, notFound?: boolean }>}
     */
    async update(id, updateData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const validation = this.validate(updateData, false, 'PUT');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        try {
            const existing = await this.getById(numericId);
            if (!existing) {
                return { success: false, notFound: true, error: 'User not found' };
            }

            const email = updateData.email !== undefined ? updateData.email.trim() : existing.email;
            const city = updateData.city !== undefined ? updateData.city.trim() : existing.city;

            const res = await db.query(
                "UPDATE users SET name = $1, surname = $2, age = $3, birthday = $4, email = $5, city = $6, updated_at = NOW() WHERE id = $7 RETURNING id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city;",
                [updateData.name.trim(), updateData.surname.trim(), Number(updateData.age), updateData.birthday, email, city, numericId]
            );

            if (res.rows.length > 0) {
                const r = res.rows[0];
                const updatedUser = {
                    id: Number(r.id),
                    name: r.name,
                    surname: r.surname,
                    age: Number(r.age),
                    birthday: r.birthday,
                    email: r.email,
                    city: r.city
                };
                const idx = this.users.findIndex(u => u.id === numericId);
                if (idx !== -1) this.users[idx] = updatedUser;
                this._saveFallback();
                return { success: true, user: updatedUser };
            } else {
                return { success: false, notFound: true, error: 'User not found' };
            }
        } catch (error) {
            // Fallback
        }

        const index = this.users.findIndex(u => u.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const updatedUser = {
            id: numericId,
            name: updateData.name.trim(),
            surname: updateData.surname.trim(),
            age: Number(updateData.age),
            birthday: updateData.birthday,
            email: updateData.email !== undefined ? updateData.email.trim() : this.users[index].email,
            city: updateData.city !== undefined ? updateData.city.trim() : this.users[index].city
        };

        this.users[index] = updatedUser;
        this._saveFallback();
        return { success: true, user: { ...updatedUser } };
    }

    /**
     * Partially update an existing user (PATCH)
     * @param {number|string} id
     * @param {Object} updateData
     * @returns {Promise<{ success: boolean, user?: Object, error?: string, notFound?: boolean }>}
     */
    async patch(id, updateData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const validation = this.validate(updateData, true);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const existing = await this.getById(numericId);
        if (!existing) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const name = updateData.name !== undefined ? updateData.name.trim() : existing.name;
        const surname = updateData.surname !== undefined ? updateData.surname.trim() : existing.surname;
        const age = updateData.age !== undefined ? Number(updateData.age) : existing.age;
        const birthday = updateData.birthday !== undefined ? updateData.birthday : existing.birthday;
        const email = updateData.email !== undefined ? updateData.email.trim() : existing.email;
        const city = updateData.city !== undefined ? updateData.city.trim() : existing.city;

        try {
            const res = await db.query(
                "UPDATE users SET name = $1, surname = $2, age = $3, birthday = $4, email = $5, city = $6, updated_at = NOW() WHERE id = $7 RETURNING id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city;",
                [name, surname, age, birthday, email, city, numericId]
            );

            if (res.rows.length > 0) {
                const r = res.rows[0];
                const updatedUser = {
                    id: Number(r.id),
                    name: r.name,
                    surname: r.surname,
                    age: Number(r.age),
                    birthday: r.birthday,
                    email: r.email,
                    city: r.city
                };
                const idx = this.users.findIndex(u => u.id === numericId);
                if (idx !== -1) this.users[idx] = updatedUser;
                this._saveFallback();
                return { success: true, user: updatedUser };
            }
        } catch (error) {
            // Fallback
        }

        const index = this.users.findIndex(u => u.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const localUser = {
            ...this.users[index],
            name,
            surname,
            age,
            birthday,
            email,
            city
        };

        this.users[index] = localUser;
        this._saveFallback();
        return { success: true, user: { ...localUser } };
    }

    async partialUpdate(id, updateData) {
        return this.patch(id, updateData);
    }

    /**
     * Delete a user by ID
     * @param {number|string} id
     * @returns {Promise<{ success: boolean, user?: Object, error?: string, notFound?: boolean }>}
     */
    async delete(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        try {
            const res = await db.query("DELETE FROM users WHERE id = $1 RETURNING id, name, surname;", [numericId]);
            if (res.rows.length > 0) {
                const idx = this.users.findIndex(u => u.id === numericId);
                if (idx !== -1) this.users.splice(idx, 1);
                this._saveFallback();
                return { success: true, user: res.rows[0] };
            } else {
                return { success: false, notFound: true, error: 'User not found' };
            }
        } catch (error) {
            // Fallback
        }

        const index = this.users.findIndex(u => u.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const [deletedUser] = this.users.splice(index, 1);
        this._saveFallback();
        return { success: true, user: deletedUser };
    }

    async deleteById(id) {
        return this.delete(id);
    }

    /**
     * Clear all users
     */
    async clear() {
        try {
            await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
        } catch (e) {
            // Fallback
        }
        this.users = [];
        this.currentId = 1;
        this._saveFallback();
    }

    // =========================================================================
    // RELATIONSHIPS & ASSOCIATIONS (Defined using migration schema)
    // =========================================================================



    /**
     * Relationship: HasMany -> JobApplications (job_applications.user_id -> users.id)
     * Fetches all career job applications submitted by this alumnus
     * @param {number|string} userId
     * @returns {Promise<Array<Object>>}
     */
    async getJobApplications(userId) {
        const numericId = parseInt(userId, 10);
        if (isNaN(numericId)) return [];
        const JobApplicationModel = require('./jobApplicationModel');
        return JobApplicationModel.getByUserId(numericId);
    }

    /**
     * Relationship: BelongsToMany -> Skills (via alumni_skills)
     * Fetches all skills tagged to this alumnus profile
     * @param {number|string} userId
     * @returns {Promise<Array<Object>>}
     */
    async getSkills(userId) {
        const numericId = parseInt(userId, 10);
        if (isNaN(numericId)) return [];

        try {
            const res = await db.query(`
                SELECT s.id, s.name, s.category, als.proficiency_level
                FROM skills s
                JOIN alumni_skills als ON s.id = als.skill_id
                WHERE als.user_id = $1
                ORDER BY s.name ASC;
            `, [numericId]);

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

const userModelInstance = new UserModel();
module.exports = userModelInstance;
module.exports.UserModel = UserModel;
