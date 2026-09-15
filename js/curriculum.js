/* K1 Shooters club app — THE SEASON CURRICULUM.
 *
 * A library tells you what exists. A curriculum tells you what to teach on Tuesday.
 * Forty weeks, four terms, each week naming one theme, the masterclass that teaches it,
 * the drills that train it, and what the same theme looks like for a nine-year-old and a
 * seventeen-year-old — because they are not the same lesson.
 *
 * The age bands are the club's own pathway, not invented ones: Foundation (U7–U11),
 * Formation (U12–U15), Performance (U16–U19). What belongs in which band follows published
 * guidance rather than opinion: SAFA's grassroots material holds positional work back until
 * players "have acquired enough experience to be able to take up a position in open space",
 * and the FA does not print "positional awareness" as a key learning until U13/U14. Both agree
 * with our own model, which gives Foundation to ball mastery, freedom and joy.
 *
 * Progress is per team, stored under the usual k1tb: convention. */
(function (K1) {
  'use strict';

  const C = {};
  const KEY = 'k1tb:curriculum';

  /* Foundation / Formation / Performance — the club pathway. */
  const BANDS = [
    { id: 'foundation', name: 'Foundation', ages: 'U7–U11', note: 'Ball mastery, freedom, joy. Play the theme as a game; do not teach the shape.' },
    { id: 'formation', name: 'Formation', ages: 'U12–U15', note: 'Game intelligence and creativity. Name the idea, rehearse it on one side of the pitch.' },
    { id: 'performance', name: 'Performance', ages: 'U16–U19', note: 'Tactical readiness and structure. Full concept, both sides, opponent-specific.' },
  ];

  const TERMS = [
    { n: 1, name: 'Who we are', weeks: [1, 10], lead: 'Identity and vocabulary. Before any shape, the boys learn the words and the four pillars.' },
    { n: 2, name: 'With the ball', weeks: [11, 20], lead: 'The four phases in order: build-up, progression, creation, finishing.' },
    { n: 3, name: 'Without the ball', weeks: [21, 30], lead: 'Press, blocks, and the two transitions. The half of the game that decides leagues.' },
    { n: 4, name: 'Putting it together', weeks: [31, 40], lead: 'Rotations, the 4-2-2-2 variation, and opponent-specific weeks.' },
  ];

  /* w(number, theme, masterclassId, drills, band notes) */
  const W = (n, theme, mc, drills, f, fo, p, note) =>
    ({ n, theme, mc: mc || null, drills: drills || [], bands: { foundation: f, formation: fo, performance: p }, note: note || '' });

  const WEEKS = [
    /* ---------------------------------------------------- TERM 1 · WHO WE ARE */
    W(1, 'The K1 Way', 'k1-way', ['k1_rondo_5v2', 'k1_press_4plus2v3'],
      'Tell the story, play small games, no tactics at all.',
      'Learn the four pillars by name. Which one are you?',
      'The four pillars plus the tactical identity, learned by heart.',
      'First week of the season. Do this one before anything else, at every age group, on the same night if you can.'),
    W(2, 'The five corridors', 'core-corridors', ['k1_rondo_5v2', 'positional_4v4_3'],
      'Three lanes only: left, middle, right. Nothing more.',
      'All five corridors, named out loud. One man per corridor.',
      'Five corridors and three thirds. Fifteen zones.',
      'Put the “Named lanes × thirds” overlay on the board and leave it on all month.'),
    W(3, 'Corridors, consolidated', 'core-corridors', ['k1_zone_buildup', 'positional_4v4_3'],
      'Games with a wide rule: the ball must go out wide before we can score.',
      'The ball must travel through two corridors before we can score.',
      'One player per corridor enforced in the position game.',
      'Second week on the same idea. Do not move on because you are bored — they are not there yet.'),
    W(4, 'Scanning and the free man', 'positional-foundations', ['rondo_4v2', 'k1_rondo_5v2'],
      'Look-before-you-touch games. Call a colour before receiving.',
      'Two scans before every reception. Find the free man in the rondo.',
      'Scanning under pressure; the free man in a real build-up.',
      'The cheapest improvement in football and it needs no equipment.'),
    W(5, 'Barcelona’s Brain', 'pillar-brain', ['k1_rondo_5v2', 'k1_buildup_6v5'],
      'Rondos, lots of them, and let them enjoy it.',
      'Receive side-on. Know your lane.',
      'Positional play in a full build-up shape.', ''),
    W(6, 'Kasi Fire', 'pillar-kasi', ['k1_futsal_31_22', 'ssg_3v3_gk'],
      'Futsal and street games. Protect the touch they came with.',
      'Second balls, front-foot defending, finish the run.',
      'Grit as four coachable actions, counted in the match.',
      'Present this one before a derby if you can.'),
    W(7, 'Arsenal’s Swagger', 'pillar-swagger', ['one_v_one', 'k1_waves_1v1_2v1'],
      '1v1s all night. Never correct a failed trick.',
      'The line: simple behind it, brave in front of it.',
      'Overload to isolate. Hold your width.', ''),
    W(8, 'Man City’s Structure', 'pillar-structure', ['k1_pattern_fb_pivot', 'k1_zone_buildup'],
      'Not yet. Play 4v4 and let them find their own spaces.',
      'The inverted full-back, one side only, rehearsed.',
      'The 3-2 box, rest defence, and the pause.',
      'Foundation groups skip the concept and just play — that is the published guidance and our own model.'),
    W(9, 'Real Madrid · the other way', 'study-madrid', ['transition_4v4_2', 'finishing_circuit'],
      'Skip. Play.',
      'Counter-attack as three named runs.',
      'Low block, transition, and when to choose it.',
      'U15 and up. It only works once they believe the first four pillars.'),
    W(10, 'Review · the four pillars', null, ['ssg_3v3_gk'],
      'Festival. Play, do not assess.',
      'Ask each boy which pillar he is strongest in and which he owes the team.',
      'Written self-assessment against the four pillars.',
      'No new content. Consolidate, play, and talk to individuals.'),

    /* ------------------------------------------------- TERM 2 · WITH THE BALL */
    W(11, 'Build-up · the first pass', 'build-up', ['k1_buildup_6v5', 'dz_gk_rondo'],
      'Goalkeeper joins in. Play out, and never shout when it goes wrong.',
      'Centre-backs split, anchor shows, keeper is the spare man.',
      'Full build-up against a real press.', ''),
    W(12, 'Build-up · baiting the press', 'build-up', ['dz_bait_press', 'k1_buildup_6v5'],
      'Skip the bait. Just play out and enjoy it.',
      'Stand on the ball, invite him, then release.',
      'The bait, the release, and the break.',
      'This is “we bait them, then break them” from our own model — use their words.'),
    W(13, 'Progression · breaking the line', 'progression', ['k1_pattern_fb_pivot', 'positional_4v4_3'],
      'Games where a pass through two cones scores a point.',
      'Find the man between their lines.',
      'Third-man combinations to break a set midfield.', ''),
    W(14, 'Progression · the switch', 'progression', ['dz_flank_2v1_box', 'k1_zone_buildup'],
      'Big pitch, let them hit it long and chase.',
      'Overload one side, switch, attack the far corridor.',
      'Switch in two passes, not five.', ''),
    W(15, 'Creation · the pocket', 'creation', ['k1_waves_1v1_2v1', 'positional_4v4_3'],
      'Free play in the final third.',
      'Receive in the half-space between their lines.',
      'Pocket, cut-back, and the late arrival.', ''),
    W(16, 'Creation · wide 3v2', 'creation', ['dz_flank_2v1_box', 'dz_cutback_triangle'],
      '2v1 to a goal. Nothing else.',
      'Full-back, winger and ten against two defenders.',
      'The cut-back triangle and the near-post run.', ''),
    W(17, 'Finishing · the box', 'finishing', ['finishing_circuit', 'crossing_finishing_fullpitch'],
      'Shooting, lots of it, everybody scores.',
      'Three runners: near post, penalty spot, back post.',
      'Rehearsed box occupation from both sides.', ''),
    W(18, 'Finishing · rebounds and second balls', 'finishing', ['finishing_circuit', 'ssg_3v3_gk'],
      'First to the rebound wins a point.',
      'Somebody always follows the shot in.',
      'The edge-of-box runner and the second phase.', ''),
    W(19, 'Positional fluidity', 'core-fluidity', ['positional_4v4_3', 'k1_role_pivot'],
      'Skip entirely. They have no fixed position to leave yet.',
      'One pair, one rotation, one side of the pitch.',
      'Several pairs, decided by the players in the moment.',
      'Foundation skips this. A boy who never had a position cannot be fluid.'),
    W(20, 'Review · with the ball', null, ['k1_buildup_6v5'],
      'Festival.',
      'Play a match and freeze it three times. Ask, do not tell.',
      'Video the match if you can and review the four phases.', ''),

    /* ---------------------------------------------- TERM 3 · WITHOUT THE BALL */
    W(21, 'The high press', 'high-press', ['k1_press_4plus2v3', 'press_trap_433'],
      'Chase as a game. Who can win it back fastest?',
      'Press together on the trigger. Nobody presses alone.',
      'Pressing traps and the signal to spring them.', ''),
    W(22, 'Press · the trigger', 'high-press', ['press_trap_433', 'dz_counterpress_zones'],
      'Still a game. Do not teach triggers.',
      'One trigger: the backwards pass.',
      'Three triggers, and the cover behind the press.', ''),
    W(23, 'Mid block', 'blocks-counter', ['def_shape_shadow', 'k1_press_4plus2v3'],
      'Skip.',
      'Stay compact, stay connected, do not dive in.',
      'Mid block with a clear line of engagement.', ''),
    W(24, 'Low block and counter', 'blocks-counter', ['def_shape_shadow', 'transition_4v4_2'],
      'Skip.',
      'Get behind the ball together.',
      'Low block, then counter in four seconds.', ''),
    W(25, 'Defensive transition', 'core-transition', ['dz_counterpress_zones', 'rondo_5v2_transition'],
      'Turnover games. Count the five seconds out loud.',
      'Press or drop — near it, head down, covered?',
      'The three triggers, and one voice making the call.', ''),
    W(26, 'Transition, consolidated', 'core-transition', ['transition_4v4_2', 'rondo_5v2_transition'],
      'More turnover games. They love these.',
      'A goal within ten seconds of a turnover counts double.',
      'Opponent-specific: where do they counter from?',
      'Ten minutes a week of this changes more matches than an hour of anything else.'),
    W(27, 'Rest defence', 'core-rest-defence', ['dz_counterpress_zones', 'def_shape_shadow'],
      'Skip.',
      'One more than they leave up. Count it out loud.',
      'Full rest defence including the inverted full-back.',
      'U15 and up. Almost no academy at our level teaches this — it is a real edge.'),
    W(28, 'Rest offence', 'core-rest-offence', ['transition_4v4_2', 'finishing_circuit'],
      'Skip.',
      'The striker stays up. That is a job, not laziness.',
      'The pair taught together: what we leave behind and what we leave forward.', ''),
    W(29, 'Review · the pair', null, ['transition_4v4_2'],
      'Festival.',
      'Ask mid-match: are you rest defence or rest offence right now?',
      'Both halves of the pair, self-assessed.', ''),
    W(30, 'Review · without the ball', null, ['ssg_3v3_gk'], 'Festival.', 'Consolidate.', 'Consolidate.', ''),

    /* -------------------------------------- TERM 4 · PUTTING IT TOGETHER */
    W(31, 'Symmetric rotation', 'core-rotations', ['k1_pattern_fb_pivot', 'overlap_pattern'],
      'Skip.',
      'One rotation, three players, walked then jogged then opposed.',
      'Several symmetric rotations, called by name.',
      'The safe one. Teach it first and use it every week.'),
    W(32, 'Asymmetric rotation', 'core-rotations', ['positional_4v4_3', 'dz_flank_2v1_box'],
      'Skip.',
      'Skip — or show it once and do not train it.',
      'Overload one side, accept the imbalance, cover behind.',
      'Performance only, and only after rest defence in week 27. A team that overloads without covering loses 4-3.'),
    W(33, 'The 4-2-2-2 · the square', 'the-4222', ['dz_rondo_6v2_rect', 'k1_pattern_fb_pivot'],
      'Skip.',
      'Introduce the shape as a variation, not a replacement.',
      'The magic square and the two tens in the half-spaces.',
      'Our model prefers 4-2-3-1 and 4-3-3. This is a variation on them — always say so.'),
    W(34, 'The 4-2-2-2 · build trap', 'the-4222', ['dz_bait_press', 'dz_rondo_5v2_cone'],
      'Skip.',
      'The bait and the release, walked through.',
      '2-4-4 build trap against a live press.', ''),
    W(35, 'De Zerbi’s method', 'dezerbi-method', ['dz_bait_press', 'dz_counterpress_zones'],
      'Skip.',
      'Skip.',
      'The sole, the bait, the free man, and the price of the method.',
      'Coaches and U16+. Present this one on a Workshop Friday.'),
    W(36, 'Fàbregas at Como', 'fabregas-como', ['dz_rondo_6v2_rect', 'positional_4v4_3'],
      'Skip.',
      'Skip.',
      'The freer accent: one ten roams, one holds.', ''),
    W(37, 'Opponent week', null, ['def_shape_shadow', 'press_trap_433'],
      'Festival.',
      'Which pillar do we need most against this team?',
      'Full opponent plan: their build-up, their counter, our press.',
      'Use the Match centre to plan it, and the board to show it.'),
    W(38, 'Opponent week', null, ['transition_4v4_2', 'finishing_circuit'],
      'Festival.',
      'One thing to do, one thing to stop.',
      'Set pieces both ways, plus the counter plan.', ''),
    W(39, 'Season review · the team', null, ['ssg_3v3_gk'],
      'Awards and a party. They are children.',
      'What did we get better at? Show them the first video and the last.',
      'Review against the four pillars and the six core concepts.', ''),
    W(40, 'Season review · the player', null, [],
      'Tell every boy one thing he does well. Nothing else.',
      'One strength, one target, agreed with the boy.',
      'Individual development plan for next season.',
      'Use the player profiles in Teams. Every boy gets five minutes and leaves with one target.'),
  ];

  /* --------------------------------------------------------------- state */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  C.BANDS = BANDS;
  C.TERMS = TERMS;
  C.weeks = () => WEEKS.slice();
  C.week = n => WEEKS.find(w => w.n === n) || null;
  C.termOf = n => TERMS.find(t => n >= t.weeks[0] && n <= t.weeks[1]) || null;
  C.weeksOfTerm = t => WEEKS.filter(w => w.n >= t.weeks[0] && w.n <= t.weeks[1]);

  /** Which band a team falls in, from its age group (U11 → foundation, U13 → formation…). */
  C.bandFor = function (ageBand) {
    const n = parseInt(String(ageBand || '').replace(/\D/g, ''), 10);
    if (!n) return null;
    if (n <= 11) return BANDS[0];
    if (n <= 15) return BANDS[1];
    return BANDS[2];
  };

  /** Per-team progress: which weeks have been taught. */
  C.done = function (teamId, n) {
    const all = load();
    return !!(all[teamId || '_'] || {})[n];
  };
  C.setDone = function (teamId, n, v) {
    const all = load(), k = teamId || '_';
    all[k] = all[k] || {};
    if (v) all[k][n] = Date.now(); else delete all[k][n];
    save(all);
  };
  C.progress = function (teamId) {
    const all = load()[teamId || '_'] || {};
    const n = Object.keys(all).length;
    return { done: n, total: WEEKS.length, pct: Math.round(n / WEEKS.length * 100) };
  };
  /** The next week not yet taught to this team. */
  C.next = function (teamId) {
    const all = load()[teamId || '_'] || {};
    return WEEKS.find(w => !all[w.n]) || null;
  };

  /** Plain text for the group chat. */
  C.shareWeek = function (w, band) {
    const out = ['*WEEK ' + w.n + ' — ' + w.theme.toUpperCase() + '*'];
    const t = C.termOf(w.n); if (t) out.push('_Term ' + t.n + ': ' + t.name + '_');
    out.push('');
    if (band && w.bands[band.id]) out.push(band.name + ' (' + band.ages + '): ' + w.bands[band.id]);
    else BANDS.forEach(b => { if (w.bands[b.id]) out.push('*' + b.name + '* (' + b.ages + '): ' + w.bands[b.id]); });
    if (w.note) { out.push(''); out.push(w.note); }
    out.push('');
    out.push('_' + (K1.settings && K1.settings.homeName || 'K1 Shooters') + ' · season plan_');
    return out.join('\n');
  };

  K1.Curriculum = C;
})(window.K1 = window.K1 || {});
