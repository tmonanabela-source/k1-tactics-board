/* K1 Shooters club app — phases of play for the 4-2-2-2 game model.
 * In possession: build-up → progression → creation → finish.
 * Out of possession: high press · mid block · low block → counter attack.
 * Each phase animates: the frame shows the collective shape, the arrows show the individual runs,
 * and the following frames move the players so the team can watch it happen.
 * Positions come from the formations in js/formations.js so the shapes stay consistent everywhere. */
(function (K1) {
  'use strict';

  const r = n => Math.round(n * 10) / 10;
  const D = () => K1.pitchDims({ type: 'full' });

  /** Players of a formation as authored descriptors. `set` overrides individual players by key (h6, a9…). */
  function base(homeForm, awayForm, opts) {
    opts = opts || {};
    const d = D(), out = [], set = opts.set || {};
    const add = (fid, team) => {
      const fm = K1.formationById(fid); if (!fm) return;
      fm.slots.forEach(sl => {
        const key = (team === 'home' ? 'h' : 'a') + sl.n;
        const [x, y] = K1.slotToPitch(d, sl, team);
        const ov = set[key];
        out.push({ t: 'player', team, n: sl.n, gk: sl.p === 'GK', x: ov ? ov[0] : r(x), y: ov ? ov[1] : r(y), k: key });
      });
    };
    add(homeForm, 'home');
    if (awayForm) add(awayForm, 'away');
    if (opts.ball) out.push({ t: 'ball', x: opts.ball[0], y: opts.ball[1], k: 'ball' });
    return out;
  }
  const A = (kind, x1, y1, x2, y2, o) => Object.assign({ t: 'path', kind, points: [[x1, y1], [x2, y2]] }, o || {});
  const C = (x1, y1, cx, cy, x2, y2, o) => Object.assign({ t: 'path', kind: 'curve', points: [[x1, y1], [x2, y2]], ctrl: [cx, cy] }, o || {});
  const T = (x, y, text, o) => Object.assign({ t: 'text', x, y, text, size: 2.1, color: '#ffffff' }, o || {});
  const Z = (x, y, w, h, o) => Object.assign({ t: 'shape', kind: 'zone', x, y, w, h, opacity: .16 }, o || {});
  const GOLD = '#f5b301', WHITE = '#ffffff', SKY = '#7dd3fc', RED = '#ff5d5d', GREEN = '#4ade80';

  const PHASES = [
    /* ==================================================== 1 · BUILD-UP */
    {
      id: 'ph_build_trap', group: '1 · Build-up', name: 'The trap · invite the press, break it',
      desc: 'De Zerbi’s signature. The centre-back stops the ball and stands still. That stillness is the invitation. The moment the presser commits his weight, the ball goes past him to the free man and we are four against four behind their press.',
      coaching: ['Sole of the foot on the ball, head up, feet still — stillness is the bait', 'Do not pass until you see his weight go forward', 'The pivot shows on the diagonal, never directly behind the presser', 'Everyone beyond the ball holds their height until the line is broken'],
      frames: [
        { caption: 'Shape: 2-4-4. The 4 takes the ball and stops it.', objects: [
          ...base('244dz', '433press', { ball: [24.5, 39.8] }),
          A('run', 16, 34, 21.5, 38.5, { color: RED, dash: true }),
          A('pass', 24.5, 39.8, 44, 41, { color: GOLD, dash: true }),
          Z(24, 39, 13, 13, { color: GOLD, opacity: .12 }),
          T(24, 62, 'Stand still on the ball. Let him come.', { color: GOLD }),
        ] },
        { caption: 'He commits. Now the pass goes past him to the 6.', moves: { a9: [21, 38], a8: [30, 24], a10: [31, 45], h6: [41, 43], ball: [41, 43.6] },
          objects: [A('pass', 24.5, 39.8, 40, 43, { color: GOLD }), A('run', 41, 43, 47, 47, { color: WHITE }), T(24, 62, 'His weight goes forward — release', { color: GOLD })] },
        { caption: 'Line broken: the 6 turns and finds the 7 in the half-space.', moves: { h6: [45, 44], ball: [72, 52], h7: [73, 52.5], h9: [88, 40], h11: [88, 28], a4: [58, 28], a5: [58, 43] },
          objects: [A('pass', 45, 44, 71, 52, { color: GOLD }), A('run', 75.6, 54.4, 84, 60, { color: WHITE }), T(30, 62, 'Four against four behind their press', { color: GREEN })] },
      ],
    },
    {
      id: 'ph_build_gk', group: '1 · Build-up', name: 'Goalkeeper as the free man vs man-to-man',
      desc: 'When they mark us man for man all over the pitch, the goalkeeper is the only free player. Play back to him on purpose, let one of their players leave his man to press, and the man he left is our way out.',
      coaching: ['Backwards is not backwards if it creates a free man', 'Goalkeeper: take the first touch forward, into the space he left', 'The striker times his drop for the moment the keeper looks up', 'If nobody presses the keeper, he dribbles forward until somebody does'],
      frames: [
        { caption: 'Man for man everywhere. The keeper is our free player.', objects: [
          ...base('244dz', '433press', { ball: [14.5, 34.6], set: { h4: [21, 44], h5: [21, 24] } }),
          A('line', 14.7, 34, 16, 34, { color: RED, width: .18, dash: true }),
          A('line', 18.9, 12.24, 21, 24, { color: RED, width: .16, dash: true }),
          A('line', 18.9, 55.76, 21, 44, { color: RED, width: .16, dash: true }),
          T(30, 6, 'Every white shirt is marked. Number 1 is not.', { color: GOLD }),
        ] },
        { caption: 'Their 9 presses the keeper — now their centre is open.', moves: { a9: [18, 34], h9: [56, 36], ball: [15, 34] },
          objects: [A('run', 14.7, 34, 18, 34, { color: RED, dash: true }), A('run', 88.2, 39.4, 58, 36, { color: WHITE }), A('pass', 15, 34, 55, 36, { color: GOLD, dash: true })] },
        { caption: 'Straight into the 9 who dropped, and we attack a back four with no screen.', moves: { ball: [55.5, 36.5], h9: [56, 36], h7: [72, 54], h11: [78, 30], h10: [70, 16], a6: [50, 30] },
          objects: [A('pass', 15, 34, 54, 36, { color: GOLD }), A('run', 56, 36, 62, 40, { color: WHITE }), A('run', 88.2, 28.6, 80, 28, { color: WHITE })] },
      ],
    },

    /* ================================================== 2 · PROGRESSION */
    {
      id: 'ph_prog_third', group: '2 · Progression', name: 'Third man through the pivot',
      desc: 'The ball goes in to a marked player and comes straight back out. While the defender is busy with him, the third man is already running into the space behind.',
      coaching: ['The receiver plays with one touch, back to the direction he came from', 'The third man starts moving as the FIRST pass travels, not when he gets it', 'Set the ball to the far foot so the third man can hit it first time', 'Call the name of the man you are setting to'],
      frames: [
        { caption: 'Ball with the 4. The 9 comes short, marked. The 7 is watching.', objects: [
          ...base('4222dz', '4141mid', { ball: [21, 41], set: { h9: [62, 40], h7: [63, 49] } }),
          A('run', 62, 40, 55, 40, { color: WHITE }),
          A('pass', 21, 41, 54, 40, { color: GOLD, dash: true }),
          T(26, 10, 'In to the 9 · set to the 6 · forward to the 7', { color: GOLD }),
        ] },
        { caption: 'In to the 9, he sets it first time to the 6.', moves: { h9: [55, 40], ball: [42, 44], h6: [41, 44], h7: [70, 56] },
          objects: [A('pass', 21, 41, 54, 40, { color: GOLD, width: .3 }), A('pass', 55, 40, 42, 44, { color: GOLD }), A('run', 63, 49, 74, 58, { color: SKY })] },
        { caption: 'The 6 hits the 7 who is already running. The line is gone.', moves: { ball: [76, 58], h7: [77, 58], h9: [70, 38], h11: [82, 30] },
          objects: [A('pass', 42, 44, 75, 58, { color: GOLD }), A('run', 70, 38, 86, 40, { color: WHITE }), A('run', 82, 30, 92, 32, { color: WHITE })] },
      ],
    },
    {
      id: 'ph_prog_switch', group: '2 · Progression', name: 'Overload one side, finish on the other',
      desc: 'Pull them to one side with short passes, then switch. The far full-back and the far ten attack a defence that is still sliding.',
      coaching: ['Five or six passes on one side before you even look to switch', 'The switch is one long pass, not three short ones', 'Far side: stay wide and stay high, do not drift in to watch the ball', 'The receiver takes his first touch forward, into the space'],
      frames: [
        { caption: 'Everything on the right. Their block slides across.', objects: [
          ...base('4222dz', '4141mid', { ball: [46, 57], set: { h6: [42, 52], h7: [58, 60], h2: [52, 64], h9: [72, 48] } }),
          Z(56, 52, 34, 30, { color: RED, opacity: .14 }),
          A('pass', 46, 57, 52, 63, { color: GOLD, dash: true }),
          T(40, 10, 'Far side: 10 and 3 stay wide and high', { color: GOLD }),
        ] },
        { caption: 'One long switch to the far ten.', moves: { ball: [66, 16], h10: [66, 15], h3: [58, 6] },
          objects: [C(46, 57, 56, 30, 65, 16, { color: GOLD }), A('run', 58, 6, 74, 5, { color: WHITE }), Z(56, 52, 34, 30, { color: RED, opacity: .1 })] },
        { caption: 'He takes it forward before they arrive, the 3 overlaps outside.', moves: { h10: [74, 18], ball: [75, 18.5], h3: [78, 6], h11: [86, 30], h9: [84, 42], a2: [72, 12], a4: [80, 26] },
          objects: [A('dribble', 66, 16, 74, 18, { color: WHITE }), A('run', 74, 18, 84, 8, { color: SKY }), A('run', 86, 30, 95, 32, { color: WHITE })] },
      ],
    },

    /* ==================================================== 3 · CREATION */
    {
      id: 'ph_create_pocket', group: '3 · Creation', name: 'The ten in the pocket, the full-back outside',
      desc: 'The half-space and the touchline at the same time. The ten receives between their midfield and defence facing forward; the full-back runs outside him so the defender cannot do both jobs.',
      coaching: ['Ten: check away from the ball, then come back into the gap', 'Receive on the half turn — back foot, shoulder open', 'Full-back: go on the outside and go early, make the defender choose', 'If they follow the ten, the space behind is for the striker'],
      frames: [
        { caption: 'The 7 finds the pocket between their lines.', objects: [
          ...base('4222dz', '442low', { ball: [56, 52], set: { h7: [70, 50], h2: [62, 62], h9: [80, 44], h11: [80, 26] } }),
          Z(70, 48, 20, 18, { color: GOLD, opacity: .14 }),
          A('pass', 56, 52, 69, 50, { color: GOLD, dash: true }),
          A('run', 62, 62, 82, 62, { color: SKY }),
          T(40, 10, 'One receives inside, one runs outside', { color: GOLD }),
        ] },
        { caption: 'He turns. The 2 is already outside him — the defender must choose.', moves: { h7: [72, 50], ball: [73, 50.5], h2: [82, 62], a3: [84, 58], a5: [88, 38] },
          objects: [A('dribble', 70, 50, 73, 50, { color: WHITE }), A('pass', 73, 50, 84, 62, { color: GOLD, dash: true }), A('run', 80, 44, 90, 40, { color: WHITE }), A('run', 80, 26, 92, 30, { color: WHITE })] },
        { caption: 'Released outside, the box is already filled with three runs.', moves: { ball: [88, 62], h2: [89, 62], h9: [93, 40], h11: [95, 31], h10: [86, 44], h7: [80, 48] },
          objects: [C(88, 62, 94, 52, 95, 36, { color: GOLD }), A('run', 86, 44, 92, 44, { color: WHITE }), T(40, 10, 'Near post · far post · cut-back', { color: GOLD })] },
      ],
    },
    {
      id: 'ph_create_wide3v2', group: '3 · Creation', name: 'Wide 3v2 and the cut-back',
      desc: 'Three of ours against two of theirs on the flank: the ten inside, the full-back outside, the striker pinning the centre-back. Get to the by-line and pull it back to the edge of the six-yard box.',
      coaching: ['Three players, three heights — never level with each other', 'Pass, then move past — a pass without movement is a dead end', 'The cut-back is to the penalty spot, not across the face of goal', 'One striker always checks back for the pull-back'],
      frames: [
        { caption: '3v2 on the right: 7 inside, 2 outside, 9 pinning.', objects: [
          ...base('4222dz', '442low', { ball: [70, 56], set: { h7: [71, 56], h2: [76, 64], h9: [86, 44], h11: [84, 30], h6: [62, 46] } }),
          Z(74, 56, 26, 22, { color: GOLD, opacity: .14 }),
          A('pass', 70, 56, 78, 64, { color: GOLD, dash: true }),
          A('run', 71, 56, 84, 54, { color: WHITE }),
        ] },
        { caption: 'Pass outside, run past — the overlap makes it 3v2.', moves: { h2: [84, 64], ball: [85, 64], h7: [84, 54], h9: [90, 42], h11: [88, 30], a2: [86, 58], a4: [92, 40] },
          objects: [A('run', 76, 64, 84, 64, { color: SKY }), A('pass', 84, 64, 94, 62, { color: GOLD, dash: true }), A('run', 84, 54, 92, 50, { color: WHITE })] },
        { caption: 'By-line reached. Cut it back to the spot.', moves: { h2: [98, 60], ball: [98.5, 60], h9: [99, 38], h11: [97, 30], h7: [93, 44], h10: [88, 36] },
          objects: [A('pass', 98.5, 60, 93, 42, { color: GOLD }), A('shot', 93, 42, 104, 33, { color: GOLD }), T(50, 10, 'Cut-back to the penalty spot, never across the face', { color: GOLD })] },
      ],
    },

    /* ====================================================== 4 · FINISH */
    {
      id: 'ph_finish_box', group: '4 · Finishing', name: 'Filling the box · five runs, five places',
      desc: 'When the cross comes, five players have five different jobs. Nobody guesses. If everyone knows his place, the ball only has to find one of them.',
      coaching: ['Near post: attack it first and attack it early', 'Far post: start wide of the last defender and arrive late', 'Penalty spot: the striker who checks back is usually the free one', 'Edge of the box: one player for the second ball, every single time', 'The fifth is the far full-back, arriving for the ball that crosses everybody'],
      frames: [
        { caption: 'Delivery from the right. Five jobs, five zones.', objects: [
          ...base('4222dz', '442low', { ball: [92, 62], set: { h2: [92, 62], h9: [95, 39], h11: [97, 28], h7: [90, 44], h10: [84, 38], h3: [86, 12], h6: [78, 40] } }),
          Z(99, 40, 6, 8, { color: GOLD, opacity: .18, label: 'NEAR' }),
          Z(99, 28, 6, 8, { color: GOLD, opacity: .18, label: 'FAR' }),
          Z(94, 34, 6, 8, { color: SKY, opacity: .16, label: 'SPOT' }),
          Z(85, 34, 8, 10, { color: GREEN, opacity: .14, label: '2nd BALL' }),
          A('run', 95, 39, 99, 40, { color: WHITE }), A('run', 97, 28, 99, 29, { color: WHITE }),
          A('run', 90, 44, 94, 35, { color: WHITE }), A('run', 84, 38, 87, 35, { color: SKY }), A('run', 86, 12, 92, 20, { color: SKY }),
        ] },
        { caption: 'Ball in. Everyone is already moving, nobody is standing still.', moves: { ball: [98.5, 39], h9: [99, 40], h11: [99.5, 29], h7: [94, 35], h10: [87, 35], h3: [92, 20], a4: [98, 36], a5: [99, 31] },
          objects: [C(92, 62, 96, 50, 98.5, 39, { color: GOLD }), A('shot', 99, 40, 104.6, 33, { color: GOLD })] },
      ],
    },
    {
      id: 'ph_finish_rebound', group: '4 · Finishing', name: 'Second balls and rest defence',
      desc: 'Every attack ends in one of three ways: a goal, a second ball, or their counter. Decide before the cross who is going to win the second ball and who is staying home.',
      coaching: ['Two at the edge of the box for the rebound, always', 'Two centre-backs and one pivot stay behind the ball — that is the rest defence', 'The far full-back tucks in while the near one crosses', 'Nobody watches the shot. Follow it in.'],
      frames: [
        { caption: 'Shot taken. Two on the rebound, three plus the keeper at home.', objects: [
          ...base('4222dz', '442low', { ball: [96, 36], set: { h9: [97, 38], h11: [98, 30], h7: [88, 40], h10: [86, 30], h2: [90, 60], h3: [70, 20], h6: [76, 38], h8: [68, 34] } }),
          Z(88, 34, 10, 16, { color: GREEN, opacity: .14, label: 'SECOND BALL' }),
          Z(45, 34, 34, 30, { color: SKY, opacity: .12, label: 'REST DEFENCE' }),
          A('shot', 96, 36, 104, 32, { color: GOLD }),
          A('run', 88, 40, 94, 38, { color: WHITE }), A('run', 86, 30, 93, 31, { color: WHITE }),
        ] },
        { caption: 'If they clear it, we are set to win it back immediately.', moves: { ball: [86, 36], h7: [86, 38], h10: [88, 31], h8: [72, 34], h6: [78, 40] },
          objects: [A('run', 86, 38, 88, 36, { color: WHITE }), Z(45, 34, 34, 30, { color: SKY, opacity: .12, label: 'REST DEFENCE' })] },
      ],
    },

    /* ================================================== 5 · HIGH PRESS */
    {
      id: 'ph_press_high', group: '5 · High press', name: 'High press · force him wide and trap',
      desc: 'The two strikers do not chase. They stand so the only easy pass is the one we want him to make — out to the full-back. When it goes there, everybody jumps at once.',
      coaching: ['Curve the run so your body blocks the inside pass', 'The trigger is the pass to the full-back — nobody moves before it', 'Winger presses from the outside in, pinning him to the touchline', 'Back line pushes to halfway: if we press high and defend deep we are stretched'],
      frames: [
        { caption: 'The 9 shows him the outside pass. Nobody has jumped yet.', objects: [
          ...base('4222press', '244dz', { ball: [23, 39] }),
          C(60, 38, 40, 30, 28, 36, { color: WHITE, dash: true }),
          A('pass', 23, 39, 49, 62, { color: RED, dash: true }),
          Z(46, 60, 18, 16, { color: RED, opacity: .16, label: 'TRAP' }),
          T(60, 10, 'Trigger = the pass to the full-back', { color: GOLD }),
        ] },
        { caption: 'It goes wide. Everyone jumps together.', moves: { ball: [49, 61.5], h9: [40, 44], h7: [52, 56], h2: [52, 64], h6: [50, 48], h11: [36, 34], h10: [46, 24] },
          objects: [A('run', 74, 47.6, 52, 56, { color: WHITE }), A('run', 55, 60, 52, 64, { color: WHITE }), A('run', 60, 39, 50, 48, { color: SKY }), Z(46, 60, 18, 16, { color: RED, opacity: .2, label: 'TRAP' })] },
        { caption: 'Won on the touchline, and their goal is 50 metres away.', moves: { ball: [50, 58], h7: [50, 58], h9: [36, 42], h11: [30, 32], h10: [42, 26] },
          objects: [A('pass', 50, 58, 34, 42, { color: GOLD }), A('run', 36, 42, 22, 38, { color: WHITE }), T(60, 10, 'Win it high, score in three passes', { color: GREEN })] },
      ],
    },

    /* =================================================== 6 · MID BLOCK */
    {
      id: 'ph_block_mid', group: '6 · Mid block', name: 'Mid block · two banks, slide together',
      desc: 'We give them their own half and defend from the halfway line. The two tens drop onto the flanks and it becomes two banks of four. Ten metres between the lines, ten metres between each player.',
      coaching: ['Slide as the ball moves, not after it arrives', 'The far winger tucks into the middle — the ball cannot reach him quickly', 'Strikers stand in the shadow of their pivot', 'Distance check: if you can read his number, you are close enough'],
      frames: [
        { caption: 'Ball central. Compact: 10 metres between every line.', objects: [
          ...base('4222block', '235', { ball: [58, 34] }),
          A('line', 30, 62, 30, 6, { color: GOLD, width: .16, dash: true }),
          A('line', 46, 62, 46, 6, { color: GOLD, width: .16, dash: true }),
          T(16, 10, 'Two banks of four. Give them the ball, not the space.', { color: GOLD }),
        ] },
        { caption: 'Ball goes to their right. The whole block slides.', moves: { ball: [56, 56], h2: [32, 66], h4: [28, 50], h5: [28, 34], h3: [32, 20], h7: [48, 62], h6: [44, 50], h8: [44, 36], h10: [48, 24], h9: [60, 46], h11: [58, 34] },
          objects: [A('run', 46, 16, 48, 24, { color: SKY }), T(16, 10, 'Slide together — never one at a time', { color: GOLD })] },
        { caption: 'They are pinned wide. Now we press and win it.', moves: { ball: [54, 60], h7: [52, 60], h2: [50, 66], h6: [48, 52] },
          objects: [A('run', 48, 62, 52, 60, { color: WHITE }), A('run', 32, 66, 50, 66, { color: WHITE }), Z(52, 60, 18, 16, { color: RED, opacity: .16, label: 'PRESS NOW' })] },
      ],
    },

    /* =================================================== 7 · LOW BLOCK */
    {
      id: 'ph_block_low', group: '7 · Low block & counter', name: 'Low block · protect the middle of the goal',
      desc: 'Deep and narrow. We defend the centre first and let them have the ball wide. Nobody dives in; we make the box crowded and we make them cross from far out.',
      coaching: ['Narrow first, wide second — the goal is in the middle', 'Nobody runs out of the line unless the ball is in front of him', 'Head on a swivel in the box: see the ball and your man', 'Clear it long and wide, never square across our own box'],
      frames: [
        { caption: 'Two banks deep, the width of the penalty area.', objects: [
          ...base('442low', '235', { ball: [58, 34] }),
          Z(20, 34, 24, 30, { color: SKY, opacity: .14, label: 'PROTECT THIS' }),
          T(64, 8, 'They can have the ball out wide. Not here.', { color: GOLD }),
        ] },
        { caption: 'Cross comes in: mark inside out, and one man attacks the ball.', moves: { ball: [24, 58], h2: [22, 52], h4: [16, 44], h5: [15, 32], h3: [18, 20], h7: [26, 48], h8: [24, 38], h6: [24, 30], h11: [28, 22], h9: [34, 38], h10: [36, 30] },
          objects: [C(24, 58, 18, 44, 14, 36, { color: RED }), A('run', 16, 44, 14, 38, { color: WHITE }), Z(20, 34, 24, 30, { color: SKY, opacity: .14 })] },
      ],
    },
    {
      id: 'ph_counter', group: '7 · Low block & counter', name: 'Counter attack · three passes to the goal',
      desc: 'The whole point of defending deep. We win it, and within three passes the ball is in their box. First pass forward, first run beyond, everybody sprints.',
      coaching: ['The first pass is always forward if it is on — sideways kills the counter', 'The first runner goes beyond the ball, not towards it', 'Two men commit to the box, the rest stop the counter-counter', 'Five seconds: if it is not a shot by then, keep the ball and rebuild'],
      frames: [
        { caption: 'Won in our box. Their five are all in front of the ball.', objects: [
          ...base('442low', '235', { ball: [18, 40], set: { h9: [40, 40], h11: [38, 28] } }),
          A('pass', 18, 40, 39, 40, { color: GOLD, dash: true }),
          A('run', 38, 28, 62, 20, { color: WHITE }),
          T(70, 8, 'First pass forward · first run beyond', { color: GOLD }),
        ] },
        { caption: 'Into the 9, the 11 is already gone in behind.', moves: { ball: [41, 40], h9: [41, 40], h11: [64, 20], h7: [50, 52], h10: [46, 30], h2: [40, 60] },
          objects: [A('pass', 41, 40, 66, 20, { color: GOLD }), A('run', 50, 52, 72, 56, { color: SKY }), A('run', 46, 30, 68, 34, { color: SKY })] },
        { caption: 'Three passes, and we are shooting.', moves: { ball: [80, 24], h11: [80, 24], h9: [86, 36], h7: [82, 54], h10: [80, 34] },
          objects: [A('pass', 80, 24, 90, 36, { color: GOLD }), A('shot', 90, 36, 103, 33, { color: GOLD }), A('run', 86, 36, 92, 37, { color: WHITE }), T(40, 8, 'Two in the box, three behind the ball', { color: GREEN })] },
      ],
    },
  ];

  K1.PHASES = PHASES;
  K1.phaseGroups = function () {
    const gs = [];
    PHASES.forEach(p => { let g = gs.find(x => x.name === p.group); if (!g) { g = { name: p.group, items: [] }; gs.push(g); } g.items.push(p); });
    return gs;
  };
  K1.phaseById = id => PHASES.find(p => p.id === id) || null;
})(window.K1 = window.K1 || {});
