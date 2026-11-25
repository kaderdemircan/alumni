/**
 * Admin Routes
 * All routes under /admin — requires 'admin' role.
 */

const adminController = require('../controllers/adminController');
const { requireRole }  = require('../middleware/auth');

function handleAdminRoutes(req, res) {
    const url    = req.url.split('?')[0];
    const method = req.method;

    // Only match /admin routes
    if (!url.startsWith('/admin')) return false;

    // Auth guard — must be admin
    let blocked = false;
    requireRole('admin')(req, res, () => { blocked = false; });
    // Check synchronously via req.session
    if (!req.session || !req.session.isLoggedIn) {
        res.writeHead(302, { Location: '/login?redirect=' + encodeURIComponent(req.url) });
        res.end();
        return true;
    }
    if (req.session.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f4f5f7;">
            <div style="text-align:center;background:#fff;padding:2rem 3rem;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.08);">
            <h2>🚫 Access Denied</h2><p>Admin role required. Your role: <strong>${req.session.role}</strong></p>
            <a href="/" style="color:#111;font-weight:600;">← Go Home</a></div></body></html>`);
        return true;
    }

    // ── Dashboard
    if (url === '/admin' || url === '/admin/') {
        adminController.dashboard(req, res); return true;
    }

    // ── Users
    if (url === '/admin/users' && method === 'GET') { adminController.usersList(req, res); return true; }
    if (url === '/admin/users/new' && method === 'GET') { adminController.usersNew(req, res); return true; }
    if (url === '/admin/users/new' && method === 'POST') { adminController.usersCreate(req, res); return true; }
    const userEditGet = url.match(/^\/admin\/users\/(\d+)\/edit$/);
    if (userEditGet && method === 'GET') { adminController.usersEdit(req, res, userEditGet[1]); return true; }
    if (userEditGet && method === 'POST') { adminController.usersUpdate(req, res, userEditGet[1]); return true; }
    const userDelete = url.match(/^\/admin\/users\/(\d+)\/delete$/);
    if (userDelete && method === 'POST') { adminController.usersDelete(req, res, userDelete[1]); return true; }

    // ── Announcements
    if (url === '/admin/announcements' && method === 'GET') { adminController.announcementsList(req, res); return true; }
    if (url === '/admin/announcements/new' && method === 'GET') { adminController.announcementsNew(req, res); return true; }
    if (url === '/admin/announcements/new' && method === 'POST') { adminController.announcementsCreate(req, res); return true; }
    const annEditGet = url.match(/^\/admin\/announcements\/(\d+)\/edit$/);
    if (annEditGet && method === 'GET') { adminController.announcementsEdit(req, res, annEditGet[1]); return true; }
    if (annEditGet && method === 'POST') { adminController.announcementsUpdate(req, res, annEditGet[1]); return true; }
    const annDelete = url.match(/^\/admin\/announcements\/(\d+)\/delete$/);
    if (annDelete && method === 'POST') { adminController.announcementsDelete(req, res, annDelete[1]); return true; }

    // ── Jobs
    if (url === '/admin/jobs' && method === 'GET') { adminController.jobsList(req, res); return true; }
    if (url === '/admin/jobs/new' && method === 'GET') { adminController.jobsNew(req, res); return true; }
    if (url === '/admin/jobs/new' && method === 'POST') { adminController.jobsCreate(req, res); return true; }
    const jobEditGet = url.match(/^\/admin\/jobs\/(\d+)\/edit$/);
    if (jobEditGet && method === 'GET') { adminController.jobsEdit(req, res, jobEditGet[1]); return true; }
    if (jobEditGet && method === 'POST') { adminController.jobsUpdate(req, res, jobEditGet[1]); return true; }
    const jobDelete = url.match(/^\/admin\/jobs\/(\d+)\/delete$/);
    if (jobDelete && method === 'POST') { adminController.jobsDelete(req, res, jobDelete[1]); return true; }

    return false;
}

module.exports = handleAdminRoutes;
