/* K1 Shooters Tactics Board — set-piece playbook
 * Authored on a full pitch (105 × 68 m). The attacking goal is on the right (x = 105, centre y = 34).
 * Posts: y = 30.34 / 37.66 · penalty area x ≥ 88.5, y 13.84–54.16 · goal area x ≥ 99.5, y 24.84–43.16 · spot (94, 34).
 * Templates use stable keys (h9 = home #9, a1 = away GK, ball) so multi-frame templates animate correctly. */
(function (K1) {
  'use strict';

  // tiny authoring helpers → plain descriptor objects (turned into real objects by K1.Templates.instantiate)
  const P = (team, n, x, y, o) => Object.assign({ t: 'player', team, n, x, y, k: (team === 'home' ? 'h' : 'a') + n }, o || {});
  const GK = (team, x, y) => P(team, 1, x, y, { gk: true });
  const B = (x, y) => ({ t: 'ball', x, y, k: 'ball' });
  const A = (kind, x1, y1, x2, y2, o) => Object.assign({ t: 'path', kind, points: [[x1, y1], [x2, y2]] }, o || {});
  const C = (x1, y1, cx, cy, x2, y2, o) => Object.assign({ t: 'path', kind: 'curve', points: [[x1, y1], [x2, y2]], ctrl: [cx, cy] }, o || {});
  const T = (x, y, text, o) => Object.assign({ t: 'text', x, y, text, size: 2.2 }, o || {});
  const Z = (x, y, w, h, o) => Object.assign({ t: 'shape', kind: 'zone', x, y, w, h }, o || {});
  const OFF = x => ({ t: 'offside', x });
  const GOLD = '#f5b301', WHITE = '#ffffff', RED = '#ff5d5d', SKY = '#7dd3fc';

  const SETPIECES = [
    /* ------------------------------------------------------------ attacking corners */
    {
      id: 'ac_near_inswing', group: 'Attacking corners', name: 'Inswinger · near-post overload',
      desc: 'Taker curls the ball in toward the near post. The 9 attacks the near post first, the 5 arrives late at the far post, the 4 attacks the centre. The 11 offers a short option to move the defence.',
      frames: [
        { caption: 'Runs start as the taker strikes the ball', objects: [
          GK('home', 8, 34), P('home', 7, 106.2, 69.2), B(104.6, 67.4),
          P('home', 11, 99, 62), P('home', 9, 95, 44), P('home', 4, 93, 36), P('home', 5, 94, 28), P('home', 8, 88, 39), P('home', 6, 86, 30), P('home', 2, 62, 58), P('home', 3, 62, 10), P('home', 10, 90, 48),
          GK('away', 104, 34), P('away', 2, 104.3, 39.2), P('away', 4, 100.2, 30), P('away', 5, 100.2, 34), P('away', 6, 100.2, 38), P('away', 3, 99.8, 42.5), P('away', 8, 97, 36), P('away', 10, 97, 31), P('away', 7, 96, 58.5), P('away', 9, 86, 34), P('away', 11, 70, 30),
          C(104.6, 67.4, 98, 56, 100.8, 39.6, { color: GOLD }),
          A('run', 95, 44, 100.5, 39.5, { color: WHITE }), A('run', 93, 36, 99, 34, { color: WHITE }), A('run', 94, 28, 101, 30, { color: WHITE }), A('run', 88, 39, 95.5, 36.5, { color: WHITE }), A('run', 99, 62, 101.5, 64.5, { color: SKY }),
          T(76, 3.2, 'Near post: 9 first, 5 late at the back post', { color: WHITE }),
        ] },
        { caption: 'Ball arrives — 9 attacks it, 5 covers the far post', moves: { h9: [100.5, 39.5], h4: [99, 34], h5: [101, 30], h8: [95.5, 36.5], h11: [101.5, 64.5], h7: [104, 66], ball: [100.8, 39.6], a4: [100.6, 32], a5: [100.6, 35.5], a8: [98, 37] } },
      ],
    },
    {
      id: 'ac_far_outswing', group: 'Attacking corners', name: 'Outswinger · far-post attack',
      desc: 'Out-swinging delivery toward the far post. Decoy run to the near post drags the zonal markers; the 9 and 5 attack the far side with the 8 arriving for the second ball.',
      frames: [
        { caption: 'Decoy near, attack far', objects: [
          GK('home', 8, 34), P('home', 11, 106.2, -1.2), B(104.6, .6),
          P('home', 10, 100, 7), P('home', 4, 97, 26), P('home', 9, 95, 34), P('home', 5, 93, 40), P('home', 8, 90, 30), P('home', 6, 85, 38), P('home', 7, 92, 48), P('home', 2, 62, 58), P('home', 3, 62, 10),
          GK('away', 104, 34), P('away', 3, 104.3, 28.8), P('away', 4, 100.2, 30), P('away', 5, 100.2, 34), P('away', 6, 100.2, 38), P('away', 2, 99.8, 25.5), P('away', 8, 97, 32), P('away', 10, 97, 37), P('away', 7, 96.5, 9.5), P('away', 9, 86, 34), P('away', 11, 70, 38),
          C(104.6, .6, 93, 20, 98.5, 40, { color: GOLD }),
          A('run', 97, 26, 100.5, 30.5, { color: SKY }), A('run', 95, 34, 98.5, 40, { color: WHITE }), A('run', 93, 40, 99.5, 44.5, { color: WHITE }), A('run', 90, 30, 95, 36, { color: WHITE }),
          T(76, 64.8, 'Decoy 4 pulls the near-post zone · 9 & 5 attack the far post', { color: WHITE }),
        ] },
        { caption: 'Contact at the far post', moves: { h4: [100.5, 30.5], h9: [98.5, 40], h5: [99.5, 44.5], h8: [95, 36], h11: [104, 2], ball: [98.5, 40], a6: [100.8, 39.5], a10: [98, 38.5] } },
      ],
    },
    {
      id: 'ac_short', group: 'Attacking corners', name: 'Short corner · 2v1 and cross',
      desc: 'Two attackers combine short to pull a defender out, then the cross is delivered from a better angle with defenders facing the ball.',
      frames: [
        { caption: 'Play short, draw the defender', objects: [
          GK('home', 8, 34), P('home', 7, 106.2, 69.2), B(104.6, 67.4), P('home', 11, 100.5, 62.5),
          P('home', 9, 95, 42), P('home', 4, 93, 35), P('home', 5, 93, 28), P('home', 8, 89, 40), P('home', 6, 86, 31), P('home', 10, 92, 50), P('home', 2, 62, 58), P('home', 3, 62, 10),
          GK('away', 104, 34), P('away', 4, 100.2, 30), P('away', 5, 100.2, 34), P('away', 6, 100.2, 38), P('away', 3, 99.8, 42.5), P('away', 8, 97, 36), P('away', 10, 97, 31), P('away', 7, 97, 59), P('away', 2, 96, 46), P('away', 9, 86, 34), P('away', 11, 70, 30),
          A('pass', 104.6, 67.4, 101.2, 63.2, { color: GOLD }), A('run', 106.2, 69.2, 103, 63, { color: WHITE }),
          T(76, 3.2, 'Short: 11 receives, 7 follows for the return', { color: WHITE }),
        ] },
        { caption: 'Return pass, cross from a better angle', objects: [
          GK('home', 8, 34), P('home', 7, 103, 63), B(102.5, 62), P('home', 11, 100.5, 62.5),
          P('home', 9, 95, 42), P('home', 4, 93, 35), P('home', 5, 93, 28), P('home', 8, 89, 40), P('home', 6, 86, 31), P('home', 10, 92, 50), P('home', 2, 62, 58), P('home', 3, 62, 10),
          GK('away', 104, 34), P('away', 4, 100.2, 30), P('away', 5, 100.2, 34), P('away', 6, 100.2, 38), P('away', 3, 99.8, 42.5), P('away', 8, 97, 36), P('away', 10, 97, 31), P('away', 7, 101.5, 64.5), P('away', 2, 97.5, 50), P('away', 9, 86, 34), P('away', 11, 70, 30),
          C(102.5, 62, 96, 50, 99.5, 36, { color: GOLD }), A('run', 95, 42, 99.5, 36.5, { color: WHITE }), A('run', 93, 28, 100, 31, { color: WHITE }), A('run', 89, 40, 96, 38, { color: WHITE }),
        ] },
        { caption: 'Cross lands between the 6-yard line and the spot', moves: { h9: [99.5, 36.5], h5: [100, 31], h8: [96, 38], ball: [99.5, 36], a5: [99.5, 35], a6: [99.8, 38.5] } },
      ],
    },
    {
      id: 'ac_train', group: 'Attacking corners', name: 'Train · stacked runners',
      desc: 'Five attackers line up in a "train" at the edge of the box and peel off to different zones at the last moment so markers cannot pick up their runner.',
      frames: [
        { caption: 'Stack at the edge of the box', objects: [
          GK('home', 8, 34), P('home', 7, 106.2, 69.2), B(104.6, 67.4),
          P('home', 9, 90, 40), P('home', 4, 89, 42), P('home', 5, 88, 44), P('home', 8, 87, 46), P('home', 6, 86, 48), P('home', 10, 84, 32), P('home', 11, 100, 62), P('home', 2, 62, 58), P('home', 3, 62, 10),
          GK('away', 104, 34), P('away', 2, 104.3, 39.2), P('away', 4, 100.2, 30), P('away', 5, 100.2, 34), P('away', 6, 100.2, 38), P('away', 3, 99.8, 42.5), P('away', 8, 96, 40), P('away', 10, 95, 44), P('away', 7, 96, 58.5), P('away', 9, 86, 34), P('away', 11, 70, 30),
          C(104.6, 67.4, 97, 54, 99, 36, { color: GOLD }),
          A('run', 90, 40, 100.5, 40, { color: WHITE }), A('run', 89, 42, 99.5, 34.5, { color: WHITE }), A('run', 88, 44, 100, 29.5, { color: WHITE }), A('run', 87, 46, 96.5, 37, { color: WHITE }), A('run', 86, 48, 93.5, 41, { color: WHITE }),
          T(76, 3.2, 'Peel off on the taker’s signal: near · centre · far · spot · edge', { color: WHITE }),
        ] },
        { caption: 'Runners split to five zones', moves: { h9: [100.5, 40], h4: [99.5, 34.5], h5: [100, 29.5], h8: [96.5, 37], h6: [93.5, 41], h7: [104, 66], ball: [99, 36], a8: [98, 39], a10: [97, 41] } },
      ],
    },

    /* ------------------------------------------------------------ defending corners */
    {
      id: 'dc_zonal', group: 'Defending corners', name: 'Zonal · six-yard line',
      desc: 'Five defenders protect zones along the six-yard line, two guard the penalty spot, one on the short corner, two stay high as counter-attack outlets. Attack the ball inside your zone.',
      frames: [{ caption: 'Everyone owns a zone — attack the ball, not the man', objects: [
        GK('home', 104, 34), P('home', 4, 100.4, 28.5), P('home', 5, 100.4, 31.5), P('home', 6, 100.4, 34.5), P('home', 3, 100.4, 37.5), P('home', 2, 100.4, 40.5), P('home', 8, 96.5, 33), P('home', 10, 96.5, 38.5), P('home', 7, 96.5, 58.5), P('home', 9, 87, 36), P('home', 11, 74, 28),
        Z(100.4, 28.5, 3.4, 3, { color: GOLD, opacity: .18 }), Z(100.4, 31.5, 3.4, 3, { color: GOLD, opacity: .18 }), Z(100.4, 34.5, 3.4, 3, { color: GOLD, opacity: .18 }), Z(100.4, 37.5, 3.4, 3, { color: GOLD, opacity: .18 }), Z(100.4, 40.5, 3.4, 3, { color: GOLD, opacity: .18 }),
        Z(96.5, 35.75, 4.5, 8.5, { color: SKY, opacity: .14 }),
        P('away', 7, 106.2, 69.2), B(104.6, 67.4), P('away', 9, 95, 42), P('away', 4, 93, 36), P('away', 5, 94, 29), P('away', 8, 89, 38), P('away', 6, 86, 30), P('away', 11, 99, 62), P('away', 2, 60, 60), P('away', 3, 60, 10), P('away', 10, 90, 48),
        T(76, 3.2, 'Zonal: hold your zone until the ball is struck, then attack it', { color: WHITE }),
      ] }],
    },
    {
      id: 'dc_man', group: 'Defending corners', name: 'Man-marking · two on the posts',
      desc: 'A defender on each post, one on the short option, and every attacker in the box tracked goal-side and ball-side. Stay touching distance and watch the ball.',
      frames: [{ caption: 'Goal-side, ball-side, touching distance', objects: [
        GK('home', 104, 34), P('home', 2, 104.5, 39), P('home', 3, 104.5, 29), P('home', 7, 96.5, 58.5),
        P('away', 9, 95, 42), P('home', 4, 96.5, 41.5), P('away', 4, 93, 36), P('home', 5, 94.5, 35.5), P('away', 5, 94, 29), P('home', 6, 95.5, 29.5), P('away', 8, 89, 38), P('home', 8, 90.5, 37.5), P('away', 6, 86, 30), P('home', 10, 87.5, 30.5),
        P('home', 9, 84, 42), P('home', 11, 70, 30),
        P('away', 7, 106.2, 69.2), B(104.6, 67.4), P('away', 11, 99, 62), P('away', 2, 60, 60), P('away', 3, 60, 10), P('away', 10, 88, 50),
        A('line', 96.5, 41.5, 95, 42, { color: RED, width: .18 }), A('line', 94.5, 35.5, 93, 36, { color: RED, width: .18 }), A('line', 95.5, 29.5, 94, 29, { color: RED, width: .18 }), A('line', 90.5, 37.5, 89, 38, { color: RED, width: .18 }), A('line', 87.5, 30.5, 86, 30, { color: RED, width: .18 }),
        T(76, 3.2, 'Posts: 2 near · 3 far · 7 short · everyone else marks', { color: WHITE }),
      ] }],
    },
    {
      id: 'dc_hybrid', group: 'Defending corners', name: 'Hybrid · three zonal + man-markers',
      desc: 'Best headers protect the three central zones; the rest man-mark the dangerous runners. The 9 waits at the edge of the box as the outlet.',
      frames: [{ caption: 'Three zone, four mark, one short, two out', objects: [
        GK('home', 104, 34), P('home', 4, 100.4, 30.5), P('home', 5, 100.4, 34), P('home', 6, 100.4, 37.5), P('home', 7, 96.5, 58.5),
        Z(100.4, 34, 3.4, 10.5, { color: GOLD, opacity: .16 }),
        P('away', 9, 95, 42), P('home', 3, 96.5, 41.5), P('away', 4, 93, 36), P('home', 8, 94.5, 35.5), P('away', 5, 94, 29), P('home', 2, 95.5, 29.5), P('away', 8, 89, 38), P('home', 10, 90.5, 37.5),
        P('home', 9, 85, 40), P('home', 11, 72, 34),
        P('away', 7, 106.2, 69.2), B(104.6, 67.4), P('away', 11, 99, 62), P('away', 6, 86, 30), P('away', 2, 60, 60), P('away', 3, 60, 10), P('away', 10, 88, 50),
        T(76, 3.2, 'Zones: 4 · 5 · 6 — markers pick up the runners', { color: WHITE }),
      ] }],
    },

    /* ------------------------------------------------------------ free kicks */
    {
      id: 'fk_direct', group: 'Free kicks', name: 'Direct · over the wall',
      desc: 'Central free kick 22 m out. The wall of four stands 9.15 m from the ball covering the near post; the taker bends the ball over the wall toward the far corner. Three attackers wait for the rebound.',
      frames: [{ caption: 'Wall covers the near post — shoot far', objects: [
        GK('home', 8, 34), P('home', 10, 82.4, 41.6), B(84, 40), P('home', 8, 82.5, 37.5), P('home', 9, 96, 32), P('home', 5, 95, 36.5), P('home', 4, 94, 28.5), P('home', 7, 92, 46), P('home', 6, 76, 34), P('home', 2, 70, 60), P('home', 3, 70, 10), P('home', 11, 88, 52),
        GK('away', 103.6, 32.2), P('away', 4, 92.95, 37.65), P('away', 5, 93.05, 38.55), P('away', 6, 93.15, 39.45), P('away', 8, 93.25, 40.35), P('away', 2, 97.5, 30.5), P('away', 3, 97.5, 35.5), P('away', 7, 89.5, 44.5), P('away', 10, 95, 27), P('away', 9, 70, 34), P('away', 11, 80, 20),
        C(84, 40, 95, 37.5, 104.6, 31.2, { color: GOLD, width: .55 }), A('run', 82.5, 37.5, 88, 36, { color: SKY }),
        A('line', 84, 40, 93.1, 39, { color: RED, width: .14, dash: true }), T(88.5, 44, '9.15 m', { color: RED, size: 1.8, bg: false }),
        T(60, 64.8, 'Direct free kick: bend it over the wall into the far corner', { color: WHITE }),
      ] }],
    },
    {
      id: 'fk_wide', group: 'Free kicks', name: 'Wide · delivery vs. offside line',
      desc: 'Wide free kick delivered into the space between the defensive line and the goalkeeper. Runners time their movement to stay onside until the ball is struck.',
      frames: [
        { caption: 'Hold the line… go on contact', objects: [
          GK('home', 8, 34), P('home', 10, 83.5, 8.6), B(85, 10), P('home', 9, 92, 30), P('home', 5, 91, 36), P('home', 4, 90, 26), P('home', 8, 88, 40), P('home', 7, 90, 19), P('home', 6, 80, 32), P('home', 2, 72, 52), P('home', 3, 70, 20), P('home', 11, 86, 50),
          GK('away', 104, 34), P('away', 2, 93, 24), P('away', 4, 93, 30), P('away', 5, 93, 36), P('away', 3, 93, 42), P('away', 6, 86.6, 12.8), P('away', 8, 94, 20), P('away', 10, 90, 34), P('away', 7, 84, 47), P('away', 9, 66, 34), P('away', 11, 60, 45),
          OFF(93),
          C(85, 10, 95, 18, 100, 33, { color: GOLD }), A('run', 92, 30, 100, 32.5, { color: WHITE }), A('run', 91, 36, 101, 38, { color: WHITE }), A('run', 90, 26, 98.5, 28.5, { color: WHITE }), A('run', 88, 40, 95.5, 38, { color: WHITE }),
          T(60, 64.8, 'Stay level with the offside line until the kick is taken', { color: WHITE }),
        ] },
        { caption: 'Ball lands behind the line', moves: { h9: [100, 32.5], h5: [101, 38], h4: [98.5, 28.5], h8: [95.5, 38], ball: [100, 33], a2: [96, 26], a4: [97, 31], a5: [98, 37], a3: [97, 42] } },
      ],
    },
    {
      id: 'fk_defend_wall', group: 'Free kicks', name: 'Defending · wall + line + blocker',
      desc: 'Wall of four covers the near post, a lying blocker prevents the ball under the wall, the rest hold a line level with the wall so nobody can run in behind.',
      frames: [{ caption: 'Wall, blocker and one line', objects: [
        GK('home', 103.6, 31.8), P('home', 4, 92.95, 37.65), P('home', 5, 93.05, 38.55), P('home', 6, 93.15, 39.45), P('home', 8, 93.25, 40.35), P('home', 7, 92.8, 42.2), P('home', 2, 93.5, 24), P('home', 3, 93.5, 30), P('home', 10, 93.5, 46), P('home', 11, 89.5, 44.5), P('home', 9, 72, 34),
        Z(93.5, 34, 1.4, 26, { color: GOLD, opacity: .14 }),
        P('away', 10, 82.4, 41.6), B(84, 40), P('away', 8, 82.5, 37.5), P('away', 9, 91.5, 32), P('away', 5, 91.5, 36.5), P('away', 4, 91, 28.5), P('away', 7, 91, 47), P('away', 6, 76, 34), P('away', 2, 70, 60), P('away', 3, 70, 10), P('away', 11, 88, 52),
        T(60, 64.8, 'Wall covers the near post · keeper takes the far post · line level with the wall', { color: WHITE }),
      ] }],
    },

    /* ------------------------------------------------------------ throw-ins, kick-off, goal kicks, penalties */
    {
      id: 'ti_attack', group: 'Throw-ins', name: 'Attacking throw · down the line & back',
      desc: 'The winger runs down the line, the striker comes short to receive and lays the ball back to the thrower who has stepped in. A third runner attacks the space behind.',
      frames: [
        { caption: 'Three options: line, short, behind', objects: [
          GK('home', 8, 34), P('home', 2, 85, 69.3), B(85, 68.6), P('home', 7, 89, 63.5), P('home', 9, 88, 59), P('home', 8, 80, 62), P('home', 10, 84, 52), P('home', 11, 82, 20), P('home', 6, 72, 42), P('home', 4, 60, 44), P('home', 5, 58, 26), P('home', 3, 66, 12),
          GK('away', 104, 34), P('away', 3, 90.5, 65), P('away', 6, 87.5, 60.5), P('away', 8, 80, 58.5), P('away', 2, 95, 45), P('away', 4, 92, 36), P('away', 5, 90, 26), P('away', 10, 76, 50), P('away', 7, 78, 30), P('away', 11, 84, 14), P('away', 9, 60, 36),
          A('run', 89, 63.5, 97, 66, { color: WHITE }), A('run', 88, 59, 86, 64.5, { color: WHITE }), A('pass', 85, 68.6, 86.5, 64.5, { color: GOLD }), A('run', 80, 62, 84, 66, { color: SKY }), A('run', 84, 52, 93, 56, { color: WHITE }),
          T(60, 3.2, 'Throw short to the 9, lay-off to the 2 stepping in, release the 10 in behind', { color: WHITE }),
        ] },
        { caption: '9 lays it back, 2 plays the 10 into the space', objects: [
          GK('home', 8, 34), P('home', 2, 85.5, 65.5), B(86, 64.5), P('home', 7, 97, 66), P('home', 9, 86, 64), P('home', 8, 82, 66), P('home', 10, 90, 55), P('home', 11, 82, 20), P('home', 6, 72, 42), P('home', 4, 60, 44), P('home', 5, 58, 26), P('home', 3, 66, 12),
          GK('away', 104, 34), P('away', 3, 95, 66.5), P('away', 6, 87, 62), P('away', 8, 81, 63), P('away', 2, 95, 45), P('away', 4, 92, 36), P('away', 5, 90, 26), P('away', 10, 78, 50), P('away', 7, 78, 30), P('away', 11, 84, 14), P('away', 9, 60, 36),
          A('pass', 86, 64.5, 85.5, 65.5, { color: GOLD, width: .3 }), A('pass', 85.5, 65.5, 94, 57, { color: GOLD }), A('run', 90, 55, 94, 57, { color: WHITE }),
        ] },
      ],
    },
    {
      id: 'ko_switch', group: 'Kick-off', name: 'Kick-off · back and switch',
      desc: 'Simple, safe kick-off: tap to the 10, lay back to the 6, switch to the far-side full-back while the winger stretches the pitch.',
      frames: [
        { caption: 'Tap · lay back · switch', objects: [
          GK('home', 6, 34), P('home', 2, 30, 60), P('home', 4, 26, 44), P('home', 5, 26, 24), P('home', 3, 30, 8), P('home', 6, 40, 34), P('home', 8, 48, 46), P('home', 10, 49, 36.5), P('home', 7, 50, 64), P('home', 9, 51.5, 33), P('home', 11, 50, 5),
          B(52.5, 34),
          GK('away', 99, 34), P('away', 2, 78, 10), P('away', 4, 82, 26), P('away', 5, 82, 42), P('away', 3, 78, 58), P('away', 7, 62, 12), P('away', 8, 66, 28), P('away', 6, 66, 40), P('away', 11, 62, 56), P('away', 9, 56, 30), P('away', 10, 56, 40),
          A('pass', 52.5, 34, 49, 36.5, { color: GOLD, width: .3 }), A('pass', 49, 36.5, 40.5, 34, { color: GOLD, width: .3 }), C(40, 34, 45, 10, 52, 6, { color: GOLD }), A('run', 50, 5, 58, 5, { color: WHITE }),
        ] },
        { caption: 'Winger receives high and wide', moves: { h10: [46, 38], h11: [58, 5], h6: [40, 33], ball: [56, 5.5], a2: [72, 10], a7: [60, 10] } },
      ],
    },
    {
      id: 'gk_short', group: 'Goal kicks', name: 'Goal kick · short build-up (3 + 1)',
      desc: 'Centre-backs split inside the box, the 6 drops to make a triangle, full-backs go high and wide. Play through the press with a third-man pass.',
      frames: [
        { caption: 'Split the centre-backs, make the triangle', objects: [
          GK('home', 3, 30), B(5, 30), P('home', 4, 10, 17), P('home', 5, 10, 51), P('home', 6, 22, 34), P('home', 2, 28, 62), P('home', 3, 28, 6), P('home', 8, 34, 46), P('home', 10, 34, 22), P('home', 7, 48, 60), P('home', 9, 46, 34), P('home', 11, 48, 8),
          GK('away', 100, 34), P('away', 9, 18, 34), P('away', 7, 20, 20), P('away', 11, 20, 48), P('away', 10, 30, 34), P('away', 8, 36, 46), P('away', 6, 36, 23), P('away', 2, 42, 62), P('away', 3, 42, 6), P('away', 4, 52, 28), P('away', 5, 52, 40),
          A('pass', 5, 30, 10, 17.5, { color: GOLD }), A('run', 22, 34, 20, 26, { color: WHITE }), T(60, 65.5, 'Third man: 1 → 4 → 6 (dropping) → 10', { color: WHITE }),
        ] },
        { caption: '4 finds the 6, 6 releases the 10 between the lines', objects: [
          GK('home', 3, 30), B(10, 17.5), P('home', 4, 10.5, 17.5), P('home', 5, 12, 51), P('home', 6, 20, 26), P('home', 2, 30, 62), P('home', 3, 34, 6), P('home', 8, 34, 46), P('home', 10, 33, 20), P('home', 7, 50, 60), P('home', 9, 46, 34), P('home', 11, 50, 8),
          GK('away', 100, 34), P('away', 9, 14, 30), P('away', 7, 17, 19), P('away', 11, 22, 46), P('away', 10, 27, 30), P('away', 8, 36, 46), P('away', 6, 32, 23), P('away', 2, 42, 62), P('away', 3, 42, 6), P('away', 4, 52, 28), P('away', 5, 52, 40),
          A('pass', 10.5, 17.5, 19.5, 25.5, { color: GOLD }), A('pass', 20, 26, 32, 20.5, { color: GOLD }), A('run', 33, 20, 40, 18, { color: WHITE }),
        ] },
        { caption: 'Press broken — 10 turns and drives', moves: { h6: [21, 27], h10: [40, 18], ball: [40.5, 18.5], h3: [42, 6], h11: [58, 8], a10: [30, 26], a6: [36, 21] } },
      ],
    },
    {
      id: 'gk_long', group: 'Goal kicks', name: 'Goal kick · long to the 9, second ball',
      desc: 'Against an aggressive press, go long to the striker with two runners beyond and the midfield compact under the ball to win the second ball.',
      frames: [{ caption: 'Long to the 9 — midfield under the ball', objects: [
        GK('home', 3, 34), B(5, 34), P('home', 4, 20, 26), P('home', 5, 20, 42), P('home', 2, 36, 62), P('home', 3, 36, 6), P('home', 6, 40, 34), P('home', 8, 50, 44), P('home', 10, 50, 26), P('home', 9, 62, 34), P('home', 7, 58, 56), P('home', 11, 58, 12),
        GK('away', 100, 34), P('away', 9, 16, 34), P('away', 7, 22, 22), P('away', 11, 22, 46), P('away', 10, 34, 34), P('away', 8, 44, 44), P('away', 6, 44, 24), P('away', 2, 56, 60), P('away', 3, 56, 8), P('away', 4, 62, 28), P('away', 5, 62, 40),
        C(5, 34, 35, 10, 62, 33, { color: GOLD }), A('run', 58, 56, 74, 50, { color: WHITE }), A('run', 58, 12, 74, 18, { color: WHITE }), A('run', 50, 44, 60, 40, { color: SKY }), A('run', 50, 26, 60, 28, { color: SKY }),
        Z(56, 34, 16, 22, { color: SKY, opacity: .12 }), T(30, 66.3, 'Second-ball zone: 8 and 10 arrive as the ball drops', { color: WHITE }),
      ] }],
    },
    {
      id: 'pk', group: 'Penalties', name: 'Penalty · takers order & rebounds',
      desc: 'Penalty setup with the taker’s run-up, the keeper on the line, and the rebound players positioned outside the area ready to react.',
      frames: [{ caption: 'Takers: 9 · 10 · 7 · 11 · 8', objects: [
        GK('home', 8, 34), P('home', 9, 90.5, 36.5), B(94, 34), P('home', 10, 87.5, 30), P('home', 7, 87.5, 38.5), P('home', 11, 86, 22), P('home', 8, 86, 46), P('home', 6, 78, 34), P('home', 2, 70, 58), P('home', 4, 62, 40), P('home', 5, 62, 28), P('home', 3, 70, 10),
        GK('away', 104.6, 34), P('away', 4, 87.5, 26), P('away', 5, 87.5, 42), P('away', 2, 88, 50), P('away', 3, 88, 18), P('away', 6, 84, 34), P('away', 8, 80, 44), P('away', 10, 80, 24), P('away', 9, 66, 34), P('away', 7, 60, 50), P('away', 11, 60, 18),
        A('run', 90.5, 36.5, 93.2, 34.4, { color: WHITE }), A('shot', 94, 34, 104.6, 31.4, { color: GOLD }),
        T(60, 64.8, 'Order: 9 · 10 · 7 · 11 · 8 — keeper: watch the standing foot', { color: WHITE }),
      ] }],
    },
  ];

  K1.SETPIECES = SETPIECES;
  K1.setPieceGroups = function () {
    const groups = [];
    SETPIECES.forEach(sp => { let g = groups.find(x => x.name === sp.group); if (!g) { g = { name: sp.group, items: [] }; groups.push(g); } g.items.push(sp); });
    return groups;
  };
})(window.K1 = window.K1 || {});
