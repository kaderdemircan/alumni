const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080; // Genellikle 80 portu Windows'ta yönetici izni gerektirebilir veya başka servisler tarafından kullanılabilir. Bu yüzden 8080'i kullanıyoruz.

// Import MVC Routers
const handleApiUserRoutes = require('./routes/apiUserRoutes');
const handleUserRoutes = require('./routes/userRoutes');

const server = http.createServer((req, res) => {
    // Kök dizin (/) için geçici ana sayfa tasarımı
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Sunucu Hatasi');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } else if (req.url === '/about') {
        fs.readFile(path.join(__dirname, 'about.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Sunucu Hatasi');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } else if (req.url === '/alumni' && (req.method === 'GET' || req.method === 'POST')) {
        // HTTP 200 OK durum kodu ve düz metin tipi dönüyoruz
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        // 'ok' çıktısını gönderiyoruz
        res.end('ok');
    } else if (req.url === '/api/swagger' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'swagger.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Sunucu Hatasi');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } else if (req.url === '/api/swagger.json' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'swagger.json'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Sunucu Hatasi');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(content);
            }
        });
    } else if (req.url === '/api/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
    // MVC Route Handlers (API and Web UI)
    } else if (handleApiUserRoutes(req, res)) {
        return;
    } else if (handleUserRoutes(req, res)) {
        return;
    } else if (req.url === '/hello') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('hello world!');
    } else if (req.url.startsWith('/hello/')) {
        // '/hello/' kısmından sonrasını alıyoruz
        const name = req.url.slice(7); 
        // Türkçe karakter veya boşlukları düzgün göstermek için decode ediyoruz
        const decodedName = decodeURIComponent(name);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Hello, ${decodedName}!`);
    } else if (req.url.startsWith('/sum/')) {
        // URL'i '/' karakterine göre bölüyoruz
        const parts = req.url.split('/');
        // parts dizisi şu şekilde olacak: ['', 'sum', 'sayi1', 'sayi2']
        if (parts.length === 4) {
            const num1 = parseFloat(parts[2]);
            const num2 = parseFloat(parts[3]);
            
            if (!isNaN(num1) && !isNaN(num2)) {
                const total = num1 + num2;
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(total.toString());
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Hata: Lutfen gecerli iki sayi girin.');
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Geçersiz format. Örnek kullanım: /sum/5/10');
        }
    } else {
        // Eğer farklı bir yola gelinirse 404 dönüyoruz
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Bulunamadi');
    }
});

server.listen(PORT, () => {
    console.log(`Sunucu basariyla baslatildi!`);
    console.log(`Tarayicinizda veya Postman/cURL uzerinden test edebilirsiniz:`);
    console.log(`URL: http://localhost:${PORT}/alumni`);
});
