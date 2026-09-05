/* K1 Shooters Tactics Board — squad / roster management (players belong to teams, see teams.js) */
(function (K1) {
  'use strict';

  const SQ = {};
  const KEY = () => K1.Store.KEYS.squad;
  const POS = ['GK', 'DEF', 'MID', 'FWD'];
  SQ.POS = POS;
  SQ.POS_LABEL = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' };

  const teamId = id => (id === undefined && K1.Teams ? K1.Teams.activeId() : id);

  let cache = null;
  SQ.list = function () { if (!cache) cache = K1.Store.get(KEY(), []); return cache; };
  SQ.save = function (list) { cache = list || cache; K1.Store.set(KEY(), cache); K1.emit('squad', cache); };
  SQ.forTeam = function (id) { id = teamId(id); return SQ.list().filter(p => (id == null ? true : p.teamId === id)); };
  SQ.add = function (p) {
    const list = SQ.list();
    const tid = p && p.teamId !== undefined ? p.teamId : (K1.Teams ? K1.Teams.activeId() : null);
    const player = Object.assign({ id: K1.uid('sq'), name: 'New player', n: SQ.nextNumber(tid), pos: 'MID', role: '', foot: 'R', status: 'available', available: true, notes: '', captain: false, dob: '', height: '', joined: new Date().toISOString().slice(0, 10), guardian: '', phone: '', medical: '', photo: '', attrs: null, teamId: tid }, p || {});
    if (player.teamId === undefined) player.teamId = tid;
    list.push(player);
    SQ.save(list);
    return player;
  };
  SQ.update = function (id, patch) {
    const list = SQ.list(); const p = list.find(x => x.id === id);
    if (p) {
      Object.assign(p, patch);
      if (patch.status) p.available = patch.status === 'available' || patch.status === 'trial';
      if (patch.available !== undefined && !patch.status) p.status = patch.available ? 'available' : 'away';
      if (patch.captain) list.forEach(o => { if (o.id !== id && o.teamId === p.teamId) o.captain = false; });
      SQ.save(list);
    }
    return p;
  };
  SQ.get = id => SQ.list().find(p => p.id === id);
  SQ.remove = function (id) { SQ.save(SQ.list().filter(p => p.id !== id)); };
  SQ.move = function (id, toTeamId) { SQ.update(id, { teamId: toTeamId, captain: false }); };
  SQ.byNumber = function (n, id) { return SQ.forTeam(id).find(p => Number(p.n) === Number(n)); };
  SQ.nextNumber = function (id) { const used = new Set(SQ.forTeam(id).map(p => Number(p.n))); for (let n = 1; n < 100; n++) if (!used.has(n)) return n; return 99; };
  SQ.sorted = function (id) { return SQ.forTeam(id).slice().sort((a, b) => (POS.indexOf(a.pos) - POS.indexOf(b.pos)) || (Number(a.n) - Number(b.n))); };
  SQ.available = id => SQ.sorted(id).filter(p => (K1.Teams ? K1.Teams.isAvailable(p) : p.available !== false));

  /** Assign available players of a team to a formation by position; returns {objects, unassigned}. */
  SQ.lineupObjects = function (formationId, d, id) {
    const fm = K1.formationById(formationId); if (!fm) return { objects: [], unassigned: [] };
    d = d || K1.dims();
    const pool = SQ.available(id).slice();
    const used = new Set();
    const pick = role => {
      let p = pool.find(x => !used.has(x.id) && x.pos === role);
      if (!p && role !== 'GK') p = pool.find(x => !used.has(x.id) && x.pos !== 'GK');
      if (p) used.add(p.id);
      return p || null;
    };
    const objects = [];
    const order = fm.slots.slice().sort((a, b) => (a.p === 'GK' ? -1 : 0) - (b.p === 'GK' ? -1 : 0));
    order.forEach(sl => {
      const role = K1.roleOf(sl.p);
      const p = pick(role);
      const [x, y] = K1.slotToPitch(d, sl, 'home');
      const o = K1.make.player('home', p ? Number(p.n) : sl.n, K1.round(x, 2), K1.round(y, 2), { gk: sl.p === 'GK', pos: sl.p, name: p ? p.name.split(' ').pop() : '', captain: !!(p && p.captain), squadId: p ? p.id : null });
      o.id = 'h_' + (p ? p.n : sl.n);
      objects.push(o);
    });
    const unassigned = pool.filter(p => !used.has(p.id));
    return { objects, unassigned };
  };

  /** Put a team's line-up on the current board in a formation (bench listed as text if requested). */
  SQ.placeLineup = function (formationId, opts) {
    opts = opts || {};
    const d = K1.dims();
    const { objects, unassigned } = SQ.lineupObjects(formationId, d, opts.teamId);
    K1.begin();
    // the board now belongs to this team: photos, names and the home kit follow it
    const tid = teamId(opts.teamId);
    const team = tid && K1.Teams ? K1.Teams.get(tid) : null;
    if (team) { K1.S.doc.teamId = team.id; K1.S.doc.teams.home = { name: K1.Teams.displayName(team), kit: team.kit }; }
    const fr = K1.frame();
    fr.objects = fr.objects.filter(o => !(o.type === 'player' && o.team === 'home'));
    fr.objects.push(...objects);
    if (opts.bench && unassigned.length) {
      const bench = 'BENCH: ' + unassigned.map(p => p.n + ' ' + p.name.split(' ').pop()).join(' · ');
      fr.objects.push(K1.make.text(d.L / 2, d.W + 2.6, bench, { size: 1.9, color: '#ffffff' }));
    }
    if (!fr.objects.find(o => o.type === 'ball')) fr.objects.push(K1.make.ball(d.L / 2, d.W / 2));
    K1.commit('lineup');
    return unassigned;
  };

  SQ.importCSV = function (text, id) {
    // name,number,position,foot,dob,notes   (header optional)
    id = teamId(id);
    const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    let n = 0;
    rows.forEach(r => {
      const cols = r.split(/[,;\t]/).map(c => c.trim().replace(/^"|"$/g, ''));
      if (!cols[0] || /^name$/i.test(cols[0])) return;
      const pos = (cols[2] || 'MID').toUpperCase().slice(0, 3);
      SQ.add({ name: cols[0], n: Number(cols[1]) || SQ.nextNumber(id), pos: POS.includes(pos) ? pos : (pos.startsWith('G') ? 'GK' : pos.startsWith('D') ? 'DEF' : pos.startsWith('F') || pos.startsWith('S') ? 'FWD' : 'MID'), foot: (cols[3] || 'R').toUpperCase()[0], dob: cols[4] || '', notes: cols[5] || '', teamId: id });
      n++;
    });
    return n;
  };
  SQ.exportCSV = function (id) {
    const team = K1.Teams && K1.Teams.get(teamId(id));
    const rows = ['name,number,position,foot,dob,notes'].concat(SQ.sorted(id).map(p => [p.name, p.n, p.pos, p.foot, p.dob || '', (p.notes || '').replace(/,/g, ';')].map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')));
    K1.Store.shareOrDownload(new Blob([rows.join('\n')], { type: 'text/csv' }), 'K1-' + (team ? team.name : 'squad') + '-players.csv', 'K1 squad');
  };

  K1.Squad = SQ;
})(window.K1 = window.K1 || {});
