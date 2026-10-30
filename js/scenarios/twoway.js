// 2-way staircase lighting: two switches with COM / L1 / L2 and strappers.
import { SUPPLY3 } from '../supply.js';
import { rect, text, lampGfx, setLamp, switchPlate, setKnob } from '../svg.js';
import { ok, fail, inc, powered } from '../engine.js';
import { TXT } from '../copy.js';

const OK = { title: 'Correct. Lamp toggles from either switch.', body: 'Permanent live on COM of switch A, strappers L1 to L1 and L2 to L2, switched live from COM of switch B to the lamp. Every flip of either switch changes the lamp state.', points: ['Strappers carry live in both directions; sleeve any blue strapper brown.', 'Swapping L1 and L2 at one end still works. Leaving one strapper out does not.'] };
const ONE_SWITCH = { title: 'Lamp controlled from one switch only.', body: 'One switch toggles the lamp; the other has no effect in at least one position. This is a 2-way circuit wired as 1-way, usually because a strapper is missing or a COM terminal is wrong.', points: ['Each switch needs COM plus both L1 and L2 strappers to the other switch.', 'Test all four switch combinations before closing up.'] };

const W = (a, b, color) => ({ a, b, color });
let kA, kB;

export default {
  component: {
    id: 'twoway', group: 'Lighting', name: '2-way staircase', mcb: 'B6',
    supply: SUPPLY3,
    terminals: [
      { id: 'SA_COM', x: 430, y: 140, label: 'COM', tip: '<b>Switch A · COM</b> Common of the first switch. Permanent live lands here.' },
      { id: 'SA_L1',  x: 430, y: 210, label: 'L1', tip: '<b>Switch A · L1</b> Strapper terminal. Connect to L1 of switch B.' },
      { id: 'SA_L2',  x: 430, y: 280, label: 'L2', tip: '<b>Switch A · L2</b> Strapper terminal. Connect to L2 of switch B.' },
      { id: 'SW_E',   x: 510, y: 310, label: 'E', tip: '<b>⏚</b> Earth terminal on the metal backbox of switch A.' },
      { id: 'SB_COM', x: 600, y: 140, label: 'COM', tip: '<b>Switch B · COM</b> Common of the second switch. The switched live to the lamp leaves from here.' },
      { id: 'SB_L1',  x: 600, y: 210, label: 'L1', tip: '<b>Switch B · L1</b> Strapper terminal from A L1.' },
      { id: 'SB_L2',  x: 600, y: 280, label: 'L2', tip: '<b>Switch B · L2</b> Strapper terminal from A L2.' },
      { id: 'LOOP',   x: 460, y: 422, label: 'LOOP / N', mark: '', tip: '<b>Loop / Neutral connector</b> Unmarked insulated block where the lamp neutral meets the supply neutral.' },
      { id: 'LP_L',   x: 660, y: 425, label: 'L', mark: '', tip: '<b>Lamp L</b> Lampholder live. Fed from COM of switch B.' },
      { id: 'LP_N',   x: 740, y: 425, label: 'N', mark: '', tip: '<b>Lamp N</b> Lampholder neutral. Returns via the loop connector.' },
    ],
    toggles: [{ key: 'on', label: 'switch A (downstairs)' }, { key: 'b', label: 'switch B (upstairs)' }],
    links: (s) => [['SA_COM', s.on ? 'SA_L1' : 'SA_L2'], ['SB_COM', s.b ? 'SB_L1' : 'SB_L2']],
    draw(g) {
      kA = switchPlate(g, 390, 90, 150, 250, 'SWITCH A · downstairs', 'knobA');
      kB = switchPlate(g, 560, 90, 150, 250, 'SWITCH B · upstairs', 'knobB');
      rect(g, 400, 400, 120, 44, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 4 });
      text(g, 460, 458, 'connector block', 'lbl', 'middle');
      rect(g, 620, 350, 160, 110, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
      text(g, 700, 372, 'landing light', 'lbl', 'middle');
      lampGfx(g, 740, 100, 26);
    },
    evaluate(N) {
      const combos = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => ({ a, b, n: N({ on: !!a, b: !!b }) }));
      const litAt = (a, b) => powered(combos.find(x => x.a === a && x.b === b).n, 'LP_L', 'LP_N');
      if (combos.some(c => ['SA_COM', 'SA_L1', 'SA_L2', 'SB_COM', 'LP_L', 'LP_N', 'LOOP'].some(t => c.n(t).has('E')))) return fail(TXT.earthAsConductor);
      if (!combos.some(c => powered(c.n, 'LP_L', 'LP_N'))) return inc();
      if (combos.every(c => powered(c.n, 'LP_L', 'LP_N'))) return fail(TXT.bypassed);
      if (combos.some(c => !powered(c.n, 'LP_L', 'LP_N') && c.n('LP_L').has('L'))) return fail(TXT.switchedNeutral);
      const aWorks = litAt(0, 0) !== litAt(1, 0) && litAt(0, 1) !== litAt(1, 1);
      const bWorks = litAt(0, 0) !== litAt(0, 1) && litAt(1, 0) !== litAt(1, 1);
      if (aWorks && bWorks) return combos[0].n('SW_E').has('E') ? ok(OK) : fail(TXT.noEarth);
      if (aWorks || bWorks) return fail(ONE_SWITCH);
      return inc();
    },
    animate(r, s) {
      setLamp(r && r.kind === 'ok' && (s.on !== s.b));
      setKnob('knobA', s.on, kA.knobUp, kA.knobDown);
      setKnob('knobB', s.b, kB.knobUp, kB.knobDown);
    },
    solution: [
      { ...W('SUP_E', 'SW_E', 'E'), why: 'Earth the backbox. In a real job both boxes are earthed through the cable CPCs.' },
      { ...W('SUP_L', 'SA_COM', 'L'), why: 'Permanent live to COM of switch A only. Never to L1 or L2.' },
      { ...W('SA_L1', 'SB_L1', 'L'), why: 'First strapper: L1 to L1. Strappers carry live in either direction, so they are brown or sleeved brown.' },
      { ...W('SA_L2', 'SB_L2', 'L'), why: 'Second strapper: L2 to L2. Crossing them still works; omitting one leaves one switch dead.' },
      { ...W('SB_COM', 'LP_L', 'L'), why: 'Switched live leaves from COM of switch B to the lampholder.' },
      { ...W('LP_N', 'LOOP', 'N'), why: 'Lamp neutral into the connector block.' },
      { ...W('LOOP', 'SUP_N', 'N'), why: 'Supply neutral into the same block. Now test all four switch positions.' },
    ],
  },
  scenarios: [
    { id: 'l1', group: 'Lighting', type: 'build', title: 'Staircase 2-way lighting', brief: 'One landing light, two switches. Live to COM of A, strappers L1/L2 across, COM of B to the lamp. Pass: either switch toggles the lamp in every position.' },
    { id: 'l2', group: 'Lighting', type: 'fault', title: '"Upstairs switch is dead"', brief: 'Downstairs switch works, upstairs does nothing. Pass: both switches control the lamp.',
      preset: [W('SUP_L', 'SA_COM', 'L'), W('SA_L1', 'LP_L', 'L'), W('LP_N', 'LOOP', 'N'), W('LOOP', 'SUP_N', 'N'), W('SUP_E', 'SW_E', 'E')] },
  ],
};
