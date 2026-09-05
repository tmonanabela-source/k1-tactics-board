/* K1 Shooters Tactics Board — teams (age groups), player profiles, ratings and player cards */
(function (K1) {
  'use strict';

  const T = {};
  const KEY = () => K1.Store.KEYS.teams;
  const AKEY = () => K1.Store.KEYS.activeTeam;

  T.AGE_GROUPS = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U19', 'Seniors'];
  T.FORMATS = [['full', '11v11'], ['nine', '9v9'], ['seven', '7v7'], ['five', '5v5'], ['four', '4v4'], ['futsal', 'Futsal']];
  const DEFAULT_TEAMS = [['U7', 'five'], ['U9', 'seven'], ['U11', 'nine'], ['U13', 'full'], ['U15', 'full'], ['U17', 'full']];

  /** Recommended format for an age group (change per team any time). */
  T.suggestPitch = function (ageGroup) {
    const n = parseInt(String(ageGroup || '').replace(/\D/g, ''), 10);
    if (!n) return 'full';
    if (n <= 8) return 'five';
    if (n <= 10) return 'seven';
    if (n <= 12) return 'nine';
    return 'full';
  };
  T.formatLabel = pitch => (T.FORMATS.find(f => f[0] === pitch) || ['full', '11v11'])[1];
  T.playersFor = pitch => (K1.PITCHES[pitch] || K1.PITCHES.full).players;

  /* ------------------------------------------------------------------ teams */
  let cache = null, active = null;
  function make(name, pitch) { return { id: K1.uid('tm'), name, ageGroup: name, pitch: pitch || 'full', kit: 'k1', coach: '', season: String(new Date().getFullYear()), notes: '', createdAt: Date.now() }; }
  T.list = function () { if (!cache) cache = K1.Store.get(KEY(), null) || []; return cache; };
  T.save = function () { K1.Store.set(KEY(), cache); K1.emit('teams'); };
  T.init = function () {
    if (!T.list().length) { DEFAULT_TEAMS.forEach(d => cache.push(make(d[0], d[1]))); T.save(); }
    active = K1.Store.get(AKEY(), null);
    if (!T.get(active)) { const u13 = T.list().find(t => t.name === 'U13'); active = (u13 || T.list()[0]).id; K1.Store.set(AKEY(), active); }
  };
  T.get = id => T.list().find(t => t.id === id) || null;
  T.create = function (opts) { const t = Object.assign(make(opts.name || 'New team', opts.pitch || T.suggestPitch(opts.ageGroup || opts.name)), opts); cache.push(t); T.save(); return t; };
  T.update = function (id, patch) { const t = T.get(id); if (t) { Object.assign(t, patch); T.save(); } return t; };
  T.remove = function (id) {
    if (T.list().length <= 1) return false;
    K1.Squad.list().forEach(p => { if (p.teamId === id) p.teamId = null; });
    K1.Squad.save();
    cache = cache.filter(t => t.id !== id);
    if (active === id) { active = cache[0].id; K1.Store.set(AKEY(), active); }
    T.save();
    return true;
  };
  T.active = () => T.get(active) || T.list()[0] || null;
  T.activeId = () => { const a = T.active(); return a ? a.id : null; };
  T.setActive = function (id) { if (!T.get(id)) return; active = id; K1.Store.set(AKEY(), id); K1.emit('teams'); K1.emit('squad'); };
  T.sorted = () => T.list().slice().sort((a, b) => { const na = parseInt(String(a.ageGroup).replace(/\D/g, ''), 10) || 99, nb = parseInt(String(b.ageGroup).replace(/\D/g, ''), 10) || 99; return na - nb || a.name.localeCompare(b.name); });
  T.players = id => K1.Squad.list().filter(p => p.teamId === id);
  T.unassigned = () => K1.Squad.list().filter(p => !p.teamId || !T.get(p.teamId));
  T.displayName = t => (K1.settings.homeName || 'K1 Shooters') + ' ' + t.name;

  /* -------------------------------------------------------------------- ages */
  T.age = function (dob, at) {
    if (!dob) return null;
    const d = new Date(dob); if (isNaN(d)) return null;
    const now = at ? new Date(at) : new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  };
  /** Age-group check: 'ok', 'over' (too old for the band) or 'young' (playing up ≥ 2 years). Uses age on 1 January of the season. */
  T.eligibility = function (player, team) {
    if (!player.dob || !team) return null;
    const band = parseInt(String(team.ageGroup).replace(/\D/g, ''), 10);
    if (!band) return null;
    const seasonYear = parseInt(team.season, 10) || new Date().getFullYear();
    // age on 1 January of the season: "U13" = still 12 (or younger) on that date
    const ageAtCutoff = T.age(player.dob, new Date(seasonYear, 0, 1));
    if (ageAtCutoff == null) return null;
    if (ageAtCutoff >= band) return 'over';
    if (ageAtCutoff <= band - 4) return 'young';
    return 'ok';
  };
  T.avgAge = function (players) { const ages = players.map(p => T.age(p.dob)).filter(a => a != null); return ages.length ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length * 10) / 10 : null; };

  /* ---------------------------------------------------------------- ratings */
  T.ATTRS = [['pac', 'Pace'], ['sho', 'Shooting'], ['pas', 'Passing'], ['dri', 'Dribbling'], ['def', 'Defending'], ['phy', 'Physical']];
  const W = {
    GK: { def: .40, phy: .25, pas: .15, pac: .10, dri: .05, sho: .05 },
    DEF: { def: .40, phy: .20, pac: .15, pas: .15, dri: .05, sho: .05 },
    MID: { pas: .30, dri: .25, def: .15, pac: .10, sho: .10, phy: .10 },
    FWD: { sho: .35, pac: .20, dri: .20, pas: .10, phy: .10, def: .05 },
  };
  T.overall = function (p) {
    const a = p && p.attrs; if (!a) return null;
    const w = W[p.pos] || W.MID;
    let s = 0, ws = 0;
    Object.keys(w).forEach(k => { const v = Number(a[k]); if (v > 0) { s += v * w[k]; ws += w[k]; } });
    return ws ? Math.round(s / ws) : null;
  };
  T.tier = r => (r == null ? 'none' : r >= 80 ? 'elite' : r >= 70 ? 'gold' : r >= 60 ? 'silver' : 'bronze');
  T.initials = name => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('') || '?';
  T.STATUS = [['available', 'Available'], ['injured', 'Injured'], ['suspended', 'Suspended'], ['away', 'Away'], ['trial', 'On trial']];
  T.statusOf = p => (p.status || (p.available === false ? 'away' : 'available'));
  T.isAvailable = p => T.statusOf(p) === 'available' || T.statusOf(p) === 'trial';

  /* ------------------------------------------------------------ photos */
  T.readPhoto = function (file, max) {
    max = max || 240;
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * s), h = Math.round(img.height * s);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', .82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Not an image')); };
      img.src = url;
    });
  };

  /* ------------------------------------------------------ season per player */
  /** Goals, assists and cards for a player from this team's archived matches (event player text like "9 Mokoena"). */
  T.playerSeason = function (p, teamId) {
    const surname = String(p.name || '').trim().split(/\s+/).pop().toLowerCase();
    const num = String(p.n);
    const hit = txt => { const s = String(txt || '').toLowerCase(); if (!s) return false; const toks = s.split(/[^a-z0-9]+/).filter(Boolean); return toks.includes(num) || (surname.length > 2 && s.includes(surname)); };
    const out = { goals: 0, assists: 0, cards: 0 };
    const matches = K1.Match.history().map(h => h.state).filter(s => s && (!teamId || s.teamId === teamId));
    const live = K1.Match.state(); if (live.events.length && (!teamId || live.teamId === teamId)) matches.push(live);
    matches.forEach(s => s.events.forEach(e => {
      if (e.team !== 'home') return;
      if ((e.type === 'goal' || e.type === 'pen_goal') && hit(e.player)) out.goals++;
      if ((e.type === 'goal' || e.type === 'pen_goal') && e.note) { const m = /assist:\s*([^·]+)/i.exec(e.note); if (m && hit(m[1])) out.assists++; }
      if ((e.type === 'yellow' || e.type === 'red') && hit(e.player)) out.cards++;
    }));
    return out;
  };

  /* --------------------------------------------------------------- visuals */
  const esc = s => K1.esc(s);
  const TIER_COLORS = {
    elite: ['#3b0764', '#a21caf', '#f5d0fe'],
    gold: ['#8a6508', '#f5c542', '#fff3c4'],
    silver: ['#4b5563', '#c7ced6', '#f3f4f6'],
    bronze: ['#5c2f12', '#c27a3a', '#f6d9bf'],
    none: ['#0f172a', '#334155', '#cbd5e1'],
  };

  /** Hexagon radar for the six attributes. */
  T.radarSVG = function (attrs, size, color) {
    size = size || 160; color = color || '#f5b301';
    const c = size / 2, r = size * .38;
    const keys = T.ATTRS.map(a => a[0]);
    const pt = (i, v) => { const ang = -Math.PI / 2 + i * Math.PI / 3; return [c + Math.cos(ang) * r * v, c + Math.sin(ang) * r * v]; };
    let s = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" class="radar">';
    [.25, .5, .75, 1].forEach(k => { s += '<polygon points="' + keys.map((_, i) => pt(i, k).join(',')).join(' ') + '" fill="none" stroke="rgba(148,163,184,.35)" stroke-width="1"/>'; });
    keys.forEach((_, i) => { const p = pt(i, 1); s += '<line x1="' + c + '" y1="' + c + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="rgba(148,163,184,.35)"/>'; });
    const vals = keys.map(k => Math.max(0, Math.min(99, Number((attrs || {})[k]) || 0)) / 99);
    s += '<polygon points="' + vals.map((v, i) => pt(i, v).join(',')).join(' ') + '" fill="' + color + '" fill-opacity=".3" stroke="' + color + '" stroke-width="2"/>';
    keys.forEach((k, i) => { const p = pt(i, 1.22); s += '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="800" fill="currentColor">' + k.toUpperCase() + '</text>'; });
    return s + '</svg>';
  };

  /** FC-style player card (300 × 420 viewBox). */
  T.cardSVG = function (p, team, opts) {
    opts = opts || {};
    const ovr = T.overall(p);
    const tier = T.tier(ovr);
    const [c0, c1, c2] = TIER_COLORS[tier];
    const a = p.attrs || {};
    const val = k => (a[k] > 0 ? a[k] : '–');
    const logo = K1.brandLogo ? K1.brandLogo() : null;
    const name = String(p.name || '').trim();
    const surname = name.split(/\s+/).pop().toUpperCase();
    const pos = p.role || p.pos || 'MID';
    const clubLine = ((K1.settings.homeName || 'K1 SHOOTERS') + (team ? ' · ' + team.name : '') + (p.n ? ' · #' + p.n : '')).toUpperCase();
    const id = 'pc' + (p.id || 'x').replace(/[^a-z0-9]/gi, '');
    let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="' + (opts.width || 300) + '" height="' + Math.round((opts.width || 300) * 1.4) + '" style="font-family:Inter,\'Segoe UI\',Arial,sans-serif">';
    s += '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset=".55" stop-color="' + c0 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient><clipPath id="' + id + 'ph"><circle cx="190" cy="140" r="66"/></clipPath></defs>';
    s += '<path d="M40 14h220a18 18 0 0 1 18 18v290l-128 84L22 322V32a18 18 0 0 1 18-18z" fill="url(#' + id + 'g)" stroke="' + c2 + '" stroke-opacity=".7" stroke-width="3"/>';
    s += '<path d="M40 14h220a18 18 0 0 1 18 18v290l-128 84L22 322V32a18 18 0 0 1 18-18z" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>';
    // rating + position
    s += '<text x="52" y="112" font-size="66" font-weight="900" fill="' + c2 + '" letter-spacing="-2">' + (ovr == null ? '–' : ovr) + '</text>';
    s += '<text x="54" y="140" font-size="22" font-weight="800" fill="' + c2 + '" letter-spacing="1">' + esc(pos) + '</text>';
    if (logo) s += '<image href="' + logo + '" x="44" y="152" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>';
    // photo or initials
    s += '<circle cx="190" cy="140" r="68" fill="rgba(255,255,255,.14)"/>';
    if (p.photo) s += '<image href="' + p.photo + '" x="124" y="74" width="132" height="132" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + 'ph)"/>';
    else s += '<text x="190" y="140" text-anchor="middle" dominant-baseline="central" font-size="46" font-weight="900" fill="' + c2 + '">' + esc(T.initials(name)) + '</text>';
    // name band
    s += '<text x="150" y="252" text-anchor="middle" font-size="' + (surname.length > 10 ? 20 : 26) + '" font-weight="900" fill="' + c2 + '" letter-spacing="1">' + esc(surname || 'PLAYER') + '</text>';
    s += '<line x1="60" y1="266" x2="240" y2="266" stroke="' + c2 + '" stroke-opacity=".6" stroke-width="1.5"/>';
    // attributes
    const left = [['pac', 'PAC'], ['sho', 'SHO'], ['pas', 'PAS']], right = [['dri', 'DRI'], ['def', 'DEF'], ['phy', 'PHY']];
    left.forEach((k, i) => { s += '<text x="82" y="' + (296 + i * 26) + '" font-size="18" font-weight="900" fill="' + c2 + '" text-anchor="end">' + val(k[0]) + '</text><text x="90" y="' + (296 + i * 26) + '" font-size="13" font-weight="700" fill="' + c2 + '" fill-opacity=".85">' + k[1] + '</text>'; });
    right.forEach((k, i) => { s += '<text x="196" y="' + (296 + i * 26) + '" font-size="18" font-weight="900" fill="' + c2 + '" text-anchor="end">' + val(k[0]) + '</text><text x="204" y="' + (296 + i * 26) + '" font-size="13" font-weight="700" fill="' + c2 + '" fill-opacity=".85">' + k[1] + '</text>'; });
    s += '<line x1="150" y1="282" x2="150" y2="348" stroke="' + c2 + '" stroke-opacity=".4"/>';
    s += '<text x="150" y="378" text-anchor="middle" font-size="10.5" font-weight="800" fill="' + c2 + '" fill-opacity=".9" letter-spacing="1.5">' + esc(clubLine) + '</text>';
    s += '</svg>';
    return s;
  };

  T.exportCard = async function (p, team) {
    try {
      const svg = T.cardSVG(p, team, { width: 900 });
      const canvas = await K1.Store.svgToCanvas(svg, 900, 1260);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const name = 'K1-card-' + K1.Store.safeName(p.name) + '.png';
      if (K1.UI) K1.UI.imagePreview(canvas.toDataURL('image/png'), name, blob); else await K1.Store.shareOrDownload(blob, name, p.name);
    } catch (e) { K1.UI && K1.UI.toast('Card export failed: ' + e.message, 'warn'); }
  };

  K1.Teams = T;
})(window.K1 = window.K1 || {});
