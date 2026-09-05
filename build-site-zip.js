#!/usr/bin/env node
/**
 * Packs the app into dist/K1-Tactics-Board-site.zip — ready to drag onto Netlify Drop
 * (https://app.netlify.com/drop) or upload to any static host, so the team can install
 * it from a web address on any phone, tablet or laptop.
 *
 *   node build-site-zip.js
 *
 * Uses PowerShell's Compress-Archive on Windows and `zip` elsewhere (no npm packages).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist', 'K1-Tactics-Board-site.zip');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
if (fs.existsSync(out)) fs.unlinkSync(out);

const items = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'assets', 'README.md'];
if (process.platform === 'win32') {
  const list = items.map(i => "'" + path.join(root, i) + "'").join(',');
  execSync('powershell -NoProfile -Command "Compress-Archive -Path ' + list + " -DestinationPath '" + out + "' -Force\"", { stdio: 'inherit' });
} else {
  execSync('zip -r "' + out + '" ' + items.join(' '), { cwd: root, stdio: 'inherit' });
}
console.log('Wrote ' + out + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
console.log('Next: open https://app.netlify.com/drop and drag the zip onto the page.');
