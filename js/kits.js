/* K1 Shooters Tactics Board — team kit presets (token colours) */
(function (K1) {
  'use strict';

  // pattern: solid | halves | stripes | hoops | sash
  const KITS = [
    { id: 'k1', name: 'K1 Shooters', primary: '#131c21', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#f5b301', gkNumber: '#131c21', club: true },
    { id: 'k1alt', name: 'K1 Shooters (away)', primary: '#ffffff', secondary: '#131c21', pattern: 'solid', number: '#131c21', gk: '#f5b301', gkNumber: '#131c21', club: true },
    { id: 'barcelona', name: 'Barcelona', primary: '#a50044', secondary: '#004d98', pattern: 'halves', number: '#edbb00', gk: '#3fbf5f', gkNumber: '#0b1116', club: true },
    { id: 'mancity', name: 'Man City', primary: '#6cabdd', secondary: '#1c2c5b', pattern: 'solid', number: '#ffffff', gk: '#f2c025', gkNumber: '#0b1116', club: true },
    { id: 'realmadrid', name: 'Real Madrid', primary: '#ffffff', secondary: '#febe10', pattern: 'solid', number: '#1c1c1c', gk: '#2f6f3e', gkNumber: '#ffffff', club: true },
    { id: 'pirates', name: 'Orlando Pirates', primary: '#0b0b0b', secondary: '#ffffff', pattern: 'stripes', number: '#ffffff', gk: '#ffd400', gkNumber: '#0b0b0b', club: true },
    { id: 'red', name: 'Red', primary: '#e11d2e', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#2dd4bf', gkNumber: '#0b1116' },
    { id: 'blue', name: 'Blue', primary: '#1d4ed8', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#facc15', gkNumber: '#0b1116' },
    { id: 'yellow', name: 'Yellow', primary: '#facc15', secondary: '#0b1116', pattern: 'solid', number: '#0b1116', gk: '#22c55e', gkNumber: '#0b1116' },
    { id: 'green', name: 'Green', primary: '#16a34a', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#f97316', gkNumber: '#0b1116' },
    { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#0b1116', pattern: 'solid', number: '#ffffff', gk: '#3b82f6', gkNumber: '#ffffff' },
    { id: 'purple', name: 'Purple', primary: '#7c3aed', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#facc15', gkNumber: '#0b1116' },
    { id: 'sky', name: 'Sky', primary: '#38bdf8', secondary: '#ffffff', pattern: 'solid', number: '#0b1116', gk: '#f43f5e', gkNumber: '#ffffff' },
    { id: 'pink', name: 'Pink', primary: '#ec4899', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#0ea5e9', gkNumber: '#ffffff' },
    { id: 'white', name: 'White', primary: '#ffffff', secondary: '#0b1116', pattern: 'solid', number: '#0b1116', gk: '#f97316', gkNumber: '#0b1116' },
    { id: 'black', name: 'Black', primary: '#111827', secondary: '#ffffff', pattern: 'solid', number: '#ffffff', gk: '#facc15', gkNumber: '#0b1116' },
    { id: 'hoops', name: 'Green & white hoops', primary: '#16a34a', secondary: '#ffffff', pattern: 'hoops', number: '#0b1116', gk: '#facc15', gkNumber: '#0b1116' },
    { id: 'sash', name: 'Red sash', primary: '#ffffff', secondary: '#e11d2e', pattern: 'sash', number: '#0b1116', gk: '#1d4ed8', gkNumber: '#ffffff' },
  ];

  const byId = {};
  KITS.forEach(k => { byId[k.id] = k; });

  // Generic palette for drawings, cones, shapes, text
  const PALETTE = [
    '#ffffff', '#f5b301', '#e11d2e', '#1d4ed8', '#111827', '#22c55e', '#f97316', '#38bdf8', '#ec4899', '#a855f7', '#facc15', '#14b8a6'
  ];

  // Cone / equipment colours
  const CONE_COLORS = ['#f97316', '#facc15', '#ffffff', '#1d4ed8', '#e11d2e', '#22c55e', '#111827'];

  K1.KITS = KITS;
  K1.kitById = id => byId[id] || byId.k1;
  K1.PALETTE = PALETTE;
  K1.CONE_COLORS = CONE_COLORS;
})(window.K1 = window.K1 || {});
