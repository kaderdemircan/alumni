/**
 * API Job Application Routes
 * 
 * Maps direct HTTP requests on /api/applications to ApiJobApplicationController methods:
 *   - GET    /api/applications               - List all applications (supports query filters)
 *   - POST   /api/applications               - Direct job application submission
 *   - GET    /api/applications/:id           - Get application detail
 *   - PUT    /api/applications/:id           - Full update
 *   - PATCH  /api/applications/:id           - Partial update
 *   - PATCH  /api/applications/:id/status    - Update review status
 *   - POST   /api/applications/:id/interview - Schedule interview
 *   - DELETE /api/applications/:id           - Delete / withdraw application
 */

const ApiJobApplicationController = require('../controllers/apiJobApplicationController');

/**
 * Router handler for /api/applications endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleApiJobApplicationRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    // 1. POST /api/applications/:id/interview (Schedule Interview)
    const interviewMatch = url.match(/^\/api\/applications\/(\d+)\/interview$/);
    if (interviewMatch && method === 'POST') {
        ApiJobApplicationController.scheduleInterview(req, res, interviewMatch[1]);
        return true;
    }

    // 2. PATCH /api/applications/:id/status (Update Review Status)
    const statusMatch = url.match(/^\/api\/applications\/(\d+)\/status$/);
    if (statusMatch && method === 'PATCH') {
        ApiJobApplicationController.updateStatus(req, res, statusMatch[1]);
        return true;
    }

    // 3. /api/applications (List or Create)
    if (url === '/api/applications') {
        if (method === 'GET') {
            ApiJobApplicationController.getAll(req, res);
            return true;
        }
        if (method === 'POST') {
            ApiJobApplicationController.create(req, res);
            return true;
        }
    }

    // 4. /api/applications/:id (Detail, Update, Patch, Delete)
    const appMatch = url.match(/^\/api\/applications\/(\d+)$/);
    if (appMatch) {
        const id = appMatch[1];
        if (method === 'GET') {
            ApiJobApplicationController.getById(req, res, id);
            return true;
        }
        if (method === 'PUT') {
            ApiJobApplicationController.update(req, res, id);
            return true;
        }
        if (method === 'PATCH') {
            ApiJobApplicationController.patch(req, res, id);
            return true;
        }
        if (method === 'DELETE') {
            ApiJobApplicationController.delete(req, res, id);
            return true;
        }
    }

    return false;
}

module.exports = handleApiJobApplicationRoutes;
