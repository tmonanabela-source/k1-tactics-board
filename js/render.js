/* K1 Shooters Tactics Board — SVG renderer (pitch, objects, selection UI, zoom, export) */
(function (K1) {
  'use strict';

  const R = {};
  const S = () => K1.S;
  const f = n => (Math.round(n * 1000) / 1000).toString();
  const esc = s => K1.esc(s);

  let svg = null, wrap = null;
  let pitchLayer, objLayer, ghostLayer, uiLayer, defsEl, bgRect;
  let proj = null, view = null, zoom = 1, center = null;
  let pitchKey = '';
  let resizeObs = null;
  R.ui = { marquee: null, temp: null, hover: null };
  R.previewObjects = null;   // when set (animation), rendered instead of the current frame

  /* ------------------------------------------------------------------ mount */
  R.mount = function (svgEl, wrapEl) {
    svg = svgEl; wrap = wrapEl;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.innerHTML = '<defs id="k1defs"></defs><rect id="k1bg" x="-2000" y="-2000" width="4000" height="4000"/><g id="k1pitch"></g><g id="k1ghost"></g><g id="k1obj"></g><g id="k1ui"></g>';
    defsEl = svg.querySelector('#k1defs');
    bgRect = svg.querySelector('#k1bg');
    pitchLayer = svg.querySelector('#k1pitch');
    ghostLayer = svg.querySelector('#k1ghost');
    objLayer = svg.querySelector('#k1obj');
    uiLayer = svg.querySelector('#k1ui');
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(() => R.layout());
      resizeObs.observe(wrap);
    } else {
      window.addEventListener('resize', () => R.layout());
    }
    R.layout(true);
  };

  R.svg = () => svg;
  R.proj = () => proj;
  R.view = () => view;
  R.zoom = () => zoom;
  R.orientation = () => (proj ? (proj.portrait ? 'portrait' : 'landscape') : 'landscape');

  /* ----------------------------------------------------------------- layout */
  R.layout = function (reset) {
    if (!svg || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const d = K1.dims();
    const orientation = K1.resolveOrientation(S().doc.pitch, rect.width, rect.height);
    const prevPortrait = proj ? proj.portrait : null;
    proj = K1.projection(d, orientation);
    if (reset || !view || prevPortrait !== proj.portrait || Math.abs(view.baseW - proj.baseView.w) > .01 || Math.abs(view.baseH - proj.baseView.h) > .01) {
      zoom = 1; center = null;
      view = Object.assign({ baseW: proj.baseView.w, baseH: proj.baseView.h }, proj.baseView);
    }
    applyView();
    R.renderAll();
  };

  function applyView() {
    const base = proj.baseView;
    const w = base.w / zoom, h = base.h / zoom;
    if (!center) center = [base.x + base.w / 2, base.y + base.h / 2];
    // clamp centre so we never scroll into the void (allow a little slack)
    const slackX = base.w * .1, slackY = base.h * .1;
    center[0] = K1.clamp(center[0], base.x + w / 2 - slackX, base.x + base.w - w / 2 + slackX);
    center[1] = K1.clamp(center[1], base.y + h / 2 - slackY, base.y + base.h - h / 2 + slackY);
    view.x = center[0] - w / 2; view.y = center[1] - h / 2; view.w = w; view.h = h;
    view.baseW = base.w; view.baseH = base.h;
    svg.setAttribute('viewBox', f(view.x) + ' ' + f(view.y) + ' ' + f(view.w) + ' ' + f(view.h));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    K1.emit('view', { zoom });
  }

  R.zoomAt = function (factor, clientX, clientY) {
    const before = clientX != null ? R.clientToScreen(clientX, clientY) : [center[0], center[1]];
    const nz = K1.clamp(zoom * factor, 1, 8);
    if (nz === zoom) return;
    const base = proj.baseView;
    const oldW = base.w / zoom, newW = base.w / nz;
    const oldH = base.h / zoom, newH = base.h / nz;
    // keep the point under the cursor fixed
    const rx = (before[0] - view.x) / oldW, ry = (before[1] - view.y) / oldH;
    zoom = nz;
    const nx = before[0] - rx * newW, ny = before[1] - ry * newH;
    center = [nx + newW / 2, ny + newH / 2];
    applyView();
    R.renderUI();
  };
  R.panBy = function (dxScreen, dyScreen) { if (zoom <= 1) return; center[0] -= dxScreen; center[1] -= dyScreen; applyView(); };
  R.resetView = function () { zoom = 1; center = null; applyView(); R.renderUI(); };
  R.setZoom = function (z) { R.zoomAt(z / zoom); };

  /* -------------------------------------------------------------- coordinates */
  R.clientToScreen = function (cx, cy) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return [0, 0];
    const p = new DOMPoint(cx, cy).matrixTransform(ctm.inverse());
    return [p.x, p.y];
  };
  R.clientToPitch = function (cx, cy) { const s = R.clientToScreen(cx, cy); return proj.toPitch(s[0], s[1]); };
  R.pitchToClient = function (x, y) {
    const s = proj.toScreen(x, y);
    const p = new DOMPoint(s[0], s[1]).matrixTransform(svg.getScreenCTM());
    return [p.x, p.y];
  };
  R.metersPerPixel = function () {
    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / view.w, rect.height / view.h);
    return scale > 0 ? 1 / scale : 1;
  };

  /* ------------------------------------------------------------------ render */
  R.renderAll = function () { R.renderPitch(); R.renderObjects(); R.renderUI(); };

  R.renderPitch = function () {
    const doc = S().doc;
    const d = K1.dims();
    const t = K1.THEMES[doc.pitch.theme] || K1.THEMES.stripes;
    const key = [d.id, t.id, doc.pitch.overlay, proj.portrait, d.L, d.W, d.gridStep].join('|');
    if (key === pitchKey) return;
    pitchKey = key;
    bgRect.setAttribute('fill', t.outer);
    pitchLayer.innerHTML = '<g transform="' + proj.transform + '">' + K1.markingsSVG(d, t, doc.pitch.overlay) + '</g>';
    defsEl.innerHTML = defsSVG();
    svg.classList.toggle('portrait', proj.portrait);
    K1.emit('pitch');
  };
  R.invalidatePitch = function () { pitchKey = ''; };

  /* ------------------------------------------------------ player photos */
  /** Number → squad player (with photo) for the active team, or null when photos are off / none exist. */
  function photoMap() {
    if (K1.settings.tokenPhotos === false || !K1.Squad || !K1.Teams || !K1.Teams.list().length) return null;
    const tid = K1.boardTeamId();
    if (!tid) return null;
    const map = {}; let any = false;
    K1.Squad.forTeam(tid).forEach(p => { if (p.photo) { map[Number(p.n)] = p; any = true; } });
    return any ? map : null;
  }
  R.photoMap = photoMap;
  function patternSVG(p) {
    return '<pattern id="ph-' + p.id + '" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="' + p.photo + '" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>';
  }
  function defsSVG(map) {
    if (map === undefined) map = photoMap();
    let s = '<clipPath id="tokClip"><circle r="' + f(K1.tokenRadius()) + '"/></clipPath>';
    if (map) Object.keys(map).forEach(n => { s += patternSVG(map[n]); });
    return s;
  }
  R.refreshPhotos = function () { if (!defsEl) return; defsEl.innerHTML = defsSVG(); R.renderObjects(); };

  R.ctx = function (extra) {
    const doc = S().doc;
    return Object.assign({
      proj, r: K1.tokenRadius(),
      showNames: K1.settings.showNames, showNumbers: K1.settings.showNumbers,
      kits: { home: K1.kitById(doc.teams.home.kit), away: K1.kitById(doc.teams.away.kit) },
      theme: K1.THEMES[doc.pitch.theme] || K1.THEMES.stripes,
      photos: photoMap(),
      interactive: true,
    }, extra || {});
  };

  const ORDER = { shape: 0, offside: 1, path: 2, measure: 3, equip: 4, player: 5, ball: 6, text: 7 };
  R.sorted = objs => objs.map((o, i) => [o, i]).sort((a, b) => ((ORDER[a[0].type] || 0) - (ORDER[b[0].type] || 0)) || (a[1] - b[1])).map(x => x[0]);

  R.renderObjects = function (objects, ctxExtra) {
    if (!proj) return;
    const ctx = R.ctx(ctxExtra);
    const objs = objects || R.previewObjects || K1.objects();
    let out = '';
    R.sorted(objs).forEach(o => { out += R.objectSVG(o, ctx); });
    objLayer.innerHTML = out;
    renderGhosts(ctx, !!objects || !!R.previewObjects);
  };

  function renderGhosts(ctx, previewing) {
    const st = S();
    if (previewing || !K1.settings.showGhosts || st.frameIndex === 0 || st.playing) { ghostLayer.innerHTML = ''; return; }
    const prev = st.doc.frames[st.frameIndex - 1];
    const cur = K1.objects();
    let out = '';
    prev.objects.forEach(po => {
      if (po.type !== 'player' && po.type !== 'ball') return;
      const co = cur.find(o => o.id === po.id);
      const moved = co && Math.hypot(co.x - po.x, co.y - po.y) > .8;
      if (!co) return;
      if (!moved) return;
      out += R.objectSVG(po, Object.assign({}, ctx, { ghost: true, interactive: false }));
      if (K1.settings.ghostArrows) {
        const a = ctx.proj.toScreen(po.x, po.y), b = ctx.proj.toScreen(co.x, co.y);
        out += arrowSVG([a, b], { color: 'rgba(255,255,255,.75)', width: .28, dash: true, head: 'arrow', trimStart: ctx.r + .2, trimEnd: ctx.r + .3 });
      }
    });
    ghostLayer.innerHTML = out;
  }

  /* ------------------------------------------------------------- objects */
  R.objectSVG = function (o, ctx) {
    const alpha = o._alpha == null ? 1 : o._alpha;
    if (alpha <= 0) return '';
    const attrs = ' class="obj obj-' + o.type + (ctx.ghost ? ' ghost' : '') + '" data-id="' + o.id + '"' + (alpha < 1 || ctx.ghost ? ' opacity="' + f(ctx.ghost ? .38 : alpha) + '"' : '');
    let inner = '';
    switch (o.type) {
      case 'player': inner = playerSVG(o, ctx); break;
      case 'ball': inner = ballSVG(o, ctx); break;
      case 'equip': inner = equipSVG(o, ctx); break;
      case 'path': inner = pathSVG(o, ctx); break;
      case 'shape': inner = shapeSVG(o, ctx); break;
      case 'text': inner = textSVG(o, ctx); break;
      case 'measure': inner = measureSVG(o, ctx); break;
      case 'offside': inner = offsideSVG(o, ctx); break;
      default: return '';
    }
    return '<g' + attrs + '>' + inner + '</g>';
  };

  function luminance(hex) {
    if (!hex || hex[0] !== '#') return 0;
    const h = hex.length === 4 ? hex.slice(1).split('').map(c => c + c).join('') : hex.slice(1, 7);
    const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    return .2126 * r + .7152 * g + .0722 * b;
  }
  R.luminance = luminance;

  function kitPattern(pattern, secondary, r) {
    if (!pattern || pattern === 'solid' || !secondary) return '';
    let s = '<g clip-path="url(#tokClip)" fill="' + secondary + '">';
    if (pattern === 'halves') s += '<rect x="0" y="' + f(-r) + '" width="' + f(r) + '" height="' + f(2 * r) + '"/>';
    else if (pattern === 'stripes') s += '<rect x="' + f(-r * .62) + '" y="' + f(-r) + '" width="' + f(r * .3) + '" height="' + f(2 * r) + '"/><rect x="' + f(r * .32) + '" y="' + f(-r) + '" width="' + f(r * .3) + '" height="' + f(2 * r) + '"/>';
    else if (pattern === 'hoops') s += '<rect x="' + f(-r) + '" y="' + f(-r * .62) + '" width="' + f(2 * r) + '" height="' + f(r * .3) + '"/><rect x="' + f(-r) + '" y="' + f(r * .32) + '" width="' + f(2 * r) + '" height="' + f(r * .3) + '"/>';
    else if (pattern === 'sash') s += '<path d="M' + f(-r) + ' ' + f(-r * .25) + 'L' + f(-r * .25) + ' ' + f(-r) + 'L' + f(r) + ' ' + f(r * .25) + 'L' + f(r * .25) + ' ' + f(r) + 'Z"/>';
    s += '</g>';
    return s;
  }

  function playerSVG(o, ctx) {
    const [sx, sy] = ctx.proj.toScreen(o.x, o.y);
    const r = ctx.r;
    let fill, num, pattern = null, secondary = null, label;
    if (o.team === 'ref') { fill = '#111827'; num = '#facc15'; label = o.label || 'R'; }
    else if (o.team === 'neutral') { fill = o.color || '#facc15'; num = luminance(fill) > .5 ? '#0b1116' : '#ffffff'; label = ctx.showNumbers && o.n ? o.n : ''; }
    else {
      const kit = ctx.kits[o.team] || ctx.kits.home;
      if (o.gk) { fill = kit.gk; num = kit.gkNumber; } else { fill = kit.primary; num = kit.number; pattern = kit.pattern; secondary = kit.secondary; }
      label = ctx.showNumbers && o.n ? o.n : '';
    }
    if (o.color && o.team !== 'neutral') { fill = o.color; num = luminance(fill) > .5 ? '#0b1116' : '#ffffff'; pattern = null; }
    const rim = luminance(fill) > .72 ? 'rgba(17,24,39,.75)' : 'rgba(255,255,255,.88)';
    const fs = String(label).length > 2 ? r * .9 : r * 1.18;
    let s = '<g transform="translate(' + f(sx) + ' ' + f(sy) + ')">';
    if (!ctx.ghost) s += '<circle cx="' + f(r * .12) + '" cy="' + f(r * .18) + '" r="' + f(r) + '" fill="rgba(0,0,0,.35)"/>';
    // photo token: the player's face inside the circle, kit-coloured ring, number in a small badge
    const ph = (!ctx.ghost && ctx.photos && o.team === 'home' && !o.color) ? ctx.photos[Number(o.n)] : null;
    if (ph) {
      s += '<circle r="' + f(r) + '" fill="url(#ph-' + ph.id + ')"/>';
      s += '<circle r="' + f(r) + '" fill="none" stroke="' + fill + '" stroke-width=".44"/>';
      s += '<circle r="' + f(r + .3) + '" fill="none" stroke="rgba(255,255,255,.85)" stroke-width=".16"/>';
      if (o.captain) s += '<rect x="' + f(-r * 1.05) + '" y="' + f(-r * 1.1) + '" width="' + f(r * .55) + '" height="' + f(r * .55) + '" rx=".15" fill="#f5b301"/><text x="' + f(-r * .775) + '" y="' + f(-r * .825) + '" dy=".36em" text-anchor="middle" font-size="' + f(r * .42) + '" font-weight="800" fill="#131c21">C</text>';
      if (label !== '') {
        const bx = r * .7, by = r * .7, br = Math.max(.72, r * .42);
        s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(br) + '" fill="' + fill + '" stroke="#fff" stroke-width=".14"/>';
        s += '<text x="' + f(bx) + '" y="' + f(by) + '" dy=".36em" text-anchor="middle" font-size="' + f(br * (String(label).length > 1 ? .95 : 1.15)) + '" font-weight="800" fill="' + num + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">' + esc(label) + '</text>';
      }
      const nm = o.name || ph.name.split(' ').pop();
      if (ctx.showNames && nm) {
        const nfs = Math.max(1.3, r * .82);
        const w = nm.length * nfs * .58 + nfs * .9, h = nfs * 1.35;
        s += '<rect x="' + f(-w / 2) + '" y="' + f(r + .45) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(h / 2) + '" fill="rgba(11,17,22,.72)"/>';
        s += '<text y="' + f(r + .45 + h / 2) + '" dy=".36em" text-anchor="middle" font-size="' + f(nfs) + '" font-weight="700" fill="#fff" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">' + esc(nm) + '</text>';
      }
      if (ctx.interactive) s += '<circle class="hit" r="' + f(r + .6) + '" fill="transparent"/>';
      s += '</g>';
      return s;
    }
    s += '<circle r="' + f(r) + '" fill="' + fill + '"/>';
    s += kitPattern(pattern, secondary, r);
    s += '<circle r="' + f(r - .11) + '" fill="none" stroke="' + rim + '" stroke-width=".22"/>';
    if (o.gk && o.team !== 'ref') s += '<circle r="' + f(r + .28) + '" fill="none" stroke="' + fill + '" stroke-width=".18" opacity=".9"/>';
    if (o.captain) s += '<rect x="' + f(-r * .95) + '" y="' + f(-r * 1.05) + '" width="' + f(r * .55) + '" height="' + f(r * .55) + '" rx=".15" fill="#f5b301"/><text x="' + f(-r * .675) + '" y="' + f(-r * .775) + '" dy=".36em" text-anchor="middle" font-size="' + f(r * .42) + '" font-weight="800" fill="#131c21">C</text>';
    if (label !== '') s += '<text dy=".36em" text-anchor="middle" font-size="' + f(fs) + '" font-weight="800" fill="' + num + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif;letter-spacing:-.02em">' + esc(label) + '</text>';
    if (ctx.showNames && o.name && !ctx.ghost) {
      const nfs = Math.max(1.3, r * .82);
      const w = o.name.length * nfs * .58 + nfs * .9, h = nfs * 1.35;
      s += '<rect x="' + f(-w / 2) + '" y="' + f(r + .45) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(h / 2) + '" fill="rgba(11,17,22,.72)"/>';
      s += '<text y="' + f(r + .45 + h / 2) + '" dy=".36em" text-anchor="middle" font-size="' + f(nfs) + '" font-weight="700" fill="#fff" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">' + esc(o.name) + '</text>';
    }
    if (ctx.interactive) s += '<circle class="hit" r="' + f(r + .6) + '" fill="transparent"/>';
    s += '</g>';
    return s;
  }

  function ballSVG(o, ctx) {
    const [sx, sy] = ctx.proj.toScreen(o.x, o.y);
    let s = '<g transform="translate(' + f(sx) + ' ' + f(sy) + ')">';
    s += '<ellipse cx=".15" cy=".35" rx="1.05" ry=".8" fill="rgba(0,0,0,.35)"/>';
    s += K1.LOGO.ball(0, 0, 1.05, '#111827', '#ffffff');
    if (ctx.interactive) s += '<circle class="hit" r="1.9" fill="transparent"/>';
    s += '</g>';
    return s;
  }

  function equipSVG(o, ctx) {
    const [sx, sy] = ctx.proj.toScreen(o.x, o.y);
    const rot = (o.rot || 0) + ctx.proj.angle;
    const c = o.color || '#f97316';
    const dark = 'rgba(0,0,0,.35)';
    let s = '<g transform="translate(' + f(sx) + ' ' + f(sy) + ')">';
    let body = '';
    switch (o.kind) {
      case 'cone':
        body = '<ellipse cy=".95" rx="1.05" ry=".38" fill="' + dark + '"/><path d="M-1 .95L0 -1.3L1 .95Z" fill="' + c + '" stroke="rgba(0,0,0,.3)" stroke-width=".07"/><path d="M-.5 -.05h1" stroke="rgba(255,255,255,.85)" stroke-width=".2"/>';
        break;
      case 'disc':
        body = '<ellipse cy=".12" rx="1.08" ry=".62" fill="' + dark + '"/><ellipse rx="1.05" ry=".6" fill="' + c + '"/><ellipse rx=".45" ry=".24" fill="rgba(0,0,0,.35)"/>';
        break;
      case 'pole':
        body = '<circle cy="1.55" r=".4" fill="' + dark + '"/><line y1="1.55" y2="-1.75" stroke="' + c + '" stroke-width=".34" stroke-linecap="round"/><line y1=".6" y2="-.1" stroke="rgba(255,255,255,.9)" stroke-width=".34"/>';
        break;
      case 'flag':
        body = '<circle cy="1.7" r=".4" fill="' + dark + '"/><line y1="1.7" y2="-1.8" stroke="#e5e7eb" stroke-width=".22"/><path d="M0 -1.8L1.9 -1.2L0 -.6Z" fill="' + c + '"/>';
        break;
      case 'mannequin':
        body = '<ellipse cy="1.9" rx="1" ry=".35" fill="' + dark + '"/><rect x="-.72" y="-1.1" width="1.44" height="3" rx=".5" fill="' + c + '"/><circle cy="-1.5" r=".55" fill="' + c + '"/><rect x="-.72" y=".1" width="1.44" height=".3" fill="rgba(0,0,0,.25)"/>';
        break;
      case 'hoop':
        body = '<circle r="1.15" fill="none" stroke="' + c + '" stroke-width=".26"/>';
        break;
      case 'ladder':
        body = '<g transform="rotate(' + f(rot) + ')"><rect x="-1" y="-3" width="2" height="6" fill="rgba(0,0,0,.18)" stroke="#f8fafc" stroke-width=".14"/>' + [-2.4, -1.8, -1.2, -.6, 0, .6, 1.2, 1.8, 2.4].map(y => '<line x1="-1" y1="' + y + '" x2="1" y2="' + y + '" stroke="#f8fafc" stroke-width=".12"/>').join('') + '</g>';
        break;
      case 'hurdle':
        body = '<g transform="rotate(' + f(rot) + ')"><rect x="-1.1" y="-.28" width="2.2" height=".5" rx=".1" fill="' + c + '"/><rect x="-1.1" y="-.28" width=".22" height=".9" fill="' + c + '"/><rect x=".88" y="-.28" width=".22" height=".9" fill="' + c + '"/></g>';
        break;
      case 'minigoal': {
        body = '<g transform="rotate(' + f(rot) + ')"><rect x="-.6" y="-1.8" width="1.2" height="3.6" fill="rgba(255,255,255,.22)"/>' +
          '<path d="M.6 -1.8H-.6V1.8H.6" fill="none" stroke="#f8fafc" stroke-width=".24"/>' +
          [-1.2, -.6, 0, .6, 1.2].map(y => '<line x1="-.6" y1="' + y + '" x2=".6" y2="' + y + '" stroke="rgba(255,255,255,.7)" stroke-width=".07"/>').join('') +
          '<line x1="0" y1="-1.8" x2="0" y2="1.8" stroke="rgba(255,255,255,.7)" stroke-width=".07"/></g>';
        break;
      }
      case 'goal': {
        const gw = 7.32, gd = 2.4;
        let net = '';
        for (let y = -gw / 2 + .6; y < gw / 2; y += .6) net += '<line x1="' + f(-gd / 2) + '" y1="' + f(y) + '" x2="' + f(gd / 2) + '" y2="' + f(y) + '" stroke="rgba(255,255,255,.65)" stroke-width=".06"/>';
        for (let x = -gd / 2 + .6; x < gd / 2; x += .6) net += '<line x1="' + f(x) + '" y1="' + f(-gw / 2) + '" x2="' + f(x) + '" y2="' + f(gw / 2) + '" stroke="rgba(255,255,255,.65)" stroke-width=".06"/>';
        body = '<g transform="rotate(' + f(rot) + ')"><rect x="' + f(-gd / 2) + '" y="' + f(-gw / 2) + '" width="' + f(gd) + '" height="' + f(gw) + '" fill="rgba(255,255,255,.18)"/>' + net +
          '<path d="M' + f(gd / 2) + ' ' + f(-gw / 2) + 'H' + f(-gd / 2) + 'V' + f(gw / 2) + 'H' + f(gd / 2) + '" fill="none" stroke="#f8fafc" stroke-width=".3"/></g>';
        break;
      }
      default:
        body = '<circle r="1" fill="' + c + '"/>';
    }
    s += body;
    if (ctx.interactive) { const sz = K1.equipSize(o.kind); s += '<rect class="hit" x="' + f(-sz.w / 2 - .4) + '" y="' + f(-sz.h / 2 - .4) + '" width="' + f(sz.w + .8) + '" height="' + f(sz.h + .8) + '" fill="transparent" transform="rotate(' + f(rot) + ')"/>'; }
    s += '</g>';
    return s;
  }

  /* --------------------------------------------------------------- paths */
  function sampleQuad(p0, c, p1, n) {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, mt = 1 - t; out.push([mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0], mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1]]); }
    return out;
  }
  function polyLength(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  /** Cut `len` metres off the end (or start) of a polyline. */
  function trimPoly(pts, len, fromStart) {
    if (len <= 0 || pts.length < 2) return pts;
    const p = fromStart ? pts.slice().reverse() : pts.slice();
    let remaining = len;
    while (p.length >= 2) {
      const a = p[p.length - 1], b = p[p.length - 2];
      const seg = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (seg > remaining) {
        const t = remaining / seg;
        p[p.length - 1] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        break;
      }
      remaining -= seg; p.pop();
    }
    if (p.length < 2) return [];
    return fromStart ? p.reverse() : p;
  }
  function resample(pts, step) {
    if (pts.length < 2) return pts;
    const out = [pts[0]];
    let carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (seg === 0) continue;
      let d = step - carry;
      while (d <= seg) { const t = d / seg; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); d += step; }
      carry = seg - (d - step);
    }
    const last = pts[pts.length - 1];
    const l = out[out.length - 1];
    if (Math.hypot(last[0] - l[0], last[1] - l[1]) > step * .25) out.push(last); else out[out.length - 1] = last;
    return out;
  }
  function zigzag(pts, amp, period) {
    const rs = resample(pts, period / 2);
    if (rs.length < 3) return pts;
    const out = [rs[0]];
    for (let i = 1; i < rs.length - 1; i++) {
      const a = rs[i - 1], b = rs[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L;
      const sgn = i % 2 ? 1 : -1;
      out.push([rs[i][0] + nx * amp * sgn, rs[i][1] + ny * amp * sgn]);
    }
    out.push(rs[rs.length - 1]);
    return out;
  }
  function smoothPath(pts) {
    if (pts.length < 3) return 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L');
    let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(c2[0]) + ' ' + f(c2[1]) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d;
  }
  function polyPath(pts) { return 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L'); }
  function simplify(pts, tol) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) { const l = out[out.length - 1]; if (Math.hypot(pts[i][0] - l[0], pts[i][1] - l[1]) >= tol) out.push(pts[i]); }
    out.push(pts[pts.length - 1]);
    return out;
  }

  /** Generic arrow renderer on screen-space polyline. opts: color,width,dash,wave,head,smooth,trimStart,trimEnd,hit */
  function arrowSVG(pts, opts) {
    if (!pts || pts.length < 2) return '';
    const w = opts.width || .45;
    const color = opts.color || '#fff';
    let line = pts.slice();
    if (opts.trimStart) line = trimPoly(line, opts.trimStart, true);
    if (opts.trimEnd) line = trimPoly(line, opts.trimEnd, false);
    if (line.length < 2) return '';
    const total = polyLength(line);
    const head = opts.head && opts.head !== 'none' ? opts.head : null;
    const headLen = head === 'shot' ? Math.max(2.2, w * 3.4) : Math.max(1.5, w * 3.2);
    let headSVG = '';
    let body = line;
    if (head && total > headLen * .6) {
      const tip = line[line.length - 1];
      const trimmed = trimPoly(line, headLen * .85, false);
      const back = trimmed.length ? trimmed[trimmed.length - 1] : line[0];
      const dx = tip[0] - back[0], dy = tip[1] - back[1], L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const hw = head === 'shot' ? headLen * .62 : headLen * .5;
      const bx = tip[0] - ux * headLen, by = tip[1] - uy * headLen;
      headSVG = '<path d="M' + f(tip[0]) + ' ' + f(tip[1]) + 'L' + f(bx + nx * hw) + ' ' + f(by + ny * hw) + 'L' + f(bx - nx * hw) + ' ' + f(by - ny * hw) + 'Z" fill="' + color + '"/>';
      if (head === 'shot') headSVG += '<path d="M' + f(bx - ux * .9 + nx * hw * 1.05) + ' ' + f(by - uy * .9 + ny * hw * 1.05) + 'L' + f(bx - ux * .9 - nx * hw * 1.05) + ' ' + f(by - uy * .9 - ny * hw * 1.05) + '" stroke="' + color + '" stroke-width="' + f(w * .7) + '" stroke-linecap="round"/>';
      body = trimPoly(line, headLen * .8, false);
      if (body.length < 2) body = [line[0], tip];
    }
    if (opts.wave) body = zigzag(body, Math.max(.45, w * 1.25), Math.max(1.2, w * 2.8));
    const d = opts.smooth && !opts.wave ? smoothPath(body) : polyPath(body);
    const dash = opts.dash ? ' stroke-dasharray="' + f(w * 2.6) + ' ' + f(w * 1.9) + '"' : '';
    let s = '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>' + headSVG;
    if (opts.hit) s += '<path class="hit" d="' + d + '" fill="none" stroke="transparent" stroke-width="' + f(Math.max(2.4, w * 4)) + '"/>';
    return s;
  }
  R.arrowSVG = arrowSVG;

  function pathPoints(o, ctx) {
    const pts = (o.points || []).map(p => ctx.proj.toScreen(p[0], p[1]));
    if (o.geo === 'curve' && pts.length >= 2) {
      const c = o.ctrl ? ctx.proj.toScreen(o.ctrl[0], o.ctrl[1]) : [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
      return sampleQuad(pts[0], c, pts[pts.length - 1], 28);
    }
    if (o.geo === 'free') return simplify(pts, .35);
    return pts;
  }
  R.pathPoints = pathPoints;

  function pathSVG(o, ctx) {
    const pts = pathPoints(o, ctx);
    if (pts.length < 2) return '';
    return arrowSVG(pts, { color: o.color, width: o.width, dash: o.dash, wave: o.wave, head: o.head, smooth: o.geo === 'free', hit: ctx.interactive });
  }

  function shapeSVG(o, ctx) {
    const [sx, sy] = ctx.proj.toScreen(o.x, o.y);
    const rot = (o.rot || 0) + ctx.proj.angle;
    const fill = o.fill ? o.color : 'none';
    const fo = o.fill ? (o.opacity == null ? .3 : o.opacity) : 0;
    const w = o.w, h = o.h, sw = o.width || .3;
    const dash = o.kind === 'zone' ? ' stroke-dasharray="' + f(sw * 3) + ' ' + f(sw * 2) + '"' : '';
    let geom = '';
    if (o.kind === 'ellipse') geom = '<ellipse rx="' + f(w / 2) + '" ry="' + f(h / 2) + '"';
    else if (o.kind === 'triangle') geom = '<path d="M0 ' + f(-h / 2) + 'L' + f(w / 2) + ' ' + f(h / 2) + 'L' + f(-w / 2) + ' ' + f(h / 2) + 'Z"';
    else geom = '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx=".35"';
    let s = '<g transform="translate(' + f(sx) + ' ' + f(sy) + ')"><g transform="rotate(' + f(rot) + ')">';
    s += geom + ' fill="' + fill + '" fill-opacity="' + f(fo) + '" stroke="' + o.color + '" stroke-width="' + f(sw) + '"' + dash + '/>';
    if (ctx.interactive) s += geom + ' class="hit" fill="' + (o.fill ? 'transparent' : 'none') + '" stroke="transparent" stroke-width="2.4" pointer-events="' + (o.fill ? 'all' : 'stroke') + '"/>';
    s += '</g>';
    if (o.label) s += '<text dy=".36em" text-anchor="middle" font-size="' + f(Math.max(1.4, Math.min(w, h) * .22)) + '" font-weight="700" fill="' + o.color + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">' + esc(o.label) + '</text>';
    s += '</g>';
    return s;
  }

  function textSVG(o, ctx) {
    const [sx, sy] = ctx.proj.toScreen(o.x, o.y);
    const lines = String(o.text || '').split('\n');
    const size = o.size || 2.4;
    const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 1);
    const w = maxLen * size * .58 + size * .9, h = lines.length * size * 1.25 + size * .45;
    let s = '<g transform="translate(' + f(sx) + ' ' + f(sy) + ')">';
    if (o.bg !== false) s += '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(size * .3) + '" fill="' + (luminance(o.color) > .5 ? 'rgba(11,17,22,.72)' : 'rgba(255,255,255,.85)') + '"/>';
    s += '<text text-anchor="middle" font-size="' + f(size) + '" font-weight="' + (o.bold === false ? 500 : 700) + '" fill="' + o.color + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">';
    lines.forEach((l, i) => { s += '<tspan x="0" y="' + f(-h / 2 + size * .45 + size * 1.25 * i + size * .82) + '">' + esc(l) + '</tspan>'; });
    s += '</text>';
    if (ctx.interactive) s += '<rect class="hit" x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" fill="transparent"/>';
    s += '</g>';
    return s;
  }

  function measureSVG(o, ctx) {
    if (!o.points || o.points.length < 2) return '';
    const a = ctx.proj.toScreen(o.points[0][0], o.points[0][1]), b = ctx.proj.toScreen(o.points[1][0], o.points[1][1]);
    const dist = Math.hypot(o.points[1][0] - o.points[0][0], o.points[1][1] - o.points[0][1]);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const c = o.color || '#f5b301';
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + c + '" stroke-width=".22" stroke-dasharray=".8 .6"/>';
    [a, b].forEach(p => { s += '<line x1="' + f(p[0] + nx * .8) + '" y1="' + f(p[1] + ny * .8) + '" x2="' + f(p[0] - nx * .8) + '" y2="' + f(p[1] - ny * .8) + '" stroke="' + c + '" stroke-width=".22"/>'; });
    const label = dist.toFixed(1) + ' m';
    const w = label.length * 1.1 + 1.2;
    s += '<rect x="' + f(mid[0] - w / 2) + '" y="' + f(mid[1] - 1.25) + '" width="' + f(w) + '" height="2.5" rx="1.25" fill="rgba(11,17,22,.8)"/>';
    s += '<text x="' + f(mid[0]) + '" y="' + f(mid[1]) + '" dy=".36em" text-anchor="middle" font-size="1.8" font-weight="700" fill="' + c + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">' + label + '</text>';
    if (ctx.interactive) s += '<line class="hit" x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="transparent" stroke-width="2.6"/>';
    return s;
  }

  function offsideSVG(o, ctx) {
    const d = K1.dims();
    const a = ctx.proj.toScreen(o.x, -1.5), b = ctx.proj.toScreen(o.x, d.W + 1.5);
    const c = o.color || '#f5b301';
    let s = '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + c + '" stroke-width=".3" stroke-dasharray="1.6 1"/>';
    // label sits just inside the pitch beside the line so it stays on screen in both orientations
    const label = o.label || 'OFFSIDE';
    const lp = ctx.proj.toScreen(o.x + .9, 1.3);
    const lw = label.length * 1.5 * .62 + 1.6;
    s += '<rect x="' + f(lp[0] - .6) + '" y="' + f(lp[1] - 1.15) + '" width="' + f(lw) + '" height="2.3" rx="1.15" fill="rgba(11,17,22,.78)"/>';
    s += '<text x="' + f(lp[0]) + '" y="' + f(lp[1]) + '" dy=".36em" text-anchor="start" font-size="1.5" font-weight="800" fill="' + c + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif;letter-spacing:.08em">' + esc(label) + '</text>';
    if (ctx.interactive) s += '<line class="hit" x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="transparent" stroke-width="3"/>';
    return s;
  }

  /* --------------------------------------------------------------------- UI */
  R.renderUI = function () {
    if (!proj) return;
    const st = S();
    const mpp = R.metersPerPixel();
    const hs = 7 * mpp; // handle half-size in metres (≈ 14px)
    let out = '';
    if (!st.playing && st.selection.size) {
      const ctx = R.ctx({ interactive: false });
      const single = st.selection.size === 1;
      K1.objects().forEach(o => {
        if (!st.selection.has(o.id)) return;
        out += selectionSVG(o, ctx, hs, single);
      });
    }
    if (R.ui.marquee) {
      const m = R.ui.marquee;
      out += '<rect x="' + f(Math.min(m.x0, m.x1)) + '" y="' + f(Math.min(m.y0, m.y1)) + '" width="' + f(Math.abs(m.x1 - m.x0)) + '" height="' + f(Math.abs(m.y1 - m.y0)) + '" fill="rgba(245,179,1,.12)" stroke="#f5b301" stroke-width="' + f(1.2 * mpp) + '" stroke-dasharray="' + f(4 * mpp) + ' ' + f(3 * mpp) + '"/>';
    }
    if (R.ui.temp) out += R.objectSVG(R.ui.temp, R.ctx({ interactive: false }));
    if (R.ui.stampHint) {
      const p = proj.toScreen(R.ui.stampHint[0], R.ui.stampHint[1]);
      out += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(K1.tokenRadius() + .4) + '" fill="none" stroke="#f5b301" stroke-width="' + f(1.5 * mpp) + '" stroke-dasharray="' + f(3 * mpp) + ' ' + f(3 * mpp) + '"/>';
    }
    uiLayer.innerHTML = out;
  };

  function handle(x, y, hs, name, id, shape) {
    const common = ' class="handle" data-handle="' + name + '" data-id="' + id + '" fill="#ffffff" stroke="#f5b301" stroke-width="' + f(hs * .28) + '"';
    if (shape === 'circle') return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(hs) + '"' + common + '/>';
    if (shape === 'diamond') return '<path d="M' + f(x) + ' ' + f(y - hs * 1.2) + 'L' + f(x + hs * 1.2) + ' ' + f(y) + 'L' + f(x) + ' ' + f(y + hs * 1.2) + 'L' + f(x - hs * 1.2) + ' ' + f(y) + 'Z"' + common + '/>';
    return '<rect x="' + f(x - hs) + '" y="' + f(y - hs) + '" width="' + f(2 * hs) + '" height="' + f(2 * hs) + '" rx="' + f(hs * .3) + '"' + common + '/>';
  }

  function selectionSVG(o, ctx, hs, single) {
    const gold = '#f5b301';
    const sw = f(hs * .3);
    let s = '';
    if (o.type === 'player' || o.type === 'ball' || o.type === 'equip') {
      const [sx, sy] = ctx.proj.toScreen(o.x, o.y);
      const bb = K1.bbox(o);
      const rr = Math.max(bb.w, bb.h) / 2 + .7;
      s += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="' + f(rr) + '" fill="none" stroke="' + gold + '" stroke-width="' + sw + '" stroke-dasharray="' + f(hs) + ' ' + f(hs * .8) + '" class="sel-ring"/>';
      if (single && o.type === 'equip' && ['ladder', 'minigoal', 'goal', 'hurdle'].includes(o.kind)) {
        s += '<line x1="' + f(sx) + '" y1="' + f(sy) + '" x2="' + f(sx) + '" y2="' + f(sy - rr - hs * 2.5) + '" stroke="' + gold + '" stroke-width="' + sw + '"/>';
        s += handle(sx, sy - rr - hs * 2.5, hs, 'rot', o.id, 'circle');
      }
      return s;
    }
    if (o.type === 'path' || o.type === 'measure') {
      const pts = o.points.map(p => ctx.proj.toScreen(p[0], p[1]));
      if (o.geo === 'free') {
        const bb = K1.bbox(o);
        const a = ctx.proj.toScreen(bb.x, bb.y), b = ctx.proj.toScreen(bb.x + bb.w, bb.y + bb.h);
        s += '<rect x="' + f(Math.min(a[0], b[0])) + '" y="' + f(Math.min(a[1], b[1])) + '" width="' + f(Math.abs(b[0] - a[0])) + '" height="' + f(Math.abs(b[1] - a[1])) + '" fill="none" stroke="' + gold + '" stroke-width="' + sw + '" stroke-dasharray="' + f(hs) + ' ' + f(hs * .8) + '"/>';
        return s;
      }
      if (single) {
        s += handle(pts[0][0], pts[0][1], hs, 'p0', o.id, 'circle');
        s += handle(pts[pts.length - 1][0], pts[pts.length - 1][1], hs, 'p1', o.id, 'circle');
        if (o.geo === 'curve') {
          const c = o.ctrl ? ctx.proj.toScreen(o.ctrl[0], o.ctrl[1]) : [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
          s += '<line x1="' + f(pts[0][0]) + '" y1="' + f(pts[0][1]) + '" x2="' + f(c[0]) + '" y2="' + f(c[1]) + '" stroke="' + gold + '" stroke-width="' + f(hs * .18) + '" stroke-dasharray="' + f(hs * .6) + ' ' + f(hs * .6) + '" opacity=".7"/>';
          s += '<line x1="' + f(pts[1][0]) + '" y1="' + f(pts[1][1]) + '" x2="' + f(c[0]) + '" y2="' + f(c[1]) + '" stroke="' + gold + '" stroke-width="' + f(hs * .18) + '" stroke-dasharray="' + f(hs * .6) + ' ' + f(hs * .6) + '" opacity=".7"/>';
          s += handle(c[0], c[1], hs, 'ctrl', o.id, 'diamond');
        }
      } else {
        pts.forEach(p => { s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(hs * .8) + '" fill="' + gold + '"/>'; });
      }
      return s;
    }
    if (o.type === 'offside') {
      const d = K1.dims();
      const a = ctx.proj.toScreen(o.x, d.W / 2);
      s += handle(a[0], a[1], hs, 'p0', o.id, 'circle');
      return s;
    }
    // shapes + text: bbox with corner handles
    const bb = K1.bbox(o);
    const corners = [[bb.x, bb.y, 'nw'], [bb.x + bb.w, bb.y, 'ne'], [bb.x, bb.y + bb.h, 'sw'], [bb.x + bb.w, bb.y + bb.h, 'se']];
    const a = ctx.proj.toScreen(bb.x, bb.y), b = ctx.proj.toScreen(bb.x + bb.w, bb.y + bb.h);
    s += '<rect x="' + f(Math.min(a[0], b[0]) - .3) + '" y="' + f(Math.min(a[1], b[1]) - .3) + '" width="' + f(Math.abs(b[0] - a[0]) + .6) + '" height="' + f(Math.abs(b[1] - a[1]) + .6) + '" fill="none" stroke="' + gold + '" stroke-width="' + sw + '" stroke-dasharray="' + f(hs) + ' ' + f(hs * .8) + '"/>';
    if (single && o.type === 'shape') {
      corners.forEach(c => { const p = ctx.proj.toScreen(c[0], c[1]); s += handle(p[0], p[1], hs, c[2], o.id); });
      const top = ctx.proj.toScreen(bb.x + bb.w / 2, bb.y);
      const [cx, cy] = ctx.proj.toScreen(o.x, o.y);
      const dir = [top[0] - cx, top[1] - cy]; const L = Math.hypot(dir[0], dir[1]) || 1;
      const rp = [top[0] + dir[0] / L * hs * 3, top[1] + dir[1] / L * hs * 3];
      s += '<line x1="' + f(top[0]) + '" y1="' + f(top[1]) + '" x2="' + f(rp[0]) + '" y2="' + f(rp[1]) + '" stroke="' + gold + '" stroke-width="' + sw + '"/>' + handle(rp[0], rp[1], hs, 'rot', o.id, 'circle');
    }
    return s;
  }

  /* ---------------------------------------------------------- hit-testing */
  /** Returns ids of objects whose bbox intersects the screen-space rectangle. */
  R.objectsInRect = function (sx0, sy0, sx1, sy1) {
    const x0 = Math.min(sx0, sx1), x1 = Math.max(sx0, sx1), y0 = Math.min(sy0, sy1), y1 = Math.max(sy0, sy1);
    const hits = [];
    K1.objects().forEach(o => {
      const bb = K1.bbox(o);
      const a = proj.toScreen(bb.x, bb.y), b = proj.toScreen(bb.x + bb.w, bb.y + bb.h);
      const bx0 = Math.min(a[0], b[0]), bx1 = Math.max(a[0], b[0]), by0 = Math.min(a[1], b[1]), by1 = Math.max(a[1], b[1]);
      if (bx0 <= x1 && bx1 >= x0 && by0 <= y1 && by1 >= y0) hits.push(o.id);
    });
    return hits;
  };

  /* ------------------------------------------------------------ export SVG */
  /**
   * Standalone SVG string of a frame (pixel sized) with a K1 header band.
   * opts: { frame, objects, width, orientation:'auto'|'landscape'|'portrait', header:true, caption, title, footer }
   */
  R.exportSVG = function (opts) {
    opts = opts || {};
    const doc = S().doc;
    const d = K1.dims();
    const t = K1.THEMES[doc.pitch.theme] || K1.THEMES.stripes;
    const orientation = opts.orientation && opts.orientation !== 'auto' ? opts.orientation : R.orientation();
    const p = K1.projection(d, orientation);
    const objects = opts.objects || (opts.frame ? opts.frame.objects : K1.objects());
    const ctx = R.ctx({ proj: p, interactive: false });
    const W = opts.width || 1600;
    const boardH = Math.round(W * p.baseView.h / p.baseView.w);
    const header = opts.header !== false;
    const headH = header ? Math.round(W * .085) : 0;
    const footH = header ? Math.round(W * .035) : 0;
    const H = headH + boardH + footH;
    const title = opts.title != null ? opts.title : doc.title;
    const caption = opts.caption != null ? opts.caption : (opts.frame ? opts.frame.caption : K1.frame().caption);
    const font = "Inter,'Segoe UI',Arial,sans-serif";
    let objs = '';
    R.sorted(objects).forEach(o => { objs += R.objectSVG(o, ctx); });
    let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" style="font-family:' + font + '">';
    s += '<rect width="' + W + '" height="' + H + '" fill="#0b1116"/>';
    if (header) {
      const pad = Math.round(headH * .16);
      const badgeSize = headH - pad * 2;
      const custom = K1.brandLogo ? K1.brandLogo() : (K1.customLogo ? K1.customLogo() : null);
      if (custom) s += '<image href="' + custom + '" x="' + pad + '" y="' + pad + '" width="' + badgeSize + '" height="' + badgeSize + '" preserveAspectRatio="xMidYMid meet"/>';
      else s += '<svg x="' + pad + '" y="' + pad + '" width="' + badgeSize + '" height="' + badgeSize + '" viewBox="0 0 512 512">' + K1.LOGO.badge({ size: 512 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</svg>';
      const tx = pad * 2 + badgeSize;
      s += '<text x="' + tx + '" y="' + Math.round(headH * .43) + '" font-size="' + Math.round(headH * .34) + '" font-weight="800" fill="#ffffff">' + esc(title) + '</text>';
      s += '<text x="' + tx + '" y="' + Math.round(headH * .78) + '" font-size="' + Math.round(headH * .2) + '" font-weight="600" fill="#f5b301">' + esc(caption || (doc.teams.home.name + ' vs ' + doc.teams.away.name)) + '</text>';
      s += '<text x="' + (W - pad) + '" y="' + Math.round(headH * .43) + '" font-size="' + Math.round(headH * .2) + '" font-weight="700" fill="#ffffff" text-anchor="end" opacity=".9">' + esc(doc.teams.home.name.toUpperCase()) + '</text>';
      s += '<text x="' + (W - pad) + '" y="' + Math.round(headH * .78) + '" font-size="' + Math.round(headH * .17) + '" font-weight="600" fill="#8b98a5" text-anchor="end">K1 SHOOTERS FOOTBALL ACADEMY · TACTICS BOARD</text>';
    }
    s += '<svg x="0" y="' + headH + '" width="' + W + '" height="' + boardH + '" viewBox="' + f(p.baseView.x) + ' ' + f(p.baseView.y) + ' ' + f(p.baseView.w) + ' ' + f(p.baseView.h) + '" preserveAspectRatio="xMidYMid meet">';
    s += '<defs>' + defsSVG(ctx.photos) + '</defs>';
    s += '<rect x="-500" y="-500" width="1000" height="1000" fill="' + t.outer + '"/>';
    s += '<g transform="' + p.transform + '">' + K1.markingsSVG(d, t, doc.pitch.overlay) + '</g>';
    s += objs;
    s += '</svg>';
    if (header) {
      const fy = headH + boardH + footH * .62;
      s += '<text x="' + Math.round(W * .012) + '" y="' + fy + '" font-size="' + Math.round(footH * .42) + '" fill="#8b98a5">' + esc(K1.PITCHES[d.id].name) + ' · ' + esc(new Date().toLocaleDateString()) + (K1.settings.coachName ? ' · Coach ' + esc(K1.settings.coachName) : '') + '</text>';
      s += '<text x="' + (W - Math.round(W * .012)) + '" y="' + fy + '" font-size="' + Math.round(footH * .42) + '" fill="#8b98a5" text-anchor="end">Frame ' + (opts.frameNumber || (S().frameIndex + 1)) + ' / ' + doc.frames.length + '</text>';
    }
    s += '</svg>';
    return s;
  };

  /** Small preview SVG of any frame (used in the frame strip + board library). */
  R.thumbSVG = function (doc, frame, w, h) {
    const d = K1.pitchDims(doc.pitch);
    const t = K1.THEMES[doc.pitch.theme] || K1.THEMES.stripes;
    const p = K1.projection(d, 'landscape');
    const kits = { home: K1.kitById(doc.teams.home.kit), away: K1.kitById(doc.teams.away.kit) };
    let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="' + f(p.baseView.x + 2) + ' ' + f(p.baseView.y + 2) + ' ' + f(p.baseView.w - 4) + ' ' + f(p.baseView.h - 4) + '" preserveAspectRatio="xMidYMid slice">';
    s += '<rect x="-500" y="-500" width="1000" height="1000" fill="' + t.outer + '"/>';
    s += K1.markingsSVG(d, t, 'none');
    const r = Math.max(1.6, d.L / 48);
    (frame.objects || []).forEach(o => {
      if (o.type === 'player') {
        const kit = kits[o.team];
        const fill = o.team === 'ref' ? '#111827' : o.team === 'neutral' ? (o.color || '#facc15') : (o.color || (o.gk ? kit.gk : kit.primary));
        s += '<circle cx="' + f(o.x) + '" cy="' + f(o.y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="rgba(255,255,255,.7)" stroke-width=".3"/>';
      } else if (o.type === 'ball') s += '<circle cx="' + f(o.x) + '" cy="' + f(o.y) + '" r="' + f(r * .6) + '" fill="#fff" stroke="#111" stroke-width=".25"/>';
      else if (o.type === 'path' && o.points && o.points.length > 1) s += '<path d="' + polyPath(o.points) + '" fill="none" stroke="' + (o.color || '#fff') + '" stroke-width=".6" opacity=".85"/>';
      else if (o.type === 'equip') s += '<circle cx="' + f(o.x) + '" cy="' + f(o.y) + '" r="' + f(r * .45) + '" fill="' + (o.color || '#f97316') + '"/>';
      else if (o.type === 'shape') s += '<rect x="' + f(o.x - o.w / 2) + '" y="' + f(o.y - o.h / 2) + '" width="' + f(o.w) + '" height="' + f(o.h) + '" fill="' + o.color + '" fill-opacity=".2" stroke="' + o.color + '" stroke-width=".3"/>';
    });
    s += '</svg>';
    return s;
  };

  K1.Render = R;
})(window.K1 = window.K1 || {});
