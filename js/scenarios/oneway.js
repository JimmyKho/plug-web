// 1-way lighting switch with a loop (neutral) connector and a BC lampholder.
import { SUPPLY3 } from '../supply.js';
import { rect, text, path, lampGfx, setLamp, switchPlate, setKnob } from '../svg.js';
import { lampEval } from '../engine.js';

const OK = { title: 'Correct. Lamp lights only when switched.', body: 'Permanent live goes to COM, switched live from L1 feeds the lampholder, neutrals are joined in the loop connector, and the metal backbox is earthed.', points: ['If a blue core is used as the switched live, sleeve both ends brown.', 'Keep the loop connector insulated and inside the backbox.'] };

const W = (a, b, color) => ({ a, b, color });
let knob;

export default {
  component: {
    id: 'switch', group: 'Basics', name: '1-way switch', mcb: 'B6',
    supply: SUPPLY3,
    terminals: [
      { id: 'SW_COM', x: 470, y: 160, label: 'COM', tip: '<b>COM</b> Common. The permanent live from the supply lands here. The rocker connects COM to L1.' },
      { id: 'SW_L1',  x: 470, y: 240, label: 'L1', tip: '<b>L1</b> Switched live. Feeds the lamp only when the switch is on. Brown, or blue sleeved brown.' },
      { id: 'SW_E',   x: 470, y: 330, label: 'E', tip: '<b>⏚</b> Earth terminal on the metal backbox. Required even for a plastic switch plate.' },
      { id: 'LOOP',   x: 560, y: 420, label: 'LOOP / N', mark: '', tip: '<b>Loop / Neutral connector</b> An unmarked insulated terminal block inside the backbox. Neutrals are joined here; a 1-way switch has no neutral terminal of its own.' },
      { id: 'LP_L',   x: 660, y: 300, label: 'L', mark: '', tip: '<b>Lamp L</b> Lampholder live (centre contact). Lampholders are rarely marked; identify by position. Must come from L1, never directly from the supply.' },
      { id: 'LP_N',   x: 740, y: 300, label: 'N', mark: '', tip: '<b>Lamp N</b> Lampholder neutral (screw shell). Returns via the loop connector to the supply neutral.' },
    ],
    toggles: [{ key: 'on', label: 'light switch' }],
    links: (s) => s.on ? [['SW_COM', 'SW_L1']] : [],
    draw(g) {
      knob = switchPlate(g, 400, 90, 190, 290, 'REAR · 1-WAY SWITCH', 'swKnob');
      text(g, 495, 362, 'metal backbox (earthed)', 'lbl', 'middle');
      rect(g, 500, 400, 120, 44, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 4 });
      text(g, 560, 458, 'insulated connector block', 'lbl', 'middle');
      rect(g, 630, 240, 140, 90, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
      text(g, 700, 262, 'BC lampholder', 'lbl', 'middle');
      lampGfx(g, 700, 150, 38);
      path(g, 'M 700 212 v 28', { stroke: 'var(--box-edge)', 'stroke-width': 2 });
    },
    evaluate: (N) => lampEval(N, { on: 'on', lampL: 'LP_L', lampN: 'LP_N', earth: 'SW_E', loads: ['SW_COM', 'SW_L1', 'LP_L', 'LP_N', 'LOOP'], okText: OK }),
    animate(r, s) { setLamp(r && r.kind === 'ok' && s.on); setKnob('swKnob', s.on, knob.knobUp, knob.knobDown); },
    solution: [
      { ...W('SUP_E', 'SW_E', 'E'), why: 'Earth the metal backbox first, at the terminal marked ⏚. A plastic plate still needs this.' },
      { ...W('SUP_L', 'SW_COM', 'L'), why: 'Permanent live to COM. This terminal is always live, even with the switch off.' },
      { ...W('SW_L1', 'LP_L', 'L'), why: 'Switched live from L1 to the lampholder centre contact. Brown, or a blue core sleeved brown at both ends.' },
      { ...W('LP_N', 'LOOP', 'N'), why: 'Lamp neutral into the insulated connector block. A 1-way switch has no neutral terminal of its own.' },
      { ...W('LOOP', 'SUP_N', 'N'), why: 'Supply neutral into the same block, so the lamp neutral returns to the supply without touching the switch.' },
    ],
  },
  scenarios: [
    { id: 'b2', group: 'Basics', type: 'build', title: 'Wire a 1-way light switch', brief: 'Single switch controlling one lamp. Use the loop connector for the neutrals and earth the backbox. Pass: lamp lights only with the switch on.' },
    { id: 'f2', group: 'Fault finding', type: 'fault', title: '"Shock changing the bulb with the switch off"', brief: 'Light works normally. The customer got a tingle from the lampholder. Pass: lamp works and the holder is dead when off.',
      preset: [W('SUP_L', 'LP_L', 'L'), W('SUP_N', 'SW_COM', 'N'), W('SW_L1', 'LP_N', 'N'), W('SUP_E', 'SW_E', 'E')] },
    { id: 'f3', group: 'Fault finding', type: 'fault', title: '"The switch does nothing, light always on"', brief: 'Lamp burns day and night. Trace where the live really goes. Pass: switch controls the lamp.',
      preset: [W('SUP_L', 'SW_COM', 'L'), W('SUP_L', 'LP_L', 'L'), W('LP_N', 'LOOP', 'N'), W('LOOP', 'SUP_N', 'N'), W('SUP_E', 'SW_E', 'E')] },
  ],
};
