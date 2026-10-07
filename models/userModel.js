/**
 * User Model (In-Memory)
 * 
 * Represents the User/Alumni entity and encapsulates all data-access
 * and business logic without requiring an external database connection.
 * 
 * Schema:
 * - id: number (auto-incremented)
 * - name: string (required)
 * - surname: string (required)
 * - age: number (required)
 * - birthday: string (required, YYYY-MM-DD format)
 */

class UserModel {
    constructor() {
        // In-memory data store for users
        this.users = [];
        this.currentId = 1;
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

        if (data.age !== undefined && (typeof data.age !== 'number' || isNaN(data.age) || data.age < 0)) {
            return { isValid: false, error: 'Age must be a valid non-negative number' };
        }

        return { isValid: true, error: null };
    }

    /**
     * Retrieve all users
     * @returns {Array<Object>} List of all user records
     */
    getAll() {
        return [...this.users];
    }

    /**
     * Retrieve all users (alias for getAll)
     * @returns {Array<Object>}
     */
    findAll() {
        return this.getAll();
    }

    /**
     * Find a single user by ID
     * @param {number|string} id - User ID
     * @returns {Object|null} The user object or null if not found
     */
    getById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;

        const user = this.users.find(u => u.id === numericId);
        return user ? { ...user } : null;
    }

    /**
     * Find a single user by ID (alias for getById)
     * @param {number|string} id
     * @returns {Object|null}
     */
    findById(id) {
        return this.getById(id);
    }

    /**
     * Create a new user
     * @param {Object} userData - Object containing name, surname, age, birthday
     * @returns {{ success: boolean, user?: Object, error?: string }}
     */
    create(userData) {
        const validation = this.validate(userData, false, 'POST');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const newUser = {
            id: this.currentId++,
            name: userData.name,
            surname: userData.surname,
            age: Number(userData.age),
            birthday: userData.birthday
        };

        this.users.push(newUser);
        return { success: true, user: { ...newUser } };
    }

    /**
     * Replace an existing user (Full update - PUT)
     * @param {number|string} id - User ID
     * @param {Object} updateData - Object containing all required user fields
     * @returns {{ success: boolean, user?: Object, error?: string, notFound?: boolean }}
     */
    update(id, updateData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const index = this.users.findIndex(u => u.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const validation = this.validate(updateData, false, 'PUT');
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const updatedUser = {
            id: numericId,
            name: updateData.name,
            surname: updateData.surname,
            age: Number(updateData.age),
            birthday: updateData.birthday
        };

        this.users[index] = updatedUser;
        return { success: true, user: { ...updatedUser } };
    }

    /**
     * Partially update an existing user (PATCH)
     * @param {number|string} id - User ID
     * @param {Object} updateData - Object containing fields to update
     * @returns {{ success: boolean, user?: Object, error?: string, notFound?: boolean }}
     */
    patch(id, updateData) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const index = this.users.findIndex(u => u.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const validation = this.validate(updateData, true);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const existingUser = this.users[index];
        const updatedUser = {
            ...existingUser,
            ...updateData,
            id: numericId // Ensure ID cannot be overridden
        };

        if (updateData.age !== undefined) {
            updatedUser.age = Number(updateData.age);
        }

        this.users[index] = updatedUser;
        return { success: true, user: { ...updatedUser } };
    }

    /**
     * Partially update an existing user (alias for patch)
     * @param {number|string} id
     * @param {Object} updateData
     * @returns {{ success: boolean, user?: Object, error?: string, notFound?: boolean }}
     */
    partialUpdate(id, updateData) {
        return this.patch(id, updateData);
    }

    /**
     * Delete a user by ID
     * @param {number|string} id - User ID
     * @returns {{ success: boolean, user?: Object, error?: string, notFound?: boolean }}
     */
    delete(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const index = this.users.findIndex(u => u.id === numericId);
        if (index === -1) {
            return { success: false, notFound: true, error: 'User not found' };
        }

        const [deletedUser] = this.users.splice(index, 1);
        return { success: true, user: deletedUser };
    }

    /**
     * Delete a user by ID (alias for delete)
     * @param {number|string} id
     * @returns {{ success: boolean, user?: Object, error?: string, notFound?: boolean }}
     */
    deleteById(id) {
        return this.delete(id);
    }

    /**
     * Reset/clear all users (useful for testing and reinitialization)
     */
    clear() {
        this.users = [];
        this.currentId = 1;
    }
}

// Export singleton instance as default, and the class as named export
const userModelInstance = new UserModel();
module.exports = userModelInstance;
module.exports.UserModel = UserModel;
