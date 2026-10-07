/**
 * UserController
 * 
 * Handles Web UI interactions and views for User/Alumni resources.
 * Renders HTML templates from the View layer (views/) for browser clients,
 * and processes web form submissions.
 * 
 * CRUD operations:
 *   GET    /users              → getAll()    - List all alumni (table view)
 *   GET    /users/:id          → getById()   - View single alumni detail
 *   POST   /users              → create()    - Create new alumni (form submit)
 *   GET    /users/:id/edit     → edit()      - Render edit form pre-filled
 *   POST   /users/:id/edit     → update()    - Process edit form (full update)
 *   POST   /users/:id/delete   → delete()    - Delete alumni via form POST
 */

const fs = require('fs');
const path = require('path');
const UserModel = require('../models/userModel');

// Paths to View Layer templates
const USERS_VIEW_PATH = path.join(__dirname, '..', 'views', 'users.html');
const USER_DETAIL_VIEW_PATH = path.join(__dirname, '..', 'views', 'user-detail.html');
const USER_EDIT_VIEW_PATH = path.join(__dirname, '..', 'views', 'user-edit.html');

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
                        parsed[key] = key === 'age' ? Number(value) : value;
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
 * Helper to generate HTML table rows from user models (with action links)
 * @param {Array<Object>} users
 * @returns {string}
 */
function renderUserTableRows(users) {
    if (!users || users.length === 0) {
        return `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #888;">Henüz kayıtlı mezun bulunmuyor. Yukarıdaki formdan yeni bir mezun ekleyebilirsiniz!</td></tr>`;
    }
    return users.map(u => `
        <tr>
            <td><strong>#${u.id}</strong></td>
            <td>${u.name}</td>
            <td>${u.surname}</td>
            <td><span class="badge">${u.age}</span></td>
            <td>${u.birthday}</td>
            <td>
                <a href="/users/${u.id}" class="action-link view" title="View">👁️</a>
                <a href="/users/${u.id}/edit" class="action-link edit" title="Edit">✏️</a>
                <form action="/users/${u.id}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete #${u.id} ${u.name} ${u.surname}?');">
                    <button type="submit" class="action-link delete" title="Delete">🗑️</button>
                </form>
            </td>
        </tr>
    `).join('');
}

/**
 * Helper to render an HTML document for standalone/error pages
 * @param {import('http').ServerResponse} res
 * @param {number} statusCode
 * @param {string} title
 * @param {string} contentHtml
 */
function renderHtmlPage(res, statusCode, title, contentHtml) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Alumni Network</title>
    <style>
        :root {
            --clr-green: #2ecc71;
            --clr-yellow: #f1c40f;
            --clr-black: #111111;
            --clr-blue: #3498db;
            --clr-white: #ffffff;
            --clr-bg: #f8f9fa;
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: var(--clr-bg); color: var(--clr-black); }
        header { background: var(--clr-black); color: var(--clr-white); padding: 1.5rem 0; text-align: center; border-bottom: 5px solid var(--clr-blue); }
        header h2 { margin: 0; font-size: 2rem; }
        nav { background: var(--clr-blue); display: flex; justify-content: center; padding: 0.8rem; }
        nav a { color: var(--clr-white); text-decoration: none; padding: 0.6rem 1.2rem; margin: 0 0.5rem; border-radius: 4px; font-weight: bold; }
        nav a:hover { background: var(--clr-yellow); color: var(--clr-black); }
        .container { max-width: 900px; margin: 2rem auto; padding: 2rem; background: var(--clr-white); box-shadow: 0 8px 15px rgba(0,0,0,0.05); border-radius: 8px; border-top: 6px solid var(--clr-green); }
        .btn { display: inline-block; padding: 0.6rem 1.2rem; background: var(--clr-green); color: white; text-decoration: none; border-radius: 4px; font-weight: bold; border: none; cursor: pointer; }
        .btn:hover { background: #27ae60; }
    </style>
</head>
<body>
    <header>
        <h2>Alumni Network</h2>
    </header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About Us</a>
        <a href="/users">Alumni System</a>
        <a href="/api/swagger">API Docs</a>
    </nav>
    <div class="container">
        ${contentHtml}
    </div>
</body>
</html>`;
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
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

class UserController {
    /**
     * GET /users
     * View Layer Route: Renders views/users.html containing alumni directory & registration form
     */
    async getAll(req, res) {
        try {
            const template = await readTemplate(USERS_VIEW_PATH);
            const users = UserModel.getAll();
            const tableRows = renderUserTableRows(users);

            // Check for success/deleted banner flags
            let alertHtml = '';
            if (req.url.includes('created=true')) {
                alertHtml = '<div class="alert alert-success">✅ Alumnus successfully registered!</div>';
            } else if (req.url.includes('updated=true')) {
                alertHtml = '<div class="alert alert-success">✅ Alumnus record updated successfully!</div>';
            } else if (req.url.includes('deleted=true')) {
                alertHtml = '<div class="alert alert-success">✅ Alumnus record deleted successfully!</div>';
            }

            let html = template.replace('<!-- USERS_TABLE_ROWS -->', tableRows);
            html = html.replace('<!-- ALERT_MESSAGE -->', alertHtml);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Sunucu Hatası: ${error.message}`);
        }
    }

    /**
     * POST /users
     * View Layer Route: Handles web form submission to register a new alumnus
     * Implements Post/Redirect/Get (PRG) pattern on success.
     */
    async create(req, res) {
        try {
            const body = await parseRequestBody(req);
            const result = UserModel.create(body);

            if (!result.success) {
                // Validation error: re-render view template with error alert
                const template = await readTemplate(USERS_VIEW_PATH);
                const users = UserModel.getAll();
                const tableRows = renderUserTableRows(users);
                const alertHtml = `<div class="alert alert-danger">⚠️ Kayıt Başarısız: ${result.error}</div>`;

                let html = template.replace('<!-- USERS_TABLE_ROWS -->', tableRows);
                html = html.replace('<!-- ALERT_MESSAGE -->', alertHtml);

                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(html);
            }

            // Post/Redirect/Get (PRG) pattern: redirect back to /users with success flag
            res.writeHead(303, { 'Location': '/users?created=true' });
            res.end();
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Hata: ${error.message}`);
        }
    }

    /**
     * GET /users/:id
     * View Layer Route: View single alumni details using user-detail.html template
     */
    async getById(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return renderHtmlPage(res, 400, 'Invalid ID', `<h2>Geçersiz ID</h2><p>Lütfen geçerli bir sayı girin.</p><a href="/users" class="btn">⬅️ Back to Directory</a>`);
        }

        const user = UserModel.getById(numericId);
        if (!user) {
            return renderHtmlPage(res, 404, 'Not Found', `<h2>Kullanıcı Bulunamadı</h2><p>ID #${numericId} numaralı mezun bulunamadı.</p><a href="/users" class="btn">⬅️ Back to Directory</a>`);
        }

        try {
            let template = await readTemplate(USER_DETAIL_VIEW_PATH);

            // Replace all template placeholders with user data
            template = template.replace(/<!-- USER_ID -->/g, user.id);
            template = template.replace(/<!-- USER_NAME -->/g, user.name);
            template = template.replace(/<!-- USER_SURNAME -->/g, user.surname);
            template = template.replace(/<!-- USER_AGE -->/g, user.age);
            template = template.replace(/<!-- USER_BIRTHDAY -->/g, user.birthday);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(template);
        } catch (error) {
            // Fallback to inline HTML if template file is missing
            const content = `
                <h2>🎓 Mezun Profili: ${user.name} ${user.surname}</h2>
                <div style="background: #fdfdfd; padding: 1.5rem; border-left: 4px solid var(--clr-blue); margin: 1rem 0;">
                    <p><strong>ID:</strong> #${user.id}</p>
                    <p><strong>İsim:</strong> ${user.name}</p>
                    <p><strong>Soyisim:</strong> ${user.surname}</p>
                    <p><strong>Yaş:</strong> ${user.age}</p>
                    <p><strong>Doğum Tarihi:</strong> ${user.birthday}</p>
                </div>
                <a href="/users/${user.id}/edit" class="btn" style="background:#f39c12;">✏️ Edit</a>
                <a href="/users" class="btn">⬅️ Back to Directory</a>
            `;
            renderHtmlPage(res, 200, `${user.name} ${user.surname}`, content);
        }
    }

    /**
     * GET /users/:id/edit
     * View Layer Route: Render the edit form pre-filled with current user data
     */
    async edit(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return renderHtmlPage(res, 400, 'Invalid ID', '<h2>Geçersiz ID</h2><p>Lütfen geçerli bir sayı girin.</p><a href="/users" class="btn">⬅️ Back</a>');
        }

        const user = UserModel.getById(numericId);
        if (!user) {
            return renderHtmlPage(res, 404, 'Not Found', `<h2>Kullanıcı Bulunamadı</h2><p>ID #${numericId} numaralı mezun bulunamadı.</p><a href="/users" class="btn">⬅️ Back</a>`);
        }

        try {
            let template = await readTemplate(USER_EDIT_VIEW_PATH);

            template = template.replace(/<!-- USER_ID -->/g, user.id);
            template = template.replace(/<!-- USER_NAME -->/g, user.name);
            template = template.replace(/<!-- USER_SURNAME -->/g, user.surname);
            template = template.replace(/<!-- USER_AGE -->/g, user.age);
            template = template.replace(/<!-- USER_BIRTHDAY -->/g, user.birthday);
            template = template.replace('<!-- ALERT_MESSAGE -->', '');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(template);
        } catch (error) {
            renderHtmlPage(res, 500, 'Error', `<p>Edit form template could not be loaded: ${error.message}</p>`);
        }
    }

    /**
     * POST /users/:id/edit
     * View Layer Route: Process edit form submission (full update via PUT semantics)
     * Uses PRG pattern on success, re-renders edit form with errors on failure.
     */
    async update(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return renderHtmlPage(res, 400, 'Hata', '<p>Geçersiz ID</p>');
        }

        try {
            const body = await parseRequestBody(req);
            const result = UserModel.update(numericId, body);

            if (!result.success) {
                if (result.notFound) {
                    return renderHtmlPage(res, 404, 'Not Found', `<h2>Kullanıcı Bulunamadı</h2><p>ID #${numericId} numaralı mezun bulunamadı.</p><a href="/users" class="btn">⬅️ Back</a>`);
                }

                // Validation error: re-render edit form with error
                const user = UserModel.getById(numericId);
                if (user) {
                    try {
                        let template = await readTemplate(USER_EDIT_VIEW_PATH);
                        const alertHtml = `<div class="alert alert-danger">⚠️ Güncelleme Başarısız: ${result.error}</div>`;

                        template = template.replace(/<!-- USER_ID -->/g, user.id);
                        template = template.replace(/<!-- USER_NAME -->/g, body.name || user.name);
                        template = template.replace(/<!-- USER_SURNAME -->/g, body.surname || user.surname);
                        template = template.replace(/<!-- USER_AGE -->/g, body.age !== undefined ? body.age : user.age);
                        template = template.replace(/<!-- USER_BIRTHDAY -->/g, body.birthday || user.birthday);
                        template = template.replace('<!-- ALERT_MESSAGE -->', alertHtml);

                        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                        return res.end(template);
                    } catch (e) {
                        // fallback
                    }
                }
                return renderHtmlPage(res, 400, 'Hata', `<p>${result.error}</p><a href="/users" class="btn">⬅️ Back</a>`);
            }

            // PRG: redirect to user list with success flag
            res.writeHead(303, { 'Location': '/users?updated=true' });
            res.end();
        } catch (error) {
            renderHtmlPage(res, 400, 'Hata', `<p>${error.message}</p>`);
        }
    }

    /**
     * PUT /users/:id
     * API-style full update (kept for backwards compatibility)
     */
    async put(req, res, id) {
        return this.update(req, res, id);
    }

    /**
     * PATCH /users/:id
     * Partial update of a user
     */
    async patch(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return renderHtmlPage(res, 400, 'Hata', '<p>Geçersiz ID</p>');
        }

        try {
            const body = await parseRequestBody(req);
            const result = UserModel.patch(numericId, body);

            if (!result.success) {
                return renderHtmlPage(res, result.notFound ? 404 : 400, 'Hata', `<p>${result.error}</p>`);
            }

            res.writeHead(303, { 'Location': '/users?updated=true' });
            res.end();
        } catch (error) {
            renderHtmlPage(res, 400, 'Hata', `<p>${error.message}</p>`);
        }
    }

    /**
     * POST /users/:id/delete  (Web form delete via POST)
     * DELETE /users/:id        (API-style delete)
     * Deletes a user and redirects back to the directory.
     */
    async delete(req, res, id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return renderHtmlPage(res, 400, 'Hata', '<p>Geçersiz ID</p>');
        }

        const result = UserModel.delete(numericId);
        if (!result.success) {
            return renderHtmlPage(res, result.notFound ? 404 : 400, 'Hata', `<p>${result.error}</p><a href="/users" class="btn">⬅️ Back</a>`);
        }

        res.writeHead(303, { 'Location': '/users?deleted=true' });
        res.end();
    }

    // Direct domain helper methods
    index(req, res) { return this.getAll(req, res); }
    show(req, res, id) { return this.getById(req, res, id); }
}

const userControllerInstance = new UserController();
module.exports = userControllerInstance;
module.exports.UserController = UserController;
