// 13 A switched socket outlet (BS 1363 / MS 589) on a radial.
import { SUPPLY3 } from '../supply.js';
import { socketGfx, socketAnim } from '../svg.js';
import { ok, fail, inc, only, powered } from '../engine.js';
import { TXT } from '../copy.js';

export const SOCKET_TERMS = [
  { id: 'SK_E', x: 560, y: 150, label: 'E', tip: '<b>⏚ (E)</b> Socket earth terminal, marked with the IEC earth symbol rather than a letter. Connects to the top (longest) pin of the BS 1363 plug and the appliance\'s exposed metal.' },
  { id: 'SK_L', x: 460, y: 290, label: 'L', tip: '<b>L</b> Socket live terminal. Feeds the switched, fused side of the plug. Viewed from the rear it sits on the left.' },
  { id: 'SK_N', x: 660, y: 290, label: 'N', tip: '<b>N</b> Socket neutral terminal. Viewed from the rear it sits on the right.' },
];

const OK = { title: 'Correct. Socket is live and safe.', body: 'L, N and E land on the right terminals with the right colours. The plug\'s fuse and the socket rocker are both in the live conductor, so an appliance is fully isolated when switched off.', points: ['Earth pin makes first and breaks last on a BS 1363 plug.', 'Tighten terminals to the stated torque and leave no bare copper visible.'] };

const W = (a, b, color) => ({ a, b, color });

export default {
  component: {
    id: 'socket', group: 'Basics', name: '13 A socket', mcb: 'C20',
    supply: SUPPLY3, terminals: SOCKET_TERMS,
    toggles: [{ key: 'on', label: 'socket rocker' }],
    links: () => [],
    draw: socketGfx,
    evaluate(N) {
      const n = N({}); const L = n('SK_L'), Nn = n('SK_N'), E = n('SK_E');
      if (powered(n, 'SK_L', 'SK_N') && only(E, 'E')) return ok(OK);
      if (L.has('N') && Nn.has('L')) return fail(TXT.reversed);
      if (powered(n, 'SK_L', 'SK_N') && !E.has('E')) return fail(TXT.noEarth);
      if (L.has('E') || Nn.has('E')) return fail(TXT.earthAsConductor);
      return inc();
    },
    animate: (r, s) => socketAnim(s.on, r && r.kind === 'ok'),
    solution: [
      { ...W('SUP_E', 'SK_E', 'E'), why: 'Earth first. The green/yellow core goes to the terminal marked ⏚ at the top. Land the earth before anything that can become live.' },
      { ...W('SUP_L', 'SK_L', 'L'), why: 'Brown to L. Viewed from the rear, L is on the left. This feeds the fused, switched side of the plug.' },
      { ...W('SUP_N', 'SK_N', 'N'), why: 'Blue to N on the right. Check no strands are loose, then tighten both screws and tug-test each core.' },
    ],
  },
  scenarios: [
    { id: 'b1', group: 'Basics', type: 'build', title: 'Wire a 13 A socket', brief: 'New socket on a radial. Land L, N and E with the right colours. Pass: LED lights green when the rocker is on.' },
    { id: 'b3', group: 'Basics', type: 'demo', goal: 'trip', title: 'Make the MCB trip on purpose', brief: 'Create a live-to-neutral short at the socket terminals and test. Watch the breaker, then reset it. Pass: MCB trips.' },
    { id: 'f1', group: 'Fault finding', type: 'fault', title: '"Kettle still tingles when switched off"', brief: 'Socket wired by a previous occupant. The tester shows a fault. Find it, fix it, test. Pass: socket LED green.',
      preset: [W('SUP_L', 'SK_N', 'L'), W('SUP_N', 'SK_L', 'N'), W('SUP_E', 'SK_E', 'E')] },
    { id: 'f4', group: 'Fault finding', type: 'fault', title: '"Socket tester shows two lights, not three"', brief: 'Plug-in tester reports a missing conductor. Pass: all three conductors correct.',
      preset: [W('SUP_L', 'SK_L', 'L'), W('SUP_N', 'SK_N', 'N')] },
    { id: 'f5', group: 'Fault finding', type: 'fault', title: '"Everything works, inspector failed it"', brief: 'The socket passes a plug-in tester. The inspector opened it and refused to sign. Pass: wiring correct and compliant.',
      preset: [W('SUP_L', 'SK_L', 'N'), W('SUP_N', 'SK_N', 'L'), W('SUP_E', 'SK_E', 'E')] },
  ],
};
