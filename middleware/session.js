const crypto = require('crypto');
const User = require('../models/userModel');
const { workspace } = require('../config/roles');
const parseCookies = require('./cookieParser');

const sessions = new Map();
const lifetime = 86400;
const cookie = 'alumni_session';
const cleanup = setInterval(() => {
    for (const [token, session] of sessions) {
        if (session.expires <= Date.now()) sessions.delete(token);
    }
}, 60000);
cleanup.unref();

function setCookie(req, res, token, maxAge) {
    const secure = req.socket.encrypted || process.env.SESSION_COOKIE_SECURE === 'true';
    res.setHeader('Set-Cookie', `${cookie}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`);
}

async function sessionMiddleware(req, res) {
    parseCookies(req, res);
    req.session = { isLoggedIn: false };
    const token = req.cookies[cookie];
    const stored = sessions.get(token);
    if (!stored) return;
    if (stored.expires <= Date.now()) {
        sessions.delete(token);
        return;
    }

    const user = await User.findByEmail(stored.email);
    if (!user || user.id !== stored.userId || user.status === 'inactive' || user.password_hash !== stored.passwordHash) {
        sessions.delete(token);
        return;
    }
    req.session = {
        isLoggedIn: true,
        userId: user.id,
        role: workspace(user.role).role,
        pendingAlumni: user.role === 'alumni' && user.alumni_verification === 'pending',
        adminLanguage: user.admin_language,
        adminTheme: user.admin_theme,
        name: `${user.name} ${user.surname}`
    };
}

sessionMiddleware.start = (req, res, user) => {
    sessions.delete(req.cookies[cookie]);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
        userId: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        expires: Date.now() + lifetime * 1000
    });
    setCookie(req, res, token, lifetime);
};

sessionMiddleware.end = (req, res) => {
    sessions.delete(req.cookies[cookie]);
    setCookie(req, res, '', 0);
};

module.exports = sessionMiddleware;
