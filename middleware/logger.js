/**
 * Logger Middleware
 * 
 * Logs all incoming HTTP requests to the terminal with color-coded output.
 * Format: [TIMESTAMP] METHOD URL STATUS_CODE RESPONSE_TIME - USER_AGENT
 * 
 * Colors:
 *   Green  (2xx) - Successful responses
 *   Yellow (3xx) - Redirects
 *   Red    (4xx) - Client errors
 *   Magenta(5xx) - Server errors
 */

// ANSI color codes for terminal output
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
};

/**
 * Get the color code based on HTTP status code
 * @param {number} statusCode
 * @returns {string} ANSI color code
 */
function getStatusColor(statusCode) {
    if (statusCode >= 500) return COLORS.magenta;
    if (statusCode >= 400) return COLORS.red;
    if (statusCode >= 300) return COLORS.yellow;
    if (statusCode >= 200) return COLORS.green;
    return COLORS.reset;
}

/**
 * Get formatted timestamp string
 * @returns {string} Formatted timestamp [YYYY-MM-DD HH:MM:SS]
 */
function getTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * Logger middleware - hooks into the request/response lifecycle to log all requests.
 * Call this at the start of each request handler in server.js.
 * 
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function loggerMiddleware(req, res) {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || '-';

    // Store original writeHead to capture status code
    const originalWriteHead = res.writeHead.bind(res);
    let statusCode = 200;

    res.writeHead = function (code, ...args) {
        statusCode = code;
        return originalWriteHead(code, ...args);
    };

    // Store original end to log after response is sent
    const originalEnd = res.end.bind(res);

    res.end = function (...args) {
        const duration = Date.now() - startTime;
        const color = getStatusColor(statusCode);
        const timestamp = getTimestamp();

        const methodStr = `${COLORS.bold}${method.padEnd(7)}${COLORS.reset}`;
        const urlStr = url;
        const statusStr = `${color}${statusCode}${COLORS.reset}`;
        const durationStr = `${COLORS.gray}${duration}ms${COLORS.reset}`;
        const agentStr = `${COLORS.gray}${userAgent.substring(0, 80)}${COLORS.reset}`;

        console.log(`${COLORS.cyan}[${timestamp}]${COLORS.reset} ${methodStr} ${urlStr} ${statusStr} ${durationStr} - ${agentStr}`);

        return originalEnd(...args);
    };
}

module.exports = loggerMiddleware;
