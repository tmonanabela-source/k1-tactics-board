/* K1 Shooters Tactics Board — competitions: host a league, a group-stage tournament or a knockout cup */
(function (K1) {
  'use strict';

  const C = {};
  const KEY = () => K1.Store.KEYS.competitions;
  const esc = s => K1.esc(s);

  C.TYPES = [['league', 'League · round robin'], ['groups', 'Tournament · groups + knockout'], ['knockout', 'Knockout cup']];
  C.STAGES = { league: 'League', group: 'Group stage', r64: 'Round of 64', r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-finals', sf: 'Semi-finals', third: 'Third-place match', final: 'Final' };
  const STAGE_ORDER = ['league', 'group', 'r64', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];
  C.stageIndex = s => STAGE_ORDER.indexOf(s);

  const DEFAULT_SETTINGS = { pointsWin: 3, pointsDraw: 1, pointsLoss: 0, legs: 1, matchMinutes: 20, breakMinutes: 5, pitches: 2, startTime: '09:00', groupsCount: 2, advancePerGroup: 2, thirdPlace: true, knockoutGap: 15 };

  /* --------------------------------------------------------------- storage */
  let cache = null;
  C.list = function () { if (!cache) cache = K1.Store.get(KEY(), []); return cache; };
  C.save = function () { K1.Store.set(KEY(), cache); K1.emit('comps'); };
  C.get = id => C.list().find(c => c.id === id) || null;
  C.create = function (opts) {
    opts = opts || {};
    const c = { id: K1.uid('cp'), name: opts.name || 'New competition', type: opts.type || 'league', ageGroup: opts.ageGroup || '', date: opts.date || new Date().toISOString().slice(0, 10), venue: opts.venue || '', notes: '', status: 'setup', settings: Object.assign({}, DEFAULT_SETTINGS, opts.settings || {}), teams: [], groups: [], matches: [], createdAt: Date.now() };
    C.list().unshift(c); C.save();
    return c;
  };
  C.update = function (id, patch) { const c = C.get(id); if (c) { Object.assign(c, patch); C.save(); } return c; };
  C.updateSettings = function (id, patch) { const c = C.get(id); if (c) { Object.assign(c.settings, patch); C.save(); } return c; };
  C.remove = function (id) { cache = C.list().filter(c => c.id !== id); C.save(); };

  /* ----------------------------------------------------------------- teams */
  const shortName = name => { const w = String(name).trim().split(/\s+/); return (w.length > 1 ? w.map(x => x[0]).join('').slice(0, 3) : String(name).slice(0, 3)).toUpperCase(); };
  const COLORS = ['#f5b301', '#e11d2e', '#1d4ed8', '#16a34a', '#f97316', '#7c3aed', '#38bdf8', '#ec4899', '#facc15', '#14b8a6', '#a3e635', '#fb7185', '#94a3b8', '#ffffff', '#111827', '#c084fc'];
  C.addTeam = function (id, name, extra) {
    const c = C.get(id); if (!c) return null;
    const t = Object.assign({ id: K1.uid('ct'), name: String(name).trim() || 'Team ' + (c.teams.length + 1), short: shortName(name), color: COLORS[c.teams.length % COLORS.length], teamId: null, groupId: null }, extra || {});
    c.teams.push(t); C.save();
    return t;
  };
  C.addTeams = function (id, text) { const names = String(text).split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean); names.forEach(n => C.addTeam(id, n)); return names.length; };
  C.updateTeam = function (id, tid, patch) { const c = C.get(id); const t = c && c.teams.find(x => x.id === tid); if (t) { Object.assign(t, patch); if (patch.name) t.short = shortName(patch.name); C.save(); } return t; };
  C.removeTeam = function (id, tid) { const c = C.get(id); if (!c) return; c.teams = c.teams.filter(t => t.id !== tid); c.groups.forEach(g => { g.teamIds = g.teamIds.filter(x => x !== tid); }); c.matches = c.matches.filter(m => m.homeId !== tid && m.awayId !== tid); C.save(); };
  C.team = (c, tid) => c.teams.find(t => t.id === tid) || null;
  C.teamName = function (c, tid, m, side) {
    if (tid) { const t = C.team(c, tid); return t ? t.name : '?'; }
    if (m && m.bye) return 'BYE';
    if (m && (side === 'home' ? m.fromHome : m.fromAway)) { const from = c.matches.find(x => x.id === (side === 'home' ? m.fromHome : m.fromAway)); return (m.losers ? 'Loser of ' : 'Winner of ') + (from ? C.matchLabel(c, from) : '?'); }
    return 'TBD';
  };
  C.isOurs = (c, tid) => { const t = C.team(c, tid); return !!(t && t.teamId && K1.Teams && K1.Teams.get(t.teamId)); };
  C.matchLabel = (c, m) => (C.STAGES[m.stage] || m.stage) + (m.stage === 'group' || m.stage === 'league' ? ' R' + m.round : (m.slot != null ? ' ' + (m.slot + 1) : ''));

  /* ---------------------------------------------------------------- groups */
  C.assignGroups = function (id, count, shuffle) {
    const c = C.get(id); if (!c) return;
    const ids = c.teams.map(t => t.id);
    if (shuffle) for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    count = Math.max(1, Math.min(count || c.settings.groupsCount || 2, ids.length));
    c.groups = Array.from({ length: count }, (_, i) => ({ id: K1.uid('cg'), name: 'Group ' + String.fromCharCode(65 + i), teamIds: [] }));
    ids.forEach((tid, i) => { c.groups[i % count].teamIds.push(tid); });
    c.teams.forEach(t => { const g = c.groups.find(x => x.teamIds.includes(t.id)); t.groupId = g ? g.id : null; });
    c.settings.groupsCount = count;
    C.save();
  };
  C.moveToGroup = function (id, tid, gid) { const c = C.get(id); if (!c) return; c.groups.forEach(g => { g.teamIds = g.teamIds.filter(x => x !== tid); }); const g = c.groups.find(x => x.id === gid); if (g) g.teamIds.push(tid); const t = C.team(c, tid); if (t) t.groupId = g ? g.id : null; C.save(); };

  /* -------------------------------------------------------------- fixtures */
  /** Circle-method round robin. Returns rounds of [homeId, awayId] pairs. */
  C.roundRobin = function (ids, legs) {
    const t = ids.slice(); if (t.length % 2) t.push(null);
    const n = t.length; const rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const pairs = [];
      for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; if (a && b) pairs.push((r + i) % 2 === 0 ? [a, b] : [b, a]); }
      rounds.push(pairs);
      t.splice(1, 0, t.pop());
    }
    if (legs === 2) rounds.slice().forEach(rd => rounds.push(rd.map(p => [p[1], p[0]])));
    return rounds;
  };

  function newMatch(stage, round, homeId, awayId, extra) {
    return Object.assign({ id: K1.uid('cm'), stage, round, groupId: null, homeId: homeId || null, awayId: awayId || null, homeScore: null, awayScore: null, pensHome: null, pensAway: null, played: false, time: '', pitch: null, scorers: '', notes: '' }, extra || {});
  }

  C.generateFixtures = function (id) {
    const c = C.get(id); if (!c || c.teams.length < 2) return false;
    c.matches = [];
    if (c.type === 'league') {
      C.roundRobin(c.teams.map(t => t.id), c.settings.legs).forEach((rd, r) => rd.forEach(p => c.matches.push(newMatch('league', r + 1, p[0], p[1]))));
    } else if (c.type === 'groups') {
      if (!c.groups.length) C.assignGroups(id, c.settings.groupsCount, false);
      const perGroup = c.groups.map(g => ({ g, rounds: C.roundRobin(g.teamIds, c.settings.legs) }));
      const maxRounds = Math.max.apply(null, perGroup.map(x => x.rounds.length));
      for (let r = 0; r < maxRounds; r++) perGroup.forEach(x => (x.rounds[r] || []).forEach(p => c.matches.push(newMatch('group', r + 1, p[0], p[1], { groupId: x.g.id }))));
    } else {
      C.buildBracket(c, c.teams.map(t => t.id), { thirdPlace: c.settings.thirdPlace });
    }
    c.status = 'live';
    C.schedule(c);
    C.resolveBracket(c);
    C.save();
    return true;
  };

  /** Seeded single-elimination bracket; byes for the top seeds when the count is not a power of two. */
  C.buildBracket = function (c, seeds, opts) {
    opts = opts || {};
    const n = seeds.length;
    let size = 1; while (size < n) size *= 2;
    const stageFor = matches => (matches === 1 ? 'final' : matches === 2 ? 'sf' : matches === 4 ? 'qf' : matches === 8 ? 'r16' : matches === 16 ? 'r32' : 'r64');
    const rounds = Math.log2(size);
    // standard bracket placement so the top seeds sit in opposite halves (8 → 1v8, 4v5, 2v7, 3v6)
    let order = [1];
    while (order.length < size) { const s = order.length * 2 + 1; const next = []; order.forEach(x => next.push(x, s - x)); order = next; }
    let prev = [];
    for (let r = 0; r < rounds; r++) {
      const count = size / Math.pow(2, r + 1);
      const stage = stageFor(count);
      const cur = [];
      for (let i = 0; i < count; i++) {
        if (r === 0) {
          const home = seeds[order[2 * i] - 1] || null, away = seeds[order[2 * i + 1] - 1] || null;
          cur.push(newMatch(stage, r + 1, home, away, { slot: i, bye: !home || !away }));
        } else {
          cur.push(newMatch(stage, r + 1, null, null, { slot: i, fromHome: prev[2 * i].id, fromAway: prev[2 * i + 1].id }));
        }
      }
      cur.forEach(m => c.matches.push(m));
      prev = cur;
    }
    if (opts.thirdPlace && rounds >= 2) {
      const sfs = c.matches.filter(m => m.stage === 'sf');
      if (sfs.length === 2) c.matches.push(newMatch('third', rounds, null, null, { slot: 0, fromHome: sfs[0].id, fromAway: sfs[1].id, losers: true }));
    }
    // byes are decided immediately
    c.matches.forEach(m => { if (m.bye) m.played = true; });
  };

  C.winner = function (m) {
    if (!m) return null;
    if (m.bye) return m.homeId || m.awayId || null;
    if (!m.played || m.homeScore == null || m.awayScore == null) return null;
    if (m.homeScore !== m.awayScore) return m.homeScore > m.awayScore ? m.homeId : m.awayId;
    if (m.pensHome != null && m.pensAway != null && m.pensHome !== m.pensAway) return m.pensHome > m.pensAway ? m.homeId : m.awayId;
    return null;
  };
  C.loser = function (m) { const w = C.winner(m); if (!w) return null; return w === m.homeId ? m.awayId : m.homeId; };

  /** Fill later knockout rounds from earlier winners (and losers for the third-place match). */
  C.resolveBracket = function (c) {
    const byId = {}; c.matches.forEach(m => { byId[m.id] = m; });
    const sorted = c.matches.slice().sort((a, b) => C.stageIndex(a.stage) - C.stageIndex(b.stage) || a.round - b.round);
    sorted.forEach(m => {
      if (m.fromHome) { const src = byId[m.fromHome]; const t = m.losers ? C.loser(src) : C.winner(src); if (t !== m.homeId) { m.homeId = t; if (!t) { m.played = false; m.homeScore = m.awayScore = null; } } }
      if (m.fromAway) { const src = byId[m.fromAway]; const t = m.losers ? C.loser(src) : C.winner(src); if (t !== m.awayId) { m.awayId = t; if (!t) { m.played = false; m.homeScore = m.awayScore = null; } } }
    });
    const fin = c.matches.find(m => m.stage === 'final');
    if (fin && C.winner(fin)) c.status = 'done';
    else if (c.type === 'league' && c.matches.length && c.matches.every(m => m.played)) c.status = 'done';
    else if (c.matches.length) c.status = 'live';
  };
  C.champion = function (c) {
    if (c.type === 'league') { if (c.matches.length && c.matches.every(m => m.played)) { const st = C.standings(c, null); return st.length ? st[0].teamId : null; } return null; }
    const fin = c.matches.find(m => m.stage === 'final');
    return fin ? C.winner(fin) : null;
  };

  /* -------------------------------------------------------------- schedule */
  const toMin = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : 9 * 60; };
  const fromMin = v => String(Math.floor(v / 60) % 24).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
  /** Assign kick-off times and pitches round by round; parallel matches across pitches. */
  C.schedule = function (c) {
    const s = c.settings;
    const pitches = Math.max(1, Number(s.pitches) || 1);
    const slotDur = (Number(s.matchMinutes) || 20) + (Number(s.breakMinutes) || 0);
    let t = toMin(s.startTime);
    const order = c.matches.slice().sort((a, b) => C.stageIndex(a.stage) - C.stageIndex(b.stage) || a.round - b.round || (a.slot || 0) - (b.slot || 0));
    let lastKey = null, lastStage = null;
    let inSlot = 0;
    order.forEach(m => {
      if (m.bye) { m.time = ''; m.pitch = null; return; }
      const key = m.stage + ':' + m.round;
      if (key !== lastKey) {
        if (lastKey !== null) { t += slotDur; inSlot = 0; }
        if (lastStage && lastStage !== m.stage && (lastStage === 'group' || lastStage === 'league')) t += Number(s.knockoutGap) || 0;
        lastKey = key; lastStage = m.stage;
      }
      if (inSlot >= pitches) { t += slotDur; inSlot = 0; }
      m.time = fromMin(t); m.pitch = inSlot + 1; inSlot++;
    });
    c.endTime = fromMin(t + slotDur);
  };

  /* --------------------------------------------------------------- results */
  C.recordResult = function (id, mid, home, away, extra) {
    const c = C.get(id); const m = c && c.matches.find(x => x.id === mid); if (!m) return null;
    const h = home === '' || home == null ? null : Math.max(0, parseInt(home, 10) || 0);
    const a = away === '' || away == null ? null : Math.max(0, parseInt(away, 10) || 0);
    m.homeScore = h; m.awayScore = a; m.played = h != null && a != null;
    if (extra) { if (extra.pensHome !== undefined) m.pensHome = extra.pensHome === '' || extra.pensHome == null ? null : parseInt(extra.pensHome, 10); if (extra.pensAway !== undefined) m.pensAway = extra.pensAway === '' || extra.pensAway == null ? null : parseInt(extra.pensAway, 10); if (extra.scorers !== undefined) m.scorers = extra.scorers; if (extra.notes !== undefined) m.notes = extra.notes; }
    C.resolveBracket(c);
    C.save();
    return m;
  };
  C.updateMatch = function (id, mid, patch) { const c = C.get(id); const m = c && c.matches.find(x => x.id === mid); if (m) { Object.assign(m, patch); C.save(); } return m; };

  /* ------------------------------------------------------------- standings */
  C.standings = function (c, groupId) {
    const s = c.settings;
    const ids = groupId ? ((c.groups.find(g => g.id === groupId) || { teamIds: [] }).teamIds) : (c.type === 'league' ? c.teams.map(t => t.id) : c.teams.map(t => t.id));
    const rows = {}; ids.forEach(tid => { rows[tid] = { teamId: tid, name: C.teamName(c, tid), p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] }; });
    const relevant = c.matches.filter(m => m.played && !m.bye && (m.stage === 'league' || m.stage === 'group') && (!groupId || m.groupId === groupId) && rows[m.homeId] && rows[m.awayId]);
    relevant.forEach(m => {
      const H = rows[m.homeId], A = rows[m.awayId];
      H.p++; A.p++; H.gf += m.homeScore; H.ga += m.awayScore; A.gf += m.awayScore; A.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { H.w++; A.l++; H.pts += s.pointsWin; A.pts += s.pointsLoss; H.form.push('W'); A.form.push('L'); }
      else if (m.homeScore < m.awayScore) { A.w++; H.l++; A.pts += s.pointsWin; H.pts += s.pointsLoss; A.form.push('W'); H.form.push('L'); }
      else { H.d++; A.d++; H.pts += s.pointsDraw; A.pts += s.pointsDraw; H.form.push('D'); A.form.push('D'); }
    });
    Object.values(rows).forEach(r => { r.gd = r.gf - r.ga; r.form = r.form.slice(-5); });
    const h2h = (a, b) => { // points a took against b minus points b took against a
      let pa = 0, pb = 0;
      relevant.forEach(m => { if ((m.homeId === a.teamId && m.awayId === b.teamId) || (m.homeId === b.teamId && m.awayId === a.teamId)) { const aHome = m.homeId === a.teamId; const as = aHome ? m.homeScore : m.awayScore, bs = aHome ? m.awayScore : m.homeScore; if (as > bs) pa += s.pointsWin; else if (as < bs) pb += s.pointsWin; else { pa += s.pointsDraw; pb += s.pointsDraw; } } });
      return pb - pa;
    };
    const list = Object.values(rows).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || h2h(a, b) || a.name.localeCompare(b.name));
    list.forEach((r, i) => { r.pos = i + 1; });
    return list;
  };
  C.groupStageComplete = c => c.type === 'groups' && c.matches.some(m => m.stage === 'group') && c.matches.filter(m => m.stage === 'group').every(m => m.played);
  C.hasKnockout = c => c.matches.some(m => m.stage !== 'group' && m.stage !== 'league');

  /** After the group stage: build the knockout from group positions (A1 v B2 cross-over). */
  C.createKnockout = function (id) {
    const c = C.get(id); if (!c || c.type !== 'groups') return false;
    const adv = Math.max(1, Number(c.settings.advancePerGroup) || 1);
    const tables = c.groups.map(g => C.standings(c, g.id));
    const g = tables.length;
    let seeds = [];
    if (adv === 2 && g >= 2) {
      // winners paired with the next group's runner-up; bracket order keeps groups apart
      const W = tables.map(t => t[0] && t[0].teamId), R = tables.map(t => t[1] && t[1].teamId);
      const pairs = W.map((w, i) => [w, R[(i + 1) % g]]).filter(p => p[0] && p[1]);
      // lay pairs out so that seeds[i] meets seeds[size-1-i]
      const size = pairs.length * 2; seeds = new Array(size).fill(null);
      pairs.forEach((p, i) => { seeds[i] = p[0]; seeds[size - 1 - i] = p[1]; });
    } else {
      for (let pos = 0; pos < adv; pos++) tables.forEach(t => { if (t[pos]) seeds.push(t[pos].teamId); });
    }
    seeds = seeds.filter(Boolean);
    if (seeds.length < 2) return false;
    c.matches = c.matches.filter(m => m.stage === 'group');
    C.buildBracket(c, seeds, { thirdPlace: c.settings.thirdPlace });
    C.schedule(c);
    C.resolveBracket(c);
    C.save();
    return true;
  };

  /* ----------------------------------------------------------- top scorers */
  /** Scorers are typed per match as "Thabo 2, Lebo" or "Thabo x2; Lebo (K1)". */
  C.topScorers = function (c) {
    const tally = {};
    c.matches.forEach(m => {
      if (!m.scorers) return;
      String(m.scorers).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).forEach(tok => {
        const mm = /^(.*?)(?:\s*[x×]\s*(\d+)|\s+(\d+))?\s*$/.exec(tok);
        const name = (mm && mm[1] ? mm[1] : tok).replace(/\s+/g, ' ').trim();
        const n = mm ? parseInt(mm[2] || mm[3] || '1', 10) : 1;
        if (!name) return;
        const key = name.toLowerCase();
        tally[key] = tally[key] || { name, goals: 0 };
        tally[key].goals += n;
      });
    });
    return Object.values(tally).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  };

  /* --------------------------------------------------------------- exports */
  const pad = (s, n) => String(s).padEnd(n).slice(0, n);
  C.shareText = function (c) {
    const lines = [c.name.toUpperCase() + (c.ageGroup ? ' · ' + c.ageGroup : ''), (c.date || '') + (c.venue ? ' · ' + c.venue : ''), ''];
    const table = (rows, title) => {
      lines.push(title.toUpperCase()); lines.push(pad('#', 3) + pad('Team', 18) + ' P  W  D  L   GF  GA  GD  Pts');
      rows.forEach(r => lines.push(pad(r.pos, 3) + pad(r.name, 18) + ' ' + pad(r.p, 2) + ' ' + pad(r.w, 2) + ' ' + pad(r.d, 2) + ' ' + pad(r.l, 2) + '  ' + pad(r.gf, 3) + ' ' + pad(r.ga, 3) + ' ' + pad((r.gd > 0 ? '+' : '') + r.gd, 3) + ' ' + r.pts));
      lines.push('');
    };
    if (c.type === 'league') table(C.standings(c, null), 'Standings');
    if (c.type === 'groups') c.groups.forEach(g => table(C.standings(c, g.id), g.name));
    const played = c.matches.filter(m => m.played && !m.bye);
    if (played.length) { lines.push('RESULTS'); played.forEach(m => lines.push((m.time ? m.time + ' ' : '') + C.matchLabel(c, m) + ': ' + C.teamName(c, m.homeId) + ' ' + m.homeScore + '–' + m.awayScore + ' ' + C.teamName(c, m.awayId) + (m.pensHome != null && m.pensAway != null ? ' (' + m.pensHome + '–' + m.pensAway + ' pens)' : ''))); lines.push(''); }
    const next = c.matches.filter(m => !m.played && !m.bye).slice(0, 12);
    if (next.length) { lines.push('NEXT UP'); next.forEach(m => lines.push((m.time ? m.time + ' ' : '') + (m.pitch ? 'Pitch ' + m.pitch + ' · ' : '') + C.teamName(c, m.homeId, m, 'home') + ' v ' + C.teamName(c, m.awayId, m, 'away') + ' (' + C.matchLabel(c, m) + ')')); lines.push(''); }
    const ch = C.champion(c); if (ch) { lines.push('🏆 CHAMPIONS: ' + C.teamName(c, ch)); lines.push(''); }
    const sc = C.topScorers(c).slice(0, 5); if (sc.length) { lines.push('TOP SCORERS'); sc.forEach(s => lines.push(s.goals + ' — ' + s.name)); lines.push(''); }
    lines.push('— ' + (K1.settings.homeName || 'K1 Shooters') + ' · Tactics Board');
    return lines.join('\n');
  };

  C.printHTML = function (c) {
    const logo = K1.logoHTML ? K1.logoHTML(72) : '';
    const tableHTML = (rows, title) => '<h3>' + esc(title) + '</h3><table class="st"><tr><th>#</th><th class="l">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>' + rows.map(r => '<tr class="' + (C.isOurs(c, r.teamId) ? 'ours' : '') + '"><td>' + r.pos + '</td><td class="l">' + esc(r.name) + '</td><td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + (r.gd > 0 ? '+' : '') + r.gd + '</td><td><b>' + r.pts + '</b></td></tr>').join('') + '</table>';
    let body = '';
    if (c.type === 'league') body += tableHTML(C.standings(c, null), 'Standings');
    if (c.type === 'groups') c.groups.forEach(g => { body += tableHTML(C.standings(c, g.id), g.name); });
    const stages = []; c.matches.forEach(m => { const k = m.stage + ':' + m.round; if (!stages.includes(k)) stages.push(k); });
    stages.sort((a, b) => { const [sa, ra] = a.split(':'), [sb, rb] = b.split(':'); return C.stageIndex(sa) - C.stageIndex(sb) || (+ra) - (+rb); });
    body += '<h3>Fixtures & results</h3><table class="fx">';
    stages.forEach(k => { const [st, r] = k.split(':'); const ms = c.matches.filter(m => m.stage + ':' + m.round === k && !m.bye); if (!ms.length) return; body += '<tr class="rh"><td colspan="5">' + esc(C.STAGES[st] || st) + (st === 'league' || st === 'group' ? ' · Round ' + r : '') + '</td></tr>'; ms.forEach(m => { const g = m.groupId ? (c.groups.find(x => x.id === m.groupId) || {}).name : ''; body += '<tr><td class="t">' + esc(m.time || '') + (m.pitch ? '<br><small>Pitch ' + m.pitch + '</small>' : '') + '</td><td class="h">' + esc(C.teamName(c, m.homeId, m, 'home')) + '</td><td class="s">' + (m.played ? m.homeScore + ' – ' + m.awayScore + (m.pensHome != null && m.pensAway != null ? '<br><small>(' + m.pensHome + '–' + m.pensAway + ' pens)</small>' : '') : 'v') + '</td><td class="a">' + esc(C.teamName(c, m.awayId, m, 'away')) + '</td><td class="g">' + esc(g) + (m.scorers ? '<br><small>' + esc(m.scorers) + '</small>' : '') + '</td></tr>'; }); });
    body += '</table>';
    const ch = C.champion(c); if (ch) body += '<div class="champ">🏆 Champions: <b>' + esc(C.teamName(c, ch)) + '</b></div>';
    const sc = C.topScorers(c); if (sc.length) body += '<h3>Top scorers</h3><ol class="sc">' + sc.slice(0, 10).map(s => '<li><b>' + s.goals + '</b> ' + esc(s.name) + '</li>').join('') + '</ol>';
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(c.name) + '</title><style>body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#111;margin:28px;max-width:960px}.head{display:flex;align-items:center;gap:16px;margin-bottom:10px}.head img,.head svg{width:72px;height:72px;border-radius:50%}h1{margin:0;font-size:26px}.meta{color:#555}h3{margin:22px 0 6px;font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#333}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:6px 6px;border-bottom:1px solid #ddd;text-align:center}th.l,td.l{text-align:left}tr.ours td{background:#fff7d6}.fx td.t{width:64px;font-weight:700}.fx td.h{text-align:right;width:32%}.fx td.a{text-align:left;width:32%}.fx td.s{font-weight:800;width:70px;white-space:nowrap}.fx td.g{color:#777;font-size:11px;text-align:left}.fx tr.rh td{background:#131c21;color:#fff;text-align:left;font-weight:700;letter-spacing:.04em}small{color:#777}.champ{margin-top:18px;font-size:18px}.sc{columns:2}@media print{body{margin:12mm}}</style></head><body><div class="head">' + logo + '<div><h1>' + esc(c.name) + '</h1><div class="meta">' + esc([c.ageGroup, c.date, c.venue].filter(Boolean).join(' · ')) + ' · ' + esc((C.TYPES.find(t => t[0] === c.type) || [])[1] || c.type) + (c.endTime && c.matches.length ? ' · ' + esc(c.settings.startTime) + '–' + esc(c.endTime) : '') + '</div></div></div>' + body + '<p style="color:#999;font-size:12px;margin-top:28px">Hosted with the K1 Shooters Tactics Board</p><script>setTimeout(function(){window.print()},300)</script></body></html>';
  };

  /* ------------------------------------------------- match centre bridge */
  /** Run a fixture live in the Match centre; the result writes back when the match is finished. */
  C.startLive = function (id, mid) {
    const c = C.get(id); const m = c && c.matches.find(x => x.id === mid); if (!m || !m.homeId || !m.awayId) return false;
    const ht = C.team(c, m.homeId), at = C.team(c, m.awayId);
    const oursH = C.isOurs(c, m.homeId), oursA = C.isOurs(c, m.awayId);
    const opts = { competition: c.name, venue: c.venue || '', compId: c.id, compMatchId: m.id, compSwap: false, date: c.date || new Date().toISOString().slice(0, 10) };
    if (oursA && !oursH) { opts.home = at.name; opts.away = ht.name; opts.compSwap = true; opts.teamId = at.teamId; }
    else { opts.home = ht.name; opts.away = at.name; opts.teamId = oursH ? ht.teamId : null; }
    K1.Match.newMatch(opts);
    return true;
  };
  /** Called by the match centre when a competition match finishes (or from its "save result" button). */
  C.saveFromLive = function () {
    const s = K1.Match.state();
    if (!s.compId || !s.compMatchId) return null;
    const sc = K1.Match.score();
    const h = s.compSwap ? sc.away : sc.home, a = s.compSwap ? sc.home : sc.away;
    const scorers = s.events.filter(e => (e.type === 'goal' || e.type === 'pen_goal') && e.team === 'home' && e.player).map(e => e.player).join(', ');
    return C.recordResult(s.compId, s.compMatchId, h, a, { scorers: scorers || undefined });
  };

  K1.Competitions = C;
})(window.K1 = window.K1 || {});
