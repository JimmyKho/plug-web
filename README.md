# Wiring Bench MY

An interactive, browser-only trainer for Malaysian domestic electrical wiring. Draw wires from the incoming supply to the back of a socket, switch or appliance, press **Test**, and watch the result: a lit lamp, a glowing LED, or a tripped MCB with an explanation of the hazard.

- **Live bench:** https://jimmykho.github.io/plug-web/
- **Wiring 101 primer:** https://jimmykho.github.io/plug-web/wiring101.html

Built around the harmonised colour code used in Malaysia under MS IEC 60364 and MS 2112 (SIRIM-certified cables), as enforced by Suruhanjaya Tenaga:

| Conductor | Colour |
|---|---|
| Live (L) | Brown |
| Neutral (N) | Blue |
| Earth (⏚ / E) | Green / yellow |
| Switched live (switch drop) | Blue, sleeved brown |
| ELV DC (+ / −) | Red / black |

## What you can wire

| Component | Terminals | Typical fault outcomes |
|---|---|---|
| 13 A switched socket (BS 1363 / MS 589) | L, N, ⏚ | Reversed polarity, missing earth, L–N short |
| 1-way lighting switch | COM, L1, backbox ⏚, loop/N connector, lampholder | Switch in neutral, bypassed switch |
| 2-way staircase lighting | Two switches with COM/L1/L2, lamp, connector | Wired as 1-way (one switch dead), strapper short |
| Loop-in ceiling rose | LOOP IN, N, SW L, ⏚, pendant, wall switch | Pendant on the loop terminal, unsleeved switch return |
| Switch + LED strip via 12 V driver | Switch, driver L/N/⏚, +V/−V, strip +12V/GND | Mains on the strip, DC short, reversed polarity |
| Socket on a ring final circuit | Two supply legs, socket L/N/⏚ | Broken ring (works, but cable unprotected) |
| 20 A double-pole isolator + water heater | SUPPLY L/N, LOAD L/N, ⏚, heater | Only one pole switched, no earth in a wet area |
| 13 A switched fused spur + cooker hood | FEED L/N, LOAD L/N, ⏚, appliance | Supply and load swapped (live fuse carrier) |

Every circuit is evaluated electrically, not against a fixed answer key. Wires and switch contacts are merged into nets with a union-find, then each net is tagged by which supply conductor it reaches. That lets the bench judge any topology you draw, in every switch position.

## Features

- **Rear view with real markings.** Terminals show what is embossed on the product (⏚ for earth, COM/L1/L2, LOOP IN, SW L, FEED/LOAD, +V/−V) and the incoming cable shows bare coloured cores with no letters. A toggle switches to training letters (L, N, E).
- **Scenarios.** 21 tracked tasks in four groups: builds, fault-finding call-outs phrased as customer complaints (pre-wired with the fault), lighting and power circuits. Ticks persist in the browser.
- **Walkthrough.** *Show correct wiring* lays the solution down one wire at a time with the reason for each step. Scenarios solved with the walkthrough are not ticked.
- **Outcomes.** Correct circuits animate (LED, lamp, strip, heater, fan). Hazards that still "work" get a red report. Shorts flash the canvas and trip the MCB until you reset it. Right wiring in wrong colours gets an amber *fails inspection* result.
- **Wiring 101.** A standalone primer covering supply, conductors, colours old and new, cable sizes and breakers, circuit types, terminal markings, switching rules, earthing and RCDs, safe isolation, testing and common faults.

## Running it

The app is static ES modules, so it needs to be served over HTTP (opening `index.html` from the filesystem blocks module imports in most browsers).

```sh
npm start            # python3 -m http.server 8000
# then open http://localhost:8000/
npm test             # headless evaluator checks (Node 18+)
```

Deployment is GitHub Pages from the root of `main`. Push to `main` and the site updates.

## Project layout

```
index.html              the bench page (markup only)
wiring101.html          the primer article
css/app.css             theme tokens, layout, canvas and panel styles
js/main.js              entry point: state ↔ engine ↔ UI
js/state.js             bench state and per-browser preferences
js/engine.js            net builder, short detection, colour check, lampEval, runCircuit
js/colors.js            conductor colours and their supply tags
js/copy.js              shared report copy and regulation reference
js/supply.js            incoming supply blocks (single feed, ring legs)
js/svg.js               SVG helpers and shared drawings (socket back, lamp, switch plate, ⏚)
js/ui/canvas.js         canvas rendering, ghost wire, tooltips
js/ui/panels.js         MCB, report, scenario list, walkthrough, toolbar, tabs
js/scenarios/index.js   registry
js/scenarios/*.js       one file per scenario module
test/engine.test.js     headless checks
```

### Adding a scenario

Create `js/scenarios/<name>.js` exporting `{ component, scenarios }` and add it to the list in `js/scenarios/index.js`. A component declares:

| Field | Purpose |
|---|---|
| `id`, `name`, `group`, `mcb` | Tab label, sidebar label, breaker rating shown on the MCB |
| `supply` | `SUPPLY3` or `SUPPLY_RING` from `supply.js` |
| `sources` | Optional extra tagged sources, e.g. a driver's `+` / `−` output |
| `terminals` | `{ id, x, y, label, mark?, tip }`. `label` is the training letter; `mark` overrides the product marking (`''` for unmarked, default `⏚` for `E`) |
| `toggles` | Switch contacts the Test button flips, e.g. `[{ key: 'on', label: 'wall switch' }]` |
| `links(toggles)` | Internal connections for a given toggle state |
| `draw(g)` | Static SVG for the accessory |
| `evaluate(N)` | `N(overrides)` returns a net lookup; return `ok(...)`, `fail(...)` or `inc()` |
| `animate(result, state)` | Light the lamp, spin the fan, move the rocker |
| `solution` | Ordered `{ a, b, color, why }` steps for the walkthrough |

Each scenario item is `{ id, group, type: 'build' | 'fault' | 'demo', title, brief, preset?, goal? }`. The test suite automatically checks that every solution evaluates OK and every preset reports a fault.

## Disclaimer

This is an educational simulation. In Malaysia, fixed electrical work must be carried out or supervised by a Suruhanjaya Tenaga registered wireman under the Electricity Regulations 1994. Regulation and standard references in the reports and the primer are written from general knowledge of the framework and should be checked against current documents before use in formal training. Always isolate and prove dead before touching terminals.
