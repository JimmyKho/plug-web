// Registry. To add a scenario: create a file in this folder exporting { component, scenarios } and list it here.
import socket from './socket.js';
import oneway from './oneway.js';
import twoway from './twoway.js';
import rose from './rose.js';
import ledstrip from './ledstrip.js';
import ring from './ring.js';
import dpswitch from './dpswitch.js';
import fcu from './fcu.js';

const MODULES = [socket, oneway, twoway, rose, ledstrip, ring, dpswitch, fcu];

/** Components keyed by id, in tab order. */
export const COMPONENTS = Object.fromEntries(MODULES.map(m => [m.component.id, m.component]));

/** Sidebar order of scenario groups. */
export const GROUP_ORDER = ['Basics', 'Fault finding', 'Lighting', 'Power circuits'];

/** Every scenario, each tagged with its component id. */
export const ALL_SCENARIOS = MODULES.flatMap(m => m.scenarios.map(s => ({ ...s, comp: m.component.id })));

/** Scenarios grouped for the sidebar, in GROUP_ORDER. */
export const SCENARIO_GROUPS = GROUP_ORDER
  .map(group => ({ group, items: ALL_SCENARIOS.filter(s => s.group === group) }))
  .filter(g => g.items.length);
