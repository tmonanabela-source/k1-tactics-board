/* K1 Shooters Tactics Board — bootstrap */
(function (K1) {
  'use strict';

  async function boot() {
    const svg = document.getElementById('board');
    const wrap = document.getElementById('boardWrap');
    K1.Teams.init();            // teams first: the renderer and panes read the active team
    K1.Render.mount(svg, wrap);
    K1.Board.init(svg, wrap);
    K1.UI.init();
    // player photos on tokens follow the squad + active team
    K1.on('squad', () => K1.Render.refreshPhotos());
    K1.on('teams', () => K1.Render.refreshPhotos());
    K1.on('settings', () => K1.Render.refreshPhotos());

    // 1) shared link → 2) autosaved working copy → 3) a proper first board
    let loaded = false;
    try {
      const shared = await K1.Store.loadFromHash();
      if (shared) { K1.loadDoc(shared, { dirty: true }); K1.UI.toast('Opened a shared board', 'ok'); loaded = true; }
    } catch (e) { console.error(e); }
    if (!loaded) {
      const cur = K1.Store.restoreCurrent();
      if (cur) {
        K1.loadDoc(cur.doc);
        K1.S.frameIndex = Math.min(cur.frameIndex || 0, K1.S.doc.frames.length - 1);
        K1.emit('frames');
        K1.emit('change', { label: 'load' });
        loaded = true;
      }
    }
    if (!loaded) {
      const doc = K1.Templates.docFromFormations('433', '442', 'full');
      doc.title = 'K1 Shooters · 4-3-3';
      K1.loadDoc(doc);
      K1.S.dirty = false;
    }

    window.addEventListener('hashchange', async () => {
      const shared = await K1.Store.loadFromHash();
      if (shared) { K1.loadDoc(shared, { dirty: true }); K1.UI.toast('Opened a shared board', 'ok'); }
    });

    // PWA: service worker + install prompt
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) K1.UI.toast('Update ready — reload to get the latest version.', 'ok', 5000); });
        });
      }).catch(() => {});
    }
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); K1.installPrompt = e; K1.emit('installable'); });
    window.addEventListener('appinstalled', () => { K1.installPrompt = null; K1.UI.toast('Installed — find K1 Tactics on your home screen.', 'ok'); });

    // keep the working copy fresh when the tab is hidden/closed
    document.addEventListener('visibilitychange', () => { if (document.hidden) K1.Store.autosave(); });
    window.addEventListener('pagehide', () => { try { localStorage.setItem(K1.Store.KEYS.current, JSON.stringify({ doc: K1.Store.compact(K1.S.doc), frameIndex: K1.S.frameIndex, savedAt: Date.now() })); } catch (e) { /* ignore */ } });

    if (!K1.settings.tipsSeen) setTimeout(() => K1.UI.welcome(), 350);
    document.body.classList.add('ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.K1 = window.K1 || {});
