#!/usr/bin/env node
/**
 * K1 Shooters Tactics Board — tiny zero-dependency static server.
 *
 *   node serve.js            → http://localhost:8790
 *   node serve.js 3000       → custom port
 *
 * It also prints your laptop's LAN address so you can open the board on
 * your phone while both devices are on the same Wi-Fi.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 8790);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function lanAddresses() {
  const out = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) out.push(`${a.address} (${name})`);
    }
  }
  return out;
}

// Dev-only helper: `node serve.js 8790 --allow-save` lets tools/make-png-icons.html write the
// generated PNG icons into /assets (POST /__save/<name>.png). Off by default.
const ALLOW_SAVE = process.argv.includes('--allow-save');

const server = http.createServer((req, res) => {
  // The app asks for this to show "open this on your phone" addresses in its Install dialog.
  if (req.method === 'GET' && (req.url || '').split('?')[0] === '/__info') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ port: PORT, lan: lanAddresses().map(a => a.split(' ')[0]) }));
    return;
  }
  if (ALLOW_SAVE && req.method === 'POST' && req.url.startsWith('/__save/')) {
    const name = decodeURIComponent(req.url.slice('/__save/'.length));
    if (!/^[\w.-]+\.(png|gif)$/.test(name)) { res.writeHead(400); res.end('bad name'); return; }
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      const isPng = buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
      const isGif = buf.slice(0, 4).toString('latin1') === 'GIF8';
      if (buf.length > 8e6 || !(isPng || isGif)) { res.writeHead(400); res.end('not a png/gif'); return; }
      fs.writeFileSync(path.join(ROOT, name.endsWith('.gif') ? 'dist' : 'assets', name), buf);
      res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('saved ' + name + ' (' + buf.length + ' bytes)');
    });
    return;
  }
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA-style fallback so deep links like /#b=... always land on the app
      const fallback = path.join(ROOT, 'index.html');
      if (fs.existsSync(fallback) && !path.extname(urlPath)) {
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        fs.createReadStream(fallback).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found: ' + urlPath); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store',
      'Service-Worker-Allowed': '/',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  K1 SHOOTERS — Tactics Board');
  console.log('  ---------------------------');
  console.log(`  Laptop:  http://localhost:${PORT}`);
  for (const a of lanAddresses()) console.log(`  Phone:   http://${a.split(' ')[0]}:${PORT}   ${a.split(' ')[1]}`);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
});
