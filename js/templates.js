/* K1 Shooters Tactics Board — turn library descriptors (set pieces, drills, morphs, formations) into live boards */
(function (K1) {
  'use strict';

  const T = {};

  /** Convert an authored descriptor into a real object. idByKey keeps players/ball stable across frames. */
  function toObject(d, idByKey) {
    let o;
    switch (d.t) {
      case 'player': o = K1.make.player(d.team, d.n, d.x, d.y, { gk: !!d.gk, name: d.name || '' }); break;
      case 'ball': o = K1.make.ball(d.x, d.y); break;
      case 'equip': {
        const color = d.color || (d.kind === 'mannequin' ? '#facc15' : (d.kind === 'cone' || d.kind === 'disc' || d.kind === 'hurdle' ? '#f97316' : '#f8fafc'));
        o = K1.make.equip(d.kind, d.x, d.y, { rot: d.rot || 0, color });
        break;
      }
      case 'path': o = K1.make.path(d.kind, d.points.map(p => p.slice()), { color: d.color || '#ffffff' }); if (d.ctrl) o.ctrl = d.ctrl.slice(); if (d.dash != null) o.dash = d.dash; if (d.width != null) o.width = d.width; if (d.head != null) o.head = d.head; break;
      case 'text': o = K1.make.text(d.x, d.y, d.text, { size: d.size || 2.2, color: d.color || '#ffffff', bg: d.bg !== false }); break;
      case 'shape': o = K1.make.shape(d.kind, d.x, d.y, d.w, d.h, { color: d.color || '#f5b301', opacity: d.opacity == null ? .2 : d.opacity, fill: true, label: d.label || '' }); break;
      case 'offside': o = K1.make.offside(d.x); break;
      default: return null;
    }
    if (d.k) { if (idByKey[d.k]) o.id = idByKey[d.k]; else idByKey[d.k] = o.id; }
    return o;
  }

  /** Instantiate authored frames. Frames with `moves` derive from the previous frame. */
  T.instantiate = function (frames, transform) {
    const idByKey = {};
    const out = [];
    let prevRaw = null; // untransformed objects of the previous frame (moves are authored in full-pitch metres)
    frames.forEach(fr => {
      let raw;
      if (fr.moves && prevRaw) {
        raw = K1.clone(prevRaw).filter(o => o.type !== 'path' && o.type !== 'measure');
        Object.keys(fr.moves).forEach(k => {
          const o = raw.find(x => x.id === idByKey[k]);
          if (o) { o.x = fr.moves[k][0]; o.y = fr.moves[k][1]; }
        });
        (fr.objects || []).forEach(d => { const o = toObject(d, idByKey); if (o) raw.push(o); });
      } else {
        raw = (fr.objects || []).map(d => toObject(d, idByKey)).filter(Boolean);
      }
      prevRaw = raw;
      const objects = transform ? raw.map(transform).filter(Boolean) : raw;
      out.push(K1.newFrame(objects, fr.caption || ''));
    });
    return out;
  };

  /**
   * Map a full-pitch (105 × 68) scene onto the half pitch (52.5 × 68, single goal at x = 52.5).
   * Scenes played towards the right goal are shifted; own-half scenes (goal kicks, kick-off build-up)
   * are mirrored so their goal becomes the half pitch's goal.
   */
  function halfPitchMapper(frames) {
    const xs = [];
    frames.forEach(fr => (fr.objects || []).forEach(d => { if (d.t === 'player' && d.x != null) xs.push(d.x); }));
    const right = xs.filter(x => x > 52.5).length;
    const mirror = right < xs.length / 2;
    const fx = mirror ? x => 52.5 - x : x => x - 52.5;
    return function (o) {
      const c = K1.clone(o);
      if (c.points) { c.points = c.points.map(p => [fx(p[0]), p[1]]); if (c.points.some(p => p[0] < -3)) return null; }
      if (c.ctrl) c.ctrl = [fx(c.ctrl[0]), c.ctrl[1]];
      if (c.x != null && c.type !== 'path' && c.type !== 'measure') { c.x = fx(c.x); if (c.type !== 'offside' && c.x < -3.5) return null; }
      if (mirror && (c.type === 'equip' || c.type === 'shape')) c.rot = (180 - (c.rot || 0)) % 360;
      return c;
    };
  }

  T.docFromSetPiece = function (sp, opts) {
    opts = opts || {};
    const half = opts.pitch === 'half';
    const doc = K1.newDoc({ title: sp.name, pitch: { type: half ? 'half' : 'full' }, tags: ['set piece', sp.group] });
    doc.notes = sp.desc;
    doc.frames = T.instantiate(sp.frames, half ? halfPitchMapper(sp.frames) : null);
    return doc;
  };

  T.docFromDrill = function (drill) {
    const doc = K1.newDoc({ title: drill.name, pitch: Object.assign({}, drill.pitch || { type: 'grid', L: 40, W: 30 }), tags: ['drill', drill.group] });
    if (doc.pitch.type === 'grid' && !doc.pitch.gridStep) doc.pitch.gridStep = 5;
    doc.notes = drill.desc + (drill.coaching ? '\n\nCoaching points:\n• ' + drill.coaching.join('\n• ') : '') + (drill.time ? '\n\nTime: ' + drill.time : '') + (drill.players ? ' · Players: ' + drill.players : '') + (drill.equipment ? '\nEquipment: ' + drill.equipment : '');
    doc.frames = T.instantiate(drill.frames);
    return doc;
  };

  /** Players for a formation on the current pitch, with stable ids per (team, slot number). */
  T.formationObjects = function (d, formationId, team, opts) {
    opts = opts || {};
    const fm = K1.formationById(formationId);
    if (!fm) return [];
    const squad = (team === 'home' && K1.Squad) ? (n => K1.Squad.byNumber(n, K1.boardTeamId())) : null;
    return fm.slots.map(sl => {
      const [x, y] = K1.slotToPitch(d, sl, team);
      const o = K1.make.player(team, sl.n, K1.round(x, 2), K1.round(y, 2), { gk: sl.p === 'GK', pos: sl.p });
      o.id = (team === 'home' ? 'h' : 'a') + '_' + sl.n + (opts.idSuffix || '');
      if (squad) { const pl = squad(sl.n); if (pl) o.name = pl.name.split(' ').pop(); }
      return o;
    });
  };

  T.docFromMorph = function (m) {
    const doc = K1.newDoc({ title: m.name, pitch: { type: m.pitch || 'full' }, tags: ['tactic', m.club] });
    doc.notes = m.desc;
    doc.teams.home.kit = m.kits[0]; doc.teams.away.kit = m.kits[1];
    doc.teams.home.name = m.club === 'K1 Shooters' ? 'K1 Shooters' : m.club;
    doc.teams.away.name = 'Opponent';
    const d = K1.pitchDims(doc.pitch);
    const ballId = 'ball_1';
    doc.frames = m.frames.map(fr => {
      const objs = T.formationObjects(d, fr.home, 'home').concat(T.formationObjects(d, fr.away, 'away'));
      if (fr.ball) { const b = K1.make.ball(fr.ball[0], fr.ball[1]); b.id = ballId; objs.push(b); }
      const f = K1.newFrame(objs, fr.caption || '');
      f.duration = 1800;
      return f;
    });
    return doc;
  };

  /** Apply a formation to one team in the current frame (replaces that team's players). */
  T.applyFormation = function (team, formationId, opts) {
    opts = opts || {};
    const d = K1.dims();
    const fresh = T.formationObjects(d, formationId, team);
    K1.begin();
    const fr = K1.frame();
    const existing = fr.objects.filter(o => o.type === 'player' && o.team === team);
    // keep names/captain flags for matching numbers
    fresh.forEach(o => { const prev = existing.find(e => e.n === o.n); if (prev) { if (prev.name && !o.name) o.name = prev.name; if (prev.captain) o.captain = true; if (prev.color) o.color = prev.color; o.id = prev.id; } });
    fr.objects = fr.objects.filter(o => !(o.type === 'player' && o.team === team)).concat(fresh);
    if (opts.allFrames) {
      K1.S.doc.frames.forEach(other => {
        if (other === fr) return;
        other.objects = other.objects.filter(o => !(o.type === 'player' && o.team === team)).concat(K1.clone(fresh));
      });
    }
    if (!fr.objects.find(o => o.type === 'ball') && opts.ball !== false) fr.objects.push(K1.make.ball(d.L / 2, d.W / 2));
    K1.commit('formation');
    K1.haptic(12);
  };

  /** Fresh board with both teams in formation. */
  T.docFromFormations = function (homeId, awayId, pitchType) {
    const doc = K1.newDoc({ title: (K1.formationById(homeId) || {}).name + (awayId ? ' vs ' + (K1.formationById(awayId) || {}).name : ''), pitch: { type: pitchType || 'full' } });
    const d = K1.pitchDims(doc.pitch);
    let objs = T.formationObjects(d, homeId, 'home');
    if (awayId) objs = objs.concat(T.formationObjects(d, awayId, 'away'));
    objs.push(K1.make.ball(d.L / 2, d.W / 2));
    doc.frames = [K1.newFrame(objs, '')];
    return doc;
  };

  /** Mirror the current frame (or all frames) along the length of the pitch: attack the other way. */
  T.flipHorizontal = function (allFrames) {
    const d = K1.dims();
    K1.begin();
    const frames = allFrames ? K1.S.doc.frames : [K1.frame()];
    frames.forEach(fr => fr.objects.forEach(o => {
      if (o.points) o.points = o.points.map(p => [d.L - p[0], p[1]]);
      if (o.ctrl) o.ctrl = [d.L - o.ctrl[0], o.ctrl[1]];
      if (o.x != null && o.type !== 'path' && o.type !== 'measure') o.x = d.L - o.x;
      if (o.type === 'equip' || o.type === 'shape') o.rot = (180 - (o.rot || 0)) % 360;
    }));
    K1.commit('flip');
  };
  T.flipVertical = function (allFrames) {
    const d = K1.dims();
    K1.begin();
    const frames = allFrames ? K1.S.doc.frames : [K1.frame()];
    frames.forEach(fr => fr.objects.forEach(o => {
      if (o.points) o.points = o.points.map(p => [p[0], d.W - p[1]]);
      if (o.ctrl) o.ctrl = [o.ctrl[0], d.W - o.ctrl[1]];
      if (o.y != null && o.type !== 'path' && o.type !== 'measure' && o.type !== 'offside') o.y = d.W - o.y;
      if (o.type === 'equip' || o.type === 'shape') o.rot = (-(o.rot || 0)) % 360;
    }));
    K1.commit('flip');
  };
  T.swapTeams = function () {
    K1.begin();
    K1.S.doc.frames.forEach(fr => fr.objects.forEach(o => { if (o.type === 'player') { if (o.team === 'home') o.team = 'away'; else if (o.team === 'away') o.team = 'home'; } }));
    K1.commit('swap teams');
  };
  T.clearDrawings = function (allFrames) {
    K1.begin();
    const frames = allFrames ? K1.S.doc.frames : [K1.frame()];
    frames.forEach(fr => { fr.objects = fr.objects.filter(o => !['path', 'measure', 'shape', 'text', 'offside'].includes(o.type)); });
    K1.S.selection.clear();
    K1.commit('clear drawings');
  };
  T.clearAll = function () {
    K1.begin();
    K1.frame().objects = [];
    K1.S.selection.clear();
    K1.commit('clear');
  };

  /** Connect selected players with lines (passing lanes / triangles). */
  T.linkSelected = function () {
    const sel = K1.selected().filter(o => o.type === 'player');
    if (sel.length < 2) { K1.UI && K1.UI.toast('Select two or more players first.'); return; }
    K1.begin();
    for (let i = 0; i < sel.length; i++) for (let j = i + 1; j < sel.length; j++) {
      const a = sel[i], b = sel[j];
      const o = K1.make.path('line', [[a.x, a.y], [b.x, b.y]], { color: K1.S.style.color, width: .22 });
      o.dash = true;
      K1.frame().objects.unshift(o);
    }
    K1.commit('link');
  };

  /** Draw the team shape: connect players by unit (defence / midfield / attack), grouped by depth. */
  T.teamShape = function (team) {
    const players = K1.objects().filter(o => o.type === 'player' && o.team === team && !o.gk);
    if (players.length < 3) { K1.UI && K1.UI.toast('Need at least three outfield players.'); return; }
    const d = K1.dims();
    const sorted = players.slice().sort((a, b) => a.x - b.x);
    // cluster along the length by gaps > 9 % of pitch length
    const units = [];
    let cur = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].x - sorted[i - 1].x > d.L * .09) { units.push(cur); cur = []; }
      cur.push(sorted[i]);
    }
    units.push(cur);
    K1.begin();
    const color = team === 'home' ? '#f5b301' : '#7dd3fc';
    units.forEach(u => {
      if (u.length < 2) return;
      const pts = u.slice().sort((a, b) => a.y - b.y).map(p => [p.x, p.y]);
      const o = K1.make.path('line', pts, { color, width: .26 });
      o.geo = 'free'; o.dash = true;
      K1.frame().objects.unshift(o);
    });
    // distance labels between consecutive units (compactness)
    for (let i = 0; i < units.length - 1; i++) {
      const ax = units[i].reduce((s, p) => s + p.x, 0) / units[i].length, bx = units[i + 1].reduce((s, p) => s + p.x, 0) / units[i + 1].length;
      const ay = units[i].reduce((s, p) => s + p.y, 0) / units[i].length, by = units[i + 1].reduce((s, p) => s + p.y, 0) / units[i + 1].length;
      K1.frame().objects.unshift(K1.make.measure([[ax, ay], [bx, by]], { color }));
    }
    K1.commit('shape');
  };

  /** Offside line snapped to the deepest outfield defender of a team. */
  T.offsideLineFor = function (team) {
    const defenders = K1.objects().filter(o => o.type === 'player' && o.team === team && !o.gk);
    if (!defenders.length) { K1.UI && K1.UI.toast('No ' + team + ' players on the pitch.'); return; }
    // home defends the left goal (x = 0), away defends the right goal
    const x = team === 'home' ? Math.min.apply(null, defenders.map(p => p.x)) : Math.max.apply(null, defenders.map(p => p.x));
    K1.begin();
    const fr = K1.frame();
    fr.objects = fr.objects.filter(o => o.type !== 'offside');
    fr.objects.push(K1.make.offside(K1.round(x, 2), { label: 'OFFSIDE LINE · ' + (team === 'home' ? K1.S.doc.teams.home.name : K1.S.doc.teams.away.name).toUpperCase() }));
    K1.commit('offside');
  };

  K1.Templates = T;
})(window.K1 = window.K1 || {});
