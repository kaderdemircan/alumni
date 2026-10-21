/**
 * API Job Routes
 * 
 * Maps HTTP requests to ApiJobController methods.
 * Supports Direct and Nested Routes:
 * 
 * 1. Direct Routes:
 *    - GET    /api/jobs                      - List all jobs (supports query filters)
 *    - POST   /api/jobs                      - Create new job posting
 *    - GET    /api/jobs/:id                  - Get job detail
 *    - PUT    /api/jobs/:id                  - Full update
 *    - PATCH  /api/jobs/:id                  - Partial update
 *    - DELETE /api/jobs/:id                  - Delete job
 * 
 * 2. Nested Routes:
 *    - GET    /api/jobs/:jobId/applications          - Applications for this job
 *    - POST   /api/jobs/:jobId/applications          - Submit application for this job
 *    - GET    /api/jobs/:jobId/skills                - Required skills for this job
 *    - POST   /api/jobs/:jobId/skills                - Attach skill to this job
 *    - DELETE /api/jobs/:jobId/skills/:skillId       - Detach skill from this job
 */

const ApiJobController = require('../controllers/apiJobController');

/**
 * Router handler for /api/jobs endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleApiJobRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    // 1. NESTED ROUTES: /api/jobs/:jobId/skills/:skillId
    const detachSkillMatch = url.match(/^\/api\/jobs\/(\d+)\/skills\/(\d+)$/);
    if (detachSkillMatch && method === 'DELETE') {
        ApiJobController.detachSkill(req, res, detachSkillMatch[1], detachSkillMatch[2]);
        return true;
    }

    // 2. NESTED ROUTES: /api/jobs/:jobId/skills
    const jobSkillsMatch = url.match(/^\/api\/jobs\/(\d+)\/skills$/);
    if (jobSkillsMatch) {
        if (method === 'GET') {
            ApiJobController.getSkills(req, res, jobSkillsMatch[1]);
            return true;
        }
        if (method === 'POST') {
            ApiJobController.attachSkill(req, res, jobSkillsMatch[1]);
            return true;
        }
    }

    // 3. NESTED ROUTES: /api/jobs/:jobId/applications
    const jobAppsMatch = url.match(/^\/api\/jobs\/(\d+)\/applications$/);
    if (jobAppsMatch) {
        if (method === 'GET') {
            ApiJobController.getApplications(req, res, jobAppsMatch[1]);
            return true;
        }
        if (method === 'POST') {
            ApiJobController.submitApplication(req, res, jobAppsMatch[1]);
            return true;
        }
    }

    // 4. DIRECT ROUTES: /api/jobs
    if (url === '/api/jobs') {
        if (method === 'GET') {
            ApiJobController.getAll(req, res);
            return true;
        }
        if (method === 'POST') {
            ApiJobController.create(req, res);
            return true;
        }
    }

    // 5. DIRECT ROUTES: /api/jobs/:id
    const jobDirectMatch = url.match(/^\/api\/jobs\/(\d+)$/);
    if (jobDirectMatch) {
        const id = jobDirectMatch[1];
        if (method === 'GET') {
            ApiJobController.getById(req, res, id);
            return true;
        }
        if (method === 'PUT') {
            ApiJobController.update(req, res, id);
            return true;
        }
        if (method === 'PATCH') {
            ApiJobController.patch(req, res, id);
            return true;
        }
        if (method === 'DELETE') {
            ApiJobController.delete(req, res, id);
            return true;
        }
    }

    return false;
}

module.exports = handleApiJobRoutes;
