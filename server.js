const http = require('http');

const PORT = 3000;
let requestCount = 0;
const serverStartTime = new Date();

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} запит на ${req.url}`);
    
    if (req.method !== 'OPTIONS') {
        requestCount++;
    }

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const { method, url } = req;

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Привіт! Це головна сторінка сервера.</h1><p>Сервер працює коректно.</p>');
    }
    
    else if (url === '/status' && method === 'GET') {
        const uptime = Math.floor((new Date() - serverStartTime) / 1000); 
        const statusData = {
            status: 'active',
            serverTime: new Date().toLocaleString(),
            uptime: `${uptime} сек`,
            requestsProcessed: requestCount
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(statusData));
    }
    
    else if (url === '/data' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                if (!body) throw new Error('Body is empty');
                
                const parsedData = JSON.parse(body);
                
                const responseData = {
                    message: `Дані отримано успішно для користувача ${parsedData.name || 'Unknown'}`,
                    receivedData: parsedData,
                    timestamp: new Date().toISOString()
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(responseData));
            } catch (error) {
                console.error('Помилка обробки JSON:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Некоректний JSON формат або пусте тіло запиту' }));
            }
        });
    }
    
    else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '404: Ресурс не знайдено' }));
    }
});

server.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});