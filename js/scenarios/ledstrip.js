// Wall switch feeding a 12 V LED driver, then an under-cabinet LED strip on the SELV side.
import { SUPPLY3 } from '../supply.js';
import { rect, circle, path, text, switchPlate, setKnob } from '../svg.js';
import { ok, fail, inc, only, powered } from '../engine.js';
import { TXT } from '../copy.js';

const OK = { title: 'Correct. LED strip switches with the wall switch.', body: 'Switched live and neutral feed the driver primary, the driver case is earthed, and the 12 V output runs to the strip with the right polarity. Everything beyond the driver is SELV: safe to touch, no earth needed on the strip.', points: ['Size the driver for the strip: total strip watts plus 20 % headroom.', 'Keep the ELV run short or step up to 24 V; long 12 V runs dim at the far end.'] };
const MAINS_ON_LED = { title: 'Mains on the LED strip. Strip and driver destroyed.', body: '240 V reached the extra-low-voltage side. A 12 V strip flashes, smokes and fails within a second, and the driver output stage is likely gone too. Nothing trips because the failed strip simply goes open-circuit. If the strip was in a metal channel that channel was briefly live.', points: ['Mains and SELV conductors must be separated; never land a brown or blue core on the + / − terminals (MS IEC 60364-4-41, SELV).', 'Red and black are reserved for the ELV side on this installation.'] };
const DC_SHORT = { title: 'Driver output shorted. Strip stays dark.', body: '+ and − are joined before the strip. A compliant SELV driver goes into hiccup or shutdown protection, so the MCB does not trip, but the strip never lights and the driver may overheat if left on.', points: ['Check for stray strands at the strip solder pads; they are the usual cause.'] };
const LED_REVERSED = { title: 'LED strip polarity reversed. Nothing lights.', body: 'The strip is DC and the LEDs are diodes. With + and − swapped they block current, so the strip is dark even though the driver is powered. There is no damage, but the customer sees a dead light.', points: ['Match the strip\'s + marking to the driver +V (red) and − to −V (black).'] };

const W = (a, b, color) => ({ a, b, color });
let knob;

export default {
  component: {
    id: 'led', group: 'Lighting', name: 'Switch + LED strip (driver)', mcb: 'B6',
    supply: SUPPLY3,
    sources: [{ id: 'DRV_P', tag: '+' }, { id: 'DRV_M', tag: '−' }],
    terminals: [
      { id: 'SW_COM', x: 450, y: 150, label: 'COM', tip: '<b>COM</b> Switch common. Permanent live from the supply.' },
      { id: 'SW_L1',  x: 450, y: 220, label: 'L1', tip: '<b>L1</b> Switched live to the driver L terminal.' },
      { id: 'SW_E',   x: 450, y: 310, label: 'E', tip: '<b>⏚</b> Earth terminal on the switch backbox.' },
      { id: 'LOOP',   x: 460, y: 422, label: 'LOOP / N', mark: '', tip: '<b>Loop / Neutral connector</b> Unmarked block that joins the driver neutral to the supply neutral.' },
      { id: 'DRV_L',  x: 600, y: 165, label: 'L', tip: '<b>Driver L</b> 240 V AC primary live. Must be the switched live from L1.' },
      { id: 'DRV_N',  x: 600, y: 230, label: 'N', tip: '<b>Driver N</b> 240 V AC primary neutral.' },
      { id: 'DRV_E',  x: 670, y: 230, label: 'E', tip: '<b>⏚ Driver earth</b> Earth for the metal driver case (class I driver). A plastic class II driver has no earth terminal.' },
      { id: 'DRV_P',  x: 740, y: 165, label: 'V+', mark: '+V', tip: '<b>+V</b> 12 V DC positive output. SELV side, red wire. Some drivers mark this V+ or +12V.' },
      { id: 'DRV_M',  x: 740, y: 230, label: 'V−', mark: '−V', tip: '<b>−V</b> 12 V DC negative output. SELV side, black wire. Some drivers mark this V− or COM.' },
      { id: 'LED_P',  x: 600, y: 405, label: '+', mark: '+12V', tip: '<b>+12V</b> LED strip positive pad. Red.' },
      { id: 'LED_M',  x: 750, y: 405, label: '−', mark: 'GND', tip: '<b>GND</b> LED strip negative pad, often printed GND or −. Black.' },
    ],
    toggles: [{ key: 'on', label: 'wall switch' }],
    links: (s) => s.on ? [['SW_COM', 'SW_L1']] : [],
    draw(g) {
      knob = switchPlate(g, 400, 90, 140, 260, 'WALL SWITCH', 'swKnob');
      text(g, 470, 336, 'metal backbox', 'lbl', 'middle');
      rect(g, 400, 400, 120, 44, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 4 });
      text(g, 460, 458, 'connector block', 'lbl', 'middle');
      rect(g, 560, 95, 220, 175, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 8 });
      text(g, 670, 118, 'LED DRIVER · 30 W · SELV', 'lbl-strong', 'middle');
      text(g, 600, 138, '240 V AC in', 'lbl', 'middle');
      text(g, 740, 138, '12 V DC out', 'lbl', 'middle');
      path(g, 'M 670 130 v 70', { stroke: 'var(--box-edge)', 'stroke-dasharray': '3 3' });
      circle(g, 670, 165, 5, { fill: 'var(--line)' }).id = 'drvLed';
      rect(g, 560, 320, 230, 44, { fill: 'var(--fg)', opacity: .85, rx: 4 });
      text(g, 675, 310, 'under-cabinet LED strip · 12 V', 'lbl', 'middle');
      for (let i = 0; i < 10; i++) circle(g, 582 + i * 20.5, 342, 5, { fill: 'var(--box-edge)', class: 'led-dot' });
    },
    evaluate(N) {
      const on = N({ on: true }), off = N({ on: false });
      const dc = ['DRV_P', 'DRV_M', 'LED_P', 'LED_M'];
      if (dc.some(t => on(t).has('L') || on(t).has('N'))) return fail(MAINS_ON_LED);
      if (['SW_COM', 'SW_L1', 'LOOP', 'DRV_L', 'DRV_N', 'LED_P', 'LED_M'].some(t => on(t).has('E'))) return fail(TXT.earthAsConductor);
      if (on('DRV_P').has('−')) return fail(DC_SHORT);
      const prim = (n) => powered(n, 'DRV_L', 'DRV_N');
      if (!prim(on)) return inc();
      if (only(on('LED_P'), '−') && only(on('LED_M'), '+')) return fail(LED_REVERSED);
      if (!(only(on('LED_P'), '+') && only(on('LED_M'), '−'))) return inc();
      if (prim(off)) return fail(TXT.bypassed);
      if (off('DRV_L').has('L')) return fail(TXT.switchedNeutral);
      if (!on('SW_E').has('E') || !on('DRV_E').has('E')) return fail(TXT.noEarth);
      return ok(OK);
    },
    animate(r, s) {
      const lit = r && r.kind === 'ok' && s.on;
      setKnob('swKnob', s.on, knob.knobUp, knob.knobDown);
      const d = document.getElementById('drvLed');
      if (d) d.setAttribute('fill', lit ? 'var(--ok)' : 'var(--line)');
      document.querySelectorAll('#canvas .led-dot').forEach(c => {
        c.setAttribute('fill', lit ? 'var(--wire-E-y)' : 'var(--box-edge)');
        c.style.filter = lit ? 'drop-shadow(0 0 6px var(--warn))' : '';
      });
    },
    solution: [
      { ...W('SUP_E', 'SW_E', 'E'), why: 'Earth the switch backbox.' },
      { ...W('SW_E', 'DRV_E', 'E'), why: 'Loop the earth on to the driver case. A class I (metal) driver needs it; a class II plastic one has no terminal for it.' },
      { ...W('SUP_L', 'SW_COM', 'L'), why: 'Permanent live to COM.' },
      { ...W('SW_L1', 'DRV_L', 'L'), why: 'Switched live from L1 to the driver L. Switching the 240 V side is what makes the strip switchable.' },
      { ...W('DRV_N', 'LOOP', 'N'), why: 'Driver neutral into the connector block.' },
      { ...W('LOOP', 'SUP_N', 'N'), why: 'Supply neutral into the same block. The mains side is complete.' },
      { ...W('DRV_P', 'LED_P', 'R'), why: 'Red from +V to the strip +12V pad. Keep ELV wiring away from the mains terminals.' },
      { ...W('DRV_M', 'LED_M', 'K'), why: 'Black from −V to GND. Polarity matters: reversed, the strip simply stays dark.' },
    ],
  },
  scenarios: [
    { id: 'l5', group: 'Lighting', type: 'build', title: 'Switch-controlled LED strip', brief: 'Under-cabinet strip on a 12 V driver. Switched live from L1 to the driver L, neutral via the connector, earth the box and the driver case, then red to +, black to − on the strip. Pass: strip lights only with the switch on.' },
    { id: 'l6', group: 'Lighting', type: 'fault', title: '"New LED strip is dead, driver light is on"', brief: 'Handyman replaced the strip and now it never lights, though the driver indicator glows. Pass: strip lights with the switch.',
      preset: [W('SUP_L', 'SW_COM', 'L'), W('SW_L1', 'DRV_L', 'L'), W('DRV_N', 'LOOP', 'N'), W('LOOP', 'SUP_N', 'N'), W('SUP_E', 'SW_E', 'E'), W('SW_E', 'DRV_E', 'E'), W('DRV_P', 'LED_M', 'R'), W('DRV_M', 'LED_P', 'K')] },
    { id: 'l7', group: 'Lighting', type: 'fault', title: '"Strip flashed once and smoked"', brief: 'Owner wired the strip themselves. It lit brilliantly for a moment, then nothing, and the kitchen smelt of burnt plastic. Find why, then wire it properly. Pass: strip lights with the switch.',
      preset: [W('SUP_L', 'SW_COM', 'L'), W('SW_L1', 'LED_P', 'L'), W('SUP_N', 'LED_M', 'N'), W('SUP_E', 'SW_E', 'E')] },
  ],
};
