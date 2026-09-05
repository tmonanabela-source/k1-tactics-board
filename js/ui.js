/* K1 Shooters Tactics Board — UI framework: chrome, toolbars, inspector, frames strip, overlays */
(function (K1) {
  'use strict';

  const UI = {};
  const S = K1.S;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const html = s => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  let activeTab = 'board';
  let sheetPane = null;
  let selbarEditing = false;
  let framesRaf = null;

  const TOOLS = [
    { id: 'select', icon: 'select', label: 'Select · move', key: 'V' },
    { id: 'hand', icon: 'hand', label: 'Pan the pitch', key: 'H' },
    { sep: true },
    { id: 'pass', icon: 'pass', label: 'Pass arrow', key: 'A' },
    { id: 'run', icon: 'run', label: 'Run (dashed arrow)', key: 'R' },
    { id: 'dribble', icon: 'dribble', label: 'Dribble (wavy arrow)', key: 'D' },
    { id: 'shot', icon: 'shot', label: 'Shot', key: 'S' },
    { id: 'curve', icon: 'curve', label: 'Curved pass · cross', key: 'C' },
    { id: 'line', icon: 'line', label: 'Plain line', key: 'L' },
    { id: 'pen', icon: 'pen', label: 'Freehand pen', key: 'P' },
    { sep: true },
    { id: 'zone', icon: 'zone', label: 'Zone (shaded area)', key: 'Z' },
    { id: 'rect', icon: 'rect', label: 'Rectangle', key: 'B' },
    { id: 'ellipse', icon: 'ellipse', label: 'Ellipse', key: 'O' },
    { id: 'triangle', icon: 'triangle', label: 'Triangle' },
    { id: 'text', icon: 'text', label: 'Text label', key: 'T' },
    { sep: true },
    { id: 'measure', icon: 'ruler', label: 'Measure distance', key: 'M' },
    { id: 'offside', icon: 'offside', label: 'Offside line', key: 'I' },
    { id: 'eraser', icon: 'eraser', label: 'Eraser', key: 'E' },
  ];
  UI.TOOLS = TOOLS;

  const TRAY = [
    { key: 'h', kind: 'player', team: 'home', label: 'Home' },
    { key: 'hgk', kind: 'player', team: 'home', gk: true, label: 'Home GK' },
    { key: 'a', kind: 'player', team: 'away', label: 'Away' },
    { key: 'agk', kind: 'player', team: 'away', gk: true, label: 'Away GK' },
    { key: 'n', kind: 'player', team: 'neutral', label: 'Neutral' },
    { key: 'ref', kind: 'ref', label: 'Referee' },
    { key: 'ball', kind: 'ball', label: 'Ball' },
    { key: 'cone', kind: 'equip', sub: 'cone', label: 'Cone' },
    { key: 'disc', kind: 'equip', sub: 'disc', label: 'Disc' },
    { key: 'pole', kind: 'equip', sub: 'pole', label: 'Pole' },
    { key: 'flag', kind: 'equip', sub: 'flag', label: 'Flag' },
    { key: 'mannequin', kind: 'equip', sub: 'mannequin', label: 'Dummy' },
    { key: 'hoop', kind: 'equip', sub: 'hoop', label: 'Hoop' },
    { key: 'ladder', kind: 'equip', sub: 'ladder', label: 'Ladder' },
    { key: 'hurdle', kind: 'equip', sub: 'hurdle', label: 'Hurdle' },
    { key: 'minigoal', kind: 'equip', sub: 'minigoal', label: 'Mini goal' },
    { key: 'goal', kind: 'equip', sub: 'goal', label: 'Goal' },
    { key: 'text', kind: 'text', label: 'Text' },
  ];
  UI.TRAY = TRAY;

  // side panel of the Board section — board things only
  const TABS = [
    { id: 'board', icon: 'layers', label: 'Pitch' },
    { id: 'playbook', icon: 'book', label: 'Playbook' },
    { id: 'frames', icon: 'film', label: 'Animate' },
  ];
  // app sections — the club app around the board
  const SECTIONS = [
    { id: 'home', icon: 'home', label: 'Home', title: 'K1 Shooters' },
    { id: 'board', icon: 'grid', label: 'Board', title: 'Tactics board' },
    { id: 'teams', icon: 'users', label: 'Teams', title: 'Teams & players' },
    { id: 'comps', icon: 'trophy', label: 'Comps', title: 'Competitions' },
    { id: 'match', icon: 'whistle', label: 'Match', title: 'Match day' },
    { id: 'sessions', icon: 'calendar', label: 'Sessions', title: 'Training sessions' },
    { id: 'library', icon: 'folder', label: 'Library', title: 'Board library' },
  ];
  const WS_PANE = { home: 'home', teams: 'team', comps: 'comps', match: 'match', sessions: 'sessions', library: 'library' };
  UI.SECTIONS = SECTIONS;
  UI.section = 'home';

  /* ==================================================================== init */
  UI.init = function () {
    applyTheme();
    buildBrand(); buildTopbar(); buildToolrail(); buildTray(); buildTabs(); buildMobileBar(); buildHUD(); buildAppNav();
    bindTitle();
    document.body.dataset.section = UI.section;
    renderTab(activeTab);
    renderFrames();
    renderSelbar();
    K1.on('change', onChange);
    K1.on('selection', () => { renderSelbar(); updateHUD(); });
    K1.on('tool', () => { renderToolrail(); updateHUD(); });
    K1.on('stamp', stamp => { renderTray(); updateHUD(); if (stamp && sheetPane === 'tray') UI.closeSheet(); });
    K1.on('frames', () => { scheduleFrames(); updateHUD(); refreshPaneIf(['frames']); });
    K1.on('doc', onDoc);
    K1.on('pitch', () => { updateHUD(); });
    K1.on('view', updateHUD);
    K1.on('settings', () => { applyTheme(); K1.Render.invalidatePitch(); K1.Render.renderAll(); renderTray(); });
    K1.on('anim', renderPlayback);
    K1.on('animtick', onAnimTick);
    K1.on('library', () => refreshPaneIf(['library']));
    K1.on('squad', () => refreshPaneIf(['team']));
    K1.on('sessions', () => refreshPaneIf(['sessions']));
    K1.on('match', () => refreshPaneIf(['match']));
    K1.on('comps', () => refreshPaneIf(['comps']));
    K1.on('logo', () => { buildBrand(); });
    K1.on('saved', updateTopbar);
    window.addEventListener('resize', () => { updateHUD(); });
    document.addEventListener('pointerdown', e => { if (!e.target.closest('#ctxmenu')) UI.hideContext(); if (!e.target.closest('.popover') && !e.target.closest('[data-popover]')) closePopovers(); }, true);
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && S.presenting) UI.togglePresent(false); });
  };

  function onChange(ev) {
    if (!S.playing) { K1.Render.renderObjects(); K1.Render.renderUI(); }
    updateTopbar();
    if (!selbarEditing) renderSelbar();
    scheduleFrames();
    if (ev && ev.label === 'load') { K1.Render.invalidatePitch(); K1.Render.layout(true); }
    else K1.Render.renderPitch();
    updateHUD();
    if (K1.Store) K1.Store.autosave();
  }
  function onDoc() {
    $('#boardTitle').value = S.doc.title;
    K1.Render.invalidatePitch();
    K1.Render.layout(true);
    refreshPaneIf(['board', 'frames', 'team']);
    updateTopbar();
  }
  function refreshPaneIf(names) {
    if (names.includes(activeTab) && !K1.isMobile()) renderTab(activeTab);
    if (sheetPane && names.includes(sheetPane)) renderSheetPane();
    const wsPane = WS_PANE[UI.section];
    if (UI.section !== 'board' && (names.includes(wsPane) || UI.section === 'home')) renderWorkspace();
  }
  UI.refreshPane = () => { renderTab(activeTab); if (sheetPane) renderSheetPane(); if (UI.section !== 'board') renderWorkspace(); };

  /* ================================================================ sections */
  function buildAppNav() {
    const nav = $('#appnav'); if (!nav) return;
    nav.innerHTML = SECTIONS.map(s => '<button class="nav-item' + (s.id === UI.section ? ' on' : '') + '" data-section="' + s.id + '" title="' + esc(s.title) + '">' + icon(s.icon, { size: 22 }) + '<span>' + esc(s.label) + '</span></button>').join('') +
      '<span class="nav-gap"></span><button class="nav-item" data-section="settings" title="Settings">' + icon('settings', { size: 20 }) + '<span>Settings</span></button>';
    $$('[data-section]', nav).forEach(b => { b.onclick = () => { if (b.dataset.section === 'settings') UI.showSettings(); else UI.goSection(b.dataset.section); }; });
  }
  /** Switch the app to a section: the board keeps its own layout, everything else renders in the workspace. */
  UI.goSection = function (id) {
    if (!SECTIONS.find(s => s.id === id)) id = 'home';
    const prev = UI.section;
    UI.section = id;
    document.body.dataset.section = id;
    $$('#appnav .nav-item').forEach(b => b.classList.toggle('on', b.dataset.section === id));
    const inMore = !['home', 'board', 'teams', 'comps'].includes(id);
    $$('#mobilebar .mb-item').forEach(b => b.classList.toggle('on', b.dataset.mb === id || (inMore && b.dataset.mb === 'more')));
    const st = $('#sectionTitle'); if (st) { const sec = SECTIONS.find(s => s.id === id); st.textContent = id === 'board' ? '' : (sec ? sec.title : ''); }
    if (UI.isSheetOpen() && sheetPane !== 'tray') UI.closeSheet();
    closePopovers(); UI.hideContext();
    if (id === 'board') { setTimeout(() => K1.Render.layout(true), 30); setTimeout(() => K1.Render.layout(true), 300); }
    else renderWorkspace();
    if (prev !== id) K1.emit('section', id);
    try { sessionStorage.setItem('k1tb:section', id); } catch (e) { /* ignore */ }
    const ws = $('#workspace'); if (ws && prev !== id) ws.scrollTop = 0;
  };
  function renderWorkspace() {
    const el = $('#wsInner'); if (!el || UI.section === 'board') return;
    const pane = WS_PANE[UI.section];
    const fn = K1.Panes && K1.Panes[pane];
    el.dataset.pane = pane;
    const ws = $('#workspace'); const st = ws ? ws.scrollTop : 0;
    if (fn) fn(el); else el.innerHTML = '';
    if (ws) ws.scrollTop = st;
  }
  UI.renderWorkspace = renderWorkspace;

  /* ================================================================== theme */
  function applyTheme() {
    document.documentElement.dataset.theme = K1.settings.uiTheme === 'light' ? 'light' : 'dark';
    document.documentElement.style.fontSize = (100 * (K1.settings.fontScale || 1)) + '%';
    const meta = $('meta[name=theme-color]'); if (meta) meta.content = K1.settings.uiTheme === 'light' ? '#f4f6f8' : '#0b1116';
  }
  UI.setTheme = t => K1.saveSettings({ uiTheme: t });

  /* ================================================================== brand */
  function buildBrand() {
    const b = $('#brand');
    b.innerHTML = '<div class="brand-badge">' + K1.logoHTML(38) + '</div><div class="brand-text"><b>K1 SHOOTERS</b><span>Tactics Board</span></div>';
    b.onclick = () => UI.goSection('home');
    b.title = 'Home';
  }

  /* ================================================================= topbar */
  function buildTopbar() {
    const a = $('#topActions');
    a.innerHTML = [
      '<button class="icon-btn board-only" id="btnUndo" title="Undo (Ctrl+Z)">' + icon('undo') + '</button>',
      '<button class="icon-btn hide-sm board-only" id="btnRedo" title="Redo (Ctrl+Y)">' + icon('redo') + '</button>',
      '<span class="sep board-only"></span>',
      '<button class="btn btn-ghost hide-sm board-only" id="btnNew" title="New board">' + icon('plus') + '<span>New</span></button>',
      '<button class="btn btn-ghost board-only" id="btnSave" title="Save to library (Ctrl+S)">' + icon('save') + '<span class="hide-sm">Save</span><i class="dirty-dot" hidden></i></button>',
      '<button class="btn btn-ghost board-only" id="btnExport" title="Export image / video / file" data-popover="export">' + icon('download') + '<span class="hide-sm">Export</span></button>',
      '<button class="btn btn-ghost hide-sm board-only" id="btnShare" title="Share">' + icon('share') + '<span>Share</span></button>',
      '<button class="btn btn-primary board-only" id="btnPresent" title="Present (F)">' + icon('fullscreen') + '<span class="hide-sm">Present</span></button>',
      '<button class="icon-btn" id="btnMore" title="Settings & help" data-popover="more">' + icon('more') + '</button>',
    ].join('');
    $('#btnUndo').onclick = () => K1.undo();
    $('#btnRedo').onclick = () => K1.redo();
    $('#btnNew').onclick = () => UI.newBoardDialog();
    $('#btnSave').onclick = () => K1.Store.saveCurrent();
    $('#btnExport').onclick = e => UI.exportMenu(e.currentTarget);
    $('#btnShare').onclick = () => UI.shareDialog();
    $('#btnPresent').onclick = () => UI.togglePresent(true);
    $('#btnMore').onclick = e => UI.popover(e.currentTarget, [
      { label: 'Settings', icon: 'settings', onClick: () => UI.showSettings() },
      { label: 'Help & shortcuts', icon: 'help', onClick: () => UI.showHelp() },
      { label: 'Install on this device', icon: 'smartphone', onClick: () => UI.installApp() },
      { sep: true },
      { label: 'Import board / backup (JSON)', icon: 'upload', onClick: () => UI.importFile() },
      { label: 'Back up everything (JSON)', icon: 'download', onClick: () => K1.Store.exportAll() },
      { sep: true },
      { label: K1.settings.uiTheme === 'light' ? 'Dark interface' : 'Light interface', icon: K1.settings.uiTheme === 'light' ? 'moon' : 'sun', onClick: () => UI.setTheme(K1.settings.uiTheme === 'light' ? 'dark' : 'light') },
      { label: 'About K1 Tactics Board', icon: 'info', onClick: () => UI.about() },
    ]);
    updateTopbar();
    const menuBtn = $('#btnMenu'); if (menuBtn) menuBtn.onclick = () => UI.openPane('more');
  }
  function updateTopbar() {
    const u = $('#btnUndo'), r = $('#btnRedo');
    if (u) u.disabled = !K1.canUndo();
    if (r) r.disabled = !K1.canRedo();
    const dot = $('#btnSave .dirty-dot'); if (dot) dot.hidden = !S.dirty;
    const t = $('#boardTitle'); if (t && document.activeElement !== t) t.value = S.doc.title;
  }
  function bindTitle() {
    const t = $('#boardTitle');
    t.value = S.doc.title;
    t.addEventListener('change', () => { const v = t.value.trim() || 'Untitled board'; t.value = v; S.doc.title = v; S.dirty = true; K1.Store.autosave(); });
    t.addEventListener('keydown', e => { if (e.key === 'Enter') t.blur(); });
    t.addEventListener('focus', () => t.select());
  }

  /* =============================================================== toolrail */
  function buildToolrail() { renderToolrail(); }
  function renderToolrail() {
    const rail = $('#toolrail');
    let s = '<div class="rail-panes"><button class="tool pane-btn" data-pane="board" title="Pitch & display">' + icon('layers', { size: 20 }) + '</button><button class="tool pane-btn" data-pane="tray" title="Add players & equipment">' + icon('plus', { size: 22 }) + '</button><button class="tool pane-btn" data-pane="playbook" title="Playbook">' + icon('book', { size: 20 }) + '</button><button class="tool pane-btn" data-pane="frames" title="Animate">' + icon('film', { size: 20 }) + '</button></div>';
    s += '<div class="rail-tools">';
    TOOLS.forEach(t => {
      if (t.sep) { s += '<span class="rail-sep"></span>'; return; }
      s += '<button class="tool' + (S.tool === t.id && !S.stamp ? ' active' : '') + '" data-tool="' + t.id + '" title="' + esc(t.label) + (t.key ? ' (' + t.key + ')' : '') + '" aria-label="' + esc(t.label) + '">' + icon(t.icon, { size: 22 }) + '</button>';
    });
    s += '</div><div class="rail-style">';
    s += '<button class="tool swatch-btn" data-popover="color" title="Drawing colour" aria-label="Drawing colour"><span class="swatch" style="background:' + S.style.color + '"></span></button>';
    s += '<button class="tool width-btn" data-popover="width" title="Line thickness" aria-label="Line thickness"><span class="width-preview" style="height:' + Math.round(S.style.width * 8) + 'px"></span></button>';
    s += '</div>';
    rail.innerHTML = s;
    $$('[data-pane]', rail).forEach(b => { b.onclick = () => UI.openPane(b.dataset.pane); });
    $$('[data-tool]', rail).forEach(b => { b.onclick = () => { K1.Board.setStamp(null); K1.setTool(b.dataset.tool); }; });
    $('.swatch-btn', rail).onclick = e => colorPopover(e.currentTarget, S.style.color, c => { S.style.color = c; renderToolrail(); const sel = K1.selected().filter(o => o.type !== 'player' && o.type !== 'ball' || o.type === 'player' && o.team === 'neutral'); if (sel.length) K1.updateObjects(sel.map(o => o.id), { color: c }); });
    $('.width-btn', rail).onclick = e => UI.popover(e.currentTarget, [
      { label: 'Thin', icon: 'minus', check: S.style.width < .35, onClick: () => setWidth(.28) },
      { label: 'Medium', icon: 'minus', check: S.style.width >= .35 && S.style.width < .6, onClick: () => setWidth(.45) },
      { label: 'Thick', icon: 'minus', check: S.style.width >= .6, onClick: () => setWidth(.7) },
    ]);
  }
  function setWidth(w) { S.style.width = w; K1.saveSettings({ arrowWidth: w }); renderToolrail(); const sel = K1.selected().filter(o => o.type === 'path'); if (sel.length) K1.updateObjects(sel.map(o => o.id), o => ({ width: o.head === 'shot' ? Math.max(.7, w * 1.6) : w })); }

  function colorPopover(anchor, current, onPick, extra) {
    const pal = (extra || []).concat(K1.PALETTE);
    const pop = openPopover(anchor, '<div class="color-grid">' + pal.map(c => '<button class="color-dot' + (c === current ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>').join('') + '<label class="color-dot custom" title="Custom colour">' + icon('palette', { size: 16 }) + '<input type="color" value="' + (current && current[0] === '#' ? current.slice(0, 7) : '#ffffff') + '"></label></div>');
    $$('.color-dot[data-c]', pop).forEach(b => { b.onclick = () => { onPick(b.dataset.c); closePopovers(); }; });
    $('input[type=color]', pop).oninput = e => { onPick(e.target.value); };
  }
  UI.colorPopover = colorPopover;

  /* =================================================================== tray */
  function chipSVG(item) {
    const doc = S.doc;
    const ctx = { proj: { toScreen: (x, y) => [x, y], toPitch: (x, y) => [x, y], angle: 0, portrait: false }, r: 1.9, showNames: false, showNumbers: true, kits: { home: K1.kitById(doc.teams.home.kit), away: K1.kitById(doc.teams.away.kit) }, interactive: false };
    let o, vb = '-3 -3 6 6';
    if (item.kind === 'player') { o = K1.make.player(item.team, item.gk ? 1 : 9, 0, 0, { gk: !!item.gk }); if (item.team === 'neutral') o.n = 0; }
    else if (item.kind === 'ref') o = K1.make.ref(0, 0);
    else if (item.kind === 'ball') o = K1.make.ball(0, 0);
    else if (item.kind === 'equip') { o = K1.make.equip(item.sub, 0, 0, { color: ['cone', 'disc', 'hurdle'].includes(item.sub) ? S.style.coneColor : item.sub === 'mannequin' ? '#facc15' : '#f8fafc' }); const sz = K1.equipSize(item.sub); const m = Math.max(sz.w, sz.h) / 2 + .6; vb = (-m) + ' ' + (-m) + ' ' + (2 * m) + ' ' + (2 * m); }
    else if (item.kind === 'text') o = K1.make.text(0, 0, 'Aa', { size: 2.6, bg: false, color: '#ffffff' });
    return '<svg viewBox="' + vb + '" width="40" height="40"><defs><clipPath id="tokClip"><circle r="1.9"/></clipPath></defs>' + K1.Render.objectSVG(o, ctx) + '</svg>';
  }
  function buildTray() { renderTray(); }
  function renderTray() {
    const tray = $('#tray');
    tray.innerHTML = trayHTML();
    bindTray(tray);
  }
  function trayHTML() {
    let s = '<div class="tray-scroll">';
    TRAY.forEach(it => {
      const on = S.stamp && S.stamp.key === it.key;
      s += '<button class="chip' + (on ? ' on' : '') + '" data-chip="' + it.key + '" title="Tap to place repeatedly · or drag onto the pitch">' + chipSVG(it) + '<span>' + esc(it.label) + '</span></button>';
    });
    s += '</div><div class="tray-side"><button class="chip cone-color" data-popover="conecolor" title="Equipment colour"><span class="swatch" style="background:' + S.style.coneColor + '"></span><span>Colour</span></button></div>';
    return s;
  }
  function bindTray(root) {
    $$('[data-chip]', root).forEach(b => {
      const item = TRAY.find(t => t.key === b.dataset.chip);
      b.addEventListener('pointerdown', e => { if (e.button !== 0 && e.pointerType === 'mouse') return; e.preventDefault(); K1.Board.beginTrayDrag(Object.assign({ html: chipSVG(item) }, item), e); });
      b.addEventListener('click', e => e.preventDefault());
    });
    const cc = $('.cone-color', root);
    if (cc) cc.onclick = e => colorPopover(e.currentTarget, S.style.coneColor, c => { S.style.coneColor = c; renderTray(); const sel = K1.selected().filter(o => o.type === 'equip'); if (sel.length) K1.updateObjects(sel.map(o => o.id), { color: c }); }, K1.CONE_COLORS);
  }
  UI.trayHTML = trayHTML; UI.bindTray = bindTray;

  /* ==================================================================== HUD */
  function buildHUD() {
    $('#hudTR').innerHTML = '<div class="hud-group"><button class="icon-btn sm" id="zoomOut" title="Zoom out (-)">' + icon('zoomOut', { size: 18 }) + '</button><button class="hud-zoom" id="zoomFit" title="Fit (0)">100%</button><button class="icon-btn sm" id="zoomIn" title="Zoom in (+)">' + icon('zoomIn', { size: 18 }) + '</button></div>' +
      '<div class="hud-group"><button class="icon-btn sm" id="orientBtn" title="Rotate pitch (auto / landscape / portrait)">' + icon('rotate', { size: 18 }) + '</button><button class="icon-btn sm" id="hudFull" title="Present / fullscreen (F)">' + icon('maximize', { size: 18 }) + '</button></div>';
    $('#zoomIn').onclick = () => K1.Render.zoomAt(1.3);
    $('#zoomOut').onclick = () => K1.Render.zoomAt(1 / 1.3);
    $('#zoomFit').onclick = () => K1.Render.resetView();
    $('#orientBtn').onclick = () => { const o = S.doc.pitch.orientation || 'auto'; const next = o === 'auto' ? 'landscape' : o === 'landscape' ? 'portrait' : 'auto'; K1.mutate(() => { S.doc.pitch.orientation = next; }, 'orientation'); K1.Render.layout(true); UI.toast('Pitch orientation: ' + next); };
    $('#hudFull').onclick = () => UI.togglePresent(true);
    $('#hudBC').innerHTML = '<div class="hud-group playbar"><button class="icon-btn sm" data-pb="prev" title="Previous frame ([)">' + icon('skipBack', { size: 18 }) + '</button><button class="icon-btn sm play" data-pb="play" title="Play / pause (Space)">' + icon('play', { size: 18 }) + '</button><button class="icon-btn sm" data-pb="next" title="Next frame (])">' + icon('skipFwd', { size: 18 }) + '</button><span class="frame-ind" id="frameInd">1 / 1</span><button class="icon-btn sm" data-pb="add" title="Add frame (N)">' + icon('plus', { size: 18 }) + '</button></div>';
    $$('[data-pb]').forEach(b => { b.onclick = () => { const a = b.dataset.pb; if (a === 'prev') K1.Anim.prev(); else if (a === 'next') K1.Anim.next(); else if (a === 'play') K1.Anim.toggle(); else if (a === 'add') K1.Anim.addFrame(); }; });
    updateHUD();
  }
  function updateHUD() {
    const z = $('#zoomFit'); if (z) z.textContent = Math.round(K1.Render.zoom() * 100) + '%';
    const tl = $('#hudTL');
    if (tl) {
      let s = '';
      if (S.stamp) {
        const st = S.stamp;
        const what = st.kind === 'player' ? (st.team === 'home' ? S.doc.teams.home.name : st.team === 'away' ? S.doc.teams.away.name : 'Neutral') + (st.gk ? ' GK' : '') + ' · next #' + K1.nextNumber(st.team, st.gk) : st.kind === 'equip' ? st.sub : st.kind;
        s += '<div class="hud-pill stamp">' + icon('target', { size: 14 }) + '<span>Tap the pitch to place <b>' + esc(what) + '</b></span><button class="pill-btn" id="stampDone">Done</button></div>';
      } else {
        const fr = K1.frame();
        if (S.doc.frames.length > 1 || fr.caption) s += '<button class="hud-pill caption" id="captionBtn" title="Edit frame caption">' + icon('notes', { size: 14 }) + '<span>' + (fr.caption ? esc(fr.caption) : '<i>Add a caption…</i>') + '</span></button>';
      }
      if (K1.settings.snap) s += '<div class="hud-pill mini">' + icon('magnet', { size: 12 }) + 'Snap</div>';
      tl.innerHTML = s;
      const done = $('#stampDone'); if (done) done.onclick = () => K1.Board.setStamp(null);
      const cb = $('#captionBtn'); if (cb) cb.onclick = async () => { const v = await UI.prompt('Frame caption', { value: K1.frame().caption, placeholder: 'What happens in this frame?' }); if (v != null) K1.Anim.setCaption(S.frameIndex, v); };
    }
    const ind = $('#frameInd'); if (ind) ind.textContent = (S.frameIndex + 1) + ' / ' + S.doc.frames.length;
    const bc = $('#hudBC'); if (bc) bc.classList.toggle('show', S.doc.frames.length > 1 || S.presenting);
    const ob = $('#orientBtn'); if (ob) ob.classList.toggle('active', (S.doc.pitch.orientation || 'auto') !== 'auto');
  }
  UI.updateHUD = updateHUD;
  function renderPlayback() {
    $$('[data-pb=play]').forEach(b => { b.innerHTML = icon(S.playing ? 'pause' : 'play', { size: 18 }); b.classList.toggle('active', S.playing); });
    const fp = $('#framesPlay'); if (fp) { fp.innerHTML = icon(S.playing ? 'pause' : 'play', { size: 18 }) + '<span>' + (S.playing ? 'Pause' : 'Play') + '</span>'; }
    if (!S.playing) { scheduleFrames(); updateHUD(); renderSelbar(); }
  }
  function onAnimTick(d) {
    const sc = $('#scrub'); if (sc && document.activeElement !== sc) { sc.max = d.total; sc.value = d.t; }
    const cap = $('#presentCaption'); if (cap) cap.textContent = d.scene.caption || '';
    const ind = $('#frameInd'); if (ind) ind.textContent = (d.scene.frameIndex + 1 + (d.scene.progress > .5 ? 1 : 0) > S.doc.frames.length ? S.doc.frames.length : d.scene.frameIndex + 1) + ' / ' + S.doc.frames.length;
    $$('.frame-thumb').forEach((el, i) => el.classList.toggle('playing', i === d.scene.frameIndex));
  }

  /* ================================================================ selbar */
  function renderSelbar() {
    const bar = $('#selbar');
    if (!bar) return;
    const sel = K1.selected();
    if (!sel.length || S.playing || S.presenting) { bar.hidden = true; bar.innerHTML = ''; return; }
    bar.hidden = false;
    const one = sel.length === 1 ? sel[0] : null;
    let s = '';
    const btn = (act, ic, title, cls) => '<button class="sb-btn ' + (cls || '') + '" data-act="' + act + '" title="' + esc(title) + '">' + icon(ic, { size: 16 }) + '</button>';
    if (one && one.type === 'player') {
      s += '<span class="sb-label">' + (one.team === 'ref' ? 'Referee' : one.team === 'home' ? esc(S.doc.teams.home.name) : one.team === 'away' ? esc(S.doc.teams.away.name) : 'Neutral') + '</span>';
      if (one.team !== 'ref') s += '<input class="sb-input num" type="number" min="0" max="99" value="' + one.n + '" data-field="n" aria-label="Number">';
      s += '<input class="sb-input name" type="text" value="' + esc(one.name) + '" placeholder="Name" data-field="name" aria-label="Name">';
      if (one.team !== 'ref') {
        s += '<div class="sb-seg">' + ['home', 'away', 'neutral'].map(t => '<button class="' + (one.team === t ? 'on' : '') + '" data-team="' + t + '">' + (t === 'home' ? 'H' : t === 'away' ? 'A' : 'N') + '</button>').join('') + '</div>';
        s += '<button class="sb-btn' + (one.gk ? ' on' : '') + '" data-act="gk" title="Goalkeeper">GK</button>';
        s += '<button class="sb-btn' + (one.captain ? ' on' : '') + '" data-act="captain" title="Captain">C</button>';
      }
      s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:' + (one.color || 'transparent') + ';border:2px solid ' + (one.color ? one.color : 'var(--muted)') + '"></span></button>';
    } else if (one && one.type === 'path') {
      const kinds = [['pass', 'pass', 'Pass'], ['run', 'run', 'Run'], ['dribble', 'dribble', 'Dribble'], ['shot', 'shot', 'Shot'], ['curve', 'curve', 'Curve'], ['line', 'line', 'Line']];
      s += '<div class="sb-seg">' + kinds.map(k => '<button class="' + (one.kind === k[0] ? 'on' : '') + '" data-kind="' + k[0] + '" title="' + k[2] + '">' + icon(k[1], { size: 15 }) + '</button>').join('') + '</div>';
      s += '<button class="sb-btn' + (one.dash ? ' on' : '') + '" data-act="dash" title="Dashed">' + icon('run', { size: 16 }) + '</button>';
      s += '<button class="sb-btn' + (one.wave ? ' on' : '') + '" data-act="wave" title="Wavy">' + icon('dribble', { size: 16 }) + '</button>';
      s += '<button class="sb-btn' + (one.head !== 'none' ? ' on' : '') + '" data-act="head" title="Arrowhead">' + icon('arrowRight', { size: 16 }) + '</button>';
      s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:' + one.color + '"></span></button>';
      s += '<input class="sb-range" type="range" min=".15" max="1.2" step=".05" value="' + one.width + '" data-field="width" title="Thickness">';
    } else if (one && one.type === 'shape') {
      s += '<span class="sb-label">' + esc(one.kind) + '</span>';
      s += '<button class="sb-btn' + (one.fill ? ' on' : '') + '" data-act="fill" title="Fill">' + icon('zone', { size: 16 }) + '</button>';
      s += '<input class="sb-range" type="range" min=".05" max=".9" step=".05" value="' + (one.opacity == null ? .3 : one.opacity) + '" data-field="opacity" title="Fill opacity">';
      s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:' + one.color + '"></span></button>';
      s += '<input class="sb-input name" type="text" value="' + esc(one.label || '') + '" placeholder="Label" data-field="label" aria-label="Label">';
      s += btn('rotate', 'rotate', 'Rotate 15°');
    } else if (one && one.type === 'text') {
      s += '<input class="sb-input wide" type="text" value="' + esc(one.text) + '" data-field="text" aria-label="Text">';
      s += '<button class="sb-btn" data-act="smaller" title="Smaller">A-</button><button class="sb-btn" data-act="bigger" title="Bigger">A+</button>';
      s += '<button class="sb-btn' + (one.bg !== false ? ' on' : '') + '" data-act="bg" title="Background">' + icon('rect', { size: 16 }) + '</button>';
      s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:' + one.color + '"></span></button>';
    } else if (one && one.type === 'equip') {
      s += '<span class="sb-label">' + esc(one.kind) + '</span>';
      s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:' + one.color + '"></span></button>';
      s += btn('rotateL', 'undo', 'Rotate −15°') + btn('rotate', 'rotate', 'Rotate +15°') + btn('rotate90', 'refresh', 'Rotate 90°');
    } else if (one && (one.type === 'measure' || one.type === 'offside' || one.type === 'ball')) {
      s += '<span class="sb-label">' + (one.type === 'offside' ? 'Offside line' : one.type === 'measure' ? 'Distance' : 'Ball') + '</span>';
      if (one.type !== 'ball') s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:' + one.color + '"></span></button>';
    } else {
      s += '<span class="sb-label">' + sel.length + ' selected</span>';
      if (sel.filter(o => o.type === 'player').length >= 2) s += '<button class="sb-btn wide-btn" data-act="link" title="Connect players with lines">' + icon('linkPlayers', { size: 16 }) + '<span>Link</span></button>';
      s += '<button class="sb-btn" data-act="color" title="Colour"><span class="swatch" style="background:var(--accent)"></span></button>';
    }
    s += '<span class="sb-gap"></span>';
    s += btn('front', 'front', 'Bring to front') + btn('dup', 'duplicate', 'Duplicate (Ctrl+D)') + btn('del', 'trash', 'Delete', 'danger');
    bar.innerHTML = s;
    // bindings
    const ids = sel.map(o => o.id);
    $$('[data-act]', bar).forEach(b => {
      b.onclick = e => {
        const a = b.dataset.act;
        if (a === 'del') K1.Board.deleteSelection();
        else if (a === 'dup') K1.Board.duplicateSelection();
        else if (a === 'front') ids.forEach(id => K1.Board.bringToFront(id));
        else if (a === 'gk') K1.updateObjects(ids, o => ({ gk: !o.gk }));
        else if (a === 'captain') K1.updateObjects(ids, o => ({ captain: !o.captain }));
        else if (a === 'dash') K1.updateObjects(ids, o => ({ dash: !o.dash }));
        else if (a === 'wave') K1.updateObjects(ids, o => ({ wave: !o.wave }));
        else if (a === 'head') K1.updateObjects(ids, o => ({ head: o.head === 'none' ? 'arrow' : 'none' }));
        else if (a === 'fill') K1.updateObjects(ids, o => ({ fill: !o.fill }));
        else if (a === 'bg') K1.updateObjects(ids, o => ({ bg: o.bg === false }));
        else if (a === 'smaller') K1.updateObjects(ids, o => ({ size: Math.max(1, (o.size || 2.4) - .3) }));
        else if (a === 'bigger') K1.updateObjects(ids, o => ({ size: Math.min(8, (o.size || 2.4) + .3) }));
        else if (a === 'rotate') K1.Board.rotateSelection(15);
        else if (a === 'rotateL') K1.Board.rotateSelection(-15);
        else if (a === 'rotate90') K1.Board.rotateSelection(90);
        else if (a === 'link') K1.Templates.linkSelected();
        else if (a === 'color') colorPopover(b, one ? one.color : null, c => { K1.updateObjects(ids, { color: c }); }, one && one.type === 'player' ? ['kit'] : one && one.type === 'equip' ? K1.CONE_COLORS : []);
      };
    });
    $$('[data-team]', bar).forEach(b => { b.onclick = () => K1.updateObjects(ids, { team: b.dataset.team, gk: false }); });
    $$('[data-kind]', bar).forEach(b => { b.onclick = () => { const k = b.dataset.kind; const p = K1.make.path(k, [[0, 0], [1, 1]]); K1.updateObjects(ids, o => ({ kind: k, geo: p.geo === 'curve' ? 'curve' : (o.geo === 'free' ? 'free' : 'straight'), dash: p.dash, wave: p.wave, head: p.head, width: k === 'shot' ? Math.max(.7, S.style.width * 1.6) : S.style.width, ctrl: p.geo === 'curve' && !o.ctrl ? [(o.points[0][0] + o.points[o.points.length - 1][0]) / 2 - (o.points[o.points.length - 1][1] - o.points[0][1]) * .3, (o.points[0][1] + o.points[o.points.length - 1][1]) / 2 + (o.points[o.points.length - 1][0] - o.points[0][0]) * .3] : o.ctrl })); }; });
    $$('[data-field]', bar).forEach(inp => {
      inp.addEventListener('focus', () => { selbarEditing = true; });
      inp.addEventListener('blur', () => { selbarEditing = false; });
      const apply = () => {
        const f = inp.dataset.field;
        let v = inp.value;
        if (f === 'n') v = K1.clamp(parseInt(v, 10) || 0, 0, 99);
        if (f === 'width' || f === 'opacity') v = parseFloat(v);
        K1.updateObjects(ids, { [f]: v });
      };
      if (inp.type === 'range') { inp.addEventListener('input', () => { K1.begin(); K1.objects().forEach(o => { if (ids.includes(o.id)) o[inp.dataset.field] = parseFloat(inp.value); }); K1.Render.renderObjects(); }); inp.addEventListener('change', apply); }
      else { inp.addEventListener('change', apply); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { inp.blur(); } if (e.key === 'Escape') inp.blur(); }); }
    });
  }
  // 'kit' pseudo colour = reset to kit colours
  const origUpdate = K1.updateObjects;
  K1.updateObjects = function (ids, patch, label) { if (patch && patch.color === 'kit') patch = { color: undefined }; return origUpdate(ids, patch, label); };

  /* ============================================================ frames bar */
  function scheduleFrames() { if (framesRaf) return; framesRaf = requestAnimationFrame(() => { framesRaf = null; renderFrames(); }); }
  function renderFrames() {
    const bar = $('#framesBar'); if (!bar) return;
    const frames = S.doc.frames;
    let s = '<div class="frames-head"><span class="frames-title">' + icon('film', { size: 15 }) + ' Frames <b>' + frames.length + '</b></span>';
    s += '<button class="btn btn-sm btn-ghost" data-fa="add" title="Add frame (N): keeps players, clears drawings">' + icon('plus', { size: 15 }) + '<span>Add frame</span></button>';
    s += '<button class="btn btn-sm btn-ghost" data-fa="dup" title="Duplicate frame (keeps drawings)">' + icon('duplicate', { size: 15 }) + '</button>';
    s += '<button class="btn btn-sm btn-ghost" data-fa="del" title="Delete frame"' + (frames.length < 2 ? ' disabled' : '') + '>' + icon('trash', { size: 15 }) + '</button>';
    s += '<span class="sb-gap"></span>';
    s += '<button class="btn btn-sm ' + (S.playing ? 'btn-primary' : 'btn-ghost') + '" id="framesPlay">' + icon(S.playing ? 'pause' : 'play', { size: 15 }) + '<span>' + (S.playing ? 'Pause' : 'Play') + '</span></button>';
    s += '<button class="btn btn-sm btn-ghost" data-fa="stop" title="Stop">' + icon('stop', { size: 14 }) + '</button>';
    s += '<button class="btn btn-sm btn-ghost' + (K1.Anim.loop ? ' on' : '') + '" data-fa="loop" title="Loop">' + icon('loop', { size: 15 }) + '</button>';
    s += '<select class="select sm" id="speedSel" title="Speed">' + [.5, .75, 1, 1.5, 2].map(v => '<option value="' + v + '"' + (K1.Anim.speed === v ? ' selected' : '') + '>' + v + '×</option>').join('') + '</select>';
    s += '<input type="range" class="scrub" id="scrub" min="0" max="' + K1.Anim.total() + '" value="' + K1.Anim.t + '" step="10" title="Scrub"' + (frames.length < 2 ? ' disabled' : '') + '>';
    s += '</div><div class="frames-strip">';
    frames.forEach((fr, i) => {
      s += '<div class="frame-thumb' + (i === S.frameIndex ? ' active' : '') + '" data-frame="' + i + '" title="' + esc(fr.caption || 'Frame ' + (i + 1)) + '">' + K1.Render.thumbSVG(S.doc, fr, 96, 62) + '<span class="fnum">' + (i + 1) + '</span>' + (fr.caption ? '<span class="fcap">' + esc(fr.caption) + '</span>' : '') + '</div>';
      if (i < frames.length - 1) s += '<span class="frame-dur" title="Transition time">' + (Math.round(fr.duration / 100) / 10) + 's</span>';
    });
    s += '</div>';
    bar.innerHTML = s;
    $$('[data-fa]', bar).forEach(b => { b.onclick = () => { const a = b.dataset.fa; if (a === 'add') K1.Anim.addFrame(); else if (a === 'dup') K1.Anim.duplicateFrame(); else if (a === 'del') K1.Anim.deleteFrame(); else if (a === 'stop') K1.Anim.stop(); else if (a === 'loop') { K1.Anim.loop = !K1.Anim.loop; renderFrames(); } }; });
    $('#framesPlay').onclick = () => K1.Anim.toggle();
    $('#speedSel').onchange = e => { K1.Anim.speed = parseFloat(e.target.value); };
    const sc = $('#scrub');
    sc.addEventListener('input', () => { if (S.playing) K1.Anim.pause(); K1.Anim.seek(parseFloat(sc.value)); });
    sc.addEventListener('change', () => K1.Anim.endScrub());
    $$('.frame-thumb', bar).forEach(el => {
      el.onclick = () => K1.Anim.goTo(parseInt(el.dataset.frame, 10));
      el.oncontextmenu = e => { e.preventDefault(); frameMenu(parseInt(el.dataset.frame, 10), e.clientX, e.clientY); };
    });
    const active = $('.frame-thumb.active', bar); if (active && active.scrollIntoView) { try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ } }
  }
  UI.renderFrames = renderFrames;
  function frameMenu(i, x, y) {
    UI.contextMenu([
      { label: 'Caption…', icon: 'notes', onClick: async () => { const v = await UI.prompt('Frame caption', { value: S.doc.frames[i].caption }); if (v != null) K1.Anim.setCaption(i, v); } },
      { label: 'Transition time…', icon: 'clock', onClick: async () => { const v = await UI.prompt('Transition to next frame (seconds)', { value: String(S.doc.frames[i].duration / 1000), type: 'number' }); if (v != null) K1.Anim.setDuration(i, parseFloat(v) * 1000); } },
      { sep: true },
      { label: 'Move left', icon: 'chevronLeft', disabled: i === 0, onClick: () => K1.Anim.moveFrame(i, -1) },
      { label: 'Move right', icon: 'chevronRight', disabled: i === S.doc.frames.length - 1, onClick: () => K1.Anim.moveFrame(i, 1) },
      { label: 'Duplicate', icon: 'duplicate', onClick: () => { K1.Anim.goTo(i); K1.Anim.duplicateFrame(); } },
      { sep: true },
      { label: 'Delete frame', icon: 'trash', danger: true, disabled: S.doc.frames.length < 2, onClick: () => K1.Anim.deleteFrame(i) },
    ], x, y);
  }
  UI.frameMenu = frameMenu;

  /* ============================================================ side panel */
  function buildTabs() {
    const tabs = $('#tabs');
    tabs.innerHTML = TABS.map(t => '<button class="tab' + (t.id === activeTab ? ' active' : '') + '" data-tab="' + t.id + '" title="' + t.label + '">' + icon(t.icon, { size: 18 }) + '<span>' + t.label + '</span></button>').join('');
    $$('.tab', tabs).forEach(b => { b.onclick = () => UI.showTab(b.dataset.tab); });
  }
  UI.showTab = function (id) {
    activeTab = id;
    $$('#tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    renderTab(id);
  };
  function renderTab(id) {
    const pane = $('#pane'); if (!pane) return;
    const fn = K1.Panes && K1.Panes[id];
    pane.dataset.pane = id;
    if (fn) fn(pane); else pane.innerHTML = '<div class="empty">Coming soon</div>';
  }
  /** Open something by name: app sections switch screens; board panes open in the side panel (desktop) or a sheet (phone). */
  UI.openPane = function (id) {
    if (id === 'team') id = 'teams';
    if (WS_PANE[id]) return UI.goSection(id);
    if (id === 'more') { return UI.sheet('More', body => { body.innerHTML = '<div class="more-grid">' + [['match', 'whistle', 'Match day'], ['sessions', 'calendar', 'Sessions'], ['library', 'folder', 'Library'], ['settings', 'settings', 'Settings'], ['help', 'help', 'Help'], ['install', 'smartphone', 'Install app'], ['share', 'share', 'Share board'], ['import', 'upload', 'Import'], ['backup', 'download', 'Back up']].map(x => '<button class="more-item" data-more="' + x[0] + '">' + icon(x[1], { size: 22 }) + '<span>' + x[2] + '</span></button>').join('') + '</div>'; $$('[data-more]', body).forEach(b => { b.onclick = () => { const m = b.dataset.more; UI.closeSheet(); if (m === 'settings') UI.showSettings(); else if (m === 'help') UI.showHelp(); else if (m === 'install') UI.installApp(); else if (m === 'share') { UI.goSection('board'); UI.shareDialog(); } else if (m === 'import') UI.importFile(); else if (m === 'backup') K1.Store.exportAll(); else UI.openPane(m); }; }); }, 'more'); }
    if (UI.section !== 'board') UI.goSection('board');
    if (id === 'tray') { return UI.sheet('Add to the pitch', body => { body.innerHTML = '<div class="tray-sheet">' + trayHTML() + '</div><p class="hint">Tap an item, then tap the pitch to place it (players number themselves). Tap again to place more. Drag from here also works.</p>'; bindTray(body); }, 'tray'); }
    if (!TABS.find(t => t.id === id)) id = 'board';
    if (K1.isMobile()) { UI.sheet(TABS.find(t => t.id === id).label, body => { const fn = K1.Panes && K1.Panes[id]; body.dataset.pane = id; if (fn) fn(body); }, id); }
    else UI.showTab(id);
  };

  /* ============================================================= mobile bar */
  function buildMobileBar() {
    const mb = $('#mobilebar');
    const items = [['home', 'home', 'Home'], ['board', 'grid', 'Board'], ['teams', 'users', 'Teams'], ['comps', 'trophy', 'Comps'], ['more', 'menu', 'More']];
    mb.innerHTML = items.map(x => '<button class="mb-item" data-mb="' + x[0] + '">' + icon(x[1], { size: 22 }) + '<span>' + x[2] + '</span></button>').join('');
    $$('[data-mb]', mb).forEach(b => { b.onclick = () => UI.openPane(b.dataset.mb); });
  }

  /* ================================================================= sheet */
  let sheetCloseTimer = null;
  UI.sheet = function (title, render, paneId) {
    const sh = $('#sheet');
    if (sheetCloseTimer) { clearTimeout(sheetCloseTimer); sheetCloseTimer = null; }
    sheetPane = paneId || null;
    $('#sheetTitle').textContent = title;
    const body = $('#sheetBody'); body.innerHTML = ''; body.scrollTop = 0;
    render(body);
    sh.hidden = false;
    requestAnimationFrame(() => sh.classList.add('open'));
    $('#sheetClose').onclick = UI.closeSheet;
    $('.sheet-backdrop', sh).onclick = UI.closeSheet;
    sh._render = render;
    // swipe down to close
    const handle = $('.sheet-handle', sh);
    let sy = null;
    handle.onpointerdown = e => { sy = e.clientY; handle.setPointerCapture(e.pointerId); };
    handle.onpointermove = e => { if (sy != null && e.clientY - sy > 70) { sy = null; UI.closeSheet(); } };
    handle.onpointerup = () => { sy = null; };
  };
  function renderSheetPane() { const sh = $('#sheet'); if (sh && !sh.hidden && sh._render) { const body = $('#sheetBody'); const st = body.scrollTop; body.innerHTML = ''; sh._render(body); body.scrollTop = st; } }
  UI.closeSheet = function () { const sh = $('#sheet'); sh.classList.remove('open'); sheetPane = null; if (sheetCloseTimer) clearTimeout(sheetCloseTimer); sheetCloseTimer = setTimeout(() => { sh.hidden = true; sheetCloseTimer = null; }, 180); };
  UI.isSheetOpen = () => !$('#sheet').hidden;

  /* ================================================================= modal */
  let modalStack = [];
  UI.modal = function (opts) {
    const root = $('#modal');
    const id = 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    const dlg = html('<div class="modal-card' + (opts.wide ? ' wide' : '') + (opts.cls ? ' ' + opts.cls : '') + '" role="dialog" aria-modal="true" data-mid="' + id + '"><div class="modal-head"><h3>' + (opts.title || '') + '</h3><button class="icon-btn modal-close" aria-label="Close">' + icon('x') + '</button></div><div class="modal-body"></div>' + (opts.actions && opts.actions.length ? '<div class="modal-actions"></div>' : '') + '</div>');
    const body = $('.modal-body', dlg);
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    const api = { el: dlg, body, close: () => { dlg.remove(); modalStack = modalStack.filter(m => m !== api); if (!modalStack.length) { root.hidden = true; root.innerHTML = ''; } if (opts.onClose) opts.onClose(); } };
    if (opts.actions) {
      const act = $('.modal-actions', dlg);
      opts.actions.forEach(a => {
        const b = html('<button class="btn ' + (a.primary ? 'btn-primary' : a.danger ? 'btn-danger' : '') + '">' + (a.icon ? icon(a.icon, { size: 16 }) : '') + '<span>' + esc(a.label) + '</span></button>');
        b.onclick = async () => { const r = a.onClick ? await a.onClick(api) : true; if (r !== false) api.close(); };
        act.appendChild(b);
      });
    }
    $('.modal-close', dlg).onclick = api.close;
    root.hidden = false;
    root.appendChild(dlg);
    dlg.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); api.close(); } });
    root.onclick = e => { if (e.target === root && !opts.sticky) { const top = modalStack[modalStack.length - 1]; if (top) top.close(); } };
    modalStack.push(api);
    setTimeout(() => { const f = $('input,textarea,select,button.btn-primary', body) || $('.modal-close', dlg); if (f) f.focus(); }, 30);
    return api;
  };
  UI.confirm = function (msg, opts) {
    opts = opts || {};
    return new Promise(res => {
      UI.modal({ title: opts.title || 'Are you sure?', body: '<p>' + msg + '</p>', actions: [{ label: opts.cancel || 'Cancel', onClick: () => { res(false); } }, { label: opts.ok || 'OK', primary: !opts.danger, danger: !!opts.danger, onClick: () => { res(true); } }], onClose: () => res(false) });
    });
  };
  UI.prompt = function (title, opts) {
    opts = opts || {};
    return new Promise(res => {
      let value = null;
      const m = UI.modal({ title, body: (opts.label ? '<label class="field-label">' + esc(opts.label) + '</label>' : '') + (opts.multiline ? '<textarea class="input" rows="4" placeholder="' + esc(opts.placeholder || '') + '">' + esc(opts.value || '') + '</textarea>' : '<input class="input" type="' + (opts.type || 'text') + '" value="' + esc(opts.value || '') + '" placeholder="' + esc(opts.placeholder || '') + '">'), actions: [{ label: 'Cancel' }, { label: opts.ok || 'OK', primary: true, onClick: () => { value = $('.input', m.body).value; } }], onClose: () => res(value) });
      const inp = $('.input', m.body);
      if (!opts.multiline) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { value = inp.value; m.close(); } });
    });
  };
  UI.closeOverlays = function () { const top = modalStack[modalStack.length - 1]; if (top) { top.close(); return; } if (UI.isSheetOpen()) UI.closeSheet(); closePopovers(); UI.hideContext(); };

  /* ============================================================= popovers */
  let popoverEl = null;
  function openPopover(anchor, inner) {
    closePopovers();
    const pop = html('<div class="popover">' + inner + '</div>');
    document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = r.left, top = r.bottom + 6;
    if (r.left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
    if (r.right + pw + 8 < window.innerWidth && anchor.closest('.toolrail') && !K1.isMobile()) { left = r.right + 8; top = Math.min(r.top, window.innerHeight - ph - 8); }
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    popoverEl = pop;
    return pop;
  }
  function closePopovers() { if (popoverEl) { popoverEl.remove(); popoverEl = null; } }
  UI.popover = function (anchor, items) {
    const pop = openPopover(anchor, '<div class="menu">' + menuHTML(items) + '</div>');
    bindMenu(pop, items, closePopovers);
  };
  UI.closePopovers = closePopovers;

  /* ========================================================= context menus */
  function menuHTML(items) {
    return items.map((it, i) => it.sep ? '<div class="menu-sep"></div>' : '<button class="menu-item' + (it.danger ? ' danger' : '') + (it.check ? ' checked' : '') + '" data-mi="' + i + '"' + (it.disabled ? ' disabled' : '') + '>' + (it.icon ? icon(it.icon, { size: 16 }) : '<span class="ico-gap"></span>') + '<span>' + esc(it.label) + '</span>' + (it.check ? icon('check', { size: 14, cls: 'chk' }) : '') + (it.hint ? '<kbd>' + esc(it.hint) + '</kbd>' : '') + '</button>').join('');
  }
  function bindMenu(root, items, closeFn) { $$('[data-mi]', root).forEach(b => { b.onclick = e => { e.stopPropagation(); const it = items[parseInt(b.dataset.mi, 10)]; closeFn(); if (it.onClick) it.onClick(); }; }); }
  UI.contextMenu = function (items, x, y) {
    const cm = $('#ctxmenu');
    cm.innerHTML = menuHTML(items);
    cm.hidden = false;
    const w = cm.offsetWidth, h = cm.offsetHeight;
    cm.style.left = Math.min(x, window.innerWidth - w - 8) + 'px';
    cm.style.top = Math.min(y, window.innerHeight - h - 8) + 'px';
    bindMenu(cm, items, UI.hideContext);
  };
  UI.hideContext = function () { const cm = $('#ctxmenu'); if (cm && !cm.hidden) { cm.hidden = true; cm.innerHTML = ''; } };
  UI.contextMenuFor = function (id, x, y) {
    const o = K1.getObj(id); if (!o) return;
    const ids = S.selection.has(id) ? Array.from(S.selection) : [id];
    const items = [];
    if (o.type === 'player') {
      items.push({ label: 'Edit player…', icon: 'edit', onClick: () => UI.editPlayer(id) });
      if (o.team !== 'ref') {
        items.push({ label: o.gk ? 'Make outfield player' : 'Make goalkeeper', icon: 'shirt', onClick: () => K1.updateObjects(ids, p => ({ gk: !p.gk })) });
        items.push({ label: o.captain ? 'Remove captain' : 'Make captain', icon: 'star', onClick: () => K1.updateObjects(ids, p => ({ captain: !p.captain })) });
        items.push({ label: 'Switch to ' + (o.team === 'home' ? S.doc.teams.away.name : S.doc.teams.home.name), icon: 'swap', onClick: () => K1.updateObjects(ids, p => ({ team: p.team === 'home' ? 'away' : 'home' })) });
      }
    }
    if (o.type === 'text') items.push({ label: 'Edit text…', icon: 'edit', onClick: () => K1.Board.openTextEditor([o.x, o.y], id) });
    if (o.type === 'path') {
      items.push({ label: o.dash ? 'Solid line' : 'Dashed line', icon: 'run', onClick: () => K1.updateObjects(ids, p => ({ dash: !p.dash })) });
      items.push({ label: o.head === 'none' ? 'Add arrowhead' : 'Remove arrowhead', icon: 'arrowRight', onClick: () => K1.updateObjects(ids, p => ({ head: p.head === 'none' ? 'arrow' : 'none' })) });
      items.push({ label: 'Reverse direction', icon: 'swap', onClick: () => K1.updateObjects(ids, p => ({ points: p.points.slice().reverse() })) });
    }
    if (o.type === 'shape') items.push({ label: o.fill ? 'Outline only' : 'Fill shape', icon: 'zone', onClick: () => K1.updateObjects(ids, p => ({ fill: !p.fill })) });
    if (o.type === 'equip' || o.type === 'shape') items.push({ label: 'Rotate 90°', icon: 'rotate', onClick: () => K1.Board.rotateSelection(90) });
    items.push({ sep: true });
    items.push({ label: 'Duplicate', icon: 'duplicate', hint: 'Ctrl+D', onClick: () => K1.Board.duplicateSelection() });
    items.push({ label: 'Copy', icon: 'copy', hint: 'Ctrl+C', onClick: () => K1.Board.copy() });
    items.push({ label: 'Bring to front', icon: 'front', onClick: () => ids.forEach(i => K1.Board.bringToFront(i)) });
    items.push({ label: 'Send to back', icon: 'back', onClick: () => ids.forEach(i => K1.Board.sendToBack(i)) });
    items.push({ sep: true });
    items.push({ label: 'Delete', icon: 'trash', danger: true, hint: 'Del', onClick: () => K1.removeObjects(ids) });
    UI.contextMenu(items, x, y);
  };
  UI.boardContextMenu = function (pt, x, y) {
    const q = [K1.round(pt[0], 1), K1.round(pt[1], 1)];
    const items = [
      { label: 'Add ' + S.doc.teams.home.name + ' player here', icon: 'user', onClick: () => { S.stamp = { kind: 'player', team: 'home', once: true }; K1.Board.placeStampAt(q); S.stamp = null; K1.emit('stamp', null); } },
      { label: 'Add ' + S.doc.teams.away.name + ' player here', icon: 'user', onClick: () => { S.stamp = { kind: 'player', team: 'away', once: true }; K1.Board.placeStampAt(q); S.stamp = null; K1.emit('stamp', null); } },
      { label: 'Add ball here', icon: 'football', onClick: () => { S.stamp = { kind: 'ball', once: true }; K1.Board.placeStampAt(q); S.stamp = null; K1.emit('stamp', null); } },
      { label: 'Add text here', icon: 'text', onClick: () => K1.Board.openTextEditor(q, null) },
      { sep: true },
      { label: 'Paste', icon: 'clipboard', disabled: !K1.Board.clipboard.length, hint: 'Ctrl+V', onClick: () => K1.Board.paste() },
      { label: 'Select all', icon: 'select', hint: 'Ctrl+A', onClick: () => K1.Board.selectAll() },
      { sep: true },
      { label: 'Clear drawings', icon: 'eraser', onClick: () => K1.Templates.clearDrawings() },
      { label: 'Flip pitch (attack the other way)', icon: 'flipH', onClick: () => K1.Templates.flipHorizontal(false) },
    ];
    UI.contextMenu(items, x, y);
  };

  /* ============================================================ quick edit */
  UI.quickEdit = function (id) {
    const o = K1.getObj(id); if (!o) return;
    if (o.type === 'player') UI.editPlayer(id);
    else if (o.type === 'text') K1.Board.openTextEditor([o.x, o.y], id);
    else if (o.type === 'shape') UI.prompt('Zone label', { value: o.label || '' }).then(v => { if (v != null) K1.updateObjects(id, { label: v }); });
    else if (o.type === 'equip') K1.Board.rotateSelection(90);
  };
  UI.editPlayer = function (id) {
    const o = K1.getObj(id); if (!o) return;
    const squad = K1.Squad ? K1.Squad.sorted() : [];
    const body = '<div class="form-grid">' +
      '<label class="field"><span>Number</span><input class="input" id="epN" type="number" min="0" max="99" value="' + o.n + '"></label>' +
      '<label class="field"><span>Name</span><input class="input" id="epName" type="text" value="' + esc(o.name) + '" placeholder="Surname or nickname" list="squadNames"><datalist id="squadNames">' + squad.map(p => '<option value="' + esc(p.name.split(' ').pop()) + '">' + esc(p.n + ' · ' + p.name) + '</option>').join('') + '</datalist></label>' +
      (o.team !== 'ref' ? '<label class="field"><span>Team</span><select class="select" id="epTeam"><option value="home"' + (o.team === 'home' ? ' selected' : '') + '>' + esc(S.doc.teams.home.name) + '</option><option value="away"' + (o.team === 'away' ? ' selected' : '') + '>' + esc(S.doc.teams.away.name) + '</option><option value="neutral"' + (o.team === 'neutral' ? ' selected' : '') + '>Neutral</option></select></label>' +
        '<label class="field"><span>Role</span><select class="select" id="epRole"><option value="out"' + (!o.gk ? ' selected' : '') + '>Outfield</option><option value="gk"' + (o.gk ? ' selected' : '') + '>Goalkeeper</option></select></label>' +
        '<label class="check"><input type="checkbox" id="epCap"' + (o.captain ? ' checked' : '') + '><span>Captain</span></label>' : '') +
      (squad.length ? '<label class="field span2"><span>Pick from squad</span><select class="select" id="epSquad"><option value="">—</option>' + squad.map(p => '<option value="' + p.id + '">' + esc(p.n + ' · ' + p.name + ' (' + p.pos + ')') + '</option>').join('') + '</select></label>' : '') +
      '</div>';
    const m = UI.modal({ title: 'Edit player', body, actions: [{ label: 'Delete', danger: true, onClick: () => { K1.removeObjects(id); } }, { label: 'Save', primary: true, onClick: () => {
      const patch = { n: K1.clamp(parseInt($('#epN').value, 10) || 0, 0, 99), name: $('#epName').value.trim() };
      if ($('#epTeam')) { patch.team = $('#epTeam').value; patch.gk = $('#epRole').value === 'gk'; patch.captain = $('#epCap').checked; }
      K1.updateObjects(id, patch, 'edit player');
    } }] });
    const sq = $('#epSquad', m.body);
    if (sq) sq.onchange = () => { const p = squad.find(x => x.id === sq.value); if (p) { $('#epN').value = p.n; $('#epName').value = p.name.split(' ').pop(); if ($('#epRole')) $('#epRole').value = p.pos === 'GK' ? 'gk' : 'out'; if ($('#epCap')) $('#epCap').checked = !!p.captain; } };
  };

  /* ================================================================ toasts */
  UI.toast = function (msg, type, ms) {
    const root = $('#toasts');
    const t = html('<div class="toast ' + (type || '') + '">' + (type === 'ok' ? icon('check', { size: 16 }) : type === 'warn' ? icon('alert', { size: 16 }) : icon('info', { size: 16 })) + '<span>' + msg + '</span></div>');
    root.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, ms || 2600);
  };
  UI.progress = function (label) {
    const m = UI.modal({ title: label, body: '<div class="progress"><div class="bar" style="width:0%"></div></div><p class="muted small">Keep this tab in the foreground while it records.</p>', sticky: true });
    return { set: p => { const b = $('.bar', m.body); if (b) b.style.width = Math.round(K1.clamp(p, 0, 1) * 100) + '%'; }, close: m.close };
  };
  UI.imagePreview = function (dataURL, filename, blob) {
    UI.modal({ title: 'Image ready', wide: true, body: '<img class="preview-img" src="' + dataURL + '" alt="Board export"><p class="hint">On a phone, press and hold the image to save it, or use Share.</p>', actions: [
      { label: 'Share', icon: 'share', onClick: async () => { await K1.Store.shareOrDownload(blob, filename, S.doc.title); } },
      { label: 'Download', icon: 'download', primary: true, onClick: () => { K1.Store.downloadBlob(blob, filename); } },
    ] });
  };

  /* ================================================================ export */
  UI.exportMenu = function (anchor) {
    UI.popover(anchor, [
      { label: 'Image (PNG) — this frame', icon: 'image', hint: 'Ctrl+E', onClick: () => K1.Store.exportPNG() },
      { label: 'Image without header', icon: 'image', onClick: () => K1.Store.exportPNG({ header: false }) },
      { label: 'All frames as images', icon: 'film', disabled: S.doc.frames.length < 2, onClick: () => K1.Store.exportAllFramesPNG() },
      { label: 'Animation as GIF (WhatsApp-friendly)', icon: 'film', disabled: S.doc.frames.length < 2, onClick: () => K1.Store.exportGIF() },
      { label: 'Animation video (' + (K1.Store.canExportVideo() ? 'WebM/MP4' : 'unsupported') + ')', icon: 'video', disabled: S.doc.frames.length < 2 || !K1.Store.canExportVideo(), onClick: () => K1.Store.exportVideo() },
      { label: 'Vector (SVG)', icon: 'shape', onClick: () => K1.Store.exportSVGFile() },
      { sep: true },
      { label: 'Board file (.json)', icon: 'download', onClick: () => K1.Store.exportJSON() },
      { label: 'Print', icon: 'print', onClick: () => UI.printBoard() },
    ]);
  };
  UI.printBoard = function () {
    const svgStr = K1.Render.exportSVG({ width: 1600 });
    const w = window.open('', '_blank');
    if (!w) { UI.toast('Allow pop-ups to print.', 'warn'); return; }
    w.document.write('<!doctype html><title>' + esc(S.doc.title) + '</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}svg{max-width:100%;height:auto}@page{size:landscape;margin:10mm}</style>' + svgStr + '<script>setTimeout(function(){window.print()},300)</script>');
    w.document.close();
  };
  UI.shareDialog = async function () {
    const url = await K1.Store.shareLink();
    const tooLong = url.length > 30000;
    UI.modal({ title: 'Share this board', body: '<p class="muted">Anyone with the link opens the board in their browser — no account needed. The whole board lives inside the link.</p><textarea class="input mono" rows="3" readonly>' + esc(url) + '</textarea>' + (tooLong ? '<p class="hint warn">This board is large; some messaging apps truncate very long links. Export the .json file instead if the link breaks.</p>' : '') + '<p class="hint">Link size: ' + Math.round(url.length / 1024) + ' KB</p>', actions: [
      { label: 'Copy link', icon: 'copy', onClick: async () => { try { await navigator.clipboard.writeText(url); UI.toast('Link copied', 'ok'); } catch (e) { UI.toast('Select the text and copy it manually.'); return false; } } },
      { label: 'Share…', icon: 'share', primary: true, onClick: async () => { if (navigator.share) { try { await navigator.share({ title: S.doc.title, text: 'K1 Shooters tactics board: ' + S.doc.title, url }); } catch (e) { /* cancelled */ } } else { try { await navigator.clipboard.writeText(url); UI.toast('Link copied', 'ok'); } catch (e) { /* ignore */ } } } },
    ] });
  };
  UI.importFile = async function () {
    const f = await K1.Store.pickFile('.json,application/json');
    if (!f) return;
    try { const r = K1.Store.importJSONText(await K1.Store.readFileText(f)); UI.toast('Imported ' + r.boards + ' board' + (r.boards === 1 ? '' : 's'), 'ok'); } catch (e) { UI.toast(e.message, 'warn'); }
  };

  /* ============================================================== present */
  UI.togglePresent = function (on) {
    S.presenting = !!on;
    document.body.classList.toggle('presenting', S.presenting);
    K1.clearSelection();
    if (S.presenting) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      let bar = $('#presentBar');
      if (!bar) {
        bar = html('<div id="presentBar" class="present-bar"><div class="present-caption" id="presentCaption"></div><div class="present-controls"><button class="icon-btn" data-pr="prev">' + icon('skipBack') + '</button><button class="icon-btn play" data-pr="play">' + icon('play') + '</button><button class="icon-btn" data-pr="next">' + icon('skipFwd') + '</button><span class="frame-ind" id="presentInd"></span><button class="icon-btn" data-pr="exit" title="Exit (Esc)">' + icon('x') + '</button></div></div>');
        $('#boardWrap').appendChild(bar);
        $$('[data-pr]', bar).forEach(b => { b.onclick = () => { const a = b.dataset.pr; if (a === 'prev') K1.Anim.prev(); else if (a === 'next') K1.Anim.next(); else if (a === 'play') K1.Anim.toggle(); else UI.togglePresent(false); }; });
      }
      const upd = () => { const c = $('#presentCaption'); if (c) c.textContent = K1.frame().caption || ''; const i = $('#presentInd'); if (i) i.textContent = (S.frameIndex + 1) + ' / ' + S.doc.frames.length; $$('[data-pr=play]').forEach(b => { b.innerHTML = icon(S.playing ? 'pause' : 'play'); }); };
      upd();
      UI._presentOff = [K1.on('frames', upd), K1.on('anim', upd)];
    } else {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      const bar = $('#presentBar'); if (bar) bar.remove();
      (UI._presentOff || []).forEach(off => off()); UI._presentOff = null;
      if (S.playing) K1.Anim.pause();
    }
    setTimeout(() => K1.Render.layout(true), 60);
    setTimeout(() => K1.Render.layout(true), 400);
  };

  /* ============================================================ dialogs */
  UI.newBoardDialog = function () {
    const pitchOpts = Object.values(K1.PITCHES).map(p => '<button class="choice" data-pitch="' + p.id + '"' + (p.id === (K1.settings.defaultPitch || 'full') ? ' aria-pressed="true"' : '') + '>' + esc(p.short) + '</button>').join('');
    const forms = players => K1.formationsFor(players).filter(f => !/press|block|possession/i.test(f.name)).map(f => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join('');
    const teams = K1.Teams ? K1.Teams.sorted() : [];
    const activeTeam = K1.Teams ? K1.Teams.active() : null;
    const body = '<div class="stack">' + (S.dirty ? '<p class="hint warn">The current board has unsaved changes. <button class="link" id="nbSave">Save it first</button></p>' : '') +
      (teams.length ? '<label class="field"><span>Team</span><select class="select" id="nbTeam">' + teams.map(t => '<option value="' + t.id + '"' + (activeTeam && t.id === activeTeam.id ? ' selected' : '') + '>' + esc(t.name) + ' · ' + esc(K1.Teams.formatLabel(t.pitch)) + '</option>').join('') + '<option value="">No team (generic board)</option></select></label>' : '') +
      '<div><div class="field-label">Pitch</div><div class="choices" id="nbPitch">' + pitchOpts + '</div></div>' +
      '<div><div class="field-label">Start with</div><div class="choices" id="nbStart"><button class="choice" data-start="blank" aria-pressed="true">Empty pitch</button><button class="choice" data-start="home">' + esc(S.doc.teams.home.name) + ' only</button><button class="choice" data-start="both">Both teams</button></div></div>' +
      '<div class="form-grid" id="nbForms"><label class="field"><span>' + esc(S.doc.teams.home.name) + '</span><select class="select" id="nbHome">' + forms(11) + '</select></label><label class="field"><span>' + esc(S.doc.teams.away.name) + '</span><select class="select" id="nbAway">' + forms(11) + '</select></label></div>' +
      '<label class="field"><span>Title</span><input class="input" id="nbTitle" placeholder="e.g. Saturday vs Rovers — build-up"></label></div>';
    const m = UI.modal({ title: 'New board', body, actions: [{ label: 'Cancel' }, { label: 'Create', primary: true, onClick: () => {
      const pitch = $('[aria-pressed=true]', $('#nbPitch', m.body)).dataset.pitch;
      const start = $('[aria-pressed=true]', $('#nbStart', m.body)).dataset.start;
      const title = $('#nbTitle', m.body).value.trim();
      const teamSel = $('#nbTeam', m.body);
      const team = teamSel && teamSel.value && K1.Teams ? K1.Teams.get(teamSel.value) : null;
      if (team) K1.Teams.setActive(team.id);
      let doc;
      if (start === 'blank') doc = K1.newDoc({ title: title || (team ? team.name + ' · new board' : 'Untitled board'), pitch: { type: pitch } });
      else { doc = K1.Templates.docFromFormations($('#nbHome', m.body).value, start === 'both' ? $('#nbAway', m.body).value : null, pitch); if (title) doc.title = title; else if (team) doc.title = team.name + ' · ' + doc.title; }
      if (team) { doc.teamId = team.id; doc.teams.home = { name: K1.Teams.displayName(team), kit: team.kit }; }
      K1.loadDoc(doc);
      UI.goSection('board');
      UI.toast('New board created');
    } }] });
    const nbs = $('#nbSave', m.body); if (nbs) nbs.onclick = () => { K1.Store.saveCurrent(); nbs.parentElement.remove(); };
    const nbTeam = $('#nbTeam', m.body);
    if (nbTeam) nbTeam.onchange = () => { const t = nbTeam.value && K1.Teams ? K1.Teams.get(nbTeam.value) : null; if (t) { const c = $('[data-pitch="' + t.pitch + '"]', m.body); if (c) c.click(); } };
    if (nbTeam && activeTeam) { const c = $('[data-pitch="' + activeTeam.pitch + '"]', m.body); if (c) { $$('.choice', c.parentElement).forEach(x => x.setAttribute('aria-pressed', 'false')); c.setAttribute('aria-pressed', 'true'); } }
    const refreshForms = () => { const pid = $('[aria-pressed=true]', $('#nbPitch', m.body)).dataset.pitch; const n = K1.PITCHES[pid].players; $('#nbHome', m.body).innerHTML = forms(n); $('#nbAway', m.body).innerHTML = forms(n); if ($('#nbAway', m.body).options.length > 3) $('#nbAway', m.body).selectedIndex = 3; const st = $('[aria-pressed=true]', $('#nbStart', m.body)).dataset.start; $('#nbForms', m.body).style.display = st === 'blank' ? 'none' : ''; };
    $$('.choice', m.body).forEach(b => { b.onclick = () => { $$('.choice', b.parentElement).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); refreshForms(); }; });
    refreshForms();
  };

  UI.welcome = function () {
    const body = '<div class="welcome"><div class="welcome-badge">' + K1.logoHTML(110) + '</div><h2>Welcome, Coach.</h2><p>This is the K1 Shooters tactics board — formations, set pieces, animated moves, training drills, squad and match day, all in one place. Works on your laptop and your phone, even offline once installed.</p>' +
      '<div class="welcome-grid">' +
      '<button class="wcard" data-w="k1"><b>K1 4-3-3 vs 4-4-2</b><span>Start from our shape on a full pitch</span></button>' +
      '<button class="wcard" data-w="morph"><b>Watch a tactic morph</b><span>Barcelona 4-3-3 → 2-3-5, animated</span></button>' +
      '<button class="wcard" data-w="setpiece"><b>Open a set piece</b><span>Attacking corner: near-post overload</span></button>' +
      '<button class="wcard" data-w="blank"><b>Empty pitch</b><span>Draw your own idea from scratch</span></button>' +
      '</div><p class="hint">Home shows your teams, next fixtures and live match. Teams holds player profiles with photos; Comps hosts leagues and tournaments. Press <kbd>?</kbd> on the board for shortcuts.</p></div>';
    const m = UI.modal({ title: 'K1 Shooters · Tactics Board', body, wide: true, cls: 'welcome-modal', onClose: () => K1.saveSettings({ tipsSeen: true }) });
    $$('[data-w]', m.body).forEach(b => { b.onclick = () => {
      const w = b.dataset.w;
      if (w === 'k1') K1.loadDoc(K1.Templates.docFromFormations('433', '442', 'full'));
      else if (w === 'morph') { K1.loadDoc(K1.Templates.docFromMorph(K1.MORPHS.find(x => x.id === 'barca_433_235'))); setTimeout(() => K1.Anim.play(), 400); }
      else if (w === 'setpiece') K1.loadDoc(K1.Templates.docFromSetPiece(K1.SETPIECES[0]));
      else K1.loadDoc(K1.newDoc({ title: 'Untitled board' }));
      UI.goSection('board');
      m.close();
    }; });
  };

  UI.about = function () {
    UI.modal({ title: 'About', body: '<div class="about">' + K1.logoHTML(90) + '<h3>K1 Shooters · Tactics Board</h3><p class="muted">Built for K1 Shooters Football Academy (est. 2019). Formations, set pieces, animations, drills, squad, sessions and match day — one app, laptop and phone, no subscription, your data stays on your device.</p><p class="muted small">Version 1.0 · ' + Math.round(K1.Store.usage() / 1024) + ' KB stored locally</p></div>' });
  };

  UI.installApp = async function () {
    if (K1.installPrompt) { K1.installPrompt.prompt(); try { await K1.installPrompt.userChoice; } catch (e) { /* ignore */ } K1.installPrompt = null; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // when served by serve.js on the laptop, show the Wi-Fi address phones can open
    let lan = [];
    if (/^https?:$/.test(location.protocol)) {
      try { const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 1500); const r = await fetch('/__info', { signal: ctrl.signal }); if (r.ok) lan = ((await r.json()).lan || []); } catch (e) { /* not our server */ }
    }
    const lanHTML = lan.length ? '<div class="lan-box"><b>On your phone or tablet (same Wi-Fi) open:</b>' + lan.map(a => '<div class="lan-url">http://' + esc(a) + (location.port ? ':' + location.port : '') + '</div>').join('') + '<p class="muted small">Type it into the phone’s browser, then Add to Home Screen. The laptop must be running <code>node serve.js</code> while you use it this way; for use anywhere, host the folder online (README → “Put it on your phone”).</p></div>' : '';
    UI.modal({ title: 'Install on this device', body: '<div class="stack">' + lanHTML +
      (location.protocol === 'file:' ? '<p class="hint warn">Installing needs the app to be served from a web address (https or localhost). Run <code>node serve.js</code> in the app folder, or host the folder on GitHub Pages / Netlify — see README.</p>' : '') +
      '<p><b>iPhone / iPad (Safari):</b> tap the Share button ' + icon('share', { size: 16 }) + ' then <b>Add to Home Screen</b>.</p>' +
      '<p><b>Android (Chrome):</b> open the ⋮ menu → <b>Add to Home screen</b> (or <b>Install app</b>).</p>' +
      '<p><b>Laptop (Chrome / Edge):</b> click the install icon in the address bar, or the ⋮ menu → <b>Install K1 Tactics Board</b>.</p>' +
      '<p class="muted small">Once installed it opens full-screen like a native app and works offline.' + (ios ? '' : ' Your browser has not offered an automatic install prompt yet — it usually appears after you have used the site for a minute.') + '</p></div>' });
  };

  UI.showHelp = function () {
    const rows = [['V', 'Select / move'], ['H', 'Pan (or hold Space)'], ['A / R / D / S', 'Pass · Run · Dribble · Shot arrows'], ['C / L / P', 'Curve · Line · Pen'], ['Z / B / O', 'Zone · Rectangle · Ellipse'], ['T', 'Text label'], ['M / I / E', 'Measure · Offside line · Eraser'], ['Del', 'Delete selection'], ['Ctrl+Z / Ctrl+Y', 'Undo / redo'], ['Ctrl+D', 'Duplicate'], ['Ctrl+C / Ctrl+V', 'Copy / paste'], ['Ctrl+A', 'Select all'], ['Ctrl+S', 'Save to library'], ['Ctrl+E', 'Export PNG'], ['Arrows', 'Nudge selection (Shift = more) · or step frames'], ['[ / ]', 'Previous / next frame'], ['N', 'New frame'], ['Space', 'Play / pause animation'], ['F', 'Present mode'], ['G', 'Snap to grid'], ['+ / − / 0', 'Zoom in / out / fit'], ['Shift+R', 'Rotate selection 15°'], ['?', 'This help']];
    UI.modal({ title: 'Help & shortcuts', wide: true, body: '<div class="help">' +
      '<h4>Gestures</h4><ul><li><b>Tap</b> a player to select · <b>drag</b> to move · <b>double-tap</b> to edit number & name.</li><li><b>Long-press</b> (or right-click) for the context menu.</li><li><b>Pinch</b> to zoom, two-finger drag to pan · mouse wheel zooms.</li><li>Pick a tool on the rail, then <b>drag on the pitch</b> to draw. Tap a chip in the tray, then tap the pitch to place players, cones, goals.</li><li><b>Shift+drag</b> with a shape tool keeps it square; <b>Shift+click</b> adds to the selection; drag on empty grass to box-select.</li></ul>' +
      '<h4>Frames & animation</h4><p>Each frame is a snapshot. Add a frame, move the players, press Play — the app morphs positions between frames. Ghosts show where players came from. Captions appear in Present mode and in exports.</p>' +
      '<h4>Keyboard</h4><table class="kbd-table">' + rows.map(r => '<tr><td><kbd>' + r[0] + '</kbd></td><td>' + r[1] + '</td></tr>').join('') + '</table>' +
      '<h4>On your phone</h4><p>Open the same address on your phone (same Wi-Fi: use the "Phone" address printed by <code>node serve.js</code>, or host the folder online). Then <b>Add to Home Screen</b> — it becomes a full-screen app and works offline.</p></div>' });
  };

  UI.showSettings = function () { if (K1.Panes && K1.Panes.settingsModal) K1.Panes.settingsModal(); };

  K1.UI = UI;
})(window.K1 = window.K1 || {});
