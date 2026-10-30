// Circuit engine: merges wires and switch contacts into nets, tags each net by the
// supply conductor it reaches, and offers the predicates scenario evaluators use.
import { TXT } from './copy.js';
import { COLOR_TAG } from './colors.js';

export const only = (set, tag) => set.size === 1 && set.has(tag);
export const powered = (n, l, nn) => only(n(l), 'L') && only(n(nn), 'N');

export const ok = (t) => ({ kind: 'ok', ...t });
export const fail = (t) => ({ kind: 'fail', ...t });
export const inc = () => ({ kind: 'incomplete', ...TXT.incomplete });

export const terminalsOf = (comp) => [...comp.supply.terminals, ...comp.terminals];
export const terminalById = (comp, id) => terminalsOf(comp).find(t => t.id === id);

/**
 * Build nets for a component given the drawn wires and a map of toggle states.
 * Returns n(id) -> Set of supply tags reaching that terminal, with n.connected(a, b).
 */
export function buildNets(comp, wires, toggles) {
  const parent = {};
  const find = (x) => { parent[x] = parent[x] ?? x; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
  const union = (a, b) => { parent[find(a)] = find(b); };
  terminalsOf(comp).forEach(t => find(t.id));
  wires.forEach(w => union(w.a, w.b));
  comp.links(toggles).forEach(([a, b]) => union(a, b));
  const tags = {};
  [...comp.supply.terminals, ...(comp.sources || [])].forEach(t => {
    const r = find(t.id);
    (tags[r] = tags[r] || new Set()).add(t.tag);
  });
  const n = (id) => tags[find(id)] || new Set();
  n.connected = (a, b) => find(a) === find(b);
  return n;
}

/** Every combination of the component's toggles. */
export function toggleCombos(comp) {
  const keys = comp.toggles.map(t => t.key);
  const out = [];
  for (let m = 0; m < (1 << keys.length); m++) {
    const o = {};
    keys.forEach((k, i) => { o[k] = !!(m & (1 << i)); });
    out.push(o);
  }
  return out;
}

/** A short that trips the MCB/RCD in any switch position, or null. */
export function detectShort(comp, wires) {
  const sup = comp.supply.terminals;
  const lId = sup.find(t => t.tag === 'L').id, nId = sup.find(t => t.tag === 'N').id;
  for (const combo of toggleCombos(comp)) {
    const n = buildNets(comp, wires, combo);
    if (n(lId).has('N')) return TXT.shortLN;
    if (n(lId).has('E')) return TXT.shortLE;
    if (n(nId).has('E')) return TXT.shortNE;
  }
  return null;
}

/** True when any wire's colour does not match the single conductor its net carries. */
export function colourFault(comp, wires) {
  const allOn = Object.fromEntries(comp.toggles.map(t => [t.key, true]));
  const n = buildNets(comp, wires, allOn);
  return wires.some(w => { const tags = n(w.a); return tags.size === 1 && !tags.has(COLOR_TAG[w.color]); });
}

/**
 * Generic evaluation for one switch feeding one lamp.
 * c = { on, lampL, lampN, earth, loads, okText }
 */
export function lampEval(N, c) {
  const on = N({ [c.on]: true }), off = N({ [c.on]: false });
  if (c.loads.some(t => on(t).has('E'))) return fail(TXT.earthAsConductor);
  const litOn = powered(on, c.lampL, c.lampN), litOff = powered(off, c.lampL, c.lampN);
  if (litOn && litOff) return fail(TXT.bypassed);
  if (!litOn) {
    if (on(c.lampL).has('N') && on(c.lampN).has('L')) return fail(TXT.switchedNeutral);
    return inc();
  }
  if (off(c.lampL).has('L')) return fail(TXT.switchedNeutral);
  if (!on(c.earth).has('E')) return fail(TXT.noEarth);
  return ok(c.okText);
}

/** Run a full test: returns { trip: TXT } or a result object. */
export function runCircuit(comp, wires, toggles) {
  const short = detectShort(comp, wires);
  if (short) return { trip: short };
  const N = (override) => buildNets(comp, wires, { ...toggles, ...override });
  let result = comp.evaluate(N, toggles);
  if (result.kind === 'ok' && colourFault(comp, wires)) result = { kind: 'warn', ...TXT.colour };
  return result;
}
