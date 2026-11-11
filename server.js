const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env if present (zero-dependency)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const firstEq = trimmed.indexOf('=');
                if (firstEq > 0) {
                    const key = trimmed.slice(0, firstEq).trim();
                    const value = trimmed.slice(firstEq + 1).trim();
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
        });
    } catch (e) {
        console.warn('Could not read .env file:', e.message);
    }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Initialize Database connection & verify tables
const db = require('./config/db');
db.initDb().catch(err => console.warn('Database init note:', err.message));

// ── Middleware ────────────────────────────────────────────────────────────────
const loggerMiddleware          = require('./middleware/logger');
const { errorLoggerMiddleware } = require('./middleware/errorLogger');
const notFoundHandler           = require('./middleware/notFoundHandler');
const errorHandler              = require('./middleware/errorHandler');

// ── MVC Routers ───────────────────────────────────────────────────────────────
const handleApiUserRoutes           = require('./routes/apiUserRoutes');
const handleUserRoutes              = require('./routes/userRoutes');
const handleApiAnnouncementRoutes   = require('./routes/apiAnnouncementRoutes');
const handleAnnouncementRoutes      = require('./routes/announcementRoutes');
const handleApiJobRoutes            = require('./routes/apiJobRoutes');
const handleApiJobApplicationRoutes = require('./routes/apiJobApplicationRoutes');
const handleApiSkillRoutes          = require('./routes/apiSkillRoutes');

// ── Server ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    // 1. Apply middleware to every request
    loggerMiddleware(req, res);        // terminal logging (color-coded)
    errorLoggerMiddleware(req, res);   // auto-log 4xx/5xx to logs/error.log

    try {
        // ── Static Pages ─────────────────────────────────────────────────────
        if (req.url === '/') {
            return fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                if (err) return errorHandler(req, res, err, 500);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            });
        }

        if (req.url === '/about') {
            return fs.readFile(path.join(__dirname, 'about.html'), (err, content) => {
                if (err) return errorHandler(req, res, err, 500);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            });
        }

        // ── Legacy route kept for backwards compatibility ─────────────────────
        if (req.url === '/alumni' && (req.method === 'GET' || req.method === 'POST')) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end('ok');
        }

        // ── Swagger ───────────────────────────────────────────────────────────
        if (req.url === '/api/swagger' && req.method === 'GET') {
            return fs.readFile(path.join(__dirname, 'swagger.html'), (err, content) => {
                if (err) return errorHandler(req, res, err, 500);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            });
        }

        if (req.url === '/api/swagger.json' && req.method === 'GET') {
            return fs.readFile(path.join(__dirname, 'swagger.json'), (err, content) => {
                if (err) return errorHandler(req, res, err, 500);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(content);
            });
        }

        // ── Health check ──────────────────────────────────────────────────────
        if (req.url === '/api/health' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        }

        // ── MVC Route Handlers (API and Web UI) ───────────────────────────────
        if (handleApiUserRoutes(req, res))           return;
        if (handleUserRoutes(req, res))              return;
        if (handleApiJobRoutes(req, res))            return;
        if (handleApiJobApplicationRoutes(req, res)) return;
        if (handleApiSkillRoutes(req, res))          return;
        if (handleApiAnnouncementRoutes(req, res))   return;
        if (handleAnnouncementRoutes(req, res))      return;

        // ── Utility Routes ────────────────────────────────────────────────────
        if (req.url === '/hello') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end('hello world!');
        }

        if (req.url.startsWith('/hello/')) {
            const name = decodeURIComponent(req.url.slice(7));
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`Hello, ${name}!`);
        }

        if (req.url.startsWith('/sum/')) {
            const parts = req.url.split('/');
            if (parts.length === 4) {
                const num1 = parseFloat(parts[2]);
                const num2 = parseFloat(parts[3]);
                if (!isNaN(num1) && !isNaN(num2)) {
                    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                    return res.end((num1 + num2).toString());
                }
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                return res.end('Error: Please provide two valid numbers.');
            }
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Invalid format. Example: /sum/5/10');
        }

        // ── Generic 404 — catches all unmatched routes ────────────────────────
        notFoundHandler(req, res);

    } catch (err) {
        // ── Catch-all 500 handler ─────────────────────────────────────────────
        console.error('[Server] Unhandled error:', err);
        errorHandler(req, res, err, 500);
    }
});

server.listen(PORT, () => {
    console.log('\x1b[32m✔\x1b[0m Server started successfully!');
    console.log(`\x1b[36m→\x1b[0m http://localhost:${PORT}`);
    console.log(`\x1b[36m→\x1b[0m http://localhost:${PORT}/users`);
    console.log(`\x1b[36m→\x1b[0m http://localhost:${PORT}/api/swagger`);
});
