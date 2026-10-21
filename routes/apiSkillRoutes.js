/**
 * API Skill Routes
 * 
 * Maps HTTP requests on /api/skills to ApiSkillController methods.
 *   - GET  /api/skills     - List skills
 *   - POST /api/skills     - Create skill
 *   - GET  /api/skills/:id - Get skill by ID
 */

const ApiSkillController = require('../controllers/apiSkillController');

/**
 * Router handler for /api/skills endpoints
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if request was handled, false otherwise
 */
function handleApiSkillRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    if (url === '/api/skills') {
        if (method === 'GET') {
            ApiSkillController.getAll(req, res);
            return true;
        }
        if (method === 'POST') {
            ApiSkillController.create(req, res);
            return true;
        }
    }

    const skillMatch = url.match(/^\/api\/skills\/(\d+)$/);
    if (skillMatch && method === 'GET') {
        ApiSkillController.getById(req, res, skillMatch[1]);
        return true;
    }

    return false;
}

module.exports = handleApiSkillRoutes;
