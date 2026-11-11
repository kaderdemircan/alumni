/**
 * Not Found Handler Middleware (404 Guardian)
 *
 * Serves a themed 404 page (or JSON) when no route matches a request.
 * Provides context-aware reasons based on the requested URL.
 */

const fs = require('fs');
const path = require('path');

const NOT_FOUND_VIEW = path.join(__dirname, '..', 'views', '404.html');

/**
 * Determine a descriptive 404 reason based on the requested URL.
 * @param {string} url
 * @returns {string}
 */
function getReason(url) {
    if (url.startsWith('/api/users')) {
        return 'The alumni API endpoint you requested does not exist. ' +
               'Please check the API documentation at <a href="/api/swagger">/api/swagger</a> for all available endpoints.';
    }
    if (url.startsWith('/api/')) {
        return 'The API endpoint you requested does not exist. ' +
               'Please check the API documentation at <a href="/api/swagger">/api/swagger</a> for available endpoints.';
    }
    if (url.startsWith('/users/')) {
        return 'The alumni record or page you are looking for could not be found. ' +
               'It may have been deleted, the ID may be invalid, or the URL may be incorrect.';
    }
    if (url.startsWith('/users')) {
        return 'The Alumni System page could not be found. ' +
               'Please navigate to <a href="/users">/users</a> for the alumni directory.';
    }
    return 'The page you are looking for does not exist or has been moved. ' +
           'Please check the URL and try again, or use the navigation above.';
}

/**
 * 404 Guardian Middleware — handles all unmatched requests.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
function notFoundHandler(req, res) {
    const url = req.url || '/';
    const reason = getReason(url);
    const isApiRequest =
        url.startsWith('/api/') ||
        (req.headers['accept'] && req.headers['accept'].includes('application/json'));

    // Return JSON for API consumers
    if (isApiRequest) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
            error: 'Not Found',
            message: reason.replace(/<[^>]*>/g, ''), // strip HTML from JSON
            path: url,
            statusCode: 404,
        }));
    }

    // Serve the themed HTML 404 page
    fs.readFile(NOT_FOUND_VIEW, 'utf8', (err, template) => {
        if (err) {
            // Fallback if template cannot be loaded
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`404 Not Found\n${reason.replace(/<[^>]*>/g, '')}\nRequested: ${url}`);
        }

        let html = template.replace('<!-- ERROR_REASON -->', reason);
        html = html.replace(/<!-- REQUESTED_URL -->/g, url);

        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });
}

module.exports = notFoundHandler;
