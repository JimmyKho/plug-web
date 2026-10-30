# Wiring Bench MY

An interactive, browser-only trainer for Malaysian domestic electrical wiring. Draw wires from the incoming supply to the back of a socket, switch or appliance, press **Test**, and watch the result: a lit lamp, a glowing LED, or a tripped MCB with an explanation of the hazard.

**Live demo:** https://jimmykho.github.io/plug-web/

Built around the harmonised colour code used in Malaysia under MS IEC 60364 and MS 2112 (SIRIM-certified cables), as enforced by Suruhanjaya Tenaga:

| Conductor | Colour |
|---|---|
| Live (L) | Brown |
| Neutral (N) | Blue |
| Earth (E) | Green / yellow |
| Switched live (switch drop) | Blue, sleeved brown |
| ELV DC (+ / −) | Red / black |

## What you can wire

| Component | Terminals | Typical fault outcomes |
|---|---|---|
| 13 A switched socket (BS 1363 / MS 589) | L, N, E | Reversed polarity, missing earth, L–N short |
| 1-way lighting switch | COM, L1, backbox E, loop/N connector, lampholder L/N | Switch in neutral, bypassed switch |
| 2-way staircase lighting | Two switches with COM/L1/L2, lamp, connector | Wired as 1-way (one switch dead), strapper short |
| Loop-in ceiling rose | LOOP, N, SW L, E, pendant, wall switch | Pendant on the loop terminal, unsleeved switch return |
| Switch + LED strip via 12 V driver | Switch, driver L/N/E, V+/V−, strip +/− | Mains on the strip, DC short, reversed polarity |
| Socket on a ring final circuit | Two supply legs, socket L/N/E | Broken ring (works, but cable unprotected) |
| 20 A double-pole isolator + water heater | L/N IN, L/N OUT, E, heater L/N/E | Only one pole switched, no earth in a wet area |
| 13 A switched fused spur + cooker hood | L/N IN, L/N LOAD, E, appliance | Supply and load swapped (live fuse carrier) |

Every circuit is evaluated electrically, not against a fixed answer key. Wires and switch contacts are merged into nets with a union-find, then each net is tagged by which supply conductor it reaches. That lets the bench judge any topology you draw, in every switch position.

## Scenarios

The sidebar lists 21 tracked scenarios in four groups:

- **Basics**: wire a socket, wire a switch, trip the MCB on purpose.
- **Fault finding**: pre-wired faults phrased as customer complaints ("Kettle still tingles when switched off", "Plumber got a shock from the heater"). Test first to see the symptom, then fix it.
- **Lighting** and **Power circuits**: build tasks for the advanced components plus their own fault call-outs.

Completed scenarios are ticked and remembered in the browser's local storage. "Free bench" clears the scenario and lets you wire any component without a brief.

## Outcomes

| State | What happens |
|---|---|
| Correct | Socket LED turns green, lamp or LED strip lights, heater or hood runs. |
| Hazard, no trip | Red report explaining why the circuit "works" but is dangerous (reversed polarity, missing earth, switched neutral, broken ring, and so on). |
| Short circuit | Flash on the canvas, the MCB lever drops, the supply is dead until you press **Reset MCB**. |
| Wrong colours | Amber "fails inspection" report when the circuit is right but the conductor colours are not. |

## Running it

There is nothing to build. Open `index.html` in a browser, or serve the folder with any static server. The page loads Tailwind and two Google fonts from CDNs; everything else is inline.

```sh
# optional local server
python3 -m http.server 8000
# then open http://localhost:8000/
```

Deployment is GitHub Pages from the root of `main`. Push to `main` and the site updates.

## Project layout

```
index.html   the whole app: styles, SVG canvas, circuit engine, scenarios, copy
README.md
```

Inside `index.html` the script is organised as:

- `SUPPLY3` / `SUPPLY_RING`: incoming supply terminal blocks.
- `COMPONENTS`: one entry per accessory with `terminals`, `toggles`, `links(state)` for internal switch contacts, `draw(g)`, `evaluate(N)` and `animate(result, state)`.
- `TXT`: every report title, body and bullet list, with regulation references.
- `SCENARIOS`: build and fault tasks, each pointing at a component and an optional `preset` of wires.
- `buildNets`, `detectShort`, `colourFault`, `runTest`: the circuit engine.

To add a component, add an entry to `COMPONENTS` and, if it has its own source such as a driver output, list it under `sources` so its terminals get tagged. To add a scenario, add an item to `SCENARIOS`.

## Disclaimer

This is an educational simulation. In Malaysia, fixed electrical work must be carried out or supervised by a Suruhanjaya Tenaga registered wireman under the Electricity Regulations 1994. Regulation and standard references in the reports are written from general knowledge of the framework and should be checked against current documents before use in formal training. Always isolate and prove dead before touching terminals.
