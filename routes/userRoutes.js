/**
 * Web User Routes
 * 
 * Maps HTTP requests on /users to UserController methods.
 */

const UserController = require('../controllers/userController');

/**
 * Router handler for /users Web UI endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleUserRoutes(req, res) {
    // GET /users - View Layer: Render alumni directory & registration form (HTML)
    if ((req.url === '/users' || req.url.startsWith('/users?')) && req.method === 'GET') {
        UserController.getAll(req, res);
        return true;
    }

    // GET /users/:id - View alumni member profile (HTML)
    if (req.url.startsWith('/users/') && req.method === 'GET') {
        const id = req.url.split('/')[2];
        UserController.getById(req, res, id);
        return true;
    }

    // POST /users - Create new alumni member via web form
    if (req.url === '/users' && req.method === 'POST') {
        UserController.create(req, res);
        return true;
    }

    // PUT /users/:id - Full update of alumni member via web form
    if (req.url.startsWith('/users/') && req.method === 'PUT') {
        const id = req.url.split('/')[2];
        UserController.update(req, res, id);
        return true;
    }

    // PATCH /users/:id - Partial update of alumni member via web form
    if (req.url.startsWith('/users/') && req.method === 'PATCH') {
        const id = req.url.split('/')[2];
        UserController.patch(req, res, id);
        return true;
    }

    // DELETE /users/:id - Delete alumni member via web request
    if (req.url.startsWith('/users/') && req.method === 'DELETE') {
        const id = req.url.split('/')[2];
        UserController.delete(req, res, id);
        return true;
    }

    return false;
}

module.exports = handleUserRoutes;
