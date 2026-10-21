/**
 * ApiJobController
 * 
 * Handles RESTful API requests for JobPosting resources, supporting both:
 * 1. Direct Routes:
 *    - GET    /api/jobs                  - List all job postings (supports query filters)
 *    - POST   /api/jobs                  - Create a new job posting
 *    - GET    /api/jobs/:id              - Get job details (with required skills)
 *    - PUT    /api/jobs/:id              - Full update of job posting
 *    - PATCH  /api/jobs/:id              - Partial update of job posting
 *    - DELETE /api/jobs/:id              - Delete job posting
 * 
 * 2. Nested Routes (under /api/jobs/:jobId):
 *    - GET    /api/jobs/:jobId/applications           - List all applications for this job
 *    - POST   /api/jobs/:jobId/applications           - Submit an application for this specific job
 *    - GET    /api/jobs/:jobId/skills                 - List all skills required for this job
 *    - POST   /api/jobs/:jobId/skills                 - Attach a skill to this job
 *    - DELETE /api/jobs/:jobId/skills/:skillId        - Detach a skill from this job
 */

const { JobPostingModel, JobApplicationModel, SkillModel } = require('../models');

/**
 * Helper to parse JSON request body
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object>}
 */
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

class ApiJobController {
    // =========================================================================
    // DIRECT ROUTES (/api/jobs)
    // =========================================================================

    /**
     * GET /api/jobs
     * List all job postings with optional query filters
     */
    async getAll(req, res) {
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const filters = {};
            if (urlObj.searchParams.get('status')) filters.status = urlObj.searchParams.get('status');
            if (urlObj.searchParams.get('category')) filters.category = urlObj.searchParams.get('category');
            if (urlObj.searchParams.get('workplace_type')) filters.workplace_type = urlObj.searchParams.get('workplace_type');
            if (urlObj.searchParams.get('employment_type')) filters.employment_type = urlObj.searchParams.get('employment_type');
            if (urlObj.searchParams.get('is_featured')) filters.is_featured = urlObj.searchParams.get('is_featured') === 'true';

            const jobs = await JobPostingModel.getAll(filters);
            sendJson(res, 200, jobs);
        } catch (error) {
            sendJson(res, 500, { error: 'Internal server error: ' + error.message });
        }
    }

    /**
     * GET /api/jobs/:id
     * Retrieve job details along with required skills
     */
    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const job = await JobPostingModel.getById(numericId);
            if (!job) {
                return sendJson(res, 404, { error: 'Job posting not found' });
            }

            // Increment views in background
            JobPostingModel.incrementViews(numericId).catch(() => {});

            // Fetch relations
            const skills = await JobPostingModel.getSkills(numericId);

            sendJson(res, 200, {
                ...job,
                skills
            });
        } catch (error) {
            sendJson(res, 500, { error: 'Internal server error: ' + error.message });
        }
    }

    /**
     * POST /api/jobs
     * Create a new job posting
     */
    async create(req, res) {
        try {
            const body = await parseJsonBody(req);
            const result = await JobPostingModel.create(body);

            if (!result.success) {
                return sendJson(res, 400, { error: result.error });
            }

            // If skills array was provided in payload, attach them
            if (Array.isArray(body.skills)) {
                for (const s of body.skills) {
                    const skillId = typeof s === 'object' ? s.id || s.skill_id : s;
                    const isMandatory = typeof s === 'object' && s.is_mandatory !== undefined ? Boolean(s.is_mandatory) : true;
                    if (skillId) {
                        await JobPostingModel.attachSkill(result.job.id, skillId, isMandatory);
                    }
                }
            }

            sendJson(res, 201, {
                message: 'Job posting created successfully',
                job: result.job
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PUT /api/jobs/:id
     * Full update of an existing job posting
     */
    async update(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const body = await parseJsonBody(req);
            const result = await JobPostingModel.update(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Job posting updated successfully',
                job: result.job
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * PATCH /api/jobs/:id
     * Partial update of an existing job posting
     */
    async patch(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const body = await parseJsonBody(req);
            const result = await JobPostingModel.patch(numericId, body);

            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Job posting updated successfully',
                job: result.job
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || 'Invalid JSON payload' });
        }
    }

    /**
     * DELETE /api/jobs/:id
     * Remove job posting
     */
    async delete(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const result = await JobPostingModel.delete(numericId);
            if (!result.success) {
                const statusCode = result.notFound ? 404 : 400;
                return sendJson(res, statusCode, { error: result.error });
            }

            sendJson(res, 200, {
                message: 'Job posting deleted successfully',
                job: result.job
            });
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    // =========================================================================
    // NESTED ROUTES (/api/jobs/:jobId/applications & /api/jobs/:jobId/skills)
    // =========================================================================

    /**
     * GET /api/jobs/:jobId/applications
     * Nested: List all applications for a specific job
     */
    async getApplications(req, res, jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const job = await JobPostingModel.getById(numericId);
            if (!job) {
                return sendJson(res, 404, { error: 'Job posting not found' });
            }

            const applications = await JobPostingModel.getApplications(numericId);
            sendJson(res, 200, {
                job_id: numericId,
                job_title: job.title,
                company_name: job.company_name,
                total_applications: applications.length,
                applications
            });
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    /**
     * POST /api/jobs/:jobId/applications
     * Nested: Submit a job application for a specific job (auto-binding job_id)
     */
    async submitApplication(req, res, jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const job = await JobPostingModel.getById(numericId);
            if (!job) {
                return sendJson(res, 404, { error: 'Job posting not found' });
            }

            if (job.status !== 'open') {
                return sendJson(res, 400, { error: `Cannot apply: this job is currently ${job.status}` });
            }

            const body = await parseJsonBody(req);
            // Bind job_id from nested URL parameter
            body.job_id = numericId;

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
     * GET /api/jobs/:jobId/skills
     * Nested: List all skills associated with this job
     */
    async getSkills(req, res, jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const job = await JobPostingModel.getById(numericId);
            if (!job) {
                return sendJson(res, 404, { error: 'Job posting not found' });
            }

            const skills = await JobPostingModel.getSkills(numericId);
            sendJson(res, 200, skills);
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    /**
     * POST /api/jobs/:jobId/skills
     * Nested: Attach a skill to this job
     */
    async attachSkill(req, res, jobId) {
        const numericId = parseInt(jobId, 10);
        if (isNaN(numericId)) {
            return sendJson(res, 400, { error: 'Invalid job ID' });
        }

        try {
            const job = await JobPostingModel.getById(numericId);
            if (!job) {
                return sendJson(res, 404, { error: 'Job posting not found' });
            }

            const body = await parseJsonBody(req);
            if (!body.skill_id) {
                return sendJson(res, 400, { error: 'skill_id is required' });
            }

            const isMandatory = body.is_mandatory !== undefined ? Boolean(body.is_mandatory) : true;
            await JobPostingModel.attachSkill(numericId, body.skill_id, isMandatory);

            const updatedSkills = await JobPostingModel.getSkills(numericId);
            sendJson(res, 200, {
                message: 'Skill attached to job successfully',
                skills: updatedSkills
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message });
        }
    }

    /**
     * DELETE /api/jobs/:jobId/skills/:skillId
     * Nested: Detach a skill from this job
     */
    async detachSkill(req, res, jobId, skillId) {
        const numericJobId = parseInt(jobId, 10);
        const numericSkillId = parseInt(skillId, 10);
        if (isNaN(numericJobId) || isNaN(numericSkillId)) {
            return sendJson(res, 400, { error: 'Invalid job ID or skill ID' });
        }

        try {
            await JobPostingModel.detachSkill(numericJobId, numericSkillId);
            sendJson(res, 200, { message: 'Skill detached successfully' });
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }
}

const apiJobControllerInstance = new ApiJobController();
module.exports = apiJobControllerInstance;
module.exports.ApiJobController = ApiJobController;
