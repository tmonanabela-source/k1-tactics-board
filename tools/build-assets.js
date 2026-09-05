#!/usr/bin/env node
/**
 * Generates the SVG icons in /assets from the crest defined in js/logo.js
 * (so the app icon and the in-app badge always match).
 *
 *   node tools/build-assets.js
 *
 * PNG icons (assets/icon-192.png etc.) are rendered separately from the browser —
 * see tools/make-png-icons.html — because Node has no built-in rasteriser.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
sandbox.window.K1 = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'logo.js'), 'utf8'), sandbox);
const K1 = sandbox.window.K1;

const NAVY = '#131c21';
// Prefer the real crest (assets/logo.png) embedded as a data URL; fall back to the drawn SVG crest.
const logoPng = path.join(root, 'assets', 'logo.png');
const badgeInner = fs.existsSync(logoPng)
  ? '<image href="data:image/png;base64,' + fs.readFileSync(logoPng).toString('base64') + '" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>'
  : K1.LOGO.badge({ size: 512 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// "any" icon: crest on a navy rounded square
const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">' +
  '<rect width="512" height="512" rx="96" fill="' + NAVY + '"/>' +
  '<svg x="36" y="36" width="440" height="440" viewBox="0 0 512 512">' + badgeInner + '</svg></svg>';

// maskable icon: crest kept inside the 80 % safe zone
const maskable = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">' +
  '<rect width="512" height="512" fill="' + NAVY + '"/>' +
  '<svg x="76" y="76" width="360" height="360" viewBox="0 0 512 512">' + badgeInner + '</svg></svg>';

// plain crest (transparent background) for documents
const crest = K1.LOGO.badge({ size: 512 });

const out = path.join(root, 'assets');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon.svg'), icon);
fs.writeFileSync(path.join(out, 'icon-maskable.svg'), maskable);
fs.writeFileSync(path.join(out, 'crest.svg'), crest);
console.log('Wrote assets/icon.svg, assets/icon-maskable.svg, assets/crest.svg');
