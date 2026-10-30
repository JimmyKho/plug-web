// 13 A socket on a 32 A ring final circuit: both legs land on every terminal.
import { SUPPLY_RING } from '../supply.js';
import { socketGfx, socketAnim } from '../svg.js';
import { ok, fail, inc, powered } from '../engine.js';
import { TXT } from '../copy.js';
import { SOCKET_TERMS } from './socket.js';

const OK = { title: 'Correct. Ring continuity restored at this socket.', body: 'Both legs of each conductor share a terminal, so load current splits two ways and the 2.5 mm² cable is protected by the 32 A MCB as the standard allows.', points: ['A ring must be tested end to end (r1, rn, r2) before energising, not just at one socket.', 'Spurs: at most one unfused spur per socket on the ring.'] };
const BROKEN_RING = { title: 'Broken ring. Socket works but the cable is unprotected.', body: 'Only one leg reaches this socket, so part of the ring is now a radial in 2.5 mm² cable behind a 32 A MCB. Under heavy load the cable can run above its rating without tripping anything. This is a fire risk that shows no symptom day to day.', points: ['2.5 mm² PVC twin and earth is rated around 27 A; a ring is allowed on 32 A only because current shares between two legs.', 'An end-to-end continuity test (r1, rn, r2) finds this; a plug-in socket tester does not.'] };

const W = (a, b, color) => ({ a, b, color });

export default {
  component: {
    id: 'ring', group: 'Power', name: 'Ring final socket', mcb: 'B32',
    supply: SUPPLY_RING, terminals: SOCKET_TERMS,
    toggles: [{ key: 'on', label: 'socket rocker' }],
    links: () => [],
    draw: socketGfx,
    evaluate(N) {
      const n = N({}); const L = n('SK_L'), Nn = n('SK_N'), E = n('SK_E');
      if (L.has('N') && Nn.has('L')) return fail(TXT.reversed);
      if (L.has('E') || Nn.has('E')) return fail(TXT.earthAsConductor);
      if (!powered(n, 'SK_L', 'SK_N')) return inc();
      if (!E.has('E')) return fail(TXT.noEarth);
      const both = (t, a, b) => n.connected(t, a) && n.connected(t, b);
      if (both('SK_L', 'A_L', 'B_L') && both('SK_N', 'A_N', 'B_N') && both('SK_E', 'A_E', 'B_E')) return ok(OK);
      return fail(BROKEN_RING);
    },
    animate: (r, s) => socketAnim(s.on, r && r.kind === 'ok'),
    solution: [
      { ...W('A_E', 'SK_E', 'E'), why: 'Leg A earth into ⏚. Sleeve bare CPCs green/yellow before they enter the box.' },
      { ...W('B_E', 'SK_E', 'E'), why: 'Leg B earth into the same terminal. Two conductors per terminal is normal on a ring.' },
      { ...W('A_L', 'SK_L', 'L'), why: 'Leg A brown into L.' },
      { ...W('B_L', 'SK_L', 'L'), why: 'Leg B brown into L beside it. Twist nothing; lay the cores side by side and clamp.' },
      { ...W('A_N', 'SK_N', 'N'), why: 'Leg A blue into N.' },
      { ...W('B_N', 'SK_N', 'N'), why: 'Leg B blue into N. Then prove the ring end to end with an r1, rn, r2 test before energising.' },
    ],
  },
  scenarios: [
    { id: 'p1', group: 'Power circuits', type: 'build', title: 'Socket on a ring final', brief: 'Both legs of the 32 A ring pass through this socket. Two conductors per terminal. Pass: ring continuity through L, N and E.' },
    { id: 'p2', group: 'Power circuits', type: 'fault', title: '"Sockets work but cable felt warm"', brief: 'Renovator left one leg disconnected. Everything works, which is the problem. Pass: ring restored.',
      preset: [W('A_L', 'SK_L', 'L'), W('A_N', 'SK_N', 'N'), W('A_E', 'SK_E', 'E')] },
  ],
};
