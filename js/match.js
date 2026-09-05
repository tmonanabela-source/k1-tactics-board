/* K1 Shooters Tactics Board — match centre: clock, score, events, possession, stats, substitutions */
(function (K1) {
  'use strict';

  const M = {};
  const KEY = () => K1.Store.KEYS.match;
  const HIST = () => K1.Store.KEYS.matches;

  const PERIODS = [
    { id: 'pre', label: 'Pre-match', offset: 0, len: 0 },
    { id: 'H1', label: '1st half', offset: 0, len: 45 },
    { id: 'HT', label: 'Half-time', offset: 45, len: 0 },
    { id: 'H2', label: '2nd half', offset: 45, len: 45 },
    { id: 'FT', label: 'Full-time', offset: 90, len: 0 },
    { id: 'ET1', label: 'Extra time 1', offset: 90, len: 15 },
    { id: 'ETB', label: 'ET break', offset: 105, len: 0 },
    { id: 'ET2', label: 'Extra time 2', offset: 105, len: 15 },
    { id: 'AET', label: 'After extra time', offset: 120, len: 0 },
    { id: 'PENS', label: 'Penalties', offset: 120, len: 0 },
    { id: 'END', label: 'Finished', offset: 120, len: 0 },
  ];
  M.PERIODS = PERIODS;
  M.EVENT_TYPES = [
    { id: 'goal', label: 'Goal', icon: 'football', score: true },
    { id: 'pen_goal', label: 'Penalty scored', icon: 'target', score: true },
    { id: 'pen_miss', label: 'Penalty missed', icon: 'x' },
    { id: 'own_goal', label: 'Own goal', icon: 'football', score: 'other' },
    { id: 'yellow', label: 'Yellow card', icon: 'card', color: '#facc15' },
    { id: 'red', label: 'Red card', icon: 'card', color: '#ef4444' },
    { id: 'sub', label: 'Substitution', icon: 'substitute' },
    { id: 'injury', label: 'Injury', icon: 'medkit' },
    { id: 'shot', label: 'Shot', icon: 'target', stat: 'shots' },
    { id: 'shot_on', label: 'Shot on target', icon: 'target', stat: 'onTarget' },
    { id: 'corner', label: 'Corner', icon: 'corner', stat: 'corners' },
    { id: 'foul', label: 'Foul', icon: 'whistle', stat: 'fouls' },
    { id: 'offside', label: 'Offside', icon: 'offside', stat: 'offsides' },
    { id: 'save', label: 'Save', icon: 'shirt', stat: 'saves' },
    { id: 'note', label: 'Coach note', icon: 'notes' },
  ];
  const STAT_KEYS = ['shots', 'onTarget', 'corners', 'fouls', 'offsides', 'saves'];
  M.STAT_KEYS = STAT_KEYS;
  M.STAT_LABEL = { shots: 'Shots', onTarget: 'On target', corners: 'Corners', fouls: 'Fouls', offsides: 'Offsides', saves: 'Saves' };

  function blank() {
    const team = K1.Teams && K1.Teams.list().length ? K1.Teams.active() : null;
    return {
      id: K1.uid('m'), date: new Date().toISOString().slice(0, 10), competition: '', venue: '',
      teamId: team ? team.id : null,
      home: team ? K1.Teams.displayName(team) : (K1.settings.homeName || 'K1 Shooters'), away: K1.settings.awayName || 'Opponent',
      period: 'pre', clock: { running: false, startedAt: 0, base: 0 },
      events: [], possession: { home: 0, away: 0, current: null, since: 0 },
      stats: { home: {}, away: {} }, lineup: { starting: [], bench: [] }, notes: '',
    };
  }
  let state = null;
  M.state = function () { if (!state) state = Object.assign(blank(), K1.Store.get(KEY(), {})); return state; };
  M.save = function () { K1.Store.set(KEY(), state); K1.emit('match', state); };
  M.reset = function () { state = blank(); M.save(); };
  M.newMatch = function (opts) { if (state && (state.events.length || state.period !== 'pre')) M.archive(); state = Object.assign(blank(), opts || {}); M.save(); };
  /** Point the live match at a team (age group): sets the home name and the season bucket. */
  M.setTeam = function (teamId) {
    const s = M.state();
    const t = K1.Teams && teamId ? K1.Teams.get(teamId) : null;
    s.teamId = t ? t.id : null;
    if (t) s.home = K1.Teams.displayName(t);
    M.save();
  };

  /* ----------------------------------------------------------------- clock */
  M.period = () => PERIODS.find(p => p.id === M.state().period) || PERIODS[0];
  M.elapsed = function () { const c = M.state().clock; return c.base + (c.running ? Date.now() - c.startedAt : 0); };
  M.minute = function () { return M.period().offset + Math.floor(M.elapsed() / 60000); };
  M.clockText = function () {
    const p = M.period();
    const ms = M.elapsed();
    const mins = Math.floor(ms / 60000), secs = Math.floor((ms % 60000) / 1000);
    if (p.len && mins >= p.len) return p.len + "'+" + (mins - p.len) + ':' + String(secs).padStart(2, '0');
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  };
  M.matchMinuteLabel = function () {
    const p = M.period();
    const mins = Math.floor(M.elapsed() / 60000);
    if (p.len && mins >= p.len) return (p.offset + p.len) + '+' + (mins - p.len) + "'";
    return (p.offset + mins) + "'";
  };
  M.start = function () {
    const s = M.state();
    if (s.period === 'pre') s.period = 'H1';
    else if (s.period === 'HT') { s.period = 'H2'; s.clock.base = 0; }
    else if (s.period === 'FT') { s.period = 'ET1'; s.clock.base = 0; }
    else if (s.period === 'ETB') { s.period = 'ET2'; s.clock.base = 0; }
    else if (s.period === 'AET') { s.period = 'PENS'; s.clock.base = 0; }
    if (!s.clock.running) { s.clock.running = true; s.clock.startedAt = Date.now(); }
    if (s.possession.current) s.possession.since = Date.now();
    M.save();
  };
  M.pause = function () {
    const s = M.state();
    if (s.clock.running) { s.clock.base += Date.now() - s.clock.startedAt; s.clock.running = false; }
    M.flushPossession();
    M.save();
  };
  M.endPeriod = function () {
    const s = M.state();
    M.pause();
    const next = { H1: 'HT', H2: 'FT', ET1: 'ETB', ET2: 'AET', PENS: 'END' }[s.period];
    if (next) { s.period = next; s.clock.base = 0; }
    s.possession.current = null;
    M.save();
  };
  M.finish = function () { M.pause(); M.state().period = 'END'; M.state().possession.current = null; M.save(); };
  M.setPeriod = function (id) { M.pause(); M.state().period = id; M.state().clock.base = 0; M.save(); };
  M.adjustClock = function (deltaMs) { const s = M.state(); s.clock.base = Math.max(0, s.clock.base + deltaMs); M.save(); };

  /* ---------------------------------------------------------- possession */
  M.flushPossession = function () {
    const p = M.state().possession;
    if (p.current && p.since) { p[p.current] += Date.now() - p.since; p.since = Date.now(); }
  };
  M.setPossession = function (team) {
    const s = M.state();
    M.flushPossession();
    s.possession.current = team === s.possession.current ? null : team;
    s.possession.since = Date.now();
    M.save();
  };
  M.possessionPct = function () {
    const p = M.state().possession;
    let h = p.home, a = p.away;
    if (p.current && p.since && M.state().clock.running) { if (p.current === 'home') h += Date.now() - p.since; else a += Date.now() - p.since; }
    const t = h + a;
    if (!t) return { home: 50, away: 50 };
    return { home: Math.round(h / t * 100), away: 100 - Math.round(h / t * 100) };
  };

  /* --------------------------------------------------------------- events */
  M.addEvent = function (type, team, extra) {
    const s = M.state();
    const ev = Object.assign({ id: K1.uid('ev'), type, team, minute: M.matchMinuteLabel(), period: s.period, at: Date.now() }, extra || {});
    s.events.push(ev);
    const def = M.EVENT_TYPES.find(t => t.id === type);
    if (def && def.stat) { s.stats[team][def.stat] = (s.stats[team][def.stat] || 0) + 1; }
    if (type === 'shot_on') s.stats[team].shots = (s.stats[team].shots || 0) + 1;
    if (type === 'goal' || type === 'pen_goal') { s.stats[team].shots = (s.stats[team].shots || 0) + 1; s.stats[team].onTarget = (s.stats[team].onTarget || 0) + 1; }
    M.save();
    K1.haptic(15);
    return ev;
  };
  M.removeEvent = function (id) {
    const s = M.state();
    const ev = s.events.find(e => e.id === id); if (!ev) return;
    const def = M.EVENT_TYPES.find(t => t.id === ev.type);
    if (def && def.stat && s.stats[ev.team][def.stat]) s.stats[ev.team][def.stat]--;
    if (ev.type === 'shot_on' && s.stats[ev.team].shots) s.stats[ev.team].shots--;
    if ((ev.type === 'goal' || ev.type === 'pen_goal')) { if (s.stats[ev.team].shots) s.stats[ev.team].shots--; if (s.stats[ev.team].onTarget) s.stats[ev.team].onTarget--; }
    s.events = s.events.filter(e => e.id !== id);
    M.save();
  };
  M.score = function () {
    const s = M.state();
    const sc = { home: 0, away: 0 };
    s.events.forEach(e => {
      if (e.type === 'goal' || e.type === 'pen_goal') sc[e.team]++;
      else if (e.type === 'own_goal') sc[e.team === 'home' ? 'away' : 'home']++;
    });
    return sc;
  };
  M.inc = function (team, stat, delta) { const s = M.state(); s.stats[team][stat] = Math.max(0, (s.stats[team][stat] || 0) + delta); M.save(); };

  /* ------------------------------------------------------------- report */
  M.summaryText = function () {
    const s = M.state();
    const sc = M.score();
    const pos = M.possessionPct();
    const lines = [];
    lines.push(s.home + ' ' + sc.home + ' – ' + sc.away + ' ' + s.away);
    lines.push((s.competition ? s.competition + ' · ' : '') + s.date + (s.venue ? ' · ' + s.venue : ''));
    lines.push('');
    lines.push('Possession: ' + pos.home + '% – ' + pos.away + '%');
    STAT_KEYS.forEach(k => { lines.push(M.STAT_LABEL[k] + ': ' + (s.stats.home[k] || 0) + ' – ' + (s.stats.away[k] || 0)); });
    lines.push('');
    lines.push('Timeline:');
    s.events.forEach(e => {
      const def = M.EVENT_TYPES.find(t => t.id === e.type) || { label: e.type };
      let who = e.player ? ' ' + e.player : '';
      if (e.type === 'sub') who = ' ' + (e.playerOff || '?') + ' ➜ ' + (e.playerOn || '?');
      lines.push(e.minute + ' ' + def.label + ' (' + (e.team === 'home' ? s.home : s.away) + ')' + who + (e.note ? ' — ' + e.note : ''));
    });
    if (s.notes) { lines.push(''); lines.push('Notes: ' + s.notes); }
    lines.push('');
    lines.push('— K1 Shooters Football Academy · Tactics Board');
    return lines.join('\n');
  };
  M.archive = function () {
    const s = M.state();
    const list = K1.Store.get(HIST(), []);
    list.unshift({ id: s.id, date: s.date, home: s.home, away: s.away, teamId: s.teamId || null, score: M.score(), competition: s.competition, summary: M.summaryText(), state: K1.clone(s) });
    K1.Store.set(HIST(), list.slice(0, 60));
  };
  M.history = () => K1.Store.get(HIST(), []);
  M.deleteHistory = id => { K1.Store.set(HIST(), M.history().filter(m => m.id !== id)); K1.emit('match'); };

  /* -------------------------------------------------------------- season */
  /** Record, goals and scorers aggregated from archived matches (plus the live one if it has started). */
  M.seasonStats = function (teamId) {
    const inTeam = s => teamId == null || (s.teamId || null) === teamId;
    const matches = M.history().map(h => h.state).filter(s => s && inTeam(s));
    const live = M.state();
    if (live.period !== 'pre' && live.events.length && inTeam(live)) matches.push(live);
    const rec = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
    const scorers = {}, assists = {}, cards = {};
    const key = s => String(s || '').trim().replace(/\s+/g, ' ');
    matches.forEach(s => {
      let h = 0, a = 0;
      s.events.forEach(e => {
        const scoring = e.type === 'goal' || e.type === 'pen_goal';
        if (scoring) { if (e.team === 'home') h++; else a++; }
        else if (e.type === 'own_goal') { if (e.team === 'home') a++; else h++; }
        if (e.team !== 'home') return;
        if (scoring) { const p = key(e.player) || 'Unknown'; scorers[p] = (scorers[p] || 0) + 1; }
        if (scoring && e.note) { const m = /assist:\s*([^·]+)/i.exec(e.note); if (m) { const p = key(m[1]); assists[p] = (assists[p] || 0) + 1; } }
        if (e.type === 'yellow' || e.type === 'red') { const p = key(e.player) || 'Unknown'; cards[p] = (cards[p] || 0) + 1; }
      });
      rec.played++; rec.gf += h; rec.ga += a;
      if (h > a) rec.won++; else if (h === a) rec.drawn++; else rec.lost++;
    });
    const top = obj => Object.keys(obj).map(k => [k, obj[k]]).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 8);
    return { record: rec, scorers: top(scorers), assists: top(assists), cards: top(cards) };
  };

  K1.Match = M;
})(window.K1 = window.K1 || {});
