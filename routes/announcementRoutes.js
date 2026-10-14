/**
 * Web Announcement Routes
 * 
 * Maps HTTP requests on /announcements to AnnouncementController methods.
 * 
 * Route Map:
 *   GET    /announcements              → AnnouncementController.getAll()   - Management page & list
 *   POST   /announcements              → AnnouncementController.create()   - Create via web form
 *   GET    /announcements/:id          → AnnouncementController.getById()  - View detail
 *   GET    /announcements/:id/edit     → AnnouncementController.edit()     - Render edit form
 *   POST   /announcements/:id/edit     → AnnouncementController.update()   - Process edit form
 *   POST   /announcements/:id/delete   → AnnouncementController.delete()   - Delete via web form
 */

const AnnouncementController = require('../controllers/announcementController');

/**
 * Router handler for /announcements Web UI endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleAnnouncementRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    // GET /announcements - Render management page & table
    if ((req.url === '/announcements' || req.url.startsWith('/announcements?')) && method === 'GET') {
        AnnouncementController.getAll(req, res);
        return true;
    }

    // POST /announcements - Create new announcement via form
    if (url === '/announcements' && method === 'POST') {
        AnnouncementController.create(req, res);
        return true;
    }

    // GET /announcements/:id/edit - Render edit form
    const editGetMatch = url.match(/^\/announcements\/(\d+)\/edit$/);
    if (editGetMatch && method === 'GET') {
        AnnouncementController.edit(req, res, editGetMatch[1]);
        return true;
    }

    // POST /announcements/:id/edit - Process edit form submission
    const editPostMatch = url.match(/^\/announcements\/(\d+)\/edit$/);
    if (editPostMatch && method === 'POST') {
        AnnouncementController.update(req, res, editPostMatch[1]);
        return true;
    }

    // POST /announcements/:id/delete - Delete announcement via web form
    const deletePostMatch = url.match(/^\/announcements\/(\d+)\/delete$/);
    if (deletePostMatch && method === 'POST') {
        AnnouncementController.delete(req, res, deletePostMatch[1]);
        return true;
    }

    // GET /announcements/:id - View single announcement detail
    if (url.startsWith('/announcements/') && method === 'GET') {
        const id = url.split('/')[2];
        AnnouncementController.getById(req, res, id);
        return true;
    }

    // DELETE /announcements/:id - Delete (API-style)
    if (url.startsWith('/announcements/') && method === 'DELETE') {
        const id = url.split('/')[2];
        AnnouncementController.delete(req, res, id);
        return true;
    }

    return false;
}

module.exports = handleAnnouncementRoutes;
