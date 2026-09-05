/* K1 Shooters Tactics Board — persistence (localStorage), import/export, PNG/video export, share links */
(function (K1) {
  'use strict';

  const ST = {};
  const KEYS = { boards: 'k1tb:boards', current: 'k1tb:current', logo: 'k1tb:logo', squad: 'k1tb:squad', match: 'k1tb:match', sessions: 'k1tb:sessions', matches: 'k1tb:matches', teams: 'k1tb:teams', activeTeam: 'k1tb:activeTeam' };
  ST.KEYS = KEYS;

  ST.get = function (key, def) { try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
  ST.set = function (key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { K1.UI && K1.UI.toast('Storage is full — export some boards to free space.', 'warn'); return false; }
  };
  ST.usage = function () { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('k1tb:')) n += (localStorage.getItem(k) || '').length * 2; } return n; };

  /* ------------------------------------------------------------------ logo */
  let logoCache;
  K1.customLogo = function () { if (logoCache === undefined) logoCache = ST.get(KEYS.logo, null); return logoCache; };
  ST.setLogo = function (dataURL) { logoCache = dataURL || null; if (dataURL) ST.set(KEYS.logo, dataURL); else localStorage.removeItem(KEYS.logo); K1.emit('logo'); };

  /* ---------------------------------------------------------------- boards */
  function compact(doc) {
    // round coordinates to keep saves + share links small
    const d = K1.clone(doc);
    d.frames.forEach(fr => fr.objects.forEach(o => {
      ['x', 'y', 'w', 'h'].forEach(k => { if (typeof o[k] === 'number') o[k] = Math.round(o[k] * 100) / 100; });
      if (o.points) o.points = o.points.map(p => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
      if (o.ctrl) o.ctrl = [Math.round(o.ctrl[0] * 100) / 100, Math.round(o.ctrl[1] * 100) / 100];
      delete o._alpha;
    }));
    return d;
  }
  ST.compact = compact;

  ST.listBoards = () => ST.get(KEYS.boards, []);
  ST.getBoard = id => ST.listBoards().find(b => b.id === id);
  ST.saveCurrent = function (opts) {
    opts = opts || {};
    const doc = K1.S.doc;
    if (opts.asNew) { doc.id = K1.uid('b'); doc.title = opts.title || (doc.title + ' (copy)'); }
    doc.updatedAt = Date.now();
    const entry = { id: doc.id, title: doc.title, updatedAt: doc.updatedAt, pitch: doc.pitch.type, frames: doc.frames.length, tags: doc.tags || [], thumb: K1.Render.thumbSVG(doc, doc.frames[0], 240, 150), doc: compact(doc) };
    const list = ST.listBoards();
    const i = list.findIndex(b => b.id === doc.id);
    if (i >= 0) list[i] = entry; else list.unshift(entry);
    if (ST.set(KEYS.boards, list)) { K1.S.dirty = false; K1.UI && K1.UI.toast('Saved “' + doc.title + '”', 'ok'); K1.emit('library'); K1.emit('saved'); }
    return entry;
  };
  ST.loadBoard = function (id) {
    const b = ST.getBoard(id); if (!b) return false;
    K1.loadDoc(b.doc);
    return true;
  };
  ST.deleteBoard = function (id) { ST.set(KEYS.boards, ST.listBoards().filter(b => b.id !== id)); K1.emit('library'); };
  ST.duplicateBoard = function (id) {
    const b = ST.getBoard(id); if (!b) return;
    const doc = K1.clone(b.doc); doc.id = K1.uid('b'); doc.title = doc.title + ' (copy)'; doc.updatedAt = Date.now();
    const entry = Object.assign({}, b, { id: doc.id, title: doc.title, updatedAt: doc.updatedAt, doc });
    const list = ST.listBoards(); list.unshift(entry); ST.set(KEYS.boards, list); K1.emit('library');
  };
  ST.renameBoard = function (id, title) { const list = ST.listBoards(); const b = list.find(x => x.id === id); if (b) { b.title = title; b.doc.title = title; ST.set(KEYS.boards, list); K1.emit('library'); } };

  /* -------------------------------------------------------------- autosave */
  let autosaveTimer = null;
  ST.autosave = function () {
    if (!K1.settings.autosave) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => { try { localStorage.setItem(KEYS.current, JSON.stringify({ doc: compact(K1.S.doc), frameIndex: K1.S.frameIndex, savedAt: Date.now() })); } catch (e) { /* ignore */ } }, 400);
  };
  ST.restoreCurrent = function () { const c = ST.get(KEYS.current, null); return c && c.doc ? c : null; };
  ST.clearCurrent = function () { localStorage.removeItem(KEYS.current); };

  /* -------------------------------------------------------- files: download */
  ST.downloadBlob = function (blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500);
  };
  ST.safeName = s => (s || 'board').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'board';

  /** Share a file through the OS share sheet when possible (phones), else download. */
  ST.shareOrDownload = async function (blob, filename, title) {
    try {
      if (navigator.canShare && typeof File === 'function') {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare({ files: [file] }) && K1.isTouch()) { await navigator.share({ files: [file], title: title || filename }); return 'shared'; }
      }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
    ST.downloadBlob(blob, filename);
    return 'downloaded';
  };

  /* ------------------------------------------------------------ JSON I/O */
  ST.exportJSON = function (doc) {
    doc = doc || K1.S.doc;
    const blob = new Blob([JSON.stringify({ app: 'k1-tactics-board', v: 1, board: compact(doc) }, null, 1)], { type: 'application/json' });
    ST.shareOrDownload(blob, ST.safeName(doc.title) + '.k1board.json', doc.title);
  };
  ST.exportAll = function () {
    const payload = { app: 'k1-tactics-board', v: 2, exportedAt: Date.now(), boards: ST.listBoards().map(b => b.doc), squad: ST.get(KEYS.squad, []), teams: ST.get(KEYS.teams, []), sessions: ST.get(KEYS.sessions, []), matches: ST.get(KEYS.matches, []), settings: K1.settings };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    ST.shareOrDownload(blob, 'K1-Shooters-playbook-' + new Date().toISOString().slice(0, 10) + '.json', 'K1 playbook backup');
  };
  ST.importJSONText = function (text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error('That file is not valid JSON.'); }
    if (data && data.board) { K1.loadDoc(data.board, { dirty: true }); return { boards: 1 }; }
    if (data && Array.isArray(data.boards)) {
      const list = ST.listBoards();
      let n = 0;
      data.boards.forEach(doc => {
        if (!doc || !doc.frames) return;
        const d = K1.normaliseDoc(doc);
        const entry = { id: d.id, title: d.title, updatedAt: d.updatedAt || Date.now(), pitch: d.pitch.type, frames: d.frames.length, tags: d.tags || [], thumb: K1.Render.thumbSVG(d, d.frames[0], 240, 150), doc: compact(d) };
        const i = list.findIndex(b => b.id === d.id);
        if (i >= 0) list[i] = entry; else list.push(entry);
        n++;
      });
      ST.set(KEYS.boards, list);
      if (Array.isArray(data.teams) && data.teams.length) { ST.set(KEYS.teams, data.teams); if (K1.Teams) { K1.Teams.list().length = 0; data.teams.forEach(t => K1.Teams.list().push(t)); K1.Teams.init(); } }
      if (Array.isArray(data.squad) && data.squad.length) { ST.set(KEYS.squad, data.squad); if (K1.Squad) K1.Squad.save(data.squad); }
      if (Array.isArray(data.sessions) && data.sessions.length) ST.set(KEYS.sessions, data.sessions);
      if (Array.isArray(data.matches) && data.matches.length) ST.set(KEYS.matches, data.matches);
      K1.emit('library'); K1.emit('teams'); K1.emit('squad'); K1.emit('sessions');
      return { boards: n };
    }
    if (data && data.frames && data.pitch) { K1.loadDoc(data, { dirty: true }); return { boards: 1 }; }
    throw new Error('This JSON is not a K1 board or playbook backup.');
  };
  ST.pickFile = function (accept) {
    return new Promise(resolve => {
      const input = document.getElementById('fileInput');
      input.accept = accept || '*/*';
      input.value = '';
      input.onchange = () => { const f = input.files && input.files[0]; resolve(f || null); };
      input.click();
    });
  };
  ST.readFileText = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(f); });
  ST.readFileDataURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });

  /* --------------------------------------------------------------- images */
  ST.svgToCanvas = function (svgStr, w, h) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          resolve(canvas);
        } catch (e) { reject(e); }
      };
      img.onerror = e => { URL.revokeObjectURL(url); reject(new Error('Could not rasterise the board.')); };
      img.src = url;
    });
  };
  function svgSize(svgStr) {
    const m = /<svg[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(svgStr);
    return m ? [Number(m[1]), Number(m[2])] : [1600, 1100];
  }
  ST.exportPNG = async function (opts) {
    opts = opts || {};
    try {
      const width = opts.width || 2000;
      const svgStr = K1.Render.exportSVG({ width, header: opts.header !== false, orientation: opts.orientation || 'auto' });
      const [w, h] = svgSize(svgStr);
      const canvas = await ST.svgToCanvas(svgStr, w, h);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const name = ST.safeName(K1.S.doc.title) + (K1.S.doc.frames.length > 1 ? '-frame' + (K1.S.frameIndex + 1) : '') + '.png';
      if (opts.preview !== false && K1.UI) K1.UI.imagePreview(canvas.toDataURL('image/png'), name, blob);
      else await ST.shareOrDownload(blob, name, K1.S.doc.title);
      return blob;
    } catch (e) { console.error(e); K1.UI && K1.UI.toast('Export failed: ' + e.message, 'warn'); }
  };
  /** Export every frame as a PNG sequence (a ZIP would need a library, so we download one by one). */
  ST.exportAllFramesPNG = async function () {
    const frames = K1.S.doc.frames;
    for (let i = 0; i < frames.length; i++) {
      const svgStr = K1.Render.exportSVG({ width: 1600, frame: frames[i], frameNumber: i + 1 });
      const [w, h] = svgSize(svgStr);
      const canvas = await ST.svgToCanvas(svgStr, w, h);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      ST.downloadBlob(blob, ST.safeName(K1.S.doc.title) + '-frame' + (i + 1) + '.png');
      await new Promise(r => setTimeout(r, 350));
    }
    K1.UI && K1.UI.toast('Exported ' + frames.length + ' frames', 'ok');
  };
  ST.exportSVGFile = function () {
    const svgStr = K1.Render.exportSVG({ width: 1600 });
    ST.shareOrDownload(new Blob([svgStr], { type: 'image/svg+xml' }), ST.safeName(K1.S.doc.title) + '.svg', K1.S.doc.title);
  };

  /* ---------------------------------------------------------------- video */
  ST.canExportVideo = () => typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement.prototype.captureStream === 'function';
  ST.exportVideo = async function (opts) {
    opts = opts || {};
    if (!ST.canExportVideo()) { K1.UI && K1.UI.toast('Video export is not supported in this browser.', 'warn'); return; }
    if (K1.S.doc.frames.length < 2) { K1.UI && K1.UI.toast('Add at least two frames to record an animation.'); return; }
    const width = opts.width || 1280;
    const first = K1.Render.exportSVG({ width, objects: K1.S.doc.frames[0].objects, caption: K1.S.doc.frames[0].caption });
    const [w, h] = svgSize(first);
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const fps = 30;
    // captureStream(0) + requestFrame(): every frame we draw is pushed to the recorder explicitly,
    // so the recording does not depend on the tab being painted on screen.
    const stream = canvas.captureStream(0);
    const track = stream.getVideoTracks()[0];
    const pushFrame = () => { try { if (track && typeof track.requestFrame === 'function') track.requestFrame(); } catch (e) { /* ignore */ } };
    const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    const mime = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6e6 } : undefined);
    const chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise(res => { rec.onstop = res; });
    const total = K1.Anim.total() + 900;
    const progress = K1.UI ? K1.UI.progress('Recording animation…') : null;
    rec.start(200);
    // prime the recorder with the first frame
    try { const c0 = await ST.svgToCanvas(first, w, h); ctx.drawImage(c0, 0, 0); pushFrame(); } catch (e) { /* ignore */ }
    const t0 = performance.now();
    let last = -1;
    // Draw in real time (MediaRecorder timestamps follow the wall clock). A timer is used rather than
    // requestAnimationFrame so the export still finishes if the tab is hidden mid-way (rAF pauses then).
    await new Promise(resolve => {
      const hardStop = total + 4000;
      const step = async () => {
        const t = performance.now() - t0;
        if (t >= total || t >= hardStop) { resolve(); return; }
        const at = Math.min(K1.Anim.total(), Math.max(0, t - 450));
        if (at !== last) {
          last = at;
          const scene = K1.Anim.sceneAt(at);
          try {
            const svgStr = K1.Render.exportSVG({ width, objects: scene.objects, caption: scene.caption, frameNumber: scene.frameIndex + 1 });
            const c = await ST.svgToCanvas(svgStr, w, h);
            ctx.drawImage(c, 0, 0);
            pushFrame();
          } catch (e) { /* skip frame */ }
          if (progress) progress.set(t / total);
        } else pushFrame();
        setTimeout(step, 1000 / fps);
      };
      step();
    });
    rec.stop();
    await done;
    if (progress) progress.close();
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type: mime || 'video/webm' });
    await ST.shareOrDownload(blob, ST.safeName(K1.S.doc.title) + '.' + ext, K1.S.doc.title);
    K1.UI && K1.UI.toast('Animation exported (' + ext.toUpperCase() + ')', 'ok');
  };

  /* ------------------------------------------------------------------ gif */
  /** Animated GIF of the frames (works everywhere, no screen capture needed). */
  ST.exportGIF = async function (opts) {
    opts = opts || {};
    if (K1.S.doc.frames.length < 2) { K1.UI && K1.UI.toast('Add at least two frames to make an animation.'); return; }
    const width = opts.width || 720;
    const fps = opts.fps || 12;
    const total = K1.Anim.total();
    const stepMs = 1000 / fps;
    const orientation = opts.orientation || 'auto';
    const first = K1.Render.exportSVG({ width, objects: K1.S.doc.frames[0].objects, caption: K1.S.doc.frames[0].caption, header: opts.header !== false, orientation });
    const [w, h] = svgSize(first);
    const progress = K1.UI ? K1.UI.progress('Making the GIF…') : null;
    try {
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      // sample times; identical consecutive scenes (holds) become one frame with a longer delay
      const samples = [];
      let lastKey = null;
      for (let t = 0; t <= total + 1; t += stepMs) {
        const tt = Math.min(t, total);
        const scene = K1.Anim.sceneAt(tt);
        const key = scene.frameIndex + ':' + scene.progress.toFixed(3);
        if (key === lastKey && samples.length) { samples[samples.length - 1].delay += stepMs; continue; }
        lastKey = key;
        samples.push({ scene, delay: stepMs });
      }
      samples[samples.length - 1].delay += 900; // hold the last frame a little
      const enc = new K1.GIF.Encoder(w, h, { loop: true });
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const svgStr = K1.Render.exportSVG({ width, objects: s.scene.objects, caption: s.scene.caption, frameNumber: s.scene.frameIndex + 1, header: opts.header !== false, orientation });
        const c = await ST.svgToCanvas(svgStr, w, h);
        ctx.drawImage(c, 0, 0);
        enc.addFrame(ctx.getImageData(0, 0, w, h).data, s.delay); // quantised immediately: ~1 byte per pixel
        if (progress) progress.set((i + 1) / samples.length);
      }
      const bytes = enc.finish();
      const blob = new Blob([bytes], { type: 'image/gif' });
      if (progress) progress.close();
      const name = ST.safeName(K1.S.doc.title) + '.gif';
      if (K1.UI && opts.preview !== false) {
        const url = URL.createObjectURL(blob);
        K1.UI.imagePreview(url, name, blob);
      } else await ST.shareOrDownload(blob, name, K1.S.doc.title);
      return blob;
    } catch (e) {
      if (progress) progress.close();
      console.error(e);
      K1.UI && K1.UI.toast('GIF export failed: ' + e.message, 'warn');
    }
  };

  /* ---------------------------------------------------------------- share */
  const b64url = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64url = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)); const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; };
  async function compress(str) {
    const bytes = new TextEncoder().encode(str);
    if (typeof CompressionStream === 'undefined') return 'j' + b64url(bytes);
    const cs = new CompressionStream('deflate-raw');
    const w = cs.writable.getWriter(); w.write(bytes); w.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    return 'z' + b64url(new Uint8Array(buf));
  }
  async function decompress(str) {
    const kind = str[0], body = str.slice(1);
    const bytes = unb64url(body);
    if (kind === 'j') return new TextDecoder().decode(bytes);
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot open compressed links.');
    const ds = new DecompressionStream('deflate-raw');
    const w = ds.writable.getWriter(); w.write(bytes); w.close();
    return await new Response(ds.readable).text();
  }
  ST.encodeDoc = async doc => compress(JSON.stringify(compact(doc)));
  ST.decodeDoc = async str => JSON.parse(await decompress(str));
  ST.shareLink = async function () {
    const code = await ST.encodeDoc(K1.S.doc);
    const url = location.origin + location.pathname + '#b=' + code;
    return url;
  };
  ST.loadFromHash = async function () {
    const m = /[#&]b=([^&]+)/.exec(location.hash);
    if (!m) return null;
    try {
      const doc = await ST.decodeDoc(m[1]);
      history.replaceState(null, '', location.pathname + location.search);
      return K1.normaliseDoc(doc);
    } catch (e) { console.error(e); K1.UI && K1.UI.toast('That share link could not be opened.', 'warn'); return null; }
  };

  K1.Store = ST;
})(window.K1 = window.K1 || {});
