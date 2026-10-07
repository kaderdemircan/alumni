/**
 * ApiUserController
 * 
 * Handles RESTful API requests for User/Alumni resources.
 * Communicates directly with UserModel and returns structured JSON responses
 * with standard HTTP status codes.
 */

const UserModel = require('../models/userModel');

/**
 * Helper to parse JSON request body
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object>}
 */
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (!body || body.trim() === '') {
                return resolve({});
            }
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error('Invalid JSON payload'));
            }
        });
        req.on('error', err => reject(err));
    });
}

/**
 * Helper to send JSON responses
 * @param {import('http').ServerResponse} res
 * @param {number} statusCode
 * @param {Object} data
 */
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

class ApiUserController {
    /**
     * GET /api/users
     * Retrieve all users
     */
    async getAll(req, res) {
        try {
            const users = UserModel.getAll();
            sendJson(res, 200, users);
        } catch (error) {
            sendJson(res, 500, { error: 'Internal server error' });
        }
    }

    /**
     * GET /api/users/:id
     * Retrieve a single user by ID
     */
    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid user ID' });
        }

        const user = UserModel.getById(numericId);
        if (!user) {
            return sendJson(res, 404, { error: 'User not found' });
        }

        sendJson(res, 200, user);
    }

    /**
     * POST /api/users
     * Create a new user
     */
    async create(req, res) {
        try {
            const body = await parseJsonBody(req);
            const result = UserModel.create(body);

            if (!result.success) {
                return sendJson(res, 400, { error: result.error });
            }

            sendJson(res, 201, {
                message: 'User created successfully',
                user: result.user
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PUT /api/users/:id
     * Full update of an existing user
     */
    async update(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid user ID' });
        }

        try {
            const body = await parseJsonBody(req);
            const result = UserModel.update(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'User updated successfully',
                user: result.user
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PATCH /api/users/:id
     * Partial update of an existing user
     */
    async patch(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid user ID' });
        }

        try {
            const body = await parseJsonBody(req);
            const result = UserModel.patch(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'User updated successfully',
                user: result.user
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * DELETE /api/users/:id
     * Remove a user by ID
     */
    async delete(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid user ID' });
        }

        const result = UserModel.delete(numericId);
        if (!result.success) {
            const statusCode = result.notFound ? 404 : 400;
            return sendJson(res, statusCode, { error: result.error });
        }

        sendJson(res, 200, {
            message: 'User deleted successfully',
            user: result.user
        });
    }

    // Common aliases for flexibility
    getUsers(req, res) { return this.getAll(req, res); }
    getUserById(req, res, id) { return this.getById(req, res, id); }
    createUser(req, res) { return this.create(req, res); }
    updateUser(req, res, id) { return this.update(req, res, id); }
    patchUser(req, res, id) { return this.patch(req, res, id); }
    deleteUser(req, res, id) { return this.delete(req, res, id); }
}

const apiUserControllerInstance = new ApiUserController();
module.exports = apiUserControllerInstance;
module.exports.ApiUserController = ApiUserController;
