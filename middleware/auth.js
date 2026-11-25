/**
 * Auth Middleware
 * Protects routes that require the user to be logged in.
 * Usage: authMiddleware(req, res, next)
 * 
 * Role-based helpers:
 *   requireAuth       — any logged-in user
 *   requireRole(roles) — specific role(s): 'student' | 'alumni' | 'staff'
 */

function requireAuth(req, res, next) {
    if (!req.session || !req.session.isLoggedIn) {
        res.writeHead(302, { Location: '/login?redirect=' + encodeURIComponent(req.url) });
        return res.end();
    }
    if (next) next();
}

function requireRole(allowedRoles) {
    return function(req, res, next) {
        if (!req.session || !req.session.isLoggedIn) {
            res.writeHead(302, { Location: '/login?redirect=' + encodeURIComponent(req.url) });
            return res.end();
        }
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(req.session.role)) {
            res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`
                <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Access Denied</title>
                <style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f8f9fa;}
                .box{text-align:center;padding:2rem;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.08);}
                </style></head><body><div class="box">
                <h2>🚫 Access Denied</h2>
                <p>Your role (<strong>${req.session.role}</strong>) does not have permission to view this page.</p>
                <p>Required role(s): <strong>${roles.join(', ')}</strong></p>
                <a href="/">← Go Home</a>
                </div></body></html>`);
        }
        if (next) next();
    };
}

module.exports = { requireAuth, requireRole };
