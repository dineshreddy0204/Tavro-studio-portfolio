/**
 * TAVRO STUDIO — Official Production Node.js Server & Admin API
 * Built with native Node.js (zero external dependencies).
 * Fully compatible with Hostinger Node.js, VPS, and local environments.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 8000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tavro2026';
const DATA_DIR = path.join(__dirname, 'data');

// In-memory active session tokens
const activeSessions = new Set();

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file, fallback) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  const p = path.join(DATA_DIR, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function checkAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  return activeSessions.has(token);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // =========================================================
  // API ROUTES
  // =========================================================

  // Auth: Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { password } = await parseBody(req);
    const validKeys = [process.env.ADMIN_PASSWORD, 'dineshreddy@02', 'tavro2026'].filter(Boolean);
    if (validKeys.includes(password)) {
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.add(token);
      return sendJSON(res, 200, { ok: true, token, message: 'Authenticated successfully' });
    }
    return sendJSON(res, 401, { ok: false, error: 'Invalid master security key' });
  }

  // Auth: Verify Session
  if (pathname === '/api/auth/verify' && method === 'GET') {
    const isAuth = checkAuth(req);
    return sendJSON(res, isAuth ? 200 : 401, { authenticated: isAuth });
  }

  // Auth: Logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      activeSessions.delete(token);
    }
    return sendJSON(res, 200, { ok: true, message: 'Logged out' });
  }

  // Projects: Public List
  if (pathname === '/api/projects' && method === 'GET') {
    const projects = readJSON('projects.json', []);
    return sendJSON(res, 200, projects);
  }

  // Projects: Admin Add
  if (pathname === '/api/admin/projects' && method === 'POST') {
    if (!checkAuth(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
    const newProj = await parseBody(req);
    if (!newProj.name) return sendJSON(res, 400, { error: 'Project name is required' });

    const projects = readJSON('projects.json', []);
    newProj.id = newProj.id || newProj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    newProj.num = String(projects.length + 1).padStart(2, '0');
    projects.push(newProj);
    writeJSON('projects.json', projects);
    return sendJSON(res, 201, { ok: true, project: newProj });
  }

  // Projects: Admin Update
  if (pathname.startsWith('/api/admin/projects/') && method === 'PUT') {
    if (!checkAuth(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/projects/', '');
    const updates = await parseBody(req);
    const projects = readJSON('projects.json', []);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return sendJSON(res, 404, { error: 'Project not found' });

    projects[idx] = Object.assign({}, projects[idx], updates);
    writeJSON('projects.json', projects);
    return sendJSON(res, 200, { ok: true, project: projects[idx] });
  }

  // Projects: Admin Delete
  if (pathname.startsWith('/api/admin/projects/') && method === 'DELETE') {
    if (!checkAuth(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/projects/', '');
    let projects = readJSON('projects.json', []);
    projects = projects.filter(p => p.id !== id);
    writeJSON('projects.json', projects);
    return sendJSON(res, 200, { ok: true, message: 'Project removed' });
  }

  // Services: Public List
  if (pathname === '/api/services' && method === 'GET') {
    const services = readJSON('services.json', []);
    return sendJSON(res, 200, services);
  }

  // Inquiries: Submit from Website Form
  if (pathname === '/api/inquiries' && method === 'POST') {
    const data = await parseBody(req);
    if (!data.name || !data.email || !data.description) {
      return sendJSON(res, 400, { error: 'Missing required inquiry fields' });
    }

    const inquiries = readJSON('inquiries.json', []);
    const inquiryRecord = {
      id: 'inq_' + Date.now(),
      name: data.name,
      brand: data.brand || 'N/A',
      email: data.email,
      whatsapp: data.whatsapp || 'N/A',
      projectType: data.projectType || 'General Inquiry',
      budget: data.budget || 'To discuss on discovery call',
      description: data.description,
      createdAt: new Date().toISOString(),
      clientIP: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local'
    };

    inquiries.unshift(inquiryRecord);
    writeJSON('inquiries.json', inquiries);

    console.log(`[TAVRO INQUIRY] New inquiry from ${data.name} (${data.brand}) <${data.email}>`);
    return sendJSON(res, 201, {
      ok: true,
      message: 'Inquiry registered in TAVRO Studio system',
      inquiryId: inquiryRecord.id
    });
  }

  // Inquiries: Admin List
  if (pathname === '/api/admin/inquiries' && method === 'GET') {
    if (!checkAuth(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
    const inquiries = readJSON('inquiries.json', []);
    return sendJSON(res, 200, inquiries);
  }

  // Inquiries: Admin Delete
  if (pathname.startsWith('/api/admin/inquiries/') && method === 'DELETE') {
    if (!checkAuth(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/inquiries/', '');
    let inquiries = readJSON('inquiries.json', []);
    inquiries = inquiries.filter(i => i.id !== id);
    writeJSON('inquiries.json', inquiries);
    return sendJSON(res, 200, { ok: true, message: 'Inquiry deleted' });
  }

  // =========================================================
  // STATIC FILE SERVING
  // =========================================================
  let cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath === '/') cleanPath = '/index.html';
  if (cleanPath === '/admin' || cleanPath === '/tavro-admin' || cleanPath === '/studio-admin' || cleanPath === '/portal') {
    cleanPath = '/admin.html';
  }

  let safePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found — TAVRO Studio');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` TAVRO STUDIO PRODUCTION SERVER`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin`);
  console.log(` Default Admin Password: ${ADMIN_PASSWORD}`);
  console.log(`=======================================================`);
});
