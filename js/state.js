/* K1 Shooters Tactics Board — application state: document model, history, selection, settings */
(function (K1) {
  'use strict';

  const clone = obj => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)));
  K1.clone = clone;

  let uidCounter = 0;
  function uid(prefix) {
    uidCounter = (uidCounter + 1) % 46656;
    return (prefix || 'o') + Date.now().toString(36).slice(-5) + uidCounter.toString(36).padStart(3, '0') + Math.floor(Math.random() * 1296).toString(36).padStart(2, '0');
  }
  K1.uid = uid;

  /* ---------------------------------------------------------------- events */
  const listeners = {};
  K1.on = function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return () => K1.off(ev, fn); };
  K1.off = function (ev, fn) { if (listeners[ev]) listeners[ev] = listeners[ev].filter(f => f !== fn); };
  K1.emit = function (ev, data) { (listeners[ev] || []).slice().forEach(fn => { try { fn(data); } catch (e) { console.error('[K1 event ' + ev + ']', e); } }); };

  /* -------------------------------------------------------------- settings */
  const SETTINGS_KEY = 'k1tb:settings';
  const DEFAULT_SETTINGS = {
    uiTheme: 'dark',
    showNames: true,
    showNumbers: true,
    tokenPhotos: true,
    tokenSize: 'md',
    snap: false,
    showGhosts: true,
    ghostArrows: true,
    arrowWidth: .45,
    homeKit: 'k1',
    awayKit: 'red',
    homeName: 'K1 Shooters',
    awayName: 'Opponent',
    autosave: true,
    frameDuration: 1400,
    holdDuration: 500,
    defaultPitch: 'full',
    defaultTheme: 'stripes',
    haptics: true,
    tipsSeen: false,
    coachName: '',
    fontScale: 1,
  };
  let settings = Object.assign({}, DEFAULT_SETTINGS);
  try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch (e) { /* ignore */ }
  K1.settings = settings;
  K1.saveSettings = function (patch) {
    if (patch) Object.assign(settings, patch);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* storage full or blocked */ }
    K1.emit('settings', settings);
  };
  K1.resetSettings = function () { Object.keys(settings).forEach(k => delete settings[k]); Object.assign(settings, DEFAULT_SETTINGS); K1.saveSettings(); };

  /* ------------------------------------------------------------- document */
  function newFrame(objects, caption) {
    return { id: uid('f'), caption: caption || '', duration: settings.frameDuration, objects: objects || [] };
  }

  function newDoc(opts) {
    opts = opts || {};
    const pitch = Object.assign({ type: settings.defaultPitch || 'full', theme: settings.defaultTheme || 'stripes', orientation: 'auto', overlay: 'none', L: 40, W: 30, gridStep: 5 }, opts.pitch || {});
    return {
      v: 1,
      id: uid('b'),
      title: opts.title || 'Untitled board',
      notes: '',
      tags: opts.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pitch,
      teams: {
        home: { name: settings.homeName || 'K1 Shooters', kit: settings.homeKit || 'k1' },
        away: { name: settings.awayName || 'Opponent', kit: settings.awayKit || 'red' },
      },
      frames: [newFrame([], '')],
    };
  }

  const S = {
    doc: newDoc(),
    frameIndex: 0,
    selection: new Set(),
    tool: 'select',
    style: { color: '#ffffff', width: settings.arrowWidth || .45, fill: false, opacity: .3, textSize: 2.4, coneColor: '#f97316' },
    history: [],
    future: [],
    pending: null,
    dirty: false,
    playing: false,
    stamp: null,          // pending tray item to place on next tap
    presenting: false,
  };
  K1.S = S;

  /** The team a board belongs to (set when a line-up is placed or a board is created for a team), else the active team. */
  K1.boardTeamId = () => { const id = S.doc && S.doc.teamId; if (id && K1.Teams && K1.Teams.get(id)) return id; return K1.Teams ? K1.Teams.activeId() : null; };
  K1.frame = () => S.doc.frames[Math.min(S.frameIndex, S.doc.frames.length - 1)];
  K1.objects = () => K1.frame().objects;
  K1.getObj = id => K1.objects().find(o => o.id === id);
  K1.dims = () => K1.pitchDims(S.doc.pitch);

  /* --------------------------------------------------------------- history */
  const MAX_HISTORY = 120;
  function snapshot() {
    return { frames: clone(S.doc.frames), frameIndex: S.frameIndex, pitch: clone(S.doc.pitch), teams: clone(S.doc.teams) };
  }
  function restore(snap) {
    S.doc.frames = clone(snap.frames);
    S.doc.pitch = clone(snap.pitch);
    S.doc.teams = clone(snap.teams);
    S.frameIndex = Math.min(snap.frameIndex, S.doc.frames.length - 1);
    // drop stale selection ids
    const ids = new Set(K1.objects().map(o => o.id));
    S.selection.forEach(id => { if (!ids.has(id)) S.selection.delete(id); });
  }

  /** Call before mutating (captures the "before" state). Safe to call repeatedly; the first wins. */
  K1.begin = function () { if (!S.pending) S.pending = snapshot(); };
  /** Call after mutating: records history + notifies renderers. */
  K1.commit = function (label) {
    if (S.pending) {
      S.history.push(S.pending);
      if (S.history.length > MAX_HISTORY) S.history.shift();
      S.future = [];
      S.pending = null;
    }
    S.doc.updatedAt = Date.now();
    S.dirty = true;
    K1.emit('change', { label });
  };
  /** Discard a begun-but-unwanted change (e.g. a drag that didn't move). */
  K1.cancel = function () { if (S.pending) { restore(S.pending); S.pending = null; K1.emit('change', { label: 'cancel' }); } };
  K1.mutate = function (fn, label) { K1.begin(); const r = fn(); K1.commit(label); return r; };

  K1.undo = function () {
    if (S.pending) { S.pending = null; }
    if (!S.history.length) return false;
    S.future.push(snapshot());
    restore(S.history.pop());
    S.dirty = true;
    K1.emit('change', { label: 'undo' });
    return true;
  };
  K1.redo = function () {
    if (!S.future.length) return false;
    S.history.push(snapshot());
    restore(S.future.pop());
    S.dirty = true;
    K1.emit('change', { label: 'redo' });
    return true;
  };
  K1.canUndo = () => S.history.length > 0;
  K1.canRedo = () => S.future.length > 0;

  /* -------------------------------------------------------------- document */
  K1.loadDoc = function (doc, opts) {
    opts = opts || {};
    S.doc = normaliseDoc(doc);
    S.frameIndex = 0;
    S.selection.clear();
    S.history = []; S.future = []; S.pending = null;
    S.dirty = !!opts.dirty;
    K1.emit('doc', S.doc);
    K1.emit('change', { label: 'load' });
  };
  K1.newBoard = function (opts) { K1.loadDoc(newDoc(opts), { dirty: false }); return S.doc; };

  function normaliseDoc(doc) {
    const d = Object.assign(newDoc(), doc || {});
    d.pitch = Object.assign({ type: 'full', theme: 'stripes', orientation: 'auto', overlay: 'none', L: 40, W: 30, gridStep: 5 }, d.pitch || {});
    if (!K1.PITCHES[d.pitch.type]) d.pitch.type = 'full';
    if (!K1.THEMES[d.pitch.theme]) d.pitch.theme = 'stripes';
    d.teams = d.teams || {};
    d.teams.home = Object.assign({ name: 'K1 Shooters', kit: 'k1' }, d.teams.home || {});
    d.teams.away = Object.assign({ name: 'Opponent', kit: 'red' }, d.teams.away || {});
    if (!Array.isArray(d.frames) || !d.frames.length) d.frames = [newFrame([], '')];
    d.frames.forEach(fr => { fr.id = fr.id || uid('f'); fr.objects = Array.isArray(fr.objects) ? fr.objects : []; fr.duration = fr.duration || settings.frameDuration; fr.caption = fr.caption || ''; });
    return d;
  }
  K1.normaliseDoc = normaliseDoc;
  K1.newFrame = newFrame;
  K1.newDoc = newDoc;

  /* ------------------------------------------------------------- selection */
  K1.select = function (ids, opts) {
    opts = opts || {};
    if (!opts.add) S.selection.clear();
    (Array.isArray(ids) ? ids : [ids]).forEach(id => { if (id) S.selection.add(id); });
    K1.emit('selection', S.selection);
  };
  K1.toggleSelect = function (id) { if (S.selection.has(id)) S.selection.delete(id); else S.selection.add(id); K1.emit('selection', S.selection); };
  K1.clearSelection = function () { if (S.selection.size) { S.selection.clear(); K1.emit('selection', S.selection); } };
  K1.selected = () => K1.objects().filter(o => S.selection.has(o.id));

  /* ------------------------------------------------------------------ tool */
  K1.setTool = function (t) {
    if (S.tool === t && !S.stamp) return;
    S.tool = t;
    S.stamp = null;
    K1.emit('tool', t);
  };

  /* ---------------------------------------------------------- object model */
  const TOKEN_R = { sm: 1.55, md: 1.9, lg: 2.3 };
  K1.tokenRadius = function () {
    const d = K1.dims();
    const base = TOKEN_R[settings.tokenSize] || TOKEN_R.md;
    // smaller pitches → slightly smaller tokens so they don't swamp the grid
    const k = Math.max(.62, Math.min(1, d.L / 105 + .35));
    return +(base * k).toFixed(2);
  };

  const make = {
    player(team, n, x, y, extra) { return Object.assign({ id: uid('p'), type: 'player', team: team || 'home', n: n == null ? 0 : n, name: '', gk: false, x, y }, extra || {}); },
    ball(x, y, extra) { return Object.assign({ id: uid('ball'), type: 'ball', x, y }, extra || {}); },
    equip(kind, x, y, extra) { return Object.assign({ id: uid('e'), type: 'equip', kind: kind || 'cone', x, y, rot: 0, color: extra && extra.color || (kind === 'mannequin' ? '#facc15' : S.style.coneColor) }, extra || {}); },
    path(kind, points, extra) {
      const presets = {
        pen: { geo: 'free', dash: false, wave: false, head: 'none' },
        line: { geo: 'straight', dash: false, wave: false, head: 'none' },
        pass: { geo: 'straight', dash: false, wave: false, head: 'arrow' },
        run: { geo: 'straight', dash: true, wave: false, head: 'arrow' },
        dribble: { geo: 'straight', dash: false, wave: true, head: 'arrow' },
        shot: { geo: 'straight', dash: false, wave: false, head: 'shot' },
        curve: { geo: 'curve', dash: false, wave: false, head: 'arrow' },
        curverun: { geo: 'curve', dash: true, wave: false, head: 'arrow' },
      };
      const p = presets[kind] || presets.pass;
      return Object.assign({ id: uid('l'), type: 'path', kind: kind || 'pass', geo: p.geo, dash: p.dash, wave: p.wave, head: p.head, points: points || [], ctrl: null, color: S.style.color, width: kind === 'shot' ? Math.max(.7, S.style.width * 1.6) : S.style.width }, extra || {});
    },
    shape(kind, x, y, w, h, extra) { return Object.assign({ id: uid('s'), type: 'shape', kind: kind || 'rect', x, y, w, h, rot: 0, color: S.style.color, fill: kind === 'zone' ? true : S.style.fill, opacity: S.style.opacity, width: .3, label: '' }, extra || {}); },
    text(x, y, text, extra) { return Object.assign({ id: uid('t'), type: 'text', x, y, text: text || 'Text', size: S.style.textSize, color: S.style.color, bg: true, bold: true }, extra || {}); },
    measure(points, extra) { return Object.assign({ id: uid('m'), type: 'measure', points: points || [], color: '#f5b301' }, extra || {}); },
    offside(x, extra) { return Object.assign({ id: uid('off'), type: 'offside', x, color: '#f5b301', label: 'OFFSIDE LINE' }, extra || {}); },
    ref(x, y, extra) { return Object.assign({ id: uid('r'), type: 'player', team: 'ref', n: 0, name: '', label: 'R', x, y }, extra || {}); },
  };
  K1.make = make;

  K1.nextNumber = function (team, wantGK) {
    const used = new Set(K1.objects().filter(o => o.type === 'player' && o.team === team).map(o => o.n));
    if (wantGK && !used.has(1)) return 1;
    for (let n = 2; n < 100; n++) if (!used.has(n)) return n;
    return 99;
  };

  K1.addObject = function (obj, opts) {
    opts = opts || {};
    K1.begin();
    K1.objects().push(obj);
    if (!opts.silent) K1.commit('add');
    if (opts.select) K1.select(obj.id);
    return obj;
  };
  K1.removeObjects = function (ids) {
    const set = new Set(Array.isArray(ids) ? ids : [ids]);
    if (!set.size) return;
    K1.begin();
    const fr = K1.frame();
    fr.objects = fr.objects.filter(o => !set.has(o.id));
    set.forEach(id => S.selection.delete(id));
    K1.commit('delete');
    K1.emit('selection', S.selection);
  };
  K1.updateObjects = function (ids, patch, label) {
    const set = new Set(Array.isArray(ids) ? ids : [ids]);
    K1.begin();
    K1.objects().forEach(o => { if (set.has(o.id)) Object.assign(o, typeof patch === 'function' ? patch(o) : patch); });
    K1.commit(label || 'edit');
  };

  /* ------------------------------------------------------------- utilities */
  K1.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  K1.round = (v, p) => { const m = Math.pow(10, p == null ? 2 : p); return Math.round(v * m) / m; };
  K1.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  K1.fmtTime = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  K1.fmtDate = ts => { const d = new Date(ts); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); };
  K1.isTouch = () => (navigator.maxTouchPoints || 0) > 0 || matchMedia('(pointer: coarse)').matches;
  K1.isMobile = () => matchMedia('(max-width: 820px)').matches;
  K1.userInteracted = false;
  window.addEventListener('pointerdown', () => { K1.userInteracted = true; }, { once: true, capture: true });
  K1.haptic = ms => { if (settings.haptics && K1.userInteracted && navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) { /* ignore */ } } };

  /** Bounding box of an object in pitch space: {x,y,w,h} */
  K1.bbox = function (o) {
    const r = K1.tokenRadius();
    switch (o.type) {
      case 'player': return { x: o.x - r, y: o.y - r, w: 2 * r, h: 2 * r };
      case 'ball': return { x: o.x - 1.1, y: o.y - 1.1, w: 2.2, h: 2.2 };
      case 'equip': { const s = K1.equipSize(o.kind); return { x: o.x - s.w / 2, y: o.y - s.h / 2, w: s.w, h: s.h }; }
      case 'text': { const w = Math.max(3, (o.text || '').split('\n').reduce((m, l) => Math.max(m, l.length), 0) * o.size * .56); const h = (o.text || '').split('\n').length * o.size * 1.25; return { x: o.x - w / 2, y: o.y - h / 2, w, h }; }
      case 'shape': return { x: o.x - o.w / 2, y: o.y - o.h / 2, w: o.w, h: o.h };
      case 'offside': return { x: o.x - .6, y: 0, w: 1.2, h: K1.dims().W };
      case 'path': case 'measure': {
        const pts = (o.points || []).concat(o.ctrl ? [o.ctrl] : []);
        if (!pts.length) return { x: 0, y: 0, w: 0, h: 0 };
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        pts.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
        return { x: x0 - .5, y: y0 - .5, w: x1 - x0 + 1, h: y1 - y0 + 1 };
      }
    }
    return { x: o.x || 0, y: o.y || 0, w: 0, h: 0 };
  };

  K1.equipSize = function (kind) {
    switch (kind) {
      case 'cone': return { w: 2.2, h: 2.4 };
      case 'disc': return { w: 2.2, h: 1.4 };
      case 'pole': return { w: 1.2, h: 3.4 };
      case 'flag': return { w: 2.4, h: 3.6 };
      case 'mannequin': return { w: 2.2, h: 4 };
      case 'hoop': return { w: 2.6, h: 2.6 };
      case 'ladder': return { w: 2.2, h: 6 };
      case 'minigoal': return { w: 1.4, h: 3.6 };
      case 'goal': return { w: 2.4, h: 7.32 };
      case 'ballbag': return { w: 2.4, h: 2.4 };
      case 'hurdle': return { w: 2.4, h: .8 };
      default: return { w: 2, h: 2 };
    }
  };

  /** Move an object by (dx,dy) in pitch metres. */
  K1.translateObj = function (o, dx, dy) {
    if (o.points) o.points = o.points.map(p => [p[0] + dx, p[1] + dy]);
    if (o.ctrl) o.ctrl = [o.ctrl[0] + dx, o.ctrl[1] + dy];
    if (o.type === 'offside') { o.x += dx; return; }
    if (o.x != null && o.type !== 'path' && o.type !== 'measure') { o.x += dx; o.y += dy; }
  };

  /** Snap helper for pitch coordinates. */
  K1.snapPt = function (x, y) {
    if (!settings.snap) return [x, y];
    return [Math.round(x * 2) / 2, Math.round(y * 2) / 2];
  };
})(window.K1 = window.K1 || {});
