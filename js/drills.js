/* K1 Shooters Tactics Board — training drill library (grids, rondos, small-sided games, patterns) */
(function (K1) {
  'use strict';

  const P = (team, n, x, y, o) => Object.assign({ t: 'player', team, n, x, y, k: (team === 'home' ? 'h' : team === 'away' ? 'a' : 'n') + n }, o || {});
  const GK = (team, x, y) => P(team, 1, x, y, { gk: true });
  const B = (x, y) => ({ t: 'ball', x, y, k: 'ball' });
  const E = (kind, x, y, o) => Object.assign({ t: 'equip', kind, x, y }, o || {});
  const A = (kind, x1, y1, x2, y2, o) => Object.assign({ t: 'path', kind, points: [[x1, y1], [x2, y2]] }, o || {});
  const C = (x1, y1, cx, cy, x2, y2, o) => Object.assign({ t: 'path', kind: 'curve', points: [[x1, y1], [x2, y2]], ctrl: [cx, cy] }, o || {});
  const T = (x, y, text, o) => Object.assign({ t: 'text', x, y, text, size: 1.8 }, o || {});
  const Z = (x, y, w, h, o) => Object.assign({ t: 'shape', kind: 'zone', x, y, w, h }, o || {});
  const GOLD = '#f5b301', WHITE = '#ffffff', SKY = '#7dd3fc', ORANGE = '#f97316', YELLOW = '#facc15';

  const cones = (pts, color) => pts.map(p => E('cone', p[0], p[1], { color: color || ORANGE }));
  const square = (x, y, s, color) => cones([[x, y], [x + s, y], [x, y + s], [x + s, y + s]], color);

  const DRILLS = [
    {
      id: 'rondo_4v2', group: 'Rondos & possession', name: 'Rondo 4v2', pitch: { type: 'grid', L: 20, W: 16, gridStep: 2 },
      time: '12 min', players: '6 + 1 coach', equipment: '4 cones, 3 balls',
      desc: 'Four on the outside of a 8×8 m square keep the ball from two inside. One or two touches. The defender who wins the ball swaps with the player who lost it.',
      coaching: ['Receive on the back foot, open body', 'Pass to the far foot; split the defenders when the lane opens', 'Move immediately after the pass'],
      frames: [{ caption: '4v2 · 8 × 8 m · 1–2 touch', objects: [
        ...square(6, 4, 8), P('home', 4, 6, 8), P('home', 6, 10, 4), P('home', 8, 14, 8), P('home', 10, 10, 12), B(6.8, 8), P('away', 2, 9, 7), P('away', 3, 11, 9),
        A('pass', 6.8, 8, 9.6, 4.6, { color: GOLD }), A('pass', 10.6, 4.4, 13.6, 7.6, { color: GOLD, dash: true }), T(10, 15, 'Win it → swap with the player who lost it', { color: WHITE }),
      ] }],
    },
    {
      id: 'rondo_5v2_transition', group: 'Rondos & possession', name: 'Double rondo · 5v2 → transfer', pitch: { type: 'grid', L: 34, W: 16, gridStep: 2 },
      time: '15 min', players: '14', equipment: '8 cones, balls',
      desc: 'Two 10×10 squares. Five keep the ball against two pressers; after eight passes (or on a coach’s call) the ball is transferred to the other square and two new pressers sprint across.',
      coaching: ['Recognise the moment to switch — head up before the eighth pass', 'Pressers: press together, cut the passing lane, don’t chase the ball'],
      frames: [{ caption: 'Keep 8 passes, then transfer', objects: [
        ...square(2, 3, 10), ...square(22, 3, 10),
        P('home', 2, 2, 8), P('home', 3, 7, 3), P('home', 4, 12, 8), P('home', 5, 7, 13), P('home', 6, 7, 8), B(2.8, 8), P('away', 9, 5.5, 6.5), P('away', 10, 8.5, 9.5),
        P('home', 7, 22, 8), P('home', 8, 27, 3), P('home', 9, 32, 8), P('home', 10, 27, 13), P('home', 11, 27, 8), P('away', 7, 17, 5), P('away', 8, 17, 11),
        C(12.5, 8, 17, 2, 21.5, 8, { color: GOLD }), A('run', 17, 5, 25.5, 6.5, { color: SKY }), A('run', 17, 11, 28.5, 9.5, { color: SKY }),
      ] }],
    },
    {
      id: 'positional_4v4_3', group: 'Rondos & possession', name: 'Positional game 4v4 + 3', pitch: { type: 'grid', L: 30, W: 22, gridStep: 2 },
      time: '18 min', players: '11', equipment: '4 cones, bibs (3 colours), balls',
      desc: 'Barcelona-style juego de posición: 4v4 inside with three neutrals (two on the outside lines, one inside). Score by completing 10 passes or by switching the ball from one outside neutral to the other.',
      coaching: ['Create triangles: always two options for the player on the ball', 'Third-man runs: pass, move, receive', 'Neutrals: one touch — keep the ball moving'],
      frames: [{ caption: '4v4 + 3 neutrals · 30 × 22 m', objects: [
        ...square(3, 3, 24).slice(0, 2), E('cone', 3, 19, { color: ORANGE }), E('cone', 27, 19, { color: ORANGE }),
        P('home', 4, 8, 7), P('home', 6, 12, 15), P('home', 8, 18, 8), P('home', 10, 22, 16), B(8.8, 7.4),
        P('away', 2, 10, 11), P('away', 3, 15, 6), P('away', 5, 16, 14), P('away', 8, 21, 10),
        P('neutral', 1, 15, 2.2), P('neutral', 2, 15, 19.8), P('neutral', 3, 15, 11),
        A('pass', 8.8, 7.4, 14.6, 10.6, { color: GOLD }), A('pass', 15.4, 11.4, 17.6, 8.4, { color: GOLD, dash: true }), A('run', 22, 16, 24, 10, { color: WHITE }),
        T(15, 24.6, 'Score: 10 passes or switch neutral → neutral', { color: WHITE, size: 1.6 }),
      ] }],
    },
    {
      id: 'y_passing', group: 'Passing patterns', name: 'Y-passing pattern with third man', pitch: { type: 'grid', L: 30, W: 20, gridStep: 2 },
      time: '12 min', players: '8+', equipment: '4 cones, 4 balls',
      desc: 'Classic Y-drill. A plays to B, B sets to C, C plays the third-man ball to D who has checked away and come back. Rotate one position after each rep; switch sides after 6 minutes.',
      coaching: ['Weight of pass: firm to the near foot for a set, into space for the third-man ball', 'Check away before you receive', 'Communicate: call the name of the player you set to'],
      frames: [
        { caption: 'A → B → C → D (third man)', objects: [
          E('cone', 4, 10, { color: ORANGE }), E('cone', 14, 10, { color: ORANGE }), E('cone', 24, 4, { color: YELLOW }), E('cone', 24, 16, { color: YELLOW }),
          P('home', 2, 4, 11.5), B(4.6, 10.6), P('home', 6, 14, 11.5), P('home', 8, 24, 5.5), P('home', 10, 24, 17.5), P('home', 3, 2, 12.5), P('home', 5, 1, 14.5),
          A('pass', 4.6, 10.6, 13.2, 10.2, { color: GOLD }), A('pass', 14, 9, 22.8, 5, { color: GOLD }), A('pass', 24, 6.5, 24, 15, { color: GOLD, dash: true }), A('run', 24, 17.5, 20, 12, { color: WHITE }),
          T(15, 23.2, 'A → B (set) → C → third-man ball to D', { color: WHITE, size: 1.6 }),
        ] },
        { caption: 'D receives on the move', moves: { h10: [20, 12], ball: [20.5, 11.5], h6: [16, 11.5] } },
      ],
    },
    {
      id: 'overlap_pattern', group: 'Passing patterns', name: 'Winger–full-back overlap & cross', pitch: { type: 'half' },
      time: '15 min', players: '10', equipment: 'balls, 1 goal, 2 mannequins',
      desc: 'Pattern play in the final third: the 8 feeds the 7, the 2 overlaps, the 7 plays down the line, the 2 crosses for three runners (near post, far post, cut-back).',
      coaching: ['Overlap must be timed — start the run as the pass to the winger travels', 'Winger: take a touch inside to draw the defender, then release', 'Three runs: near, far, cut-back — never the same zone'],
      frames: [
        { caption: '8 → 7, 2 overlaps', objects: [
          GK('away', 51.5, 34), E('mannequin', 38, 60), E('mannequin', 44, 40),
          P('home', 8, 22, 46), B(22.8, 46.6), P('home', 7, 32, 62), P('home', 2, 22, 64), P('home', 9, 30, 36), P('home', 10, 26, 30), P('home', 11, 30, 14), P('home', 6, 14, 40),
          A('pass', 22.8, 46.6, 31.2, 61, { color: GOLD }), A('run', 22, 64, 40, 66, { color: WHITE }), A('dribble', 32, 62, 36, 58, { color: SKY }),
        ] },
        { caption: '7 releases 2 down the line', objects: [
          GK('away', 51.5, 34), E('mannequin', 38, 60), E('mannequin', 44, 40),
          P('home', 8, 26, 46), P('home', 7, 36, 58), B(36.6, 58.6), P('home', 2, 40, 66), P('home', 9, 34, 36), P('home', 10, 30, 32), P('home', 11, 34, 16), P('home', 6, 16, 40),
          A('pass', 36.6, 58.6, 46, 65, { color: GOLD }), A('run', 40, 66, 47, 65, { color: WHITE }), A('run', 34, 36, 46, 38.5, { color: WHITE }), A('run', 34, 16, 46, 30, { color: WHITE }), A('run', 30, 32, 40, 36, { color: WHITE }),
        ] },
        { caption: 'Cross: near · far · cut-back', objects: [
          GK('away', 51.5, 34), E('mannequin', 38, 60), E('mannequin', 44, 40),
          P('home', 8, 30, 46), P('home', 7, 40, 56), P('home', 2, 47, 65), B(47.4, 64.6), P('home', 9, 46, 38.5), P('home', 10, 40, 36), P('home', 11, 46, 30), P('home', 6, 18, 40),
          C(47.4, 64.6, 50, 50, 47, 39, { color: GOLD }), T(26, 6, 'Near post 9 · far post 11 · cut-back 10', { color: WHITE }),
        ] },
      ],
    },
    {
      id: 'one_v_one', group: 'Finishing & 1v1', name: '1v1 to goal from a pass', pitch: { type: 'grid', L: 30, W: 22, gridStep: 2 },
      time: '12 min', players: '8 + GK', equipment: '1 goal (or 2 mini goals), 4 cones, balls',
      desc: 'Server passes to the attacker; the defender can only press once the attacker touches the ball. Attacker has 6 seconds to score. Defender who wins it dribbles through the far gate for a point.',
      coaching: ['First touch out of your feet, into space, at speed', 'Change of pace beats change of direction', 'Defender: curve your run, show the attacker one side'],
      frames: [{ caption: 'Serve · attack · 6 seconds to score', objects: [
        E('goal', 28.8, 11, { rot: 180 }), GK('away', 27.2, 11), E('cone', 6, 3, { color: YELLOW }), E('cone', 6, 19, { color: YELLOW }), E('cone', 2, 9, { color: ORANGE }), E('cone', 2, 13, { color: ORANGE }),
        P('home', 9, 12, 11), P('away', 4, 20, 11), P('home', 7, 4, 2), B(4.6, 2.8), P('home', 10, 4, 20), P('home', 11, 2, 4), P('away', 5, 2, 18),
        A('pass', 4.6, 2.8, 11.4, 10.4, { color: GOLD }), A('dribble', 12, 11, 22, 8, { color: WHITE }), A('shot', 22, 8, 28, 10, { color: GOLD }), T(15, 24.6, 'Defender wins it → dribble through the gate', { color: WHITE, size: 1.6 }),
      ] }],
    },
    {
      id: 'finishing_circuit', group: 'Finishing & 1v1', name: 'Finishing circuit · three stations', pitch: { type: 'half' },
      time: '20 min', players: '12 + 2 GK', equipment: '2 goals, 4 mannequins, 6 cones, balls',
      desc: 'Three finishing stations rotating every 5 minutes: (1) wall-pass and shoot, (2) cross and finish first time, (3) turn on the mannequin and strike from the edge of the box.',
      coaching: ['Shots low and across the keeper', 'Finish first time from crosses — get across the defender', 'Body shape: open up before the ball arrives'],
      frames: [{ caption: 'Station 1 wall pass · 2 cross · 3 turn & shoot', objects: [
        GK('away', 51.5, 34), E('mannequin', 40, 30), E('mannequin', 36, 22), E('mannequin', 40, 46), E('mannequin', 30, 40),
        P('home', 9, 24, 30), B(24.6, 30.4), P('home', 10, 34, 26), A('pass', 24.6, 30.4, 33.2, 26.4, { color: GOLD }), A('pass', 34.6, 26.6, 40, 32, { color: GOLD }), A('run', 24, 30, 40, 33, { color: WHITE }), A('shot', 41, 33, 51, 31, { color: GOLD }),
        P('home', 7, 36, 64), B(36.6, 63.6), P('home', 11, 30, 44), C(36.6, 63.6, 46, 56, 47, 40, { color: GOLD }), A('run', 30, 44, 46, 40, { color: WHITE }),
        P('home', 8, 14, 20), B(14.6, 20.4), P('home', 6, 20, 12), A('pass', 14.6, 20.4, 29.4, 39.4, { color: GOLD }), A('run', 20, 12, 30, 38, { color: WHITE }), A('shot', 31, 41, 50.5, 36.5, { color: GOLD }),
        T(26, 3.2, '① wall pass & shoot  ② cross & finish  ③ turn & strike', { color: WHITE }),
      ] }],
    },
    {
      id: 'ssg_3v3_gk', group: 'Small-sided games', name: '3v3 + GKs · 30 × 20 m', pitch: { type: 'grid', L: 30, W: 20, gridStep: 5 },
      time: '4 × 4 min', players: '6 + 2 GK per pitch', equipment: '2 mini goals or portable goals, cones, bibs',
      desc: 'Fast, high-repetition game. Rotate teams every four minutes. Condition options: two-touch, must score from a first-time finish, or a goal counts double after a switch of play.',
      coaching: ['Support angles — never in a straight line with the ball', 'After losing the ball: nearest player presses, others recover behind', 'Play forward when the picture is on'],
      frames: [{ caption: '3v3 + GKs · rotate every 4 min', objects: [
        E('minigoal', 0.6, 10, { rot: 0 }), E('minigoal', 29.4, 10, { rot: 180 }), GK('home', 2.2, 10), GK('away', 27.8, 10),
        P('home', 4, 9, 6), P('home', 8, 11, 14), P('home', 9, 17, 9), B(9.6, 6.6), P('away', 3, 20, 6), P('away', 5, 14, 11), P('away', 9, 21, 14),
        A('pass', 9.6, 6.6, 16.2, 8.6, { color: GOLD }), A('run', 11, 14, 18, 15, { color: WHITE }),
        E('cone', 0, 0, { color: ORANGE }), E('cone', 30, 0, { color: ORANGE }), E('cone', 0, 20, { color: ORANGE }), E('cone', 30, 20, { color: ORANGE }),
      ] }],
    },
    {
      id: 'transition_4v4_2', group: 'Small-sided games', name: 'Transition game 4v4 + 2 outlets', pitch: { type: 'grid', L: 40, W: 30, gridStep: 5 },
      time: '3 × 6 min', players: '10 + 2 GK', equipment: '2 goals, cones, bibs',
      desc: 'Two teams of four plus two outlet players on the end lines. Win the ball → play to an outlet within 3 passes → attack the goal. Rewards fast transitions in both directions.',
      coaching: ['The moment we win it: first look forward', 'Counter-press within 5 seconds of losing it', 'Outlets: receive facing forward'],
      frames: [{ caption: 'Win it → outlet → attack', objects: [
        E('goal', 1.2, 15, { rot: 0 }), E('goal', 38.8, 15, { rot: 180 }), GK('home', 3, 15), GK('away', 37, 15),
        P('home', 4, 12, 9), P('home', 6, 15, 20), P('home', 8, 22, 12), P('home', 10, 24, 22), P('away', 3, 17, 14), B(17.6, 14.6), P('away', 5, 26, 10), P('away', 8, 20, 24), P('away', 10, 30, 18),
        P('neutral', 1, 8, 29.2), P('neutral', 2, 32, 0.8),
        A('run', 22, 12, 18.5, 13.5, { color: WHITE }), A('pass', 17.6, 14.6, 31.5, 1.6, { color: GOLD, dash: true }), A('run', 24, 22, 32, 16, { color: SKY }),
        T(20, 33, 'Outlet within 3 passes, then go to goal', { color: WHITE, size: 1.7 }),
      ] }],
    },
    {
      id: 'press_trap_433', group: 'Pressing & defending', name: 'Pressing trap · force it wide', pitch: { type: 'full' },
      time: '20 min', players: '11v11 or 9v9', equipment: 'full pitch, bibs',
      desc: 'From a 4-3-3 the front three angle their press to force the centre-back to play to the full-back. The winger, 8 and full-back then jump together to trap the ball on the touchline.',
      coaching: ['Press with a curved run to close the inside pass', 'Trigger: a pass to the full-back = everyone jumps', 'Far side tucks in — the ball can’t travel that far quickly'],
      frames: [
        { caption: 'Trigger: force the pass to the full-back', objects: [
          GK('away', 5, 34), P('away', 4, 16, 26), B(16.8, 26.4), P('away', 5, 16, 42), P('away', 2, 24, 62), P('away', 3, 24, 8), P('away', 6, 28, 34), P('away', 8, 36, 46), P('away', 10, 36, 22), P('away', 7, 52, 62), P('away', 11, 52, 8), P('away', 9, 56, 34),
          GK('home', 90, 34), P('home', 9, 26, 32), P('home', 11, 26, 50), P('home', 7, 30, 18), P('home', 8, 36, 38), P('home', 10, 38, 26), P('home', 6, 44, 34), P('home', 2, 48, 60), P('home', 4, 52, 44), P('home', 5, 52, 28), P('home', 3, 50, 12),
          C(26, 32, 20, 26, 18, 30, { color: WHITE, dash: true }), A('pass', 16.8, 26.4, 23.4, 61.2, { color: GOLD, dash: true }),
          Z(24, 60, 14, 16, { color: '#ff5d5d', opacity: .16 }), T(60, 65.6, 'Curved press shows the CB the pass to the full-back', { color: WHITE }),
        ] },
        { caption: 'Ball travels — winger, 8 and full-back jump', objects: [
          GK('away', 5, 34), P('away', 4, 17, 27), P('away', 5, 16, 42), P('away', 2, 24, 62), B(24.6, 61.8), P('away', 3, 24, 8), P('away', 6, 28, 34), P('away', 8, 36, 46), P('away', 10, 36, 22), P('away', 7, 52, 62), P('away', 11, 52, 8), P('away', 9, 56, 34),
          GK('home', 90, 34), P('home', 9, 20, 30), P('home', 11, 26, 56), P('home', 7, 34, 22), P('home', 8, 34, 44), P('home', 10, 34, 30), P('home', 6, 40, 38), P('home', 2, 42, 60), P('home', 4, 50, 46), P('home', 5, 50, 32), P('home', 3, 48, 16),
          A('run', 26, 56, 25.5, 60, { color: WHITE }), A('run', 34, 44, 33, 50, { color: WHITE }), A('run', 42, 60, 36, 60, { color: WHITE }), A('run', 40, 38, 32, 40, { color: SKY }),
          Z(28, 56, 16, 20, { color: '#ff5d5d', opacity: .16 }),
        ] },
        { caption: 'Trap closed on the touchline', moves: { h11: [25.5, 59.5], h8: [32, 50], h2: [35, 61], h6: [32, 41], h9: [21, 32], h10: [33, 33], a2: [25, 62], ball: [25, 62.5], a8: [34, 50] } },
      ],
    },
    {
      id: 'def_shape_shadow', group: 'Pressing & defending', name: 'Defensive shape · shadow play', pitch: { type: 'full' },
      time: '15 min', players: '11', equipment: '4 balls at the coach’s feet',
      desc: 'No opponents. The coach moves the ball around the halfway line and the team slides as a block: compact between the lines (under 12 m), the ball-side winger drops, the far side tucks in.',
      coaching: ['Slide together — move as the ball moves', 'Distances: 10–12 m between units, 8–10 m between players in a line', 'Cover shadows: block the pass into the striker'],
      frames: [
        { caption: 'Ball central — compact block', objects: [
          GK('home', 10, 34), P('home', 2, 30, 56), P('home', 4, 26, 42), P('home', 5, 26, 26), P('home', 3, 30, 12), P('home', 6, 38, 34), P('home', 7, 44, 58), P('home', 8, 42, 44), P('home', 10, 42, 24), P('home', 11, 44, 10), P('home', 9, 52, 34),
          P('neutral', 1, 62, 34, { name: 'Coach' }), B(60.5, 34),
          A('line', 30, 56, 30, 12, { color: GOLD, width: .16, dash: true }), A('line', 44, 58, 44, 10, { color: GOLD, width: .16, dash: true }), T(74, 3.2, 'Lines 12 m apart · 52 m long block', { color: WHITE }),
        ] },
        { caption: 'Ball moves right — block slides', moves: { n1: [60, 56], ball: [58.5, 56], h2: [32, 62], h4: [28, 50], h5: [28, 34], h3: [32, 20], h6: [40, 46], h7: [46, 64], h8: [44, 52], h10: [44, 34], h11: [48, 22], h9: [54, 44] } },
        { caption: 'Ball switches left — slide the other way', moves: { n1: [60, 12], ball: [58.5, 12], h2: [32, 48], h4: [28, 34], h5: [28, 18], h3: [32, 6], h6: [40, 22], h7: [48, 46], h8: [44, 34], h10: [44, 16], h11: [46, 4], h9: [54, 24] } },
      ],
    },
    {
      id: 'warmup_dynamic', group: 'Warm-up & physical', name: 'Dynamic warm-up · ladder & cone lanes', pitch: { type: 'grid', L: 30, W: 20, gridStep: 5 },
      time: '12 min', players: 'whole squad', equipment: '2 ladders, 12 cones, 6 hurdles, balls',
      desc: 'Four lanes: ladder footwork, hurdle hops, cone weave with a ball, and a passing lane. 45 seconds work per lane, rotate. Finish with three progressive sprints.',
      coaching: ['Quality of movement before speed', 'Head up during the ball weave', 'Progress from 60% to 90% intensity'],
      frames: [{ caption: 'Ladder · hurdles · weave · passing', objects: [
        E('ladder', 8, 3.5, { rot: 90 }), E('ladder', 18, 3.5, { rot: 90 }),
        E('hurdle', 6, 8), E('hurdle', 9, 8), E('hurdle', 12, 8), E('hurdle', 15, 8), E('hurdle', 18, 8), E('hurdle', 21, 8),
        ...cones([[6, 12.5], [9, 12.5], [12, 12.5], [15, 12.5], [18, 12.5], [21, 12.5]], YELLOW),
        E('cone', 6, 17, { color: ORANGE }), E('cone', 22, 17, { color: ORANGE }),
        P('home', 2, 3, 3.5), P('home', 3, 3, 8), P('home', 4, 3, 12.5), B(3.8, 12.5), P('home', 5, 3, 17), B(3.8, 17), P('home', 6, 25, 17),
        A('dribble', 4, 12.5, 23, 12.5, { color: WHITE }), A('pass', 3.8, 17, 24.2, 17, { color: GOLD }), A('run', 3, 3.5, 25, 3.5, { color: WHITE, dash: true }),
        T(15, 23.2, '45 s per lane · rotate clockwise', { color: WHITE, size: 1.6 }),
      ] }],
    },
    {
      id: 'crossing_finishing_fullpitch', group: 'Finishing & 1v1', name: 'Crossing & finishing vs. back four', pitch: { type: 'half' },
      time: '20 min', players: '7 attackers + GK + 4 defenders', equipment: 'balls, 1 goal',
      desc: 'Attackers build from the half-way line; the winger must beat or bypass the full-back and deliver. Three attackers make three different runs; defenders can only defend inside the box.',
      coaching: ['Cross behind the defenders, in front of the keeper', 'Runs cross each other — near and far post switch', 'Rebounds: 10 stays alive on the edge of the box'],
      frames: [{ caption: 'Deliver behind the line', objects: [
        GK('away', 51.5, 34), P('away', 2, 38, 58), P('away', 4, 40, 40), P('away', 5, 40, 28), P('away', 3, 38, 10),
        P('home', 7, 30, 62), B(30.6, 61.6), P('home', 2, 24, 66), P('home', 9, 30, 34), P('home', 11, 30, 16), P('home', 10, 22, 40), P('home', 8, 18, 28), P('home', 6, 10, 34),
        A('dribble', 30.6, 61.6, 42, 64, { color: WHITE }), C(42, 64, 50, 52, 46, 36, { color: GOLD }), A('run', 30, 34, 46, 38, { color: WHITE }), A('run', 30, 16, 46, 30, { color: WHITE }), A('run', 22, 40, 36, 36, { color: SKY }),
      ] }],
    },
  ];

  K1.DRILLS = DRILLS;
  K1.drillGroups = function () {
    const groups = [];
    DRILLS.forEach(d => { let g = groups.find(x => x.name === d.group); if (!g) { g = { name: d.group, items: [] }; groups.push(g); } g.items.push(d); });
    return groups;
  };
})(window.K1 = window.K1 || {});
