/**
 * Error Logger Middleware
 *
 * Writes all error-level HTTP responses (4xx, 5xx) to logs/error.log.
 * Also provides a manual logError() function for explicit error logging.
 *
 * Log format:
 * [ISO_TIMESTAMP] STATUS | METHOD URL | Error: MESSAGE | UA: user-agent | IP: ip
 * ---
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');

// Ensure the logs directory exists on startup
function ensureLogsDir() {
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
}

ensureLogsDir();

/**
 * Write a formatted error entry to logs/error.log.
 *
 * @param {import('http').IncomingMessage} req
 * @param {Error|string|null} error
 * @param {number} statusCode
 */
function logError(req, error, statusCode) {
    try {
        ensureLogsDir();

        const timestamp = new Date().toISOString();
        const method = req.method || 'UNKNOWN';
        const url = req.url || '/';
        const userAgent = req.headers['user-agent'] || '-';
        const ip = req.headers['x-forwarded-for'] ||
                   req.socket?.remoteAddress ||
                   req.connection?.remoteAddress ||
                   '-';

        const errorMessage = error instanceof Error
            ? error.message
            : (typeof error === 'string' ? error : `HTTP ${statusCode}`);

        const entry = [
            `[${timestamp}] ${statusCode} | ${method} ${url}`,
            `Error: ${errorMessage}`,
            `UA: ${userAgent}`,
            `IP: ${ip}`,
            '---',
            '',
        ].join('\n');

        fs.appendFileSync(ERROR_LOG_PATH, entry, 'utf8');
    } catch (writeErr) {
        // Never let logging crash the server
        console.error('[ErrorLogger] Failed to write to error.log:', writeErr.message);
    }
}

/**
 * Request error logger middleware.
 * Hooks into the response lifecycle and auto-logs any 4xx/5xx responses.
 *
 * Call this at the start of each request (alongside loggerMiddleware) in server.js.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function errorLoggerMiddleware(req, res) {
    const originalWriteHead = res.writeHead.bind(res);
    let capturedStatusCode = 200;

    // Intercept writeHead to capture the status code
    res.writeHead = function (statusCode, ...args) {
        capturedStatusCode = statusCode;
        return originalWriteHead(statusCode, ...args);
    };

    // Intercept res.end to log error responses after the response is sent
    const originalEnd = res.end.bind(res);

    res.end = function (...args) {
        if (capturedStatusCode >= 400) {
            logError(req, `HTTP ${capturedStatusCode}`, capturedStatusCode);
        }
        return originalEnd(...args);
    };
}

module.exports = { logError, errorLoggerMiddleware };
