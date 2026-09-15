/* K1 Shooters club app — the season plan view.
 * Forty weeks, four terms. Each week names the theme, the masterclass that teaches it, the
 * drills that train it, and what it looks like for each age band. Tick a week off per team. */
(function (K1) {
  'use strict';

  const P = K1.Panes;
  const icon = (n, o) => K1.icon(n, o);
  const esc = s => K1.esc(s);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const UI = () => K1.UI;
  const C = () => K1.Curriculum;

  let openTerm = null;   // which term is expanded
  let bandFilter = null; // null = show all bands

  function activeTeam() { return K1.Teams && K1.Teams.active ? K1.Teams.active() : null; }
  function teamId() { const t = activeTeam(); return t ? t.id : '_'; }

  P.curriculum = function (root) {
    const cur = C();
    if (!cur) { root.innerHTML = '<p class="muted">The season plan did not load.</p>'; return; }

    const team = activeTeam();
    const prog = cur.progress(teamId());
    const next = cur.next(teamId());
    const teamBand = team ? cur.bandFor(team.ageGroup || team.name) : null;
    if (bandFilter === null && teamBand) bandFilter = teamBand.id;

    // open the term containing the next untaught week, first time in
    if (openTerm === null) openTerm = next ? cur.termOf(next.n).n : 1;

    let s = '<section class="pane-section"><h4>The season plan</h4>' +
      '<p class="muted small">Forty weeks in four terms. Each week is one idea, the class that teaches it, and the drills that train it — with a different version for the little ones and the big ones. Tick a week when you have taught it.</p></section>';

    /* progress + next up */
    s += '<div class="cur-top">' +
      '<div class="cur-prog"><div class="cur-bar"><i style="width:' + prog.pct + '%"></i></div>' +
      '<span>' + prog.done + ' of ' + prog.total + ' weeks taught' + (team ? ' &middot; ' + esc(team.name) : '') + '</span></div>' +
      (next ? '<button class="btn btn-sm btn-primary" data-jump="' + next.n + '">' + icon('play', { size: 15 }) + '<span>Next up: week ' + next.n + ' &middot; ' + esc(next.theme) + '</span></button>' : '<span class="tag">Season complete</span>') +
      '</div>';

    /* band filter */
    s += '<div class="cur-bands"><button class="cur-chip' + (bandFilter ? '' : ' on') + '" data-band="">All ages</button>' +
      cur.BANDS.map(b => '<button class="cur-chip' + (bandFilter === b.id ? ' on' : '') + '" data-band="' + b.id + '">' + esc(b.name) + ' <small>' + esc(b.ages) + '</small></button>').join('') + '</div>';

    /* terms */
    cur.TERMS.forEach(t => {
      const weeks = cur.weeksOfTerm(t);
      const doneN = weeks.filter(w => cur.done(teamId(), w.n)).length;
      const open = openTerm === t.n;
      s += '<div class="cur-term' + (open ? ' open' : '') + '">' +
        '<button class="cur-term-head" data-term="' + t.n + '">' +
        '<span class="cur-term-n">' + t.n + '</span>' +
        '<span class="cur-term-b"><b>' + esc(t.name) + '</b><small>Weeks ' + t.weeks[0] + '&ndash;' + t.weeks[1] + ' &middot; ' + esc(t.lead) + '</small></span>' +
        '<span class="tag">' + doneN + '/' + weeks.length + '</span>' +
        icon(open ? 'chevronUp' : 'chevronDown', { size: 18 }) + '</button>';
      if (open) s += '<div class="cur-weeks">' + weeks.map(w => weekCard(w, cur)).join('') + '</div>';
      s += '</div>';
    });

    root.innerHTML = s;
    bind(root);
  };

  function weekCard(w, cur) {
    const done = cur.done(teamId(), w.n);
    const mc = w.mc && K1.Masterclass ? K1.Masterclass.get(w.mc) : null;
    const drills = (w.drills || []).map(id => (K1.DRILLS || []).find(d => d.id === id)).filter(Boolean);
    const bands = cur.BANDS.filter(b => (!bandFilter || b.id === bandFilter) && w.bands[b.id]);

    return '<div class="cur-week' + (done ? ' done' : '') + '" id="cw' + w.n + '">' +
      '<div class="cur-week-head">' +
      '<button class="cur-tick" data-tick="' + w.n + '" title="' + (done ? 'Taught' : 'Mark as taught') + '">' + icon(done ? 'check' : 'dot', { size: 16 }) + '</button>' +
      '<span class="cur-w-n">Week ' + w.n + '</span>' +
      '<b>' + esc(w.theme) + '</b>' +
      '</div>' +
      (bands.length ? '<div class="cur-band-rows">' + bands.map(b =>
        '<div class="cur-band-row"><span class="cur-band-name">' + esc(b.name) + '<small>' + esc(b.ages) + '</small></span>' +
        '<span class="cur-band-txt">' + esc(w.bands[b.id]) + '</span></div>').join('') + '</div>' : '') +
      (w.note ? '<p class="cur-note">' + esc(w.note) + '</p>' : '') +
      '<div class="row wrap cur-acts">' +
      (mc ? '<button class="btn btn-sm" data-mc="' + mc.id + '">' + icon('sparkles', { size: 14 }) + '<span>' + esc(mc.title) + '</span></button>' : '') +
      (drills.length ? '<button class="btn btn-sm btn-ghost" data-sess="' + w.n + '">' + icon('calendar', { size: 14 }) + '<span>Build the session</span></button>' : '') +
      '<button class="btn btn-sm btn-ghost" data-wa="' + w.n + '">' + icon('share', { size: 14 }) + '<span>Send to the group</span></button>' +
      '</div>' +
      (drills.length ? '<div class="cur-drills">' + drills.map(d => '<button class="cur-chip sm" data-drill="' + d.id + '">' + esc(d.name) + '</button>').join('') + '</div>' : '') +
      '</div>';
  }

  function bind(root) {
    const cur = C();

    $$('[data-term]', root).forEach(b => { b.onclick = () => { const n = Number(b.dataset.term); openTerm = (openTerm === n ? null : n); P.curriculum(root); }; });

    $$('[data-band]', root).forEach(b => { b.onclick = () => { bandFilter = b.dataset.band || null; P.curriculum(root); }; });

    $$('[data-jump]', root).forEach(b => { b.onclick = () => {
      const n = Number(b.dataset.jump);
      openTerm = cur.termOf(n).n; P.curriculum(root);
      const el = $('#cw' + n, root); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); }
    }; });

    $$('[data-tick]', root).forEach(b => { b.onclick = () => {
      const n = Number(b.dataset.tick);
      const now = !cur.done(teamId(), n);
      cur.setDone(teamId(), n, now);
      UI().toast(now ? 'Week ' + n + ' marked as taught' : 'Week ' + n + ' un-ticked', now ? 'ok' : '');
      P.curriculum(root);
    }; });

    $$('[data-mc]', root).forEach(b => { b.onclick = () => { P.openMasterclass(b.dataset.mc, 0); P.setClassTab('classes'); UI().goSection('masterclass'); }; });

    $$('[data-drill]', root).forEach(b => { b.onclick = () => {
      const d = (K1.DRILLS || []).find(x => x.id === b.dataset.drill); if (!d) return;
      const doc = K1.Templates.docFromDrill(d);
      if (doc) P.openDoc(doc, d.name);
    }; });

    $$('[data-sess]', root).forEach(b => { b.onclick = () => {
      const w = cur.week(Number(b.dataset.sess)); if (!w) return;
      const blocks = (w.drills || []).map(id => {
        const d = (K1.DRILLS || []).find(x => x.id === id); if (!d) return null;
        return { name: d.name, minutes: parseInt(d.time, 10) || 15, type: drillType(d), desc: d.desc, drillId: d.id };
      }).filter(Boolean);
      if (!blocks.length) { UI().toast('No drills on this week yet.'); return; }
      const s = K1.Sessions.create({ title: 'Week ' + w.n + ' — ' + w.theme, theme: w.theme, blocks });
      P.openSession(s.id); UI().goSection('sessions');
      UI().toast('Session created from week ' + w.n, 'ok');
    }; });

    $$('[data-wa]', root).forEach(b => { b.onclick = async () => {
      const w = cur.week(Number(b.dataset.wa)); if (!w) return;
      const band = bandFilter ? cur.BANDS.find(x => x.id === bandFilter) : null;
      const txt = cur.shareWeek(w, band);
      const win = window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      if (!win) { try { await navigator.clipboard.writeText(txt); UI().toast('Copied — paste it into WhatsApp', 'ok'); } catch (e) { UI().modal({ title: 'Week ' + w.n, body: '<textarea class="input mono" rows="12" readonly>' + esc(txt) + '</textarea>' }); } }
    }; });
  }

  function drillType(d) {
    const g = d.group || '';
    return g.indexOf('Warm') === 0 ? 'Warm-up' : g.indexOf('Finish') === 0 ? 'Finishing'
      : g.indexOf('Press') === 0 ? 'Tactical' : g.indexOf('Small') === 0 ? 'Game' : 'Possession';
  }
})(window.K1 = window.K1 || {});
