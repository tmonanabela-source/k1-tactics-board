/* K1 Shooters Tactics Board — service worker: offline app shell */
const VERSION = 'k1tb-v1.5.0';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/icons.js', './js/logo-data.js', './js/logo.js', './js/kits.js', './js/formations.js', './js/pitch.js', './js/state.js',
  './js/setpieces.js', './js/drills.js', './js/drills-k1.js', './js/tactics.js', './js/phases.js', './js/render.js', './js/anim.js', './js/templates.js',
  './js/board.js', './js/gif.js', './js/storage.js', './js/squad.js', './js/teams.js', './js/match.js', './js/session.js', './js/ui.js', './js/panes.js', './js/panes-teams.js', './js/competitions.js', './js/panes-comps.js', './js/panes-home.js',
  './js/masterclass.js', './js/masterclass-content.js', './js/panes-masterclass.js', './js/app.js',
  './assets/icon.svg', './assets/icon-maskable.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', event => { if (event.data === 'skipWaiting') self.skipWaiting(); });

// Stale-while-revalidate for same-origin GETs; network-only for everything else (fonts come from Google).
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    // fonts: cache opportunistically so the app still looks right offline
    if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
      event.respondWith(caches.open(VERSION + '-fonts').then(async cache => {
        const cached = await cache.match(req);
        const fetching = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
        return cached || fetching;
      }));
    }
    return;
  }
  // Network first (always fresh when online), cache fallback (works offline).
  event.respondWith(caches.open(VERSION).then(async cache => {
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (e) {
      const cached = await cache.match(req, { ignoreSearch: true });
      return cached || (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
    }
  }));
});
