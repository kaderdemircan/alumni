/**
 * User Model
 * 
 * Encapsulates data access and business logic for User/Alumni entity.
 * Uses PostgreSQL database connection pool via config/db.js, with
 * automatic fallback to local storage if database is unavailable.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');
const registrationRoles = ['student', 'alumni', 'staff'];

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
    async getAll({ includePending = true } = {}) {
        try {
            const res = await db.query(
                "SELECT id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city, role, status, phone, bio FROM users WHERE ($1 OR role IS DISTINCT FROM 'alumni' OR alumni_verification IS DISTINCT FROM 'pending') ORDER BY id ASC;",
                [includePending]
            );
            return res.rows.map(r => ({
                id: Number(r.id),
                name: r.name,
                surname: r.surname,
                age: Number(r.age),
                birthday: r.birthday || '',
                email: r.email || '',
                city: r.city || '',
                role: r.role, status: r.status, phone: r.phone, bio: r.bio
            }));
        } catch (error) {
            return this.users.filter(u => includePending || u.role !== 'alumni' || u.alumni_verification !== 'pending')
                .map(({ password_hash, graduation_details, admin_language, admin_theme, ...u }) => u);
        }
    }

    /**
     * Secure password hashing using Node.js built-in scrypt
     * @param {string} password
     * @returns {string} salt:derivedKey
     */
    hashPassword(password) {
        if (!password || typeof password !== 'string') return '';
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }

    /**
     * Verify a password against stored salt:hash
     * @param {string} password
     * @param {string} storedHash
     * @returns {boolean}
     */
    verifyPassword(password, storedHash) {
        if (!password || !storedHash || !storedHash.includes(':')) return false;
        try {
            const [salt, key] = storedHash.split(':');
            const hash = crypto.scryptSync(password, salt, 64).toString('hex');
            return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Find user by email address
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    async findByEmail(email) {
        if (!email || typeof email !== 'string') return null;
        const normalized = email.trim().toLowerCase();

        try {
            const res = await db.query(
                "SELECT id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city, role, status, password_hash, alumni_verification, admin_language, admin_theme FROM users WHERE LOWER(email) = $1 LIMIT 1;",
                [normalized]
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
                    city: r.city || '',
                    role: r.role || 'alumni',
                    status: r.status || 'active',
                    password_hash: r.password_hash || '',
                    alumni_verification: r.alumni_verification, admin_language: r.admin_language, admin_theme: r.admin_theme
                };
            }
            return null;
        } catch (e) {
            if (db.isConnected) throw e;
            const user = this.users.find(u => (u.email || '').toLowerCase() === normalized);
            return user ? { ...user } : null;
        }
    }

    /**
     * Register a new user with email, password, profile, and role
     * @param {Object} userData
     * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
     */
    async register(userData, { admin = false } = {}) {
        if (!userData || typeof userData !== 'object' ||
            ['name', 'surname', 'email', 'password', 'confirmPassword', 'birthday', 'city', 'role', 'bio', 'phone', 'graduation_details']
                .some(key => userData[key] != null && typeof userData[key] !== 'string')) {
            return { success: false, error: 'Invalid registration payload' };
        }

        const name = (userData.name || '').trim();
        const surname = (userData.surname || '').trim();
        const email = (userData.email || '').trim().toLowerCase();
        const password = userData.password ? String(userData.password) : '';
        const confirmPassword = userData.confirmPassword !== undefined ? String(userData.confirmPassword) : null;
        let birthday = (userData.birthday || '').trim();
        let age = userData.age !== undefined && userData.age !== '' ? Number(userData.age) : null;
        const city = (userData.city || '').trim();
        const role = (userData.role || 'alumni').trim().toLowerCase();
        if (!registrationRoles.includes(role) && !(admin && role === 'admin')) {
            return { success: false, error: 'Choose a valid account type' };
        }
        const bio = (userData.bio || '').trim();
        const phone = (userData.phone || '').trim();

        // 1. Mandatory field checks
        if (!name || name.length < 1) {
            return { success: false, error: 'First name is required' };
        }
        if (!surname || surname.length < 1) {
            return { success: false, error: 'Surname is required' };
        }
        if (!email) {
            return { success: false, error: 'Email address is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: 'Please provide a valid email address' };
        }
        if (!password) {
            return { success: false, error: 'Password is required' };
        }
        if (password.length > 256) return { success: false, error: 'Password must be at most 256 characters long' };
        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters long' };
        }
        if (confirmPassword !== null && confirmPassword !== password) {
            return { success: false, error: 'Passwords do not match' };
        }

        // 2. Birthday / Age validation & derivation
        if (birthday) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
                return { success: false, error: 'Birthday must follow YYYY-MM-DD format' };
            }
            const bDate = new Date(birthday);
            if (isNaN(bDate.getTime()) || bDate.toISOString().slice(0, 10) !== birthday) {
                return { success: false, error: 'Birthday must be a valid calendar date' };
            }
            if (bDate > new Date()) {
                return { success: false, error: 'Birthday cannot be in the future' };
            }

            if (age === null || isNaN(age)) {
                const today = new Date();
                let calcAge = today.getFullYear() - bDate.getFullYear();
                const m = today.getMonth() - bDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
                    calcAge--;
                }
                age = Math.max(0, calcAge);
            }
        } else {
            if (age === null || isNaN(age) || age < 0) {
                return { success: false, error: 'Birthday or a valid age is required' };
            }
            const birthYear = new Date().getFullYear() - age;
            birthday = `${birthYear}-01-01`;
        }

        if (!Number.isInteger(age) || age < 0 || age > 120) {
            return { success: false, error: 'Age must be between 0 and 120' };
        }

        // 3. Duplicate email check
        const existing = await this.findByEmail(email);
        if (existing) {
            return { success: false, error: 'An account with this email address already exists' };
        }

        // 4. Role and Status determination
        const graduationDetails = (userData.graduation_details || '').trim();
        const verification = role === 'alumni' && !admin ? 'pending' : null;
        if (verification && (!graduationDetails || graduationDetails.length > 500)) {
            return { success: false, error: 'Enter your university, degree program, and graduation year (up to 500 characters).' };
        }
        const status = admin && userData.status === 'inactive' ? 'inactive' : 'active';
        const password_hash = this.hashPassword(password);

        // 5. Database persistence
        try {
            const res = await db.query(
                `INSERT INTO users (name, surname, age, birthday, email, password_hash, city, phone, bio, status, role, graduation_details, alumni_verification)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 RETURNING id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city, status;`,
                [name, surname, age, birthday, email, password_hash, city, phone, bio, status, role, graduationDetails || null, verification]
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
                    city: r.city || '',
                    role,
                    status: r.status, alumni_verification: verification
                };
                return { success: true, user: newUser };
            }
        } catch (e) {
            if (e.code === '23505') return { success: false, error: 'An account with this email address already exists' };
            if (db.isConnected) throw e;
        }

        // Another registration may have completed while the database connection failed.
        if (this.users.some(u => u.email?.toLowerCase() === email)) {
            return { success: false, error: 'An account with this email address already exists' };
        }
        const newUser = {
            id: this.currentId++,
            name,
            surname,
            age,
            birthday,
            email,
            city,
            role,
            status, phone, bio, graduation_details: graduationDetails || null, alumni_verification: verification,
            created_at: new Date().toISOString()
        };

        this.users.push({ ...newUser, password_hash });
        this._saveFallback();

        const { graduation_details, ...profile } = newUser;
        return { success: true, user: profile };
    }

    async pendingAlumni() {
        try {
            const result = await db.query(`SELECT id, name, surname, email, graduation_details FROM users
                WHERE role = 'alumni' AND alumni_verification = 'pending' ORDER BY id`);
            return result.rows;
        } catch (error) {
            if (db.isConnected) throw error;
            return this.users.filter(user => user.role === 'alumni' && user.alumni_verification === 'pending');
        }
    }

    async reviewAlumnus(id, action) {
        const approve = action === 'approve';
        const where = "WHERE id = $1 AND role = 'alumni' AND alumni_verification = 'pending'";
        try {
            const statement = approve
                ? "UPDATE users SET alumni_verification = 'approved', updated_at = NOW()"
                : 'DELETE FROM users';
            const result = await db.query(`${statement} ${where}`, [id]);
            return result.rowCount === 1;
        } catch (error) {
            if (db.isConnected) throw error;
            const index = this.users.findIndex(user =>
                user.id === Number(id) && user.role === 'alumni' && user.alumni_verification === 'pending');
            if (index === -1) return false;
            if (approve) this.users[index].alumni_verification = 'approved';
            else this.users.splice(index, 1);
            this._saveFallback();
            return true;
        }
    }

    async updateAccount(id, changes) {
        const fields = ['name', 'surname', 'email', 'age', 'birthday', 'city', 'phone', 'bio', 'role', 'status', 'password_hash', 'admin_language', 'admin_theme'];
        const entries = fields.filter(key => changes[key] !== undefined).map(key => [key, changes[key]]);
        if (!entries.length) return false;
        try {
            const set = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
            const result = await db.query(`UPDATE users SET ${set}, updated_at = NOW() WHERE id = $1`, [id, ...entries.map(([, value]) => value)]);
            return result.rowCount === 1;
        } catch (error) {
            if (db.isConnected) throw error;
            const user = this.users.find(candidate => candidate.id === Number(id));
            if (!user) return false;
            Object.assign(user, Object.fromEntries(entries));
            this._saveFallback();
            return true;
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
    async getById(id, { includePending = true } = {}) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        try {
            const res = await db.query(
                "SELECT id, name, surname, age, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday, email, city, role, status, phone, bio, alumni_verification FROM users WHERE id = $1 AND ($2 OR role IS DISTINCT FROM 'alumni' OR alumni_verification IS DISTINCT FROM 'pending') LIMIT 1;",
                [numericId, includePending]
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
                    city: r.city || '',
                    role: r.role, status: r.status, phone: r.phone, bio: r.bio, alumni_verification: r.alumni_verification
                };
            }
            return null;
        } catch (error) {
            const user = this.users.find(u => u.id === numericId);
            if (!user || (!includePending && user.role === 'alumni' && user.alumni_verification === 'pending')) return null;
            const { password_hash, graduation_details, admin_language, admin_theme, ...profile } = user;
            return profile;
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
                if (idx !== -1) this.users[idx] = { ...this.users[idx], ...updatedUser };
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
            ...this.users[index],
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
        const { password_hash, ...profile } = updatedUser;
        return { success: true, user: profile };
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
                if (idx !== -1) this.users[idx] = { ...this.users[idx], ...updatedUser };
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
        const { password_hash, ...profile } = localUser;
        return { success: true, user: profile };
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
        const { password_hash, ...profile } = deletedUser;
        return { success: true, user: profile };
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
