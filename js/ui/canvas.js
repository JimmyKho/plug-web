// Draws the bench: supply block, component, wires and terminals. Pure function of state + handlers.
import { el, rect, text, wirePath, earthSymbol } from '../svg.js';
import { colorByKey, CORE_STROKE } from '../colors.js';
import { terminalsOf, terminalById } from '../engine.js';

const canvas = () => document.getElementById('canvas');
let ghostLayer = null;

function drawSupply(g, sup) {
  const ys = sup.terminals.map(t => t.y), top = Math.min(...ys), bottom = Math.max(...ys);
  rect(g, 30, top - 40, 120, bottom - top + 80, { fill: 'var(--panel-2)', stroke: 'var(--line)', rx: 8 });
  text(g, 90, top - 50, sup.label[0], 'lbl-strong', 'middle');
  text(g, 90, bottom + 60, sup.label[1], 'lbl', 'middle');
  if (sup.extraDraw) sup.extraDraw(g);
}

function drawWire(g, w, a, b, highlight) {
  const d = wirePath(a, b);
  const c = colorByKey(w.color);
  if (highlight) el('path', { d, class: 'wire-new' }, g);
  el('path', { d, class: 'wire-hit' }, g);
  if (w.color === 'E') {
    el('path', { d, class: 'wire', stroke: 'var(--wire-E-g)', 'stroke-width': 7 }, g);
    el('path', { d, class: 'wire', stroke: 'var(--wire-E-y)', 'stroke-width': 7, 'stroke-dasharray': '9 9' }, g);
  } else if (w.color === 'S') {
    el('path', { d, class: 'wire', stroke: 'var(--wire-N)', 'stroke-width': 7 }, g);
    el('path', { d, class: 'wire', stroke: 'var(--wire-L)', 'stroke-width': 7, pathLength: 100, 'stroke-dasharray': '10 80 10' }, g);
  } else {
    el('path', { d, class: 'wire', stroke: c.stroke, 'stroke-width': c.thin ? 5 : 7 }, g);
  }
}

/** Terminal label: the embossed product marking, or the training letter. */
function drawLabel(g, t, isSupply, mode) {
  if (isSupply && mode === 'mark') return;                 // a cable core carries no letters: identify it by colour
  const txt = mode === 'mark' ? (t.mark !== undefined ? t.mark : (t.label === 'E' ? '⏚' : t.label)) : t.label;
  if (txt === '⏚') { earthSymbol(g, isSupply ? -26 : 0, isSupply ? 4 : 34); return; }
  if (!txt) return;
  const lab = el('text', { x: isSupply ? -22 : 0, y: isSupply ? 4 : 32, 'text-anchor': isSupply ? 'end' : 'middle' }, g);
  lab.textContent = txt;
}

export function renderCanvas({ state, comp, onTerminal, onRemoveWire }) {
  const svg = canvas();
  svg.innerHTML = '';
  const bg = el('g', {}, svg), wires = el('g', {}, svg), terms = el('g', {}, svg);
  ghostLayer = el('g', {}, svg);

  drawSupply(bg, comp.supply);
  comp.draw(bg);

  state.wires.forEach((w, i) => {
    const a = terminalById(comp, w.a), b = terminalById(comp, w.b);
    if (!a || !b) return;
    const g = el('g', { class: 'wire-g' }, wires);
    drawWire(g, w, a, b, state.steps !== null && i === state.steps - 1);
    g.dataset.tip = `${colorByKey(w.color).name} wire · ${a.label} → ${b.label}. Click to remove.`;
    g.addEventListener('click', (e) => { e.stopPropagation(); onRemoveWire(i); });
  });

  terminalsOf(comp).forEach(t => {
    const g = el('g', { class: 'term' + (state.sel === t.id ? ' sel' : ''), transform: `translate(${t.x} ${t.y})` }, terms);
    g.dataset.tip = t.tip;
    el('circle', { r: 19, class: 'halo' }, g);
    el('circle', { r: 13, class: 'pad' }, g);
    el('circle', { r: 4, fill: 'var(--brass-edge)' }, g);
    const isSupply = !!t.tag;
    if (isSupply) {                                          // incoming cable core in its real colour
      el('path', { d: 'M -48 0 H -14', stroke: CORE_STROKE[t.tag], 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      if (t.tag === 'E') el('path', { d: 'M -48 0 H -14', stroke: 'var(--wire-E-y)', 'stroke-width': 7, 'stroke-dasharray': '6 6' }, g);
    }
    drawLabel(g, t, isSupply, state.labels);
    g.addEventListener('click', (e) => { e.stopPropagation(); onTerminal(t.id); });
  });

  comp.animate(state.tripped ? null : state.result, state);
}

/** White flash over the bench when the breaker trips. */
export function flashCanvas() {
  const f = rect(canvas(), 0, 0, 800, 470, { fill: '#fff', opacity: 0.9, 'pointer-events': 'none' });
  f.classList.add('flash');
  setTimeout(() => f.remove(), 650);
}

/** Ghost wire following the pointer, tooltips, and click-away to cancel a selection. */
export function installCanvasEvents({ state, getComp, onCancel }) {
  const svg = canvas(), tip = document.getElementById('tip');
  svg.addEventListener('pointermove', (e) => {
    if (ghostLayer) ghostLayer.innerHTML = '';
    if (state.sel !== null) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      el('path', { d: wirePath(terminalById(getComp(), state.sel), { x: p.x, y: p.y }), class: 'ghost' }, ghostLayer);
    }
    const t = e.target.closest('[data-tip]');
    if (!t) { tip.classList.remove('show'); return; }
    tip.innerHTML = t.dataset.tip; tip.classList.add('show');
    tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 276) + 'px';
    tip.style.top = (e.clientY + 16) + 'px';
  });
  svg.addEventListener('pointerleave', () => tip.classList.remove('show'));
  svg.addEventListener('click', () => { if (state.sel !== null) onCancel(); });
}
