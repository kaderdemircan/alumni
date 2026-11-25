function deny(req, res, status, message) {
    if (req.url.startsWith('/api/')) {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: message }));
    } else if (status === 401) {
        res.writeHead(303, { Location: '/login' });
        res.end();
    } else {
        res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(message);
    }
    return false;
}

function requireAuth(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    return req.session.isLoggedIn || deny(req, res, 401, 'Sign in to continue.');
}

function requireRole(req, res, ...roles) {
    return requireAuth(req, res) &&
        (roles.includes(req.session.role) || deny(req, res, 403, 'You do not have permission to access this resource.'));
}

function allowRequest(req, res) {
    const path = req.url.split('?')[0];
    const read = req.method === 'GET' || req.method === 'HEAD';
    if (!read && ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site'])) {
        return deny(req, res, 403, 'Cross-site requests are forbidden.');
    }
    if (/^\/admin(?:\/|$)/.test(path)) return requireRole(req, res, 'admin');
    if (/^\/(profile|student|alumni-hub|staff|logout)$/.test(path)) return requireAuth(req, res);
    const userApplications = path.match(/^\/api\/users\/(\d+)\/applications$/);
    if (userApplications) {
        if (!requireAuth(req, res)) return false;
        if (String(req.session.userId) === userApplications[1]) return true;
        return requireRole(req, res, 'admin');
    }
    if (/^\/api\/jobs\/\d+\/applications$/.test(path) && req.method === 'POST') return requireAuth(req, res);
    if (/^\/api\/(?:applications(?:\/|$)|jobs\/\d+\/applications$)/.test(path)) {
        return requireRole(req, res, 'admin');
    }
    if (/^\/(?:api\/)?users(?:\/|$)/.test(path) && read && !path.endsWith('/edit')) {
        return requireAuth(req, res);
    }
    if (/^\/(?:api\/)?(?:users|announcements|jobs|skills)(?:\/|$)/.test(path) &&
        (!read || path.endsWith('/edit'))) {
        return requireRole(req, res, 'admin');
    }
    return true;
}

module.exports = { requireAuth, requireRole, allowRequest };
