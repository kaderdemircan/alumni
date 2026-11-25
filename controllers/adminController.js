/**
 * Admin Controller
 * Handles all admin panel routes — requires 'admin' role.
 * Provides CRUD management for Users, Announcements, and Jobs.
 */

const UserModel = require('../models/userModel');
const Announcement = require('../models/announcementModel');
const Job = require('../models/jobPostingModel');
const Application = require('../models/jobApplicationModel');
const escapeHtml = require('../views/escapeHtml');

function redirect(res, path, result, action) {
    const query = result.success ? `${action}=true` : 'error=' + encodeURIComponent(result.error || 'The change could not be saved.');
    res.writeHead(303, { Location: path + '?' + query });
    res.end();
}

function errorAlert(req) {
    const error = new URL(req.url, 'http://localhost').searchParams.get('error');
    return error ? `<div class="alert alert-danger" role="alert">${escapeHtml(error)}</div>` : '';
}

function jobFields(body) {
    return {
        title: body.title, company_name: body.company, location: body.location,
        employment_type: body.type, deadline: body.deadline || null, description: body.description
    };
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', c => body += c.toString());
        req.on('end', () => {
            if (!body.trim()) return resolve({});
            const ct = req.headers['content-type'] || '';
            if (ct.includes('application/json')) {
                try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
            } else {
                const p = {};
                new URLSearchParams(body).forEach((v, k) => p[k] = v);
                resolve(p);
            }
        });
        req.on('error', reject);
    });
}

// ── Shared nav/style snippet injected into every admin page ──────────────────
const NAV_HTML = (activePage) => `
<style>
  :root{--ink:#111;--cream:#fffefc;--yellow:#fef08a;--slate:#b6ced5;--border:#efeeeb;--red:#e74c3c;--green:#27ae60;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',system-ui,sans-serif;background:#f4f5f7;color:#222;font-size:14px;}
  .admin-layout{display:flex;min-height:100vh;}
  /* Sidebar */
  .admin-sidebar{width:230px;background:var(--ink);color:#ccc;display:flex;flex-direction:column;flex-shrink:0;position:fixed;top:0;left:0;height:100vh;overflow-y:auto;z-index:200;}
  .sidebar-brand{padding:24px 20px 16px;border-bottom:1px solid #333;}
  .sidebar-brand .dot{width:10px;height:10px;background:var(--yellow);border-radius:50%;display:inline-block;margin-right:8px;}
  .sidebar-brand span{font-size:14px;font-weight:600;color:#fff;letter-spacing:-.2px;}
  .sidebar-brand small{display:block;font-size:11px;color:#888;margin-top:4px;padding-left:18px;}
  .sidebar-nav{flex:1;padding:12px 0;}
  .sidebar-nav a{display:flex;align-items:center;gap:10px;padding:10px 20px;color:#aaa;text-decoration:none;font-size:13px;transition:all .15s;}
  .sidebar-nav a:hover,.sidebar-nav a.active{background:#1a1a1a;color:#fff;}
  .sidebar-nav a.active{border-left:3px solid var(--yellow);color:var(--yellow);}
  .sidebar-nav .nav-icon{font-size:16px;width:20px;text-align:center;}
  .sidebar-section{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;padding:16px 20px 6px;}
  .sidebar-footer{padding:16px 20px;border-top:1px solid #222;}
  .sidebar-footer a{color:#888;text-decoration:none;font-size:12px;display:block;margin-bottom:6px;}
  .sidebar-footer a:hover{color:#fff;}
  /* Main area */
  .admin-main{margin-left:230px;flex:1;display:flex;flex-direction:column;}
  .admin-topbar{background:#fff;border-bottom:1px solid var(--border);padding:14px 28px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:100;}
  .admin-topbar h1{font-size:18px;font-weight:600;color:var(--ink);}
  .admin-topbar .topbar-right{display:flex;align-items:center;gap:12px;font-size:13px;color:#666;}
  .admin-content{padding:28px;flex:1;}
  /* Cards */
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
  .stat-card{background:#fff;border-radius:12px;padding:20px;border:1px solid var(--border);}
  .stat-card .stat-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:8px;}
  .stat-card .stat-value{font-size:36px;font-weight:300;color:var(--ink);line-height:1;}
  .stat-card .stat-sub{font-size:12px;color:#aaa;margin-top:6px;}
  /* Tables */
  .admin-table-wrap{background:#fff;border-radius:12px;border:1px solid var(--border);overflow:hidden;}
  .table-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}
  .table-header h2{font-size:15px;font-weight:600;color:var(--ink);}
  table{width:100%;border-collapse:collapse;}
  th{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#888;padding:12px 16px;text-align:left;background:#fafafa;border-bottom:1px solid var(--border);}
  td{padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:#fafef9;}
  /* Badges */
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;}
  .badge-admin{background:#111;color:#fef08a;}
  .badge-alumni{background:#b6ced5;color:#111;}
  .badge-student{background:#fef9e7;color:#111;border:1px solid #efeeeb;}
  .badge-staff{background:#fef08a;color:#111;}
  .badge-active{background:#d1fae5;color:#065f46;}
  .badge-inactive{background:#fee2e2;color:#991b1b;}
  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;border:none;transition:all .15s;}
  .btn-primary{background:var(--ink);color:#fff;}
  .btn-primary:hover{background:#333;}
  .btn-danger{background:#fee2e2;color:#991b1b;}
  .btn-danger:hover{background:#fecaca;}
  .btn-warning{background:#fef3c7;color:#92400e;}
  .btn-warning:hover{background:#fde68a;}
  .btn-success{background:#d1fae5;color:#065f46;}
  .btn-sm{padding:4px 10px;font-size:11px;}
  /* Forms */
  .form-card{background:#fff;border-radius:12px;border:1px solid var(--border);padding:24px;margin-bottom:20px;}
  .form-card h2{font-size:16px;font-weight:600;color:var(--ink);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border);}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
  .form-group{display:flex;flex-direction:column;gap:6px;}
  .form-group label{font-size:12px;font-weight:600;color:#444;}
  .form-group input,.form-group select,.form-group textarea{padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:#fafafa;outline:none;transition:border .15s;}
  .form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--ink);background:#fff;}
  /* Alert */
  .alert{padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:20px;}
  .alert-success{background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;}
  .alert-danger{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;}
  @media(max-width:900px){.stat-grid{grid-template-columns:1fr 1fr;}.admin-sidebar{display:none;}.admin-main{margin-left:0;}}
</style>
<div class="admin-layout">
  <aside class="admin-sidebar">
    <div class="sidebar-brand">
      <span><span class="dot"></span>Admin Panel</span>
      <small>Alumni Tracking System</small>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section">Overview</div>
      <a href="/admin" class="${activePage==='dashboard'?'active':''}"><span class="nav-icon">📊</span> Dashboard</a>
      <div class="sidebar-section">Manage</div>
      <a href="/admin/users" class="${activePage==='users'?'active':''}"><span class="nav-icon">👥</span> Users</a>
      <a href="/admin/announcements" class="${activePage==='announcements'?'active':''}"><span class="nav-icon">📢</span> Announcements</a>
      <a href="/admin/jobs" class="${activePage==='jobs'?'active':''}"><span class="nav-icon">💼</span> Jobs</a>
    </nav>
    <div class="sidebar-footer">
      <a href="/">← Back to Site</a>
      <form method="post" action="/logout"><button type="submit" class="btn btn-sm">Sign Out</button></form>
    </div>
  </aside>
  <div class="admin-main">
`;

const NAV_CLOSE = `</div></div>`;

// ── Topbar helper ─────────────────────────────────────────────────────────────
function topbar(title, session, extraHtml = '') {
    const role = session && session.role ? session.role : 'admin';
    const name = session && session.name ? session.name : 'Admin';
    return `
    <div class="admin-topbar">
      <h1>${title}</h1>
      <div class="topbar-right">
        ${extraHtml}
        <span>👤 ${escapeHtml(name)}</span>
        <span class="badge badge-admin">${role.toUpperCase()}</span>
      </div>
    </div>
    <div class="admin-content">`;
}

function sendPage(res, html) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin — Alumni</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet"></head><body>${html}</body></html>`);
}

// ═════════════════════════════════════════════════════════════════════════════
class AdminController {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    async dashboard(req, res) {
        const [users, announcements, jobs, apps] = await Promise.all([
            UserModel.getAll(), Announcement.getAll(), Job.getAll(), Application.getAll()
        ]);

        const roleCounts = Object.create(null);
        users.forEach(u => { roleCounts[u.role||'unknown'] = (roleCounts[u.role||'unknown']||0)+1; });

        const roleBreakdown = Object.entries(roleCounts)
            .map(([r,c]) => `<tr><td>${escapeHtml(r)}</td><td><strong>${c}</strong></td><td><div style="background:#fef08a;height:8px;border-radius:4px;width:${Math.round(c/users.length*100)}%"></div></td></tr>`)
            .join('');

        const recentUsers = users.slice(-5).reverse().map(u => `
            <tr>
                <td><strong>#${escapeHtml(u.id)}</strong></td>
                <td>${escapeHtml(u.name)} ${escapeHtml(u.surname)}</td>
                <td>${escapeHtml(u.email||'—')}</td>
                <td><span class="badge badge-${escapeHtml(u.role || 'alumni')}">${escapeHtml(u.role || 'alumni')}</span></td>
            </tr>`).join('');

        const html = NAV_HTML('dashboard') +
            topbar('Dashboard', req.session) + `
            <div class="stat-grid">
                <div class="stat-card"><div class="stat-label">Total Users</div><div class="stat-value">${users.length}</div><div class="stat-sub">all roles combined</div></div>
                <div class="stat-card"><div class="stat-label">Announcements</div><div class="stat-value">${announcements.length}</div><div class="stat-sub">published</div></div>
                <div class="stat-card"><div class="stat-label">Job Postings</div><div class="stat-value">${jobs.length}</div><div class="stat-sub">active listings</div></div>
                <div class="stat-card"><div class="stat-label">Applications</div><div class="stat-value">${apps.length}</div><div class="stat-sub">submitted</div></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div class="admin-table-wrap">
                <div class="table-header"><h2>Role Breakdown</h2></div>
                <table><thead><tr><th>Role</th><th>Count</th><th>Share</th></tr></thead>
                <tbody>${roleBreakdown}</tbody></table>
              </div>
              <div class="admin-table-wrap">
                <div class="table-header"><h2>Recent Registrations</h2></div>
                <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>${recentUsers}</tbody></table>
              </div>
            </div>
            </div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    // ── Users List ────────────────────────────────────────────────────────────
    async usersList(req, res) {
        const users = await UserModel.getAll();
        const url = req.url;
        let alert = '';
        if (url.includes('deleted=true')) alert = '<div class="alert alert-success">✅ User deleted successfully.</div>';
        if (url.includes('updated=true')) alert = '<div class="alert alert-success">✅ User updated successfully.</div>';
        if (url.includes('created=true')) alert = '<div class="alert alert-success">✅ User created successfully.</div>';

        const rows = users.map(u => `
            <tr>
                <td><strong>#${escapeHtml(u.id)}</strong></td>
                <td>${escapeHtml(u.name)} ${escapeHtml(u.surname)}</td>
                <td>${escapeHtml(u.email||'—')}</td>
                <td><span class="badge badge-${escapeHtml(u.role || 'alumni')}">${escapeHtml(u.role || 'alumni')}</span></td>
                <td>${escapeHtml(u.city||'—')}</td>
                <td><span class="badge badge-${escapeHtml(u.status||'active')}">${escapeHtml(u.status||'active')}</span></td>
                <td style="display:flex;gap:6px;align-items:center;">
                    <a href="/admin/users/${escapeHtml(u.id)}/edit" class="btn btn-warning btn-sm">✏️ Edit</a>
                    <form action="/admin/users/${escapeHtml(u.id)}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete #${escapeHtml(u.id)} ${escapeHtml(u.name)} ${escapeHtml(u.surname)}?')">
                        <button type="submit" class="btn btn-danger btn-sm">🗑️ Del</button>
                    </form>
                </td>
            </tr>`).join('');

        const html = NAV_HTML('users') +
            topbar('User Management', req.session, `<a href="/admin/users/new" class="btn btn-primary">+ New User</a>`) + `
            ${errorAlert(req) || alert}
            <div class="admin-table-wrap">
                <div class="table-header"><h2>All Users (${users.length})</h2>
                    <input oninput="filterTable(this,'usersTable')" placeholder="🔍 Search..." style="padding:7px 12px;border:1px solid #efeeeb;border-radius:8px;font-size:13px;width:220px;">
                </div>
                <table id="usersTable"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${rows}</tbody></table>
            </div>
            </div>
            <script>function filterTable(inp,id){const q=inp.value.toLowerCase();document.querySelectorAll('#'+id+' tbody tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';});}</script>` + NAV_CLOSE;
        sendPage(res, html);
    }

    // ── New User Form ─────────────────────────────────────────────────────────
    async usersNew(req, res) {
        const html = NAV_HTML('users') +
            topbar('Create User', req.session) + `
            <div class="form-card">
                <h2>➕ New User</h2>
                <form method="POST" action="/admin/users/new">
                    <div class="form-row">
                        <div class="form-group"><label>First Name *</label><input name="name" required placeholder="Kader"></div>
                        <div class="form-group"><label>Surname *</label><input name="surname" required placeholder="Demircan"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Email *</label><input type="email" name="email" required placeholder="user@email.com"></div>
                        <div class="form-group"><label>Password *</label><input type="password" name="password" required placeholder="min 6 chars" minlength="6"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Role</label>
                            <select name="role">
                                <option value="alumni">Alumni</option>
                                <option value="student">Student</option>
                                <option value="staff">University Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Status</label>
                            <select name="status"><option value="active">Active</option><option value="inactive">Inactive</option></select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>City</label><input name="city" placeholder="İstanbul"></div>
                        <div class="form-group"><label>Birthday</label><input type="date" name="birthday"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;"><label>Bio</label><textarea name="bio" rows="3" placeholder="Short bio..."></textarea></div>
                    <button type="submit" class="btn btn-primary">Create User →</button>
                    <a href="/admin/users" class="btn" style="background:#f4f5f7;color:#333;margin-left:8px;">Cancel</a>
                </form>
            </div>
            </div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    async usersCreate(req, res) {
        const result = await UserModel.register(await parseBody(req), { admin: true });
        redirect(res, result.success ? '/admin/users' : '/admin/users/new', result, 'created');
    }

    // ── Edit User ─────────────────────────────────────────────────────────────
    async usersEdit(req, res, id) {
        const user = await UserModel.getById(id);
        if (!user) { res.writeHead(302,{Location:'/admin/users'}); return res.end(); }

        const alert = errorAlert(req);

        const roleOpts = [...new Set(['student', 'alumni', 'staff', 'admin', user.role].filter(Boolean))]
            .map(r => `<option value="${escapeHtml(r)}" ${user.role===r?'selected':''}>${r === 'staff' ? 'University Staff' : escapeHtml(r.charAt(0).toUpperCase() + r.slice(1))}</option>`).join('');

        const html = NAV_HTML('users') +
            topbar(`Edit User #${escapeHtml(user.id)}`, req.session) + `
            ${alert}
            <div class="form-card">
                <h2>✏️ Edit — ${escapeHtml(user.name)} ${escapeHtml(user.surname)}</h2>
                <form method="POST" action="/admin/users/${escapeHtml(user.id)}/edit">
                    <div class="form-row">
                        <div class="form-group"><label>First Name</label><input name="name" value="${escapeHtml(user.name||'')}" required></div>
                        <div class="form-group"><label>Surname</label><input name="surname" value="${escapeHtml(user.surname||'')}" required></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Email</label><input type="email" name="email" value="${escapeHtml(user.email||'')}"></div>
                        <div class="form-group"><label>New Password <small style="color:#aaa">(leave blank to keep)</small></label><input type="password" name="password" placeholder="••••••••"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Role</label><select name="role">${roleOpts}</select></div>
                        <div class="form-group"><label>Status</label>
                            <select name="status">
                                <option value="active" ${user.status==='active'?'selected':''}>Active</option>
                                <option value="inactive" ${user.status==='inactive'?'selected':''}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>City</label><input name="city" value="${escapeHtml(user.city||'')}"></div>
                        <div class="form-group"><label>Birthday</label><input type="date" name="birthday" value="${escapeHtml(user.birthday||'')}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Age</label><input type="number" name="age" value="${escapeHtml(user.age ?? '')}"></div>
                        <div class="form-group"><label>Phone</label><input name="phone" value="${escapeHtml(user.phone||'')}"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;"><label>Bio</label><textarea name="bio" rows="3">${escapeHtml(user.bio||'')}</textarea></div>
                    <button type="submit" class="btn btn-primary">Save Changes →</button>
                    <a href="/admin/users" class="btn" style="background:#f4f5f7;color:#333;margin-left:8px;">Cancel</a>
                </form>
            </div>
            </div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    async usersUpdate(req, res, id) {
        const body = await parseBody(req);
        const user = await UserModel.getById(id);
        const editPage = `/admin/users/${id}/edit`;
        if (!user) return redirect(res, '/admin/users', { error: 'Account not found.' });
        if (!['student', 'alumni', 'staff', 'admin', user.role].includes(body.role) ||
            !['active', 'inactive'].includes(body.status) || !body.name?.trim() || !body.surname?.trim() ||
            (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) ||
            (body.age && (!Number.isInteger(Number(body.age)) || Number(body.age) < 0 || Number(body.age) > 120)) ||
            (body.password && (body.password.length < 6 || body.password.length > 256))) {
            return redirect(res, editPage, { error: 'Check the account details and try again.' });
        }
        if (Number(id) === req.session.userId && (body.role !== 'admin' || body.status !== 'active')) {
            return redirect(res, editPage, { error: 'Your own account must remain an active administrator.' });
        }
        const email = body.email?.trim().toLowerCase() || user.email;
        const existing = await UserModel.findByEmail(email);
        if (existing && existing.id !== user.id) {
            return redirect(res, editPage, { error: 'An account with this email address already exists.' });
        }
        const changes = {
            name: body.name.trim(), surname: body.surname.trim(), email,
            city: body.city, phone: body.phone, bio: body.bio, birthday: body.birthday || null,
            age: body.age ? Number(body.age) : null, role: body.role, status: body.status
        };
        if (body.password) changes.password_hash = UserModel.hashPassword(body.password);
        const success = await UserModel.updateAccount(id, changes);
        redirect(res, '/admin/users', { success }, 'updated');
    }

    async usersDelete(req, res, id) {
        const result = Number(id) === req.session.userId
            ? { error: 'You cannot delete your own administrator account.' }
            : await UserModel.delete(id);
        redirect(res, '/admin/users', result, 'deleted');
    }

    // ── Announcements ─────────────────────────────────────────────────────────
    async announcementsList(req, res) {
        const items = await Announcement.getAll();
        const url = req.url;
        let alert = '';
        if (url.includes('deleted=true')) alert = '<div class="alert alert-success">✅ Announcement deleted.</div>';
        if (url.includes('created=true')) alert = '<div class="alert alert-success">✅ Announcement created.</div>';
        if (url.includes('updated=true')) alert = '<div class="alert alert-success">✅ Announcement updated.</div>';

        const rows = items.map(a => `
            <tr>
                <td><strong>#${escapeHtml(a.id)}</strong></td>
                <td>${escapeHtml(a.title)}</td>
                <td>${escapeHtml(a.author||'—')}</td>
                <td>${escapeHtml(a.category||'—')}</td>
                <td><span class="badge" style="background:#fef9e7;color:#111;border:1px solid #efeeeb;">${escapeHtml(a.priority||'Normal')}</span></td>
                <td>${escapeHtml(a.date||'—')}</td>
                <td style="display:flex;gap:6px;">
                    <a href="/admin/announcements/${escapeHtml(a.id)}/edit" class="btn btn-warning btn-sm">✏️</a>
                    <form action="/admin/announcements/${escapeHtml(a.id)}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete this announcement?')">
                        <button class="btn btn-danger btn-sm">🗑️</button>
                    </form>
                </td>
            </tr>`).join('');

        const html = NAV_HTML('announcements') +
            topbar('Announcements', req.session, `<a href="/admin/announcements/new" class="btn btn-primary">+ New</a>`) + `
            ${errorAlert(req) || alert}
            <div class="admin-table-wrap">
                <div class="table-header"><h2>All Announcements (${items.length})</h2></div>
                <table><thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>${rows}</tbody></table>
            </div></div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    announcementsNew(req, res) {
        const html = NAV_HTML('announcements') +
            topbar('New Announcement', req.session) + `
            <div class="form-card">
                <h2>➕ New Announcement</h2>
                <form method="POST" action="/admin/announcements/new">
                    <div class="form-group" style="margin-bottom:16px;"><label>Title *</label><input name="title" required placeholder="Announcement title"></div>
                    <div class="form-row">
                        <div class="form-group"><label>Author</label><input name="author" placeholder="Rektörlük Ofisi"></div>
                        <div class="form-group"><label>Category</label>
                            <select name="category"><option>Events</option><option>Careers</option><option>Academic</option><option>General</option><option>Other</option></select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Priority</label>
                            <select name="priority"><option>Normal</option><option>Önemli</option><option>Acil</option></select>
                        </div>
                        <div class="form-group"><label>Date</label><input type="date" name="date" value="${new Date().toISOString().split('T')[0]}"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;"><label>Content *</label><textarea name="content" rows="5" required placeholder="Announcement content..."></textarea></div>
                    <button type="submit" class="btn btn-primary">Publish →</button>
                    <a href="/admin/announcements" class="btn" style="background:#f4f5f7;color:#333;margin-left:8px;">Cancel</a>
                </form>
            </div></div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    async announcementsCreate(req, res) {
        const body = await parseBody(req);
        redirect(res, '/admin/announcements', await Announcement.create(body), 'created');
    }

    async announcementsEdit(req, res, id) {
        const item = await Announcement.getById(id);
        if (!item) { res.writeHead(302,{Location:'/admin/announcements'}); return res.end(); }

        const html = NAV_HTML('announcements') +
            topbar(`Edit Announcement #${escapeHtml(item.id)}`, req.session) + `
            <div class="form-card">
                <h2>✏️ Edit Announcement</h2>
                <form method="POST" action="/admin/announcements/${escapeHtml(item.id)}/edit">
                    <div class="form-group" style="margin-bottom:16px;"><label>Title</label><input name="title" value="${escapeHtml(item.title||'')}" required></div>
                    <div class="form-row">
                        <div class="form-group"><label>Author</label><input name="author" value="${escapeHtml(item.author||'')}"></div>
                        <div class="form-group"><label>Category</label><input name="category" value="${escapeHtml(item.category||'')}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Priority</label><input name="priority" value="${escapeHtml(item.priority||'Normal')}"></div>
                        <div class="form-group"><label>Date</label><input type="date" name="date" value="${escapeHtml(item.date||'')}"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;"><label>Content</label><textarea name="content" rows="5">${escapeHtml(item.content||'')}</textarea></div>
                    <button type="submit" class="btn btn-primary">Save →</button>
                    <a href="/admin/announcements" class="btn" style="background:#f4f5f7;color:#333;margin-left:8px;">Cancel</a>
                </form>
            </div></div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    async announcementsUpdate(req, res, id) {
        const body = await parseBody(req);
        redirect(res, '/admin/announcements', await Announcement.patch(id, body), 'updated');
    }

    async announcementsDelete(req, res, id) {
        redirect(res, '/admin/announcements', await Announcement.delete(id), 'deleted');
    }

    // ── Jobs ──────────────────────────────────────────────────────────────────
    async jobsList(req, res) {
        const jobs = await Job.getAll();
        const url  = req.url;
        let alert  = '';
        if (url.includes('deleted=true')) alert = '<div class="alert alert-success">✅ Job deleted.</div>';
        if (url.includes('created=true')) alert = '<div class="alert alert-success">✅ Job created.</div>';
        if (url.includes('updated=true')) alert = '<div class="alert alert-success">✅ Job updated.</div>';

        const rows = jobs.map(j => `
            <tr>
                <td><strong>#${escapeHtml(j.id)}</strong></td>
                <td>${escapeHtml(j.title||j.job_title||'—')}</td>
                <td>${escapeHtml(j.company||j.company_name||'—')}</td>
                <td>${escapeHtml(j.location||'—')}</td>
                <td><span class="badge badge-${j.employment_type==='full-time'?'active':'student'}">${escapeHtml(j.type||j.job_type||'—')}</span></td>
                <td>${escapeHtml(j.deadline||j.application_deadline||'—')}</td>
                <td style="display:flex;gap:6px;">
                    <a href="/admin/jobs/${escapeHtml(j.id)}/edit" class="btn btn-warning btn-sm">✏️</a>
                    <form action="/admin/jobs/${escapeHtml(j.id)}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Delete this job?')">
                        <button class="btn btn-danger btn-sm">🗑️</button>
                    </form>
                </td>
            </tr>`).join('');

        const html = NAV_HTML('jobs') +
            topbar('Job Postings', req.session, `<a href="/admin/jobs/new" class="btn btn-primary">+ New Job</a>`) + `
            ${errorAlert(req) || alert}
            <div class="admin-table-wrap">
                <div class="table-header"><h2>All Jobs (${jobs.length})</h2></div>
                <table><thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Location</th><th>Type</th><th>Deadline</th><th>Actions</th></tr></thead>
                <tbody>${rows}</tbody></table>
            </div></div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    jobsNew(req, res) {
        const html = NAV_HTML('jobs') +
            topbar('New Job Posting', req.session) + `
            <div class="form-card">
                <h2>➕ New Job Posting</h2>
                <form method="POST" action="/admin/jobs/new">
                    <div class="form-row">
                        <div class="form-group"><label>Job Title *</label><input name="title" required placeholder="Software Engineer"></div>
                        <div class="form-group"><label>Company *</label><input name="company" required placeholder="ACME Corp"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Location</label><input name="location" required placeholder="Istanbul / Remote"></div>
                        <div class="form-group"><label>Type</label>
                            <select name="type"><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="internship">Internship</option><option value="contract">Contract</option></select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Deadline</label><input type="date" name="deadline"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;"><label>Description</label><textarea name="description" rows="4" required placeholder="Job description..."></textarea></div>
                    <button type="submit" class="btn btn-primary">Post Job →</button>
                    <a href="/admin/jobs" class="btn" style="background:#f4f5f7;color:#333;margin-left:8px;">Cancel</a>
                </form>
            </div></div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    async jobsCreate(req, res) {
        const body = await parseBody(req);
        redirect(res, '/admin/jobs', await Job.create(jobFields(body)), 'created');
    }

    async jobsEdit(req, res, id) {
        const job = await Job.getById(id);
        if (!job) { res.writeHead(302,{Location:'/admin/jobs'}); return res.end(); }

        const html = NAV_HTML('jobs') +
            topbar(`Edit Job #${escapeHtml(job.id)}`, req.session) + `
            <div class="form-card">
                <h2>✏️ Edit Job</h2>
                <form method="POST" action="/admin/jobs/${escapeHtml(job.id)}/edit">
                    <div class="form-row">
                        <div class="form-group"><label>Title</label><input name="title" value="${escapeHtml(job.title||job.job_title||'')}"></div>
                        <div class="form-group"><label>Company</label><input name="company" value="${escapeHtml(job.company||job.company_name||'')}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Location</label><input name="location" value="${escapeHtml(job.location||'')}"></div>
                        <div class="form-group"><label>Type</label><input name="type" value="${escapeHtml(job.employment_type||'')}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Deadline</label><input type="date" name="deadline" value="${escapeHtml(job.deadline||job.application_deadline||'')}"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:20px;"><label>Description</label><textarea name="description" rows="4" required>${escapeHtml(job.description||'')}</textarea></div>
                    <button type="submit" class="btn btn-primary">Save →</button>
                    <a href="/admin/jobs" class="btn" style="background:#f4f5f7;color:#333;margin-left:8px;">Cancel</a>
                </form>
            </div></div>` + NAV_CLOSE;
        sendPage(res, html);
    }

    async jobsUpdate(req, res, id) {
        const body = await parseBody(req);
        redirect(res, '/admin/jobs', await Job.patch(id, jobFields(body)), 'updated');
    }

    async jobsDelete(req, res, id) {
        redirect(res, '/admin/jobs', await Job.delete(id), 'deleted');
    }
}

const adminController = new AdminController();
module.exports = adminController;
