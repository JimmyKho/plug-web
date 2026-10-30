// Bench state plus the per-browser preferences that survive a reload.
export const state = {
  comp: 'socket',     // active component id
  color: 'L',         // armed wire colour key
  wires: [],          // [{ a, b, color }]
  sel: null,          // terminal id awaiting its second click
  tripped: false,
  on: false, b: false, // toggle states (keys come from component.toggles)
  result: null,       // last evaluation result
  scenario: null,     // active scenario id
  labels: 'mark',     // 'mark' = product markings, 'train' = training letters
  steps: null,        // walkthrough step count when open, else null
  assisted: false,    // walkthrough used since the last reset
};

const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } };

export const done = new Set(JSON.parse(read('wbmy-done') || '[]'));
export const saveDone = () => write('wbmy-done', JSON.stringify([...done]));

if (read('wbmy-labels') === 'train') state.labels = 'train';
export const saveLabels = () => write('wbmy-labels', state.labels);

/** Reset everything that belongs to the drawn circuit. */
export function clearBench() {
  state.wires = []; state.sel = null; state.on = false; state.b = false;
  state.result = null; state.steps = null; state.assisted = false;
}
