/**
 * ApiSkillController
 * 
 * Handles direct RESTful API requests for Skill resources:
 *   - GET  /api/skills     - List all available skills
 *   - POST /api/skills     - Create a new skill
 *   - GET  /api/skills/:id - Get single skill by ID
 */

const { SkillModel } = require('../models');

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

class ApiSkillController {
    async getAll(req, res) {
        try {
            const skills = await SkillModel.getAll();
            sendJson(res, 200, skills);
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return sendJson(res, 400, { error: 'Invalid skill ID' });

        try {
            const skill = await SkillModel.getById(numericId);
            if (!skill) return sendJson(res, 404, { error: 'Skill not found' });
            sendJson(res, 200, skill);
        } catch (error) {
            sendJson(res, 500, { error: error.message });
        }
    }

    async create(req, res) {
        try {
            const body = await parseJsonBody(req);
            const result = await SkillModel.create(body);
            if (!result.success) return sendJson(res, 400, { error: result.error });

            sendJson(res, 201, {
                message: 'Skill created successfully',
                skill: result.skill
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message });
        }
    }
}

const apiSkillControllerInstance = new ApiSkillController();
module.exports = apiSkillControllerInstance;
module.exports.ApiSkillController = ApiSkillController;
