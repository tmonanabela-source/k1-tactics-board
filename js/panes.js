/* K1 Shooters Tactics Board — side-panel panes: pitch, squad, playbook, animate, match, sessions, library, settings */
(function (K1) {
  'use strict';

  const P = {};
  const S = K1.S;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const UI = () => K1.UI;

  /** Load a doc into the editor, protecting unsaved work. */
  async function openDoc(doc, label) {
    if (S.dirty && K1.objects().length) {
      const choice = await new Promise(res => {
        UI().modal({ title: 'Unsaved changes', body: '<p>“' + esc(S.doc.title) + '” has changes that are not saved to the library. Autosave keeps a working copy, but it will be replaced.</p>', actions: [
          { label: 'Cancel', onClick: () => res('cancel') },
          { label: 'Open without saving', onClick: () => res('open') },
          { label: 'Save, then open', primary: true, onClick: () => res('save') },
        ], onClose: () => res('cancel') });
      });
      if (choice === 'cancel') return false;
      if (choice === 'save') K1.Store.saveCurrent();
    }
    K1.loadDoc(doc, { dirty: true });
    if (K1.isMobile() && UI().isSheetOpen()) UI().closeSheet();
    UI().toast('Opened ' + (label || doc.title));
    return true;
  }
  P.openDoc = openDoc;

  const section = (title, body, extra) => '<section class="pane-section">' + (title ? '<h4>' + title + (extra || '') + '</h4>' : '') + body + '</section>';
  const seg = (name, opts, value) => '<div class="seg" data-seg="' + name + '">' + opts.map(o => '<button class="' + (o[0] === value ? 'on' : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
  const toggle = (id, label, on, hint) => '<label class="switch-row"><span>' + label + (hint ? '<small>' + hint + '</small>' : '') + '</span><span class="switch' + (on ? ' on' : '') + '" data-toggle="' + id + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '"><i></i></span></label>';
  const kitSwatch = k => '<span class="kit-dot" style="background:' + k.primary + (k.pattern !== 'solid' ? ';background-image:linear-gradient(90deg,' + k.primary + ' 50%,' + k.secondary + ' 50%)' : '') + '"></span>';

  /* ================================================================= PITCH */
  P.board = function (root) {
    const doc = S.doc, p = doc.pitch, d = K1.dims();
    let s = '';
    s += section('Pitch', '<div class="choices">' + Object.values(K1.PITCHES).map(x => '<button class="choice' + (p.type === x.id ? ' on' : '') + '" data-pitch="' + x.id + '" title="' + esc(x.name) + '">' + esc(x.short) + '</button>').join('') + '</div>' +
      (p.type === 'grid' ? '<div class="form-grid three"><label class="field"><span>Length (m)</span><input class="input" type="number" min="10" max="120" value="' + d.L + '" data-pf="L"></label><label class="field"><span>Width (m)</span><input class="input" type="number" min="10" max="90" value="' + d.W + '" data-pf="W"></label><label class="field"><span>Grid (m)</span><input class="input" type="number" min="1" max="20" value="' + d.gridStep + '" data-pf="gridStep"></label></div>' : '') +
      '<div class="field-label">Surface</div><div class="theme-row">' + Object.values(K1.THEMES).map(t => '<button class="theme-swatch' + (p.theme === t.id ? ' on' : '') + '" data-theme="' + t.id + '" title="' + esc(t.name) + '" style="background:' + t.grass + ';border-color:' + t.line + '"><i style="background:' + t.grass2 + '"></i></button>').join('') + '</div>' +
      '<div class="row"><span class="row-label">Orientation</span>' + seg('orientation', [['auto', 'Auto'], ['landscape', 'Wide'], ['portrait', 'Tall']], p.orientation || 'auto') + '</div>' +
      '<div class="row"><span class="row-label">Overlay</span><select class="select" data-pf="overlay">' + [['none', 'None'], ['thirds', 'Thirds'], ['lanes', '5 lanes (half-spaces)'], ['zones18', '18 zones'], ['zones20', '20 zones (lanes × 4)'], ['grid5', '5 m grid'], ['grid10', '10 m grid']].map(o => '<option value="' + o[0] + '"' + (p.overlay === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>');
    const kitOpts = sel => K1.KITS.map(k => '<option value="' + k.id + '"' + (k.id === sel ? ' selected' : '') + '>' + esc(k.name) + '</option>').join('');
    s += section('Teams', '<div class="team-row">' + kitSwatch(K1.kitById(doc.teams.home.kit)) + '<input class="input" data-team="home" data-tf="name" value="' + esc(doc.teams.home.name) + '" placeholder="Home team"><select class="select" data-team="home" data-tf="kit">' + kitOpts(doc.teams.home.kit) + '</select></div>' +
      '<div class="team-row">' + kitSwatch(K1.kitById(doc.teams.away.kit)) + '<input class="input" data-team="away" data-tf="name" value="' + esc(doc.teams.away.name) + '" placeholder="Opponent"><select class="select" data-team="away" data-tf="kit">' + kitOpts(doc.teams.away.kit) + '</select></div>' +
      '<div class="row wrap"><button class="btn btn-sm" data-act="swap">' + icon('swap', { size: 15 }) + '<span>Swap teams</span></button><button class="btn btn-sm" data-act="defaults">' + icon('star', { size: 15 }) + '<span>Use as defaults</span></button></div>');
    s += section('Display', toggle('showNames', 'Player names', K1.settings.showNames) + toggle('showNumbers', 'Shirt numbers', K1.settings.showNumbers) + toggle('tokenPhotos', 'Player photos on tokens', K1.settings.tokenPhotos !== false, 'faces from the active team’s profiles') + toggle('snap', 'Snap to grid (0.5 m)', K1.settings.snap) + toggle('showGhosts', 'Ghosts from previous frame', K1.settings.showGhosts, 'shows where players moved from') +
      '<div class="row"><span class="row-label">Token size</span>' + seg('tokenSize', [['sm', 'S'], ['md', 'M'], ['lg', 'L']], K1.settings.tokenSize) + '</div>');
    s += section('Quick tools', '<div class="btn-grid">' +
      '<button class="btn btn-sm" data-act="flipH" title="Attack the other way">' + icon('flipH', { size: 15 }) + '<span>Flip ends</span></button>' +
      '<button class="btn btn-sm" data-act="flipV">' + icon('flipV', { size: 15 }) + '<span>Mirror sides</span></button>' +
      '<button class="btn btn-sm" data-act="shapeH">' + icon('shape', { size: 15 }) + '<span>Shape · ' + esc(doc.teams.home.name.split(' ')[0]) + '</span></button>' +
      '<button class="btn btn-sm" data-act="shapeA">' + icon('shape', { size: 15 }) + '<span>Shape · ' + esc(doc.teams.away.name.split(' ')[0]) + '</span></button>' +
      '<button class="btn btn-sm" data-act="offH">' + icon('offside', { size: 15 }) + '<span>Offside · ' + esc(doc.teams.home.name.split(' ')[0]) + '</span></button>' +
      '<button class="btn btn-sm" data-act="offA">' + icon('offside', { size: 15 }) + '<span>Offside · ' + esc(doc.teams.away.name.split(' ')[0]) + '</span></button>' +
      '<button class="btn btn-sm" data-act="link">' + icon('linkPlayers', { size: 15 }) + '<span>Link selected</span></button>' +
      '<button class="btn btn-sm" data-act="clearDraw">' + icon('eraser', { size: 15 }) + '<span>Clear drawings</span></button>' +
      '<button class="btn btn-sm btn-danger-ghost" data-act="clearAll">' + icon('trash', { size: 15 }) + '<span>Clear frame</span></button>' +
      '</div>');
    s += section('Coach notes', '<textarea class="input" rows="4" data-notes placeholder="Key messages, triggers, what to look for…">' + esc(doc.notes || '') + '</textarea>');
    root.innerHTML = s;

    $$('[data-pitch]', root).forEach(b => { b.onclick = () => { K1.mutate(() => { doc.pitch.type = b.dataset.pitch; }, 'pitch'); K1.Render.invalidatePitch(); K1.Render.layout(true); P.board(root); }; });
    $$('[data-pf]', root).forEach(inp => { inp.onchange = () => { const f = inp.dataset.pf; K1.mutate(() => { doc.pitch[f] = inp.type === 'number' ? Number(inp.value) : inp.value; }, 'pitch'); K1.Render.invalidatePitch(); K1.Render.layout(true); }; });
    $$('[data-theme]', root).forEach(b => { b.onclick = () => { K1.mutate(() => { doc.pitch.theme = b.dataset.theme; }, 'theme'); K1.Render.invalidatePitch(); K1.Render.renderAll(); $$('[data-theme]', root).forEach(x => x.classList.toggle('on', x === b)); }; });
    bindSeg(root, 'orientation', v => { K1.mutate(() => { doc.pitch.orientation = v; }, 'orientation'); K1.Render.layout(true); });
    bindSeg(root, 'tokenSize', v => { K1.saveSettings({ tokenSize: v }); });
    $$('[data-tf]', root).forEach(inp => { inp.onchange = () => { const t = inp.dataset.team, f = inp.dataset.tf; K1.mutate(() => { doc.teams[t][f] = inp.value; }, 'team'); if (f === 'kit') P.board(root); K1.emit('stamp', S.stamp); }; });
    bindToggles(root);
    $$('[data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'swap') { K1.mutate(() => { const h = doc.teams.home; doc.teams.home = doc.teams.away; doc.teams.away = h; }, 'swap'); K1.Templates.swapTeams(); P.board(root); }
      else if (a === 'defaults') { K1.saveSettings({ homeName: doc.teams.home.name, homeKit: doc.teams.home.kit, awayName: doc.teams.away.name, awayKit: doc.teams.away.kit }); UI().toast('Saved as default teams', 'ok'); }
      else if (a === 'flipH') K1.Templates.flipHorizontal(doc.frames.length > 1 ? await UI().confirm('Flip every frame of this board?', { ok: 'All frames', cancel: 'This frame only' }) : false);
      else if (a === 'flipV') K1.Templates.flipVertical(false);
      else if (a === 'shapeH') K1.Templates.teamShape('home');
      else if (a === 'shapeA') K1.Templates.teamShape('away');
      else if (a === 'offH') K1.Templates.offsideLineFor('home');
      else if (a === 'offA') K1.Templates.offsideLineFor('away');
      else if (a === 'link') K1.Templates.linkSelected();
      else if (a === 'clearDraw') K1.Templates.clearDrawings(false);
      else if (a === 'clearAll') { if (await UI().confirm('Remove everything from this frame?', { ok: 'Clear', danger: true })) K1.Templates.clearAll(); }
    }; });
    const notes = $('[data-notes]', root); notes.onchange = () => { doc.notes = notes.value; S.dirty = true; K1.Store.autosave(); };
  };
  function bindSeg(root, name, fn) { const el = $('[data-seg="' + name + '"]', root); if (!el) return; $$('button', el).forEach(b => { b.onclick = () => { $$('button', el).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v); }; }); }
  function bindToggles(root, fn) {
    $$('[data-toggle]', root).forEach(sw => { sw.onclick = () => { const k = sw.dataset.toggle; const on = !sw.classList.contains('on'); sw.classList.toggle('on', on); sw.setAttribute('aria-checked', on); if (fn) fn(k, on); else K1.saveSettings({ [k]: on }); }; });
  }
  P.bindToggles = bindToggles;

  /* ================================================================= SQUAD */
  // The Teams pane (age groups, player profiles, cards, rankings) lives in js/panes-teams.js.

  /* ============================================================== PLAYBOOK */
  let pbTab = 'formations', pbQuery = '';
  P.playbook = function (root) {
    const q = pbQuery.trim().toLowerCase();
    const match = (...fields) => !q || fields.some(f => String(f || '').toLowerCase().includes(q));
    let s = '<div class="subtabs">' + [['formations', 'Formations'], ['tactics', 'Tactics'], ['setpieces', 'Set pieces'], ['drills', 'Drills']].map(t => '<button class="' + (pbTab === t[0] ? 'on' : '') + '" data-pb="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    s += '<div class="search"><input class="input" id="pbSearch" placeholder="Search the playbook…" value="' + esc(pbQuery) + '">' + icon('select', { size: 14 }) + '</div>';
    if (pbTab === 'formations') {
      const d = K1.dims();
      const forms = K1.formationsFor(d.players).filter(f => match(f.name, (f.tags || []).join(' '), f.desc));
      s += '<p class="muted small">' + d.players + '-a-side shapes for the current pitch. Apply to either team — the away team is mirrored automatically.</p>';
      s += '<label class="check small"><input type="checkbox" id="pbAllFrames"><span>Apply to every frame</span></label>';
      s += '<div class="cards">' + forms.map(f => '<div class="card"><div class="card-body"><b>' + esc(f.name) + '</b>' + (f.tags ? '<div class="tags">' + f.tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '') + '<p>' + esc(f.desc || '') + '</p></div><div class="card-actions"><button class="btn btn-sm btn-primary" data-form="' + f.id + '" data-team="home">' + esc(S.doc.teams.home.name.split(' ')[0]) + '</button><button class="btn btn-sm" data-form="' + f.id + '" data-team="away">' + esc(S.doc.teams.away.name.split(' ')[0]) + '</button></div></div>').join('') + '</div>';
    } else if (pbTab === 'tactics') {
      const ms = K1.MORPHS.filter(m => match(m.name, m.club, m.desc));
      s += '<p class="muted small">How the best teams change shape with and without the ball. Each opens as a multi-frame board — press Play to watch the morph.</p>';
      s += '<div class="cards">' + ms.map(m => { const kit = K1.kitById(m.kits[0]); return '<div class="card club" style="--club:' + kit.primary + ';--club2:' + (kit.pattern === 'solid' ? kit.primary : kit.secondary) + '"><div class="card-body"><span class="club-bar"></span><b>' + esc(m.name) + '</b><p>' + esc(m.desc) + '</p><div class="tags"><span class="tag">' + m.frames.length + ' frames</span><span class="tag">' + esc(K1.PITCHES[m.pitch || 'full'].short) + '</span></div></div><div class="card-actions"><button class="btn btn-sm btn-primary" data-morph="' + m.id + '">' + icon('play', { size: 14 }) + '<span>Open</span></button></div></div>'; }).join('') + '</div>';
    } else if (pbTab === 'setpieces') {
      s += '<p class="muted small">Corners, free kicks, throw-ins, goal kicks and penalties — authored on a full pitch, or open them zoomed on the half pitch.</p>';
      K1.setPieceGroups().forEach(g => {
        const items = g.items.filter(sp => match(sp.name, sp.group, sp.desc));
        if (!items.length) return;
        s += '<h5 class="group-title">' + esc(g.name) + '</h5><div class="cards">' + items.map(sp => '<div class="card"><div class="card-body"><b>' + esc(sp.name) + '</b><p>' + esc(sp.desc) + '</p><div class="tags"><span class="tag">' + sp.frames.length + ' frame' + (sp.frames.length > 1 ? 's' : '') + '</span></div></div><div class="card-actions"><button class="btn btn-sm btn-primary" data-sp="' + sp.id + '" data-pitch="full">Full pitch</button><button class="btn btn-sm" data-sp="' + sp.id + '" data-pitch="half">Half pitch</button></div></div>').join('') + '</div>';
      });
    } else {
      s += '<p class="muted small">Training drills with layouts, coaching points, timings and equipment. Open one, tweak it, save it to your library.</p>';
      K1.drillGroups().forEach(g => {
        const items = g.items.filter(dr => match(dr.name, dr.group, dr.desc));
        if (!items.length) return;
        s += '<h5 class="group-title">' + esc(g.name) + '</h5><div class="cards">' + items.map(dr => '<div class="card"><div class="card-body"><b>' + esc(dr.name) + '</b><p>' + esc(dr.desc) + '</p><div class="tags"><span class="tag">' + esc(dr.time) + '</span><span class="tag">' + esc(dr.players) + '</span></div></div><div class="card-actions"><button class="btn btn-sm btn-primary" data-drill="' + dr.id + '">' + icon('book', { size: 14 }) + '<span>Open</span></button></div></div>').join('') + '</div>';
      });
    }
    root.innerHTML = s;
    $$('[data-pb]', root).forEach(b => { b.onclick = () => { pbTab = b.dataset.pb; P.playbook(root); }; });
    const search = $('#pbSearch', root);
    search.oninput = () => { pbQuery = search.value; const pos = search.selectionStart; P.playbook(root); const s2 = $('#pbSearch', root); s2.focus(); try { s2.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } };
    $$('[data-form]', root).forEach(b => { b.onclick = () => { K1.Templates.applyFormation(b.dataset.team, b.dataset.form, { allFrames: $('#pbAllFrames', root) && $('#pbAllFrames', root).checked }); UI().toast((K1.formationById(b.dataset.form) || {}).name + ' applied', 'ok'); if (K1.isMobile()) UI().closeSheet(); }; });
    $$('[data-morph]', root).forEach(b => { b.onclick = () => { const m = K1.MORPHS.find(x => x.id === b.dataset.morph); openDoc(K1.Templates.docFromMorph(m), m.name); }; });
    $$('[data-sp]', root).forEach(b => { b.onclick = () => { const sp = K1.SETPIECES.find(x => x.id === b.dataset.sp); openDoc(K1.Templates.docFromSetPiece(sp, { pitch: b.dataset.pitch }), sp.name); }; });
    $$('[data-drill]', root).forEach(b => { b.onclick = () => { const dr = K1.DRILLS.find(x => x.id === b.dataset.drill); openDoc(K1.Templates.docFromDrill(dr), dr.name); }; });
  };

  /* =============================================================== ANIMATE */
  P.frames = function (root) {
    const frames = S.doc.frames;
    let s = '';
    s += section('Playback', '<div class="row wrap"><button class="btn btn-primary btn-sm" data-act="play">' + icon(S.playing ? 'pause' : 'play', { size: 15 }) + '<span>' + (S.playing ? 'Pause' : 'Play') + '</span></button><button class="btn btn-sm" data-act="stop">' + icon('stop', { size: 14 }) + '<span>Stop</span></button><button class="btn btn-sm' + (K1.Anim.loop ? ' on' : '') + '" data-act="loop">' + icon('loop', { size: 15 }) + '<span>Loop</span></button><select class="select sm" data-speed>' + [.5, .75, 1, 1.5, 2].map(v => '<option value="' + v + '"' + (K1.Anim.speed === v ? ' selected' : '') + '>' + v + '×</option>').join('') + '</select></div>' +
      '<div class="row"><span class="row-label">Pause on each frame</span><input class="input num" type="number" min="0" max="5000" step="100" value="' + K1.settings.holdDuration + '" data-hold> <span class="muted small">ms</span></div>' +
      '<div class="row"><span class="row-label">All transitions</span><input class="input num" type="number" min="0.2" max="10" step="0.1" value="' + (frames[0].duration / 1000) + '" data-alldur> <span class="muted small">s</span></div>' +
      toggle('showGhosts', 'Show ghosts of previous frame', K1.settings.showGhosts) + toggle('ghostArrows', 'Movement arrows from ghosts', K1.settings.ghostArrows));
    s += section('Frames', '<div class="row wrap"><button class="btn btn-sm btn-primary" data-act="add">' + icon('plus', { size: 15 }) + '<span>Add frame</span></button><button class="btn btn-sm" data-act="dup">' + icon('duplicate', { size: 15 }) + '<span>Duplicate</span></button><button class="btn btn-sm" data-act="propagate" title="Copy this frame\'s players into later frames that are missing them">' + icon('users', { size: 15 }) + '<span>Fill later frames</span></button></div>' +
      '<div class="frame-list">' + frames.map((fr, i) => '<div class="frame-item' + (i === S.frameIndex ? ' active' : '') + '" data-frame="' + i + '">' + K1.Render.thumbSVG(S.doc, fr, 84, 54) + '<div class="fi-body"><div class="fi-head"><b>Frame ' + (i + 1) + '</b><span class="muted small">' + fr.objects.length + ' objects</span></div><input class="input sm" data-cap="' + i + '" value="' + esc(fr.caption) + '" placeholder="Caption for this frame"><div class="fi-row">' + (i < frames.length - 1 ? '<label class="muted small">→ next in <input class="input num sm" type="number" min="0.2" max="10" step="0.1" data-dur="' + i + '" value="' + (fr.duration / 1000) + '"> s</label>' : '<span class="muted small">last frame</span>') + '<span class="sb-gap"></span><button class="icon-btn sm" data-mv="-1" data-i="' + i + '" title="Move up"' + (i === 0 ? ' disabled' : '') + '>' + icon('chevronUp', { size: 14 }) + '</button><button class="icon-btn sm" data-mv="1" data-i="' + i + '" title="Move down"' + (i === frames.length - 1 ? ' disabled' : '') + '>' + icon('chevronDown', { size: 14 }) + '</button><button class="icon-btn sm danger" data-del="' + i + '" title="Delete"' + (frames.length < 2 ? ' disabled' : '') + '>' + icon('trash', { size: 14 }) + '</button></div></div></div>').join('') + '</div>' +
      '<p class="hint">Add a frame, move the players, press Play. Positions morph between frames; drawings fade in and out.</p>');
    s += section('Export', '<div class="row wrap"><button class="btn btn-sm btn-primary" data-act="gif"' + (frames.length < 2 ? ' disabled' : '') + '>' + icon('film', { size: 15 }) + '<span>GIF</span></button><button class="btn btn-sm" data-act="video"' + (frames.length < 2 || !K1.Store.canExportVideo() ? ' disabled' : '') + '>' + icon('video', { size: 15 }) + '<span>Video</span></button><button class="btn btn-sm" data-act="pngs"' + (frames.length < 2 ? ' disabled' : '') + '>' + icon('film', { size: 15 }) + '<span>All frames PNG</span></button><button class="btn btn-sm" data-act="present">' + icon('fullscreen', { size: 15 }) + '<span>Present</span></button></div>');
    root.innerHTML = s;
    $$('[data-act]', root).forEach(b => { b.onclick = () => { const a = b.dataset.act; if (a === 'play') K1.Anim.toggle(); else if (a === 'stop') K1.Anim.stop(); else if (a === 'loop') { K1.Anim.loop = !K1.Anim.loop; P.frames(root); K1.UI.renderFrames(); } else if (a === 'add') K1.Anim.addFrame(); else if (a === 'dup') K1.Anim.duplicateFrame(); else if (a === 'propagate') { K1.Anim.propagatePlayers(); UI().toast('Players copied into later frames', 'ok'); } else if (a === 'video') K1.Store.exportVideo(); else if (a === 'gif') K1.Store.exportGIF(); else if (a === 'pngs') K1.Store.exportAllFramesPNG(); else if (a === 'present') { if (K1.isMobile()) UI().closeSheet(); UI().togglePresent(true); } }; });
    $('[data-speed]', root).onchange = e => { K1.Anim.speed = parseFloat(e.target.value); K1.UI.renderFrames(); };
    $('[data-hold]', root).onchange = e => K1.saveSettings({ holdDuration: Number(e.target.value) || 0 });
    $('[data-alldur]', root).onchange = e => K1.Anim.setAllDurations(parseFloat(e.target.value) * 1000);
    bindToggles(root);
    $$('.frame-item', root).forEach(el => { el.onclick = e => { if (e.target.closest('input,button')) return; K1.Anim.goTo(parseInt(el.dataset.frame, 10)); }; });
    $$('[data-cap]', root).forEach(inp => { inp.onchange = () => K1.Anim.setCaption(parseInt(inp.dataset.cap, 10), inp.value); });
    $$('[data-dur]', root).forEach(inp => { inp.onchange = () => K1.Anim.setDuration(parseInt(inp.dataset.dur, 10), parseFloat(inp.value) * 1000); });
    $$('[data-mv]', root).forEach(b => { b.onclick = () => K1.Anim.moveFrame(parseInt(b.dataset.i, 10), parseInt(b.dataset.mv, 10)); });
    $$('[data-del]', root).forEach(b => { b.onclick = () => K1.Anim.deleteFrame(parseInt(b.dataset.del, 10)); });
  };

  /* ================================================================= MATCH */
  let matchTimer = null;
  let evTeam = 'home';
  P.match = function (root) {
    const M = K1.Match; const m = M.state(); const sc = M.score(); const pos = M.possessionPct(); const per = M.period();
    clearInterval(matchTimer);
    let s = '';
    if (m.compId && K1.Competitions) { const comp = K1.Competitions.get(m.compId); if (comp) { const cm = comp.matches.find(x => x.id === m.compMatchId); s += '<div class="comp-link">' + icon('trophy', { size: 15 }) + '<span><b>' + esc(comp.name) + '</b>' + (cm ? ' · ' + esc(K1.Competitions.matchLabel(comp, cm)) : '') + '</span><button class="btn btn-sm" data-act="savecomp">Save result</button></div>'; } }
    const teams = K1.Teams ? K1.Teams.sorted() : [];
    if (teams.length) s += '<div class="row"><span class="row-label">Team</span><select class="select" data-mteam>' + teams.map(t => '<option value="' + t.id + '"' + (t.id === m.teamId ? ' selected' : '') + '>' + esc(t.name) + ' · ' + esc(K1.Teams.formatLabel(t.pitch)) + '</option>').join('') + '<option value=""' + (!m.teamId ? ' selected' : '') + '>Other / none</option></select></div>';
    s += '<div class="scoreboard"><div class="sb-team"><input class="input center" data-mf="home" value="' + esc(m.home) + '"><div class="score">' + sc.home + '</div></div><div class="sb-mid"><div class="period">' + esc(per.label) + '</div><div class="clock" id="mClock">' + M.clockText() + '</div><div class="muted small" id="mMin">' + M.matchMinuteLabel() + '</div></div><div class="sb-team"><input class="input center" data-mf="away" value="' + esc(m.away) + '"><div class="score">' + sc.away + '</div></div></div>';
    const canStart = ['pre', 'HT', 'FT', 'ETB', 'AET'].includes(m.period) || (!m.clock.running && !['END'].includes(m.period));
    s += '<div class="row wrap center">' + (m.clock.running ? '<button class="btn btn-sm btn-primary" data-act="pause">' + icon('pause', { size: 15 }) + '<span>Pause</span></button>' : '<button class="btn btn-sm btn-primary" data-act="start"' + (m.period === 'END' ? ' disabled' : '') + '>' + icon('play', { size: 15 }) + '<span>' + (m.period === 'pre' ? 'Kick-off' : m.period === 'HT' ? 'Start 2nd half' : m.period === 'FT' ? 'Extra time' : m.period === 'ETB' ? 'Start ET2' : m.period === 'AET' ? 'Penalties' : 'Resume') + '</span></button>') +
      '<button class="btn btn-sm" data-act="end"' + (['pre', 'HT', 'FT', 'ETB', 'AET', 'END'].includes(m.period) ? ' disabled' : '') + '>' + icon('whistle', { size: 15 }) + '<span>End ' + (m.period.startsWith('ET') ? 'period' : 'half') + '</span></button>' +
      '<button class="btn btn-sm" data-act="min-">−1′</button><button class="btn btn-sm" data-act="min+">+1′</button>' +
      '<button class="btn btn-sm" data-act="finish" title="Finish the match"' + (m.period === 'END' ? ' disabled' : '') + '>' + icon('check', { size: 15 }) + '</button></div>';
    s += '<div class="row small-meta"><input class="input sm" type="date" data-mf="date" value="' + esc(m.date) + '"><input class="input sm" data-mf="competition" placeholder="Competition" value="' + esc(m.competition) + '"><input class="input sm" data-mf="venue" placeholder="Venue" value="' + esc(m.venue) + '"></div>';
    s += section('Possession', '<div class="poss-bar"><span style="width:' + pos.home + '%"></span></div><div class="row between"><b id="posH">' + pos.home + '%</b><div class="seg"><button class="' + (m.possession.current === 'home' ? 'on' : '') + '" data-poss="home">' + esc(m.home.split(' ')[0]) + '</button><button class="' + (!m.possession.current ? 'on' : '') + '" data-poss="none">Dead</button><button class="' + (m.possession.current === 'away' ? 'on' : '') + '" data-poss="away">' + esc(m.away.split(' ')[0]) + '</button></div><b id="posA">' + pos.away + '%</b></div><p class="hint">Tap who has the ball as play flows; the clock does the maths.</p>');
    s += section('Log an event', '<div class="seg full" data-seg="evteam"><button class="' + (evTeam === 'home' ? 'on' : '') + '" data-v="home">' + esc(m.home) + '</button><button class="' + (evTeam === 'away' ? 'on' : '') + '" data-v="away">' + esc(m.away) + '</button></div><div class="event-grid">' + M.EVENT_TYPES.map(t => '<button class="ev-btn" data-ev="' + t.id + '"' + (t.color ? ' style="--ev:' + t.color + '"' : '') + '>' + icon(t.icon, { size: 18 }) + '<span>' + esc(t.label) + '</span></button>').join('') + '</div>');
    const evs = m.events.slice().reverse();
    s += section('Timeline', evs.length ? '<div class="timeline">' + evs.map(e => { const t = M.EVENT_TYPES.find(x => x.id === e.type) || { label: e.type, icon: 'dot' }; const who = e.type === 'sub' ? (e.playerOff || '?') + ' ➜ ' + (e.playerOn || '?') : (e.player || ''); return '<div class="tl-row ' + e.team + '"><span class="tl-min">' + esc(e.minute) + '</span><span class="tl-ico"' + (t.color ? ' style="color:' + t.color + '"' : '') + '>' + icon(t.icon, { size: 15 }) + '</span><span class="tl-body"><b>' + esc(t.label) + '</b> <span class="muted">' + esc(e.team === 'home' ? m.home : m.away) + '</span>' + (who ? '<div>' + esc(who) + '</div>' : '') + (e.note ? '<div class="muted small">' + esc(e.note) + '</div>' : '') + '</span><button class="icon-btn sm" data-delev="' + e.id + '" title="Remove">' + icon('x', { size: 13 }) + '</button></div>'; }).join('') + '</div>' : '<p class="muted small">No events yet.</p>');
    s += section('Stats', '<table class="stats"><tr><th>' + esc(m.home.split(' ')[0]) + '</th><th></th><th>' + esc(m.away.split(' ')[0]) + '</th></tr>' + M.STAT_KEYS.map(k => '<tr><td><button class="icon-btn xs" data-stat="' + k + '" data-team="home" data-d="-1">−</button><b>' + (m.stats.home[k] || 0) + '</b><button class="icon-btn xs" data-stat="' + k + '" data-team="home" data-d="1">+</button></td><td class="lbl">' + M.STAT_LABEL[k] + '</td><td><button class="icon-btn xs" data-stat="' + k + '" data-team="away" data-d="-1">−</button><b>' + (m.stats.away[k] || 0) + '</b><button class="icon-btn xs" data-stat="' + k + '" data-team="away" data-d="1">+</button></td></tr>').join('') + '</table>');
    s += section('Notes', '<textarea class="input" rows="3" data-mf="notes" placeholder="Half-time messages, things to review…">' + esc(m.notes) + '</textarea>');
    s += section('Report', '<div class="row wrap"><button class="btn btn-sm" data-act="copy">' + icon('copy', { size: 15 }) + '<span>Copy report</span></button><button class="btn btn-sm" data-act="share">' + icon('share', { size: 15 }) + '<span>Share</span></button><button class="btn btn-sm" data-act="new">' + icon('plus', { size: 15 }) + '<span>Archive & new match</span></button><button class="btn btn-sm btn-danger-ghost" data-act="reset">' + icon('trash', { size: 15 }) + '<span>Reset</span></button></div>');
    const season = M.seasonStats(m.teamId || null);
    if (season.record.played) {
      const r = season.record;
      s += section('Season · ' + m.home, '<div class="record"><div><b>' + r.played + '</b><span>Played</span></div><div><b>' + r.won + '</b><span>Won</span></div><div><b>' + r.drawn + '</b><span>Drawn</span></div><div><b>' + r.lost + '</b><span>Lost</span></div><div><b>' + r.gf + ':' + r.ga + '</b><span>Goals</span></div></div>' +
        (season.scorers.length ? '<div class="field-label">Top scorers</div><div class="leaders">' + season.scorers.map((x, i) => '<div class="leader"><span class="rank">' + (i + 1) + '</span><span class="who">' + esc(x[0]) + '</span><b>' + x[1] + '</b></div>').join('') + '</div>' : '') +
        (season.assists.length ? '<div class="field-label">Assists</div><div class="leaders">' + season.assists.map((x, i) => '<div class="leader"><span class="rank">' + (i + 1) + '</span><span class="who">' + esc(x[0]) + '</span><b>' + x[1] + '</b></div>').join('') + '</div>' : '') +
        (season.cards.length ? '<div class="field-label">Cards</div><div class="leaders">' + season.cards.map((x, i) => '<div class="leader"><span class="rank">' + (i + 1) + '</span><span class="who">' + esc(x[0]) + '</span><b>' + x[1] + '</b></div>').join('') + '</div>' : '') +
        '<p class="hint">Built from archived matches. Log scorers as “9 Mokoena” consistently so the totals line up.</p>');
    }
    const hist = M.history();
    if (hist.length) s += section('Previous matches', '<div class="hist">' + hist.map(h => '<div class="hist-row"><span><b>' + esc(h.home) + ' ' + h.score.home + '–' + h.score.away + ' ' + esc(h.away) + '</b><br><span class="muted small">' + esc(h.date) + (h.competition ? ' · ' + esc(h.competition) : '') + '</span></span><button class="icon-btn sm" data-hcopy="' + h.id + '" title="Copy report">' + icon('copy', { size: 14 }) + '</button><button class="icon-btn sm" data-hdel="' + h.id + '" title="Delete">' + icon('trash', { size: 14 }) + '</button></div>').join('') + '</div>');
    root.innerHTML = s;

    const mteam = $('[data-mteam]', root); if (mteam) mteam.onchange = e => M.setTeam(e.target.value || null);
    matchTimer = setInterval(() => { const c = $('#mClock', root); if (!c) { clearInterval(matchTimer); return; } c.textContent = M.clockText(); const mm = $('#mMin', root); if (mm) mm.textContent = M.matchMinuteLabel(); const p = M.possessionPct(); const ph = $('#posH', root), pa = $('#posA', root); if (ph) { ph.textContent = p.home + '%'; pa.textContent = p.away + '%'; const bar = $('.poss-bar span', root); if (bar) bar.style.width = p.home + '%'; } }, 500);
    $$('[data-mf]', root).forEach(inp => { inp.onchange = () => { m[inp.dataset.mf] = inp.value; M.save(); }; });
    $$('[data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'start') M.start(); else if (a === 'pause') M.pause(); else if (a === 'end') M.endPeriod(); else if (a === 'finish') { if (await UI().confirm('Finish the match?')) M.finish(); }
      else if (a === 'min-') M.adjustClock(-60000); else if (a === 'min+') M.adjustClock(60000);
      else if (a === 'savecomp') { const r = M.saveToCompetition(); UI().toast(r ? 'Result saved to the competition' : 'No competition linked to this match', r ? 'ok' : 'warn'); }
      else if (a === 'copy') { try { await navigator.clipboard.writeText(M.summaryText()); UI().toast('Report copied', 'ok'); } catch (e) { UI().modal({ title: 'Match report', body: '<textarea class="input mono" rows="12" readonly>' + esc(M.summaryText()) + '</textarea>' }); } }
      else if (a === 'share') { if (navigator.share) { try { await navigator.share({ title: 'Match report', text: M.summaryText() }); } catch (e) { /* cancelled */ } } else { try { await navigator.clipboard.writeText(M.summaryText()); UI().toast('Report copied', 'ok'); } catch (e) { /* ignore */ } } }
      else if (a === 'new') { if (await UI().confirm('Archive this match and start a new one?')) M.newMatch(); }
      else if (a === 'reset') { if (await UI().confirm('Reset the current match? Events and the clock are lost.', { ok: 'Reset', danger: true })) M.reset(); }
    }; });
    $$('[data-poss]', root).forEach(b => { b.onclick = () => { const t = b.dataset.poss; if (t === 'none') { if (m.possession.current) M.setPossession(m.possession.current); } else M.setPossession(t); }; });
    bindSeg(root, 'evteam', v => { evTeam = v; });
    $$('[data-ev]', root).forEach(b => { b.onclick = () => logEvent(b.dataset.ev); });
    $$('[data-delev]', root).forEach(b => { b.onclick = () => M.removeEvent(b.dataset.delev); });
    $$('[data-stat]', root).forEach(b => { b.onclick = () => M.inc(b.dataset.team, b.dataset.stat, parseInt(b.dataset.d, 10)); });
    $$('[data-hcopy]', root).forEach(b => { b.onclick = async () => { const h = M.history().find(x => x.id === b.dataset.hcopy); try { await navigator.clipboard.writeText(h.summary); UI().toast('Copied', 'ok'); } catch (e) { UI().modal({ title: 'Match report', body: '<textarea class="input mono" rows="12" readonly>' + esc(h.summary) + '</textarea>' }); } }; });
    $$('[data-hdel]', root).forEach(b => { b.onclick = async () => { if (await UI().confirm('Delete this match record?', { ok: 'Delete', danger: true })) M.deleteHistory(b.dataset.hdel); }; });
  };
  function logEvent(type) {
    const M = K1.Match; const m = M.state();
    const team = evTeam;
    const def = M.EVENT_TYPES.find(t => t.id === type);
    const needsPlayer = ['goal', 'pen_goal', 'pen_miss', 'own_goal', 'yellow', 'red', 'injury', 'note', 'sub'].includes(type);
    if (!needsPlayer) { M.addEvent(type, team); UI().toast(def.label + ' · ' + (team === 'home' ? m.home : m.away), 'ok', 1200); return; }
    const squad = team === 'home' ? K1.Squad.sorted(m.teamId || undefined) : [];
    const playerField = (id, label) => '<label class="field span2"><span>' + label + '</span><input class="input" id="' + id + '" list="' + id + 'List" placeholder="Number or name">' + (squad.length ? '<datalist id="' + id + 'List">' + squad.map(p => '<option value="' + esc(p.n + ' ' + p.name) + '"></option>').join('') + '</datalist>' : '') + '</label>';
    const body = '<div class="form-grid">' + (type === 'sub' ? playerField('evOff', 'Player off') + playerField('evOn', 'Player on') : playerField('evPlayer', type === 'note' ? 'About (optional)' : 'Player')) +
      (type === 'goal' ? playerField('evAssist', 'Assist (optional)') : '') +
      '<label class="field span2"><span>Note</span><input class="input" id="evNote" placeholder="' + (type === 'goal' ? 'e.g. header from a corner' : 'optional') + '"></label></div>';
    UI().modal({ title: def.label + ' · ' + (team === 'home' ? m.home : m.away) + ' · ' + M.matchMinuteLabel(), body, actions: [{ label: 'Cancel' }, { label: 'Log it', primary: true, onClick: () => {
      const extra = { note: $('#evNote').value.trim() };
      if (type === 'sub') { extra.playerOff = $('#evOff').value.trim(); extra.playerOn = $('#evOn').value.trim(); }
      else { extra.player = $('#evPlayer').value.trim(); if (type === 'goal') { const as = $('#evAssist').value.trim(); if (as) extra.note = ('assist: ' + as + (extra.note ? ' · ' + extra.note : '')); } }
      M.addEvent(type, team, extra);
      UI().toast(def.label + ' logged', 'ok', 1200);
    } }] });
  }

  /* ============================================================== SESSIONS */
  let currentSession = null;
  P.openSession = id => { currentSession = id; };
  P.sessions = function (root) {
    const SS = K1.Sessions;
    if (currentSession && !SS.get(currentSession)) currentSession = null;
    if (!currentSession) {
      const list = SS.list();
      let s = section('Training sessions', '<div class="row wrap"><button class="btn btn-primary btn-sm" data-act="blank">' + icon('plus', { size: 15 }) + '<span>New session</span></button><select class="select" id="ssTemplate"><option value="">From a template…</option>' + SS.TEMPLATES.map((t, i) => '<option value="' + i + '">' + esc(t.name) + ' · ' + t.blocks.reduce((a, b) => a + b.minutes, 0) + ' min</option>').join('') + '</select></div>' +
        (list.length ? '<div class="list">' + list.map(x => { const tm = x.teamId && K1.Teams ? K1.Teams.get(x.teamId) : null; return '<button class="list-row" data-open="' + x.id + '"><span class="lr-main"><b>' + esc(x.title) + '</b><span class="muted small">' + (tm ? esc(tm.name) + ' · ' : '') + esc(x.date) + ' · ' + x.blocks.length + ' blocks · ' + SS.total(x) + ' min' + (x.theme ? ' · ' + esc(x.theme) : '') + '</span></span>' + icon('chevronRight', { size: 16 }) + '</button>'; }).join('') + '</div>' : '<div class="empty-card">' + icon('calendar', { size: 28 }) + '<p>Plan a session: warm-up → drills → game → cool-down, with timings, coaching points and a printable plan.</p></div>'));
      root.innerHTML = s;
      $('[data-act=blank]', root).onclick = () => { currentSession = SS.create({}).id; P.sessions(root); };
      $('#ssTemplate', root).onchange = e => { const t = SS.TEMPLATES[Number(e.target.value)]; if (t) { currentSession = SS.fromTemplate(t).id; P.sessions(root); } };
      $$('[data-open]', root).forEach(b => { b.onclick = () => { currentSession = b.dataset.open; P.sessions(root); }; });
      return;
    }
    const sess = SS.get(currentSession);
    const drills = K1.DRILLS;
    let t = 0;
    let s = '<button class="btn btn-sm btn-ghost" data-act="back">' + icon('arrowLeft', { size: 15 }) + '<span>All sessions</span></button>';
    s += section('', '<div class="form-grid"><label class="field span2"><span>Title</span><input class="input" data-sf="title" value="' + esc(sess.title) + '"></label><label class="field"><span>Date</span><input class="input" type="date" data-sf="date" value="' + esc(sess.date) + '"></label><label class="field"><span>Team</span><select class="select" data-sf="teamId">' + (K1.Teams ? K1.Teams.sorted().map(t => '<option value="' + t.id + '"' + (t.id === sess.teamId ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('') : '') + '<option value=""' + (!sess.teamId ? ' selected' : '') + '>Whole club</option></select></label><label class="field span2"><span>Theme</span><input class="input" data-sf="theme" value="' + esc(sess.theme || '') + '" placeholder="e.g. Pressing triggers"></label></div>');
    s += section('Plan · ' + SS.total(sess) + ' min', '<div class="blocks">' + sess.blocks.map((b, i) => { const start = t; t += Number(b.minutes) || 0; const dr = b.drillId ? drills.find(d => d.id === b.drillId) : null; return '<div class="block" data-bid="' + b.id + '"><div class="block-head"><span class="block-time">' + start + '′</span><input class="input sm grow" data-bf="name" value="' + esc(b.name) + '"><input class="input num sm" type="number" min="1" max="120" data-bf="minutes" value="' + esc(b.minutes) + '"><span class="muted small">min</span></div><div class="block-row"><select class="select sm" data-bf="type">' + SS.TYPES.map(x => '<option' + (x === b.type ? ' selected' : '') + '>' + x + '</option>').join('') + '</select><select class="select sm grow" data-bf="drillId"><option value="">No drill board</option>' + drills.map(d => '<option value="' + d.id + '"' + (d.id === b.drillId ? ' selected' : '') + '>' + esc(d.name) + '</option>').join('') + '</select>' + (dr ? '<button class="icon-btn sm" data-opendrill="' + dr.id + '" title="Open drill board">' + icon('book', { size: 14 }) + '</button>' : '') + '</div><textarea class="input sm" rows="2" data-bf="desc" placeholder="Organisation, rules, coaching points…">' + esc(b.desc || (dr ? dr.desc : '')) + '</textarea><div class="block-row end"><button class="icon-btn sm" data-bmv="-1" title="Move up"' + (i === 0 ? ' disabled' : '') + '>' + icon('chevronUp', { size: 14 }) + '</button><button class="icon-btn sm" data-bmv="1" title="Move down"' + (i === sess.blocks.length - 1 ? ' disabled' : '') + '>' + icon('chevronDown', { size: 14 }) + '</button><button class="icon-btn sm danger" data-bdel title="Remove block">' + icon('trash', { size: 14 }) + '</button></div></div>'; }).join('') + '</div>' +
      '<div class="row wrap"><button class="btn btn-sm" data-act="addblock">' + icon('plus', { size: 15 }) + '<span>Add block</span></button><button class="btn btn-sm" data-act="print">' + icon('print', { size: 15 }) + '<span>Print / PDF</span></button><button class="btn btn-sm btn-danger-ghost" data-act="delete">' + icon('trash', { size: 15 }) + '<span>Delete session</span></button></div>');
    const squad = SS.playersOf(sess);
    const att = sess.attendance || {};
    const sum = SS.attendanceSummary(sess);
    s += section('Attendance' + (squad.length ? ' · ' + sum.there + ' / ' + sum.squad + ' there' : ''), squad.length
      ? '<div class="row wrap"><button class="btn btn-sm" data-act="allPresent">' + icon('check', { size: 15 }) + '<span>All present</span></button><button class="btn btn-sm btn-ghost" data-act="clearAtt">Clear</button></div>' +
        '<div class="att-list">' + squad.map(p => '<div class="att-row" data-pid="' + p.id + '"><span class="num">' + esc(p.n) + '</span><span class="name">' + esc(p.name) + '</span><div class="seg att-seg">' + SS.ATTENDANCE.map(a => '<button class="' + (att[p.id] === a[0] ? 'on ' + a[0] : '') + '" data-att="' + a[0] + '" title="' + a[1] + '">' + a[1][0] + '</button>').join('') + '</div></div>').join('') + '</div>' +
        '<p class="hint">P present · L late · I injured · A absent. Rates over the season show in the Squad pane.</p>'
      : '<p class="muted small">Add your squad (Squad pane) to take attendance here.</p>');
    s += section('Session notes', '<textarea class="input" rows="3" data-sf="notes" placeholder="Reflection after the session, who stood out…">' + esc(sess.notes || '') + '</textarea>');
    root.innerHTML = s;
    $$('[data-sf]', root).forEach(inp => { inp.onchange = () => { if (inp.dataset.sf === 'teamId') { const t = inp.value && K1.Teams ? K1.Teams.get(inp.value) : null; SS.update(sess.id, { teamId: t ? t.id : null, group: t ? t.name : 'Whole club' }); P.sessions(root); } else SS.update(sess.id, { [inp.dataset.sf]: inp.value }); }; });
    $$('.att-row', root).forEach(row => { $$('[data-att]', row).forEach(b => { b.onclick = () => { const cur = (SS.get(sess.id).attendance || {})[row.dataset.pid]; SS.setAttendance(sess.id, row.dataset.pid, cur === b.dataset.att ? null : b.dataset.att); P.sessions(root); }; }); });
    $$('.block', root).forEach(bl => {
      const bid = bl.dataset.bid;
      $$('[data-bf]', bl).forEach(inp => { inp.onchange = () => { const f = inp.dataset.bf; SS.updateBlock(sess.id, bid, { [f]: inp.type === 'number' ? Number(inp.value) : inp.value }); if (f === 'drillId' || f === 'minutes') P.sessions(root); }; });
      $$('[data-bmv]', bl).forEach(b => { b.onclick = () => { SS.moveBlock(sess.id, bid, parseInt(b.dataset.bmv, 10)); P.sessions(root); }; });
      const del = $('[data-bdel]', bl); if (del) del.onclick = () => { SS.removeBlock(sess.id, bid); P.sessions(root); };
      const od = $('[data-opendrill]', bl); if (od) od.onclick = () => { const dr = drills.find(d => d.id === od.dataset.opendrill); openDoc(K1.Templates.docFromDrill(dr), dr.name); };
    });
    $$('[data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'back') { currentSession = null; P.sessions(root); }
      else if (a === 'allPresent') { SS.markAll(sess.id, 'present'); P.sessions(root); }
      else if (a === 'clearAtt') { SS.update(sess.id, { attendance: {} }); P.sessions(root); }
      else if (a === 'addblock') { SS.addBlock(sess.id, {}); P.sessions(root); }
      else if (a === 'print') { const w = window.open('', '_blank'); if (!w) { UI().toast('Allow pop-ups to print.', 'warn'); return; } w.document.write(SS.printHTML(SS.get(sess.id))); w.document.close(); }
      else if (a === 'delete') { if (await UI().confirm('Delete “' + esc(sess.title) + '”?', { ok: 'Delete', danger: true })) { SS.remove(sess.id); currentSession = null; P.sessions(root); } }
    }; });
  };

  /* =============================================================== LIBRARY */
  let libQuery = '';
  P.library = function (root) {
    const all = K1.Store.listBoards();
    const q = libQuery.trim().toLowerCase();
    const list = all.filter(b => !q || b.title.toLowerCase().includes(q) || (b.tags || []).join(' ').toLowerCase().includes(q));
    let s = '<div class="row wrap"><button class="btn btn-primary btn-sm" data-act="save">' + icon('save', { size: 15 }) + '<span>Save current</span></button><button class="btn btn-sm" data-act="saveas">' + icon('duplicate', { size: 15 }) + '<span>Save as new</span></button><button class="btn btn-sm" data-act="import">' + icon('upload', { size: 15 }) + '<span>Import</span></button><button class="btn btn-sm" data-act="backup" title="Everything: boards, squad, sessions, matches">' + icon('download', { size: 15 }) + '<span>Back up all</span></button></div>';
    s += '<div class="search"><input class="input" id="libSearch" placeholder="Search saved boards…" value="' + esc(libQuery) + '">' + icon('select', { size: 14 }) + '</div>';
    s += list.length ? '<div class="lib-grid">' + list.map(b => '<div class="lib-card' + (b.id === S.doc.id ? ' current' : '') + '" data-id="' + b.id + '"><div class="lib-thumb">' + b.thumb + '</div><div class="lib-body"><b>' + esc(b.title) + '</b><span class="muted small">' + esc((K1.PITCHES[b.pitch] || {}).short || b.pitch) + ' · ' + b.frames + ' frame' + (b.frames === 1 ? '' : 's') + ' · ' + K1.fmtDate(b.updatedAt) + '</span></div><div class="lib-actions"><button class="btn btn-sm btn-primary" data-open>Open</button><button class="icon-btn sm" data-menu title="More">' + icon('more', { size: 16 }) + '</button></div></div>').join('') + '</div>' : '<div class="empty-card">' + icon('folder', { size: 28 }) + '<p>' + (all.length ? 'No boards match your search.' : 'Nothing saved yet. Press Save (or Ctrl+S) to keep the current board here. Boards are stored on this device; use Back up to export them.') + '</p></div>';
    s += '<p class="muted small center">' + all.length + ' boards · ' + Math.round(K1.Store.usage() / 1024) + ' KB used</p>';
    root.innerHTML = s;
    $$('[data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'save') K1.Store.saveCurrent();
      else if (a === 'saveas') { const t = await UI().prompt('Save as new board', { value: S.doc.title + ' (copy)' }); if (t != null) K1.Store.saveCurrent({ asNew: true, title: t }); }
      else if (a === 'import') UI().importFile();
      else if (a === 'backup') K1.Store.exportAll();
    }; });
    const search = $('#libSearch', root);
    search.oninput = () => { libQuery = search.value; const pos = search.selectionStart; P.library(root); const s2 = $('#libSearch', root); s2.focus(); try { s2.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } };
    $$('.lib-card', root).forEach(card => {
      const id = card.dataset.id;
      const open = () => { const b = K1.Store.getBoard(id); if (b) openDoc(K1.clone(b.doc), b.title).then(ok => { if (ok) S.dirty = false; }); };
      $('[data-open]', card).onclick = open;
      $('.lib-thumb', card).onclick = open;
      $('[data-menu]', card).onclick = e => { e.stopPropagation(); UI().popover(e.currentTarget, [
        { label: 'Open', icon: 'folder', onClick: open },
        { label: 'Rename…', icon: 'edit', onClick: async () => { const b = K1.Store.getBoard(id); const t = await UI().prompt('Rename board', { value: b.title }); if (t != null && t.trim()) { K1.Store.renameBoard(id, t.trim()); if (S.doc.id === id) { S.doc.title = t.trim(); K1.emit('saved'); } } } },
        { label: 'Duplicate', icon: 'duplicate', onClick: () => K1.Store.duplicateBoard(id) },
        { label: 'Export file (.json)', icon: 'download', onClick: () => { const b = K1.Store.getBoard(id); K1.Store.exportJSON(b.doc); } },
        { sep: true },
        { label: 'Delete', icon: 'trash', danger: true, onClick: async () => { const b = K1.Store.getBoard(id); if (await UI().confirm('Delete “' + esc(b.title) + '” from the library?', { ok: 'Delete', danger: true })) K1.Store.deleteBoard(id); } },
      ]); };
    });
  };

  /* ============================================================== SETTINGS */
  P.settingsModal = function () {
    const st = K1.settings;
    const kitOpts = sel => K1.KITS.map(k => '<option value="' + k.id + '"' + (k.id === sel ? ' selected' : '') + '>' + esc(k.name) + '</option>').join('');
    const body = '<div class="settings">' +
      section('Coach & club', '<div class="form-grid"><label class="field"><span>Coach name (on exports)</span><input class="input" data-s="coachName" value="' + esc(st.coachName) + '"></label><label class="field"><span>Interface</span>' + seg('uiTheme', [['dark', 'Dark'], ['light', 'Light']], st.uiTheme) + '</label></div>' +
        '<div class="logo-row">' + K1.logoHTML(56) + '<div><b>Club badge</b><p class="muted small">The K1 Shooters crest is built in and appears in the app and on every export. Upload a different image (PNG/JPG/SVG) to replace it, for example for another team you coach.</p><div class="row wrap"><button class="btn btn-sm" data-act="logo">' + icon('upload', { size: 15 }) + '<span>Upload a logo</span></button>' + (K1.customLogo() ? '<button class="btn btn-sm" data-act="logoReset">Back to the K1 crest</button>' : '') + '</div></div></div>') +
      section('Defaults for new boards', '<div class="form-grid"><label class="field"><span>Home team</span><input class="input" data-s="homeName" value="' + esc(st.homeName) + '"></label><label class="field"><span>Home kit</span><select class="select" data-s="homeKit">' + kitOpts(st.homeKit) + '</select></label><label class="field"><span>Opponent</span><input class="input" data-s="awayName" value="' + esc(st.awayName) + '"></label><label class="field"><span>Opponent kit</span><select class="select" data-s="awayKit">' + kitOpts(st.awayKit) + '</select></label><label class="field"><span>Pitch</span><select class="select" data-s="defaultPitch">' + Object.values(K1.PITCHES).map(p => '<option value="' + p.id + '"' + (p.id === st.defaultPitch ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></label><label class="field"><span>Surface</span><select class="select" data-s="defaultTheme">' + Object.values(K1.THEMES).map(t => '<option value="' + t.id + '"' + (t.id === st.defaultTheme ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('') + '</select></label></div>') +
      section('Board behaviour', toggle('showNames', 'Show player names', st.showNames) + toggle('showNumbers', 'Show shirt numbers', st.showNumbers) + toggle('tokenPhotos', 'Player photos on tokens', st.tokenPhotos !== false) + toggle('snap', 'Snap to 0.5 m grid', st.snap) + toggle('showGhosts', 'Ghosts from previous frame', st.showGhosts) + toggle('ghostArrows', 'Ghost movement arrows', st.ghostArrows) + toggle('haptics', 'Vibration feedback (phones)', st.haptics) + toggle('autosave', 'Autosave working copy', st.autosave) +
        '<div class="row"><span class="row-label">Token size</span>' + seg('tokenSize', [['sm', 'S'], ['md', 'M'], ['lg', 'L']], st.tokenSize) + '</div>' +
        '<div class="row"><span class="row-label">Text size</span>' + seg('fontScale', [['0.9', 'A−'], ['1', 'A'], ['1.15', 'A+']], String(st.fontScale || 1)) + '</div>' +
        '<div class="row"><span class="row-label">Default transition</span><input class="input num" type="number" min="200" max="10000" step="100" data-s="frameDuration" value="' + st.frameDuration + '"><span class="muted small">ms</span></div>') +
      section('Data', '<p class="muted small">Everything is stored in this browser on this device (' + Math.round(K1.Store.usage() / 1024) + ' KB). Back up regularly if it matters — a browser reset would lose it.</p><div class="row wrap"><button class="btn btn-sm" data-act="backup">' + icon('download', { size: 15 }) + '<span>Back up everything</span></button><button class="btn btn-sm" data-act="import">' + icon('upload', { size: 15 }) + '<span>Restore / import</span></button><button class="btn btn-sm" data-act="install">' + icon('smartphone', { size: 15 }) + '<span>Install app</span></button><button class="btn btn-sm btn-danger-ghost" data-act="wipe">' + icon('trash', { size: 15 }) + '<span>Erase all data</span></button></div>') +
      '</div>';
    const m = UI().modal({ title: 'Settings', wide: true, body });
    $$('[data-s]', m.body).forEach(inp => { inp.onchange = () => { let v = inp.value; if (inp.type === 'number') v = Number(v); K1.saveSettings({ [inp.dataset.s]: v }); }; });
    bindToggles(m.body);
    bindSeg(m.body, 'uiTheme', v => K1.saveSettings({ uiTheme: v }));
    bindSeg(m.body, 'tokenSize', v => K1.saveSettings({ tokenSize: v }));
    bindSeg(m.body, 'fontScale', v => K1.saveSettings({ fontScale: parseFloat(v) }));
    $$('[data-act]', m.body).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'logo') { const f = await K1.Store.pickFile('image/*'); if (f) { if (f.size > 900 * 1024) { UI().toast('Please use an image under 900 KB.', 'warn'); return; } K1.Store.setLogo(await K1.Store.readFileDataURL(f)); UI().toast('Logo updated', 'ok'); m.close(); P.settingsModal(); } }
      else if (a === 'logoReset') { K1.Store.setLogo(null); m.close(); P.settingsModal(); }
      else if (a === 'backup') K1.Store.exportAll();
      else if (a === 'import') UI().importFile();
      else if (a === 'install') UI().installApp();
      else if (a === 'wipe') { if (await UI().confirm('Erase ALL boards, squad, sessions, matches and settings from this device? This cannot be undone.', { ok: 'Erase everything', danger: true })) { Object.keys(localStorage).filter(k => k.startsWith('k1tb:')).forEach(k => localStorage.removeItem(k)); location.reload(); } }
    }; });
  };

  K1.Panes = P;
})(window.K1 = window.K1 || {});
