/**
 * API Announcement Routes
 * 
 * Maps HTTP requests on /api/announcements to ApiAnnouncementController methods.
 */

const ApiAnnouncementController = require('../controllers/apiAnnouncementController');

/**
 * Router handler for /api/announcements endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleApiAnnouncementRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    // GET /api/announcements - List all announcements (JSON)
    if (url === '/api/announcements' && method === 'GET') {
        ApiAnnouncementController.getAll(req, res);
        return true;
    }

    // GET /api/announcements/:id - Get single announcement by ID (JSON)
    if (url.startsWith('/api/announcements/') && method === 'GET') {
        const id = url.split('/')[3];
        ApiAnnouncementController.getById(req, res, id);
        return true;
    }

    // POST /api/announcements - Create new announcement (JSON)
    if (url === '/api/announcements' && method === 'POST') {
        ApiAnnouncementController.create(req, res);
        return true;
    }

    // PUT /api/announcements/:id - Full update of announcement (JSON)
    if (url.startsWith('/api/announcements/') && method === 'PUT') {
        const id = url.split('/')[3];
        ApiAnnouncementController.update(req, res, id);
        return true;
    }

    // PATCH /api/announcements/:id - Partial update of announcement (JSON)
    if (url.startsWith('/api/announcements/') && method === 'PATCH') {
        const id = url.split('/')[3];
        ApiAnnouncementController.patch(req, res, id);
        return true;
    }

    // DELETE /api/announcements/:id - Delete announcement (JSON)
    if (url.startsWith('/api/announcements/') && method === 'DELETE') {
        const id = url.split('/')[3];
        ApiAnnouncementController.delete(req, res, id);
        return true;
    }

    return false;
}

module.exports = handleApiAnnouncementRoutes;
