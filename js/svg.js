// Small SVG helpers plus the drawings shared by more than one scenario.
export const SVGNS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
export const rect = (g, x, y, w, h, a = {}) => el('rect', { x, y, width: w, height: h, ...a }, g);
export const circle = (g, cx, cy, r, a = {}) => el('circle', { cx, cy, r, ...a }, g);
export const path = (g, d, a = {}) => el('path', { d, ...a }, g);
export function text(g, x, y, s, cls = 'lbl', anchor = 'start') {
  const t = el('text', { x, y, class: cls, 'text-anchor': anchor }, g);
  t.textContent = s;
  return t;
}

/** Cubic wire between two points. */
export function wirePath(a, b) {
  const dx = Math.max(60, Math.abs(b.x - a.x) * 0.5);
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

/** IEC 60417-5019 protective-earth symbol, as embossed on real accessories. */
export function earthSymbol(g, x, y) {
  const s = el('g', { transform: `translate(${x} ${y})`, fill: 'none', stroke: 'var(--fg)', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  el('path', { d: 'M 0 -10 V -1 M -8 -1 H 8 M -5 3 H 5 M -2 7 H 2' }, s);
  return s;
}

/** A bayonet lamp with glow; one per canvas (ids lampGlow / lampBulb). */
export function lampGfx(g, cx, cy, r) {
  const glow = circle(g, cx, cy, r * 1.5, { fill: 'var(--warn)', opacity: 0 });
  glow.classList.add('lamp-glow'); glow.id = 'lampGlow';
  circle(g, cx, cy, r, { fill: 'var(--panel-2)', stroke: 'var(--line)', 'stroke-width': 2 }).id = 'lampBulb';
  path(g, `M ${cx - r * 0.3} ${cy + r * 0.5} q ${r * 0.3} -${r} ${r * 0.6} 0`, { fill: 'none', stroke: 'var(--muted)', 'stroke-width': 2 });
  rect(g, cx - r * 0.37, cy + r, r * 0.74, r * 0.6, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 3 });
}
export function setLamp(lit) {
  const glow = document.getElementById('lampGlow'), bulb = document.getElementById('lampBulb');
  if (!bulb) return;
  glow.setAttribute('opacity', lit ? 0.35 : 0);
  bulb.setAttribute('fill', lit ? 'var(--wire-E-y)' : 'var(--panel-2)');
  bulb.style.filter = lit ? 'drop-shadow(0 0 10px var(--warn))' : '';
}

/** Rear of a BS 1363 socket with a small front inset (ids socketLed / socketRocker). */
export function socketGfx(g) {
  rect(g, 400, 80, 320, 300, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 6 });
  rect(g, 418, 98, 284, 264, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
  text(g, 560, 122, 'REAR VIEW · 13 A SOCKET · BS 1363 / MS 589', 'lbl', 'middle');
  circle(g, 430, 230, 5, { fill: 'var(--box)', stroke: 'var(--box-edge)' });
  circle(g, 690, 230, 5, { fill: 'var(--box)', stroke: 'var(--box-edge)' });
  rect(g, 528, 200, 64, 54, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 4 });
  text(g, 560, 194, 'front', 'lbl', 'middle');
  rect(g, 556, 208, 8, 14, { fill: 'var(--fg)', rx: 1 });
  rect(g, 540, 232, 12, 7, { fill: 'var(--fg)', rx: 1 });
  rect(g, 568, 232, 12, 7, { fill: 'var(--fg)', rx: 1 });
  circle(g, 584, 212, 4, { fill: 'var(--line)' }).id = 'socketLed';
  rect(g, 534, 243, 14, 8, { fill: 'var(--danger)', rx: 1 }).id = 'socketRocker';
  text(g, 560, 345, 'Rocker switch breaks the LIVE only', 'lbl', 'middle');
}
export function socketAnim(on, ok) {
  const led = document.getElementById('socketLed'), rocker = document.getElementById('socketRocker');
  if (!led) return;
  const live = ok && on;
  led.setAttribute('fill', live ? 'var(--ok)' : 'var(--line)');
  led.style.filter = live ? 'drop-shadow(0 0 4px var(--ok))' : '';
  rocker.setAttribute('fill', on ? 'var(--ok)' : 'var(--danger)');
}

/** Rear of a one-gang plate switch with a knob (id given). */
export function switchPlate(g, x, y, w, h, title, knobId) {
  rect(g, x, y, w, h, { fill: 'var(--box)', stroke: 'var(--box-edge)', rx: 6 });
  rect(g, x + 14, y + 14, w - 28, h * 0.7, { fill: 'var(--backplate)', stroke: 'var(--backplate-edge)', rx: 8 });
  text(g, x + w / 2, y + 34, title, 'lbl', 'middle');
  rect(g, x + w - 46, y + 80, 30, 60, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 4 });
  rect(g, x + w - 43, y + 84, 24, 26, { fill: 'var(--fg)', rx: 3 }).id = knobId;
  return { knobUp: y + 84, knobDown: y + 110 };
}
export function setKnob(id, down, up, lower) {
  const k = document.getElementById(id);
  if (k) k.setAttribute('y', down ? lower : up);
}
