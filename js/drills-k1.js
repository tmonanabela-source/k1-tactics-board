/* K1 Shooters club app — the drills named in the K1 Shooters Academy Youth Development Model.
 * These are the club's own weekly practices (La Masia Mondays, Arsenal Tuesdays, Workshop Fridays,
 * Tactical Saturdays) laid out on the board so any coach can run them the same way. */
(function (K1) {
  'use strict';

  const P = (team, n, x, y, o) => Object.assign({ t: 'player', team, n, x, y, k: (team === 'home' ? 'h' : team === 'away' ? 'a' : 'n') + n }, o || {});
  const GK = (team, x, y) => P(team, 1, x, y, { gk: true });
  const B = (x, y) => ({ t: 'ball', x, y, k: 'ball' });
  const E = (kind, x, y, o) => Object.assign({ t: 'equip', kind, x, y }, o || {});
  const A = (kind, x1, y1, x2, y2, o) => Object.assign({ t: 'path', kind, points: [[x1, y1], [x2, y2]] }, o || {});
  const C = (x1, y1, cx, cy, x2, y2, o) => Object.assign({ t: 'path', kind: 'curve', points: [[x1, y1], [x2, y2]], ctrl: [cx, cy] }, o || {});
  const T = (x, y, text, o) => Object.assign({ t: 'text', x, y, text, size: 1.8, color: '#ffffff' }, o || {});
  const Z = (x, y, w, h, o) => Object.assign({ t: 'shape', kind: 'zone', x, y, w, h, opacity: .15 }, o || {});
  const GOLD = '#f5b301', WHITE = '#ffffff', SKY = '#7dd3fc', ORANGE = '#f97316', YELLOW = '#facc15', GREEN = '#4ade80', RED = '#ff5d5d';
  const cones = (pts, color) => pts.map(p => E('cone', p[0], p[1], { color: color || ORANGE }));

  const K1_DRILLS = [
    /* ------------------------------------------ La Masia Mondays · build-up & control */
    {
      id: 'k1_rondo_5v2', group: 'K1 · La Masia Mondays', name: 'Rondo 5v2 · scan before you receive',
      pitch: { type: 'grid', L: 18, W: 16, gridStep: 2 }, time: '15 min', players: '7 per grid', equipment: '4 cones, 3 balls',
      desc: 'Five on the outside of a 10 × 10 m square keep the ball from two inside. Two touches to start, then one. The rule that matters: before the ball reaches you, your head has already turned twice.',
      coaching: ['Scan over the shoulder before the ball arrives, not after', 'Open your body so you can see both defenders and both neighbours', 'Pass to the far foot — the foot away from the defender', 'When the lane between the two defenders opens, split it', 'Defenders press as a pair; one closes, one covers the split'],
      frames: [{ caption: 'Rondo 5v2 · 10 × 10 m · two touch then one touch', objects: [
        ...cones([[4, 3], [14, 3], [4, 13], [14, 13]]),
        P('home', 4, 4, 8), P('home', 6, 9, 3), P('home', 8, 14, 8), P('home', 10, 11, 13), P('home', 5, 6, 13),
        B(4.8, 8), P('away', 2, 8, 6.5), P('away', 3, 10, 9.5),
        A('pass', 4.8, 8, 8.6, 3.6, { color: GOLD }), A('pass', 9.6, 3.4, 13.4, 7.6, { color: GOLD, dash: true }),
        A('pass', 4.8, 8.6, 13.2, 8.4, { color: GREEN, dash: true }),
        T(9, 15, 'Green = the split. Take it every time it is on.', { color: GREEN, size: 1.5 }),
      ] }],
    },
    {
      id: 'k1_press_4plus2v3', group: 'K1 · La Masia Mondays', name: '4 + 2 vs 3 · beat the press together',
      pitch: { type: 'grid', L: 40, W: 30, gridStep: 5 }, time: '20 min', players: '9 + a target',
      equipment: '6 cones, bibs, balls', desc: 'Our back four and double pivot against three pressers. Play out and find the target player at the top of the grid. This is the exact picture our full-backs and anchors live in on a Saturday.',
      coaching: ['Centre-backs split wide of the goalkeeper, never square with him', 'A pivot may only drop when the pass into him is not on', 'Full-backs: high and wide when the ball is on the other side, lower when it is on yours', 'The free man is always one pass further than they are looking', 'If the forward pass is not on, switch — never force it'],
      frames: [
        { caption: 'Back 4 + double pivot vs 3 pressers. Find the target.', objects: [
          ...cones([[2, 2], [38, 2], [2, 28], [38, 28]], YELLOW),
          GK('home', 4, 15), B(4.8, 15),
          P('home', 2, 12, 27), P('home', 4, 9, 19), P('home', 5, 9, 11), P('home', 3, 12, 3),
          P('home', 6, 18, 19), P('home', 8, 18, 11),
          P('away', 9, 12, 15), P('away', 7, 15, 22), P('away', 11, 15, 8),
          P('neutral', 1, 36, 15, { name: 'Target' }),
          Z(33, 15, 8, 26, { color: GREEN, opacity: .12, label: 'TARGET ZONE' }),
          A('pass', 4.8, 15, 8.6, 19, { color: GOLD }),
        ] },
        { caption: 'They jump — the free pivot turns and hits the target.', moves: { a9: [9, 17], a7: [13, 24], h6: [21, 22], ball: [21.5, 22.4] },
          objects: [A('pass', 9, 19, 20.5, 22, { color: GOLD }), A('pass', 21, 22, 35, 15, { color: GOLD, dash: true }), T(20, 29, 'Three passes out of the press', { color: GREEN, size: 1.6 })] },
      ],
    },
    {
      id: 'k1_pattern_fb_pivot', group: 'K1 · La Masia Mondays', name: 'Pattern play · full-back overlap, underlap, pivot switch',
      pitch: { type: 'half' }, time: '20 min', players: '8–10', equipment: '4 mannequins, cones, balls',
      desc: 'The three ways our bridge players change a game: the full-back goes outside, the full-back goes inside, or the pivot switches the point of attack. Unopposed first, then with two defenders.',
      coaching: ['Overlap when the winger has come inside; underlap when he has stayed wide', 'The runner shouts before he runs so the man on the ball knows', 'Pivot: receive on the half turn, then the switch is one pass not two', 'Every pattern ends with a cross or a shot, never with a pass back'],
      frames: [
        { caption: 'A · Overlap: the 7 comes inside, the 2 goes around him.', objects: [
          GK('away', 51.5, 34), E('mannequin', 38, 58), E('mannequin', 42, 42),
          P('home', 6, 18, 40), B(18.8, 40), P('home', 7, 32, 56), P('home', 2, 24, 64), P('home', 9, 34, 34), P('home', 10, 26, 26),
          A('pass', 18.8, 40, 31.2, 55, { color: GOLD }), A('dribble', 32, 56, 38, 50, { color: WHITE }), A('run', 24, 64, 44, 64, { color: SKY }),
          T(26, 8, 'Overlap · outside · cross', { color: GOLD }),
        ] },
        { caption: 'B · Underlap: the 7 holds the touchline, the 2 runs inside him.', objects: [
          GK('away', 51.5, 34), E('mannequin', 38, 58), E('mannequin', 42, 42),
          P('home', 6, 20, 40), B(20.8, 40), P('home', 7, 34, 64), P('home', 2, 26, 56), P('home', 9, 36, 34), P('home', 10, 28, 26),
          A('pass', 20.8, 40, 33.2, 63, { color: GOLD }), A('run', 26, 56, 44, 50, { color: SKY }), A('pass', 34, 64, 44, 50, { color: GOLD, dash: true }),
          T(26, 8, 'Underlap · inside · cut-back', { color: GOLD }),
        ] },
        { caption: 'C · Pivot switch: the 6 changes the side in one pass.', objects: [
          GK('away', 51.5, 34), E('mannequin', 42, 42),
          P('home', 6, 22, 44), B(22.8, 44), P('home', 2, 30, 62), P('home', 3, 28, 8), P('home', 7, 38, 58), P('home', 10, 34, 14), P('home', 9, 40, 34),
          C(22.8, 44, 30, 18, 27, 9, { color: GOLD }), A('run', 28, 8, 44, 8, { color: SKY }), A('run', 34, 14, 44, 26, { color: WHITE }),
          T(26, 66, 'Switch · far side attacks a sliding defence', { color: GOLD }),
        ] },
      ],
    },
    {
      id: 'k1_buildup_6v5', group: 'K1 · La Masia Mondays', name: 'Build-up game 6v5 · wide triggers',
      pitch: { type: 'grid', L: 45, W: 34, gridStep: 5 }, time: '25 min', players: '11 + GK',
      equipment: '2 mini goals, cones, bibs', desc: 'Six of us build against five of them. We score by carrying the ball over the far line under control; they score in either mini goal. The condition that teaches the model: a goal counts double if it comes after we have beaten their press down one side and switched.',
      coaching: ['Goalkeeper counts as a player — use him to make it 7 v 5', 'Bait one side, then switch; the trigger is their winger stepping up', 'Full-back holds width until the ball can actually reach him', 'If we lose it, five seconds to win it back before we drop'],
      frames: [{ caption: '6v5 · beat the press, carry the ball over the line', objects: [
        E('minigoal', 1, 10, { rot: 0 }), E('minigoal', 1, 24, { rot: 0 }),
        GK('home', 4, 17), B(4.8, 17),
        P('home', 2, 13, 31), P('home', 4, 10, 22), P('home', 5, 10, 12), P('home', 3, 13, 3), P('home', 6, 20, 21), P('home', 8, 20, 13),
        P('away', 9, 13, 17), P('away', 7, 16, 26), P('away', 11, 16, 8), P('away', 6, 24, 21), P('away', 8, 24, 13),
        Z(42, 17, 6, 30, { color: GREEN, opacity: .14, label: 'CARRY OVER' }),
        A('pass', 4.8, 17, 9.6, 22, { color: GOLD }), A('pass', 10, 22, 12.6, 30, { color: GOLD, dash: true }), A('run', 20, 21, 30, 26, { color: SKY }),
      ] }],
    },

    /* ------------------------------------------ Arsenal Tuesdays · flair & final third */
    {
      id: 'k1_waves_1v1_2v1', group: 'K1 · Arsenal Tuesdays', name: '1v1 to 2v1 waves · go at him',
      pitch: { type: 'grid', L: 32, W: 24, gridStep: 4 }, time: '20 min', players: '10 + GK',
      equipment: '1 goal, 8 cones, balls', desc: 'Wave one is a straight 1v1 to goal. The moment it ends, wave two starts as a 2v1 from the other side. Constant, fast, and it rewards the boy who takes people on.',
      coaching: ['Attack the defender at speed, then change speed — not the other way round', 'First touch takes you past his standing foot', 'In the 2v1: run at the defender, not at your team-mate', 'Finish low and across the keeper', 'Swagger is allowed here. Losing the ball trying is not a mistake.'],
      frames: [{ caption: 'Wave 1: 1v1. Wave 2 starts the second it finishes.', objects: [
        E('goal', 30.5, 12, { rot: 180 }), GK('away', 28.5, 12),
        ...cones([[2, 4], [2, 20], [16, 2], [16, 22]], YELLOW),
        P('home', 7, 6, 4), B(6.8, 4.6), P('home', 9, 6, 20), P('home', 10, 2, 4), P('home', 11, 2, 20),
        P('away', 4, 20, 10), P('away', 5, 20, 14),
        A('dribble', 6.8, 4.6, 20, 8, { color: WHITE }), A('shot', 21, 9, 29, 12, { color: GOLD }),
        A('run', 6, 20, 18, 17, { color: SKY, dash: true }),
        T(16, 23, 'Wave 2 enters as wave 1 ends', { color: SKY, size: 1.5 }),
      ] }],
    },
    {
      id: 'k1_futsal_31_22', group: 'K1 · Arsenal Tuesdays', name: 'Futsal structure · 3-1 and 2-2',
      pitch: { type: 'futsal' }, time: '25 min', players: '10 + 2 GK', equipment: 'futsal court or 40 × 20 grid, 2 goals',
      desc: 'Five a side with a shape. In the 3-1 we have a fixo, two wide and a pivot to hold the ball; in the 2-2 we rotate in pairs. Small pitch, many touches, and the rotations that later become our final-third movement.',
      coaching: ['3-1: the pivot holds and lays it off, he does not run away from the ball', '2-2: when your partner goes forward, you cover — always one of the pair behind', 'Rotate on the diagonal, never straight past a team-mate', 'Two touches inside our half, free in theirs'],
      frames: [
        { caption: '3-1 · fixo, two wide, one pivot', objects: [
          GK('home', 2, 10), GK('away', 38, 10),
          P('home', 4, 10, 10), P('home', 7, 18, 4), P('home', 11, 18, 16), P('home', 9, 27, 10), B(10.8, 10),
          P('away', 4, 24, 6), P('away', 5, 24, 14), P('away', 6, 30, 10), P('away', 9, 20, 10),
          A('pass', 10.8, 10, 26, 10, { color: GOLD }), A('run', 18, 4, 26, 4, { color: SKY }),
        ] },
        { caption: '2-2 · pairs, one goes and one covers', objects: [
          GK('home', 2, 10), GK('away', 38, 10),
          P('home', 4, 11, 6), P('home', 5, 11, 14), P('home', 7, 24, 5), P('home', 9, 24, 15), B(11.8, 6),
          P('away', 4, 20, 6), P('away', 5, 20, 14), P('away', 7, 28, 6), P('away', 9, 28, 14),
          A('run', 11, 6, 20, 3, { color: SKY }), A('run', 11, 14, 14, 12, { color: WHITE }),
          T(20, 18.5, 'One goes, one covers — always', { color: GOLD, size: 1.5 }),
        ] },
      ],
    },

    /* ------------------------------------- Workshop Fridays · roles under pressure */
    {
      id: 'k1_role_fullback', group: 'K1 · Workshop Fridays', name: 'Full-back workshop · overlap or invert',
      pitch: { type: 'grid', L: 36, W: 26, gridStep: 4 }, time: '20 min', players: '8',
      equipment: 'cones, 2 mini goals, balls', desc: 'The full-back reads one picture and chooses one of two answers. Winger wide and marked means go inside and become the extra man in midfield. Winger inside means go outside and give the width. Same start, two answers, and the coach only changes where the winger stands.',
      coaching: ['Look at your winger before you look at the ball', 'Inverted: arrive in the half-space facing forward, not sideways', 'Overlapping: go early and go all the way, do not slow down at the line', 'Shout your choice so the pivot can cover the space you left'],
      frames: [
        { caption: 'Winger wide → the full-back inverts and becomes a midfielder.', objects: [
          ...cones([[2, 2], [34, 2], [2, 24], [34, 24]]),
          P('home', 6, 12, 13), B(12.8, 13), P('home', 7, 22, 24), P('home', 2, 10, 23), P('home', 9, 26, 13),
          P('away', 3, 20, 22), P('away', 6, 18, 14),
          A('run', 10, 23, 16, 17, { color: SKY }), A('pass', 12.8, 13, 15.6, 17, { color: GOLD, dash: true }),
          Z(16, 17, 8, 7, { color: SKY, opacity: .14, label: 'HALF-SPACE' }),
        ] },
        { caption: 'Winger inside → the full-back overlaps and gives the width.', objects: [
          ...cones([[2, 2], [34, 2], [2, 24], [34, 24]]),
          P('home', 6, 12, 13), B(12.8, 13), P('home', 7, 20, 17), P('home', 2, 12, 23), P('home', 9, 26, 13),
          P('away', 3, 22, 20), P('away', 6, 18, 14),
          A('run', 12, 23, 30, 24, { color: SKY }), A('pass', 12.8, 13, 19.6, 17, { color: GOLD }), A('pass', 20, 17, 29, 24, { color: GOLD, dash: true }),
        ] },
      ],
    },
    {
      id: 'k1_role_pivot', group: 'K1 · Workshop Fridays', name: 'Anchor workshop · turn, switch, protect',
      pitch: { type: 'grid', L: 30, W: 26, gridStep: 4 }, time: '20 min', players: '9',
      equipment: 'cones, 4 gates, balls', desc: 'The CDM receives with a man on his back and has three answers: turn out of it, switch it first time, or set it back and reposition. Two pressers, four gates to pass through, and a rule that he must scan before every reception.',
      coaching: ['Scan twice before it arrives — over the left shoulder and the right', 'If he is tight on your back, do not turn into him; set and go again', 'Feel the pressure, then take your first touch away from it', 'The switch is your best pass: one touch, far side, into the run'],
      frames: [{ caption: 'Anchor receives under pressure · four gates to find', objects: [
        E('cone', 28, 4, { color: YELLOW }), E('cone', 28, 10, { color: YELLOW }), E('cone', 28, 16, { color: YELLOW }), E('cone', 28, 22, { color: YELLOW }),
        E('cone', 2, 8, { color: ORANGE }), E('cone', 2, 18, { color: ORANGE }),
        P('home', 4, 5, 8), B(5.8, 8), P('home', 5, 5, 18), P('home', 6, 15, 13),
        P('away', 8, 17, 11), P('away', 10, 17, 16),
        P('home', 2, 26, 24), P('home', 3, 26, 2), P('home', 9, 24, 13),
        A('pass', 5.8, 8, 14.4, 12.6, { color: GOLD }), A('run', 15, 13, 18, 16, { color: WHITE }),
        A('pass', 15, 13, 25, 3, { color: GREEN, dash: true }), A('pass', 15, 13, 25, 23, { color: GREEN, dash: true }),
        T(15, 25, 'Scan · touch away from pressure · switch', { color: GOLD, size: 1.5 }),
      ] }],
    },

    /* ------------------------------------ Tactical Saturdays · system integration */
    {
      id: 'k1_zone_buildup', group: 'K1 · Tactical Saturdays', name: 'Zone build-up · GK, CB, anchor, full-back',
      pitch: { type: 'grid', L: 50, W: 40, gridStep: 5 }, time: '20 min', players: '11 + 2 GK',
      equipment: 'cones to mark three zones, 2 goals, bibs', desc: 'The pitch is cut into three zones. We may only enter the next zone by passing through a player in it, never by dribbling past a whole line. It forces the exact bridge our model asks for: goalkeeper to centre-back to anchor to full-back and out.',
      coaching: ['You may not skip a zone with a dribble — the pass must find a body', 'Anchor: show in the middle zone the moment a centre-back has the ball', 'Full-back holds the touchline in his zone until the ball arrives there', 'Nobody in the top zone drops to help — hold the line and stretch them'],
      frames: [{ caption: 'Three zones. Pass your way up, do not dribble through.', objects: [
        E('minigoal', 1, 20, { rot: 0 }), E('goal', 48, 20, { rot: 180 }),
        GK('home', 4, 20), B(4.8, 20),
        P('home', 4, 11, 26), P('home', 5, 11, 14), P('home', 2, 14, 37), P('home', 3, 14, 3),
        P('home', 6, 24, 24), P('home', 8, 24, 16), P('home', 10, 30, 30),
        P('home', 9, 40, 20), P('home', 7, 38, 34), P('home', 11, 38, 6),
        P('away', 9, 14, 20), P('away', 7, 18, 28), P('away', 11, 18, 12), P('away', 6, 28, 20),
        A('line', 17, 20, 17, 0, { color: WHITE, width: .2, dash: true }), A('line', 17, 40, 17, 20, { color: WHITE, width: .2, dash: true }),
        A('line', 34, 0, 34, 40, { color: WHITE, width: .2, dash: true }),
        A('pass', 4.8, 20, 10.6, 26, { color: GOLD }), A('pass', 11, 26, 23.6, 24, { color: GOLD }), A('pass', 24, 24, 37.6, 34, { color: GOLD, dash: true }),
        T(25, 39, 'GK → CB → anchor → full-back → out', { color: GOLD, size: 1.6 }),
      ] }],
    },
  ];

  /* =============================================== documented elite practices */
  const ELITE = [
    {
      id: 'dz_bait_press', group: 'Build-up · bait the press', name: 'Bait the press and play forward (De Zerbi)',
      pitch: { type: 'half' }, time: '25 min', players: '6 + 2 pressers + GK', equipment: 'zone cones, balls',
      desc: 'From De Zerbi’s own session. Goalkeeper, two centre-backs, two full-backs and one anchor against two pressers. The centre-back stops the ball under his sole and waits; the anchor is marked from behind and lays it off first time; the ball is recycled until the left centre-back receives under pressure, steps into the next zone and the escape is completed by a diagonal to the far centre-back, who carries over halfway.',
      coaching: ['Stop it with the sole, face forward — do not touch it sideways', 'Release the pass the moment his weight goes forward, not before and not after', 'The anchor does NOT drift wide to get free; he stays in the shadow and is found by the lay-off', 'Step into the next zone before you pass — the carry is what makes the pass available', 'Praise the brave attempt out loud, even when it is lost. This behaviour dies if you shout at a turnover.'],
      frames: [
        { caption: 'GK → left centre-back → anchor, who is marked from behind', objects: [
          E('cone', 17.5, 4, { color: YELLOW }), E('cone', 17.5, 64, { color: YELLOW }), E('cone', 35, 4, { color: ORANGE }), E('cone', 35, 64, { color: ORANGE }),
          GK('home', 4, 34), P('home', 4, 12, 44), P('home', 5, 12, 24), P('home', 2, 20, 62), P('home', 3, 20, 6), P('home', 6, 24, 34),
          P('away', 9, 16, 40), P('away', 10, 20, 28), B(12.8, 44),
          A('pass', 4.8, 34, 11.6, 43, { color: GOLD, dash: true }), A('pass', 12.8, 44, 23.4, 34.6, { color: GOLD }),
          A('run', 16, 40, 13.5, 43, { color: RED, dash: true }),
          T(30, 68, 'Zone 1 · sole on the ball · wait', { color: GOLD, size: 1.9 }),
        ] },
        { caption: 'Anchor lays it off first time — recycle across the back', moves: { ball: [12.6, 24], h5: [12, 24], a9: [13, 42], a10: [18, 32] },
          objects: [A('pass', 24, 34, 12.6, 25, { color: GOLD }), T(30, 68, 'One touch back. His marker is now facing the wrong way.', { color: GOLD, size: 1.9 })] },
        { caption: 'Left centre-back steps into zone 2 and the ball goes wide, then diagonal', moves: { h4: [22, 46], ball: [22.6, 46], h2: [26, 62], h5: [20, 24], a9: [20, 44], a10: [24, 34] },
          objects: [A('dribble', 12, 44, 22, 46, { color: WHITE }), A('pass', 22.6, 46, 25.6, 61, { color: GOLD }), A('pass', 26, 62, 40, 26, { color: GOLD, dash: true }), A('run', 20, 24, 40, 26, { color: SKY }), T(30, 68, 'Escape complete — carry over halfway', { color: GREEN, size: 1.9 })] },
      ],
    },
    {
      id: 'dz_rondo_6v2_rect', group: 'K1 · La Masia Mondays', name: 'Rectangle rondo 6v2 (Guardiola)',
      pitch: { type: 'grid', L: 15, W: 12, gridStep: 1 }, time: '12 min', players: '8 per grid', equipment: '4 cones, balls',
      desc: 'A deliberately tiny 4.5 × 9 m rectangle. Two players on each short side, one on each long side, two defenders inside. One touch. The two long-side players never stop moving — they are the ones who create the angle for the ends.',
      coaching: ['One touch. If you need two, the grid has beaten you', 'Side players work up and down constantly — standing still kills the angle', 'Open your body so you can see both ends before it arrives', 'Whoever loses it goes in'],
      frames: [{ caption: '6v2 · 4.5 × 9 m · one touch', objects: [
        ...cones([[3, 1.5], [12, 1.5], [3, 10.5], [12, 10.5]]),
        P('home', 2, 3, 3), P('home', 4, 3, 9), P('home', 6, 12, 3), P('home', 8, 12, 9), P('home', 7, 7.5, 1), P('home', 11, 7.5, 11),
        B(3.7, 3), P('away', 5, 6, 5), P('away', 3, 9, 7),
        A('pass', 3.7, 3, 7.2, 1.4, { color: GOLD }), A('pass', 7.8, 1.4, 11.4, 3, { color: GOLD, dash: true }),
        A('run', 7.5, 11, 10, 11, { color: SKY }),
      ] }],
    },
    {
      id: 'dz_rondo_5v2_cone', group: 'K1 · Foundation', name: 'Rondo 5v2 · hit the middle cone',
      pitch: { type: 'grid', L: 13, W: 13, gridStep: 1 }, time: '12 min', players: '7 per grid', equipment: '5 cones, balls',
      desc: 'The best youth rondo there is. A 9 × 9 m square with one cone in the middle. A set number of passes scores one point, but hitting the central cone scores two. It teaches young boys that the pass through the middle is worth more than the safe pass around the outside — which is the whole idea of our football.',
      coaching: ['Look for the cone BEFORE you receive, not after', 'The cone is the third man — it rewards playing through, not around', 'Defenders cannot cover the cone and the pass at the same time. Talk, and choose one.', 'Two touches at U9 and U11, one touch from U13'],
      frames: [{ caption: '5v2 · 9 × 9 m · cone in the middle is worth double', objects: [
        ...cones([[2, 2], [11, 2], [2, 11], [11, 11]]), E('cone', 6.5, 6.5, { color: GREEN }),
        P('home', 2, 2, 6.5), P('home', 4, 6.5, 2), P('home', 6, 11, 6.5), P('home', 8, 9, 11), P('home', 10, 4, 11),
        B(2.8, 6.5), P('away', 9, 5, 5), P('away', 7, 8, 8),
        A('pass', 2.8, 6.5, 6.2, 6.4, { color: GREEN }), A('pass', 2.8, 7, 6.2, 10.6, { color: GOLD, dash: true }),
        T(6.5, 12.4, 'Green = 2 points', { color: GREEN, size: 1.3 }),
      ] }],
    },
    {
      id: 'dz_flank_2v1_box', group: 'K1 · Arsenal Tuesdays', name: 'Flank 2v1 into a box 3v2',
      pitch: { type: 'half' }, time: '15 min', players: '14 + 2 GK', equipment: '1 goal, bibs, balls',
      desc: 'The goalkeeper plays a diagonal to a neutral on the flank. The attacking team puts two players on that side and must win the 2v1. The rule that makes it work: as soon as an attacker enters the box, the defending side players must release him, so the box becomes a guaranteed 3v2. Alternate the starting side.',
      coaching: ['Decide early: dribble, pass or shoot', 'Box arrivals: near post, penalty spot, back post — three men, three places', 'Deliver the cut-back, not the cross', 'Defenders: do not dive in and do not ball-watch', 'Set the rest defence the moment we commit two to the flank'],
      frames: [{ caption: 'Diagonal to the flank · 2v1 outside · 3v2 inside', objects: [
        GK('away', 51.5, 34), P('neutral', 1, 34, 64, { name: 'Flank' }),
        P('home', 2, 26, 60), P('home', 7, 34, 52), P('home', 9, 44, 40), P('home', 11, 44, 26), P('home', 10, 36, 34),
        P('away', 3, 38, 60), P('away', 4, 46, 36), P('away', 5, 46, 28),
        GK('home', 4, 34), B(4.8, 34),
        A('pass', 4.8, 34, 33, 63, { color: GOLD, dash: true }), A('run', 26, 60, 42, 64, { color: SKY }),
        Z(44, 34, 14, 22, { color: GREEN, opacity: .14, label: '3v2 IN THE BOX' }),
      ] }],
    },
    {
      id: 'dz_cutback_triangle', group: 'K1 · Arsenal Tuesdays', name: 'Cut-back · near post, spot, back post',
      pitch: { type: 'half' }, time: '20 min', players: '10 + GK', equipment: 'markers, balls',
      desc: 'The arrival pattern, drilled until nobody has to think. Forward attacks the near post, the far midfielder the penalty spot, the far wide player the back post, and one man waits on the edge for the second ball. All cut-backs are low and aimed at the second six-yard box, never across the face of goal.',
      coaching: ['Low. Every time. A lofted cut-back is a wasted attack', 'Target the band just beyond the six-yard box — the defenders running back cannot turn into it', 'Near post attacks first and early', 'Back post starts wide of the last defender and arrives late', 'One man on the edge, every single attack'],
      frames: [{ caption: 'Three runs, three places, one on the edge', objects: [
        GK('away', 51.5, 34), P('home', 2, 47, 62), B(47.6, 62),
        P('home', 9, 44, 40), P('home', 10, 40, 32), P('home', 11, 42, 22), P('home', 8, 34, 34),
        Z(48, 40, 6, 8, { color: GOLD, opacity: .18, label: 'NEAR' }), Z(46, 32, 6, 8, { color: SKY, opacity: .16, label: 'SPOT' }),
        Z(48, 24, 6, 8, { color: GOLD, opacity: .18, label: 'BACK' }), Z(38, 32, 8, 10, { color: GREEN, opacity: .14, label: 'EDGE' }),
        A('pass', 47.6, 62, 45, 38, { color: GOLD }),
        A('run', 44, 40, 48, 41, { color: WHITE }), A('run', 40, 32, 46, 33, { color: WHITE }), A('run', 42, 22, 48, 25, { color: WHITE }), A('run', 34, 34, 39, 33, { color: SKY }),
      ] }],
    },
    {
      id: 'dz_counterpress_zones', group: 'K1 · Workshop Fridays', name: 'Win it back where you lost it',
      pitch: { type: 'grid', L: 44, W: 32, gridStep: 4 }, time: '20 min', players: '12', equipment: 'cones for four rectangles, bibs',
      desc: 'The pitch is split into four rectangles. Normal game, one rule: if you lose the ball in a rectangle and win it back in that same rectangle, your next goal counts double. The rule does all the coaching — you never have to shout “press” again.',
      coaching: ['The nearest man goes immediately, he does not look for help', 'The next two cut the two easiest passes out of the rectangle', 'Stand near your team-mate AND near an opponent, ready for the loss', 'If we do not win it in the rectangle, we drop and organise — no chasing'],
      frames: [{ caption: 'Lose it here, win it here — the next goal counts double', objects: [
        A('line', 22, 0, 22, 32, { color: WHITE, width: .25, dash: true }), A('line', 0, 16, 44, 16, { color: WHITE, width: .25, dash: true }),
        E('minigoal', 1, 16, { rot: 0 }), E('minigoal', 43, 16, { rot: 180 }),
        P('home', 4, 9, 8), P('home', 6, 16, 20), P('home', 8, 26, 10), P('home', 9, 32, 22), P('home', 7, 18, 6), P('home', 10, 30, 26),
        P('away', 2, 13, 11), P('away', 5, 21, 17), P('away', 3, 28, 14), P('away', 8, 24, 24), P('away', 9, 34, 12), P('away', 11, 12, 22),
        B(16.8, 20),
        Z(11, 8, 22, 16, { color: RED, opacity: .14, label: 'LOST IT HERE' }),
      ] }],
    },
    {
      id: 'dz_gk_rondo', group: 'K1 · Tactical Saturdays', name: 'Goalkeeper rondo · five passes then switch',
      pitch: { type: 'grid', L: 40, W: 24, gridStep: 4 }, time: '15 min', players: '5 + 2 GK', equipment: 'balls',
      desc: 'A 5v2 rondo with the goalkeeper playing inside it. Complete five passes, then the goalkeeper hits the long pass to the other goalkeeper for a point. It trains the two things a modern keeper must own: creating a passing line for himself, and the long switch.',
      coaching: ['The goalkeeper must move to create a free line — he cannot stand and wait', 'When the ball reaches him, the outfielders create the next line for him', 'The back pass to the keeper should be SLOW when a long pass is coming — it buys him the picture', 'Change the two inside players every two minutes, the intensity is high'],
      frames: [{ caption: 'GK inside the rondo · five passes · long switch', objects: [
        GK('home', 8, 12), GK('home', 36, 12, {}),
        P('home', 4, 6, 4), P('home', 5, 6, 20), P('home', 6, 16, 4), P('home', 8, 16, 20),
        P('away', 9, 11, 9), P('away', 10, 12, 16), B(8.8, 12),
        A('pass', 8.8, 12, 15.4, 4.6, { color: GOLD }), C(8.8, 12, 22, 2, 35, 12, { color: GREEN }),
        T(20, 23, 'Five passes, then the long ball to the other keeper', { color: GREEN, size: 1.6 }),
      ] }],
    },
  ];

  if (K1.DRILLS) { K1_DRILLS.forEach(d => K1.DRILLS.push(d)); ELITE.forEach(d => K1.DRILLS.push(d)); }
})(window.K1 = window.K1 || {});
