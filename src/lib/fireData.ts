export type FireMode = 'detection' | 'egress' | 'suppression' | 'structure';
export type FireScenario = 'apartment' | 'kitchen' | 'garage';

export const FIRE_MODES: Array<{ id: FireMode; label: string; color: string; note: string }> = [
  { id: 'detection', label: 'Detection', color: '#51d6ff', note: 'Smoke, heat and aspirating detection by compartment.' },
  { id: 'egress', label: 'Egress', color: '#53f0be', note: 'Travel distance, exits, stairs and assembly point.' },
  { id: 'suppression', label: 'Suppression', color: '#45c4f5', note: 'Sprinklers, hydrants, hose reels and water supply.' },
  { id: 'structure', label: 'Structure', color: '#f4bd72', note: 'Compartmentation, fire resistance and spalling.' },
];

export const FIRE_SCENARIOS: Record<FireScenario, { label: string; note: string; alarm: string; evac: string; status: string }> = {
  apartment: { label: 'Apartment fire', note: 'Level 5 unit fire; compartmentation holding; stairs clear.', alarm: 'L5 · Zone 3', evac: '4 min 20 s', status: 'Contained' },
  kitchen: { label: 'Kitchen fire', note: 'Commercial kitchen; suppression activated; smoke extract on.', alarm: 'L1 · Kitchen', evac: '2 min 10 s', status: 'Suppressed' },
  garage: { label: 'Basement car fire', note: 'Basement garage; jet fan extract; fire service access.', alarm: 'B2 · Bay 4', evac: '5 min 40 s', status: 'Controlled' },
};

export const FIRE_FLOORS = [
  { id: 'B2', name: 'Basement 2', use: 'Car park', alarm: 'None', evac: '2 exits', status: 'Clear' },
  { id: 'L1', name: 'Level 1', use: 'Lobby / kitchen', alarm: 'Kitchen', evac: '2 exits', status: 'Suppressed' },
  { id: 'L2', name: 'Level 2', use: 'Office', alarm: 'None', evac: '2 stairs', status: 'Clear' },
  { id: 'L3', name: 'Level 3', use: 'Office', alarm: 'None', evac: '2 stairs', status: 'Clear' },
  { id: 'L4', name: 'Level 4', use: 'Office', alarm: 'None', evac: '2 stairs', status: 'Clear' },
  { id: 'L5', name: 'Level 5', use: 'Apartment', alarm: 'Zone 3', evac: '2 stairs', status: 'Fire' },
  { id: 'L6', name: 'Level 6', use: 'Roof plant', alarm: 'None', evac: '2 stairs', status: 'Clear' },
];

export const FIRE_SYSTEMS = [
  { id: 'DET', name: 'Detection', detail: 'Smoke + heat · addressable · 100% coverage', status: 'Alarm' },
  { id: 'SPR', name: 'Sprinklers', detail: 'Wet pipe · 68°C heads · 12 L/min/m²', status: 'Active' },
  { id: 'EXT', name: 'Smoke extract', detail: 'Stair pressurisation · garage jet fans', status: 'Active' },
  { id: 'HYD', name: 'Hydrants', detail: 'Tank 180 m³ · twin pumps · street hydrant', status: 'Ready' },
  { id: 'FRS', name: 'Fire service', detail: 'Access route · dry riser · lift lobby', status: 'On scene' },
];

export const FIRE_KPIS = [
  { label: 'Detection', value: '42', unit: 's', delta: 'alarm' },
  { label: 'Evacuation', value: '4:20', unit: 'min', delta: 'target 6' },
  { label: 'Sprinkler', value: '12', unit: 'L/min/m²', delta: 'design' },
  { label: 'Compartment', value: '120', unit: 'min', delta: 'FR 120' },
];

export const FIRE_ACTIONS = [
  { title: 'L5 compartment survey', impact: 'FR 120 verified', owner: 'Fire engineer', status: 'Live' },
  { title: 'Stair pressurisation test', impact: '50 Pa', owner: 'MEP', status: 'Pass' },
  { title: 'Evacuation drill', impact: '4 min 20 s', owner: 'HSE', status: 'Complete' },
  { title: 'Sprinkler valve check', impact: 'monthly', owner: 'O&M', status: 'Scheduled' },
];
