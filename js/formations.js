/* K1 Shooters Tactics Board — formations library
 * Coordinates are normalised: x = 0 own goal line → 1 opponent goal line, y = 0 → 1 across the width
 * (team attacking to the right; the right back sits at high y). Away teams are mirrored automatically. */
(function (K1) {
  'use strict';

  const S = (p, n, x, y) => ({ p, n, x, y });
  const back4 = [S('RB', 2, .26, .86), S('RCB', 4, .21, .63), S('LCB', 5, .21, .37), S('LB', 3, .26, .14)];
  const back3 = [S('RCB', 4, .22, .72), S('CB', 5, .19, .5), S('LCB', 3, .22, .28)];
  const back5 = [S('RWB', 2, .3, .92), S('RCB', 4, .21, .7), S('CB', 5, .18, .5), S('LCB', 6, .21, .3), S('LWB', 3, .3, .08)];
  const GK = S('GK', 1, .06, .5);

  const ELEVEN = [
    { id: '433', name: '4-3-3', tags: ['Barcelona', 'Man City', 'Real Madrid'], desc: 'One pivot, two eights, wingers wide and high. The positional-play classic.',
      slots: [GK, ...back4, S('CDM', 6, .40, .5), S('RCM', 8, .52, .68), S('LCM', 10, .52, .32), S('RW', 7, .74, .86), S('ST', 9, .80, .5), S('LW', 11, .74, .14)] },
    { id: '433f9', name: '4-3-3 false 9', tags: ['Barcelona'], desc: 'Striker drops into midfield, wingers attack the space behind the centre-backs.',
      slots: [GK, ...back4, S('CDM', 6, .40, .5), S('RCM', 8, .53, .68), S('LCM', 10, .53, .32), S('RW', 7, .79, .88), S('CF', 9, .68, .5), S('LW', 11, .79, .12)] },
    { id: '4231', name: '4-2-3-1', tags: ['Orlando Pirates'], desc: 'Double pivot for security, a free 10 between the lines, wide 7 and 11.',
      slots: [GK, ...back4, S('RDM', 6, .42, .61), S('LDM', 8, .42, .39), S('RAM', 7, .63, .83), S('CAM', 10, .63, .5), S('LAM', 11, .63, .17), S('ST', 9, .80, .5)] },
    { id: '442', name: '4-4-2', tags: ['Classic'], desc: 'Two flat banks of four, two strikers. Simple to coach, hard to break down.',
      slots: [GK, ...back4, S('RM', 7, .52, .87), S('RCM', 8, .46, .61), S('LCM', 6, .46, .39), S('LM', 11, .52, .13), S('RS', 9, .77, .61), S('LS', 10, .77, .39)] },
    { id: '442d', name: '4-4-2 diamond', tags: ['Classic'], desc: 'A 6 behind, a 10 in front, two 8s either side — overloads the centre.',
      slots: [GK, ...back4, S('CDM', 6, .40, .5), S('RCM', 8, .50, .70), S('LCM', 11, .50, .30), S('CAM', 10, .62, .5), S('RS', 9, .78, .6), S('LS', 7, .78, .4)] },
    { id: '4141', name: '4-1-4-1', tags: ['Man City'], desc: 'Holding midfielder screens, four ahead press together, lone striker leads.',
      slots: [GK, ...back4, S('CDM', 6, .38, .5), S('RM', 7, .56, .87), S('RCM', 8, .53, .63), S('LCM', 10, .53, .37), S('LM', 11, .56, .13), S('ST', 9, .79, .5)] },
    { id: '451', name: '4-5-1', tags: ['Defensive'], desc: 'Five across midfield to congest the centre; counter through the lone striker.',
      slots: [GK, ...back4, S('RM', 7, .52, .90), S('RCM', 8, .49, .67), S('CM', 6, .45, .5), S('LCM', 10, .49, .33), S('LM', 11, .52, .10), S('ST', 9, .78, .5)] },
    { id: '352', name: '3-5-2', tags: ['Wing-backs'], desc: 'Three centre-backs, wing-backs provide width, two strikers combine.',
      slots: [GK, ...back3, S('RWB', 2, .47, .92), S('RCM', 8, .46, .66), S('CDM', 6, .39, .5), S('LCM', 10, .46, .34), S('LWB', 11, .47, .08), S('RS', 9, .77, .6), S('LS', 7, .77, .4)] },
    { id: '343', name: '3-4-3', tags: ['Attacking'], desc: 'Back three, midfield four with wing-backs, aggressive front three.',
      slots: [GK, ...back3, S('RWB', 2, .47, .90), S('RCM', 8, .43, .61), S('LCM', 6, .43, .39), S('LWB', 11, .47, .10), S('RW', 7, .72, .80), S('ST', 9, .80, .5), S('LW', 10, .72, .20)] },
    { id: '3421', name: '3-4-2-1', tags: ['Attacking'], desc: 'Two number 10s float behind the striker; wing-backs give the width.',
      slots: [GK, ...back3, S('RWB', 2, .47, .90), S('RCM', 8, .43, .61), S('LCM', 6, .43, .39), S('LWB', 11, .47, .10), S('RAM', 7, .64, .67), S('LAM', 10, .64, .33), S('ST', 9, .80, .5)] },
    { id: '532', name: '5-3-2', tags: ['Defensive'], desc: 'Five at the back, compact three in midfield, two to counter.',
      slots: [GK, ...back5, S('RCM', 8, .46, .69), S('CM', 10, .43, .5), S('LCM', 11, .46, .31), S('RS', 9, .74, .61), S('LS', 7, .74, .39)] },
    { id: '541', name: '5-4-1', tags: ['Defensive'], desc: 'Ultra-compact low block; protect the box, hit long to the striker.',
      slots: [GK, ...back5, S('RM', 7, .50, .87), S('RCM', 8, .46, .63), S('LCM', 10, .46, .37), S('LM', 11, .50, .13), S('ST', 9, .77, .5)] },
    { id: '4222', name: '4-2-2-2', tags: ['Box midfield'], desc: 'A box in midfield: two 6s, two 10s inside, two strikers.',
      slots: [GK, ...back4, S('RDM', 6, .41, .61), S('LDM', 8, .41, .39), S('RAM', 7, .62, .72), S('LAM', 10, .62, .28), S('RS', 9, .80, .6), S('LS', 11, .80, .4)] },
    { id: '4312', name: '4-3-1-2', tags: ['Narrow'], desc: 'Narrow shape, a 10 behind two strikers; full-backs give the width.',
      slots: [GK, ...back4, S('RCM', 8, .43, .71), S('CM', 6, .39, .5), S('LCM', 11, .43, .29), S('CAM', 10, .60, .5), S('RS', 9, .78, .62), S('LS', 7, .78, .38)] },
    { id: '3241', name: '3-2-4-1', tags: ['Man City'], desc: 'Three at the back, two pivots, four attackers behind a 9 — the modern box build.',
      slots: [GK, S('RCB', 2, .23, .74), S('CB', 5, .20, .5), S('LCB', 3, .23, .26), S('RDM', 4, .41, .61), S('LDM', 6, .41, .39), S('RW', 7, .66, .92), S('RAM', 8, .63, .63), S('LAM', 10, .63, .37), S('LW', 11, .66, .08), S('ST', 9, .82, .5)] },
    { id: '235', name: '2-3-5 (in possession)', tags: ['Barcelona'], desc: 'Full-backs step into midfield, five attackers occupy the five lanes.',
      slots: [S('GK', 1, .08, .5), S('RCB', 4, .30, .65), S('LCB', 5, .30, .35), S('RDM', 2, .50, .74), S('CDM', 6, .46, .5), S('LDM', 3, .50, .26), S('RW', 7, .76, .93), S('RAM', 8, .72, .68), S('ST', 9, .82, .5), S('LAM', 10, .72, .32), S('LW', 11, .76, .07)] },
    { id: '325', name: '3-2-5 (in possession)', tags: ['Man City'], desc: 'Three build, two pivots protect, five attack — every lane covered.',
      slots: [S('GK', 1, .08, .5), S('RCB', 2, .30, .72), S('CB', 5, .28, .5), S('LCB', 3, .30, .28), S('RDM', 4, .50, .63), S('LDM', 6, .50, .37), S('RW', 7, .76, .93), S('RAM', 8, .73, .68), S('ST', 9, .83, .5), S('LAM', 10, .73, .32), S('LW', 11, .76, .07)] },
    { id: '4141mid', name: '4-1-4-1 mid block', tags: ['Out of possession'], desc: 'Compact between the lines; distances between units under 12 metres.',
      slots: [S('GK', 1, .08, .5), S('RB', 2, .32, .80), S('RCB', 4, .28, .60), S('LCB', 5, .28, .40), S('LB', 3, .32, .20), S('CDM', 6, .40, .5), S('RM', 7, .50, .78), S('RCM', 8, .47, .60), S('LCM', 10, .47, .40), S('LM', 11, .50, .22), S('ST', 9, .60, .5)] },
    { id: '433press', name: '4-3-3 high press', tags: ['Out of possession', 'Barcelona'], desc: 'Front three press the back line, midfield jumps, defensive line at halfway.',
      slots: [S('GK', 1, .25, .5), S('RB', 2, .50, .85), S('RCB', 4, .46, .62), S('LCB', 5, .46, .38), S('LB', 3, .50, .15), S('CDM', 6, .58, .5), S('RCM', 8, .68, .68), S('LCM', 10, .68, .32), S('RW', 7, .82, .82), S('ST', 9, .86, .5), S('LW', 11, .82, .18)] },
    { id: '442low', name: '4-4-2 low block', tags: ['Out of possession', 'Real Madrid'], desc: 'Two banks of four deep in own half; wingers tuck in, strikers screen the pivot.',
      slots: [S('GK', 1, .05, .5), S('RB', 2, .20, .80), S('RCB', 4, .16, .60), S('LCB', 5, .16, .40), S('LB', 3, .20, .20), S('RM', 7, .32, .80), S('RCM', 8, .30, .60), S('LCM', 6, .30, .40), S('LM', 11, .32, .20), S('RS', 9, .45, .58), S('LS', 10, .45, .42)] },
  ];

  const NINE = [
    { id: '9-323', name: '3-2-3', desc: 'Balanced youth shape — width from wingers, triangles everywhere.',
      slots: [S('GK', 1, .08, .5), S('RB', 2, .28, .80), S('CB', 5, .24, .5), S('LB', 3, .28, .20), S('RCM', 8, .50, .66), S('LCM', 6, .50, .34), S('RW', 7, .72, .82), S('ST', 9, .78, .5), S('LW', 11, .72, .18)] },
    { id: '9-332', name: '3-3-2', desc: 'Three in midfield for control, two strikers to combine.',
      slots: [S('GK', 1, .08, .5), S('RB', 2, .28, .80), S('CB', 5, .24, .5), S('LB', 3, .28, .20), S('RM', 7, .52, .82), S('CM', 6, .48, .5), S('LM', 11, .52, .18), S('RS', 9, .76, .62), S('LS', 10, .76, .38)] },
    { id: '9-2321', name: '2-3-2-1', desc: 'Two centre-backs, a midfield three, two 10s and a striker.',
      slots: [S('GK', 1, .08, .5), S('RCB', 4, .26, .66), S('LCB', 5, .26, .34), S('RM', 7, .46, .84), S('CM', 6, .44, .5), S('LM', 11, .46, .16), S('RAM', 8, .62, .64), S('LAM', 10, .62, .36), S('ST', 9, .80, .5)] },
    { id: '9-341', name: '3-4-1', desc: 'Solid back three and a flat four; lone striker.',
      slots: [S('GK', 1, .08, .5), S('RB', 2, .28, .80), S('CB', 5, .24, .5), S('LB', 3, .28, .20), S('RM', 7, .50, .86), S('RCM', 8, .48, .62), S('LCM', 6, .48, .38), S('LM', 11, .50, .14), S('ST', 9, .78, .5)] },
  ];

  const SEVEN = [
    { id: '7-231', name: '2-3-1', desc: 'The classic 7-a-side shape: two defenders, a midfield three, one striker.',
      slots: [S('GK', 1, .09, .5), S('RCB', 4, .30, .66), S('LCB', 5, .30, .34), S('RM', 7, .56, .84), S('CM', 6, .50, .5), S('LM', 11, .56, .16), S('ST', 9, .79, .5)] },
    { id: '7-321', name: '3-2-1', desc: 'Back three for security, two midfielders, a striker.',
      slots: [S('GK', 1, .09, .5), S('RB', 2, .30, .80), S('CB', 5, .26, .5), S('LB', 3, .30, .20), S('RCM', 8, .55, .66), S('LCM', 6, .55, .34), S('ST', 9, .79, .5)] },
    { id: '7-312', name: '3-1-2', desc: 'Back three, a single pivot, two strikers.',
      slots: [S('GK', 1, .09, .5), S('RB', 2, .30, .80), S('CB', 5, .26, .5), S('LB', 3, .30, .20), S('CM', 6, .50, .5), S('RS', 9, .76, .64), S('LS', 10, .76, .36)] },
    { id: '7-222', name: '2-2-2', desc: 'Pairs everywhere — great for teaching partnerships.',
      slots: [S('GK', 1, .09, .5), S('RB', 2, .30, .70), S('LB', 3, .30, .30), S('RM', 7, .54, .72), S('LM', 11, .54, .28), S('RS', 9, .78, .62), S('LS', 10, .78, .38)] },
    { id: '7-2121', name: '2-1-2-1', desc: 'Diamond midfield: a 6, two 10s, and a 9.',
      slots: [S('GK', 1, .09, .5), S('RCB', 4, .30, .66), S('LCB', 5, .30, .34), S('CM', 6, .46, .5), S('RAM', 8, .62, .70), S('LAM', 10, .62, .30), S('ST', 9, .80, .5)] },
  ];

  const FIVE = [
    { id: '5-121', name: '1-2-1 (diamond)', desc: 'The futsal diamond: fixo, two alas, pivot.',
      slots: [S('GK', 1, .10, .5), S('D', 4, .32, .5), S('RW', 7, .56, .78), S('LW', 11, .56, .22), S('P', 9, .80, .5)] },
    { id: '5-22', name: '2-2 (square)', desc: 'Two defenders, two attackers; rotate in pairs.',
      slots: [S('GK', 1, .10, .5), S('RD', 4, .32, .68), S('LD', 5, .32, .32), S('RF', 7, .70, .70), S('LF', 9, .70, .30)] },
    { id: '5-31', name: '3-1', desc: 'Three across the back, one pivot to hold the ball.',
      slots: [S('GK', 1, .10, .5), S('RD', 2, .34, .76), S('D', 4, .28, .5), S('LD', 3, .34, .24), S('P', 9, .76, .5)] },
    { id: '5-211', name: '2-1-1', desc: 'Two at the back, a link player, a pivot.',
      slots: [S('GK', 1, .10, .5), S('RD', 4, .30, .66), S('LD', 5, .30, .34), S('CM', 6, .56, .5), S('P', 9, .80, .5)] },
    { id: '5-13', name: '1-3 (attack)', desc: 'One defender, three attacking — for chasing a game.',
      slots: [S('GK', 1, .10, .5), S('D', 4, .30, .5), S('RW', 7, .68, .80), S('P', 9, .72, .5), S('LW', 11, .68, .20)] },
  ];

  // 4v4 mini football (no goalkeepers) for the youngest age groups
  const FOUR = [
    { id: '4-121', name: '1-2-1 (diamond)', desc: 'One back, two wide, one front — every child gets the ball in every zone.',
      slots: [S('D', 2, .28, .5), S('LM', 3, .55, .22), S('RM', 4, .55, .78), S('F', 5, .8, .5)] },
    { id: '4-22', name: '2-2 (box)', desc: 'Two defenders, two attackers — simple pairs, lots of 1v1s.',
      slots: [S('LD', 2, .3, .32), S('RD', 3, .3, .68), S('LF', 4, .72, .32), S('RF', 5, .72, .68)] },
    { id: '4-112', name: '1-1-2', desc: 'Sweeper, link player, two strikers — attack-minded.',
      slots: [S('D', 2, .26, .5), S('M', 3, .52, .5), S('LF', 4, .78, .3), S('RF', 5, .78, .7)] },
    { id: '4-31', name: '3-1', desc: 'Three across the back, one striker — good for learning to defend as a line.',
      slots: [S('LD', 2, .32, .25), S('CD', 3, .28, .5), S('RD', 4, .32, .75), S('F', 5, .76, .5)] },
  ];

  const FORMATIONS = { 11: ELEVEN, 9: NINE, 7: SEVEN, 5: FIVE, 4: FOUR };
  const ALL = {};
  Object.values(FORMATIONS).forEach(list => list.forEach(f => { ALL[f.id] = f; }));

  const ROLE_OF = {
    GK: 'GK',
    RB: 'DEF', LB: 'DEF', RCB: 'DEF', LCB: 'DEF', CB: 'DEF', RWB: 'DEF', LWB: 'DEF', D: 'DEF', RD: 'DEF', LD: 'DEF', CD: 'DEF',
    CDM: 'MID', CM: 'MID', RCM: 'MID', LCM: 'MID', RDM: 'MID', LDM: 'MID', CAM: 'MID', RM: 'MID', LM: 'MID', RAM: 'MID', LAM: 'MID', M: 'MID',
    ST: 'FWD', CF: 'FWD', RW: 'FWD', LW: 'FWD', RS: 'FWD', LS: 'FWD', P: 'FWD', RF: 'FWD', LF: 'FWD', F: 'FWD',
  };

  K1.FORMATIONS = FORMATIONS;
  K1.formationById = id => ALL[id];
  K1.roleOf = p => ROLE_OF[p] || 'MID';
  K1.formationsFor = players => FORMATIONS[players] || FORMATIONS[11];
})(window.K1 = window.K1 || {});
