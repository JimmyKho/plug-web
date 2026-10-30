// Headless checks of every scenario's evaluator: correct builds pass, presets report their fault, shorts trip.
import { COMPONENTS, ALL_SCENARIOS } from '../js/scenarios/index.js';
import { runCircuit } from '../js/engine.js';

const W = (a, b, color) => ({ a, b, color });
const run = (compId, wires, toggles = { on: true }) => {
  const r = runCircuit(COMPONENTS[compId], wires, toggles);
  return r.trip ? 'TRIP' : `${r.kind}:${r.title}`;
};
const cases = [];
const expect = (name, got, exp) => cases.push([name, got, exp]);

// every component's walkthrough solution must evaluate OK
for (const c of Object.values(COMPONENTS)) {
  const wires = c.solution.map(({ a, b, color }) => W(a, b, color));
  expect(`solution ${c.id}`, run(c.id, wires, c.id === 'twoway' ? { on: true, b: false } : { on: true }), 'ok');
}
// every pre-faulted scenario must report a fault or warning, not OK
for (const s of ALL_SCENARIOS.filter(s => s.preset)) expect(`preset ${s.id}`, run(s.comp, s.preset), /^(fail|warn)/);
// shorts
expect('L-N short trips', run('socket', [W('SUP_L', 'SK_L', 'L'), W('SUP_N', 'SK_L', 'N')]), 'TRIP');
expect('2-way short in other position trips', run('twoway', [W('SUP_L', 'SA_COM', 'L'), W('SA_L1', 'SB_L1', 'L'), W('SB_COM', 'SUP_N', 'N')], { on: true, b: false }), 'TRIP');
// specific diagnoses
expect('led dc short', run('led', [...COMPONENTS.led.solution, W('LED_P', 'LED_M', 'R')]), 'fail:Driver output shorted');
expect('led wrong colour', run('led', COMPONENTS.led.solution.map(s => s.color === 'R' ? { ...s, color: 'L' } : s)), 'warn');
expect('switch in neutral', run('switch', [W('SUP_L', 'LP_L', 'L'), W('SUP_N', 'SW_COM', 'N'), W('SW_L1', 'LP_N', 'N'), W('SUP_E', 'SW_E', 'E')]), 'fail:Switch in the neutral');
expect('broken ring', run('ring', [W('A_L', 'SK_L', 'L'), W('A_N', 'SK_N', 'N'), W('A_E', 'SK_E', 'E')]), 'fail:Broken ring');

let bad = 0;
for (const [name, got, exp] of cases) {
  const pass = exp instanceof RegExp ? exp.test(got) : got.startsWith(exp);
  if (!pass) bad++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name.padEnd(36)} ${got}`);
}
console.log(bad ? `${bad} FAILURES` : `ALL ${cases.length} PASS`);
process.exit(bad ? 1 : 0);
