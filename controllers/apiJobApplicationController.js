/**
 * ApiJobApplicationController
 * 
 * Handles direct RESTful API requests for Job Applications:
 *   - GET    /api/applications               - List all applications (supports ?job_id=&user_id=&status=)
 *   - POST   /api/applications               - Submit a new application directly
 *   - GET    /api/applications/:id           - Get application details (with applicant and job info)
 *   - PUT    /api/applications/:id           - Full update of application
 *   - PATCH  /api/applications/:id           - Partial update of application fields
 *   - PATCH  /api/applications/:id/status    - Update application review status & feedback
 *   - POST   /api/applications/:id/interview - Schedule an interview date & notes
 *   - DELETE /api/applications/:id           - Withdraw / delete application
 */

const url = require('url');
const { JobApplicationModel } = require('../models');

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            if (!body || body.trim() === '') return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error('Invalid JSON payload'));
            }
        });
        req.on('error', err => reject(err));
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

class ApiJobApplicationController {
    /**
     * GET /api/applications
     * Supports query parameters: ?job_id=...&user_id=...&status=...
     */
    async getAll(req, res) {
        try {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const filters = {
                job_id: parsedUrl.searchParams.get('job_id') || undefined,
                user_id: parsedUrl.searchParams.get('user_id') || undefined,
                status: parsedUrl.searchParams.get('status') || undefined
            };

            const apps = await JobApplicationModel.getAll(filters);
            sendJson(res, 200, {
                total: apps.length,
                filters: {
                    job_id: filters.job_id || null,
                    user_id: filters.user_id || null,
                    status: filters.status || null
                },
                applications: apps
            });
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    /**
     * GET /api/applications/:id
     */
    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid application ID' });

        try {
            const app = await JobApplicationModel.getById(numericId);
            if (!app) return sendJson(res, 404, { error: 'Application not found' });

            const job = await JobApplicationModel.getJob(numericId);
            const applicant = await JobApplicationModel.getApplicant(numericId);

            sendJson(res, 200, {
                ...app,
                job,
                applicant
            });
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    /**
     * POST /api/applications
     * Direct submission of a new job application
     */
    async create(req, res) {
        try {
            const body = await parseJsonBody(req);
            const result = await JobApplicationModel.create(body);

            if (!result.success) {
                const statusCode = result.duplicate ? 409 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 201, {
                message: 'Application submitted successfully',
                application: result.application
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PUT /api/applications/:id
     * Full replacement update of an application
     */
    async update(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid application ID' });

        try {
            const body = await parseJsonBody(req);
            const result = await JobApplicationModel.update(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Application updated successfully',
                application: result.application
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PATCH /api/applications/:id
     * Partial update of application fields
     */
    async patch(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid application ID' });

        try {
            const body = await parseJsonBody(req);
            const result = await JobApplicationModel.patch(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Application patched successfully',
                application: result.application
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PATCH /api/applications/:id/status
     * Lifecycle status update with review notes, rejection reasons, and scores
     */
    async updateStatus(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid application ID' });

        try {
            const body = await parseJsonBody(req);
            if (!body.status) return sendJson(res, 400, { error: 'status field is required' });

            const result = await JobApplicationModel.updateStatus(numericId, body.status, {
                review_notes: body.review_notes,
                rejection_reason: body.rejection_reason,
                feedback_score: body.feedback_score
            });

            if (!result.success) {
                const code = result.notFound ? 404 : 400;
                return sendJson(res, code, { error: result.error });
            }

            sendJson(res, 200, {
                message: `Application status transitioned to "${body.status}"`,
                application: result.application
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message });
        }
    }

    /**
     * POST /api/applications/:id/interview
     * Schedule an interview date & optional notes
     */
    async scheduleInterview(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid application ID' });

        try {
            const body = await parseJsonBody(req);
            if (!body.interview_date) {
                return sendJson(res, 400, { error: 'interview_date is required (ISO string or date)' });
            }

            const result = await JobApplicationModel.scheduleInterview(numericId, body.interview_date, body.review_notes);
            if (!result.success) {
                const code = result.notFound ? 404 : 400;
                return sendJson(res, code, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Interview scheduled successfully',
                application: result.application
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message });
        }
    }

    /**
     * DELETE /api/applications/:id
     * Withdraw or remove application
     */
    async delete(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid application ID' });

        try {
            const result = await JobApplicationModel.delete(numericId);
            if (!result.success) {
                const code = result.notFound ? 404 : 400;
                return sendJson(res, code, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Application deleted successfully',
                application: result.application
            });
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }
}

const apiJobApplicationControllerInstance = new ApiJobApplicationController();
module.exports = apiJobApplicationControllerInstance;
module.exports.ApiJobApplicationController = ApiJobApplicationController;
