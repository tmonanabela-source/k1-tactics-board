/* K1 Shooters — runtime load check.
 * `node --check` only catches SYNTAX. An authored file that uses an undeclared constant
 * (e.g. `color: RED` with no `const RED`) parses fine and then throws at load time in the
 * browser, so the whole file silently registers NOTHING — the drills library dropped from
 * 29 to 13 that way once. This executes each data file against a stub and reports counts.
 * Run: node tools/check.js
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');

const FILES = [
  'js/icons.js', 'js/logo-data.js', 'js/logo.js', 'js/kits.js', 'js/formations.js', 'js/pitch.js',
  'js/state.js', 'js/setpieces.js', 'js/drills.js', 'js/drills-k1.js', 'js/tactics.js', 'js/phases.js',
  'js/curriculum.js', 'js/masterclass.js', 'js/masterclass-content.js', 'js/masterclass-clubs.js', 'js/masterclass-core.js',
];

const noop = () => {};
const el = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  appendChild: noop, removeChild: noop, remove: noop, setAttribute: noop, getAttribute: () => null,
  addEventListener: noop, removeEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
  insertAdjacentHTML: noop, innerHTML: '', textContent: '' });

const sandbox = {
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, Promise, Map, Set, RegExp, Error,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame: noop,
  addEventListener: noop, removeEventListener: noop, matchMedia: () => ({ matches: false, addListener: noop, addEventListener: noop }),
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop, key: () => null, length: 0 },
  navigator: { userAgent: 'node', clipboard: {}, serviceWorker: { register: () => Promise.resolve() } },
  location: { href: '', search: '', origin: '' },
  document: Object.assign(el(), { createElement: el, createElementNS: el, body: el(), head: el(), documentElement: el() }),
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

let fail = 0;
for (const f of FILES) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.log('MISSING FILE  ' + f); fail++; continue; }
  try { vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: f }); }
  catch (e) { console.log('RUNTIME FAIL  ' + f + '\n              ' + e.constructor.name + ': ' + e.message); fail++; }
}

const K = sandbox.window.K1 || {};
const MC = K.Masterclass ? K.Masterclass.list() : [];
const slides = MC.reduce((n, m) => n + m.slides.length, 0);
const counts = {
  formations: K.FORMATIONS ? Object.values(K.FORMATIONS).reduce((n, a) => n + a.length, 0) : 0,
  drills: (K.DRILLS || []).length,
  setpieces: (K.SETPIECES || []).length,
  morphs: (K.MORPHS || []).length,
  phases: (K.PHASES || []).length,
  masterclasses: MC.length,
  slides,
  boards: MC.reduce((n, m) => n + m.slides.filter(s => s.board).length, 0),
  curriculumWeeks: K.Curriculum ? K.Curriculum.weeks().length : 0,
};
console.log('\n--- registered ---');
Object.entries(counts).forEach(([k, v]) => console.log('  ' + k.padEnd(15) + v));

/* Every masterclass board spec must resolve to something that exists. */
const bad = [];
MC.forEach(m => m.slides.forEach((s, i) => {
  const b = s.board; if (!b) return;
  const miss = b.phase && !(K.PHASES || []).some(x => x.id === b.phase) ? 'phase:' + b.phase
    : b.morph && !(K.MORPHS || []).some(x => x.id === b.morph) ? 'morph:' + b.morph
    : b.drill && !(K.DRILLS || []).some(x => x.id === b.drill) ? 'drill:' + b.drill
    : b.setpiece && !(K.SETPIECES || []).some(x => x.id === b.setpiece) ? 'setpiece:' + b.setpiece
    : b.formation && !K.formationById(b.formation) ? 'formation:' + b.formation
    : (b.away && !K.formationById(b.away)) ? 'formation:' + b.away : null;
  if (miss) bad.push(m.id + ' #' + (i + 1) + ' → ' + miss);
}));
MC.forEach(m => (m.sessionIds || []).forEach(id => {
  if (!(K.DRILLS || []).some(d => d.id === id)) bad.push(m.id + ' sessionIds → drill:' + id);
}));
/* Every week of the season plan must point at a real masterclass and real drills. */
(K.Curriculum ? K.Curriculum.weeks() : []).forEach(w => {
  if (w.mc && !MC.some(m => m.id === w.mc)) bad.push('curriculum week ' + w.n + ' -> masterclass:' + w.mc);
  (w.drills || []).forEach(id => { if (!(K.DRILLS || []).some(d => d.id === id)) bad.push('curriculum week ' + w.n + ' -> drill:' + id); });
});

if (bad.length) { console.log('\n--- DANGLING REFERENCES (' + bad.length + ') ---'); bad.forEach(b => console.log('  ' + b)); }
else console.log('\n  all board and session references resolve');

console.log('\nfailures: ' + (fail + bad.length));
process.exit(fail + bad.length ? 1 : 0);
