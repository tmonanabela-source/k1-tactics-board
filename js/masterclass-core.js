/* K1 Shooters club app — THE K1 TACTICAL CORE: six named concepts, taught to exhaustion.
 *
 * Borrowed, deliberately, from the teaching architecture of James Wilcox (Modern Football
 * Analyst, 402 videos, author of "Rotations" and co-author of "In Sight"). His whole published
 * corpus reduces to six named ideas — the five vertical corridors, rotations, positional
 * fluidity, rest defence, rest offence and defensive transition — repeated over hundreds of
 * match examples. Six, not sixty. That restraint is the lesson.
 *
 * Three of his habits are copied on purpose:
 *   1. DEFINITION FIRST. Every module opens with the term, its meaning, and the problem it
 *      makes for the opponent — before any football is shown. See the `define` block.
 *   2. ONE CONCEPT PER MODULE, seven to eight minutes. His own median video is 7:24.
 *   3. THEORY AND CASE STUDY KEPT APART. The theory is authored once; the examples accumulate.
 *
 * And one gap of his is filled: he explains but never prescribes. Every module here ends
 * pointing at drills, because a concept a boy cannot train is a concept he will not keep. */
(function (K1) {
  'use strict';
  const R = mc => K1.Masterclass.register(mc);
  const GROUP = 'The K1 tactical core';

  /* ================================================== M1 · THE FIVE CORRIDORS */
  R({
    id: 'core-corridors', group: GROUP, title: 'M1 · The five corridors',
    subtitle: 'Where to stand, before anything else', coach: 'Modern Football Analyst',
    level: 'U11 and up', duration: '20 min', accent: '#38bdf8',
    summary: 'The first and most useful idea in modern football, and the one a nine-year-old can hold. Cut the pitch into five strips running goal to goal. Everything else in this core — every rotation, every overload, every press — is described using these five words.',
    sessionIds: ['k1_rondo_5v2', 'positional_4v4_3', 'k1_zone_buildup'],
    slides: [
      { kind: 'chapter', title: 'M1 · The five corridors', lead: 'The vocabulary the whole club shares.' },
      { title: 'What a corridor is', lead: 'Say the word before you use the word.',
        define: { term: 'Vertical corridor', meaning: 'One of five strips running the length of the pitch: left wide area, left half-space, centre, right half-space, right wide area.',
          hurts: 'A defender can only cover one corridor properly. If we occupy all five and they have four defenders, one of our corridors is always free.' },
        points: [
          'The two half-spaces are the strips between the edge of the penalty area and the touchline side of it.',
          'That is not a coaching invention — you can see the line on any real pitch. The edge of the 18-yard box is the boundary.',
          'A defender standing in the centre cannot also defend the half-space. He has to choose.',
          'Which is why the half-space is the most dangerous strip on the field.',
        ],
        board: { formation: '433', away: '442low', pitch: 'full', overlay: 'zones15' },
        caption: 'Five corridors across, three thirds up. Fifteen zones.',
        say: { script: 'Look at the board and read the words down the side. Wide, half-space, centre. From tonight, when I shout one of those at you, you must know exactly where I mean without looking at me.',
          ask: 'Walk onto the pitch and stand in the left half-space. Do not guess — use the box to find it.',
          cue: 'Which corridor are you in?' },
        note: 'Turn on the “Named lanes × thirds” overlay on the board and leave it on for the first month of teaching this.' },
      { title: 'One man per corridor', lead: 'The rule that makes the idea usable.',
        points: [
          'Never two of ours in the same corridor at the same height. One defender then marks both of us.',
          'Never leave both wide corridors empty, or their back four can squeeze into the middle and we have nowhere to play.',
          'When a winger comes inside, the full-back goes outside. The corridor is handed over, never abandoned.',
          'At 9-a-side we have eight outfield players, so we hold the five corridors more loosely — but the wide ones are never both empty.',
        ],
        board: { formation: '235', away: '4141mid', pitch: 'full', overlay: 'laneslab' },
        caption: '2-3-5 · five attackers, five corridors.',
        say: { script: 'There are five strips and there are eleven of us. That means somebody always has a strip to himself, and I want you to know whether it is you.',
          ask: 'You and your team-mate are both in the centre corridor. Who moves, and which way?',
          cue: 'Get out of his lane.' },
        coaching: ['Freeze play and ask who is doubled up', 'Make them name the corridor out loud, not point at it', 'The winger holds his corridor even when the ball is on the far side'] },
      { title: 'Why the half-space is the money zone', lead: 'If the boys learn only one of the five, make it this one.',
        points: [
          'A player in the half-space can see the goal, the wing and the centre at the same time.',
          'A pass from the half-space can go behind the back line without crossing the whole pitch.',
          'Their centre-back does not want to follow him out. Their full-back does not want to come in. So he is often free.',
          'Nearly every goal in elite football is created from one of the two half-spaces or finished from the centre.',
        ],
        board: { phase: 'ph_create_pocket' },
        caption: 'Receiving between the lines, in the half-space.',
        say: { script: 'This strip here is where our best chances are going to come from this season. Not the wing. Not the middle. Here.',
          ask: 'Their centre-back and their full-back are both looking at you in this strip. Which one of them is going to come, and what do you do the moment he does?',
          cue: 'Get in the pocket.' } },
      { title: 'Train it this week', lead: 'A concept you cannot train is a concept they will forget by Saturday.',
        points: [
          'Rondo with the corridors marked out in cones — you may only receive if you are alone in your strip.',
          'Positional 4v4+3 where a goal counts double if the assist came from a half-space.',
          'Zone build-up: the ball must travel through at least two corridors before we can score.',
        ],
        board: { drill: 'k1_zone_buildup' },
        say: { script: 'Tonight we play the same games you always play, with one rule added. That rule is the lesson.',
          cue: 'Two corridors before you shoot.' } },
    ],
    sources: [
      'James Wilcox and Gus Ellison, “In Sight: The Modern Tactics Behind a Footballer’s Field of View” (2021) — “the five vertical corridors”.',
      'K1 Shooters Academy Youth Development Model — “half-space” is already in our language of play.',
    ],
  });

  /* ========================================================= M2 · ROTATIONS */
  R({
    id: 'core-rotations', group: GROUP, title: 'M2 · Rotations',
    subtitle: 'Symmetric and asymmetric — the two kinds, and when to use which', coach: 'Modern Football Analyst',
    level: 'U14 and up', duration: '30 min', accent: '#a855f7',
    summary: 'Wilcox wrote a whole book on this one idea and split it in two: symmetric rotations, which preserve our shape, and asymmetric rotations, which break it on purpose. Get that distinction into a boy’s head and he stops swapping positions at random and starts doing it for a reason.',
    sessionIds: ['k1_pattern_fb_pivot', 'positional_4v4_3', 'overlap_pattern'],
    slides: [
      { kind: 'chapter', title: 'M2 · Rotations', lead: 'Two types. Name them before you use them.' },
      { title: 'What a rotation actually is', lead: 'Not “swapping positions”. Something much more specific.',
        define: { term: 'Rotation', meaning: 'Two or three players exchanging jobs while the ball is in play, so that the positions stay filled but the people in them change.',
          hurts: 'A man-marking defender has to decide whether to follow his player into a new area or hand him over. Either choice costs him a second, and a second is all we need.' },
        points: [
          'A rotation is not one man wandering. It is two or three moving together, in a rehearsed relationship.',
          'If one man leaves a corridor and nobody fills it, that is not a rotation. That is a hole.',
          'Rotations are what make a fixed formation stop looking fixed.',
          'They work best where their marking is least clear: between their full-back and their centre-back.',
        ],
        quote: { text: 'The two types of rotations this book looks to explain and expand upon are symmetric and asymmetric rotations.', by: 'James Wilcox', source: 'Rotations, 2021' },
        say: { script: 'When I say rotate, I do not mean run somewhere else. I mean you and one other man change jobs, and the pitch still looks the same afterwards.',
          ask: 'If you leave the wing and nobody takes it, what have you actually done to your team?',
          cue: 'Somebody fills it.' } },
      { title: 'Symmetric · the shape survives', lead: 'The safe one. Teach this one first and use it every week.',
        define: { term: 'Symmetric rotation', meaning: 'Players exchange jobs but every corridor stays occupied, so our shape after the rotation looks like our shape before it.',
          hurts: 'Their markers get handed a different player but no new space, so they must communicate under pressure — and youth teams almost never do.' },
        points: [
          'Full-back comes inside. Winger drops onto the touchline. The eight pushes past both of them.',
          'Three men moved. Three corridors still filled. Our balance has not changed at all.',
          'Because nothing is risked, we can do this over and over without ever being exposed.',
          'This is the rotation for U14s, for a tight game, and for the first twenty minutes of anything.',
        ],
        board: { morph: 'rot_symmetric' },
        caption: 'Play the frames: before · after · keep building.',
        say: { script: 'Watch the three players, not the ball. When it finishes, count the corridors. All five still have somebody in them. That is why this one is safe.',
          ask: 'You are the eight and the full-back has come inside. Where are you going, and who told you?',
          cue: 'Swap jobs, keep the shape.' },
        coaching: ['Rehearse it walking, then jogging, then opposed', 'Call the rotation by name so all three know it is on', 'If a corridor empties, stop and restart — do not let it slide'] },
      { title: 'Asymmetric · break the shape on purpose', lead: 'The dangerous one. It wins matches and it loses them.',
        define: { term: 'Asymmetric rotation', meaning: 'We deliberately load one side of the pitch and leave the other thin, accepting imbalance in order to create a numbers advantage where the ball is.',
          hurts: 'Their defence cannot solve a 3-against-2 locally. To fix it they must pull a player across, which opens the side we emptied — and that is the side we are about to switch to.' },
        points: [
          'Three of ours on one flank against two of theirs. Somebody is free, every time.',
          'The far side is left almost empty on purpose. That is not laziness, it is the plan.',
          'It costs more when we lose it, because we have fewer bodies on the counter-attack side.',
          'So it is only allowed when the rest defence is set. Never in the first phase, never when we are ahead late.',
        ],
        board: { morph: 'rot_asymmetric' },
        caption: 'Four frames — and look at the last one, which is the bill.',
        say: { script: 'This one is more exciting and it is more expensive. I will let you do it when I can see three men behind the ball. Until I can see them, the answer is no.',
          ask: 'We have three on the left and one on the right. If we lose it right now, where does their counter-attack go?',
          cue: 'Overload only when we are covered.' },
        note: 'Teach this at U16 and above, and only after rest defence in M4. A team that overloads without covering is a team that loses 4-3.' },
      { title: 'Which one, and when', lead: 'The whole module in one table the boys can remember.',
        points: [
          'Losing? Asymmetric. We need somebody free and we can afford the risk.',
          'Winning with ten minutes left? Symmetric only. Keep the shape, keep the ball.',
          'Their winger not tracking back? Asymmetric down that side, all night.',
          'First fifteen minutes of any match? Symmetric, while we find out what they do.',
        ],
        board: { formation: '3241', away: '442low', pitch: 'full', overlay: 'laneslab' },
        say: { script: 'Two tools. One is safe, one is sharp. A good player knows both. A good team knows which one the score demands.',
          ask: 'It is nil-nil with twenty minutes to go and they are sitting deep. Which one, and down which side?',
          cue: 'Safe one or sharp one?' } },
    ],
    sources: [
      'James Wilcox, “Rotations: Advanced Tactical Guide To Understanding Movement Among Players At The Highest Level” (2021) — the symmetric/asymmetric taxonomy is his, quoted from the book’s own description.',
      'The working definitions of each type here are our own, written for this academy — he defines them inside the book.',
    ],
  });

  /* ================================================ M3 · POSITIONAL FLUIDITY */
  R({
    id: 'core-fluidity', group: GROUP, title: 'M3 · Positional fluidity',
    subtitle: 'How far a boy may roam, and what he owes when he does', coach: 'Modern Football Analyst',
    level: 'U14 and up', duration: '25 min', accent: '#22c55e',
    summary: 'The bridge between “stay in your position” and “play what you see”. Fluidity is not freedom from the shape — it is freedom inside it, bought by somebody else covering. This is the module that stops a clever boy being told to stand still.',
    sessionIds: ['positional_4v4_3', 'rondo_5v2_transition', 'k1_role_pivot'],
    slides: [
      { kind: 'chapter', title: 'M3 · Positional fluidity', lead: 'Freedom, with a receipt.' },
      { title: 'The definition, and the price', lead: 'Every boy wants this one. Give it to them with the condition attached.',
        define: { term: 'Positional fluidity', meaning: 'Players moving out of their nominal position to find the ball or the space, while team-mates adjust so the structure is never left broken.',
          hurts: 'Their marking scheme was built against our formation on paper. If the man in the half-space keeps changing, they have to defend space instead of people — which is much harder.' },
        points: [
          'Fluidity without cover is just indiscipline with a nicer name.',
          'The rule: you may leave your position the moment somebody has taken it.',
          'Which means the covering player, not the roaming player, decides whether the rotation is on.',
          'The best roamers in the world are the ones who look behind them first.',
        ],
        board: { formation: '4222como', away: '442', pitch: 'full', overlay: 'laneslab' },
        caption: 'Como’s free ten — allowed to roam because the other one holds.',
        say: { script: 'I know some of you feel like the position is a cage. It is not. You can go and find the ball anywhere on this pitch, on one condition, and the condition is behind you, not in front of you.',
          ask: 'You want to drift inside. Before you go, what is the one thing you must check?',
          cue: 'Who has got your place?' } },
      { title: 'The free man and the holder', lead: 'In every pair, one roams and one stays. Decide before the whistle, not during.',
        points: [
          'Two tens: one goes hunting for the ball, one holds the far half-space. Never both hunting.',
          'Two full-backs: one flies, one tucks. Never both flying.',
          'Two centre-midfielders: one goes beyond, one screens. Never both beyond.',
          'The pairing is the unit of fluidity. Not the individual.',
        ],
        board: { morph: 'fabregas_como' },
        caption: 'One roams, one holds — the same rule at every level.',
        say: { script: 'Look at every pair in this team. In each pair, one of you is allowed to go and one of you is holding the fort. If you both go, I am not angry with the one who went. I am angry with both.',
          ask: 'You and your partner both drifted inside. Whose job was it to stay?',
          cue: 'One goes, one holds.' },
        coaching: ['Name the pairs out loud before kick-off', 'Let them agree between themselves who roams first', 'Swap the roles at half-time so both learn both'] },
      { title: 'Fluidity by age', lead: 'The honest version: this is not a U11 concept, and pretending otherwise ruins young players.',
        points: [
          'Foundation, U7 to U11 — no fluidity work at all. Let them go everywhere and enjoy it. They are learning the ball, not the shape.',
          'Formation, U12 to U15 — fixed positions first, then simple pairs. One rotation, rehearsed, on one side.',
          'Performance, U16 to U19 — full fluidity, several pairs, decided by the players in the moment.',
          'A boy who never had a fixed position cannot be fluid. He has nothing to be fluid from.',
        ],
        board: { morph: 'youth_9v9_323' },
        caption: '9v9 in a 3-2-3 — positions first, roaming later.',
        say: { script: 'To the U13s watching this: you are not ready for this yet, and that is not an insult. You are learning where home is. You cannot leave home before you have one.',
          cue: 'Learn the position. Then leave it.' },
        note: 'Our own pathway already says this: Foundation is ball mastery and joy; Formation is game intelligence; Performance is tactical readiness. Fluidity belongs to the last two.' },
    ],
    sources: [
      'Modern Football Analyst — “Positional Fluidity” is one of his six named concept playlists.',
      'K1 Shooters Academy Youth Development Model — the Foundation / Formation / Performance pathway.',
    ],
  });

  /* ===================================================== M4 · REST DEFENCE */
  R({
    id: 'core-rest-defence', group: GROUP, title: 'M4 · Rest defence',
    subtitle: 'Our defensive shape while we still have the ball', coach: 'Modern Football Analyst',
    level: 'U15 and up', duration: '25 min', accent: '#ef4444',
    summary: 'The highest-level idea in this whole core, and almost no township academy teaches it. Rest defence is how we are organised during our own attack, so that their counter-attack never starts. Teach this and we stop conceding the goal that always arrives two minutes after we nearly score.',
    sessionIds: ['dz_counterpress_zones', 'transition_4v4_2', 'def_shape_shadow'],
    slides: [
      { kind: 'chapter', title: 'M4 · Rest defence', lead: 'The players who are not in the attack are the reason it can happen.' },
      { title: 'The definition', lead: 'Read it twice. It is the opposite of how most people think about defending.',
        define: { term: 'Rest defence', meaning: 'The shape of the players left behind the ball while our team is attacking — arranged before we lose it, not after.',
          hurts: 'It removes the opponent’s best weapon. A team that cannot counter-attack has to build against us from their own third, and almost nobody at youth level can.' },
        points: [
          'Defending does not start when we lose the ball. It starts while we still have it.',
          'Usually the two centre-backs plus the anchor. Sometimes the inverted full-back makes it four.',
          'Their job is not to block a shot. It is to be standing in the lanes their counter would use.',
          'If we get this right, the counter-attack dies before the first pass.',
        ],
        board: { phase: 'ph_prog_third' },
        caption: 'Count the players behind the ball, not in front of it.',
        say: { script: 'Every goal we have conceded on the break this season was decided while we were attacking, not while we were defending. That is what this is about.',
          ask: 'We are attacking and the ball is on their edge of the box. How many of us are behind it, and who are they?',
          cue: 'Who is our rest defence?' } },
      { title: 'How many stay behind', lead: 'A simple, teachable rule for a youth team.',
        points: [
          'Against one striker: two stay. Against two strikers: three stay. Always one more than they leave up.',
          'Plus the anchor in front of them, in the centre corridor, covering the pass through the middle.',
          'Nobody in the rest defence goes past halfway. Not for a corner idea, not because he is bored.',
          'The goalkeeper is part of it. High enough to sweep, and he is talking the whole time.',
        ],
        board: { formation: '325', away: '442', pitch: 'full', overlay: 'laneslab' },
        caption: 'Three behind, two in front, five attacking.',
        note: 'The same counting rule runs backwards through the whole team. Against two strikers you build with three at the back. Against one, a pair is enough. Number them, and win the first line before it is even contested.',
        say: { script: 'One more than they leave up. That is the whole rule and I want you to be able to count it in two seconds while the ball is somewhere else.',
          ask: 'They have left two strikers up the pitch. How many of us stay? Say the number.',
          cue: 'One more than them.' },
        coaching: ['Stop the session and ask them to count aloud', 'Praise the centre-back who refused to join the attack', 'If the anchor drifts wide, restart — the centre is his corridor'] },
      { title: 'Rest defence is what buys the counter-press', lead: 'The two ideas are the same idea, five seconds apart.',
        points: [
          'If we are well arranged when we lose it, the nearest three can attack the ball immediately.',
          'If we are badly arranged, those same three have to run backwards instead, and the press is impossible.',
          'So counter-pressing is not about effort. It is about where we were standing a second earlier.',
          'Five seconds to win it back. If we have not, everybody drops into shape and we start again.',
        ],
        board: { phase: 'ph_press_high' },
        caption: 'Win it back in five, or drop and reset.',
        quote: { text: 'A good counterpress isn’t determined when the ball is lost. It’s determined when the team structures themselves in possession.', by: 'James Wilcox', source: 'Modern Football Analyst' },
        say: { script: 'People think counter-pressing is about how hard you work. It is not. It is about where you were standing before the ball was lost. Work cannot fix bad position.',
          ask: 'You lose the ball. Do you press or drop? What tells you which?',
          cue: 'Five seconds.' } },
    ],
    sources: [
      'Modern Football Analyst — “Rest Defense” is one of his six named concept playlists, paired with “Rest Offense”.',
      'Counter-pressing and the five-second rule as taught in the public coaching literature.',
    ],
  });

  /* ===================================================== M5 · REST OFFENCE */
  R({
    id: 'core-rest-offence', group: GROUP, title: 'M5 · Rest offence',
    subtitle: 'Our attacking shape while they still have the ball', coach: 'Modern Football Analyst',
    level: 'U15 and up', duration: '20 min', accent: '#f97316',
    summary: 'The mirror of M4, and the rarer half of the pair. While we are defending, two or three of our players are not really defending at all — they are standing where the counter-attack will need them. Get this right and we go from winning the ball to shooting in four seconds.',
    sessionIds: ['transition_4v4_2', 'k1_waves_1v1_2v1', 'finishing_circuit'],
    slides: [
      { kind: 'chapter', title: 'M5 · Rest offence', lead: 'Where you stand while they have it decides how fast we can hurt them.' },
      { title: 'The definition', lead: 'The half of the pair almost nobody coaches.',
        define: { term: 'Rest offence', meaning: 'The positions our forward players hold while the opponent has the ball, chosen so that the moment we win it, the counter-attack already has shape.',
          hurts: 'It turns a tackle into a chance. Their defenders must stay honest and cannot all push up to support their attack, which makes their own build-up shorter and easier for us to press.' },
        points: [
          'Our striker does not chase everything. He stands between their two centre-backs and waits.',
          'One winger stays high and wide on the side we are most likely to win it.',
          'That is two players who are, in effect, already on the counter-attack before it exists.',
          'It is a trade: two fewer defenders, in exchange for a real threat the moment we win it.',
        ],
        board: { formation: '442low', away: '235', pitch: 'full', overlay: 'laneslab' },
        caption: 'Nine defending, two waiting. The two are not lazy.',
        say: { script: 'When I leave our striker up there while everyone else defends, some of you think he is getting away with it. He is doing a job and it is the reason we scored on the break last week.',
          ask: 'They have the ball on their right. Which of our forwards stays high, and on which side?',
          cue: 'Stay up. Stay wide.' } },
      { title: 'The first pass decides everything', lead: 'The whole point of rest offence is that the outlet is already there.',
        points: [
          'The moment we win it, look forward first. Always forward first.',
          'If the striker is where he should be, that pass exists before we have even tackled.',
          'If he came back to help defend, the pass does not exist and we are just clearing it.',
          'This is why we do not ask everybody to defend. Somebody has to be the reason to look up.',
        ],
        board: { phase: 'ph_counter' },
        caption: 'Won it · look forward · three runners already going.',
        say: { script: 'The second you win that ball, your first look is forward. Not sideways, not backwards. If the pass is not on, then you can be sensible. But look first.',
          ask: 'You have just won it in midfield. Before you look up, where do you already know our striker is?',
          cue: 'Look forward first.' },
        coaching: ['Drill the win-and-look as one movement, not two', 'If the first pass goes backwards in the exercise, restart it', 'Reward the striker who held his position even when the counter did not come'] },
      { title: 'The pair, taught together', lead: 'M4 and M5 are one idea seen from both ends. Never teach one without the other.',
        points: [
          'Rest defence: our shape behind the ball while we attack. It stops their counter.',
          'Rest offence: our shape ahead of the ball while they attack. It starts ours.',
          'Both are decided before the turnover, and both are invisible on a highlight reel.',
          'A team that has both is never out of shape in either direction. That is the whole goal.',
        ],
        board: { morph: 'k1_press_build' },
        caption: 'Our own model, read through the pair.',
        say: { script: 'These two ideas are the same idea. One is what we leave behind when we go forward. The other is what we leave forward when we come back. A good team is always doing both at once.',
          ask: 'Right now, at this moment in the game, are you rest defence or rest offence?',
          cue: 'Which one are you right now?' } },
    ],
    sources: [
      'Modern Football Analyst — “Rest Offense” and “Rest Defense” are a matched pair of his named concept playlists.',
    ],
  });

  /* ============================================== M6 · DEFENSIVE TRANSITION */
  R({
    id: 'core-transition', group: GROUP, title: 'M6 · Defensive transition',
    subtitle: 'The five seconds after we lose it', coach: 'Modern Football Analyst',
    level: 'U13 and up', duration: '25 min', accent: '#64748b',
    summary: 'His largest concept playlist after the two big theory buckets, and for good reason: more youth goals are conceded in the ten seconds after losing the ball than at any other time. This module turns that moment from panic into a rehearsed decision.',
    sessionIds: ['dz_counterpress_zones', 'rondo_5v2_transition', 'k1_press_4plus2v3'],
    slides: [
      { kind: 'chapter', title: 'M6 · Defensive transition', lead: 'The moment the ball changes hands, going the wrong way.' },
      { title: 'The definition', lead: 'Name the moment so they can recognise it while it is happening.',
        define: { term: 'Defensive transition', meaning: 'The seconds immediately after we lose possession, before either team is organised.',
          hurts: 'It is the moment we are most vulnerable, because our shape is an attacking shape. Every team’s best chances come from the other team’s worst transitions.' },
        points: [
          'We are stretched, because we were attacking. They are not, because they were defending.',
          'So for about five seconds we are outnumbered wherever the ball is.',
          'Everything depends on one binary choice, made instantly: press it, or drop off.',
          'The worst outcome is half the team pressing and half dropping. That is how we concede.',
        ],
        board: { phase: 'ph_block_mid' },
        caption: 'Stretched, and the ball has just gone.',
        say: { script: 'There is a moment in every match when we lose the ball and for about five seconds we are in trouble. It happens twenty times a game. Tonight we are going to make it a decision instead of a fright.',
          ask: 'What is the worst thing eleven players can do in that moment?',
          cue: 'All press, or all drop. Never half.' } },
      { title: 'Press or drop — the three triggers', lead: 'Three things tell us which one. Learn them and nobody has to shout.',
        points: [
          'Are we near the ball? If three of ours are within about ten metres, press. If not, drop.',
          'Is his head down? A player who has just won it and is looking at the ball can be robbed. Press.',
          'Are we covered behind? If the rest defence is set, press. If we are already exposed, drop and get the shape back.',
          'And if any of the three says no — everybody drops. Together, and fast.',
        ],
        board: { phase: 'ph_press_high' },
        caption: 'Press: nearest three attack the ball, the rest squeeze up.',
        say: { script: 'Three questions and you must answer all three before you take a step. Are we near it. Is his head down. Are we covered. Three yeses, go. Any no, drop.',
          ask: 'They have just won it, his head is up, and two of you are twenty metres away. Press or drop?',
          cue: 'Near it, head down, covered?' },
        coaching: ['Practise the call — one voice, and everyone obeys it', 'Reward the boy who drops correctly as loudly as the boy who wins it back', 'Freeze the moment of loss and ask each player what his three answers were'] },
      { title: 'Three zones, three different jobs', lead: 'The question every coach gets asked — do we mark zonally or man to man? The answer is both, and it depends where the ball is.',
        define: { term: 'The defending map', meaning: 'The pitch has three defending zones across it, and our job changes in each one: control the space in the centre, block and create access in the half-spaces, win the ball in the wide areas.',
          hurts: 'It means the further they carry the ball from the middle, the more aggressive we get. They are walking into our tackle, not away from it.' },
        points: [
          'Centre corridor — control the space. Do not dive in. Make them go outside.',
          'Half-spaces — block the forward pass and get access to the man. Closer, but still not a lunge.',
          'Wide areas — win the ball. This is where we actually tackle, because the touchline is our extra defender.',
          'So the marking gets tighter as the ball travels outward: space-oriented, then option-oriented, then man-oriented.',
        ],
        board: { formation: '442low', away: '325', pitch: 'full', overlay: 'zones15' },
        caption: 'Centre: hold. Half-space: block. Wide: go.',
        say: { script: 'Stop asking me whether we mark the man or the space. We do both. In the middle you hold your space. Out by the touchline you go and take it off him. The touchline helps you — it is one more defender that never gets tired.',
          ask: 'The ball is in the centre circle at their feet. Do you go? Now it is on the touchline. Do you go?',
          cue: 'Middle hold, wide go.' },
        coaching: ['Walk the three zones with them before you play', 'Praise the defender who did NOT dive in centrally', 'If we are tackling in the middle and holding out wide, we have it exactly backwards'] },
      { title: 'Dropping is not losing', lead: 'The hardest thing to sell to a brave team, and the most necessary.',
        points: [
          'A team that presses every single turnover will be pulled apart by a good opponent.',
          'Dropping into shape and making them play through us is a decision, not a surrender.',
          'Once we are compact again, we are back to defending on our terms — and our low block is good.',
          'Five seconds of pressing. If it has not worked, get behind the ball. No arguments.',
        ],
        board: { phase: 'ph_block_low' },
        caption: 'Failed to win it back? Behind the ball, compact, start again.',
        say: { script: 'I am never going to be angry with you for dropping. I am going to be angry when three of you press and eight of you drop, because then we have done neither.',
          ask: 'You pressed, it did not work, five seconds are gone. Now what?',
          cue: 'Get behind the ball.' } },
      { title: 'Train the moment, not the drill', lead: 'Transition cannot be taught in a passing pattern. It needs a real turnover.',
        points: [
          'Any small-sided game where the coach can turn possession over without warning.',
          'Count the five seconds out loud so the boys hear the clock.',
          'Score it: a goal within ten seconds of a turnover counts double, either way.',
          'Ten minutes of this a week changes more matches than an hour of anything else.',
        ],
        board: { drill: 'transition_4v4_2' },
        say: { script: 'We are going to play a normal game, and I am going to throw a new ball in whenever I feel like it. When I do, you have five seconds. I will count them so you can hear.',
          cue: 'Five... four... three...' } },
    ],
    sources: [
      'Modern Football Analyst — “Defensive Transition” is one of his six named concept playlists and one of his largest.',
      'The three defending zones and the space-to-man marking gradient are his, from “How The Best Teams Win The Ball Back”.',
      'The press-or-drop triggers as taught in the public coaching literature and in our own high-press masterclass.',
    ],
  });

})(window.K1 = window.K1 || {});
