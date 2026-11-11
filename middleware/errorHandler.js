/**
 * Error Handler Middleware (5xx Guardian)
 *
 * Serves a themed 5xx error page (or JSON) when an internal server error occurs.
 * Sanitizes error messages to avoid leaking stack traces in production.
 */

const fs = require('fs');
const path = require('path');

const ERROR_VIEW = path.join(__dirname, '..', 'views', '5xx.html');

/**
 * Sanitize error messages — only expose the top-level message, never the stack trace.
 * @param {Error|string|unknown} error
 * @param {number} statusCode
 * @returns {string}
 */
function sanitizeErrorMessage(error, statusCode) {
    const defaultMessages = {
        500: 'An unexpected internal server error occurred. Please try again later.',
        502: 'Bad Gateway — the server received an invalid response from an upstream server.',
        503: 'Service Unavailable — the server is temporarily unable to handle the request.',
        504: 'Gateway Timeout — the upstream server did not respond in time.',
    };

    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        return error.message || defaultMessages[statusCode] || 'An unexpected error occurred.';
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return defaultMessages[statusCode] || 'An unexpected error occurred. Please try again later.';
}

/**
 * 5xx Guardian Middleware — handles all server-side errors.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {Error|string|unknown} error  - The error that was thrown
 * @param {number} [statusCode=500]     - HTTP status code (500, 502, 503, etc.)
 */
function errorHandler(req, res, error, statusCode = 500) {
    const url = req.url || '/';
    const code = statusCode >= 500 ? statusCode : 500;
    const message = sanitizeErrorMessage(error, code);
    const isApiRequest =
        url.startsWith('/api/') ||
        (req.headers['accept'] && req.headers['accept'].includes('application/json'));

    // Return JSON for API consumers
    if (isApiRequest) {
        if (!res.headersSent) {
            res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
        }
        return res.end(JSON.stringify({
            error: 'Internal Server Error',
            message: message,
            path: url,
            statusCode: code,
        }));
    }

    // Serve the themed HTML 5xx page
    fs.readFile(ERROR_VIEW, 'utf8', (err, template) => {
        if (err) {
            // Fallback if template cannot be loaded
            if (!res.headersSent) {
                res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
            }
            return res.end(`${code} Internal Server Error\n${message}\nRequested: ${url}`);
        }

        let html = template.replace(/<!-- ERROR_CODE -->/g, code);
        html = html.replace('<!-- ERROR_REASON -->', message);
        html = html.replace(/<!-- REQUESTED_URL -->/g, url);

        if (!res.headersSent) {
            res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
        }
        res.end(html);
    });
}

module.exports = errorHandler;
