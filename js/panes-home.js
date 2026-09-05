/* K1 Shooters club app — Home dashboard */
(function (K1) {
  'use strict';

  const P = K1.Panes;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const UI = () => K1.UI;

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning, Coach' : h < 17 ? 'Good afternoon, Coach' : 'Good evening, Coach'; };
  const today = () => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  P.home = function (root) {
    const T = K1.Teams, C = K1.Competitions, M = K1.Match, SS = K1.Sessions;
    const team = T.active();
    const teams = T.sorted();
    const m = M.state();
    const live = m.period !== 'pre' && m.period !== 'END';
    const sc = M.score();
    const boards = K1.Store.listBoards().slice(0, 4);
    const fixtures = [];
    C.list().forEach(c => c.matches.forEach(mt => { if (!mt.played && !mt.bye && mt.homeId && mt.awayId) fixtures.push({ c, m: mt, ours: C.isOurs(c, mt.homeId) || C.isOurs(c, mt.awayId) }); }));
    fixtures.sort((a, b) => (Number(b.ours) - Number(a.ours)) || ((a.c.date || '') + (a.m.time || '')).localeCompare((b.c.date || '') + (b.m.time || '')));
    const next = fixtures.slice(0, 5);
    const comps = C.list().filter(c => c.status !== 'done').slice(0, 3);
    const sessions = SS.list().slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);
    const players = team ? T.players(team.id) : [];
    const season = M.seasonStats(team ? team.id : null).record;
    const rates = team ? SS.attendanceRates(team.id).filter(r => r.marked) : [];
    const avgAtt = rates.length ? Math.round(rates.reduce((s, r) => s + r.pct, 0) / rates.length) : null;
    const withPhotos = players.filter(p => p.photo).length;

    let s = '<div class="home-hero"><div class="hero-badge">' + K1.logoHTML(84) + '</div><div class="hero-text"><span class="hero-kicker">' + esc(greeting()) + ' · ' + esc(today()) + '</span><h1>' + esc(K1.settings.homeName || 'K1 Shooters') + ' <span>Football Academy</span></h1>' +
      '<div class="hero-teams">' + teams.map(t => '<button class="team-chip' + (team && t.id === team.id ? ' on' : '') + '" data-team="' + t.id + '"><b>' + esc(t.name) + '</b><span>' + esc(T.formatLabel(t.pitch)) + ' · ' + T.players(t.id).length + '</span></button>').join('') + '</div></div></div>';

    s += '<div class="home-grid">';
    // quick actions
    s += '<div class="hcard quick"><h4>Quick actions</h4><div class="qa-grid">' +
      '<button class="qa" data-go="board" data-new="board">' + icon('grid', { size: 22 }) + '<span>New board</span></button>' +
      '<button class="qa" data-go="teams">' + icon('users', { size: 22 }) + '<span>Teams & players</span></button>' +
      '<button class="qa" data-go="match">' + icon('whistle', { size: 22 }) + '<span>Match day</span></button>' +
      '<button class="qa" data-go="comps">' + icon('trophy', { size: 22 }) + '<span>Tournaments</span></button>' +
      '<button class="qa" data-go="sessions">' + icon('calendar', { size: 22 }) + '<span>Plan a session</span></button>' +
      '<button class="qa" data-go="board" data-playbook="1">' + icon('book', { size: 22 }) + '<span>Playbook</span></button>' +
      '</div></div>';
    // live match
    s += '<div class="hcard live' + (live ? ' is-live' : '') + '"><h4>' + (live ? '<i class="dot"></i>Live now' : 'Match day') + '</h4>' + (live
      ? '<div class="live-score"><span class="ln">' + esc(m.home) + '</span><b>' + sc.home + ' – ' + sc.away + '</b><span class="ln">' + esc(m.away) + '</span></div><div class="muted small">' + esc(M.period().label) + ' · ' + esc(M.clockText()) + (m.competition ? ' · ' + esc(m.competition) : '') + '</div><button class="btn btn-primary btn-sm" data-go="match">' + icon('whistle', { size: 15 }) + '<span>Open match</span></button>'
      : '<p class="muted small">Clock, score, possession, events and a shareable report. Results feed the season stats and your competitions.</p><button class="btn btn-sm" data-go="match">' + icon('play', { size: 15 }) + '<span>Go to Match day</span></button>') + '</div>';
    // up next
    s += '<div class="hcard next"><h4>Up next</h4>' + (next.length
      ? '<div class="next-list">' + next.map(x => '<button class="next-row' + (x.ours ? ' ours' : '') + '" data-comp="' + x.c.id + '"><span class="nt">' + esc(x.m.time || '—') + (x.m.pitch ? '<small>P' + x.m.pitch + '</small>' : '') + '</span><span class="nm"><b>' + esc(C.teamName(x.c, x.m.homeId)) + '</b> v <b>' + esc(C.teamName(x.c, x.m.awayId)) + '</b><small>' + esc(x.c.name) + ' · ' + esc(C.matchLabel(x.c, x.m)) + (x.c.date ? ' · ' + esc(x.c.date) : '') + '</small></span>' + icon('chevronRight', { size: 16 }) + '</button>').join('') + '</div>'
      : '<p class="muted small">No fixtures waiting. Host a tournament or league and the next kick-offs appear here.</p><button class="btn btn-sm" data-go="comps">' + icon('trophy', { size: 15 }) + '<span>Competitions</span></button>') + '</div>';
    // team snapshot
    s += '<div class="hcard team"><h4>' + esc(team ? T.displayName(team) : 'Team') + '</h4>' + (team
      ? '<div class="stat-row"><div><b>' + players.length + '</b><span>players</span></div><div><b>' + (withPhotos) + '</b><span>with photos</span></div><div><b>' + (avgAtt == null ? '–' : avgAtt + '%') + '</b><span>attendance</span></div><div><b>' + season.won + '-' + season.drawn + '-' + season.lost + '</b><span>W-D-L</span></div></div>' +
        '<div class="row wrap"><button class="btn btn-primary btn-sm" data-go="teams">' + icon('users', { size: 15 }) + '<span>Manage ' + esc(team.name) + '</span></button><button class="btn btn-sm" data-lineup="1">' + icon('grid', { size: 15 }) + '<span>Line-up on board</span></button></div>'
      : '<p class="muted small">Create a team to get started.</p>') + '</div>';
    // recent boards
    s += '<div class="hcard boards"><h4>Recent boards</h4>' + (boards.length
      ? '<div class="board-strip">' + boards.map(b => '<button class="board-tile" data-board="' + b.id + '">' + b.thumb + '<span>' + esc(b.title) + '</span></button>').join('') + '</div>'
      : '<p class="muted small">Boards you save appear here. Open the board, draw, press Save.</p>') + '<div class="row wrap"><button class="btn btn-sm" data-go="board">' + icon('grid', { size: 15 }) + '<span>Open the board</span></button><button class="btn btn-sm btn-ghost" data-go="library">' + icon('folder', { size: 15 }) + '<span>Library</span></button></div></div>';
    // competitions + sessions
    s += '<div class="hcard comps"><h4>Competitions</h4>' + (comps.length ? '<div class="list compact">' + comps.map(c => '<button class="list-row" data-comp="' + c.id + '"><span class="lr-main"><b>' + esc(c.name) + '</b><span class="muted small">' + c.teams.length + ' teams · ' + c.matches.filter(x => x.played && !x.bye).length + '/' + c.matches.filter(x => !x.bye).length + ' played' + (c.date ? ' · ' + esc(c.date) : '') + '</span></span>' + icon('chevronRight', { size: 16 }) + '</button>').join('') + '</div>' : '<p class="muted small">Nothing running. Create a league or a one-day tournament in Comps.</p>') + '</div>';
    s += '<div class="hcard sessions"><h4>Training</h4>' + (sessions.length ? '<div class="list compact">' + sessions.map(x => { const tm = x.teamId ? T.get(x.teamId) : null; const sum = SS.attendanceSummary(x); return '<button class="list-row" data-session="' + x.id + '"><span class="lr-main"><b>' + esc(x.title) + '</b><span class="muted small">' + (tm ? esc(tm.name) + ' · ' : '') + esc(x.date) + ' · ' + SS.total(x) + ' min' + (sum.squad && (sum.present || sum.late || sum.absent || sum.injured) ? ' · ' + sum.there + '/' + sum.squad + ' there' : '') + '</span></span>' + icon('chevronRight', { size: 16 }) + '</button>'; }).join('') + '</div>' : '<p class="muted small">Plan sessions with drills, timings and attendance.</p>') + '<div class="row wrap"><button class="btn btn-sm" data-go="sessions">' + icon('calendar', { size: 15 }) + '<span>Sessions</span></button></div></div>';
    s += '</div>';
    root.innerHTML = s;

    $$('[data-team]', root).forEach(b => { b.onclick = () => T.setActive(b.dataset.team); });
    $$('[data-go]', root).forEach(b => { b.onclick = () => {
      const go = b.dataset.go;
      if (b.dataset.new) { UI().goSection('board'); UI().newBoardDialog(); return; }
      if (b.dataset.playbook) { UI().goSection('board'); UI().openPane('playbook'); return; }
      UI().goSection(go);
    }; });
    $$('[data-comp]', root).forEach(b => { b.onclick = () => { P.openCompetition(b.dataset.comp); UI().goSection('comps'); }; });
    $$('[data-session]', root).forEach(b => { b.onclick = () => { P.openSession(b.dataset.session); UI().goSection('sessions'); }; });
    $$('[data-board]', root).forEach(b => { b.onclick = () => { const e = K1.Store.getBoard(b.dataset.board); if (e) P.openDoc(K1.clone(e.doc), e.title).then(ok => { if (ok) K1.S.dirty = false; }); }; });
    const lu = $('[data-lineup]', root); if (lu) lu.onclick = () => { const fid = (team.formation) || (K1.formationsFor(T.playersFor(team.pitch))[0] || {}).id; if (K1.dims().players !== T.playersFor(team.pitch)) { K1.mutate(() => { K1.S.doc.pitch.type = team.pitch; }, 'pitch'); K1.Render.invalidatePitch(); K1.Render.layout(true); } K1.Squad.placeLineup(fid, { teamId: team.id }); UI().goSection('board'); UI().toast(esc(team.name) + ' line-up placed', 'ok'); };
  };
})(window.K1 = window.K1 || {});
