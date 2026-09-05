/* K1 Shooters Tactics Board — training session planner */
(function (K1) {
  'use strict';

  const SS = {};
  const KEY = () => K1.Store.KEYS.sessions;
  SS.TYPES = ['Warm-up', 'Technical', 'Possession', 'Tactical', 'Finishing', 'Physical', 'Set pieces', 'Game', 'Cool-down'];

  const B = (name, minutes, type, desc, drillId) => ({ id: K1.uid('bl'), name, minutes, type, desc: desc || '', drillId: drillId || null, boardId: null });

  SS.TEMPLATES = [
    { name: 'Pressing session', theme: 'Press as a unit · triggers · traps', blocks: [
      B('Dynamic warm-up', 12, 'Warm-up', 'Ladder, hurdles, ball weave, passing lane.', 'warmup_dynamic'),
      B('Rondo 4v2 — pressing focus', 12, 'Possession', 'Two defenders press together, cut the lane.', 'rondo_4v2'),
      B('Pressing trap · force it wide', 20, 'Tactical', 'Front three angle the press, jump on the pass to the full-back.', 'press_trap_433'),
      B('Transition game 4v4 + 2', 18, 'Game', 'Win it → outlet → attack within 3 passes.', 'transition_4v4_2'),
      B('Cool-down & review', 8, 'Cool-down', 'Stretch. Two questions: what was our trigger? what did we do after winning it?'),
    ] },
    { name: 'Possession & positional play', theme: 'Triangles · third man · five lanes', blocks: [
      B('Warm-up with the ball', 10, 'Warm-up', 'Pairs passing, movement patterns.', 'warmup_dynamic'),
      B('Double rondo 5v2 → transfer', 15, 'Possession', 'Recognise the moment to switch.', 'rondo_5v2_transition'),
      B('Y-passing pattern', 12, 'Technical', 'Third-man ball, check away before receiving.', 'y_passing'),
      B('Positional game 4v4 + 3', 18, 'Possession', 'Score by 10 passes or neutral-to-neutral switch.', 'positional_4v4_3'),
      B('Free play 7v7', 15, 'Game', 'Two-touch in our half, free in theirs.'),
      B('Cool-down', 6, 'Cool-down', ''),
    ] },
    { name: 'Finishing & final third', theme: 'Crosses · runs · first-time finishes', blocks: [
      B('Warm-up', 10, 'Warm-up', '', 'warmup_dynamic'),
      B('Overlap & cross pattern', 15, 'Technical', 'Time the overlap, three different runs.', 'overlap_pattern'),
      B('Finishing circuit · 3 stations', 20, 'Finishing', 'Wall pass · cross · turn & strike.', 'finishing_circuit'),
      B('Crossing & finishing vs back four', 20, 'Finishing', 'Deliver behind the line.', 'crossing_finishing_fullpitch'),
      B('Shooting competition', 8, 'Game', 'Two teams, alternate strikes, keeper counts.'),
      B('Cool-down', 6, 'Cool-down', ''),
    ] },
    { name: 'Set-piece rehearsal', theme: 'Corners · free kicks · throw-ins', blocks: [
      B('Warm-up', 10, 'Warm-up', ''),
      B('Attacking corners — 3 routines', 20, 'Set pieces', 'Near-post inswinger, far-post outswinger, short.'),
      B('Defending corners — zonal + posts', 15, 'Set pieces', 'Everyone owns a zone; attack the ball.'),
      B('Free kicks — direct & wide delivery', 15, 'Set pieces', 'Wall at 9.15 m; runners hold the line.'),
      B('Throw-in routine', 8, 'Set pieces', 'Line · short · behind.'),
      B('Game with set-piece bonus', 15, 'Game', 'Goals from set pieces count double.'),
    ] },
    { name: 'Match day −1 (MD-1)', theme: 'Sharp, short, confident', blocks: [
      B('Activation', 10, 'Warm-up', 'Low volume, high quality.'),
      B('Rondo 4v2', 8, 'Possession', 'One touch, quick feet.', 'rondo_4v2'),
      B('Shape walkthrough (shadow play)', 15, 'Tactical', 'Slide the block; set-piece roles confirmed.', 'def_shape_shadow'),
      B('Finishing — quick strikes', 10, 'Finishing', 'Confidence in front of goal.'),
      B('Set-piece reminders', 8, 'Set pieces', 'Corners + free kicks, walk through roles.'),
      B('Team talk', 5, 'Cool-down', 'Three key messages for tomorrow.'),
    ] },
  ];

  let cache = null;
  SS.list = function () { if (!cache) cache = K1.Store.get(KEY(), []); return cache; };
  SS.save = function () { K1.Store.set(KEY(), cache); K1.emit('sessions', cache); };
  SS.create = function (opts) {
    opts = opts || {};
    const teamId = opts.teamId !== undefined ? opts.teamId : (K1.Teams ? K1.Teams.activeId() : null);
    const team = teamId && K1.Teams ? K1.Teams.get(teamId) : null;
    const s = { id: K1.uid('ss'), title: opts.title || (team ? team.name + ' session' : 'New session'), date: opts.date || new Date().toISOString().slice(0, 10), theme: opts.theme || '', teamId: team ? team.id : null, group: opts.group || (team ? team.name : 'First team'), blocks: (opts.blocks || []).map(b => Object.assign({}, b, { id: K1.uid('bl') })), notes: '', createdAt: Date.now() };
    SS.list().unshift(s);
    SS.save();
    return s;
  };
  SS.fromTemplate = function (t) { return SS.create({ title: t.name, theme: t.theme, blocks: t.blocks }); };
  SS.get = id => SS.list().find(s => s.id === id);
  SS.update = function (id, patch) { const s = SS.get(id); if (s) { Object.assign(s, patch); SS.save(); } return s; };
  SS.remove = function (id) { cache = SS.list().filter(s => s.id !== id); SS.save(); };
  SS.addBlock = function (id, block) { const s = SS.get(id); if (!s) return; s.blocks.push(Object.assign({ id: K1.uid('bl'), name: 'New block', minutes: 10, type: 'Technical', desc: '', drillId: null, boardId: null }, block || {})); SS.save(); };
  SS.updateBlock = function (id, bid, patch) { const s = SS.get(id); if (!s) return; const b = s.blocks.find(x => x.id === bid); if (b) { Object.assign(b, patch); SS.save(); } };
  SS.removeBlock = function (id, bid) { const s = SS.get(id); if (!s) return; s.blocks = s.blocks.filter(b => b.id !== bid); SS.save(); };
  SS.moveBlock = function (id, bid, dir) { const s = SS.get(id); if (!s) return; const i = s.blocks.findIndex(b => b.id === bid); const j = i + dir; if (i < 0 || j < 0 || j >= s.blocks.length) return; const [b] = s.blocks.splice(i, 1); s.blocks.splice(j, 0, b); SS.save(); };
  SS.total = s => s.blocks.reduce((t, b) => t + (Number(b.minutes) || 0), 0);

  /* ---------------------------------------------------------- attendance */
  // attendance: { [squadPlayerId]: 'present' | 'absent' | 'late' | 'injured' }
  SS.ATTENDANCE = [['present', 'Present'], ['late', 'Late'], ['injured', 'Injured'], ['absent', 'Absent']];
  /** Players a session is about: its team's players, or the whole club for sessions without a team. */
  SS.playersOf = function (s) { if (!K1.Squad) return []; return s && s.teamId ? K1.Squad.sorted(s.teamId) : K1.Squad.sorted(null); };
  SS.setAttendance = function (id, playerId, status) { const s = SS.get(id); if (!s) return; s.attendance = s.attendance || {}; if (status) s.attendance[playerId] = status; else delete s.attendance[playerId]; SS.save(); };
  SS.markAll = function (id, status) { const s = SS.get(id); if (!s || !K1.Squad) return; s.attendance = {}; SS.playersOf(s).forEach(p => { s.attendance[p.id] = status; }); SS.save(); };
  SS.attendanceSummary = function (s) {
    const att = s.attendance || {};
    const squad = SS.playersOf(s);
    const counts = { present: 0, late: 0, injured: 0, absent: 0, unmarked: 0 };
    squad.forEach(p => { const v = att[p.id]; if (v && counts[v] != null) counts[v]++; else counts.unmarked++; });
    return Object.assign({ squad: squad.length, there: counts.present + counts.late }, counts);
  };
  /** Attendance % per player across the sessions (of one team, or all) that recorded attendance. */
  SS.attendanceRates = function (teamId) {
    const squad = K1.Squad ? (teamId ? K1.Squad.forTeam(teamId) : K1.Squad.list()) : [];
    const sessions = SS.list().filter(s => s.attendance && Object.keys(s.attendance).length && (teamId == null || (s.teamId || null) === teamId));
    return squad.map(p => { let there = 0, marked = 0; sessions.forEach(s => { const v = s.attendance[p.id]; if (v) { marked++; if (v === 'present' || v === 'late') there++; } }); return { id: p.id, name: p.name, n: p.n, marked, there, pct: marked ? Math.round(there / marked * 100) : null }; });
  };

  /** Printable HTML for a session plan. */
  SS.printHTML = function (s) {
    const esc = K1.esc;
    const drills = K1.DRILLS || [];
    let rows = '';
    let t = 0;
    s.blocks.forEach((b, i) => {
      const drill = b.drillId ? drills.find(d => d.id === b.drillId) : null;
      rows += '<tr><td class="n">' + (i + 1) + '</td><td class="t">' + t + '–' + (t + Number(b.minutes || 0)) + '′<br><small>' + esc(b.minutes) + ' min</small></td><td><b>' + esc(b.name) + '</b><div class="type">' + esc(b.type) + '</div><div class="desc">' + esc(b.desc || (drill ? drill.desc : '')) + '</div>' + (drill && drill.coaching ? '<ul>' + drill.coaching.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '') + (drill ? '<div class="eq">' + esc(drill.players || '') + (drill.equipment ? ' · ' + esc(drill.equipment) : '') + '</div>' : '') + '</td></tr>';
      t += Number(b.minutes) || 0;
    });
    let attendance = '';
    if (s.attendance && Object.keys(s.attendance).length && K1.Squad) {
      const byStatus = {};
      SS.playersOf(s).forEach(p => { const v = s.attendance[p.id]; if (v) (byStatus[v] = byStatus[v] || []).push(p.n + ' ' + p.name); });
      attendance = '<div class="att"><b>Attendance</b> ' + SS.ATTENDANCE.filter(a => byStatus[a[0]]).map(a => '<div><span class="type">' + a[1] + ' · ' + byStatus[a[0]].length + '</span> ' + esc(byStatus[a[0]].join(', ')) + '</div>').join('') + '</div>';
    }
    const logo = K1.logoHTML ? K1.logoHTML(72) : K1.LOGO.badge({ size: 72 });
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(s.title) + '</title><style>body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#111;margin:32px;max-width:900px}h1{margin:0;font-size:26px}.meta{color:#555;margin:4px 0 18px}table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:10px 8px;border-top:1px solid #ddd}td.n{width:28px;font-weight:800;color:#888}td.t{width:90px;font-weight:700}.type{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;background:#131c21;color:#fff;padding:2px 6px;border-radius:4px;margin:4px 0}.desc{color:#333}ul{margin:6px 0 0;padding-left:18px;color:#333}.eq{color:#777;font-size:12px;margin-top:4px}.head{display:flex;align-items:center;gap:16px}.head img,.head svg{width:72px;height:72px;border-radius:50%}.total{margin-top:14px;font-weight:700}.notes{margin-top:18px;white-space:pre-wrap;color:#333}.att{margin-top:16px;color:#333;font-size:13px}.att div{margin-top:4px}@media print{body{margin:12mm}}</style></head><body><div class="head">' + logo + '<div><h1>' + esc(s.title) + '</h1><div class="meta">' + esc(s.date) + (s.group ? ' · ' + esc(s.group) : '') + (s.theme ? ' · ' + esc(s.theme) : '') + '</div></div></div><table>' + rows + '</table><div class="total">Total: ' + SS.total(s) + ' minutes</div>' + attendance + (s.notes ? '<div class="notes">' + esc(s.notes) + '</div>' : '') + '<p style="color:#999;font-size:12px;margin-top:30px">K1 Shooters Football Academy · Tactics Board</p><script>setTimeout(function(){window.print()},300)</script></body></html>';
  };

  K1.Sessions = SS;
})(window.K1 = window.K1 || {});
