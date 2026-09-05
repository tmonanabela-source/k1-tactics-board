/* K1 Shooters Tactics Board — Teams pane: age-group teams, player profiles, cards, rankings */
(function (K1) {
  'use strict';

  const P = K1.Panes;
  const S = K1.S;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const UI = () => K1.UI;
  const T = () => K1.Teams;
  const SQ = () => K1.Squad;

  let sortBy = 'pos';
  const SORTS = [['pos', 'Position'], ['rating', 'Rating'], ['goals', 'Goals'], ['att', 'Attendance'], ['num', 'Number'], ['age', 'Age']];
  const section = (title, body, extra) => '<section class="pane-section">' + (title ? '<h4>' + title + (extra || '') + '</h4>' : '') + body + '</section>';
  const kitSwatch = k => '<span class="kit-dot" style="background:' + k.primary + (k.pattern !== 'solid' ? ';background-image:linear-gradient(90deg,' + k.primary + ' 50%,' + k.secondary + ' 50%)' : '') + '"></span>';
  const STATUS_ICON = { available: 'check', injured: 'medkit', suspended: 'card', away: 'eyeOff', trial: 'star' };

  function rankedPlayers(team) {
    const list = SQ().forTeam(team.id).slice();
    const rates = K1.Sessions ? K1.Sessions.attendanceRates(team.id) : [];
    const rate = p => { const r = rates.find(x => x.id === p.id); return r && r.pct != null ? r.pct : null; };
    const stats = {}; list.forEach(p => { stats[p.id] = T().playerSeason(p, team.id); });
    const ovr = p => T().overall(p);
    const cmp = {
      pos: (a, b) => (SQ().POS.indexOf(a.pos) - SQ().POS.indexOf(b.pos)) || (Number(a.n) - Number(b.n)),
      rating: (a, b) => ((ovr(b) || -1) - (ovr(a) || -1)) || (Number(a.n) - Number(b.n)),
      goals: (a, b) => (stats[b.id].goals - stats[a.id].goals) || (stats[b.id].assists - stats[a.id].assists) || (Number(a.n) - Number(b.n)),
      att: (a, b) => ((rate(b) == null ? -1 : rate(b)) - (rate(a) == null ? -1 : rate(a))) || (Number(a.n) - Number(b.n)),
      num: (a, b) => Number(a.n) - Number(b.n),
      age: (a, b) => ((T().age(b.dob) == null ? -1 : T().age(b.dob)) - (T().age(a.dob) == null ? -1 : T().age(a.dob))) || (Number(a.n) - Number(b.n)),
    }[sortBy] || ((a, b) => 0);
    list.sort(cmp);
    return { list, rate, stats };
  }

  function playerRow(p, team, i, ctx) {
    const ovr = T().overall(p);
    const tier = T().tier(ovr);
    const st = T().statusOf(p);
    const age = T().age(p.dob);
    const elig = T().eligibility(p, team);
    const stat = ctx.stats[p.id];
    const att = ctx.rate(p);
    const ranked = ['rating', 'goals', 'att'].includes(sortBy);
    const metric = sortBy === 'goals' ? stat.goals + ' G · ' + stat.assists + ' A' : sortBy === 'att' ? (att == null ? '–' : att + '% training') : (age != null ? age + ' yrs' : '') + (stat.goals ? ' · ' + stat.goals + ' G' : '') + (att != null ? ' · ' + att + '%' : '');
    return '<div class="player-row st-' + st + '" data-id="' + p.id + '">' +
      (ranked ? '<span class="rank r' + (i + 1) + '">' + (i + 1) + '</span>' : '<span class="rank blank"></span>') +
      '<span class="avatar' + (p.photo ? '' : ' initials') + '">' + (p.photo ? '<img src="' + p.photo + '" alt="">' : esc(T().initials(p.name))) + '</span>' +
      '<span class="ovr tier-' + tier + '" title="Overall rating">' + (ovr == null ? '–' : ovr) + '</span>' +
      '<span class="pinfo"><span class="pname"><b class="pn">' + esc(p.n) + '</b> ' + esc(p.name) + (p.captain ? ' <b class="cap">C</b>' : '') + (elig === 'over' ? ' <em class="elig over" title="Older than this age group on 1 January">overage</em>' : elig === 'young' ? ' <em class="elig young" title="Playing up an age group">playing up</em>' : '') + '</span><small>' + esc(metric) + '</small></span>' +
      '<span class="pos pos-' + p.pos + '">' + esc(p.role || p.pos) + '</span>' +
      '<span class="status-ic" title="' + esc((T().STATUS.find(x => x[0] === st) || [])[1] || st) + '">' + icon(STATUS_ICON[st] || 'check', { size: 14 }) + '</span>' +
      '</div>';
  }

  /* ================================================================= PANE */
  P.team = function (root) {
    const team = T().active();
    const teams = T().sorted();
    const { list, rate, stats } = rankedPlayers(team);
    const kit = K1.kitById(team.kit);
    const d = K1.dims();
    const nPlayers = T().playersFor(team.pitch);
    const forms = K1.formationsFor(nPlayers);
    const unassigned = T().unassigned();
    const avg = T().avgAge(list);
    const mismatch = d.players !== nPlayers;
    let s = '';
    s += '<div class="team-chips">' + teams.map(t => '<button class="team-chip' + (t.id === team.id ? ' on' : '') + '" data-team="' + t.id + '"><b>' + esc(t.name) + '</b><span>' + esc(T().formatLabel(t.pitch)) + ' · ' + T().players(t.id).length + '</span></button>').join('') + '<button class="team-chip add" data-act="newteam" title="New team">' + icon('plus', { size: 18 }) + '<span>Team</span></button></div>';
    s += '<div class="team-card"><div class="tc-head"><div class="tc-name">' + kitSwatch(kit) + '<b>' + esc(T().displayName(team)) + '</b><span class="tag">' + esc(T().formatLabel(team.pitch)) + '</span></div><button class="icon-btn sm" data-act="editteam" title="Edit team">' + icon('edit', { size: 15 }) + '</button></div>' +
      '<div class="tc-meta">' + list.length + ' player' + (list.length === 1 ? '' : 's') + (avg != null ? ' · avg age ' + avg : '') + (team.coach ? ' · coach ' + esc(team.coach) : '') + ' · season ' + esc(team.season) + '</div>' +
      '<div class="row wrap"><button class="btn btn-sm btn-primary" data-act="place"' + (list.length ? '' : ' disabled') + '>' + icon('users', { size: 15 }) + '<span>Line-up on board</span></button><button class="btn btn-sm" data-act="matchday">' + icon('whistle', { size: 15 }) + '<span>Match day</span></button><button class="btn btn-sm" data-act="session">' + icon('calendar', { size: 15 }) + '<span>New session</span></button></div></div>';
    s += section('Line-up', (mismatch ? '<p class="hint warn">The board is ' + d.players + '-a-side; ' + esc(team.name) + ' plays ' + esc(T().formatLabel(team.pitch)) + '. <button class="link" data-act="switchpitch">Switch the board to ' + esc(T().formatLabel(team.pitch)) + '</button></p>' : '') +
      '<div class="row"><select class="select" id="luForm">' + forms.map(f => '<option value="' + f.id + '"' + (team.formation === f.id ? ' selected' : '') + '>' + esc(f.name) + '</option>').join('') + '</select></div>' +
      '<div class="row wrap"><button class="btn btn-sm btn-primary" data-act="place"' + (list.length ? '' : ' disabled') + '>' + icon('users', { size: 15 }) + '<span>Place XI</span></button><button class="btn btn-sm" data-act="placeBench"' + (list.length ? '' : ' disabled') + '>' + icon('list', { size: 15 }) + '<span>XI + bench label</span></button><button class="btn btn-sm" data-act="card"' + (list.length ? '' : ' disabled') + '>' + icon('image', { size: 15 }) + '<span>Line-up card</span></button></div>' +
      '<p class="muted small">Available players fill positions by role (GK → DEF → MID → FWD). Players with photos show their face on the board.</p>');
    s += section('Players · ' + list.length, (list.length ? '<div class="row between"><span class="row-label">Sort / rank</span><select class="select sm" id="sortSel">' + SORTS.map(o => '<option value="' + o[0] + '"' + (o[0] === sortBy ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div><div class="player-list">' + list.map((p, i) => playerRow(p, team, i, { rate, stats })).join('') + '</div>' : '<div class="empty-card">' + icon('users', { size: 28 }) + '<p>No players in ' + esc(team.name) + ' yet. Add them below — then open a player to add a photo, ratings and details.</p></div>') +
      '<form class="add-player" data-add><input class="input" name="name" placeholder="Player name" required><input class="input num" name="n" type="number" min="1" max="99" placeholder="#" value="' + SQ().nextNumber(team.id) + '"><select class="select" name="pos">' + SQ().POS.map(r => '<option value="' + r + '"' + (r === 'MID' ? ' selected' : '') + '>' + r + '</option>').join('') + '</select><button class="btn btn-primary btn-sm" type="submit">' + icon('plus', { size: 15 }) + '<span>Add</span></button></form>' +
      '<div class="row wrap"><button class="btn btn-sm" data-act="csvin">' + icon('upload', { size: 15 }) + '<span>Import CSV</span></button><button class="btn btn-sm" data-act="csvout"' + (list.length ? '' : ' disabled') + '>' + icon('download', { size: 15 }) + '<span>Export CSV</span></button><button class="btn btn-sm" data-act="fromboard" title="Add the home players on the board to this team">' + icon('arrowDown', { size: 15 }) + '<span>From board</span></button><button class="btn btn-sm" data-act="cards"' + (list.length ? '' : ' disabled') + ' title="Export every player card as a PNG">' + icon('image', { size: 15 }) + '<span>All cards</span></button></div>');
    if (unassigned.length) s += section('Unassigned players · ' + unassigned.length, '<div class="player-list">' + unassigned.map(p => '<div class="player-row" data-id="' + p.id + '"><span class="rank blank"></span><span class="avatar' + (p.photo ? '' : ' initials') + '">' + (p.photo ? '<img src="' + p.photo + '" alt="">' : esc(T().initials(p.name))) + '</span><span class="pinfo"><span class="pname"><b class="pn">' + esc(p.n) + '</b> ' + esc(p.name) + '</span></span><button class="btn btn-sm" data-assign="' + p.id + '">Add to ' + esc(team.name) + '</button></div>').join('') + '</div>');
    root.innerHTML = s;

    $$('[data-team]', root).forEach(b => { b.onclick = () => { T().setActive(b.dataset.team); }; });
    $('#sortSel', root) && ($('#sortSel', root).onchange = e => { sortBy = e.target.value; P.team(root); });
    $('[data-add]', root).onsubmit = e => { e.preventDefault(); const f = e.target; const p = SQ().add({ name: f.name.value.trim(), n: Number(f.n.value) || SQ().nextNumber(team.id), pos: f.pos.value, teamId: team.id }); UI().toast(esc(p.name) + ' added to ' + esc(team.name), 'ok', 1500); };
    $$('.player-row[data-id]', root).forEach(row => { row.onclick = e => { if (e.target.closest('button')) return; P.playerProfile(row.dataset.id); }; });
    $$('[data-assign]', root).forEach(b => { b.onclick = () => SQ().move(b.dataset.assign, team.id); });
    $$('[data-act]', root).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'newteam') P.editTeam(null);
      else if (a === 'editteam') P.editTeam(team.id);
      else if (a === 'switchpitch') { K1.mutate(() => { S.doc.pitch.type = team.pitch; }, 'pitch'); K1.Render.invalidatePitch(); K1.Render.layout(true); P.team(root); }
      else if (a === 'place' || a === 'placeBench') { const fid = $('#luForm', root).value; T().update(team.id, { formation: fid }); if (mismatch) { K1.mutate(() => { S.doc.pitch.type = team.pitch; }, 'pitch'); K1.Render.invalidatePitch(); K1.Render.layout(true); } const un = SQ().placeLineup(fid, { bench: a === 'placeBench', teamId: team.id }); UI().toast(esc(team.name) + ' line-up placed' + (un.length ? ' · ' + un.length + ' on the bench' : ''), 'ok'); if (K1.isMobile()) UI().closeSheet(); }
      else if (a === 'card') { const fid = $('#luForm', root).value; if (mismatch) { K1.mutate(() => { S.doc.pitch.type = team.pitch; }, 'pitch'); K1.Render.invalidatePitch(); K1.Render.layout(true); } SQ().placeLineup(fid, { bench: true, teamId: team.id }); const prev = K1.settings.showNames; K1.settings.showNames = true; await K1.Store.exportPNG({ width: 2000, title: T().displayName(team) + ' · line-up' }); K1.settings.showNames = prev; K1.Render.renderObjects(); }
      else if (a === 'matchday') { K1.Match.setTeam(team.id); UI().openPane('match'); }
      else if (a === 'session') { const ss = K1.Sessions.create({ title: team.name + ' training', teamId: team.id }); P.openSession && P.openSession(ss.id); UI().openPane('sessions'); }
      else if (a === 'csvin') { const f = await K1.Store.pickFile('.csv,text/csv,text/plain'); if (f) { const n = SQ().importCSV(await K1.Store.readFileText(f), team.id); UI().toast('Imported ' + n + ' players into ' + esc(team.name), 'ok'); } }
      else if (a === 'csvout') SQ().exportCSV(team.id);
      else if (a === 'fromboard') { const ps = K1.objects().filter(o => o.type === 'player' && o.team === 'home'); let n = 0; ps.forEach(o => { if (!SQ().byNumber(o.n, team.id)) { SQ().add({ name: o.name || 'Player ' + o.n, n: o.n, pos: o.gk ? 'GK' : (o.pos ? K1.roleOf(o.pos) : 'MID'), teamId: team.id }); n++; } }); UI().toast('Added ' + n + ' players from the board', 'ok'); }
      else if (a === 'cards') { for (const p of list) { const svg = T().cardSVG(p, team, { width: 900 }); const canvas = await K1.Store.svgToCanvas(svg, 900, 1260); const blob = await new Promise(res => canvas.toBlob(res, 'image/png')); K1.Store.downloadBlob(blob, 'K1-card-' + K1.Store.safeName(p.name) + '.png'); await new Promise(r => setTimeout(r, 350)); } UI().toast('Exported ' + list.length + ' cards', 'ok'); }
    }; });
  };

  /* ============================================================ TEAM MODAL */
  P.editTeam = function (id) {
    const t = id ? T().get(id) : { name: '', ageGroup: 'U13', pitch: 'full', kit: 'k1', coach: '', season: String(new Date().getFullYear()), notes: '' };
    const body = '<div class="form-grid">' +
      '<label class="field"><span>Team name</span><input class="input" id="tmName" value="' + esc(t.name) + '" placeholder="e.g. U13"></label>' +
      '<label class="field"><span>Age group</span><select class="select" id="tmAge">' + T().AGE_GROUPS.map(a => '<option' + (a === t.ageGroup ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></label>' +
      '<label class="field"><span>Format</span><select class="select" id="tmPitch">' + T().FORMATS.map(f => '<option value="' + f[0] + '"' + (f[0] === t.pitch ? ' selected' : '') + '>' + f[1] + '</option>').join('') + '</select></label>' +
      '<label class="field"><span>Kit</span><select class="select" id="tmKit">' + K1.KITS.map(k => '<option value="' + k.id + '"' + (k.id === t.kit ? ' selected' : '') + '>' + esc(k.name) + '</option>').join('') + '</select></label>' +
      '<label class="field"><span>Coach</span><input class="input" id="tmCoach" value="' + esc(t.coach) + '"></label>' +
      '<label class="field"><span>Season (year)</span><input class="input" id="tmSeason" type="number" value="' + esc(t.season) + '"></label>' +
      '<label class="field span2"><span>Notes</span><textarea class="input" id="tmNotes" rows="2" placeholder="Training days, venue, league…">' + esc(t.notes || '') + '</textarea></label></div>' +
      '<p class="hint">Recommended formats: U6–U8 4v4 or 5v5 · U9–U10 7v7 · U11–U12 9v9 · U13 and up 11v11.</p>';
    const actions = [];
    if (id && T().list().length > 1) actions.push({ label: 'Delete team', danger: true, onClick: async () => { if (await UI().confirm('Delete ' + esc(t.name) + '? Its players become unassigned (not deleted).', { ok: 'Delete', danger: true })) { T().remove(id); K1.emit('squad'); } else return false; } });
    actions.push({ label: id ? 'Save' : 'Create team', primary: true, onClick: () => {
      const patch = { name: $('#tmName').value.trim() || $('#tmAge').value, ageGroup: $('#tmAge').value, pitch: $('#tmPitch').value, kit: $('#tmKit').value, coach: $('#tmCoach').value.trim(), season: $('#tmSeason').value || t.season, notes: $('#tmNotes').value };
      if (id) T().update(id, patch); else { const nt = T().create(patch); T().setActive(nt.id); }
      K1.emit('squad');
    } });
    const m = UI().modal({ title: id ? 'Edit team' : 'New team', body, actions });
    $('#tmAge', m.body).onchange = e => { if (!id) { $('#tmPitch', m.body).value = T().suggestPitch(e.target.value); if (!$('#tmName', m.body).value) $('#tmName', m.body).value = e.target.value; } };
  };

  /* ========================================================= PLAYER PROFILE */
  P.playerProfile = function (id) {
    const p = SQ().get(id); if (!p) return;
    const team = T().get(p.teamId) || T().active();
    const teams = T().sorted();
    const season = T().playerSeason(p, team.id);
    const rates = K1.Sessions ? K1.Sessions.attendanceRates(team.id) : [];
    const ar = rates.find(x => x.id === p.id);
    const attrs = Object.assign({ pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }, p.attrs || {});
    const age = T().age(p.dob);
    const elig = T().eligibility(p, team);
    const body = '<div class="profile">' +
      '<div class="profile-card"><div class="card-holder" id="cardHolder">' + T().cardSVG(p, team, { width: 240 }) + '</div>' +
        '<div class="row wrap center"><button class="btn btn-sm" data-act="photo">' + icon('camera', { size: 15 }) + '<span>' + (p.photo ? 'Change photo' : 'Add photo') + '</span></button>' + (p.photo ? '<button class="btn btn-sm btn-ghost" data-act="nophoto">Remove</button>' : '') + '<button class="btn btn-sm" data-act="exportcard">' + icon('image', { size: 15 }) + '<span>Card PNG</span></button></div>' +
        '<div class="radar-wrap" id="radarWrap">' + T().radarSVG(attrs, 170) + '</div>' +
        '<div class="season-line"><span><b>' + season.goals + '</b> goals</span><span><b>' + season.assists + '</b> assists</span><span><b>' + season.cards + '</b> cards</span><span><b>' + (ar && ar.pct != null ? ar.pct + '%' : '–') + '</b> training</span></div></div>' +
      '<div class="profile-form"><div class="form-grid">' +
        '<label class="field span2"><span>Full name</span><input class="input" id="ppName" value="' + esc(p.name) + '"></label>' +
        '<label class="field"><span>Number</span><input class="input" id="ppN" type="number" min="1" max="99" value="' + esc(p.n) + '"></label>' +
        '<label class="field"><span>Position</span><select class="select" id="ppPos">' + SQ().POS.map(r => '<option value="' + r + '"' + (r === p.pos ? ' selected' : '') + '>' + SQ().POS_LABEL[r] + '</option>').join('') + '</select></label>' +
        '<label class="field"><span>Role on the pitch</span><input class="input" id="ppRole" value="' + esc(p.role || '') + '" placeholder="e.g. RB, CAM, ST"></label>' +
        '<label class="field"><span>Foot</span><select class="select" id="ppFoot">' + [['R', 'Right'], ['L', 'Left'], ['B', 'Both']].map(f => '<option value="' + f[0] + '"' + (f[0] === p.foot ? ' selected' : '') + '>' + f[1] + '</option>').join('') + '</select></label>' +
        '<label class="field"><span>Date of birth' + (age != null ? ' · ' + age + ' yrs' : '') + (elig === 'over' ? ' <em class="elig over">overage for ' + esc(team.name) + '</em>' : elig === 'young' ? ' <em class="elig young">playing up</em>' : '') + '</span><input class="input" id="ppDob" type="date" value="' + esc(p.dob || '') + '"></label>' +
        '<label class="field"><span>Height (cm)</span><input class="input" id="ppHeight" type="number" value="' + esc(p.height || '') + '"></label>' +
        '<label class="field"><span>Team</span><select class="select" id="ppTeam">' + teams.map(t => '<option value="' + t.id + '"' + (t.id === p.teamId ? ' selected' : '') + '>' + esc(t.name) + ' · ' + esc(T().formatLabel(t.pitch)) + '</option>').join('') + '<option value=""' + (!p.teamId ? ' selected' : '') + '>Unassigned</option></select></label>' +
        '<label class="field"><span>Status</span><select class="select" id="ppStatus">' + T().STATUS.map(x => '<option value="' + x[0] + '"' + (x[0] === T().statusOf(p) ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
        '<label class="field"><span>Joined</span><input class="input" id="ppJoined" type="date" value="' + esc(p.joined || '') + '"></label>' +
        '<label class="check"><input type="checkbox" id="ppCap"' + (p.captain ? ' checked' : '') + '><span>Captain</span></label>' +
        '</div>' +
        '<div class="field-label">Attributes <span class="muted">(1–99, like FC Mobile) · overall <b id="ppOvr">' + (T().overall(p) == null ? '–' : T().overall(p)) + '</b></span></div>' +
        '<div class="attr-grid">' + T().ATTRS.map(a => '<label class="attr"><span>' + a[1] + '</span><input type="range" min="0" max="99" value="' + (attrs[a[0]] || 0) + '" data-attr="' + a[0] + '"><b data-attrval="' + a[0] + '">' + (attrs[a[0]] || '–') + '</b></label>').join('') + '</div>' +
        '<div class="form-grid">' +
        '<label class="field"><span>Parent / guardian</span><input class="input" id="ppGuardian" value="' + esc(p.guardian || '') + '"></label>' +
        '<label class="field"><span>Phone</span><input class="input" id="ppPhone" type="tel" value="' + esc(p.phone || '') + '">' + (p.phone ? '<a class="small" href="tel:' + esc(p.phone) + '">Call</a>' : '') + '</label>' +
        '<label class="field span2"><span>Medical / allergies</span><input class="input" id="ppMedical" value="' + esc(p.medical || '') + '"></label>' +
        '<label class="field span2"><span>Coach notes</span><textarea class="input" id="ppNotes" rows="3" placeholder="Strengths, development goals, what to work on…">' + esc(p.notes || '') + '</textarea></label>' +
        '</div></div></div>';
    const m = UI().modal({ title: 'Player profile', wide: true, cls: 'player-modal', body, actions: [
      { label: 'Delete', danger: true, onClick: async () => { if (await UI().confirm('Remove ' + esc(p.name) + ' from the club?', { ok: 'Remove', danger: true })) SQ().remove(id); else return false; } },
      { label: 'Save', primary: true, onClick: () => {
        const attrsOut = {}; let any = false;
        $$('[data-attr]', m.body).forEach(inp => { const v = Number(inp.value); attrsOut[inp.dataset.attr] = v; if (v > 0) any = true; });
        const patch = { name: $('#ppName').value.trim() || p.name, n: Number($('#ppN').value) || p.n, pos: $('#ppPos').value, role: $('#ppRole').value.trim().toUpperCase(), foot: $('#ppFoot').value, dob: $('#ppDob').value, height: $('#ppHeight').value, teamId: $('#ppTeam').value || null, status: $('#ppStatus').value, joined: $('#ppJoined').value, captain: $('#ppCap').checked, attrs: any ? attrsOut : null, guardian: $('#ppGuardian').value.trim(), phone: $('#ppPhone').value.trim(), medical: $('#ppMedical').value.trim(), notes: $('#ppNotes').value, photo: pending.photo === undefined ? p.photo : pending.photo };
        SQ().update(id, patch);
        UI().toast('Saved ' + esc(patch.name), 'ok', 1400);
      } },
    ] });
    const pending = {};
    const preview = () => {
      const attrsNow = {}; $$('[data-attr]', m.body).forEach(inp => { attrsNow[inp.dataset.attr] = Number(inp.value); });
      const tmp = Object.assign({}, p, { name: $('#ppName', m.body).value, n: $('#ppN', m.body).value, pos: $('#ppPos', m.body).value, role: $('#ppRole', m.body).value.trim().toUpperCase(), attrs: Object.values(attrsNow).some(v => v > 0) ? attrsNow : null, photo: pending.photo === undefined ? p.photo : pending.photo });
      const tm = T().get($('#ppTeam', m.body).value) || team;
      $('#cardHolder', m.body).innerHTML = T().cardSVG(tmp, tm, { width: 240 });
      $('#radarWrap', m.body).innerHTML = T().radarSVG(attrsNow, 170);
      const o = T().overall(tmp); $('#ppOvr', m.body).textContent = o == null ? '–' : o;
    };
    $$('[data-attr]', m.body).forEach(inp => { inp.oninput = () => { $('[data-attrval="' + inp.dataset.attr + '"]', m.body).textContent = Number(inp.value) || '–'; preview(); }; });
    ['#ppName', '#ppN', '#ppPos', '#ppRole', '#ppTeam'].forEach(sel => { const el = $(sel, m.body); el.addEventListener('input', preview); el.addEventListener('change', preview); });
    $$('[data-act]', m.body).forEach(b => { b.onclick = async () => {
      const a = b.dataset.act;
      if (a === 'photo') { const f = await K1.Store.pickFile('image/*'); if (f) { try { pending.photo = await T().readPhoto(f, 260); preview(); b.querySelector('span').textContent = 'Change photo'; } catch (e) { UI().toast('That file is not an image.', 'warn'); } } }
      else if (a === 'nophoto') { pending.photo = ''; preview(); }
      else if (a === 'exportcard') { const attrsNow = {}; $$('[data-attr]', m.body).forEach(inp => { attrsNow[inp.dataset.attr] = Number(inp.value); }); const tmp = Object.assign({}, p, { name: $('#ppName', m.body).value, n: $('#ppN', m.body).value, pos: $('#ppPos', m.body).value, role: $('#ppRole', m.body).value.trim().toUpperCase(), attrs: Object.values(attrsNow).some(v => v > 0) ? attrsNow : null, photo: pending.photo === undefined ? p.photo : pending.photo }); T().exportCard(tmp, T().get($('#ppTeam', m.body).value) || team); }
    }; });
  };
  // the old quick editor now opens the full profile
  P.editSquadPlayer = P.playerProfile;
})(window.K1 = window.K1 || {});
