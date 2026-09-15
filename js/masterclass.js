/* K1 Shooters club app — Tactical Masterclass engine
 * A masterclass is a sequence of slides. Each slide can carry a board (formation, set piece,
 * drill or a multi-frame tactic morph) that the coach can show on screen or open on the pitch.
 * Content lives in js/masterclass-content.js and registers itself here. */
(function (K1) {
  'use strict';

  const M = {};
  const esc = s => K1.esc(s);
  const list = [];

  M.register = function (mc) { list.push(mc); return mc; };
  M.list = () => list.slice();
  M.get = id => list.find(m => m.id === id) || null;
  M.groups = function () {
    const gs = [];
    list.forEach(m => { let g = gs.find(x => x.name === (m.group || 'General')); if (!g) { g = { name: m.group || 'General', items: [] }; gs.push(g); } g.items.push(m); });
    return gs;
  };

  /* ------------------------------------------------------------- boards */
  /**
   * Turn a slide's `board` spec into a real board document.
   *   { formation: '4222dz', away: '442', pitch: 'full', ball: [x,y], title }
   *   { morph: 'dezerbi_build' } | { setpiece: 'ac_near_inswing' } | { drill: 'rondo_4v2' }
   *   { doc: <function returning a doc> }
   */
  M.docFor = function (board, title) {
    if (!board) return null;
    try {
      if (typeof board === 'function') return board();
      if (board.doc) return typeof board.doc === 'function' ? board.doc() : board.doc;
      if (board.phase) { const ph = K1.phaseById ? K1.phaseById(board.phase) : null; if (!ph) return null; const doc = K1.Templates.docFromSetPiece(ph); doc.title = ph.name; return doc; }
      if (board.morph) { const m = (K1.MORPHS || []).find(x => x.id === board.morph); return m ? K1.Templates.docFromMorph(m) : null; }
      if (board.setpiece) { const sp = (K1.SETPIECES || []).find(x => x.id === board.setpiece); return sp ? K1.Templates.docFromSetPiece(sp, { pitch: board.pitch === 'half' ? 'half' : 'full' }) : null; }
      if (board.drill) { const d = (K1.DRILLS || []).find(x => x.id === board.drill); return d ? K1.Templates.docFromDrill(d) : null; }
      if (board.formation) {
        const doc = K1.Templates.docFromFormations(board.formation, board.away || null, board.pitch || 'full');
        doc.title = board.title || title || doc.title;
        if (board.overlay) doc.pitch.overlay = board.overlay;
        if (board.theme) doc.pitch.theme = board.theme;
        if (board.ball) { const b = doc.frames[0].objects.find(o => o.type === 'ball'); if (b) { b.x = board.ball[0]; b.y = board.ball[1]; } }
        if (board.notes) doc.notes = board.notes;
        return doc;
      }
    } catch (e) { console.error('[masterclass board]', e); }
    return null;
  };

  /** A preview SVG for a slide's board — keeps the pitch overlay, arrows and labels. */
  M.previewSVG = function (board, w, h, title) {
    const doc = M.docFor(board, title);
    if (!doc) return '';
    const frame = doc.frames[Math.min(board.frame || 0, doc.frames.length - 1)];
    return K1.Render.thumbSVG(doc, frame, w || 520, h || 340, { overlay: true, scale: 1.15 });
  };

  M.slideCount = mc => mc.slides.length;
  M.boardSlides = mc => mc.slides.filter(s => s.board);

  /* ------------------------------------------------------------- export */
  /** Printable handout: every slide with its board picture, points, quotes and coaching notes. */
  M.printHTML = function (mc) {
    const logo = K1.logoHTML ? K1.logoHTML(72) : '';
    let body = '';
    mc.slides.forEach((s, i) => {
      const pic = s.board ? M.previewSVG(s.board, 460, 300, s.title) : '';
      body += '<section class="sl' + (s.kind ? ' ' + s.kind : '') + '"><div class="sl-body"><h2><span class="n">' + (i + 1) + '</span>' + esc(s.title) + '</h2>' +
        (s.lead ? '<p class="lead">' + esc(s.lead) + '</p>' : '') +
        (s.points && s.points.length ? '<ul>' + s.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') +
        (s.quote ? '<blockquote>“' + esc(s.quote.text) + '”<cite>' + esc(s.quote.by) + (s.quote.source ? ' · ' + esc(s.quote.source) : '') + '</cite></blockquote>' : '') +
        (s.coaching && s.coaching.length ? '<div class="cp"><b>Coaching points</b><ul>' + s.coaching.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></div>' : '') +
        (s.note ? '<p class="note">' + esc(s.note) + '</p>' : '') +
        '</div>' + (pic ? '<div class="sl-pic">' + pic + (s.caption ? '<span class="cap">' + esc(s.caption) + '</span>' : '') + '</div>' : '') + '</section>';
    });
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(mc.title) + '</title><style>' +
      'body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#111;margin:26px;max-width:1000px}' +
      '.head{display:flex;align-items:center;gap:16px;border-bottom:3px solid #131c21;padding-bottom:14px;margin-bottom:18px}' +
      '.head img,.head svg{width:72px;height:72px;border-radius:50%}h1{margin:0;font-size:27px}.meta{color:#555;margin-top:4px}' +
      '.intro{background:#f4f6f8;border-left:4px solid #f5b301;padding:12px 16px;margin-bottom:18px;line-height:1.5}' +
      'section.sl{display:grid;grid-template-columns:1fr 460px;gap:22px;padding:18px 0;border-bottom:1px solid #ddd;page-break-inside:avoid;align-items:start}' +
      'section.sl:has(.sl-body:only-child){grid-template-columns:1fr}' +
      'h2{font-size:19px;margin:0 0 8px;display:flex;align-items:center;gap:10px}' +
      'h2 .n{background:#131c21;color:#fff;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:14px;flex:none}' +
      '.lead{color:#333;font-size:15px;margin:0 0 8px}ul{margin:6px 0;padding-left:20px;line-height:1.5}li{margin-bottom:4px}' +
      'blockquote{margin:10px 0;padding:10px 14px;background:#fffbe9;border-left:4px solid #f5b301;font-style:italic}' +
      'blockquote cite{display:block;margin-top:6px;font-style:normal;font-size:12px;color:#666}' +
      '.cp{background:#f4f6f8;padding:10px 14px;border-radius:8px;margin-top:10px;font-size:14px}.cp b{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#555}' +
      '.note{color:#666;font-size:13px;font-style:italic}' +
      '.sl-pic svg{width:100%;height:auto;border-radius:8px;border:1px solid #ccc;display:block}' +
      '.sl-pic .cap{display:block;font-size:12px;color:#666;margin-top:6px}' +
      '.sl.chapter{background:#131c21;color:#fff;padding:16px 20px;border-radius:10px;grid-template-columns:1fr}' +
      '.sl.chapter h2 .n{background:#f5b301;color:#131c21}.sl.chapter .lead{color:#cfd8e3}' +
      '@media print{body{margin:12mm}section.sl{break-inside:avoid}}' +
      '</style></head><body><div class="head">' + logo + '<div><h1>' + esc(mc.title) + '</h1><div class="meta">' + esc([mc.subtitle, mc.coach ? 'After ' + mc.coach : '', mc.level, mc.duration].filter(Boolean).join(' · ')) + '</div></div></div>' +
      (mc.summary ? '<div class="intro">' + esc(mc.summary) + '</div>' : '') + body +
      '<p style="color:#999;font-size:12px;margin-top:26px">' + esc(K1.settings.homeName || 'K1 Shooters') + ' Football Academy · Tactical masterclass' + (mc.sources && mc.sources.length ? ' · Sources: ' + esc(mc.sources.join(' · ')) : '') + '</p>' +
      '<script>setTimeout(function(){window.print()},400)</script></body></html>';
  };

  /** Plain-text summary for WhatsApp / the team group. */
  M.shareText = function (mc) {
    const out = ['*' + mc.title.toUpperCase() + '*'];
    if (mc.subtitle) out.push(mc.subtitle);
    out.push('');
    mc.slides.forEach((s, i) => {
      if (s.kind === 'chapter') { out.push('*' + s.title.toUpperCase() + '*'); return; }
      out.push((i + 1) + '. *' + s.title + '*');
      (s.points || []).forEach(p => out.push('   • ' + p));
      if (s.quote) out.push('   _“' + s.quote.text + '” — ' + s.quote.by + '_');
      out.push('');
    });
    out.push('_' + (K1.settings.homeName || 'K1 Shooters') + ' · tactical masterclass_');
    return out.join('\n');
  };

  K1.Masterclass = M;
})(window.K1 = window.K1 || {});
