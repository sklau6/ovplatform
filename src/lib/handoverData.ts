export type HandoverMode = 'commissioning' | 'snags' | 'assets' | 'handover';
export type HandoverScenario = 'pre' | 'punch' | 'ready';

export const HANDOVER_MODES: Array<{ id: HandoverMode; label: string; color: string; note: string }> = [
  { id: 'commissioning', label: 'Commissioning', color: '#51d6ff', note: 'Systems tested, balanced and witnessed.' },
  { id: 'snags', label: 'Snags', color: '#ff7088', note: 'Defects, owners, due dates and close-out.' },
  { id: 'assets', label: 'Assets', color: '#53f0be', note: 'Asset register, tags, warranties and O&M.' },
  { id: 'handover', label: 'Handover', color: '#f4bd72', note: 'Certificates, keys, training and digital twin.' },
];

export const HANDOVER_SCENARIOS: Record<HandoverScenario, { label: string; note: string; snags: number; complete: string; status: string }> = {
  pre: { label: 'Pre-handover', note: 'Commissioning underway; snagging starts next week.', snags: 64, complete: '72%', status: 'Commissioning' },
  punch: { label: 'Punch list', note: 'Snagging complete; 28 items remain open.', snags: 28, complete: '88%', status: 'Snagging' },
  ready: { label: 'Ready to hand over', note: 'All critical systems witnessed; O&M and training complete.', snags: 4, complete: '98%', status: 'Ready' },
};

export const HANDOVER_SYSTEMS = [
  { id: 'HVAC', name: 'HVAC & BMS', floor: 'All', tests: '42 / 44', snags: 6, status: 'Commissioning', color: '#51d6ff' },
  { id: 'ELEC', name: 'Electrical', floor: 'All', tests: '28 / 30', snags: 4, status: 'Commissioning', color: '#f4bd72' },
  { id: 'FIRE', name: 'Fire & life safety', floor: 'All', tests: '18 / 18', snags: 1, status: 'Witnessed', color: '#ff7088' },
  { id: 'LIFT', name: 'Lifts', floor: 'Core', tests: '6 / 8', snags: 3, status: 'Testing', color: '#a991ff' },
  { id: 'WATER', name: 'Water & drainage', floor: 'All', tests: '14 / 14', snags: 2, status: 'Complete', color: '#45c4f5' },
  { id: 'FIT', name: 'Fit-out & finishes', floor: 'L1–L6', tests: '—', snags: 12, status: 'Snagging', color: '#53f0be' },
];

export const HANDOVER_KPIS = [
  { label: 'Commissioning', value: '88', unit: '%', delta: '+16 pts' },
  { label: 'Open snags', value: '28', unit: 'items', delta: '−36' },
  { label: 'Assets tagged', value: '4,820', unit: 'assets', delta: '96%' },
  { label: 'Handover', value: '98', unit: '%', delta: 'ready' },
];

export const HANDOVER_ACTIONS = [
  { title: 'BMS point-to-point test', impact: '44 points', owner: 'MEP', status: 'Live' },
  { title: 'Lift load test witness', impact: '2 lifts', owner: 'Commissioning', status: 'Booked' },
  { title: 'O&M manual upload', impact: '96% complete', owner: 'Digital', status: 'Live' },
  { title: 'Tenant training', impact: '48 staff', owner: 'Operations', status: 'Scheduled' },
];
