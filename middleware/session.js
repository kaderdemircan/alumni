/**
 * Session Middleware
 * Reads the signed userId cookie and attaches req.session = { userId, role, name }
 * This is a lightweight session system using HttpOnly cookies.
 */
const cookieParser = require('./cookieParser');

function sessionMiddleware(req, res, next) {
    cookieParser(req, res);
    const userId = req.cookies['userId'] || null;
    const role   = req.cookies['userRole'] || null;
    const name   = req.cookies['userName'] ? decodeURIComponent(req.cookies['userName']) : null;
    req.session  = { userId, role, name, isLoggedIn: !!userId };
    if (next) next();
}

module.exports = sessionMiddleware;
