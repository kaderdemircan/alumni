const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// ── Route Map: clean URL → HTML file path ──
const ROUTE_MAP = {
    '/':                        'index.html',
    '/about':                   'about.html',
    '/users':                   'views/users.html',
    '/announcements':           'views/announcements.html',
    '/jobs':                    'views/jobs.html',
    '/mentorship':              'views/mentorship.html',
    '/api/swagger':             'swagger.html',
};

// ── Dynamic route patterns: regex → file path ──
const DYNAMIC_ROUTES = [
    { pattern: /^\/users\/(\d+)\/edit$/, file: 'views/user-edit.html' },
    { pattern: /^\/users\/(\d+)$/,       file: 'views/user-detail.html' },
    { pattern: /^\/announcements\/(\d+)\/edit$/, file: 'views/announcement-edit.html' },
    { pattern: /^\/announcements\/(\d+)$/,       file: 'views/announcement-detail.html' },
    { pattern: /^\/jobs\/(\d+)$/,        file: 'views/job-detail.html' },
];

// ── MIME type lookup ──
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
};

function getMime(filePath) {
    return MIME[path.extname(filePath).toLowerCase()] || 'text/plain';
}

function serveFile(res, filePath, statusCode = 200) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end('Error loading file');
        }
        res.writeHead(statusCode, { 'Content-Type': getMime(filePath) });
        res.end(content);
    });
}

const server = http.createServer((req, res) => {
    const cleanUrl = req.url.split('?')[0];

    // 1. Check static route map first
    if (ROUTE_MAP[cleanUrl]) {
        return serveFile(res, path.join(__dirname, ROUTE_MAP[cleanUrl]));
    }

    // 2. Check dynamic route patterns
    for (const route of DYNAMIC_ROUTES) {
        if (route.pattern.test(cleanUrl)) {
            return serveFile(res, path.join(__dirname, route.file));
        }
    }

    // 3. Try serving static files (css, js, images, etc.)
    const staticPath = path.join(__dirname, cleanUrl);
    if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
        return serveFile(res, staticPath);
    }

    // 4. API endpoints — simple proxies for preview
    if (cleanUrl === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', mode: 'preview', timestamp: new Date().toISOString() }));
    }

    if (cleanUrl === '/api/swagger.json') {
        const swaggerPath = path.join(__dirname, 'swagger.json');
        if (fs.existsSync(swaggerPath)) {
            return serveFile(res, swaggerPath);
        }
    }

    // 5. 404 fallback
    const notFoundPath = path.join(__dirname, 'views', '404.html');
    if (fs.existsSync(notFoundPath)) {
        fs.readFile(notFoundPath, 'utf8', (err, template) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                return res.end('404 Not Found');
            }
            let html = template.replace('<!-- ERROR_REASON -->', 
                'The page you requested does not exist or has been moved. Use the navigation above to find what you need.');
            html = html.replace(/<!-- REQUESTED_URL -->/g, cleanUrl);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Preview server running at http://localhost:${PORT}`);
    console.log('Routes:');
    Object.keys(ROUTE_MAP).forEach(r => console.log(`  ${r} → ${ROUTE_MAP[r]}`));
    DYNAMIC_ROUTES.forEach(r => console.log(`  ${r.pattern} → ${r.file}`));
});
