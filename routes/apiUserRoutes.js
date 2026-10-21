/**
 * API User Routes
 * 
 * Maps HTTP requests on /api/users to ApiUserController methods.
 */

const ApiUserController = require('../controllers/apiUserController');

/**
 * Router handler for /api/users endpoints
 * Supports Direct and Nested Routes:
 *   - Direct:
 *       GET    /api/users
 *       POST   /api/users
 *       GET    /api/users/:id
 *       PUT    /api/users/:id
 *       PATCH  /api/users/:id
 *       DELETE /api/users/:id
 *       GET    /api/users/:userId/applications  (Applications made by user)
 *       POST   /api/users/:userId/applications (Submit application by user)
 *       GET    /api/users/:userId/skills        (Skills acquired by user)
 * 
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleApiUserRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    // 1. NESTED ROUTES: /api/users/:userId/applications
    const userAppsMatch = url.match(/^\/api\/users\/(\d+)\/applications$/);
    if (userAppsMatch) {
        if (method === 'GET') {
            ApiUserController.getUserApplications(req, res, userAppsMatch[1]);
            return true;
        }
        if (method === 'POST') {
            ApiUserController.submitUserApplication(req, res, userAppsMatch[1]);
            return true;
        }
    }

    // 3. NESTED ROUTES: /api/users/:userId/skills
    const userSkillsMatch = url.match(/^\/api\/users\/(\d+)\/skills$/);
    if (userSkillsMatch && method === 'GET') {
        ApiUserController.getUserSkills(req, res, userSkillsMatch[1]);
        return true;
    }

    // 4. DIRECT ROUTES: /api/users
    if (url === '/api/users') {
        if (method === 'GET') {
            ApiUserController.getAll(req, res);
            return true;
        }
        if (method === 'POST') {
            ApiUserController.create(req, res);
            return true;
        }
    }

    // 5. DIRECT ROUTES: /api/users/:id
    const userDirectMatch = url.match(/^\/api\/users\/(\d+)$/);
    if (userDirectMatch) {
        const id = userDirectMatch[1];
        if (method === 'GET') {
            ApiUserController.getById(req, res, id);
            return true;
        }
        if (method === 'PUT') {
            ApiUserController.update(req, res, id);
            return true;
        }
        if (method === 'PATCH') {
            ApiUserController.patch(req, res, id);
            return true;
        }
        if (method === 'DELETE') {
            ApiUserController.delete(req, res, id);
            return true;
        }
    }

    return false;
}

module.exports = handleApiUserRoutes;

