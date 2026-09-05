/* K1 Shooters Tactics Board — board interaction: pointer handling, tools, selection, drag, zoom, shortcuts */
(function (K1) {
  'use strict';

  const B = {};
  const S = K1.S;
  const R = () => K1.Render;
  let svg = null, wrap = null;
  const pointers = new Map();
  let mode = null;   // drag | marquee | draw | text | erase | handle | pan | pinch
  let drag = null;
  let longPress = null;
  let lastTap = { t: 0, id: null, x: 0, y: 0 };
  let spaceDown = false;
  let pinch = null;
  B.clipboard = [];

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const isTyping = () => { const el = document.activeElement; return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable); };

  B.init = function (svgEl, wrapEl) {
    svg = svgEl; wrap = wrapEl;
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    svg.addEventListener('lostpointercapture', () => {});
    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('contextmenu', onContext);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', e => { if (e.code === 'Space') { spaceDown = false; svg.classList.remove('panning'); } });
    K1.on('tool', t => { svg.dataset.tool = t; if (!S.stamp) R().ui.stampHint = null; R().renderUI(); });
    svg.dataset.tool = S.tool;
  };

  /* ---------------------------------------------------------------- helpers */
  function pitchPoint(e) { return R().clientToPitch(e.clientX, e.clientY); }
  function clampToPitch(o) {
    const d = K1.dims(), m = K1.PITCH_MARGIN - .5;
    if (o.x != null && o.type !== 'path' && o.type !== 'measure') { o.x = K1.clamp(o.x, -m, d.L + m); if (o.type !== 'offside') o.y = K1.clamp(o.y, -m, d.W + m); }
  }
  function objIdFromTarget(target) {
    if (!target || !target.closest) return null;
    const el = target.closest('.obj');
    return el ? el.getAttribute('data-id') : null;
  }
  function clearLongPress() { if (longPress) { clearTimeout(longPress); longPress = null; } }

  /* ------------------------------------------------------------- pointer down */
  function onDown(e) {
    if (S.playing) { K1.Anim.pause(); return; }
    if (e.button === 2) return; // handled by contextmenu
    e.preventDefault();
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const pt = pitchPoint(e);
    const spt = R().clientToScreen(e.clientX, e.clientY);
    pointers.set(e.pointerId, { cx: e.clientX, cy: e.clientY, pt, spt, t: performance.now() });
    K1.UI && K1.UI.hideContext();
    if (pointers.size === 2) { startPinch(); return; }
    if (pointers.size > 2) return;
    if (document.activeElement && document.activeElement.blur && isTyping()) document.activeElement.blur();

    const handleEl = e.target.closest ? e.target.closest('[data-handle]') : null;
    const id = objIdFromTarget(e.target);

    if (e.button === 1 || spaceDown || S.tool === 'hand') { mode = 'pan'; drag = { last: spt }; svg.classList.add('panning'); return; }

    if (S.stamp) { mode = 'stamp'; drag = { pt, moved: false, start: [e.clientX, e.clientY] }; return; }

    switch (S.tool) {
      case 'select': {
        if (handleEl) { startHandle(handleEl, pt); return; }
        if (id) {
          const multi = e.shiftKey || e.ctrlKey || e.metaKey;
          if (multi) K1.toggleSelect(id);
          else if (!S.selection.has(id)) K1.select(id);
          startDrag(pt, e, id);
          if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            longPress = setTimeout(() => { longPress = null; if (mode === 'drag' && drag && !drag.moved) { mode = null; drag = null; K1.haptic(15); K1.UI && K1.UI.contextMenuFor(id, e.clientX, e.clientY); } }, 520);
          }
          return;
        }
        mode = 'marquee';
        drag = { x0: spt[0], y0: spt[1], x1: spt[0], y1: spt[1], add: e.shiftKey, moved: false, start: [e.clientX, e.clientY] };
        if (!e.shiftKey) K1.clearSelection();
        if (e.pointerType === 'touch') {
          longPress = setTimeout(() => { longPress = null; if (mode === 'marquee' && drag && !drag.moved) { mode = null; drag = null; R().ui.marquee = null; R().renderUI(); K1.haptic(15); K1.UI && K1.UI.boardContextMenu(pt, e.clientX, e.clientY); } }, 600);
        }
        return;
      }
      case 'pen': mode = 'draw'; drag = { obj: K1.make.path('pen', [pt]), start: pt }; R().ui.temp = drag.obj; return;
      case 'line': case 'pass': case 'run': case 'dribble': case 'shot': case 'curve': case 'curverun':
        mode = 'draw'; drag = { obj: K1.make.path(S.tool, [pt, pt.slice()]), start: pt }; R().ui.temp = drag.obj; return;
      case 'rect': case 'ellipse': case 'triangle': case 'zone':
        mode = 'draw'; drag = { start: pt, obj: K1.make.shape(S.tool, pt[0], pt[1], 0, 0) }; R().ui.temp = drag.obj; return;
      case 'measure': mode = 'draw'; drag = { obj: K1.make.measure([pt, pt.slice()]), start: pt }; R().ui.temp = drag.obj; return;
      case 'text': mode = 'text'; drag = { pt, id: id && K1.getObj(id) && K1.getObj(id).type === 'text' ? id : null }; return;
      case 'eraser': mode = 'erase'; drag = { erased: new Set() }; eraseId(id); return;
      case 'offside': K1.addObject(K1.make.offside(K1.round(pt[0], 2)), { select: true }); K1.setTool('select'); return;
      default: mode = null;
    }
  }

  function startDrag(pt, e, id) {
    mode = 'drag';
    const orig = {};
    K1.selected().forEach(o => { orig[o.id] = K1.clone(o); });
    if (!orig[id]) { const o = K1.getObj(id); if (o) orig[o.id] = K1.clone(o); }
    drag = { start: pt, orig, moved: false, startClient: [e.clientX, e.clientY], primary: id };
  }

  function startHandle(el, pt) {
    const id = el.getAttribute('data-id'), h = el.getAttribute('data-handle');
    const o = K1.getObj(id);
    if (!o) return;
    mode = 'handle';
    drag = { id, h, start: pt, orig: K1.clone(o) };
    K1.begin();
  }

  /* -------------------------------------------------------------- pointer move */
  function onMove(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    p.cx = e.clientX; p.cy = e.clientY;
    const pt = pitchPoint(e), spt = R().clientToScreen(e.clientX, e.clientY);
    p.pt = pt; p.spt = spt;
    if (mode === 'pinch') { updatePinch(); return; }
    if (!mode || !drag) return;
    if (longPress && drag.startClient && Math.hypot(e.clientX - drag.startClient[0], e.clientY - drag.startClient[1]) > 8) clearLongPress();
    if (longPress && drag.start && mode === 'marquee' && Math.hypot(e.clientX - drag.start[0], e.clientY - drag.start[1]) > 8) clearLongPress();

    switch (mode) {
      case 'pan': R().panBy(spt[0] - drag.last[0], spt[1] - drag.last[1]); drag.last = R().clientToScreen(e.clientX, e.clientY); R().renderUI(); return;
      case 'stamp': { if (Math.hypot(e.clientX - drag.start[0], e.clientY - drag.start[1]) > 6) drag.moved = true; drag.pt = pt; R().ui.stampHint = pt; R().renderUI(); return; }
      case 'drag': {
        if (!drag.moved) { if (Math.hypot(e.clientX - drag.startClient[0], e.clientY - drag.startClient[1]) < 4) return; drag.moved = true; K1.begin(); clearLongPress(); }
        let dx = pt[0] - drag.start[0], dy = pt[1] - drag.start[1];
        if (K1.settings.snap && drag.primary && drag.orig[drag.primary] && drag.orig[drag.primary].x != null) {
          const o = drag.orig[drag.primary];
          const sn = K1.snapPt(o.x + dx, o.y + dy);
          dx = sn[0] - o.x; dy = sn[1] - o.y;
        }
        const objs = K1.objects();
        Object.keys(drag.orig).forEach(id => {
          const o = objs.find(x => x.id === id); if (!o) return;
          const base = drag.orig[id];
          Object.assign(o, K1.clone(base));
          K1.translateObj(o, dx, dy);
          clampToPitch(o);
        });
        R().renderObjects(); R().renderUI();
        return;
      }
      case 'marquee': {
        drag.x1 = spt[0]; drag.y1 = spt[1];
        if (Math.hypot(e.clientX - drag.start[0], e.clientY - drag.start[1]) > 6) drag.moved = true;
        if (drag.moved) { R().ui.marquee = { x0: drag.x0, y0: drag.y0, x1: drag.x1, y1: drag.y1 }; R().renderUI(); }
        return;
      }
      case 'draw': {
        const o = drag.obj;
        if (o.type === 'path' && o.geo === 'free') { const last = o.points[o.points.length - 1]; if (dist(last, pt) > .25) o.points.push(pt); }
        else if (o.type === 'path' || o.type === 'measure') {
          o.points[1] = K1.snapPt(pt[0], pt[1]);
          if (o.geo === 'curve') { const a = o.points[0], b = o.points[1]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const dx = b[0] - a[0], dy = b[1] - a[1]; o.ctrl = [mx - dy * .3, my + dx * .3]; }
        } else if (o.type === 'shape') {
          const s = drag.start; const q = K1.snapPt(pt[0], pt[1]);
          o.x = (s[0] + q[0]) / 2; o.y = (s[1] + q[1]) / 2; o.w = Math.abs(q[0] - s[0]); o.h = Math.abs(q[1] - s[1]);
          if (e.shiftKey) { const m = Math.max(o.w, o.h); o.w = m; o.h = m; }
        }
        R().renderUI();
        return;
      }
      case 'handle': {
        const o = K1.getObj(drag.id); if (!o) return;
        const q = K1.snapPt(pt[0], pt[1]);
        if (drag.h === 'p0') { if (o.type === 'offside') o.x = q[0]; else o.points[0] = q; }
        else if (drag.h === 'p1') o.points[o.points.length - 1] = q;
        else if (drag.h === 'ctrl') o.ctrl = q;
        else if (drag.h === 'rot') { o.rot = Math.round((Math.atan2(pt[1] - o.y, pt[0] - o.x) * 180 / Math.PI + 90) / (e.shiftKey ? 15 : 1)) * (e.shiftKey ? 15 : 1); }
        else if (['nw', 'ne', 'sw', 'se'].includes(drag.h) && o.type === 'shape') {
          const b = drag.orig; const x0 = b.x - b.w / 2, y0 = b.y - b.h / 2, x1 = b.x + b.w / 2, y1 = b.y + b.h / 2;
          let nx0 = x0, ny0 = y0, nx1 = x1, ny1 = y1;
          if (drag.h.includes('w')) nx0 = q[0]; if (drag.h.includes('e')) nx1 = q[0];
          if (drag.h.includes('n')) ny0 = q[1]; if (drag.h.includes('s')) ny1 = q[1];
          o.x = (nx0 + nx1) / 2; o.y = (ny0 + ny1) / 2; o.w = Math.max(.5, Math.abs(nx1 - nx0)); o.h = Math.max(.5, Math.abs(ny1 - ny0));
        }
        R().renderObjects(); R().renderUI();
        return;
      }
      case 'erase': {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        eraseId(objIdFromTarget(el));
        return;
      }
    }
  }

  function eraseId(id) {
    if (!id || !drag || drag.erased.has(id)) return;
    drag.erased.add(id);
    K1.begin();
    const fr = K1.frame();
    fr.objects = fr.objects.filter(o => o.id !== id);
    S.selection.delete(id);
    R().renderObjects(); R().renderUI();
  }

  /* ---------------------------------------------------------------- pointer up */
  function onUp(e) {
    const had = pointers.has(e.pointerId);
    pointers.delete(e.pointerId);
    try { svg.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    clearLongPress();
    svg.classList.remove('panning');
    if (mode === 'pinch') { if (pointers.size < 2) { mode = null; pinch = null; drag = null; } return; }
    if (!had || !mode) { mode = null; drag = null; return; }
    const pt = pitchPoint(e);
    const now = performance.now();
    switch (mode) {
      case 'stamp': {
        if (e.type === 'pointercancel') break;
        placeStamp(drag.moved ? drag.pt : pt);
        break;
      }
      case 'drag': {
        if (drag.moved) { K1.commit('move'); K1.haptic(6); }
        else {
          // click without movement → double-tap detection
          const id = drag.primary;
          if (id && lastTap.id === id && now - lastTap.t < 380) { lastTap = { t: 0 }; K1.UI && K1.UI.quickEdit(id); }
          else lastTap = { t: now, id, x: e.clientX, y: e.clientY };
        }
        break;
      }
      case 'marquee': {
        if (drag.moved) { const ids = R().objectsInRect(drag.x0, drag.y0, drag.x1, drag.y1); K1.select(ids, { add: drag.add }); }
        R().ui.marquee = null;
        break;
      }
      case 'draw': {
        const o = drag.obj;
        R().ui.temp = null;
        let ok = false;
        if (o.type === 'path') {
          if (o.geo === 'free') { ok = o.points.length > 2 && polyLen(o.points) > .8; o.points = o.points.map(p => [K1.round(p[0], 2), K1.round(p[1], 2)]); }
          else ok = dist(o.points[0], o.points[1]) > .7;
        } else if (o.type === 'measure') ok = dist(o.points[0], o.points[1]) > .5;
        else if (o.type === 'shape') { ok = o.w > .8 && o.h > .8; }
        if (ok) { K1.addObject(o, { select: o.type === 'shape' }); K1.haptic(6); }
        else if (o.type === 'shape' && !ok) { /* a tap with a shape tool: place a default-size shape */ const q = drag.start; o.x = q[0]; o.y = q[1]; o.w = o.kind === 'zone' ? 12 : 8; o.h = o.kind === 'zone' ? 8 : 6; K1.addObject(o, { select: true }); }
        break;
      }
      case 'text': { B.openTextEditor(drag.pt, drag.id); break; }
      case 'erase': { if (drag.erased.size) K1.commit('erase'); else K1.cancel(); break; }
      case 'handle': { K1.commit('edit'); break; }
    }
    mode = null; drag = null;
    R().renderUI();
  }
  function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]); return L; }

  /* ------------------------------------------------------------------- stamps */
  B.setStamp = function (stamp) {
    S.stamp = stamp;
    if (stamp) { S.tool = 'select'; svg.dataset.tool = 'stamp'; }
    else { svg.dataset.tool = S.tool; R().ui.stampHint = null; R().renderUI(); }
    K1.emit('stamp', stamp);
  };
  function placeStamp(pt) {
    const st = S.stamp; if (!st) return;
    const d = K1.dims();
    const x = K1.round(K1.clamp(pt[0], -3, d.L + 3), 2), y = K1.round(K1.clamp(pt[1], -3, d.W + 3), 2);
    const q = K1.snapPt(x, y);
    let o = null;
    if (st.kind === 'player') {
      const n = st.n != null ? st.n : K1.nextNumber(st.team, st.gk);
      o = K1.make.player(st.team, n, q[0], q[1], { gk: !!st.gk });
      if (st.name) o.name = st.name;
      else if (st.team === 'home' && K1.Squad) { const pl = K1.Squad.byNumber(n, K1.boardTeamId()); if (pl) o.name = pl.name.split(' ').pop(); }
      if (st.color) o.color = st.color;
    } else if (st.kind === 'ball') { o = K1.make.ball(q[0], q[1]); }
    else if (st.kind === 'ref') { o = K1.make.ref(q[0], q[1], { label: st.label || 'R' }); }
    else if (st.kind === 'equip') { o = K1.make.equip(st.sub, q[0], q[1], { color: st.color || undefined, rot: st.rot || 0 }); if (!st.color) o.color = st.sub === 'mannequin' ? '#facc15' : ['cone', 'disc', 'hurdle'].includes(st.sub) ? S.style.coneColor : '#f8fafc'; }
    else if (st.kind === 'text') { B.openTextEditor(q, null); B.setStamp(null); return; }
    if (!o) return;
    K1.addObject(o, { select: false });
    K1.haptic(8);
    // single-use stamps
    if (st.kind === 'ball' || st.kind === 'ref' || st.once || st.n != null) B.setStamp(null);
    R().ui.stampHint = null; R().renderUI();
  }
  B.placeStampAt = placeStamp;

  /** Drag from the tray: hold on a chip and drop onto the pitch, or tap to enter stamp mode. */
  B.beginTrayDrag = function (stamp, e) {
    const start = [e.clientX, e.clientY];
    let moved = false;
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML = stamp.html || '';
    ghost.style.display = 'none';
    document.body.appendChild(ghost);
    const move = ev => {
      if (!moved && Math.hypot(ev.clientX - start[0], ev.clientY - start[1]) > 8) { moved = true; ghost.style.display = ''; }
      if (moved) { ghost.style.transform = 'translate(' + (ev.clientX - 22) + 'px,' + (ev.clientY - 22) + 'px)'; const r = svg.getBoundingClientRect(); const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; ghost.classList.toggle('over', inside); }
    };
    const up = ev => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      ghost.remove();
      if (moved) {
        const r = svg.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
          S.stamp = Object.assign({}, stamp, { once: true });
          placeStamp(R().clientToPitch(ev.clientX, ev.clientY));
          S.stamp = null; svg.dataset.tool = S.tool; K1.emit('stamp', null);
        }
      } else {
        // tap → toggle stamp mode
        if (S.stamp && S.stamp.key === stamp.key) B.setStamp(null); else B.setStamp(stamp);
      }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  };

  /* ---------------------------------------------------------------- text edit */
  B.openTextEditor = function (pt, existingId) {
    const ed = document.getElementById('textEditor');
    const ta = ed.querySelector('textarea');
    const existing = existingId ? K1.getObj(existingId) : null;
    ed.hidden = false;
    const client = R().pitchToClient(pt[0], pt[1]);
    const wr = wrap.getBoundingClientRect();
    const left = K1.clamp(client[0] - wr.left - 120, 8, Math.max(8, wr.width - 248));
    const top = K1.clamp(client[1] - wr.top - 24, 8, Math.max(8, wr.height - 90));
    ed.style.left = left + 'px'; ed.style.top = top + 'px';
    ta.value = existing ? existing.text : '';
    ta.placeholder = 'Type a label… (Enter to place, Shift+Enter for a new line)';
    let done = false;
    const finish = commit => {
      if (done) return; done = true;
      ed.hidden = true;
      const val = ta.value.trim();
      if (commit && val) {
        if (existing) K1.updateObjects(existing.id, { text: val }, 'text');
        else { const o = K1.make.text(K1.round(pt[0], 2), K1.round(pt[1], 2), val); K1.addObject(o, { select: true }); }
      } else if (commit && !val && existing) K1.removeObjects(existing.id);
      ta.onkeydown = null; ta.onblur = null;
      if (S.tool === 'text' && !K1.isTouch()) return;
    };
    ta.onkeydown = ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); finish(true); } else if (ev.key === 'Escape') { ev.preventDefault(); finish(false); } };
    ta.onblur = () => setTimeout(() => finish(true), 80);
    ed.querySelector('.te-ok').onclick = () => finish(true);
    ed.querySelector('.te-cancel').onclick = () => finish(false);
    setTimeout(() => { ta.focus(); ta.select(); }, 20);
  };

  /* ------------------------------------------------------------------- zoom */
  function onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    R().zoomAt(factor, e.clientX, e.clientY);
  }
  function startPinch() {
    mode = 'pinch'; drag = null; R().ui.temp = null; R().ui.marquee = null; clearLongPress();
    const ps = Array.from(pointers.values());
    pinch = { dist: Math.hypot(ps[0].cx - ps[1].cx, ps[0].cy - ps[1].cy), mid: [(ps[0].cx + ps[1].cx) / 2, (ps[0].cy + ps[1].cy) / 2] };
    R().renderUI();
  }
  function updatePinch() {
    const ps = Array.from(pointers.values());
    if (ps.length < 2 || !pinch) return;
    const d = Math.hypot(ps[0].cx - ps[1].cx, ps[0].cy - ps[1].cy);
    const mid = [(ps[0].cx + ps[1].cx) / 2, (ps[0].cy + ps[1].cy) / 2];
    if (pinch.dist > 0) R().zoomAt(d / pinch.dist, mid[0], mid[1]);
    const a = R().clientToScreen(pinch.mid[0], pinch.mid[1]), b = R().clientToScreen(mid[0], mid[1]);
    R().panBy(b[0] - a[0], b[1] - a[1]);
    pinch.dist = d; pinch.mid = mid;
  }

  /* ---------------------------------------------------------------- context */
  function onContext(e) {
    e.preventDefault();
    const id = objIdFromTarget(e.target);
    if (id) { if (!S.selection.has(id)) K1.select(id); K1.UI && K1.UI.contextMenuFor(id, e.clientX, e.clientY); }
    else K1.UI && K1.UI.boardContextMenu(pitchPoint(e), e.clientX, e.clientY);
  }

  /* --------------------------------------------------------------- editing */
  B.deleteSelection = function () { if (S.selection.size) { K1.removeObjects(Array.from(S.selection)); K1.haptic(10); } };
  B.duplicateSelection = function () {
    const sel = K1.selected(); if (!sel.length) return;
    K1.begin();
    const ids = [];
    sel.forEach(o => { const c = K1.clone(o); c.id = K1.uid(o.type === 'player' ? 'p' : 'o'); K1.translateObj(c, 2, 2); if (c.type === 'player' && c.team !== 'ref') c.n = K1.nextNumber(c.team, false); K1.objects().push(c); ids.push(c.id); });
    K1.commit('duplicate');
    K1.select(ids);
  };
  B.copy = function () { B.clipboard = K1.clone(K1.selected()); if (B.clipboard.length) K1.UI && K1.UI.toast('Copied ' + B.clipboard.length + ' object' + (B.clipboard.length > 1 ? 's' : '')); };
  B.paste = function () {
    if (!B.clipboard.length) return;
    K1.begin();
    const ids = [];
    B.clipboard.forEach(o => {
      const c = K1.clone(o);
      const exists = K1.getObj(c.id);
      if (exists) { c.id = K1.uid('o'); K1.translateObj(c, 2, 2); }
      K1.objects().push(c); ids.push(c.id);
    });
    K1.commit('paste');
    K1.select(ids);
  };
  B.nudge = function (dx, dy) {
    const sel = K1.selected(); if (!sel.length) return;
    K1.begin(); sel.forEach(o => { K1.translateObj(o, dx, dy); clampToPitch(o); }); K1.commit('nudge');
  };
  B.bringToFront = function (id) { K1.begin(); const fr = K1.frame(); const i = fr.objects.findIndex(o => o.id === id); if (i >= 0) { const [o] = fr.objects.splice(i, 1); fr.objects.push(o); } K1.commit('order'); };
  B.sendToBack = function (id) { K1.begin(); const fr = K1.frame(); const i = fr.objects.findIndex(o => o.id === id); if (i >= 0) { const [o] = fr.objects.splice(i, 1); fr.objects.unshift(o); } K1.commit('order'); };
  B.selectAll = function () { K1.select(K1.objects().map(o => o.id)); };
  B.rotateSelection = function (deg) { const sel = K1.selected().filter(o => o.type === 'equip' || o.type === 'shape'); if (!sel.length) return; K1.begin(); sel.forEach(o => { o.rot = ((o.rot || 0) + deg) % 360; }); K1.commit('rotate'); };

  /* -------------------------------------------------------------- keyboard */
  function onKey(e) {
    if (isTyping()) return;
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    // board shortcuts only apply on the board; other sections keep Escape for closing overlays
    if (K1.UI && K1.UI.section && K1.UI.section !== 'board' && !S.presenting) { if (k === 'escape') K1.UI.closeOverlays(); return; }
    if (e.code === 'Space' && !mod) { if (S.presenting || K1.S.doc.frames.length > 1 && !S.selection.size && e.target === document.body) { e.preventDefault(); K1.Anim.toggle(); return; } spaceDown = true; svg.classList.add('panning'); e.preventDefault(); return; }
    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) K1.redo(); else K1.undo(); return; }
    if (mod && k === 'y') { e.preventDefault(); K1.redo(); return; }
    if (mod && k === 'd') { e.preventDefault(); B.duplicateSelection(); return; }
    if (mod && k === 'a') { e.preventDefault(); B.selectAll(); return; }
    if (mod && k === 'c') { e.preventDefault(); B.copy(); return; }
    if (mod && k === 'v') { e.preventDefault(); B.paste(); return; }
    if (mod && k === 's') { e.preventDefault(); K1.Store.saveCurrent(); return; }
    if (mod && k === 'e') { e.preventDefault(); K1.Store.exportPNG(); return; }
    if (mod) return;
    if (S.presenting) {
      if (k === 'arrowright' || k === 'pagedown') { e.preventDefault(); K1.Anim.next(); return; }
      if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); K1.Anim.prev(); return; }
      if (k === 'escape') { K1.UI.togglePresent(false); return; }
      if (k === 'f') { K1.UI.togglePresent(false); return; }
      return;
    }
    switch (k) {
      case 'delete': case 'backspace': e.preventDefault(); B.deleteSelection(); return;
      case 'escape': if (S.stamp) B.setStamp(null); else if (S.selection.size) K1.clearSelection(); else K1.UI && K1.UI.closeOverlays(); K1.setTool('select'); return;
      case 'arrowup': e.preventDefault(); B.nudge(0, e.shiftKey ? -2.5 : -.5); return;
      case 'arrowdown': e.preventDefault(); B.nudge(0, e.shiftKey ? 2.5 : .5); return;
      case 'arrowleft': e.preventDefault(); if (S.selection.size) B.nudge(e.shiftKey ? -2.5 : -.5, 0); else K1.Anim.prev(); return;
      case 'arrowright': e.preventDefault(); if (S.selection.size) B.nudge(e.shiftKey ? 2.5 : .5, 0); else K1.Anim.next(); return;
      case '[': K1.Anim.prev(); return;
      case ']': K1.Anim.next(); return;
      case 'n': K1.Anim.addFrame(); return;
      case 'v': K1.setTool('select'); return;
      case 'h': K1.setTool('hand'); return;
      case 'p': K1.setTool('pen'); return;
      case 'l': K1.setTool('line'); return;
      case 'a': K1.setTool('pass'); return;
      case 'r': if (e.shiftKey) { B.rotateSelection(15); return; } K1.setTool('run'); return;
      case 'd': K1.setTool('dribble'); return;
      case 's': K1.setTool('shot'); return;
      case 'c': K1.setTool('curve'); return;
      case 'b': K1.setTool('rect'); return;
      case 'o': K1.setTool('ellipse'); return;
      case 'z': K1.setTool('zone'); return;
      case 't': K1.setTool('text'); return;
      case 'e': K1.setTool('eraser'); return;
      case 'm': K1.setTool('measure'); return;
      case 'i': K1.setTool('offside'); return;
      case 'f': K1.UI && K1.UI.togglePresent(true); return;
      case 'g': K1.saveSettings({ snap: !K1.settings.snap }); K1.UI && K1.UI.toast('Snap to grid ' + (K1.settings.snap ? 'on' : 'off')); return;
      case '+': case '=': R().zoomAt(1.25); return;
      case '-': R().zoomAt(1 / 1.25); return;
      case '0': R().resetView(); return;
      case '?': K1.UI && K1.UI.showHelp(); return;
    }
  }

  K1.Board = B;
})(window.K1 = window.K1 || {});
