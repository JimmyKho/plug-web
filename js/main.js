// Entry point: wires state, engine, scenarios and UI together.
import { state, done, saveDone, saveLabels, clearBench } from './state.js';
import { COMPONENTS, SCENARIO_GROUPS, ALL_SCENARIOS } from './scenarios/index.js';
import { runCircuit } from './engine.js';
import { TXT } from './copy.js';
import { renderCanvas, flashCanvas, installCanvasEvents } from './ui/canvas.js';
import { setMcb, setReport, renderScenarioList, setBrief, renderSteps, renderToolbar, renderTabs } from './ui/panels.js';

const $ = (id) => document.getElementById(id);
const comp = () => COMPONENTS[state.comp];
const toggles = () => Object.fromEntries(comp().toggles.map(t => [t.key, !!state[t.key]]));

// ---------- rendering ----------
function render() {
  renderCanvas({ state, comp: comp(), onTerminal, onRemoveWire });
  renderToolbar({ state, comp: comp(), onToggle: test });
  renderSteps({ comp: comp(), steps: state.steps, onGo: stepTo });
  setMcb(state.tripped, comp().mcb);
}
function renderSidebar() {
  renderScenarioList({ groups: SCENARIO_GROUPS, components: COMPONENTS, active: state.scenario, done, onPick: loadScenario });
}
function invalidate() { state.result = null; if (!state.tripped) setReport(null); }

// ---------- wiring interactions ----------
function onTerminal(id) {
  if (state.sel === null) state.sel = id;
  else if (state.sel === id) state.sel = null;
  else { state.wires.push({ a: state.sel, b: id, color: state.color }); state.sel = null; state.steps = null; invalidate(); }
  render();
}
function onRemoveWire(i) { state.wires.splice(i, 1); state.steps = null; invalidate(); render(); }

// ---------- testing ----------
function test(toggleKey) {
  if (state.tripped) return;
  state[toggleKey] = !state[toggleKey];
  const r = runCircuit(comp(), state.wires, toggles());
  if (r.trip) { trip(r.trip); return; }
  state.result = r;
  setReport(r, completion(r.kind === 'ok' ? 'ok' : null));
  render();
}
function trip(info) {
  state.tripped = true; state.result = { kind: 'trip' }; state.on = false; state.b = false;
  flashCanvas();
  setReport({ kind: 'danger', ...info }, completion('trip'));
  render();
}
function resetMcb() {
  state.tripped = false; state.result = null;
  setReport({ kind: 'neutral', ...TXT.mcbReset });
  render();
}

/** Mark the active scenario done when its goal is met; walkthrough-assisted runs are not ticked. */
function completion(outcome) {
  const sc = state.scenario && ALL_SCENARIOS.find(s => s.id === state.scenario);
  if (!sc || !outcome || (sc.goal || 'ok') !== outcome) return null;
  if (state.assisted) return { kind: 'assist', text: 'Correct, with the walkthrough. Reset wires and do it unaided to tick the scenario.' };
  if (!done.has(sc.id)) { done.add(sc.id); saveDone(); renderSidebar(); }
  return { kind: 'done', text: '✓ Scenario complete: ' + sc.title };
}

// ---------- components & scenarios ----------
function setComponent(id, wires = []) {
  state.comp = id;
  clearBench();
  state.wires = wires.map(w => ({ ...w }));
  renderTabs({ components: COMPONENTS, active: id, onPick: pickTab });
  invalidate(); render();
}
function pickTab(id) {
  if (state.comp === id) return;
  state.scenario = null; setBrief(null);
  setComponent(id); renderSidebar();
}
function loadScenario(sc) {
  state.scenario = sc.id;
  setComponent(sc.comp, sc.preset || []);
  setBrief(sc); renderSidebar();
}

// ---------- walkthrough ----------
function stepTo(k) {
  const sol = comp().solution;
  state.steps = Math.max(0, Math.min(k, sol.length));
  state.assisted = true;
  state.wires = sol.slice(0, state.steps).map(({ a, b, color }) => ({ a, b, color }));
  state.sel = null;
  invalidate(); render();
}
function toggleSteps() {
  if (state.steps !== null) { state.steps = null; render(); return; }
  stepTo(0);
}

// ---------- boot ----------
document.querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.swatch').forEach(x => x.setAttribute('aria-pressed', 'false'));
  b.setAttribute('aria-pressed', 'true'); state.color = b.dataset.color;
}));
$('btnTest').addEventListener('click', () => test(comp().toggles[0].key));
$('btnUndo').addEventListener('click', () => { state.wires.pop(); state.sel = null; state.steps = null; invalidate(); render(); });
$('btnReset').addEventListener('click', () => { clearBench(); invalidate(); render(); });
$('btnResetMcb').addEventListener('click', resetMcb);
$('btnLabels').addEventListener('click', () => { state.labels = state.labels === 'mark' ? 'train' : 'mark'; saveLabels(); render(); });
$('btnSteps').addEventListener('click', toggleSteps);
$('btnStepPrev').addEventListener('click', () => stepTo(state.steps - 1));
$('btnStepNext').addEventListener('click', () => stepTo(state.steps + 1));
$('btnStepAll').addEventListener('click', () => stepTo(comp().solution.length));
$('btnStepClose').addEventListener('click', () => { state.steps = null; render(); });
$('btnFree').addEventListener('click', () => { state.scenario = null; setBrief(null); setComponent(state.comp); renderSidebar(); });

installCanvasEvents({ state, getComp: comp, onCancel: () => { state.sel = null; render(); } });
setComponent('socket');
renderSidebar();
