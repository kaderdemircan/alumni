/**
 * Admin Routes
 * All routes under /admin — requires 'admin' role.
 */

const adminController = require('../controllers/adminController');
async function handleAdminRoutes(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;
    if (!/^\/admin(?:\/|$)/.test(url)) return false;
    res.setHeader('Cache-Control', 'no-store');

    // Dashboard
    if (method === 'GET' && (url === '/admin' || url === '/admin/')) {
        await adminController.dashboard(req, res); return true;
    }

    if (url === '/admin/alumni-review' && method === 'GET') {
        await adminController.alumniReview(req, res); return true;
    }
    const review = url.match(/^\/admin\/alumni-review\/(\d+)\/(approve|delete)$/);
    if (review && method === 'POST') {
        await adminController.reviewAlumnus(req, res, review[1], review[2]); return true;
    }
    if (url === '/admin/profile' && method === 'GET') {
        await adminController.profile(req, res); return true;
    }
    if (url === '/admin/settings' && method === 'GET') {
        adminController.settings(req, res); return true;
    }
    if (url === '/admin/settings' && method === 'POST') {
        await adminController.saveSettings(req, res); return true;
    }

    // ── Users
    if (url === '/admin/users' && method === 'GET') { await adminController.usersList(req, res); return true; }
    if (url === '/admin/users/new' && method === 'GET') { await adminController.usersNew(req, res); return true; }
    if (url === '/admin/users/new' && method === 'POST') { await adminController.usersCreate(req, res); return true; }
    const userEditGet = url.match(/^\/admin\/users\/(\d+)\/edit$/);
    if (userEditGet && method === 'GET') { await adminController.usersEdit(req, res, userEditGet[1]); return true; }
    if (userEditGet && method === 'POST') { await adminController.usersUpdate(req, res, userEditGet[1]); return true; }
    const userDelete = url.match(/^\/admin\/users\/(\d+)\/delete$/);
    if (userDelete && method === 'POST') { await adminController.usersDelete(req, res, userDelete[1]); return true; }

    // ── Announcements
    if (url === '/admin/announcements' && method === 'GET') { await adminController.announcementsList(req, res); return true; }
    if (url === '/admin/announcements/new' && method === 'GET') { await adminController.announcementsNew(req, res); return true; }
    if (url === '/admin/announcements/new' && method === 'POST') { await adminController.announcementsCreate(req, res); return true; }
    const annEditGet = url.match(/^\/admin\/announcements\/(\d+)\/edit$/);
    if (annEditGet && method === 'GET') { await adminController.announcementsEdit(req, res, annEditGet[1]); return true; }
    if (annEditGet && method === 'POST') { await adminController.announcementsUpdate(req, res, annEditGet[1]); return true; }
    const annDelete = url.match(/^\/admin\/announcements\/(\d+)\/delete$/);
    if (annDelete && method === 'POST') { await adminController.announcementsDelete(req, res, annDelete[1]); return true; }

    // ── Jobs
    if (url === '/admin/jobs' && method === 'GET') { await adminController.jobsList(req, res); return true; }
    if (url === '/admin/jobs/new' && method === 'GET') { await adminController.jobsNew(req, res); return true; }
    if (url === '/admin/jobs/new' && method === 'POST') { await adminController.jobsCreate(req, res); return true; }
    const jobEditGet = url.match(/^\/admin\/jobs\/(\d+)\/edit$/);
    if (jobEditGet && method === 'GET') { await adminController.jobsEdit(req, res, jobEditGet[1]); return true; }
    if (jobEditGet && method === 'POST') { await adminController.jobsUpdate(req, res, jobEditGet[1]); return true; }
    const jobDelete = url.match(/^\/admin\/jobs\/(\d+)\/delete$/);
    if (jobDelete && method === 'POST') { await adminController.jobsDelete(req, res, jobDelete[1]); return true; }

    return false;
}

module.exports = handleAdminRoutes;
