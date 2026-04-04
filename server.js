const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error('Missing API_KEY in .env. Add API_KEY=your_key_here');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const contentTypeFromExt = (ext) => {
  switch (ext) {
    case '.html': return 'text/html';
    case '.js': return 'text/javascript';
    case '.css': return 'text/css';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypeFromExt(ext) });
    res.end(content);
  });
};

const sendJson = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const notFound = (res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
};

const handleGenerate = (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      sendJson(res, 400, { error: 'Invalid JSON' });
      return;
    }

    const userMessage = payload.message;
    if (!userMessage) {
      sendJson(res, 400, { error: 'Missing message field' });
      return;
    }

    const requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: userMessage }]
      }]
    });

    const requestOptions = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3-flash:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const apiReq = https.request(requestOptions, (apiRes) => {
      let responseData = '';
      apiRes.on('data', (chunk) => { responseData += chunk; });
      apiRes.on('end', () => {
        const statusCode = apiRes.statusCode || 500;
        try {
          const json = JSON.parse(responseData);
          sendJson(res, statusCode, json);
        } catch (err) {
          sendJson(res, 500, { error: 'Invalid API response' });
        }
      });
    });

    apiReq.on('error', (error) => {
      sendJson(res, 500, { error: error.message });
    });

    apiReq.write(requestBody);
    apiReq.end();
  });
};

const server = http.createServer((req, res) => {
  const requestUrl = decodeURIComponent(req.url.split('?')[0]);

  if (req.method === 'POST' && requestUrl === '/generate') {
    handleGenerate(req, res);
    return;
  }

  const filePath = requestUrl === '/'
    ? path.join(PUBLIC_DIR, 'index.html')
    : path.join(PUBLIC_DIR, requestUrl.substring(1));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    notFound(res);
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      notFound(res);
      return;
    }
    sendFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
