// 20 A double-pole isolator feeding a bathroom storage water heater.
import { SUPPLY3 } from '../supply.js';
import { rect, circle, text } from '../svg.js';
import { ok, fail, inc, powered } from '../engine.js';
import { TXT } from '../copy.js';

const OK = { title: 'Correct. Heater fully isolated when switched off.', body: 'Both live and neutral are broken by the 20 A double-pole switch, and the heater casing is earthed. With the switch off, no conductor at the heater is at supply potential.', points: ['Water heaters in Malaysian bathrooms must be fed via a double-pole isolator and protected by a 30 mA RCD/ELCB.', 'Use heat-resistant flex from the isolator to the heater.'] };
const NOT_DP = { title: 'Only one pole switched. Heater not isolated.', body: 'The switch breaks one conductor but the other goes straight to the heater. Switching off does not make the heater dead. In a wet area, with a neutral that can float above earth under fault, that is a shock risk during maintenance.', points: ['Water heaters, air-conditioners and cookers must be controlled by a double-pole switch in Malaysian practice.', 'Both L and N must enter on the SUPPLY side and leave on the LOAD side.'] };

const W = (a, b, color) => ({ a, b, color });

export default {
  component: {
    id: 'dp', group: 'Power', name: '20 A DP isolator (water heater)', mcb: 'B20',
    supply: SUPPLY3,
    terminals: [
      { id: 'DP_LIN',  x: 450, y: 150, label: 'L IN', mark: 'L', tip: '<b>L (SUPPLY)</b> Supply live into the double-pole switch. The plate groups the top pair under SUPPLY.' },
      { id: 'DP_NIN',  x: 530, y: 150, label: 'N IN', mark: 'N', tip: '<b>N (SUPPLY)</b> Supply neutral into the switch. A DP switch breaks the neutral too.' },
      { id: 'DP_E',    x: 490, y: 230, label: 'E', tip: '<b>⏚</b> Earth terminal on the isolator. Loop through to the heater earth.' },
      { id: 'DP_LOUT', x: 450, y: 310, label: 'L OUT', mark: 'L', tip: '<b>L (LOAD)</b> Switched live to the heater.' },
      { id: 'DP_NOUT', x: 530, y: 310, label: 'N OUT', mark: 'N', tip: '<b>N (LOAD)</b> Switched neutral to the heater.' },
      { id: 'HT_L',    x: 660, y: 330, label: 'L', tip: '<b>Heater L</b> Element live. 240 V, 3 to 4 kW storage or instant heater.' },
      { id: 'HT_N',    x: 740, y: 330, label: 'N', tip: '<b>Heater N</b> Element neutral.' },
      { id: 'HT_E',    x: 700, y: 250, label: 'E', tip: '<b>⏚ Heater earth</b> Earth to the heater casing and tank. Critical in a wet area.' },
    ],
    toggles: [{ key: 'on', label: 'DP isolator' }],
    links: (s) => s.on ? [['DP_LIN', 'DP_LOUT'], ['DP_NIN', 'DP_NOUT']] : [],
    draw(g) {
      rect(g, 400, 90, 180, 290, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 6 });
      rect(g, 414, 104, 152, 262, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
      text(g, 490, 124, '20 A DP SWITCH · neon', 'lbl', 'middle');
      text(g, 490, 200, 'SUPPLY', 'lbl-strong', 'middle');
      text(g, 490, 283, 'LOAD', 'lbl-strong', 'middle');
      circle(g, 540, 230, 5, { fill: 'var(--line)' }).id = 'dpNeon';
      text(g, 490, 352, 'WATER HEATER', 'lbl-strong', 'middle');
      rect(g, 620, 110, 160, 270, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 14 });
      rect(g, 640, 130, 120, 90, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 8 });
      text(g, 700, 160, 'storage heater', 'lbl', 'middle');
      circle(g, 700, 190, 8, { fill: 'var(--line)' }).id = 'htLed';
      text(g, 700, 400, 'bathroom · zone 2', 'lbl', 'middle');
    },
    evaluate(N) {
      const on = N({ on: true }), off = N({ on: false });
      if (['DP_LIN', 'DP_NIN', 'DP_LOUT', 'DP_NOUT', 'HT_L', 'HT_N'].some(t => on(t).has('E'))) return fail(TXT.earthAsConductor);
      if (!powered(on, 'HT_L', 'HT_N')) return on('HT_L').has('N') && on('HT_N').has('L') ? fail(TXT.reversed) : inc();
      const offL = off('HT_L').has('L'), offN = off('HT_N').has('N');
      if (offL && offN) return fail(TXT.bypassed);
      if (offL || offN) return fail(NOT_DP);
      if (!on('HT_E').has('E')) return fail(TXT.noEarth);
      return ok(OK);
    },
    animate(r, s) {
      const live = r && r.kind === 'ok' && s.on;
      const led = document.getElementById('htLed'), neon = document.getElementById('dpNeon');
      if (!led) return;
      led.setAttribute('fill', live ? 'var(--danger)' : 'var(--line)');
      led.style.filter = live ? 'drop-shadow(0 0 6px var(--danger))' : '';
      neon.setAttribute('fill', live ? 'var(--danger)' : 'var(--line)');
    },
    solution: [
      { ...W('SUP_E', 'DP_E', 'E'), why: 'Circuit earth to the isolator ⏚ terminal.' },
      { ...W('DP_E', 'HT_E', 'E'), why: 'Loop the earth on to the heater. The tank and casing must be earthed in a wet area.' },
      { ...W('SUP_L', 'DP_LIN', 'L'), why: 'Supply live to L in the SUPPLY group.' },
      { ...W('SUP_N', 'DP_NIN', 'N'), why: 'Supply neutral to N in the SUPPLY group. Both poles enter on the same side.' },
      { ...W('DP_LOUT', 'HT_L', 'L'), why: 'Heat-resistant flex: L in the LOAD group to the heater live.' },
      { ...W('DP_NOUT', 'HT_N', 'N'), why: 'N in the LOAD group to the heater neutral. Now, with the switch off, nothing at the heater is at supply potential.' },
    ],
  },
  scenarios: [
    { id: 'p3', group: 'Power circuits', type: 'build', title: 'Water heater DP isolator', brief: 'Bathroom storage heater via a 20 A double-pole switch. Both poles switched, earth looped to the tank. Pass: heater dead on both conductors when off.' },
    { id: 'p4', group: 'Power circuits', type: 'fault', title: '"Plumber got a shock from the heater"', brief: 'Isolator was off. The plumber still got bitten. Pass: true double-pole isolation.',
      preset: [W('SUP_L', 'DP_LIN', 'L'), W('DP_LOUT', 'HT_L', 'L'), W('SUP_N', 'HT_N', 'N'), W('SUP_E', 'DP_E', 'E'), W('DP_E', 'HT_E', 'E')] },
  ],
};
