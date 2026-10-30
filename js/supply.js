// Incoming supply blocks. Each terminal carries a `tag` (L, N or E) that seeds the net evaluation.
import { text, path } from './svg.js';

const TIP_L = '<b>L</b> Live from the MCB. 240 V to earth. Brown core.';
const TIP_N = '<b>N</b> Neutral return to the supply. Near 0 V but still a current-carrying conductor. Blue core.';
const TIP_E = '<b>E</b> Protective earth (CPC). Carries fault current only, so protection can operate. Green/yellow core.';

export const SUPPLY3 = {
  label: ['Incoming supply', 'from consumer unit (MCB)'],
  terminals: [
    { id: 'SUP_L', x: 90, y: 160, label: 'L', tag: 'L', tip: TIP_L },
    { id: 'SUP_N', x: 90, y: 240, label: 'N', tag: 'N', tip: TIP_N },
    { id: 'SUP_E', x: 90, y: 320, label: 'E', tag: 'E', tip: TIP_E },
  ],
};

export const SUPPLY_RING = {
  label: ['Ring final circuit', '32 A MCB · 2.5 mm² · two legs'],
  terminals: [
    { id: 'A_L', x: 90, y: 130, label: 'L', tag: 'L', tip: '<b>Leg A · L</b> One end of the ring. ' + TIP_L },
    { id: 'A_N', x: 90, y: 175, label: 'N', tag: 'N', tip: '<b>Leg A · N</b> ' + TIP_N },
    { id: 'A_E', x: 90, y: 220, label: 'E', tag: 'E', tip: '<b>Leg A · E</b> ' + TIP_E },
    { id: 'B_L', x: 90, y: 290, label: 'L', tag: 'L', tip: '<b>Leg B · L</b> The other end of the same ring, returning from the last socket.' },
    { id: 'B_N', x: 90, y: 335, label: 'N', tag: 'N', tip: '<b>Leg B · N</b> ' + TIP_N },
    { id: 'B_E', x: 90, y: 380, label: 'E', tag: 'E', tip: '<b>Leg B · E</b> ' + TIP_E },
  ],
  extraDraw(g) {
    text(g, 60, 110, 'leg A', 'lbl');
    text(g, 60, 270, 'leg B', 'lbl');
    path(g, 'M 40 255 H 140', { stroke: 'var(--line)', 'stroke-dasharray': '3 3' });
  },
};
