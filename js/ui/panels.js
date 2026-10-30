// Sidebar and toolbar panels: MCB, report, scenario list, walkthrough, controls.
import { REG } from '../copy.js';
import { colorByKey } from '../colors.js';
import { terminalById } from '../engine.js';

const $ = (id) => document.getElementById(id);

// ---------- MCB ----------
export function setMcb(tripped, rating) {
  const mcb = $('mcbSvg');
  mcb.classList.toggle('tripped', tripped);
  mcb.classList.toggle('on', !tripped);
  $('mcbLed').setAttribute('fill', tripped ? 'var(--danger)' : 'var(--ok)');
  $('mcbState').textContent = tripped ? 'MCB TRIPPED · supply isolated' : 'MCB closed · supply live';
  $('btnResetMcb').hidden = !tripped;
  if (rating) $('mcbRating').textContent = rating;
}

// ---------- report ----------
const ICON = { ok: '✅', warn: '⚠️', fail: '⛔', danger: '💥', incomplete: '○', neutral: '↺' };
const CLS = { ok: 'ok', warn: 'warn', fail: 'danger', danger: 'danger' };

export function setReport(r, note) {
  const box = $('report');
  if (!r) {
    box.className = 'report';
    box.innerHTML = '<h3>Not tested yet</h3><p>Wire the component, then press <b>Test circuit</b>.</p>';
    return;
  }
  box.className = 'report ' + (CLS[r.kind] || '');
  box.innerHTML = `<h3>${ICON[r.kind] || ''} ${r.title}</h3><p>${r.body}</p>` +
    (r.points && r.points.length ? `<ul>${r.points.map(p => `<li>${p}</li>`).join('')}</ul>` : '') +
    (['ok', 'incomplete', 'neutral'].includes(r.kind) ? '' : `<div class="reg">${REG}</div>`) +
    (note ? `<div class="${note.kind === 'done' ? 'done-line' : 'assist-line'}">${note.text}</div>` : '');
}

// ---------- scenarios ----------
export function renderScenarioList({ groups, components, active, done, onPick }) {
  const list = $('scnList'); list.innerHTML = '';
  groups.forEach(g => {
    const grp = document.createElement('div'); grp.className = 'scn-group';
    grp.innerHTML = `<div class="eyebrow mb-1">${g.group}</div>`;
    g.items.forEach(sc => {
      const b = document.createElement('button');
      b.className = 'scn' + (done.has(sc.id) ? ' done' : '');
      b.setAttribute('aria-current', String(active === sc.id));
      const badge = sc.type === 'fault' ? '<span class="badge fault">fault</span>' : sc.type === 'demo' ? '<span class="badge">demo</span>' : '<span class="badge build">build</span>';
      b.innerHTML = `<span class="mark">${done.has(sc.id) ? '✓' : ''}</span><span>${sc.title}${badge}<small>${components[sc.comp].name}</small></span>`;
      b.addEventListener('click', () => onPick(sc));
      grp.appendChild(b);
    });
    list.appendChild(grp);
  });
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  $('scnCount').textContent = `· ${done.size}/${total} done`;
}

export function setBrief(sc) {
  const brief = $('brief');
  if (!sc) { brief.hidden = true; return; }
  brief.hidden = false;
  brief.innerHTML = `<b>${sc.title}</b><br>${sc.brief}` +
    (sc.preset ? '<br><span style="color:var(--muted)">Pre-wired as found on site. Test first to see the symptom, then fix.</span>' : '');
}

// ---------- walkthrough ----------
const termName = (comp, id) => {
  const t = terminalById(comp, id);
  const leg = id.startsWith('A_') ? 'Leg A ' : id.startsWith('B_') ? 'Leg B ' : t.tag ? 'Supply ' : '';
  return leg + t.label;
};

export function renderSteps({ comp, steps, onGo }) {
  const panel = $('steps');
  panel.hidden = steps === null;
  if (steps === null) return;
  const sol = comp.solution;
  $('stepsTitle').textContent = comp.name;
  const list = $('stepList'); list.innerHTML = '';
  sol.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'step' + (i < steps ? ' done' : '') + (i === steps - 1 ? ' current' : '');
    const c = colorByKey(s.color);
    b.innerHTML = `<span class="num">${i + 1}</span><span><span class="chip chip-${s.color}"></span><b>${c.name}</b>: ${termName(comp, s.a)} → ${termName(comp, s.b)}<small>${s.why}</small></span>`;
    b.addEventListener('click', () => onGo(i + 1));
    li.appendChild(b); list.appendChild(li);
  });
  $('btnStepPrev').disabled = steps === 0;
  $('btnStepNext').disabled = steps >= sol.length;
  $('btnStepAll').disabled = steps >= sol.length;
}

// ---------- toolbar ----------
export function renderToolbar({ state, comp, onToggle }) {
  const t0 = comp.toggles[0];
  const btn = $('btnTest');
  btn.textContent = state.tripped ? 'Supply off. Reset the MCB first' : `⚡ Test / flip ${t0.label} (${state[t0.key] ? 'ON' : 'OFF'})`;
  btn.disabled = state.tripped;
  const extra = $('extraToggles'); extra.innerHTML = '';
  comp.toggles.slice(1).forEach(t => {
    const b = document.createElement('button');
    b.className = 'btn'; b.disabled = state.tripped;
    b.textContent = `Flip ${t.label} (${state[t.key] ? 'ON' : 'OFF'})`;
    b.addEventListener('click', () => onToggle(t.key));
    extra.appendChild(b);
  });
  $('btnLabels').textContent = state.labels === 'mark' ? 'Labels: product markings' : 'Labels: training letters';
  $('btnSteps').textContent = state.steps === null ? 'Show correct wiring' : 'Hide walkthrough';
}

export function renderTabs({ components, active, onPick }) {
  const tabs = $('tabs'); tabs.innerHTML = '';
  Object.values(components).forEach(c => {
    const b = document.createElement('button');
    b.className = 'tab'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(c.id === active));
    b.textContent = c.name;
    b.addEventListener('click', () => onPick(c.id));
    tabs.appendChild(b);
  });
}
