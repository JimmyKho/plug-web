// Loop-in ceiling rose with a pendant and a wall switch on a twin-and-earth drop.
import { SUPPLY3 } from '../supply.js';
import { rect, circle, path, text, lampGfx, setLamp } from '../svg.js';
import { lampEval } from '../engine.js';

const OK = { title: 'Correct. Loop-in rose wired with sleeved switch drop.', body: 'Permanent live stays in the loop terminal and never touches the pendant. The switch drop returns on the sleeved core to SW L, neutral goes straight to the pendant, and the rose earth is landed.', points: ['The loop terminal remains live with the switch off. Isolate at the MCB before touching a rose.', 'Sleeve the blue switch-return core brown at both ends.'] };

const W = (a, b, color) => ({ a, b, color });

export default {
  component: {
    id: 'rose', group: 'Lighting', name: 'Loop-in ceiling rose', mcb: 'B6',
    supply: SUPPLY3,
    terminals: [
      { id: 'R_LOOP', x: 450, y: 150, label: 'LOOP', mark: 'LOOP IN', tip: '<b>LOOP IN</b> Permanent live terminal in the rose. Live in, live out to the next rose, and the feed down to the switch all meet here. Stays live with the switch off.' },
      { id: 'R_N',    x: 590, y: 150, label: 'N', tip: '<b>N</b> Rose neutral terminal. Supply neutral in, and the pendant neutral.' },
      { id: 'R_SWL',  x: 520, y: 215, label: 'SW L', tip: '<b>SW L</b> Switched live terminal. The return core from the switch lands here, with the pendant live.' },
      { id: 'R_E',    x: 520, y: 95, label: 'E', tip: '<b>⏚</b> Rose earth terminal. Needed for the circuit CPC even with a plastic rose.' },
      { id: 'LP_L',   x: 490, y: 330, label: 'L', mark: '', tip: '<b>Pendant L</b> Pendant flex live (brown core). Unmarked; identify by core colour. Connect to SW L.' },
      { id: 'LP_N',   x: 550, y: 330, label: 'N', mark: '', tip: '<b>Pendant N</b> Pendant flex neutral (blue core). Connect to the rose N.' },
      { id: 'SW_COM', x: 720, y: 170, label: 'COM', tip: '<b>COM</b> Switch common. Fed from the rose LOOP terminal via the switch drop.' },
      { id: 'SW_L1',  x: 720, y: 250, label: 'L1', tip: '<b>L1</b> Switched live back up to the rose SW L. On a twin cable this is the blue core, so sleeve it brown.' },
    ],
    toggles: [{ key: 'on', label: 'wall switch' }],
    links: (s) => s.on ? [['SW_COM', 'SW_L1']] : [],
    draw(g) {
      circle(g, 520, 160, 100, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', 'stroke-width': 2 });
      circle(g, 520, 160, 84, { fill: 'none', stroke: 'var(--backplate-edge)', 'stroke-dasharray': '3 4' });
      text(g, 520, 46, 'CEILING ROSE · LOOP-IN', 'lbl-strong', 'middle');
      path(g, 'M 520 260 v 40', { stroke: 'var(--fg)', 'stroke-width': 3 });
      rect(g, 470, 300, 100, 56, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
      text(g, 520, 375, 'pendant flex', 'lbl', 'middle');
      lampGfx(g, 520, 418, 26);
      rect(g, 650, 110, 140, 200, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 6 });
      rect(g, 664, 124, 112, 140, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
      text(g, 720, 142, 'WALL SWITCH', 'lbl', 'middle');
      text(g, 720, 292, 'switch drop (twin + E)', 'lbl', 'middle');
      rect(g, 760, 170, 14, 60, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 3 });
      rect(g, 762, 173, 10, 26, { fill: 'var(--fg)', rx: 2 }).id = 'swKnob';
    },
    evaluate: (N) => lampEval(N, { on: 'on', lampL: 'LP_L', lampN: 'LP_N', earth: 'R_E', loads: ['R_LOOP', 'R_N', 'R_SWL', 'LP_L', 'LP_N', 'SW_COM', 'SW_L1'], okText: OK }),
    animate(r, s) { setLamp(r && r.kind === 'ok' && s.on); const k = document.getElementById('swKnob'); if (k) k.setAttribute('y', s.on ? 201 : 173); },
    solution: [
      { ...W('SUP_E', 'R_E', 'E'), why: 'Circuit earth into the rose earth terminal.' },
      { ...W('SUP_L', 'R_LOOP', 'L'), why: 'Supply live into LOOP IN. This terminal stays live whatever the switch does; the pendant never connects here.' },
      { ...W('SUP_N', 'R_N', 'N'), why: 'Supply neutral into N.' },
      { ...W('R_LOOP', 'SW_COM', 'L'), why: 'Brown core of the switch drop: LOOP IN down to COM on the wall switch.' },
      { ...W('SW_L1', 'R_SWL', 'S'), why: 'Blue core of the switch drop comes back from L1 to SW L. It is a live, so sleeve it brown at both ends.' },
      { ...W('R_SWL', 'LP_L', 'L'), why: 'Pendant brown onto SW L, beside the switch return.' },
      { ...W('R_N', 'LP_N', 'N'), why: 'Pendant blue onto N. Fit the strain relief so the flex, not the terminals, carries the lamp weight.' },
    ],
  },
  scenarios: [
    { id: 'l3', group: 'Lighting', type: 'build', title: 'Loop-in ceiling rose', brief: 'Classic loop-in. Supply L to LOOP, drop to the switch, sleeved return to SW L, pendant on SW L and N. Pass: lamp switched, loop stays live, colours compliant.' },
    { id: 'l4', group: 'Lighting', type: 'fault', title: '"Pendant live even with the switch off"', brief: 'The pendant was moved to the wrong rose terminal during a lampshade change. Pass: pendant dead when off.',
      preset: [W('SUP_L', 'R_LOOP', 'L'), W('R_LOOP', 'SW_COM', 'L'), W('SW_L1', 'R_SWL', 'S'), W('R_LOOP', 'LP_L', 'L'), W('SUP_N', 'R_N', 'N'), W('R_N', 'LP_N', 'N'), W('SUP_E', 'R_E', 'E')] },
  ],
};
