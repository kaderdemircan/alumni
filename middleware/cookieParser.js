/**
 * Cookie Parser Middleware
 * Parses the Cookie header into req.cookies object.
 */
function cookieParser(req, res, next) {
    req.cookies = Object.create(null);
    const header = req.headers['cookie'];
    if (header) {
        header.split(';').forEach(pair => {
            const [rawKey, ...rest] = pair.split('=');
            const key = rawKey.trim();
            try { req.cookies[key] = decodeURIComponent(rest.join('=').trim()); } catch { /* Ignore malformed cookies. */ }
        });
    }
    if (next) next();
}

module.exports = cookieParser;
