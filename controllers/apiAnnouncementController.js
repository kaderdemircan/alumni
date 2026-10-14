/**
 * ApiAnnouncementController
 * 
 * Handles RESTful API requests for Announcement resources.
 * Communicates directly with AnnouncementModel and returns structured JSON responses
 * with standard HTTP status codes.
 */

const AnnouncementModel = require('../models/announcementModel');

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

class ApiAnnouncementController {
    /**
     * GET /api/announcements
     * Retrieve all announcements
     */
    async getAll(req, res) {
        try {
            const announcements = await AnnouncementModel.getAll();
            sendJson(res, 200, announcements);
        } catch (error) {
            sendJson(res, 500, { error: 'Internal server error' });
        }
    }

    /**
     * GET /api/announcements/:id
     * Retrieve a single announcement by ID
     */
    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid announcement ID' });
        }

        const announcement = await AnnouncementModel.getById(numericId);
        if (!announcement) {
            return sendJson(res, 404, { error: 'Announcement not found' });
        }

        sendJson(res, 200, announcement);
    }

    /**
     * POST /api/announcements
     * Create a new announcement
     */
    async create(req, res) {
        try {
            const body = await parseJsonBody(req);
            const result = await AnnouncementModel.create(body);

            if (!result.success) {
                return sendJson(res, 400, { error: result.error });
            }

            sendJson(res, 201, {
                message: 'Announcement created successfully',
                announcement: result.announcement
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PUT /api/announcements/:id
     * Full update of an existing announcement
     */
    async update(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid announcement ID' });
        }

        try {
            const body = await parseJsonBody(req);
            const result = await AnnouncementModel.update(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Announcement updated successfully',
                announcement: result.announcement
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PATCH /api/announcements/:id
     * Partial update of an existing announcement
     */
    async patch(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid announcement ID' });
        }

        try {
            const body = await parseJsonBody(req);
            const result = await AnnouncementModel.patch(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Announcement updated successfully',
                announcement: result.announcement
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * DELETE /api/announcements/:id
     * Remove an announcement by ID
     */
    async delete(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid announcement ID' });
        }

        const result = await AnnouncementModel.delete(numericId);
        if (!result.success) {
            const statusCode = result.notFound ? 404 : 400;
            return sendJson(res, statusCode, { error: result.error });
        }

        sendJson(res, 200, {
            message: 'Announcement deleted successfully',
            announcement: result.announcement
        });
    }
}

const apiAnnouncementControllerInstance = new ApiAnnouncementController();
module.exports = apiAnnouncementControllerInstance;
module.exports.ApiAnnouncementController = ApiAnnouncementController;
