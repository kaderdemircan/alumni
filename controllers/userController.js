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
const renderNavigation = require('../views/renderNavigation');
const UserModel = require('../models/userModel');
const session = require('../middleware/session');
const { requireRole } = require('../middleware/auth');
const { workspace } = require('../config/roles');
const escapeHtml = require('../views/escapeHtml');
const errorHandler = require('../middleware/errorHandler');

// Paths to View Layer templates
const USERS_VIEW_PATH = path.join(__dirname, '..', 'views', 'users.html');
const USER_DETAIL_VIEW_PATH = path.join(__dirname, '..', 'views', 'user-detail.html');
const USER_EDIT_VIEW_PATH = path.join(__dirname, '..', 'views', 'user-edit.html');
const REGISTER_VIEW_PATH = path.join(__dirname, '..', 'views', 'register.html');

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
            <td>${escapeHtml(u.name)}</td>
            <td>${escapeHtml(u.surname)}</td>
            <td><span class="badge">${escapeHtml(u.age)}</span></td>
            <td>${escapeHtml(u.birthday)}</td>
            <td>
                <a href="/users/${u.id}" class="action-link view" title="View">👁️</a>
                <a href="/users/${u.id}/edit" class="action-link edit" data-admin-only hidden title="Edit">✏️</a>
                <form action="/users/${u.id}/delete" data-admin-only hidden method="POST" style="display:inline;" onsubmit="return confirm('Delete this member record?');">
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
     * GET /register
     * View Layer Route: Renders views/register.html registration page
     */
    async renderRegister(req, res) {
        try {
            const template = await readTemplate(REGISTER_VIEW_PATH);
            let alertHtml = '';
            if (req.url.includes('registered=true') || req.url.includes('success=true')) {
                alertHtml = '<div class="alert-box alert-success">✅ Registration complete! Welcome to the Alumni Network. You can now explore the directory or view your profile.</div>';
            }
            let html = template.replace('<!-- ALERT_MESSAGE -->', alertHtml);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderNavigation(html, req));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Server Error: ${error.message}`);
        }
    }

    /**
     * POST /register
     * View Layer Route: Handles web form submission for user registration
     */
    async handleRegister(req, res) {
        try {
            const body = await parseRequestBody(req);
            const result = await UserModel.register(body);

            const isJson = (req.headers['accept'] && req.headers['accept'].includes('application/json')) ||
                           (req.headers['content-type'] && req.headers['content-type'].includes('application/json'));

            if (!result.success) {
                if (isJson) {
                    const statusCode = result.error && result.error.includes('already exists') ? 409 : 400;
                    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
                    return res.end(JSON.stringify({ success: false, error: result.error }));
                }

                const template = await readTemplate(REGISTER_VIEW_PATH);
                const alertHtml = `<div class="alert-box alert-danger">⚠️ Registration Failed: ${result.error}</div>`;
                let html = template.replace('<!-- ALERT_MESSAGE -->', alertHtml);
                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(renderNavigation(html, req));
            }

            if (isJson) {
                res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: true, message: 'Registration successful', user: result.user }));
            }

            // Redirect to sign-in after creating the account.
            res.writeHead(303, { 'Location': '/login?registered=true' });
            res.end();
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Error: ${error.message}`);
        }
    }

    /**
     * GET /users
     * View Layer Route: Renders views/users.html containing alumni directory & registration form
     */
    async getAll(req, res) {
        try {
            const template = await readTemplate(USERS_VIEW_PATH);
            const users = await UserModel.getAll({ includePending: req.session.role === 'admin' });
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

            let html = template.replace('<!-- USERS_TABLE_ROWS -->', () => tableRows);
            html = html.replace('<!-- ALERT_MESSAGE -->', alertHtml);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderNavigation(html, req));
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
            const result = await UserModel.create(body);

            if (!result.success) {
                // Validation error: re-render view template with error alert
                const template = await readTemplate(USERS_VIEW_PATH);
                const users = await UserModel.getAll({ includePending: req.session.role === 'admin' });
                const tableRows = renderUserTableRows(users);
                const alertHtml = `<div class="alert alert-danger">⚠️ Kayıt Başarısız: ${result.error}</div>`;

                let html = template.replace('<!-- USERS_TABLE_ROWS -->', () => tableRows);
                html = html.replace('<!-- ALERT_MESSAGE -->', alertHtml);

                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(renderNavigation(html, req));
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

        const user = await UserModel.getById(numericId, { includePending: req.session.role === 'admin' });
        if (!user) {
            return renderHtmlPage(res, 404, 'Not Found', `<h2>Kullanıcı Bulunamadı</h2><p>ID #${numericId} numaralı mezun bulunamadı.</p><a href="/users" class="btn">⬅️ Back to Directory</a>`);
        }

        try {
            let template = await readTemplate(USER_DETAIL_VIEW_PATH);

            // Replace all template placeholders with user data
            template = template.replace(/<!-- USER_ID -->/g, user.id);
            template = template.replace(/<!-- USER_NAME -->/g, () => escapeHtml(user.name));
            template = template.replace(/<!-- USER_SURNAME -->/g, () => escapeHtml(user.surname));
            template = template.replace(/<!-- USER_AGE -->/g, () => escapeHtml(user.age));
            template = template.replace(/<!-- USER_BIRTHDAY -->/g, () => escapeHtml(user.birthday));

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderNavigation(template, req));
        } catch (error) {
            // Fallback to inline HTML if template file is missing
            const content = `
                <h2>🎓 Mezun Profili: ${escapeHtml(user.name)} ${escapeHtml(user.surname)}</h2>
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
            renderHtmlPage(res, 200, `${escapeHtml(user.name)} ${escapeHtml(user.surname)}`, content);
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

        const user = await UserModel.getById(numericId, { includePending: req.session.role === 'admin' });
        if (!user) {
            return renderHtmlPage(res, 404, 'Not Found', `<h2>Kullanıcı Bulunamadı</h2><p>ID #${numericId} numaralı mezun bulunamadı.</p><a href="/users" class="btn">⬅️ Back</a>`);
        }

        try {
            let template = await readTemplate(USER_EDIT_VIEW_PATH);

            template = template.replace(/<!-- USER_ID -->/g, user.id);
            template = template.replace(/<!-- USER_NAME -->/g, () => escapeHtml(user.name));
            template = template.replace(/<!-- USER_SURNAME -->/g, () => escapeHtml(user.surname));
            template = template.replace(/<!-- USER_AGE -->/g, () => escapeHtml(user.age));
            template = template.replace(/<!-- USER_BIRTHDAY -->/g, () => escapeHtml(user.birthday));
            template = template.replace('<!-- ALERT_MESSAGE -->', '');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderNavigation(template, req));
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
            const result = await UserModel.update(numericId, body);

            if (!result.success) {
                if (result.notFound) {
                    return renderHtmlPage(res, 404, 'Not Found', `<h2>Kullanıcı Bulunamadı</h2><p>ID #${numericId} numaralı mezun bulunamadı.</p><a href="/users" class="btn">⬅️ Back</a>`);
                }

                // Validation error: re-render edit form with error
                const user = await UserModel.getById(numericId, { includePending: req.session.role === 'admin' });
                if (user) {
                    try {
                        let template = await readTemplate(USER_EDIT_VIEW_PATH);
                        const alertHtml = `<div class="alert alert-danger">⚠️ Güncelleme Başarısız: ${result.error}</div>`;

                        template = template.replace(/<!-- USER_ID -->/g, user.id);
                        template = template.replace(/<!-- USER_NAME -->/g, () => escapeHtml(body.name || user.name));
                        template = template.replace(/<!-- USER_SURNAME -->/g, () => escapeHtml(body.surname || user.surname));
                        template = template.replace(/<!-- USER_AGE -->/g, () => escapeHtml(body.age !== undefined ? body.age : user.age));
                        template = template.replace(/<!-- USER_BIRTHDAY -->/g, () => escapeHtml(body.birthday || user.birthday));
                        template = template.replace('<!-- ALERT_MESSAGE -->', alertHtml);

                        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                        return res.end(renderNavigation(template, req));
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
            const result = await UserModel.patch(numericId, body);

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

        const result = await UserModel.delete(numericId);
        if (!result.success) {
            return renderHtmlPage(res, result.notFound ? 404 : 400, 'Hata', `<p>${result.error}</p><a href="/users" class="btn">⬅️ Back</a>`);
        }

        res.writeHead(303, { 'Location': '/users?deleted=true' });
        res.end();
    }

    // Direct domain helper methods
    index(req, res) { return this.getAll(req, res); }
    show(req, res, id) { return this.getById(req, res, id); }

    async renderLogin(req, res, status = 200, message = '') {
        try {
            if (status === 200 && req.session.isLoggedIn) {
                res.writeHead(303, { Location: req.session.pendingAlumni ? '/profile' : workspace(req.session.role).path });
                return res.end();
            }
            const template = await readTemplate(path.join(__dirname, '..', 'views', 'login.html'));
            const registered = new URL(req.url, 'http://localhost').searchParams.get('registered') === 'true';
            const alert = message ? `<div class="alert-box alert-danger" role="alert">${escapeHtml(message)}</div>` :
                registered ? '<p role="status">Account created. Sign in to continue.</p>' : '';
            res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(renderNavigation(template.replace('<!-- ALERT_MESSAGE -->', () => alert), req));
        } catch (error) {
            errorHandler(req, res, error);
        }
    }

    async handleLogin(req, res) {
        try {
            const body = await parseRequestBody(req);
            if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' ||
                !body.email.trim() || !body.password || body.password.length > 256) {
                return this.renderLogin(req, res, 400, 'Enter a valid email address and password.');
            }
            const user = await UserModel.findByEmail(body.email);
            if (!user || user.status === 'inactive' || !UserModel.verifyPassword(body.password, user.password_hash)) {
                return this.renderLogin(req, res, 401, 'The email address or password is incorrect, or this account is inactive.');
            }
            session.start(req, res, user);
            res.writeHead(303, { Location: user.role === 'alumni' && user.alumni_verification === 'pending' ? '/profile' : workspace(user.role).path });
            res.end();
        } catch (error) {
            errorHandler(req, res, error);
        }
    }

    handleLogout(req, res) {
        session.end(req, res);
        res.writeHead(303, { Location: '/', 'Cache-Control': 'no-store' });
        res.end();
    }

    async workspace(req, res, role) {
        if (role) {
            if (!requireRole(req, res, role, 'admin')) return;
        }
        try {
            const user = await UserModel.getById(req.session.userId);
            if (!user) return this.handleLogout(req, res);
            const page = workspace(role || req.session.role);
            const template = await readTemplate(path.join(__dirname, '..', 'views', 'workspace.html'));
            const content = role
                ? `<p>${page.summary}</p><ul>${page.links.map(([url, label]) => `<li><a href="${url}">${label}</a></li>`).join('')}</ul>`
                : `<dl><dt>Email</dt><dd>${escapeHtml(user.email)}</dd><dt>City</dt><dd>${escapeHtml(user.city || '?')}</dd><dt>Birthday</dt><dd>${escapeHtml(user.birthday || '?')}</dd></dl>${req.session.pendingAlumni ? '<p>Your alumni registration is awaiting review.</p>' : `${user.role === 'alumni' && user.alumni_verification === 'approved' ? '<p>Alumni status verified.</p>' : ''}<a href="${page.path}">Open ${page.title}</a>`}`;
            const replacements = { TITLE: role ? page.title : 'My Profile', ROLE: page.label, NAME: req.session.name };
            const html = template.replace(/<!-- (TITLE|ROLE|NAME|CONTENT) -->/g, (_, key) =>
                key === 'CONTENT' ? content : escapeHtml(replacements[key]));
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(renderNavigation(html, req));
        } catch (error) {
            errorHandler(req, res, error);
        }
    }
}

const userControllerInstance = new UserController();
module.exports = userControllerInstance;
module.exports.UserController = UserController;
