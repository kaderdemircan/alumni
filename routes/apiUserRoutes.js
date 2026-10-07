/**
 * API User Routes
 * 
 * Maps HTTP requests on /api/users to ApiUserController methods.
 */

const ApiUserController = require('../controllers/apiUserController');

/**
 * Router handler for /api/users endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleApiUserRoutes(req, res) {
    // GET /api/users - List all users (JSON)
    if (req.url === '/api/users' && req.method === 'GET') {
        ApiUserController.getAll(req, res);
        return true;
    }

    // GET /api/users/:id - Get single user by ID (JSON)
    if (req.url.startsWith('/api/users/') && req.method === 'GET') {
        const id = req.url.split('/')[3];
        ApiUserController.getById(req, res, id);
        return true;
    }

    // POST /api/users - Create new user (JSON)
    if (req.url === '/api/users' && req.method === 'POST') {
        ApiUserController.create(req, res);
        return true;
    }

    // PUT /api/users/:id - Full update of user (JSON)
    if (req.url.startsWith('/api/users/') && req.method === 'PUT') {
        const id = req.url.split('/')[3];
        ApiUserController.update(req, res, id);
        return true;
    }

    // PATCH /api/users/:id - Partial update of user (JSON)
    if (req.url.startsWith('/api/users/') && req.method === 'PATCH') {
        const id = req.url.split('/')[3];
        ApiUserController.patch(req, res, id);
        return true;
    }

    // DELETE /api/users/:id - Delete user (JSON)
    if (req.url.startsWith('/api/users/') && req.method === 'DELETE') {
        const id = req.url.split('/')[3];
        ApiUserController.delete(req, res, id);
        return true;
    }

    return false;
}

module.exports = handleApiUserRoutes;
