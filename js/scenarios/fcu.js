// 13 A switched fused connection unit (spur) feeding a cooker hood.
import { SUPPLY3 } from '../supply.js';
import { el, rect, circle, path, text } from '../svg.js';
import { ok, fail, inc, powered } from '../engine.js';
import { TXT } from '../copy.js';

const OK = { title: 'Correct. Fused spur protects the appliance.', body: 'Supply lands on the FEED terminals, the appliance on LOAD. The fuse and the switch sit in the live, so the appliance is dead when switched off and a fault blows the local fuse before the MCB.', points: ['Fit a fuse rated for the appliance (3 A for a hood or extractor, not 13 A).', 'A fused spur may feed one appliance or an unlimited number of sockets beyond it.'] };
const FCU_REVERSED = { title: 'Supply and load swapped on the fused spur.', body: 'The appliance runs, but the supply lands on the LOAD terminals. The fuse carrier is now live from the supply side even with the switch off, so changing the fuse is a shock hazard, and the switch no longer isolates the fuse.', points: ['FEED (sometimes marked SUPPLY or IN) takes the circuit cable; LOAD takes the appliance.'] };

const W = (a, b, color) => ({ a, b, color });

export default {
  component: {
    id: 'fcu', group: 'Power', name: '13 A fused spur (cooker hood)', mcb: 'B32',
    supply: SUPPLY3,
    terminals: [
      { id: 'F_LIN',   x: 450, y: 150, label: 'L IN', mark: 'L', tip: '<b>L (FEED)</b> Circuit live from the ring or radial. Plates mark this pair FEED, SUPPLY or IN.' },
      { id: 'F_NIN',   x: 540, y: 150, label: 'N IN', mark: 'N', tip: '<b>N (FEED)</b> Circuit neutral in.' },
      { id: 'F_E',     x: 495, y: 240, label: 'E', tip: '<b>⏚</b> Earth terminal. Loop through to the appliance.' },
      { id: 'F_LLOAD', x: 450, y: 340, label: 'L LOAD', mark: 'L', tip: '<b>L (LOAD)</b> Fused and switched live to the appliance. Comes after the fuse carrier.' },
      { id: 'F_NLOAD', x: 540, y: 340, label: 'N LOAD', mark: 'N', tip: '<b>N (LOAD)</b> Neutral to the appliance. Internally linked to the feed neutral (not switched).' },
      { id: 'AP_L',    x: 670, y: 330, label: 'L', tip: '<b>Hood L</b> Appliance live. Flex outlet from the spur.' },
      { id: 'AP_N',    x: 740, y: 330, label: 'N', tip: '<b>Hood N</b> Appliance neutral.' },
      { id: 'AP_E',    x: 705, y: 250, label: 'E', tip: '<b>⏚ Hood earth</b> Appliance earth to the metal body.' },
    ],
    toggles: [{ key: 'on', label: 'spur switch' }],
    links: (s) => s.on ? [['F_LIN', 'F_LLOAD'], ['F_NIN', 'F_NLOAD']] : [['F_NIN', 'F_NLOAD']],
    draw(g) {
      rect(g, 400, 90, 200, 300, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 6 });
      rect(g, 414, 104, 172, 272, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
      text(g, 500, 124, 'SWITCHED FCU · 3 A fuse fitted', 'lbl', 'middle');
      text(g, 540, 200, 'FEED', 'lbl-strong', 'middle');
      text(g, 540, 313, 'LOAD', 'lbl-strong', 'middle');
      rect(g, 436, 196, 26, 90, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 4 });
      text(g, 449, 182, 'fuse', 'lbl', 'middle');
      path(g, 'M 449 206 v 70', { stroke: 'var(--brass)', 'stroke-width': 4, 'stroke-linecap': 'round' });
      circle(g, 560, 240, 5, { fill: 'var(--line)' }).id = 'fcuNeon';
      text(g, 500, 400, 'kitchen · above worktop', 'lbl', 'middle');
      rect(g, 630, 130, 150, 250, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 10 });
      text(g, 705, 158, 'cooker hood', 'lbl', 'middle');
      const fan = el('g', { class: 'fan' }, g); fan.id = 'fan';
      for (let i = 0; i < 3; i++) el('ellipse', { cx: 705, cy: 182, rx: 7, ry: 22, fill: 'var(--box)', stroke: 'var(--box-edge)', transform: `rotate(${i * 120} 705 200)` }, fan);
      circle(g, 705, 200, 6, { fill: 'var(--fg)' });
    },
    evaluate(N) {
      const on = N({ on: true }), off = N({ on: false });
      if (['F_LIN', 'F_NIN', 'F_LLOAD', 'F_NLOAD', 'AP_L', 'AP_N'].some(t => on(t).has('E'))) return fail(TXT.earthAsConductor);
      if (!powered(on, 'AP_L', 'AP_N')) return on('AP_L').has('N') && on('AP_N').has('L') ? fail(TXT.reversed) : inc();
      if (off('AP_L').has('L')) return fail(TXT.bypassed);
      if (off('F_LLOAD').has('L') && !off('F_LIN').has('L')) return fail(FCU_REVERSED);
      if (!on('AP_E').has('E')) return fail(TXT.noEarth);
      return ok(OK);
    },
    animate(r, s) {
      const live = r && r.kind === 'ok' && s.on;
      const fan = document.getElementById('fan'), neon = document.getElementById('fcuNeon');
      if (!fan) return;
      fan.classList.toggle('spin', !!live);
      neon.setAttribute('fill', live ? 'var(--danger)' : 'var(--line)');
    },
    solution: [
      { ...W('SUP_E', 'F_E', 'E'), why: 'Circuit earth to the spur ⏚ terminal.' },
      { ...W('F_E', 'AP_E', 'E'), why: 'Loop the earth on to the hood body.' },
      { ...W('SUP_L', 'F_LIN', 'L'), why: 'Circuit live to L in the FEED group. The fuse and switch sit between here and LOAD.' },
      { ...W('SUP_N', 'F_NIN', 'N'), why: 'Circuit neutral to N in the FEED group.' },
      { ...W('F_LLOAD', 'AP_L', 'L'), why: 'Fused, switched live from LOAD L to the hood.' },
      { ...W('F_NLOAD', 'AP_N', 'N'), why: 'LOAD N to the hood neutral. Fit a 3 A fuse for a hood, not the 13 A the unit ships with.' },
    ],
  },
  scenarios: [
    { id: 'p5', group: 'Power circuits', type: 'build', title: 'Fused spur for a cooker hood', brief: 'Switched FCU off the kitchen ring feeding a hood. Circuit on FEED, appliance on LOAD, earth through. Pass: hood runs, fuse and switch in the live.' },
    { id: 'p6', group: 'Power circuits', type: 'fault', title: '"Fuse holder sparked when I pulled it"', brief: 'Owner switched the spur off before changing the fuse and still saw a spark. Pass: fuse carrier dead with the switch off.',
      preset: [W('SUP_L', 'F_LLOAD', 'L'), W('SUP_N', 'F_NLOAD', 'N'), W('F_LIN', 'AP_L', 'L'), W('F_NIN', 'AP_N', 'N'), W('SUP_E', 'F_E', 'E'), W('F_E', 'AP_E', 'E')] },
  ],
};
