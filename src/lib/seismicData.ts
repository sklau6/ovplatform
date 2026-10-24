export type SeismicMode = 'drift' | 'isolation' | 'damping' | 'damage';
export type SeismicScenario = 'minor' | 'moderate' | 'major';

export const SEISMIC_MODES: Array<{ id: SeismicMode; label: string; color: string; note: string }> = [
  { id: 'drift', label: 'Drift', color: '#f4bd72', note: 'Inter-storey drift and roof displacement.' },
  { id: 'isolation', label: 'Isolation', color: '#51d6ff', note: 'Base isolators, period shift and displacement.' },
  { id: 'damping', label: 'Damping', color: '#53f0be', note: 'Viscous dampers, energy dissipation and demand.' },
  { id: 'damage', label: 'Damage', color: '#ff7088', note: 'Plastic hinges, damage state and resilience.' },
];

export const SEISMIC_SCENARIOS: Record<SeismicScenario, { label: string; note: string; pga: string; drift: string; accel: string; status: string }> = {
  minor: { label: 'Minor · 1-in-50 yr', note: 'Serviceability earthquake; structure remains elastic.', pga: '0.08 g', drift: '1/850', accel: '0.14 g', status: 'Elastic' },
  moderate: { label: 'Moderate · 1-in-475 yr', note: 'Design earthquake; isolators and dampers active.', pga: '0.18 g', drift: '1/420', accel: '0.24 g', status: 'Design' },
  major: { label: 'Major · 1-in-2475 yr', note: 'Maximum considered earthquake; damage control and evacuation.', pga: '0.32 g', drift: '1/210', accel: '0.41 g', status: 'Review' },
};

export const SEISMIC_FLOORS = [
  { id: 'F1', name: 'Level 1', drift: '1/980', accel: '0.11 g', damage: 'None', status: 'Elastic' },
  { id: 'F2', name: 'Level 2', drift: '1/860', accel: '0.13 g', damage: 'None', status: 'Elastic' },
  { id: 'F3', name: 'Level 3', drift: '1/740', accel: '0.15 g', damage: 'None', status: 'Elastic' },
  { id: 'F4', name: 'Level 4', drift: '1/650', accel: '0.17 g', damage: 'Minor', status: 'Monitor' },
  { id: 'F5', name: 'Level 5', drift: '1/520', accel: '0.20 g', damage: 'Minor', status: 'Monitor' },
  { id: 'F6', name: 'Level 6', drift: '1/420', accel: '0.24 g', damage: 'Moderate', status: 'Review' },
  { id: 'F7', name: 'Level 7', drift: '1/360', accel: '0.27 g', damage: 'Moderate', status: 'Review' },
  { id: 'F8', name: 'Roof', drift: '1/320', accel: '0.30 g', damage: 'Moderate', status: 'Review' },
];

export const SEISMIC_SYSTEMS = [
  { id: 'ISO', name: 'Base isolators', type: 'Isolation', detail: '12 LRB isolators · 420 mm design displacement', status: 'Active' },
  { id: 'DMP', name: 'Viscous dampers', type: 'Damping', detail: '8 dampers · 1,200 kN · 18% damping', status: 'Active' },
  { id: 'CORE', name: 'RC core', type: 'Structure', detail: 'Shear wall core · Grade 60 rebar', status: 'Elastic' },
  { id: 'FRAME', name: 'Moment frame', type: 'Structure', detail: 'Steel frame · reduced beam sections', status: 'Monitor' },
];

export const SEISMIC_KPIS = [
  { label: 'PGA', value: '0.18', unit: 'g', delta: 'design' },
  { label: 'Drift', value: '1/420', unit: 'ratio', delta: 'limit 1/250' },
  { label: 'Roof accel', value: '0.24', unit: 'g', delta: '−38%' },
  { label: 'Isolator disp.', value: '420', unit: 'mm', delta: 'design' },
];

export const SEISMIC_ACTIONS = [
  { title: 'Isolator displacement check', impact: '420 mm', owner: 'Structural', status: 'Complete' },
  { title: 'Damper inspection plan', impact: '8 units', owner: 'O&M', status: 'Scheduled' },
  { title: 'Non-structural bracing', impact: 'ceiling & MEP', owner: 'Delivery', status: 'Review' },
  { title: 'Post-event assessment', impact: 'rapid tag', owner: 'Resilience', status: 'Live' },
];
