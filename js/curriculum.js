/* K1 Shooters club app — THE SEASON CURRICULUM.
 *
 * A library tells you what exists. A curriculum tells you what to teach on Tuesday.
 *
 * THE FINDING THAT SHAPED THIS FILE. Acoumambo, Zoudji and Belhouchet (2026) taught forty
 * tactical actions to three youth cohorts and tested them again after a delay. Under-13s still
 * held 33% of them. Under-15s held 40%. Under-18s held 45%. Immediate recognition badly
 * overestimated what had stuck. A single linear march through forty topics would therefore
 * leave a thirteen-year-old holding about thirteen of them.
 *
 * So this is a SPIRAL, not a march. Ten blocks of four weeks. Every block revisits an earlier
 * one at higher complexity, and week four of every block re-checks week one's idea after a
 * delay — because asking at the end of the session tells you nothing.
 *
 * THE BLOCK SHAPE (four weeks): introduce · develop · complicate · consolidate.
 * Four weeks is the published block length for block periodisation, and four-week blocks give
 * exactly three blocks per twelve-week school term, which is the published medium-term planning
 * unit in FA coach material.
 *
 * THE ORDERING RULES, each of them sourced rather than preferred:
 *   1. Individual before collective. SAFA introduces advanced positioning only once players can
 *      already take up a position in open space unaided.
 *   2. Keep it, then move it, then finish with it — the FA's in-possession order.
 *   3. Organised moments before transitions. You cannot transition into a shape you do not have.
 *   4. Press after compactness; counter-press after a possession structure exists.
 *   5. Rotations late, because they are variations on a shape that must already be held.
 *
 * AGE BANDS are the club's own pathway: Foundation U7–U11, Formation U12–U15, Performance
 * U16–U19. Several weeks say "Skip" for Foundation on purpose. That is not neglect: SAFA's
 * grassroots material gives 6–8s "limited intervention, let the children play", and the FA does
 * not print positional awareness as a key learning until U13/U14. Our own model gives Foundation
 * to ball mastery, freedom and joy. All three agree.
 *
 * Progress and the per-player concept checklist live under the usual k1tb: convention. */
(function (K1) {
  'use strict';

  const C = {};
  const KEY = 'k1tb:curriculum';
  const CKEY = 'k1tb:concepts';

  const BANDS = [
    { id: 'foundation', name: 'Foundation', ages: 'U7–U11', note: 'Ball mastery, freedom, joy. Play the theme as a game; do not teach the shape.' },
    { id: 'formation', name: 'Formation', ages: 'U12–U15', note: 'Game intelligence and creativity. Name the idea, rehearse it on one side of the pitch.' },
    { id: 'performance', name: 'Performance', ages: 'U16–U19', note: 'Tactical readiness and structure. Full concept, both sides, opponent-specific.' },
  ];

  /* The four weeks of every block. The last one is the one most coaches skip. */
  const ROLES = {
    introduce: { name: 'Introduce', hint: 'Whiteboard it, then meet the problem in a game. Baseline only — do not assess.' },
    develop: { name: 'Develop', hint: 'Isolate the sub-principle. Most repetitions of the block happen this week.' },
    complicate: { name: 'Complicate', hint: 'Add opposition, direction, consequence, fatigue. Can they still do it?' },
    consolidate: { name: 'Consolidate', hint: 'Game form, then Saturday is the exam. Re-check week one of this block after the delay.' },
  };

  /* How a player's grip on an idea is recorded — four levels, not a tick.
   * "Seen it" is attendance. "Under pressure" is the only one that means anything on a Saturday. */
  const LEVELS = [
    { id: 0, name: 'Not yet', short: '—' },
    { id: 1, name: 'Seen it', short: 'Seen', hint: 'Was there when it was taught.' },
    { id: 2, name: 'Can do it unopposed', short: 'Unopposed', hint: 'In a passing practice or a walk-through.' },
    { id: 3, name: 'Can do it in a game form', short: 'In a game', hint: 'In a small-sided game with real opposition.' },
    { id: 4, name: 'Does it under match pressure', short: 'Match', hint: 'Seen on a Saturday, unprompted.' },
  ];

  /* Ten blocks of four weeks. `revisits` is the spiral: the earlier block this one comes back to. */
  const BLOCKS = [
    { n: 1, name: 'Who we are', weeks: [1, 4], lead: 'Identity and vocabulary, before any shape.', revisits: null },
    { n: 2, name: 'The four pillars', weeks: [5, 8], lead: 'Each pillar taught through a team the boys can watch.', revisits: null },
    { n: 3, name: 'Keeping the ball', weeks: [9, 12], lead: 'Scanning, support angles, receiving under pressure.', revisits: 1 },
    { n: 4, name: 'Building from the back', weeks: [13, 16], lead: 'The goalkeeper as the first attacker, and beating the first line.', revisits: 3 },
    { n: 5, name: 'Progression', weeks: [17, 20], lead: 'Breaking lines, the pocket, and the switch.', revisits: 3 },
    { n: 6, name: 'Defending as a team', weeks: [21, 24], lead: 'Press, mid block, low block. Compactness before triggers.', revisits: null },
    { n: 7, name: 'The two transitions', weeks: [25, 28], lead: 'The five seconds either way, plus rest defence and rest offence.', revisits: 6 },
    { n: 8, name: 'Creating and finishing', weeks: [29, 32], lead: 'The pocket, the cut-back, and finishing under pressure.', revisits: 5 },
    { n: 9, name: 'Rotations and fluidity', weeks: [33, 36], lead: 'Second pass on the corridors, now with players exchanging jobs.', revisits: 1 },
    { n: 10, name: 'The variation, and the end', weeks: [37, 40], lead: 'The 4-2-2-2 as a variation, opponent weeks, and the season review.', revisits: 4 },
  ];

  const W = (n, role, theme, mc, drills, f, fo, p, note) =>
    ({ n, role, theme, mc: mc || null, drills: drills || [], bands: { foundation: f, formation: fo, performance: p }, note: note || '' });

  const WEEKS = [
    /* ------------------------------------------------ BLOCK 1 · WHO WE ARE */
    W(1, 'introduce', 'The K1 Way', 'k1-way', ['k1_rondo_5v2', 'k1_press_4plus2v3'],
      'Tell the story, play small games, no tactics at all.',
      'Learn the four pillars by name. Which one are you?',
      'The four pillars plus the tactical identity, learned by heart.',
      'First week of the season. Do this one at every age group, on the same night if you can.'),
    W(2, 'develop', 'The five corridors', 'core-corridors', ['k1_rondo_5v2', 'positional_4v4_3'],
      'Three lanes only: left, middle, right. Nothing more.',
      'All five corridors, named out loud. One man per corridor.',
      'Five corridors and three thirds. Fifteen zones.',
      'Put the “Named lanes × thirds” overlay on the board and leave it on all month.'),
    W(3, 'complicate', 'Corridors under pressure', 'core-corridors', ['k1_zone_buildup', 'positional_4v4_3'],
      'Games with a wide rule: the ball must go out wide before we can score.',
      'The ball must travel through two corridors before we can score.',
      'One player per corridor, enforced, against a live press.',
      'Same idea as last week with a defender added. Do not move on because you are bored — they are not there yet.'),
    W(4, 'consolidate', 'Festival and baseline', null, ['ssg_3v3_gk'],
      'Festival. Play, do not assess.',
      'Small-sided games. Ask them to name their corridor mid-game.',
      'Internal match. First four-corner profile of the season.',
      'Re-check week 1: can they still name the four pillars three weeks later? That delayed answer is the real one.'),

    /* ------------------------------------------- BLOCK 2 · THE FOUR PILLARS */
    W(5, 'introduce', 'Barcelona’s Brain', 'pillar-brain', ['k1_rondo_5v2', 'rondo_4v2'],
      'Rondos, lots of them, and let them enjoy it.',
      'Two scans before every reception. Receive side-on.',
      'Positional play inside a full build-up shape.', ''),
    W(6, 'develop', 'Man City’s Structure', 'pillar-structure', ['k1_pattern_fb_pivot', 'k1_zone_buildup'],
      'Not yet. Play 4v4 and let them find their own spaces.',
      'The inverted full-back, one side only, rehearsed.',
      'The 3-2 box, rest defence, and the pause.',
      'Foundation groups skip the concept and just play — that is the published guidance and our own model.'),
    W(7, 'complicate', 'Arsenal’s Swagger', 'pillar-swagger', ['one_v_one', 'k1_waves_1v1_2v1'],
      '1v1s all night. Never correct a failed trick.',
      'The line: simple behind it, brave in front of it.',
      'Overload to isolate. Hold your width while the ball is elsewhere.', ''),
    W(8, 'consolidate', 'Kasi Fire', 'pillar-kasi', ['k1_futsal_31_22', 'ssg_3v3_gk'],
      'Futsal and street games. Protect the touch they came with.',
      'Second balls, front-foot defending, finish the run.',
      'Grit as four coachable actions, counted in the match.',
      'Re-check week 5: ask for two scans and watch whether it happens without being told. Present this one before a derby if you can.'),

    /* ----------------------------------------- BLOCK 3 · KEEPING THE BALL */
    W(9, 'introduce', 'Scanning and the free man', 'positional-foundations', ['rondo_4v2', 'k1_rondo_5v2'],
      'Look-before-you-touch games. Call a colour before receiving.',
      'Two scans before every reception. Find the free man in the rondo.',
      'Scanning under pressure; the free man in a real build-up.',
      'The cheapest improvement in football. No equipment, no budget, only insistence.'),
    W(10, 'develop', 'Support angles and the triangle', 'positional-foundations', ['k1_rondo_5v2', 'dz_rondo_5v2_cone'],
      '3v1 rondo in a big grid. No straight lines — always a triangle.',
      '4v2 and 5v2 in a tight grid. Two touches.',
      'Positional rondo with real positions, one touch.', ''),
    W(11, 'complicate', 'Receiving under pressure', 'build-up', ['dz_rondo_6v2_rect', 'positional_4v4_3'],
      'Receive and go. Keep it simple and loud.',
      'Half-turn, then play forward. Protect first, turn second.',
      'Receive to play forward with a man on your back.', ''),
    W(12, 'consolidate', 'Possession game form', null, ['positional_4v4_3', 'ssg_3v3_gk'],
      '4v4 keep-ball with two neutrals.',
      '7v7 possession to a line. Count the passes.',
      '8v8 directional possession under a real press.',
      'Re-check week 9: are they scanning without being reminded? If not, the block has not landed and you repeat it.'),

    /* ------------------------------------ BLOCK 4 · BUILDING FROM THE BACK */
    W(13, 'introduce', 'Build-up · the first pass', 'build-up', ['k1_buildup_6v5', 'dz_gk_rondo'],
      'Goalkeeper joins in. Play out, and never shout when it goes wrong.',
      'Centre-backs split, anchor shows, keeper is the spare man.',
      'Full build-up against a real press.', ''),
    W(14, 'develop', 'Baiting the press', 'build-up', ['dz_bait_press', 'k1_buildup_6v5'],
      'Skip the bait. Just play out and enjoy it.',
      'Stand on the ball, invite him, then release.',
      'The bait, the release, and the break.',
      'This is “we bait them, then break them” from our own model. Use their words, not De Zerbi’s.'),
    W(15, 'complicate', 'Beating the first line', 'build-up', ['dz_bait_press', 'k1_zone_buildup'],
      'Play past one defender to a target.',
      'Beat two pressers and find the free man.',
      'Beat the first line against a rehearsed high press.', ''),
    W(16, 'consolidate', 'Build-up game form', null, ['k1_buildup_6v5', 'ssg_3v3_gk'],
      '4v4 starting from the goalkeeper every time.',
      '9v9 from the goalkeeper, zones scored.',
      '11v11 build to halfway, then review it.',
      'Re-check week 13: does the keeper still get used, or has everyone gone back to kicking it long?'),

    /* ---------------------------------------------- BLOCK 5 · PROGRESSION */
    W(17, 'introduce', 'Breaking the line', 'progression', ['k1_pattern_fb_pivot', 'positional_4v4_3'],
      'A pass through two cones scores a point.',
      'Find the man between their lines.',
      'Third-man combinations to break a set midfield.', ''),
    W(18, 'develop', 'Receiving in the pocket', 'creation', ['positional_4v4_3', 'k1_waves_1v1_2v1'],
      'Find space in the middle and shout.',
      'The space between their defence and midfield, named.',
      'Body shape in the pocket; turn and face.', ''),
    W(19, 'complicate', 'The switch', 'progression', ['dz_flank_2v1_box', 'k1_zone_buildup'],
      'Use the whole width. Big pitch, let them run.',
      'Overload one side, switch, attack the far corridor.',
      'Switch in two passes, not five.', ''),
    W(20, 'consolidate', 'Mid-season review', null, ['k1_buildup_6v5'],
      'Festival and a party.',
      'Play a match and freeze it three times. Ask, do not tell.',
      'Four-corner mid-season review for every player.',
      'Re-check week 17. Also the halfway point of the season: review every player across all four corners, not just the technical one.'),

    /* -------------------------------------- BLOCK 6 · DEFENDING AS A TEAM */
    W(21, 'introduce', 'Compactness and the block', 'blocks-counter', ['def_shape_shadow', 'k1_press_4plus2v3'],
      'Stay together. Whoever is nearest goes, the rest come with him.',
      'Distances between players, named and measured.',
      'High, mid and low block by game state.',
      'Compactness first. Pressing without it is just chasing.'),
    W(22, 'develop', 'The high press', 'high-press', ['k1_press_4plus2v3', 'press_trap_433'],
      'Chase as a game. Who wins it back fastest?',
      'Press together on the trigger. Nobody presses alone.',
      'Pressing traps and the signal to spring them.', ''),
    W(23, 'complicate', 'Pressing triggers', 'high-press', ['press_trap_433', 'dz_counterpress_zones'],
      'Still a game. Do not teach triggers yet.',
      'One trigger only: the backwards pass.',
      'Three triggers, and the cover behind the press.', ''),
    W(24, 'consolidate', 'Defensive game form', null, ['def_shape_shadow', 'ssg_3v3_gk'],
      '4v4 defend the goal.',
      '9v9 mid-block game.',
      '11v11 against a real opposition shape.',
      'Re-check week 21: are they still compact when they are tired, or has the block stretched?'),

    /* ------------------------------------- BLOCK 7 · THE TWO TRANSITIONS */
    W(25, 'introduce', 'Defensive transition', 'core-transition', ['dz_counterpress_zones', 'rondo_5v2_transition'],
      'Turnover games. Count the five seconds out loud.',
      'Press or drop — near it, head down, covered?',
      'The three triggers, and one voice making the call.',
      'A turnover happens roughly every six seconds in youth football. This block is worth more than any other.'),
    W(26, 'develop', 'The counter-attack', 'study-madrid', ['transition_4v4_2', 'finishing_circuit'],
      'Win it and race to the goal.',
      'Three named runs. First pass forward, always.',
      'Counter patterns and the decision to go or secure.', ''),
    W(27, 'complicate', 'Rest defence', 'core-rest-defence', ['dz_counterpress_zones', 'def_shape_shadow'],
      'Somebody stays back. That is all.',
      'One more than they leave up. Count it out loud.',
      'Full rest defence including the inverted full-back.',
      'U15 and up for the full concept. Almost no academy at our level teaches it, which is exactly why it is an edge.'),
    W(28, 'consolidate', 'Rest offence and the pair', 'core-rest-offence', ['transition_4v4_2', 'finishing_circuit'],
      'Skip the concept. Play transition games.',
      'The striker stays up. That is a job, not laziness.',
      'Both halves of the pair, self-assessed mid-match.',
      'Re-check week 25: at a real turnover, do they press or drop together — or do half of them do each?'),

    /* ------------------------------- BLOCK 8 · CREATING AND FINISHING */
    W(29, 'introduce', 'Wide 3v2 and the cut-back', 'creation', ['dz_flank_2v1_box', 'dz_cutback_triangle'],
      '2v1 to a goal. Nothing else.',
      'Full-back, winger and ten against two defenders.',
      'The cut-back triangle and the near-post run.', ''),
    W(30, 'develop', 'Attacking the box', 'finishing', ['finishing_circuit', 'crossing_finishing_fullpitch'],
      'Get in the box. Everybody scores.',
      'Three runners: near post, penalty spot, back post.',
      'Rehearsed box occupation from both sides.', ''),
    W(31, 'complicate', 'Finishing under pressure', 'finishing', ['finishing_circuit', 'k1_waves_1v1_2v1'],
      'Lots of shots, lots of goals, no corrections.',
      'Shoot with a chaser. First-time finishing.',
      'Finishing at speed and tired, to a match standard.', ''),
    W(32, 'consolidate', 'Finishing game form', null, ['finishing_circuit', 'ssg_3v3_gk'],
      '4v4 with big goals.',
      '9v9 final-third game.',
      '11v11 attacking-third game, then review the chances.',
      'Re-check week 29: does anybody still make the cut-back, or has everyone gone back to shooting from everywhere?'),

    /* ------------------------------ BLOCK 9 · ROTATIONS AND FLUIDITY */
    W(33, 'introduce', 'Symmetric rotation', 'core-rotations', ['k1_pattern_fb_pivot', 'overlap_pattern'],
      'Skip. They have no fixed position to leave yet.',
      'One rotation, three players: walked, then jogged, then opposed.',
      'Several symmetric rotations, each called by name.',
      'Second pass on block 1. They know the corridors — now the players inside them start swapping.'),
    W(34, 'develop', 'Positional fluidity', 'core-fluidity', ['positional_4v4_3', 'k1_role_pivot'],
      'Skip. Let them go everywhere and enjoy it.',
      'One pair: one roams, one holds. Never both.',
      'Several pairs, decided by the players in the moment.',
      'A boy who never had a fixed position cannot be fluid. He has nothing to be fluid from.'),
    W(35, 'complicate', 'Asymmetric rotation', 'core-rotations', ['positional_4v4_3', 'dz_flank_2v1_box'],
      'Skip.',
      'Show it once. Do not train it yet.',
      'Overload one side, accept the imbalance, cover behind.',
      'Performance only, and only because rest defence landed in week 27. A team that overloads without covering loses 4-3.'),
    W(36, 'consolidate', 'Rotation game form', null, ['positional_4v4_3', 'ssg_3v3_gk'],
      'Festival.',
      'Game with one rotation allowed per attack.',
      '11v11 with rotations called live by the players.',
      'Re-check week 33, and also week 2: can they still name all five corridors, thirty weeks later?'),

    /* ------------------------- BLOCK 10 · THE VARIATION, AND THE END */
    W(37, 'introduce', 'The 4-2-2-2 · the square', 'the-4222', ['dz_rondo_6v2_rect', 'k1_pattern_fb_pivot'],
      'Skip.',
      'Introduce the shape as a variation, not a replacement.',
      'The magic square and the two tens in the half-spaces.',
      'Our model prefers 4-2-3-1 and 4-3-3. This is a variation on them. Always say so.'),
    W(38, 'develop', 'De Zerbi’s method', 'dezerbi-method', ['dz_bait_press', 'dz_counterpress_zones'],
      'Skip.',
      'Skip. Play the games instead.',
      'The sole, the bait, the free man, and the price of the method.',
      'Coaches and U16+. Present this one on a Workshop Friday, then the Fàbregas class the week after if there is time.'),
    W(39, 'complicate', 'Opponent week', null, ['def_shape_shadow', 'press_trap_433'],
      'Festival.',
      'Which pillar do we need most against this team?',
      'Full opponent plan: their build-up, their counter, our press.',
      'Use the Match centre to plan it and the board to show it.'),
    W(40, 'consolidate', 'Season review and the player', null, [],
      'Awards and a party. Tell every boy one thing he does well.',
      'One strength, one target, agreed with the boy himself.',
      'Four-corner review and an individual plan for next season.',
      'Every boy gets five minutes and leaves with one target. Use the player profiles in Teams.'),
  ];

  /* The training week, mapped onto the club's own named nights.
   * The rule underneath it: never ask for the same physical quality two days running. */
  const MICROCYCLE = [
    { day: 'Mon', block: 'La Masia Mondays', md: 'MD-5', quality: 'Tension', scope: 'Sub-principles · small group',
      space: 'Small — rondos and position games, roughly 20 × 30 m', shape: 'Arrival ball-work → rondo ladder → position game → small game form',
      note: 'Short sharp bouts with long rests. Rondos are exactly this stimulus, which is why the club’s own Monday fits without being forced.' },
    { day: 'Tue', block: 'Arsenal Tuesdays', md: 'MD-4', quality: 'Duration', scope: 'Main principles · whole team',
      space: 'Large — 8v8 up to 11v11, 40 × 35 m to full pitch', shape: 'Warm-up with the ball → patterns and unit work → directional game form → finishing',
      note: 'The volume peak of the week. Set the problem once, then watch.' },
    { day: 'Wed', block: '(no session)', md: 'Recovery', quality: '—', scope: 'Consolidation',
      space: '—', shape: 'Optional whiteboard or video only',
      note: 'If you can move a session here from Monday or Tuesday, do it. Two hard nights back to back on growing bodies is a real load, especially for boys who walked to training.' },
    { day: 'Thu', block: 'Speed & Transition Thursdays', md: 'MD-2', quality: 'Velocity', scope: 'Sub-sub-principles · transitions',
      space: 'Expanded — around 35 × 55 m, short reps, full recovery', shape: 'Activation → transition game → finishing at speed → set-piece rehearsal',
      note: 'Low volume, maximum speed. Cues only, almost no stopping. This night also carries the set pieces, because there is no Friday session.' },
    { day: 'Fri', block: 'Workshop Fridays', md: 'MD-1', quality: '— (coaches only)', scope: 'Game strategy',
      space: '—', shape: 'Coach education, review the week, agree tomorrow’s focus, print the observation sheet',
      note: 'The club already names this night for the coaches. Keep it that way.' },
    { day: 'Sat', block: 'Tactical Saturdays', md: 'MD', quality: '—', scope: 'Express the model',
      space: 'Match', shape: 'One reminder of the week’s theme before kick-off, then observe against the sheet',
      note: 'Minimal touchline instruction. The match is the exam, not another training session.' },
  ];

  /* --------------------------------------------------------------- state */
  function load(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  C.BANDS = BANDS;
  C.BLOCKS = BLOCKS;
  C.ROLES = ROLES;
  C.LEVELS = LEVELS;
  C.MICROCYCLE = MICROCYCLE;
  C.weeks = () => WEEKS.slice();
  C.week = n => WEEKS.find(w => w.n === n) || null;
  C.blockOf = n => BLOCKS.find(b => n >= b.weeks[0] && n <= b.weeks[1]) || null;
  C.weeksOfBlock = b => WEEKS.filter(w => w.n >= b.weeks[0] && w.n <= b.weeks[1]);
  C.block = n => BLOCKS.find(b => b.n === n) || null;

  C.bandFor = function (ageGroup) {
    const n = parseInt(String(ageGroup || '').replace(/\D/g, ''), 10);
    if (!n) return null;
    if (n <= 11) return BANDS[0];
    if (n <= 15) return BANDS[1];
    return BANDS[2];
  };

  C.done = function (teamId, n) { return !!(load(KEY)[teamId || '_'] || {})[n]; };
  C.setDone = function (teamId, n, v) {
    const all = load(KEY), k = teamId || '_';
    all[k] = all[k] || {};
    if (v) all[k][n] = Date.now(); else delete all[k][n];
    save(KEY, all);
  };
  C.progress = function (teamId) {
    const n = Object.keys(load(KEY)[teamId || '_'] || {}).length;
    return { done: n, total: WEEKS.length, pct: Math.round(n / WEEKS.length * 100) };
  };
  C.next = function (teamId) {
    const all = load(KEY)[teamId || '_'] || {};
    return WEEKS.find(w => !all[w.n]) || null;
  };

  /* ------------------------------------------- per-player concept levels */
  /** What level is this player at on this week's idea? 0–4, see LEVELS. */
  C.level = function (playerId, weekN) { return (load(CKEY)[playerId] || {})[weekN] || 0; };
  C.setLevel = function (playerId, weekN, lvl) {
    const all = load(CKEY);
    all[playerId] = all[playerId] || {};
    if (lvl) all[playerId][weekN] = lvl; else delete all[playerId][weekN];
    save(CKEY, all);
  };
  /** How much of the season has actually stuck for this player, weighted by level. */
  C.grip = function (playerId) {
    const rec = load(CKEY)[playerId] || {};
    const ks = Object.keys(rec);
    if (!ks.length) return { taught: 0, match: 0, pct: 0 };
    const match = ks.filter(k => rec[k] >= 4).length;
    const game = ks.filter(k => rec[k] >= 3).length;
    return { taught: ks.length, match, game, pct: Math.round(game / WEEKS.length * 100) };
  };

  /** The week this block's consolidation week should re-check, after the delay. */
  C.recheck = function (w) {
    if (!w || w.role !== 'consolidate') return null;
    const b = C.blockOf(w.n);
    return b ? C.week(b.weeks[0]) : null;
  };

  /** Plain text for the group chat. */
  C.shareWeek = function (w, band) {
    const out = ['*WEEK ' + w.n + ' — ' + w.theme.toUpperCase() + '*'];
    const b = C.blockOf(w.n);
    if (b) out.push('_Block ' + b.n + ': ' + b.name + ' · ' + (ROLES[w.role] || {}).name + '_');
    out.push('');
    if (band && w.bands[band.id]) out.push(band.name + ' (' + band.ages + '): ' + w.bands[band.id]);
    else BANDS.forEach(x => { if (w.bands[x.id]) out.push('*' + x.name + '* (' + x.ages + '): ' + w.bands[x.id]); });
    if (w.note) { out.push(''); out.push(w.note); }
    out.push('');
    out.push('_' + ((K1.settings && K1.settings.homeName) || 'K1 Shooters') + ' · season plan_');
    return out.join('\n');
  };

  K1.Curriculum = C;
})(window.K1 = window.K1 || {});
