/* K1 Shooters Tactics Board — frames & animation timeline */
(function (K1) {
  'use strict';

  const A = { playing: false, t: 0, speed: 1, loop: false, raf: null, lastTs: 0 };
  const S = () => K1.S;
  const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  /* ------------------------------------------------------------ timeline */
  A.hold = () => Math.max(0, Number(K1.settings.holdDuration) || 0);
  A.segments = function () {
    const frames = S().doc.frames;
    const segs = [];
    let t = 0;
    const hold = A.hold();
    for (let i = 0; i < frames.length; i++) {
      segs.push({ type: 'hold', i, start: t, dur: hold });
      t += hold;
      if (i < frames.length - 1) {
        const dur = Math.max(200, Number(frames[i].duration) || 1400);
        segs.push({ type: 'move', i, start: t, dur });
        t += dur;
      }
    }
    return { segs, total: t };
  };
  A.total = () => A.segments().total;
  A.frameStart = function (i) { const hold = A.hold(); let t = 0; const frames = S().doc.frames; for (let k = 0; k < i; k++) t += hold + (Math.max(200, Number(frames[k].duration) || 1400)); return t; };

  /** Interpolated scene at timeline position t (ms). */
  A.sceneAt = function (t) {
    const frames = S().doc.frames;
    const { segs, total } = A.segments();
    t = K1.clamp(t, 0, total);
    let seg = segs[segs.length - 1];
    for (const s of segs) { if (t >= s.start && t < s.start + s.dur) { seg = s; break; } }
    if (seg.type === 'hold' || seg.i >= frames.length - 1) {
      return { objects: frames[seg.i].objects, frameIndex: seg.i, caption: frames[seg.i].caption, progress: 0 };
    }
    const p = ease(seg.dur ? (t - seg.start) / seg.dur : 1);
    return { objects: A.interpolate(frames[seg.i], frames[seg.i + 1], p), frameIndex: seg.i, caption: p < .5 ? frames[seg.i].caption : frames[seg.i + 1].caption, progress: p };
  };

  const lerp = (a, b, p) => a + (b - a) * p;
  A.interpolate = function (fa, fb, p) {
    const out = [];
    const bById = new Map(fb.objects.map(o => [o.id, o]));
    const seen = new Set();
    fa.objects.forEach(a => {
      const b = bById.get(a.id);
      if (b && b.type === a.type) {
        seen.add(a.id);
        const o = Object.assign({}, a);
        if (a.x != null && b.x != null) { o.x = lerp(a.x, b.x, p); }
        if (a.y != null && b.y != null) { o.y = lerp(a.y, b.y, p); }
        if (a.w != null && b.w != null) { o.w = lerp(a.w, b.w, p); o.h = lerp(a.h, b.h, p); }
        if (a.rot != null && b.rot != null) o.rot = lerp(a.rot, b.rot, p);
        if (a.size != null && b.size != null) o.size = lerp(a.size, b.size, p);
        if (a.points && b.points) {
          if (a.points.length === b.points.length) {
            o.points = a.points.map((pt, i) => [lerp(pt[0], b.points[i][0], p), lerp(pt[1], b.points[i][1], p)]);
            if (a.ctrl && b.ctrl) o.ctrl = [lerp(a.ctrl[0], b.ctrl[0], p), lerp(a.ctrl[1], b.ctrl[1], p)];
          } else if (p >= .5) { Object.assign(o, b); }
        }
        // properties that don't interpolate switch halfway
        if (p >= .5) { ['text', 'color', 'n', 'name', 'gk', 'team', 'kind', 'label'].forEach(k => { if (b[k] !== undefined) o[k] = b[k]; }); }
        o._alpha = 1;
        out.push(o);
      } else {
        // only in A → fade out during the first 40 %
        const o = Object.assign({}, a); o._alpha = K1.clamp(1 - p / .4, 0, 1); out.push(o);
      }
    });
    fb.objects.forEach(b => {
      if (seen.has(b.id)) return;
      const o = Object.assign({}, b); o._alpha = K1.clamp((p - .6) / .4, 0, 1); out.push(o);
    });
    return out;
  };

  /* ------------------------------------------------------------ playback */
  function tick(ts) {
    if (!A.playing) return;
    if (!A.lastTs) A.lastTs = ts;
    const dt = (ts - A.lastTs) * A.speed;
    A.lastTs = ts;
    A.t += dt;
    const total = A.total();
    if (A.t >= total) {
      if (A.loop) { A.t = 0; }
      else { A.t = total; A.render(); A.pause(); K1.emit('anim', { state: 'ended' }); return; }
    }
    A.render();
    A.raf = requestAnimationFrame(tick);
  }
  A.render = function () {
    const scene = A.sceneAt(A.t);
    K1.Render.previewObjects = scene.objects;
    K1.Render.renderObjects(scene.objects);
    K1.emit('animtick', { t: A.t, total: A.total(), scene });
  };
  A.play = function () {
    if (S().doc.frames.length < 2) { K1.UI && K1.UI.toast('Add a second frame to animate — positions morph between frames.'); return; }
    if (A.playing) return;
    if (A.t >= A.total() - 1) A.t = 0;
    A.playing = true; S().playing = true; A.lastTs = 0;
    K1.clearSelection();
    K1.Render.renderUI();
    K1.emit('anim', { state: 'play' });
    A.raf = requestAnimationFrame(tick);
  };
  A.pause = function () {
    if (!A.playing) return;
    A.playing = false; S().playing = false;
    if (A.raf) cancelAnimationFrame(A.raf);
    A.raf = null;
    // land on the frame nearest to the current time
    const scene = A.sceneAt(A.t);
    S().frameIndex = scene.progress > .5 ? Math.min(scene.frameIndex + 1, S().doc.frames.length - 1) : scene.frameIndex;
    K1.Render.previewObjects = null;
    K1.Render.renderObjects();
    K1.Render.renderUI();
    K1.emit('anim', { state: 'pause' });
    K1.emit('frames');
  };
  A.stop = function () {
    A.pause();
    A.t = 0;
    S().frameIndex = 0;
    K1.Render.previewObjects = null;
    K1.Render.renderObjects();
    K1.emit('anim', { state: 'stop' });
    K1.emit('frames');
  };
  A.toggle = function () { if (A.playing) A.pause(); else A.play(); };
  A.seek = function (t, render) {
    A.t = K1.clamp(t, 0, A.total());
    if (render !== false) {
      const scene = A.sceneAt(A.t);
      K1.Render.previewObjects = scene.objects;
      K1.Render.renderObjects(scene.objects);
      K1.emit('animtick', { t: A.t, total: A.total(), scene });
    }
  };
  A.endScrub = function () {
    if (A.playing) return;
    const scene = A.sceneAt(A.t);
    S().frameIndex = scene.progress > .5 ? Math.min(scene.frameIndex + 1, S().doc.frames.length - 1) : scene.frameIndex;
    K1.Render.previewObjects = null;
    K1.Render.renderObjects();
    K1.emit('frames');
  };

  /* -------------------------------------------------------------- frames */
  A.goTo = function (i) {
    if (A.playing) A.pause();
    const st = S();
    st.frameIndex = K1.clamp(i, 0, st.doc.frames.length - 1);
    A.t = A.frameStart(st.frameIndex);
    st.selection.clear();
    K1.Render.previewObjects = null;
    K1.emit('frames');
    K1.emit('selection', st.selection);
    K1.emit('change', { label: 'frame', silent: true });
  };
  A.next = () => A.goTo(S().frameIndex + 1);
  A.prev = () => A.goTo(S().frameIndex - 1);

  /** Add a frame after the current one. Players/ball/equipment carry over; drawings are dropped unless keepDrawings. */
  A.addFrame = function (opts) {
    opts = opts || {};
    const st = S();
    const cur = K1.frame();
    K1.begin();
    const objects = K1.clone(cur.objects).filter(o => opts.keepDrawings || !['path', 'measure'].includes(o.type));
    const fr = K1.newFrame(objects, '');
    fr.duration = cur.duration;
    st.doc.frames.splice(st.frameIndex + 1, 0, fr);
    st.frameIndex += 1;
    st.selection.clear();
    K1.commit('add frame');
    K1.emit('frames');
    K1.haptic(10);
    return fr;
  };
  A.duplicateFrame = () => A.addFrame({ keepDrawings: true });
  A.deleteFrame = function (i) {
    const st = S();
    if (st.doc.frames.length <= 1) { K1.UI && K1.UI.toast('A board needs at least one frame.'); return; }
    i = i == null ? st.frameIndex : i;
    K1.begin();
    st.doc.frames.splice(i, 1);
    st.frameIndex = K1.clamp(st.frameIndex, 0, st.doc.frames.length - 1);
    st.selection.clear();
    K1.commit('delete frame');
    K1.emit('frames');
  };
  A.moveFrame = function (i, dir) {
    const st = S();
    const j = i + dir;
    if (j < 0 || j >= st.doc.frames.length) return;
    K1.begin();
    const [fr] = st.doc.frames.splice(i, 1);
    st.doc.frames.splice(j, 0, fr);
    if (st.frameIndex === i) st.frameIndex = j; else if (st.frameIndex === j) st.frameIndex = i;
    K1.commit('reorder frames');
    K1.emit('frames');
  };
  A.setCaption = function (i, caption) { K1.begin(); S().doc.frames[i].caption = caption; K1.commit('caption'); K1.emit('frames'); };
  A.setDuration = function (i, ms) { K1.begin(); S().doc.frames[i].duration = K1.clamp(Number(ms) || 1400, 200, 10000); K1.commit('duration'); K1.emit('frames'); };
  A.setAllDurations = function (ms) { K1.begin(); S().doc.frames.forEach(fr => { fr.duration = K1.clamp(Number(ms) || 1400, 200, 10000); }); K1.commit('durations'); K1.emit('frames'); };

  /** Copy the current frame's players to every later frame that lacks them (fixes "player missing in frame 3"). */
  A.propagatePlayers = function () {
    const st = S();
    const cur = K1.frame();
    K1.begin();
    for (let i = st.frameIndex + 1; i < st.doc.frames.length; i++) {
      const fr = st.doc.frames[i];
      cur.objects.forEach(o => { if ((o.type === 'player' || o.type === 'ball' || o.type === 'equip') && !fr.objects.find(x => x.id === o.id)) fr.objects.push(K1.clone(o)); });
    }
    K1.commit('propagate');
  };

  K1.Anim = A;
})(window.K1 = window.K1 || {});
