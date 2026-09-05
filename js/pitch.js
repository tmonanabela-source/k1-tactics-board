/* K1 Shooters Tactics Board — pitch geometry, themes, markings and projection
 * All object coordinates live in "pitch space" (metres): x runs along the length (0 = left goal line),
 * y runs across the width (0 = top touchline). Portrait mode is a pure projection on top of that. */
(function (K1) {
  'use strict';

  const PITCHES = {
    full: { id: 'full', name: 'Full pitch · 11v11', short: '11v11', L: 105, W: 68, goal: 7.32, goalDepth: 2.2, penArea: { d: 16.5, w: 40.32 }, goalArea: { d: 5.5, w: 18.32 }, penSpot: 11, circleR: 9.15, cornerR: 1, players: 11 },
    half: { id: 'half', name: 'Half pitch · final third work', short: 'Half', L: 52.5, W: 68, goal: 7.32, goalDepth: 2.2, penArea: { d: 16.5, w: 40.32 }, goalArea: { d: 5.5, w: 18.32 }, penSpot: 11, circleR: 9.15, cornerR: 1, players: 11, half: true },
    nine: { id: 'nine', name: '9v9 · 73 × 46 m', short: '9v9', L: 73, W: 46, goal: 6.4, goalDepth: 1.6, penArea: { d: 12, w: 28 }, goalArea: { d: 4, w: 14 }, penSpot: 9, circleR: 7, cornerR: 1, players: 9 },
    seven: { id: 'seven', name: '7v7 · 55 × 37 m', short: '7v7', L: 55, W: 37, goal: 3.66, goalDepth: 1.3, penArea: { d: 10, w: 20 }, goalArea: null, penSpot: 8, circleR: 5, cornerR: .8, players: 7 },
    five: { id: 'five', name: '5v5 · 37 × 27 m', short: '5v5', L: 37, W: 27, goal: 3.66, goalDepth: 1.1, dArc: 7, penSpot: 6, circleR: 4, cornerR: .6, players: 5 },
    four: { id: 'four', name: '4v4 · 30 × 20 m mini pitch (no keepers)', short: '4v4', L: 30, W: 20, goal: 2.4, goalDepth: .8, circleR: 3, cornerR: .5, players: 4 },
    futsal: { id: 'futsal', name: 'Futsal · 40 × 20 m', short: 'Futsal', L: 40, W: 20, goal: 3, goalDepth: 1, futsal: true, circleR: 3, players: 5 },
    grid: { id: 'grid', name: 'Training grid (custom size)', short: 'Grid', L: 40, W: 30, goal: 0, goalDepth: 0, grid: true, players: 11 },
  };

  const THEMES = {
    stripes: { id: 'stripes', name: 'Classic stripes', grass: '#5a9c48', grass2: '#65a951', line: '#ffffff', outer: '#4c8a3d', stripes: true, ink: '#0b1116' },
    plain: { id: 'plain', name: 'Plain grass', grass: '#5f9f4d', grass2: '#5f9f4d', line: '#ffffff', outer: '#4f8f3f', stripes: false, ink: '#0b1116' },
    night: { id: 'night', name: 'Night match', grass: '#2e6b3e', grass2: '#337547', line: '#f1f5f9', outer: '#224f2e', stripes: true, ink: '#0b1116' },
    dark: { id: 'dark', name: 'Dark tactical', grass: '#1f2933', grass2: '#243140', line: '#e2e8f0', outer: '#141b23', stripes: true, ink: '#ffffff' },
    chalk: { id: 'chalk', name: 'Whiteboard', grass: '#fbfbfb', grass2: '#f1f3f5', line: '#111827', outer: '#ffffff', stripes: true, ink: '#111827' },
    blue: { id: 'blue', name: 'Blueprint', grass: '#1e3a8a', grass2: '#1f3f95', line: '#bfdbfe', outer: '#172c6b', stripes: true, ink: '#ffffff' },
    turf: { id: 'turf', name: 'Artificial turf', grass: '#3d8f41', grass2: '#3d8f41', line: '#fef08a', outer: '#337536', stripes: false, ink: '#0b1116' },
    sand: { id: 'sand', name: 'Beach / sand', grass: '#e6c98a', grass2: '#e2c283', line: '#1e3a8a', outer: '#d6b676', stripes: false, ink: '#0b1116' },
  };

  const MARGIN = 4.5; // metres of "outside the pitch" shown around the field

  /** Effective dimensions for a document's pitch config (custom grid sizes supported). */
  function dims(pitch) {
    const base = PITCHES[pitch && pitch.type] || PITCHES.full;
    const d = Object.assign({}, base);
    if (base.grid) {
      d.L = Math.max(10, Math.min(120, Number(pitch.L) || base.L));
      d.W = Math.max(10, Math.min(90, Number(pitch.W) || base.W));
      d.gridStep = Number(pitch.gridStep) || 5;
    }
    return d;
  }

  /** Decide the orientation actually used for a given container aspect. */
  function resolveOrientation(pitch, containerW, containerH) {
    const o = (pitch && pitch.orientation) || 'auto';
    if (o === 'landscape' || o === 'portrait') return o;
    if (!containerW || !containerH) return 'landscape';
    const d = dims(pitch);
    // pick the orientation that wastes the least space
    const fitL = Math.min(containerW / (d.L + 2 * MARGIN), containerH / (d.W + 2 * MARGIN));
    const fitP = Math.min(containerW / (d.W + 2 * MARGIN), containerH / (d.L + 2 * MARGIN));
    return fitP > fitL * 1.08 ? 'portrait' : 'landscape';
  }

  /** Projection helpers between pitch space and screen (SVG user) space. */
  function projection(d, orientation) {
    const portrait = orientation === 'portrait';
    const L = d.L, W = d.W;
    return {
      portrait,
      L, W,
      // screen size of the pitch rectangle
      sw: portrait ? W : L,
      sh: portrait ? L : W,
      toScreen: portrait ? (x, y) => [y, L - x] : (x, y) => [x, y],
      toPitch: portrait ? (sx, sy) => [L - sy, sx] : (sx, sy) => [sx, sy],
      // transform for marking groups authored in pitch space
      transform: portrait ? 'matrix(0 -1 1 0 0 ' + L + ')' : '',
      // rotation of "along the length" direction on screen, degrees
      angle: portrait ? -90 : 0,
      baseView: portrait
        ? { x: -MARGIN, y: -MARGIN, w: W + 2 * MARGIN, h: L + 2 * MARGIN }
        : { x: -MARGIN, y: -MARGIN, w: L + 2 * MARGIN, h: W + 2 * MARGIN },
    };
  }

  const f = n => (Math.round(n * 1000) / 1000).toString();

  function stripesSVG(d, t) {
    if (!t.stripes) return '';
    const count = Math.max(4, Math.round(d.L / 8.75));
    const bw = d.L / count;
    let s = '';
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0) continue;
      s += '<rect x="' + f(i * bw) + '" y="0" width="' + f(bw) + '" height="' + f(d.W) + '" fill="' + t.grass2 + '"/>';
    }
    return s;
  }

  function goalSVG(d, t, side) {
    if (!d.goal) return '';
    const gw = d.goal, gd = d.goalDepth;
    const x = side === 0 ? -gd : d.L;
    const y = d.W / 2 - gw / 2;
    let s = '<g class="goal">';
    s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(gd) + '" height="' + f(gw) + '" fill="rgba(255,255,255,.12)" stroke="' + t.line + '" stroke-width=".22"/>';
    // net
    const step = Math.max(.45, gw / 10);
    for (let yy = y + step; yy < y + gw - .01; yy += step) s += '<line x1="' + f(x) + '" y1="' + f(yy) + '" x2="' + f(x + gd) + '" y2="' + f(yy) + '" stroke="' + t.line + '" stroke-width=".06" opacity=".7"/>';
    for (let xx = x + step; xx < x + gd - .01; xx += step) s += '<line x1="' + f(xx) + '" y1="' + f(y) + '" x2="' + f(xx) + '" y2="' + f(y + gw) + '" stroke="' + t.line + '" stroke-width=".06" opacity=".7"/>';
    s += '</g>';
    return s;
  }

  /** Standard football end markings for one end (side 0 = x:0, side 1 = x:L). */
  function endSVG(d, t, side) {
    const L = d.L, W = d.W, cy = W / 2;
    const X = v => (side === 0 ? v : L - v);
    const sw = side === 0 ? 1 : 0; // sweep flag flips when mirrored
    const lw = .25;
    let s = '';
    if (d.penArea) {
      const pa = d.penArea;
      s += '<rect x="' + f(Math.min(X(0), X(pa.d))) + '" y="' + f(cy - pa.w / 2) + '" width="' + f(pa.d) + '" height="' + f(pa.w) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    }
    if (d.goalArea) {
      const ga = d.goalArea;
      s += '<rect x="' + f(Math.min(X(0), X(ga.d))) + '" y="' + f(cy - ga.w / 2) + '" width="' + f(ga.d) + '" height="' + f(ga.w) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    }
    if (d.penSpot) {
      s += '<circle cx="' + f(X(d.penSpot)) + '" cy="' + f(cy) + '" r=".35" fill="' + t.line + '"/>';
    }
    if (d.penArea && d.circleR && d.penSpot) {
      const dx = d.penArea.d - d.penSpot;
      if (dx < d.circleR) {
        const dy = Math.sqrt(d.circleR * d.circleR - dx * dx);
        s += '<path d="M' + f(X(d.penArea.d)) + ' ' + f(cy - dy) + 'A' + f(d.circleR) + ' ' + f(d.circleR) + ' 0 0 ' + sw + ' ' + f(X(d.penArea.d)) + ' ' + f(cy + dy) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      }
    }
    if (d.dArc) { // 5-a-side "D"
      s += '<path d="M' + f(X(0)) + ' ' + f(cy - d.dArc) + 'A' + f(d.dArc) + ' ' + f(d.dArc) + ' 0 0 ' + sw + ' ' + f(X(0)) + ' ' + f(cy + d.dArc) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    }
    if (d.cornerR) {
      const r = d.cornerR;
      // top corner
      s += '<path d="M' + f(X(r)) + ' 0A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + f(X(0)) + ' ' + r + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      // bottom corner
      s += '<path d="M' + f(X(0)) + ' ' + f(W - r) + 'A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + f(X(r)) + ' ' + f(W) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    }
    s += goalSVG(d, t, side);
    return s;
  }

  function futsalSVG(d, t) {
    const L = d.L, W = d.W, cy = W / 2, lw = .2;
    let s = '';
    for (const side of [0, 1]) {
      const X = v => (side === 0 ? v : L - v);
      const sw = side === 0 ? 1 : 0;
      const r = 6, half = d.goal / 2;
      s += '<path d="M' + f(X(0)) + ' ' + f(cy - half - r) + 'A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + f(X(r)) + ' ' + f(cy - half) + 'L' + f(X(r)) + ' ' + f(cy + half) + 'A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + f(X(0)) + ' ' + f(cy + half + r) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      s += '<circle cx="' + f(X(6)) + '" cy="' + f(cy) + '" r=".3" fill="' + t.line + '"/>';
      s += '<circle cx="' + f(X(10)) + '" cy="' + f(cy) + '" r=".3" fill="' + t.line + '"/>';
      // substitution zone ticks
      s += '<line x1="' + f(X(L / 2 - 5)) + '" y1="-.8" x2="' + f(X(L / 2 - 5)) + '" y2=".8" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      s += goalSVG(d, t, side);
    }
    return s;
  }

  function overlaySVG(d, t, overlay) {
    if (!overlay || overlay === 'none') return '';
    const L = d.L, W = d.W;
    const col = t.line, op = .35, lw = .16;
    let s = '<g class="overlay" opacity="' + op + '">';
    const v = x => '<line x1="' + f(x) + '" y1="0" x2="' + f(x) + '" y2="' + f(W) + '" stroke="' + col + '" stroke-width="' + lw + '" stroke-dasharray="1.4 1"/>';
    const h = y => '<line x1="0" y1="' + f(y) + '" x2="' + f(L) + '" y2="' + f(y) + '" stroke="' + col + '" stroke-width="' + lw + '" stroke-dasharray="1.4 1"/>';
    const laneYs = d.penArea && d.goalArea
      ? [W / 2 - d.penArea.w / 2, W / 2 - d.goalArea.w / 2, W / 2 + d.goalArea.w / 2, W / 2 + d.penArea.w / 2]
      : [W * .2, W * .37, W * .63, W * .8];
    if (overlay === 'thirds') { s += v(L / 3) + v(2 * L / 3); }
    else if (overlay === 'lanes') {
      // shade the half-spaces (lanes 2 and 4), the zone every possession coach talks about
      s += '<rect x="0" y="' + f(laneYs[0]) + '" width="' + f(L) + '" height="' + f(laneYs[1] - laneYs[0]) + '" fill="' + col + '" opacity=".16"/>';
      s += '<rect x="0" y="' + f(laneYs[2]) + '" width="' + f(L) + '" height="' + f(laneYs[3] - laneYs[2]) + '" fill="' + col + '" opacity=".16"/>';
      laneYs.forEach(y => { s += h(y); });
    }
    else if (overlay === 'zones18') { for (let i = 1; i < 6; i++) s += v(L * i / 6); s += h(W / 3) + h(2 * W / 3); }
    else if (overlay === 'zones20') { for (let i = 1; i < 4; i++) s += v(L * i / 4); laneYs.forEach(y => { s += h(y); }); }
    else if (overlay === 'grid5') { for (let x = 5; x < L; x += 5) s += v(x); for (let y = 5; y < W; y += 5) s += h(y); }
    else if (overlay === 'grid10') { for (let x = 10; x < L; x += 10) s += v(x); for (let y = 10; y < W; y += 10) s += h(y); }
    s += '</g>';
    return s;
  }

  /** Full pitch layer markup, authored in pitch space (wrap in the projection transform). */
  function markingsSVG(d, t, overlay) {
    const L = d.L, W = d.W, cx = L / 2, cy = W / 2, lw = .25;
    let s = '';
    s += '<rect x="0" y="0" width="' + f(L) + '" height="' + f(W) + '" fill="' + t.grass + '"/>';
    s += stripesSVG(d, t);
    if (d.grid) {
      const step = d.gridStep || 5;
      s += '<g opacity=".35">';
      for (let x = step; x < L; x += step) s += '<line x1="' + f(x) + '" y1="0" x2="' + f(x) + '" y2="' + f(W) + '" stroke="' + t.line + '" stroke-width=".1"/>';
      for (let y = step; y < W; y += step) s += '<line x1="0" y1="' + f(y) + '" x2="' + f(L) + '" y2="' + f(y) + '" stroke="' + t.line + '" stroke-width=".1"/>';
      s += '</g>';
      s += '<rect x="0" y="0" width="' + f(L) + '" height="' + f(W) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      return s + overlaySVG(d, t, overlay);
    }
    s += overlaySVG(d, t, overlay);
    // boundary
    s += '<rect x="0" y="0" width="' + f(L) + '" height="' + f(W) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    if (d.futsal) {
      s += '<line x1="' + f(cx) + '" y1="0" x2="' + f(cx) + '" y2="' + f(W) + '" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(d.circleR) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r=".3" fill="' + t.line + '"/>';
      s += futsalSVG(d, t);
      return s;
    }
    if (d.half) {
      // halfway line is the left edge; half centre circle bulges into the pitch
      s += '<path d="M0 ' + f(cy - d.circleR) + 'A' + f(d.circleR) + ' ' + f(d.circleR) + ' 0 0 1 0 ' + f(cy + d.circleR) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
      s += '<circle cx="0" cy="' + f(cy) + '" r=".35" fill="' + t.line + '"/>';
      s += endSVG(d, t, 1);
      return s;
    }
    // halfway + centre circle
    s += '<line x1="' + f(cx) + '" y1="0" x2="' + f(cx) + '" y2="' + f(W) + '" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(d.circleR) + '" fill="none" stroke="' + t.line + '" stroke-width="' + lw + '"/>';
    s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r=".35" fill="' + t.line + '"/>';
    s += endSVG(d, t, 0) + endSVG(d, t, 1);
    return s;
  }

  /** Converts a normalised formation slot into pitch metres for a team. side 'home' attacks right. */
  function slotToPitch(d, slot, side) {
    const attackRight = side !== 'away';
    let nx = slot.x, ny = slot.y;
    if (!attackRight) { nx = 1 - nx; ny = 1 - ny; }
    if (d.half) {
      // half pitch: everyone plays towards the single goal at x = L; compress own-half positions
      const x = attackRight ? (nx - .5) * 2 : (nx - .5) * 2;
      return [Math.max(1.5, Math.min(d.L - 1.5, x * d.L)), ny * d.W];
    }
    return [nx * d.L, ny * d.W];
  }

  K1.PITCHES = PITCHES;
  K1.THEMES = THEMES;
  K1.PITCH_MARGIN = MARGIN;
  K1.pitchDims = dims;
  K1.resolveOrientation = resolveOrientation;
  K1.projection = projection;
  K1.markingsSVG = markingsSVG;
  K1.slotToPitch = slotToPitch;
})(window.K1 = window.K1 || {});
