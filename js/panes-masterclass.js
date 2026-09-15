/* K1 Shooters club app — Masterclass pane: browse, read and present tactical masterclasses */
(function (K1) {
  'use strict';

  const P = K1.Panes;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const UI = () => K1.UI;
  const MC = () => K1.Masterclass;

  let current = null, slideIx = 0, showNotes = false;
  let classTab = 'classes';  // classes | season
  P.setClassTab = t => { classTab = t; };

  /* Definition first, footage second. Every concept module opens with one of these:
   * the term, what it means in one sentence, and what problem it makes for the opponent.
   * A concept nobody can name is a concept nobody can be coached on. */
  function defineHTML(sl) {
    const d = sl && sl.define; if (!d) return '';
    return '<div class="ms-def"><span class="ms-term">' + esc(d.term) + '</span>' +
      (d.meaning ? '<p class="ms-mean">' + esc(d.meaning) + '</p>' : '') +
      (d.hurts ? '<p class="ms-hurts"><span>Why it hurts them</span>' + esc(d.hurts) + '</p>' : '') +
      '</div>';
  }

  /* The coach's script: the words to say, the question to ask instead of the instruction
   * to give, and the one cue to repeat. Optional on every slide — old slides are unaffected. */
  function sayHTML(sl, cls) {
    const say = sl && sl.say; if (!say) return '';
    return '<div class="ms-say' + (cls ? ' ' + cls : '') + '"><b>What to say</b>' +
      (say.script ? '<p>' + esc(say.script) + '</p>' : '') +
      (say.ask ? '<p class="ms-ask"><span>Ask them</span>' + esc(say.ask) + '</p>' : '') +
      (say.cue ? '<p class="ms-cue"><span>Keep shouting</span>' + esc(say.cue) + '</p>' : '') +
      '</div>';
  }
  const section = (title, body) => '<section class="pane-section">' + (title ? '<h4>' + title + '</h4>' : '') + body + '</section>';
  P.openMasterclass = (id, ix) => { current = id; slideIx = ix || 0; };

  /* ================================================================= LIST */
  function tabsHTML() {
    return '<div class="seg cls-tabs">' +
      '<button class="seg-btn' + (classTab === 'classes' ? ' on' : '') + '" data-ctab="classes">Masterclasses</button>' +
      '<button class="seg-btn' + (classTab === 'season' ? ' on' : '') + '" data-ctab="season">Season plan</button></div>';
  }
  function bindTabs(root) {
    $$('[data-ctab]', root).forEach(b => { b.onclick = () => { classTab = b.dataset.ctab; current = null; P.masterclass(root); }; });
  }

  P.masterclass = function (root) {
    if (current && !MC().get(current)) current = null;
    if (classTab === 'season' && !current) {
      root.innerHTML = tabsHTML() + '<div id="curHost"></div>';
      bindTabs(root);
      P.curriculum($('#curHost', root));   // renders and binds inside its own host
      return;
    }
    if (current) return renderOne(root, MC().get(current));
    let s = tabsHTML() + section('Tactical masterclasses', '<p class="muted small">Sessions you can present to the team: the idea, the shape on the pitch, the coaching points and the drills that train it. Open one, press Present, and step through it with the arrow keys or on the phone with a swipe of the buttons.</p>');
    MC().groups().forEach(g => {
      s += '<h5 class="group-title">' + esc(g.name) + '</h5><div class="mc-grid">' + g.items.map(m => '<button class="mc-card" data-mc="' + m.id + '"' + (m.accent ? ' style="--mc:' + m.accent + '"' : '') + '><span class="mc-bar"></span><span class="mc-body"><b>' + esc(m.title) + '</b><small>' + esc(m.subtitle || '') + '</small><span class="tags">' + (m.coach ? '<span class="tag">' + esc(m.coach) + '</span>' : '') + '<span class="tag">' + MC().slideCount(m) + ' slides</span>' + (m.level ? '<span class="tag">' + esc(m.level) + '</span>' : '') + (m.duration ? '<span class="tag">' + esc(m.duration) + '</span>' : '') + '</span></span>' + icon('chevronRight', { size: 18 }) + '</button>').join('') + '</div>';
    });
    root.innerHTML = s;
    bindTabs(root);
    $$('[data-mc]', root).forEach(b => { b.onclick = () => { current = b.dataset.mc; slideIx = 0; P.masterclass(root); }; });
  };

  /* =============================================================== DETAIL */
  function renderOne(root, mc) {
    let s = '<button class="btn btn-sm btn-ghost" data-act="back">' + icon('arrowLeft', { size: 15 }) + '<span>All masterclasses</span></button>';
    s += '<div class="mc-head"' + (mc.accent ? ' style="--mc:' + mc.accent + '"' : '') + '><div><b class="mc-title">' + esc(mc.title) + '</b><div class="muted small">' + esc([mc.subtitle, mc.coach ? 'after ' + mc.coach : '', mc.level, mc.duration].filter(Boolean).join(' · ')) + '</div></div></div>';
    if (mc.summary) s += '<p class="mc-summary">' + esc(mc.summary) + '</p>';
    s += '<div class="row wrap comp-actions"><button class="btn btn-sm btn-primary" data-act="present">' + icon('fullscreen', { size: 15 }) + '<span>Present to the team</span></button><button class="btn btn-sm" data-act="print">' + icon('print', { size: 15 }) + '<span>Handout (PDF)</span></button><button class="btn btn-sm" data-act="wa">' + icon('share', { size: 15 }) + '<span>WhatsApp summary</span></button>' + (mc.sessionIds && mc.sessionIds.length ? '<button class="btn btn-sm" data-act="session">' + icon('calendar', { size: 15 }) + '<span>Build the session</span></button>' : '') + '</div>';
    s += '<div class="mc-slides">' + mc.slides.map((sl, i) => slideCard(sl, i)).join('') + '</div>';
    if (mc.sources && mc.sources.length) s += section('Where this comes from', '<ul class="src">' + mc.sources.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>');
    root.innerHTML = s;
    bind(root, mc);
  }

  function slideCard(sl, i) {
    const pic = sl.board ? MC().previewSVG(sl.board, 520, 340, sl.title) : '';
    return '<div class="mc-slide' + (sl.kind ? ' ' + sl.kind : '') + '" data-slide="' + i + '">' +
      '<div class="ms-body"><div class="ms-head"><span class="ms-n">' + (i + 1) + '</span><b>' + esc(sl.title) + '</b></div>' +
      defineHTML(sl) +
      (sl.lead ? '<p class="ms-lead">' + esc(sl.lead) + '</p>' : '') +
      (sl.points && sl.points.length ? '<ul class="ms-points">' + sl.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') +
      (sl.quote ? '<blockquote>“' + esc(sl.quote.text) + '”<cite>' + esc(sl.quote.by) + (sl.quote.source ? ' · ' + esc(sl.quote.source) : '') + '</cite></blockquote>' : '') +
      (sl.coaching && sl.coaching.length ? '<div class="ms-cp"><b>Coaching points</b><ul>' + sl.coaching.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></div>' : '') +
      (sl.note ? '<p class="ms-note">' + esc(sl.note) + '</p>' : '') +
      sayHTML(sl) +
      (sl.board ? '<div class="row wrap"><button class="btn btn-sm" data-open="' + i + '">' + icon('grid', { size: 15 }) + '<span>Open on the board</span></button><button class="btn btn-sm btn-ghost" data-present="' + i + '">' + icon('fullscreen', { size: 15 }) + '<span>Present from here</span></button></div>' : '') +
      '</div>' + (pic ? '<div class="ms-pic" data-open="' + i + '">' + pic + (sl.caption ? '<span class="cap">' + esc(sl.caption) + '</span>' : '') + '</div>' : '') + '</div>';
  }

  function bind(root, mc) {
    $('[data-act=back]', root).onclick = () => { current = null; P.masterclass(root); };
    $$('.comp-actions [data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'present') P.presentMasterclass(mc.id, 0);
      else if (a === 'print') { const w = window.open('', '_blank'); if (!w) { UI().toast('Allow pop-ups to print.', 'warn'); return; } w.document.write(MC().printHTML(mc)); w.document.close(); }
      else if (a === 'wa') { const txt = MC().shareText(mc); const url = 'https://wa.me/?text=' + encodeURIComponent(txt); const w = window.open(url, '_blank', 'noopener'); if (!w) { try { await navigator.clipboard.writeText(txt); UI().toast('Copied — paste it into WhatsApp', 'ok'); } catch (e) { UI().modal({ title: mc.title, body: '<textarea class="input mono" rows="14" readonly>' + esc(txt) + '</textarea>' }); } } }
      else if (a === 'session') buildSession(mc);
    }; });
    $$('[data-open]', root).forEach(b => { b.onclick = e => { e.stopPropagation(); openSlideBoard(mc, Number(b.dataset.open)); }; });
    $$('[data-present]', root).forEach(b => { b.onclick = e => { e.stopPropagation(); P.presentMasterclass(mc.id, Number(b.dataset.present)); }; });
  }

  function openSlideBoard(mc, i) {
    const sl = mc.slides[i]; if (!sl || !sl.board) return;
    const doc = MC().docFor(sl.board, sl.title);
    if (!doc) { UI().toast('That board could not be built.', 'warn'); return; }
    doc.title = mc.title + ' · ' + sl.title;
    if (!doc.notes) doc.notes = [sl.lead || '', (sl.points || []).map(p => '• ' + p).join('\n'), (sl.coaching || []).length ? 'Coaching points:\n' + sl.coaching.map(p => '• ' + p).join('\n') : ''].filter(Boolean).join('\n\n');
    P.openDoc(doc, sl.title);
  }

  /** Turn a masterclass's linked drills into a ready training session. */
  function buildSession(mc) {
    const blocks = (mc.sessionIds || []).map(id => {
      const d = (K1.DRILLS || []).find(x => x.id === id);
      return d ? { name: d.name, minutes: parseInt(d.time, 10) || 15, type: d.group.indexOf('Warm') === 0 ? 'Warm-up' : d.group.indexOf('Finish') === 0 ? 'Finishing' : d.group.indexOf('Press') === 0 ? 'Tactical' : d.group.indexOf('Small') === 0 ? 'Game' : 'Possession', desc: d.desc, drillId: d.id } : null;
    }).filter(Boolean);
    if (!blocks.length) { UI().toast('No drills linked to this masterclass yet.'); return; }
    const s = K1.Sessions.create({ title: mc.title + ' — session', theme: mc.subtitle || '', blocks });
    P.openSession(s.id);
    UI().goSection('sessions');
    UI().toast('Session created from ' + mc.title, 'ok');
  }

  /* ============================================================== PRESENT */
  let pres = null;
  P.presentMasterclass = function (id, ix) {
    const mc = MC().get(id); if (!mc) return;
    closePresent();
    slideIx = ix || 0;
    const el = document.createElement('div');
    el.className = 'mc-present';
    el.innerHTML = '<div class="mcp-stage"><div class="mcp-pic" id="mcpPic"></div><div class="mcp-text" id="mcpText"></div></div>' +
      '<div class="mcp-bar"><button class="icon-btn" data-p="prev" title="Previous (←)">' + icon('chevronLeft') + '</button>' +
      '<span class="mcp-title" id="mcpTitle"></span>' +
      '<span class="mcp-count" id="mcpCount"></span>' +
      '<button class="icon-btn" data-p="notes" title="Coach’s script (N)">' + icon('book') + '</button>' +
      '<button class="icon-btn" data-p="board" title="Open this board on the pitch">' + icon('grid') + '</button>' +
      '<button class="icon-btn" data-p="next" title="Next (→)">' + icon('chevronRight') + '</button>' +
      '<button class="icon-btn" data-p="exit" title="Exit (Esc)">' + icon('x') + '</button></div>' +
      '<div class="mcp-progress"><i id="mcpProg"></i></div>';
    document.body.appendChild(el);
    document.body.classList.add('mc-presenting');
    pres = { el, mc };
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    $$('[data-p]', el).forEach(b => { b.onclick = () => { const a = b.dataset.p; if (a === 'prev') step(-1); else if (a === 'next') step(1); else if (a === 'notes') toggleNotes(); else if (a === 'board') { openSlideBoard(mc, slideIx); closePresent(); } else closePresent(); }; });
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('.mcp-stage')) step(1); });
    window.addEventListener('keydown', onKey, true);
    drawSlide();
  };
  function step(d) { const mc = pres && pres.mc; if (!mc) return; const n = K1.clamp(slideIx + d, 0, mc.slides.length - 1); if (n === slideIx) { if (d > 0) K1.UI.toast('End of the masterclass'); return; } slideIx = n; drawSlide(); }
  function drawSlide() {
    if (!pres) return;
    const mc = pres.mc, sl = mc.slides[slideIx];
    const pic = $('#mcpPic', pres.el), txt = $('#mcpText', pres.el);
    const svg = sl.board ? MC().previewSVG(sl.board, 900, 600, sl.title) : '';
    pic.innerHTML = svg;
    pic.style.display = svg ? '' : 'none';
    pres.el.classList.toggle('no-pic', !svg);
    pres.el.classList.toggle('chapter', sl.kind === 'chapter');
    txt.innerHTML = '<h2>' + esc(sl.title) + '</h2>' +
      defineHTML(sl) +
      (sl.lead ? '<p class="lead">' + esc(sl.lead) + '</p>' : '') +
      (sl.points && sl.points.length ? '<ul>' + sl.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') +
      (sl.quote ? '<blockquote>“' + esc(sl.quote.text) + '”<cite>' + esc(sl.quote.by) + '</cite></blockquote>' : '') +
      (sl.coaching && sl.coaching.length ? '<div class="cp"><b>Coaching points</b><ul>' + sl.coaching.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></div>' : '');
    txt.innerHTML += sayHTML(sl, 'in-present');
    pres.el.classList.toggle('show-notes', showNotes);
    $('#mcpTitle', pres.el).textContent = mc.title;
    $('#mcpCount', pres.el).textContent = (slideIx + 1) + ' / ' + mc.slides.length;
    $('#mcpProg', pres.el).style.width = ((slideIx + 1) / mc.slides.length * 100) + '%';
  }
  function toggleNotes() { showNotes = !showNotes; if (pres) pres.el.classList.toggle('show-notes', showNotes); }
  function onKey(e) {
    if (!pres) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); e.stopPropagation(); step(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); e.stopPropagation(); step(-1); }
    else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); closePresent(); }
    else if (k === 'n' || k === 'N') { e.preventDefault(); e.stopPropagation(); toggleNotes(); }
    else if (k === 'Home') { slideIx = 0; drawSlide(); }
    else if (k === 'End') { slideIx = pres.mc.slides.length - 1; drawSlide(); }
  }
  function closePresent() {
    window.removeEventListener('keydown', onKey, true);
    if (!pres) return;
    pres.el.remove(); pres = null;
    document.body.classList.remove('mc-presenting');
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  P.closeMasterclassPresent = closePresent;
})(window.K1 = window.K1 || {});
