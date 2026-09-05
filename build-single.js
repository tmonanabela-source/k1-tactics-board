#!/usr/bin/env node
/**
 * Bundles the whole app into ONE self-contained HTML file you can send to a phone
 * over WhatsApp / e-mail and open directly (no server needed, works offline).
 *
 *   node build-single.js   →   dist/K1-Tactics-Board.html
 *
 * The single file keeps everything except the service worker / manifest (those
 * need a web address). Saved boards live in the browser that opens the file.
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// inline stylesheet
html = html.replace(/<link rel="stylesheet" href="css\/app.css">/, () => '<style>\n' + fs.readFileSync(path.join(root, 'css', 'app.css'), 'utf8') + '\n</style>');

// inline scripts in order
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (m, src) => '<script>\n' + fs.readFileSync(path.join(root, src), 'utf8').replace(/<\/script>/g, '<\\/script>') + '\n</script>');

// drop things that need a server
html = html.replace(/\s*<link rel="manifest"[^>]*>/, '');
html = html.replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '');
html = html.replace(/<link rel="icon"[^>]*>/, () => {
  const svg = fs.existsSync(path.join(root, 'assets', 'icon.svg')) ? fs.readFileSync(path.join(root, 'assets', 'icon.svg'), 'utf8') : '';
  return svg ? '<link rel="icon" href="data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') + '">' : '';
});

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'K1-Tactics-Board.html');
fs.writeFileSync(out, html);
console.log('Wrote ' + out + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
