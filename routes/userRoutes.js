/**
 * Web User Routes
 * 
 * Maps HTTP requests on /users to UserController methods.
 * 
 * CRUD Route Map:
 *   GET    /users              → UserController.getAll()    - List all alumni
 *   POST   /users              → UserController.create()    - Create new alumni
 *   GET    /users/:id          → UserController.getById()   - View single alumni
 *   GET    /users/:id/edit     → UserController.edit()      - Render edit form
 *   POST   /users/:id/edit     → UserController.update()    - Process edit form
 *   POST   /users/:id/delete   → UserController.delete()    - Delete via form POST
 *   PUT    /users/:id          → UserController.put()       - Full update (API-style)
 *   PATCH  /users/:id          → UserController.patch()     - Partial update (API-style)
 *   DELETE /users/:id          → UserController.delete()    - Delete (API-style)
 */

const UserController = require('../controllers/userController');

/**
 * Router handler for /users Web UI endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleUserRoutes(req, res) {
    const url = req.url.split('?')[0]; // Strip query string for matching
    const method = req.method;

    // GET /users - View Layer: Render alumni directory & registration form (HTML)
    if ((req.url === '/users' || req.url.startsWith('/users?')) && method === 'GET') {
        UserController.getAll(req, res);
        return true;
    }

    // POST /users - Create new alumni member via web form
    if (url === '/users' && method === 'POST') {
        UserController.create(req, res);
        return true;
    }

    // GET /users/:id/edit - Render edit form for a specific alumni member
    const editGetMatch = url.match(/^\/users\/(\d+)\/edit$/);
    if (editGetMatch && method === 'GET') {
        UserController.edit(req, res, editGetMatch[1]);
        return true;
    }

    // POST /users/:id/edit - Process edit form submission (update)
    const editPostMatch = url.match(/^\/users\/(\d+)\/edit$/);
    if (editPostMatch && method === 'POST') {
        UserController.update(req, res, editPostMatch[1]);
        return true;
    }

    // POST /users/:id/delete - Delete alumni member via web form POST
    const deletePostMatch = url.match(/^\/users\/(\d+)\/delete$/);
    if (deletePostMatch && method === 'POST') {
        UserController.delete(req, res, deletePostMatch[1]);
        return true;
    }

    // GET /users/:id - View alumni member profile (HTML)
    if (url.startsWith('/users/') && method === 'GET') {
        const id = url.split('/')[2];
        UserController.getById(req, res, id);
        return true;
    }

    // PUT /users/:id - Full update of alumni member (API-style)
    if (url.startsWith('/users/') && method === 'PUT') {
        const id = url.split('/')[2];
        UserController.put(req, res, id);
        return true;
    }

    // PATCH /users/:id - Partial update of alumni member (API-style)
    if (url.startsWith('/users/') && method === 'PATCH') {
        const id = url.split('/')[2];
        UserController.patch(req, res, id);
        return true;
    }

    // DELETE /users/:id - Delete alumni member (API-style)
    if (url.startsWith('/users/') && method === 'DELETE') {
        const id = url.split('/')[2];
        UserController.delete(req, res, id);
        return true;
    }

    return false;
}

module.exports = handleUserRoutes;
