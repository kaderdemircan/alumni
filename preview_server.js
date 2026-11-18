const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, reqPath === '/' ? 'index.html' : reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(__dirname, 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = ext === '.html' ? 'text/html; charset=utf-8' :
                        ext === '.css' ? 'text/css' :
                        ext === '.js' ? 'application/javascript' :
                        ext === '.json' ? 'application/json' : 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading file');
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Preview server running at http://localhost:${PORT}`);
});
