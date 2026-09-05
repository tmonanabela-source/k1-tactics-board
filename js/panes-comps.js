/* K1 Shooters Tactics Board — Competitions pane: host leagues, group tournaments and knockout cups */
(function (K1) {
  'use strict';

  const P = K1.Panes;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const UI = () => K1.UI;
  const C = () => K1.Competitions;

  let current = null, sub = 'fixtures', onlyOurs = false;
  const section = (title, body, extra) => '<section class="pane-section">' + (title ? '<h4>' + title + (extra || '') + '</h4>' : '') + body + '</section>';
  P.openCompetition = id => { current = id; sub = 'fixtures'; };

  const typeLabel = t => (C().TYPES.find(x => x[0] === t) || [])[1] || t;
  const statusPill = c => '<span class="pill st-' + c.status + '">' + (c.status === 'setup' ? 'Setting up' : c.status === 'done' ? 'Finished' : 'In progress') + '</span>';
  const teamDot = t => '<span class="tdot" style="background:' + (t ? t.color : '#64748b') + '"></span>';

  /* ================================================================= LIST */
  P.comps = function (root) {
    if (current && !C().get(current)) current = null;
    if (!current) return renderList(root);
    renderDetail(root, C().get(current));
  };

  function renderList(root) {
    const list = C().list();
    root.innerHTML = section('Competitions', '<p class="muted small">Host a league or a one-day tournament: add the teams, generate fixtures with times and pitches, enter scores, share the table.</p>' +
      '<div class="row wrap"><button class="btn btn-primary btn-sm" data-act="new">' + icon('trophy', { size: 15 }) + '<span>New competition</span></button></div>' +
      (list.length ? '<div class="list">' + list.map(c => '<button class="list-row" data-open="' + c.id + '"><span class="lr-main"><b>' + esc(c.name) + '</b><span class="muted small">' + esc(typeLabel(c.type)) + ' · ' + c.teams.length + ' teams' + (c.ageGroup ? ' · ' + esc(c.ageGroup) : '') + ' · ' + esc(c.date || '') + '</span></span>' + statusPill(c) + icon('chevronRight', { size: 16 }) + '</button>').join('') + '</div>' : '<div class="empty-card">' + icon('trophy', { size: 28 }) + '<p>No competitions yet. Create one to host a tournament or run your league.</p></div>'));
    $('[data-act=new]', root).onclick = () => newCompetition(root);
    $$('[data-open]', root).forEach(b => { b.onclick = () => { current = b.dataset.open; sub = 'fixtures'; P.comps(root); }; });
  }

  function newCompetition(root) {
    const T = K1.Teams;
    const body = '<div class="form-grid">' +
      '<label class="field span2"><span>Name</span><input class="input" id="cpName" placeholder="e.g. K1 Winter Cup"></label>' +
      '<label class="field"><span>Type</span><select class="select" id="cpType">' + C().TYPES.map(t => '<option value="' + t[0] + '">' + t[1] + '</option>').join('') + '</select></label>' +
      '<label class="field"><span>Age group</span><select class="select" id="cpAge"><option value="">Open</option>' + T.AGE_GROUPS.map(a => '<option' + (a === (T.active() && T.active().ageGroup) ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></label>' +
      '<label class="field"><span>Date</span><input class="input" id="cpDate" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></label>' +
      '<label class="field"><span>Venue</span><input class="input" id="cpVenue" placeholder="Ground / school"></label>' +
      '<label class="field span2"><span>Teams (one per line — include your own teams by name, you can link them next)</span><textarea class="input" id="cpTeams" rows="6" placeholder="K1 Shooters U13&#10;Rovers&#10;Eagles FC&#10;Mamelodi Stars"></textarea></label>' +
      '</div><p class="hint">Fixtures, kick-off times and pitches are generated in the next step. Settings (match length, pitches, points) can be changed any time before generating.</p>';
    UI().modal({ title: 'New competition', body, actions: [{ label: 'Cancel' }, { label: 'Create', primary: true, onClick: () => {
      const c = C().create({ name: $('#cpName').value.trim() || 'New competition', type: $('#cpType').value, ageGroup: $('#cpAge').value, date: $('#cpDate').value, venue: $('#cpVenue').value.trim() });
      C().addTeams(c.id, $('#cpTeams').value);
      // auto-link teams whose name contains one of our team names
      c.teams.forEach(t => { const mine = T.sorted().find(tm => t.name.toLowerCase().includes(tm.name.toLowerCase()) && /k1|shooters/i.test(t.name)); if (mine) C().updateTeam(c.id, t.id, { teamId: mine.id }); });
      current = c.id; sub = 'setup'; P.comps(root);
    } }] });
  }

  /* =============================================================== DETAIL */
  function renderDetail(root, c) {
    const hasKO = C().hasKnockout(c);
    const tabs = [['fixtures', 'Fixtures'], ['table', c.type === 'knockout' ? null : 'Table'], ['bracket', hasKO ? 'Bracket' : null], ['scorers', 'Scorers'], ['setup', 'Setup']].filter(t => t[1]);
    if (!tabs.find(t => t[0] === sub)) sub = 'fixtures';
    const ch = C().champion(c);
    let s = '<button class="btn btn-sm btn-ghost" data-act="back">' + icon('arrowLeft', { size: 15 }) + '<span>All competitions</span></button>';
    s += '<div class="comp-head"><div><b class="comp-name">' + esc(c.name) + '</b><div class="muted small">' + esc(typeLabel(c.type)) + ' · ' + c.teams.length + ' teams' + (c.ageGroup ? ' · ' + esc(c.ageGroup) : '') + (c.date ? ' · ' + esc(c.date) : '') + (c.venue ? ' · ' + esc(c.venue) : '') + (c.matches.length ? ' · ' + esc(c.settings.startTime) + '–' + esc(c.endTime || '') : '') + '</div></div>' + statusPill(c) + '</div>';
    if (ch) s += '<div class="champ-banner">' + icon('trophy', { size: 18 }) + '<span>Champions: <b>' + esc(C().teamName(c, ch)) + '</b></span></div>';
    s += '<div class="subtabs">' + tabs.map(t => '<button class="' + (sub === t[0] ? 'on' : '') + '" data-sub="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    s += '<div class="row wrap comp-actions"><button class="btn btn-sm" data-act="share">' + icon('share', { size: 15 }) + '<span>Share text</span></button><button class="btn btn-sm" data-act="print">' + icon('print', { size: 15 }) + '<span>Print</span></button><button class="btn btn-sm" data-act="json">' + icon('download', { size: 15 }) + '<span>Export</span></button></div>';
    if (sub === 'fixtures') s += fixturesHTML(c);
    else if (sub === 'table') s += tableHTML(c);
    else if (sub === 'bracket') s += bracketHTML(c);
    else if (sub === 'scorers') s += scorersHTML(c);
    else s += setupHTML(c);
    root.innerHTML = s;
    bindDetail(root, c);
  }

  /* ------------------------------------------------------------ fixtures */
  function fixturesHTML(c) {
    if (!c.matches.length) return section('Fixtures', '<div class="empty-card">' + icon('calendar', { size: 26 }) + '<p>No fixtures yet. Add the teams in <b>Setup</b> and press <b>Generate fixtures</b>.</p></div>');
    const keys = []; c.matches.forEach(m => { const k = m.stage + ':' + m.round; if (!keys.includes(k)) keys.push(k); });
    keys.sort((a, b) => { const [sa, ra] = a.split(':'), [sb, rb] = b.split(':'); return C().stageIndex(sa) - C().stageIndex(sb) || (+ra) - (+rb); });
    const anyOurs = c.teams.some(t => C().isOurs(c, t.id));
    let s = '<div class="row between"><span class="muted small">' + c.matches.filter(m => m.played && !m.bye).length + ' / ' + c.matches.filter(m => !m.bye).length + ' played</span>' + (anyOurs ? '<label class="check small"><input type="checkbox" id="fxOurs"' + (onlyOurs ? ' checked' : '') + '><span>Only our matches</span></label>' : '') + '</div>';
    keys.forEach(k => {
      const [st, r] = k.split(':');
      let ms = c.matches.filter(m => m.stage + ':' + m.round === k && !m.bye);
      if (onlyOurs) ms = ms.filter(m => C().isOurs(c, m.homeId) || C().isOurs(c, m.awayId));
      if (!ms.length) return;
      s += '<h5 class="group-title">' + esc(C().STAGES[st] || st) + (st === 'league' || st === 'group' ? ' · Round ' + r : '') + '</h5><div class="fx-list">';
      ms.forEach(m => {
        const ht = C().team(c, m.homeId), at = C().team(c, m.awayId);
        const g = m.groupId ? (c.groups.find(x => x.id === m.groupId) || {}).name : '';
        const ready = m.homeId && m.awayId;
        const ko = st !== 'league' && st !== 'group';
        const drawn = m.played && m.homeScore === m.awayScore && ko;
        s += '<div class="fx' + (m.played ? ' played' : '') + ((C().isOurs(c, m.homeId) || C().isOurs(c, m.awayId)) ? ' ours' : '') + '" data-mid="' + m.id + '">' +
          '<div class="fx-meta"><input class="fx-time" value="' + esc(m.time || '') + '" data-mf="time" placeholder="hh:mm" title="Kick-off"><input class="fx-pitch" value="' + (m.pitch || '') + '" data-mf="pitch" placeholder="P" title="Pitch">' + (g ? '<span class="tag">' + esc(g) + '</span>' : '') + '</div>' +
          '<div class="fx-teams"><span class="fx-team h">' + teamDot(ht) + esc(C().teamName(c, m.homeId, m, 'home')) + '</span>' +
          '<span class="fx-score"><input type="number" min="0" class="sc" data-mf="homeScore" value="' + (m.homeScore == null ? '' : m.homeScore) + '"' + (ready ? '' : ' disabled') + '><i>–</i><input type="number" min="0" class="sc" data-mf="awayScore" value="' + (m.awayScore == null ? '' : m.awayScore) + '"' + (ready ? '' : ' disabled') + '></span>' +
          '<span class="fx-team a">' + esc(C().teamName(c, m.awayId, m, 'away')) + teamDot(at) + '</span></div>' +
          (drawn ? '<div class="fx-pens"><span class="muted small">Penalties</span><input type="number" min="0" class="sc" data-mf="pensHome" value="' + (m.pensHome == null ? '' : m.pensHome) + '"><i>–</i><input type="number" min="0" class="sc" data-mf="pensAway" value="' + (m.pensAway == null ? '' : m.pensAway) + '"></div>' : '') +
          '<div class="fx-foot"><input class="input sm grow" data-mf="scorers" value="' + esc(m.scorers || '') + '" placeholder="Scorers, e.g. Thabo 2, Lebo">' + (ready ? '<button class="icon-btn sm" data-live title="Run this match live in Match day">' + icon('whistle', { size: 15 }) + '</button>' : '') + (m.played ? '<button class="icon-btn sm" data-clear title="Clear result">' + icon('x', { size: 14 }) + '</button>' : '') + '</div></div>';
      });
      s += '</div>';
    });
    if (c.type === 'groups' && !C().hasKnockout(c)) s += '<div class="row wrap"><button class="btn btn-primary btn-sm" data-act="knockout"' + (C().groupStageComplete(c) ? '' : ' disabled title="Finish every group match first"') + '>' + icon('trophy', { size: 15 }) + '<span>Create knockout from standings</span></button>' + (C().groupStageComplete(c) ? '' : '<span class="muted small">Available when all group matches are played</span>') + '</div>';
    return section('Fixtures & results', s);
  }

  /* --------------------------------------------------------------- table */
  function standingsTable(c, rows, title, advance) {
    return '<h5 class="group-title">' + esc(title) + '</h5><div class="table-wrap"><table class="standings"><tr><th>#</th><th class="l">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th class="f">Form</th></tr>' +
      rows.map(r => '<tr class="' + (C().isOurs(c, r.teamId) ? 'ours ' : '') + (advance && r.pos <= advance ? 'adv' : '') + '"><td>' + r.pos + '</td><td class="l">' + teamDot(C().team(c, r.teamId)) + esc(r.name) + '</td><td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + (r.gd > 0 ? '+' : '') + r.gd + '</td><td><b>' + r.pts + '</b></td><td class="f">' + r.form.map(f => '<i class="fm ' + f + '">' + f + '</i>').join('') + '</td></tr>').join('') + '</table></div>';
  }
  function tableHTML(c) {
    if (!c.matches.length) return section('Table', '<p class="muted small">Generate fixtures first.</p>');
    let s = '';
    if (c.type === 'league') s += standingsTable(c, C().standings(c, null), 'Standings', 0);
    else c.groups.forEach(g => { s += standingsTable(c, C().standings(c, g.id), g.name, Number(c.settings.advancePerGroup) || 0); });
    s += '<p class="hint">Sorted by points, goal difference, goals scored, then head-to-head. Highlighted rows advance.</p>';
    return section('Table', s);
  }

  /* -------------------------------------------------------------- bracket */
  function bracketHTML(c) {
    const stages = ['r64', 'r32', 'r16', 'qf', 'sf', 'final'].filter(st => c.matches.some(m => m.stage === st));
    let s = '<div class="bracket">';
    stages.forEach(st => {
      const ms = c.matches.filter(m => m.stage === st).sort((a, b) => a.slot - b.slot);
      s += '<div class="br-col"><div class="br-title">' + esc(C().STAGES[st]) + '</div>' + ms.map(m => {
        const w = C().winner(m);
        const line = (tid, side, score, pens) => '<div class="br-team' + (w && w === tid ? ' win' : '') + (C().isOurs(c, tid) ? ' ours' : '') + '">' + teamDot(C().team(c, tid)) + '<span>' + esc(C().teamName(c, tid, m, side)) + '</span><b>' + (m.played && score != null ? score + (pens != null ? ' <small>(' + pens + ')</small>' : '') : '') + '</b></div>';
        return '<div class="br-match' + (m.bye ? ' bye' : '') + '" data-mid="' + m.id + '">' + line(m.homeId, 'home', m.homeScore, m.pensHome) + line(m.awayId, 'away', m.awayScore, m.pensAway) + (m.time && !m.bye ? '<div class="br-time">' + esc(m.time) + (m.pitch ? ' · P' + m.pitch : '') + '</div>' : '') + '</div>';
      }).join('') + '</div>';
    });
    s += '</div>';
    const third = c.matches.find(m => m.stage === 'third');
    if (third) { const w = C().winner(third); s += '<h5 class="group-title">Third-place match</h5><div class="br-match" data-mid="' + third.id + '"><div class="br-team' + (w && w === third.homeId ? ' win' : '') + '">' + teamDot(C().team(c, third.homeId)) + '<span>' + esc(C().teamName(c, third.homeId, third, 'home')) + '</span><b>' + (third.played ? third.homeScore : '') + '</b></div><div class="br-team' + (w && w === third.awayId ? ' win' : '') + '">' + teamDot(C().team(c, third.awayId)) + '<span>' + esc(C().teamName(c, third.awayId, third, 'away')) + '</span><b>' + (third.played ? third.awayScore : '') + '</b></div></div>'; }
    s += '<p class="hint">Tap a match to enter its score. Winners move through automatically; a draw needs penalties.</p>';
    return section('Bracket', s);
  }

  /* -------------------------------------------------------------- scorers */
  function scorersHTML(c) {
    const list = C().topScorers(c);
    return section('Golden boot', list.length ? '<div class="leaders">' + list.map((x, i) => '<div class="leader"><span class="rank">' + (i + 1) + '</span><span class="who">' + esc(x.name) + '</span><b>' + x.goals + '</b></div>').join('') + '</div>' : '<p class="muted small">Type scorers on each fixture (for example “Thabo 2, Lebo”) and the golden-boot table builds itself.</p>');
  }

  /* ---------------------------------------------------------------- setup */
  function setupHTML(c) {
    const T = K1.Teams; const s = c.settings;
    const teamRows = c.teams.map(t => '<div class="ct-row" data-tid="' + t.id + '">' + teamDot(t) + '<input class="input sm grow" data-tf="name" value="' + esc(t.name) + '">' +
      (c.type === 'groups' && c.groups.length ? '<select class="select sm" data-tf="groupId">' + c.groups.map(g => '<option value="' + g.id + '"' + (g.id === t.groupId ? ' selected' : '') + '>' + esc(g.name.replace('Group ', '')) + '</option>').join('') + '</select>' : '') +
      '<select class="select sm" data-tf="teamId" title="Link to one of our teams"><option value="">Other club</option>' + T.sorted().map(tm => '<option value="' + tm.id + '"' + (tm.id === t.teamId ? ' selected' : '') + '>Ours · ' + esc(tm.name) + '</option>').join('') + '</select>' +
      '<button class="icon-btn sm danger" data-del title="Remove team">' + icon('x', { size: 14 }) + '</button></div>').join('');
    let out = section('Competition', '<div class="form-grid"><label class="field span2"><span>Name</span><input class="input" data-cf="name" value="' + esc(c.name) + '"></label><label class="field"><span>Type</span><select class="select" data-cf="type"' + (c.matches.length ? ' disabled' : '') + '>' + C().TYPES.map(t => '<option value="' + t[0] + '"' + (t[0] === c.type ? ' selected' : '') + '>' + t[1] + '</option>').join('') + '</select></label><label class="field"><span>Age group</span><select class="select" data-cf="ageGroup"><option value="">Open</option>' + T.AGE_GROUPS.map(a => '<option' + (a === c.ageGroup ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></label><label class="field"><span>Date</span><input class="input" type="date" data-cf="date" value="' + esc(c.date || '') + '"></label><label class="field"><span>Venue</span><input class="input" data-cf="venue" value="' + esc(c.venue || '') + '"></label></div>');
    out += section('Teams · ' + c.teams.length, '<div class="ct-list">' + (teamRows || '<p class="muted small">No teams yet.</p>') + '</div><form class="row" data-addteam><input class="input sm grow" name="name" placeholder="Add a team (or paste several, one per line)" required><button class="btn btn-sm btn-primary" type="submit">' + icon('plus', { size: 15 }) + '<span>Add</span></button></form>' +
      (c.type === 'groups' ? '<div class="row wrap"><span class="row-label">Groups</span><input class="input num sm" type="number" min="1" max="8" data-sf="groupsCount" value="' + s.groupsCount + '"><button class="btn btn-sm" data-act="groups">' + icon('refresh', { size: 15 }) + '<span>Split into groups</span></button><button class="btn btn-sm" data-act="draw">' + icon('sparkles', { size: 15 }) + '<span>Random draw</span></button></div>' : ''));
    out += section('Match settings', '<div class="form-grid three">' +
      '<label class="field"><span>Match length (min)</span><input class="input" type="number" min="5" max="120" data-sf="matchMinutes" value="' + s.matchMinutes + '"></label>' +
      '<label class="field"><span>Break between (min)</span><input class="input" type="number" min="0" max="60" data-sf="breakMinutes" value="' + s.breakMinutes + '"></label>' +
      '<label class="field"><span>Pitches</span><input class="input" type="number" min="1" max="12" data-sf="pitches" value="' + s.pitches + '"></label>' +
      '<label class="field"><span>First kick-off</span><input class="input" type="time" data-sf="startTime" value="' + esc(s.startTime) + '"></label>' +
      (c.type !== 'knockout' ? '<label class="field"><span>Legs</span><select class="select" data-sf="legs"><option value="1"' + (s.legs === 1 ? ' selected' : '') + '>Single round</option><option value="2"' + (s.legs === 2 ? ' selected' : '') + '>Home & away</option></select></label>' : '') +
      (c.type !== 'knockout' ? '<label class="field"><span>Points (W / D)</span><span class="row"><input class="input num sm" type="number" data-sf="pointsWin" value="' + s.pointsWin + '"><input class="input num sm" type="number" data-sf="pointsDraw" value="' + s.pointsDraw + '"></span></label>' : '') +
      (c.type === 'groups' ? '<label class="field"><span>Advance per group</span><input class="input" type="number" min="1" max="4" data-sf="advancePerGroup" value="' + s.advancePerGroup + '"></label>' : '') +
      (c.type !== 'league' ? '<label class="check"><input type="checkbox" data-sf="thirdPlace"' + (s.thirdPlace ? ' checked' : '') + '><span>Third-place match</span></label>' : '') +
      '</div>' +
      '<div class="row wrap"><button class="btn btn-primary btn-sm" data-act="generate"' + (c.teams.length < 2 ? ' disabled' : '') + '>' + icon('bolt', { size: 15 }) + '<span>' + (c.matches.length ? 'Regenerate fixtures' : 'Generate fixtures') + '</span></button>' + (c.matches.length ? '<button class="btn btn-sm" data-act="reschedule" title="Keep results, recalculate times and pitches">' + icon('clock', { size: 15 }) + '<span>Re-time</span></button>' : '') + '<button class="btn btn-sm btn-danger-ghost" data-act="delete">' + icon('trash', { size: 15 }) + '<span>Delete competition</span></button></div>' +
      (c.matches.length ? '<p class="hint warn">Regenerating fixtures clears all results.</p>' : '<p class="hint">Round robin: every team plays every other team. Groups: round robin inside each group, then a knockout built from the standings. Knockout: seeded bracket in the order the teams are listed.</p>'));
    return out;
  }

  /* ----------------------------------------------------------------- bind */
  function bindDetail(root, c) {
    const id = c.id;
    $('[data-act=back]', root).onclick = () => { current = null; P.comps(root); };
    $$('[data-sub]', root).forEach(b => { b.onclick = () => { sub = b.dataset.sub; P.comps(root); }; });
    $$('.comp-actions [data-act], .pane-section [data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'share') { const txt = C().shareText(c); if (navigator.share) { try { await navigator.share({ title: c.name, text: txt }); return; } catch (e) { /* cancelled */ } } try { await navigator.clipboard.writeText(txt); UI().toast('Copied — paste it into WhatsApp', 'ok'); } catch (e) { UI().modal({ title: c.name, body: '<textarea class="input mono" rows="14" readonly>' + esc(txt) + '</textarea>' }); } }
      else if (a === 'print') { const w = window.open('', '_blank'); if (!w) { UI().toast('Allow pop-ups to print.', 'warn'); return; } w.document.write(C().printHTML(c)); w.document.close(); }
      else if (a === 'json') K1.Store.shareOrDownload(new Blob([JSON.stringify({ app: 'k1-tactics-board', v: 2, competition: c }, null, 1)], { type: 'application/json' }), K1.Store.safeName(c.name) + '.k1comp.json', c.name);
      else if (a === 'generate') { if (c.matches.length && !(await UI().confirm('Regenerate fixtures? All results will be cleared.', { ok: 'Regenerate', danger: true }))) return; if (!C().generateFixtures(id)) { UI().toast('Add at least two teams first.', 'warn'); return; } sub = 'fixtures'; P.comps(root); UI().toast('Fixtures generated · ' + c.matches.filter(m => !m.bye).length + ' matches, finishing about ' + c.endTime, 'ok', 3500); }
      else if (a === 'reschedule') { C().schedule(c); C().save(); P.comps(root); UI().toast('Times and pitches recalculated', 'ok'); }
      else if (a === 'groups') { C().assignGroups(id, Number($('[data-sf=groupsCount]', root).value) || 2, false); P.comps(root); }
      else if (a === 'draw') { C().assignGroups(id, Number($('[data-sf=groupsCount]', root).value) || 2, true); P.comps(root); UI().toast('Groups drawn', 'ok'); }
      else if (a === 'knockout') { if (C().createKnockout(id)) { sub = 'bracket'; P.comps(root); UI().toast('Knockout created from the group standings', 'ok'); } else UI().toast('Could not build the knockout — check the group standings.', 'warn'); }
      else if (a === 'delete') { if (await UI().confirm('Delete “' + esc(c.name) + '” and all its results?', { ok: 'Delete', danger: true })) { C().remove(id); current = null; P.comps(root); } }
    }; });
    const fxOurs = $('#fxOurs', root); if (fxOurs) fxOurs.onchange = () => { onlyOurs = fxOurs.checked; P.comps(root); };
    // setup fields
    $$('[data-cf]', root).forEach(inp => { inp.onchange = () => { C().update(id, { [inp.dataset.cf]: inp.value }); if (inp.dataset.cf === 'type') P.comps(root); }; });
    $$('[data-sf]', root).forEach(inp => { inp.onchange = () => { const v = inp.type === 'checkbox' ? inp.checked : (inp.type === 'number' || inp.dataset.sf === 'legs' ? Number(inp.value) : inp.value); C().updateSettings(id, { [inp.dataset.sf]: v }); }; });
    const addForm = $('[data-addteam]', root); if (addForm) addForm.onsubmit = e => { e.preventDefault(); C().addTeams(id, addForm.name.value); P.comps(root); };
    $$('.ct-row', root).forEach(row => {
      const tid = row.dataset.tid;
      $$('[data-tf]', row).forEach(inp => { inp.onchange = () => { const f = inp.dataset.tf; if (f === 'groupId') C().moveToGroup(id, tid, inp.value); else C().updateTeam(id, tid, { [f]: f === 'teamId' ? (inp.value || null) : inp.value }); if (f !== 'name') P.comps(root); }; });
      $('[data-del]', row).onclick = async () => { if (c.matches.length && !(await UI().confirm('Removing a team also removes its fixtures. Continue?', { ok: 'Remove', danger: true }))) return; C().removeTeam(id, tid); P.comps(root); };
    });
    // fixtures
    $$('.fx', root).forEach(fx => {
      const mid = fx.dataset.mid;
      const m = c.matches.find(x => x.id === mid);
      const save = () => {
        const val = f => { const el = $('[data-mf="' + f + '"]', fx); return el ? el.value : undefined; };
        C().recordResult(id, mid, val('homeScore'), val('awayScore'), { pensHome: val('pensHome'), pensAway: val('pensAway'), scorers: val('scorers') });
        C().updateMatch(id, mid, { time: val('time') || m.time, pitch: val('pitch') === '' ? null : Number(val('pitch')) || null });
        P.comps(root);
      };
      $$('[data-mf]', fx).forEach(inp => { inp.onchange = save; inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); }; });
      const live = $('[data-live]', fx); if (live) live.onclick = () => { if (C().startLive(id, mid)) { UI().toast('Match loaded in Match day — press Kick-off when ready', 'ok', 3000); UI().openPane('match'); } };
      const clr = $('[data-clear]', fx); if (clr) clr.onclick = () => { C().recordResult(id, mid, null, null, { pensHome: null, pensAway: null }); P.comps(root); };
    });
    // bracket: tap to enter a score
    $$('.br-match:not(.bye)', root).forEach(el => { el.onclick = () => bracketScore(root, c, el.dataset.mid); });
  }

  function bracketScore(root, c, mid) {
    const m = c.matches.find(x => x.id === mid); if (!m || !m.homeId || !m.awayId) { UI().toast('Both teams must be known first.'); return; }
    const hn = C().teamName(c, m.homeId), an = C().teamName(c, m.awayId);
    const body = '<div class="ko-score"><div><b>' + esc(hn) + '</b><input class="input center" id="koH" type="number" min="0" value="' + (m.homeScore == null ? '' : m.homeScore) + '"></div><span class="muted">–</span><div><b>' + esc(an) + '</b><input class="input center" id="koA" type="number" min="0" value="' + (m.awayScore == null ? '' : m.awayScore) + '"></div></div>' +
      '<div class="ko-score pens"><div><span class="muted small">Pens</span><input class="input center" id="koPH" type="number" min="0" value="' + (m.pensHome == null ? '' : m.pensHome) + '"></div><span class="muted">–</span><div><span class="muted small">Pens</span><input class="input center" id="koPA" type="number" min="0" value="' + (m.pensAway == null ? '' : m.pensAway) + '"></div></div>' +
      '<label class="field"><span>Scorers</span><input class="input" id="koSc" value="' + esc(m.scorers || '') + '" placeholder="Thabo 2, Lebo"></label><p class="hint">Only fill in penalties after a draw.</p>';
    UI().modal({ title: C().matchLabel(c, m), body, actions: [{ label: 'Run live', onClick: () => { if (C().startLive(c.id, mid)) UI().openPane('match'); } }, { label: 'Save', primary: true, onClick: () => { C().recordResult(c.id, mid, $('#koH').value, $('#koA').value, { pensHome: $('#koPH').value, pensAway: $('#koPA').value, scorers: $('#koSc').value }); P.comps(root); } }] });
  }
})(window.K1 = window.K1 || {});
