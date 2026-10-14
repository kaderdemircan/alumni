/**
 * AnnouncementController
 * 
 * Handles Web UI interactions and views for Announcement resources.
 * Renders HTML templates from the View layer (views/) for browser clients,
 * and processes web form submissions.
 * 
 * CRUD operations:
 *   GET    /announcements              → getAll()    - List all announcements (management table & form)
 *   GET    /announcements/:id          → getById()   - View single announcement detail
 *   POST   /announcements              → create()    - Post new announcement (web form)
 *   GET    /announcements/:id/edit     → edit()      - Render edit form pre-filled
 *   POST   /announcements/:id/edit     → update()    - Process edit form
 *   POST   /announcements/:id/delete   → delete()    - Delete announcement via web form POST
 */

const fs = require('fs');
const path = require('path');
const AnnouncementModel = require('../models/announcementModel');

// Paths to View Layer templates
const ANNOUNCEMENTS_VIEW_PATH = path.join(__dirname, '..', 'views', 'announcements.html');
const ANNOUNCEMENT_DETAIL_VIEW_PATH = path.join(__dirname, '..', 'views', 'announcement-detail.html');
const ANNOUNCEMENT_EDIT_VIEW_PATH = path.join(__dirname, '..', 'views', 'announcement-edit.html');

/**
 * Helper to parse URL-encoded or JSON body from web forms
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object>}
 */
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (!body || body.trim() === '') {
                return resolve({});
            }
            const contentType = req.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                try {
                    return resolve(JSON.parse(body));
                } catch (err) {
                    return reject(new Error('Invalid JSON payload'));
                }
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                try {
                    const parsed = {};
                    const params = new URLSearchParams(body);
                    for (const [key, value] of params.entries()) {
                        parsed[key] = value;
                    }
                    return resolve(parsed);
                } catch (err) {
                    return reject(new Error('Invalid Form payload'));
                }
            } else {
                try {
                    return resolve(JSON.parse(body));
                } catch (e) {
                    return resolve({});
                }
            }
        });
        req.on('error', err => reject(err));
    });
}

/**
 * Helper to read a template file and return its content
 * @param {string} filePath
 * @returns {Promise<string>}
 */
function readTemplate(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) return reject(err);
            resolve(content);
        });
    });
}

/**
 * Helper to get badge class for category
 * @param {string} category
 * @returns {string}
 */
function getCategoryBadgeClass(category) {
    switch ((category || '').toLowerCase()) {
        case 'etkinlik': return 'badge-event';
        case 'kariyer': return 'badge-career';
        case 'akademik': return 'badge-academic';
        default: return 'badge-general';
    }
}

/**
 * Helper to get priority CSS class
 * @param {string} priority
 * @returns {string}
 */
function getPriorityClass(priority) {
    switch ((priority || '').toLowerCase()) {
        case 'acil': return 'priority-urgent';
        case 'önemli':
        case 'onemli': return 'priority-important';
        default: return 'priority-normal';
    }
}

/**
 * Helper to generate HTML table rows from announcements
 * @param {Array<Object>} announcements
 * @returns {string}
 */
function renderAnnouncementTableRows(announcements) {
    if (!announcements || announcements.length === 0) {
        return `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #888;">Henüz duyuru bulunmuyor. Yukarıdaki formdan yeni bir duyuru yayınlayabilirsiniz!</td></tr>`;
    }
    return announcements.map(a => `
        <tr>
            <td><strong>#${a.id}</strong></td>
            <td><strong>${a.title}</strong></td>
            <td><span class="badge ${getCategoryBadgeClass(a.category)}">${a.category}</span></td>
            <td>${a.author}</td>
            <td>${a.date}</td>
            <td><span class="${getPriorityClass(a.priority)}">${a.priority || 'Normal'}</span></td>
            <td>
                <a href="/announcements/${a.id}" class="action-link view" title="View Detail">👁️</a>
                <a href="/announcements/${a.id}/edit" class="action-link edit" title="Edit">✏️</a>
                <form action="/announcements/${a.id}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Duyuru #${a.id} silinsin mi?');">
                    <button type="submit" class="action-link delete" title="Delete">🗑️</button>
                </form>
            </td>
        </tr>
    `).join('');
}

class AnnouncementController {
    /**
     * GET /announcements
     * View Layer Route: Renders announcements.html management table and form
     */
    async getAll(req, res) {
        try {
            const template = await readTemplate(ANNOUNCEMENTS_VIEW_PATH);
            const announcements = await AnnouncementModel.getAll();
            const tableRows = renderAnnouncementTableRows(announcements);

            let alertHtml = '';
            if (req.url.includes('created=true')) {
                alertHtml = '<div class="alert alert-success">✅ Duyuru başarıyla yayınlandı!</div>';
            } else if (req.url.includes('updated=true')) {
                alertHtml = '<div class="alert alert-success">✅ Duyuru başarıyla güncellendi!</div>';
            } else if (req.url.includes('deleted=true')) {
                alertHtml = '<div class="alert alert-success">✅ Duyuru başarıyla silindi!</div>';
            }

            let html = template.replace('<!-- ANNOUNCEMENTS_TABLE_ROWS -->', tableRows);
            html = html.replace('<!-- ALERT_MESSAGE -->', alertHtml);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Sunucu Hatası: ${error.message}`);
        }
    }

    /**
     * POST /announcements
     * View Layer Route: Create announcement from web form
     */
    async create(req, res) {
        try {
            const body = await parseRequestBody(req);
            const result = await AnnouncementModel.create(body);

            if (!result.success) {
                const template = await readTemplate(ANNOUNCEMENTS_VIEW_PATH);
                const announcements = await AnnouncementModel.getAll();
                const tableRows = renderAnnouncementTableRows(announcements);
                const alertHtml = `<div class="alert alert-danger">⚠️ Hata: ${result.error}</div>`;

                let html = template.replace('<!-- ANNOUNCEMENTS_TABLE_ROWS -->', tableRows);
                html = html.replace('<!-- ALERT_MESSAGE -->', alertHtml);

                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(html);
            }

            // PRG (Post/Redirect/Get)
            res.writeHead(303, { 'Location': '/announcements?created=true' });
            res.end();
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Hata: ${error.message}`);
        }
    }

    /**
     * GET /announcements/:id
     * View Layer Route: Single announcement detail
     */
    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Geçersiz ID');
        }

        const announcement = await AnnouncementModel.getById(numericId);
        if (!announcement) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Duyuru bulunamadı.');
        }

        try {
            let template = await readTemplate(ANNOUNCEMENT_DETAIL_VIEW_PATH);
            template = template.replace(/<!-- ANNOUNCEMENT_ID -->/g, announcement.id);
            template = template.replace(/<!-- ANNOUNCEMENT_TITLE -->/g, announcement.title);
            template = template.replace(/<!-- ANNOUNCEMENT_CONTENT -->/g, announcement.content);
            template = template.replace(/<!-- ANNOUNCEMENT_AUTHOR -->/g, announcement.author);
            template = template.replace(/<!-- ANNOUNCEMENT_CATEGORY -->/g, announcement.category);
            template = template.replace(/<!-- ANNOUNCEMENT_DATE -->/g, announcement.date);
            template = template.replace(/<!-- ANNOUNCEMENT_PRIORITY -->/g, announcement.priority || 'Normal');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(template);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Sunucu Hatası: ${error.message}`);
        }
    }

    /**
     * GET /announcements/:id/edit
     * View Layer Route: Render edit form
     */
    async edit(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Geçersiz ID');
        }

        const announcement = await AnnouncementModel.getById(numericId);
        if (!announcement) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Duyuru bulunamadı.');
        }

        try {
            let template = await readTemplate(ANNOUNCEMENT_EDIT_VIEW_PATH);
            template = template.replace(/<!-- ANNOUNCEMENT_ID -->/g, announcement.id);
            template = template.replace(/<!-- ANNOUNCEMENT_TITLE -->/g, announcement.title);
            template = template.replace(/<!-- ANNOUNCEMENT_CONTENT -->/g, announcement.content);
            template = template.replace(/<!-- ANNOUNCEMENT_AUTHOR -->/g, announcement.author);
            template = template.replace(/<!-- ANNOUNCEMENT_DATE -->/g, announcement.date);
            template = template.replace('<!-- ALERT_MESSAGE -->', '');

            // Options selection
            const categories = ['Genel', 'Etkinlik', 'Kariyer', 'Akademik'];
            const categoryOptions = categories.map(cat => 
                `<option value="${cat}" ${announcement.category === cat ? 'selected' : ''}>${cat}</option>`
            ).join('');
            template = template.replace('<!-- CATEGORY_OPTIONS -->', categoryOptions);

            const priorities = ['Normal', 'Önemli', 'Acil'];
            const priorityOptions = priorities.map(pri => 
                `<option value="${pri}" ${(announcement.priority || 'Normal') === pri ? 'selected' : ''}>${pri}</option>`
            ).join('');
            template = template.replace('<!-- PRIORITY_OPTIONS -->', priorityOptions);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(template);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Sunucu Hatası: ${error.message}`);
        }
    }

    /**
     * POST /announcements/:id/edit
     * View Layer Route: Process edit form
     */
    async update(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Geçersiz ID');
        }

        try {
            const body = await parseRequestBody(req);
            const result = await AnnouncementModel.update(numericId, body);

            if (!result.success) {
                return this.edit(req, res, id);
            }

            res.writeHead(303, { 'Location': '/announcements?updated=true' });
            res.end();
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Hata: ${error.message}`);
        }
    }

    /**
     * POST /announcements/:id/delete
     * View Layer Route: Delete announcement
     */
    async delete(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Geçersiz ID');
        }

        await AnnouncementModel.delete(numericId);
        res.writeHead(303, { 'Location': '/announcements?deleted=true' });
        res.end();
    }
}

const announcementControllerInstance = new AnnouncementController();
module.exports = announcementControllerInstance;
module.exports.AnnouncementController = AnnouncementController;
