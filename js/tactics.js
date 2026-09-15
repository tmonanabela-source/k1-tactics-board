/* K1 Shooters Tactics Board — club tactic "morphs": how great teams change shape with and without the ball.
 * Each morph is a sequence of frames built from formation ids. Playing the frames animates the shape change. */
(function (K1) {
  'use strict';

  const MORPHS = [
    {
      id: 'k1_press_build', club: 'K1 Shooters', name: 'K1 game model · press high, build calm', kits: ['k1', 'red'],
      desc: 'Our shape without the ball is a 4-3-3 high press; the moment we win it we drop into a 4-3-3 build shape with the 6 as the pivot and the wingers pinned wide.',
      frames: [
        { home: '433press', away: '442low', ball: [30, 34], caption: 'Out of possession: front three press the back line' },
        { home: '433', away: '442low', ball: [40, 36], caption: 'Ball won: settle into the 4-3-3 build shape' },
        { home: '235', away: '442low', ball: [60, 40], caption: 'Established possession: full-backs step in, five up top' },
      ],
    },
    {
      id: 'barca_433_235', club: 'Barcelona', name: 'Barcelona · 4-3-3 → 2-3-5', kits: ['barcelona', 'red'],
      desc: 'Positional play: from a 4-3-3 base, the full-backs step into midfield and the eights push high so five attackers occupy the five lanes. The pivot and two centre-backs build behind.',
      frames: [
        { home: '433', away: '4141mid', ball: [22, 34], caption: 'Base 4-3-3 · goalkeeper starts the build' },
        { home: '235', away: '4141mid', ball: [46, 30], caption: 'In possession: 2-3-5 — five lanes occupied' },
        { home: '433press', away: '4141mid', ball: [30, 34], caption: 'Ball lost: immediate counter-press (6-second rule)' },
      ],
    },
    {
      id: 'city_3241_325', club: 'Man City', name: 'Man City · 3-2-4-1 → 3-2-5 / 4-1-4-1', kits: ['mancity', 'red'],
      desc: 'A back three and two pivots form a box in build-up; four attacking midfielders and the 9 become a front five. Without the ball the shape recovers into a 4-1-4-1 mid block.',
      frames: [
        { home: '3241', away: '442low', ball: [28, 34], caption: 'Build: 3-2 box behind the ball' },
        { home: '325', away: '442low', ball: [58, 28], caption: 'Final third: front five stretches the back line' },
        { home: '4141mid', away: '442', ball: [50, 40], caption: 'Transition: recover into the 4-1-4-1 mid block' },
      ],
    },
    {
      id: 'arsenal_433_325', club: 'Arsenal', name: 'Arsenal · 4-3-3 → 3-2-5, then let him go 1v1', kits: ['arsenal', 'blue'],
      desc: 'Arsenal\u2019s Swagger, the way the club model means it: the structure is not the opposite of flair, it is what pays for it. The left-back steps inside to make a 3-2-5, the team overloads one side, then switches \u2014 and the far winger gets the ball with grass in front of him and permission to take his man on.',
      frames: [
        { home: '433', away: '4141mid', ball: [14, 34], caption: 'Base 4-3-3 \u00b7 centre-backs split, the 6 shows between them' },
        { home: '325', away: '442low', ball: [44, 20], caption: 'Left-back steps in: 3-2-5 \u00b7 overload the left, five hold the last line' },
        { home: '325', away: '442low', ball: [64, 60], caption: 'Switch \u00b7 the ball travels faster than they can slide \u2014 the right winger is 1v1' },
        { home: '433press', away: '442', ball: [58, 40], caption: 'Ball lost: win it back at once \u2014 the shape is what buys the freedom' },
      ],
    },
    {
      id: 'madrid_442_433', club: 'Real Madrid', name: 'Real Madrid · 4-4-2 block → 4-3-3 counter', kits: ['realmadrid', 'blue'],
      desc: 'Compact 4-4-2 low block with the wingers tucked in; on winning the ball the wide players sprint into a 4-3-3 counter with runners either side of the striker.',
      frames: [
        { home: '442low', away: '235', ball: [70, 30], caption: 'Low block: two banks of four, patient' },
        { home: '433', away: '235', ball: [40, 34], caption: 'Ball won: wingers explode forward' },
        { home: '433press', away: '442', ball: [80, 40], caption: 'Counter-attack: numbers in the box' },
      ],
    },
    {
      id: 'pirates_4231_343', club: 'Orlando Pirates', name: 'Orlando Pirates · 4-2-3-1 → 3-4-3', kits: ['pirates', 'yellow'],
      desc: 'A 4-2-3-1 base with a double pivot. In possession one full-back pushes very high and the other tucks in beside the centre-backs, creating a 3-4-3 with wing-backs providing the width.',
      frames: [
        { home: '4231', away: '442', ball: [30, 34], caption: 'Base 4-2-3-1' },
        { home: '343', away: '442low', ball: [55, 30], caption: 'In possession: 3-4-3 with wing-backs high' },
        { home: '4231', away: '442', ball: [45, 40], caption: 'Recover into the double pivot when the ball is lost' },
      ],
    },
    {
      id: 'dezerbi_4222', club: 'De Zerbi', name: 'De Zerbi · 4-2-2-2 → 2-4-4 build trap', kits: ['sky', 'red'],
      desc: 'The 4-2-2-2 becomes a 2-4-4 to build. Two centre-backs stand on the ball and invite the press; the full-backs step up level with the double pivot; four attackers pin the back line. Break the first line and the pitch is wide open.',
      frames: [
        { home: '4222dz', away: '4141mid', ball: [10, 34], caption: 'Base 4-2-2-2 · the square in midfield, width from the full-backs' },
        { home: '244dz', away: '433press', ball: [23, 40], caption: 'Build trap: 2-4-4 · centre-backs invite the press, four attackers pin the line' },
        { home: '325dz', away: '442low', ball: [66, 62], caption: 'Line broken: 3-2-5 · five on the last line, overload the far half-space' },
        { home: '4222press', away: '4141mid', ball: [40, 34], caption: 'Ball lost: counter-press instantly, strikers on the centre-backs' },
      ],
    },
    {
      id: 'fabregas_como', club: 'Fàbregas', name: 'Fàbregas · Como 4-2-2-2 → 2-3-5', kits: ['blue', 'white'],
      desc: 'Same square, a freer accent. Full-backs step inside, the 6 drops between the centre-backs and the playmaker roams off the front line to find the ball wherever it is.',
      frames: [
        { home: '4222como', away: '442', ball: [12, 34], caption: 'Base 4-2-2-2 · one ten free to roam, one holding the far half-space' },
        { home: '235como', away: '442low', ball: [42, 46], caption: 'In possession: 2-3-5 · full-backs inside, five across the last line' },
        { home: '4222block', away: '235', ball: [58, 34], caption: 'Out of possession: the tens drop, two banks of four' },
      ],
    },
    {
      id: 'rot_symmetric', club: 'Rotations', name: 'Symmetric rotation · the shape survives', kits: ['k1', 'red'],
      desc: 'Three players swap jobs and the three zones stay occupied. The full-back comes inside, the winger holds the touchline, the eight pushes beyond them. Nothing about our shape has changed — only who is standing in each part of it. Their markers have to decide whether to follow or to hand over, and that hesitation is the whole point.',
      frames: [
        { home: '433', away: '4141mid', ball: [16, 34], caption: 'Before: full-back wide, winger wide, eight inside' },
        { home: '325', away: '4141mid', ball: [40, 26], caption: 'After: full-back inside, winger holds width, eight higher — same three zones, different three players' },
        { home: '325', away: '442low', ball: [58, 34], caption: 'Because the shape survived, we can keep building as if nothing happened' },
      ],
    },
    {
      id: 'rot_asymmetric', club: 'Rotations', name: 'Asymmetric rotation · break the shape on purpose', kits: ['k1', 'blue'],
      desc: 'This time we do not keep the balance. We deliberately put three players on one side and accept being thin on the other, to make a numbers problem their defence cannot solve locally. It is more dangerous and it costs more if we lose the ball — which is exactly why the rest defence has to be right before we try it.',
      frames: [
        { home: '4231', away: '442', ball: [22, 34], caption: 'Balanced 4-2-3-1 · two and two' },
        { home: '3241', away: '442low', ball: [48, 18], caption: 'Three of ours on the left, one on the right — they cannot cover it with two' },
        { home: '325dz', away: '442low', ball: [70, 22], caption: 'The overload breaks through · note how few of ours are behind the ball' },
        { home: '4222press', away: '235', ball: [52, 40], caption: 'The bill: if we lose it here, the counter comes down the side we emptied' },
      ],
    },
    {
      id: 'youth_231_press', club: 'K1 Shooters', name: 'Youth 7v7 · 2-3-1 press & build', kits: ['k1', 'blue'], pitch: 'seven',
      desc: 'Simple 7-a-side shape. Without the ball the striker and wide players press together; with the ball the wide players get high and the midfielder supports underneath.',
      frames: [
        { home: '7-231', away: '7-231', ball: [30, 18], caption: 'Balanced 2-3-1' },
        { home: '7-222', away: '7-231', ball: [40, 14], caption: 'In possession: wide players high, pairs everywhere' },
      ],
    },
    {
      id: 'youth_9v9_323', club: 'K1 Shooters', name: 'Youth 9v9 · 3-2-3 build-up', kits: ['k1', 'green'], pitch: 'nine',
      desc: 'Back three splits wide, two midfielders offer inside, front three stretch the pitch — simple triangles for young players.',
      frames: [
        { home: '9-323', away: '9-332', ball: [16, 23], caption: 'Goalkeeper in possession — back three split' },
        { home: '9-2321', away: '9-332', ball: [40, 20], caption: 'Progress: two 10s find the pockets' },
      ],
    },
  ];

  K1.MORPHS = MORPHS;
})(window.K1 = window.K1 || {});
