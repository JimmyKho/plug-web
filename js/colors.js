// Conductor colours per MS IEC 60364 / MS 2112 harmonised code, plus ELV DC.
export const COLORS = [
  { key: 'L', name: 'Brown', role: 'Live (L)', tag: 'L', stroke: 'var(--wire-L)' },
  { key: 'N', name: 'Blue', role: 'Neutral (N)', tag: 'N', stroke: 'var(--wire-N)' },
  { key: 'E', name: 'Green / Yellow', role: 'Earth (E)', tag: 'E' },
  { key: 'S', name: 'Blue, brown-sleeved', role: 'switched live', tag: 'L' },
  { key: 'R', name: 'Red', role: 'ELV DC positive (+)', tag: '+', stroke: 'var(--wire-R)', thin: true },
  { key: 'K', name: 'Black', role: 'ELV DC negative (−)', tag: '−', stroke: 'var(--wire-K)', thin: true },
];
export const colorByKey = (k) => COLORS.find(c => c.key === k);
export const COLOR_TAG = Object.fromEntries(COLORS.map(c => [c.key, c.tag]));

/** Stroke used for an incoming cable core of a given supply tag. */
export const CORE_STROKE = { L: 'var(--wire-L)', N: 'var(--wire-N)', E: 'var(--wire-E-g)' };
