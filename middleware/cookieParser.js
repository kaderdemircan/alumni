/**
 * Cookie Parser Middleware
 * Parses the Cookie header into req.cookies object.
 */
function cookieParser(req, res, next) {
    req.cookies = {};
    const header = req.headers['cookie'];
    if (header) {
        header.split(';').forEach(pair => {
            const [rawKey, ...rest] = pair.split('=');
            const key = rawKey.trim();
            const value = decodeURIComponent(rest.join('=').trim());
            req.cookies[key] = value;
        });
    }
    if (next) next();
}

module.exports = cookieParser;
