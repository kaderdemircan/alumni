const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080; // Genellikle 80 portu Windows'ta yönetici izni gerektirebilir veya başka servisler tarafından kullanılabilir. Bu yüzden 8080'i kullanıyoruz.

// In-memory array to store users
const users = [];

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
    } else if (req.url === '/api/users' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } else if (req.url.startsWith('/api/users/') && req.method === 'GET') {
        const parts = req.url.split('/');
        const id = parseInt(parts[3], 10);
        
        if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid user ID' }));
        }

        const user = users.find(u => u.id === id);
        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    } else if (req.url === '/api/users' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
        
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);
                
                // Validate required fields
                if (!userData.name || !userData.surname || !userData.age || !userData.birthday) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Missing required fields: name, surname, age, birthday' }));
                }
                
                // Create new user object
                const newUser = {
                    id: users.length + 1,
                    name: userData.name,
                    surname: userData.surname,
                    age: userData.age,
                    birthday: userData.birthday
                };
                
                // Save user
                users.push(newUser);
                
                // Return success response
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User created successfully', user: newUser }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
    } else if (req.url.startsWith('/api/users/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const parts = req.url.split('/');
        // e.g. ['', 'api', 'users', '1']
        const id = parseInt(parts[3], 10);
        
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                if (isNaN(id)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid user ID' }));
                }

                const userIndex = users.findIndex(u => u.id === id);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'User not found' }));
                }

                const updateData = JSON.parse(body);

                if (req.method === 'PUT') {
                    // PUT requires all fields and replaces the object (except ID)
                    if (!updateData.name || !updateData.surname || !updateData.age || !updateData.birthday) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Missing required fields for PUT: name, surname, age, birthday' }));
                    }
                    users[userIndex] = {
                        id,
                        name: updateData.name,
                        surname: updateData.surname,
                        age: updateData.age,
                        birthday: updateData.birthday
                    };
                } else if (req.method === 'PATCH') {
                    // PATCH partially updates the object
                    users[userIndex] = {
                        ...users[userIndex],
                        ...updateData,
                        id // prevent ID from being overwritten
                    };
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User updated successfully', user: users[userIndex] }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
    } else if (req.url.startsWith('/api/users/') && req.method === 'DELETE') {
        const parts = req.url.split('/');
        const id = parseInt(parts[3], 10);
        
        if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid user ID' }));
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }

        const deletedUser = users.splice(userIndex, 1)[0];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User deleted successfully', user: deletedUser }));
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
