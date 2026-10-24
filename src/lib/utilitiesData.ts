export type UtilitiesMode = 'network' | 'clashes' | 'depth' | 'sensors';
export type UtilitiesScenario = 'base' | 'excavation' | 'emergency';

export const UTILITIES_MODES: Array<{ id: UtilitiesMode; label: string; color: string; note: string }> = [
  { id: 'network', label: 'Network', color: '#51d6ff', note: 'Water, power, telecom, gas, drainage and cooling.' },
  { id: 'clashes', label: 'Clashes', color: '#ff7088', note: 'Utility clashes, clearances and protection.' },
  { id: 'depth', label: 'Depth', color: '#f4bd72', note: 'Cover, alignment and excavation risk.' },
  { id: 'sensors', label: 'Sensors', color: '#53f0be', note: 'Pressure, flow, temperature and leak detection.' },
];

export const UTILITIES_SCENARIOS: Record<UtilitiesScenario, { label: string; note: string; clashes: number; cover: string; status: string }> = {
  base: { label: 'Base network', note: 'Utilities coordinated; two clearance issues under review.', clashes: 2, cover: '1.2–4.8 m', status: 'Coordinated' },
  excavation: { label: 'Excavation', note: 'Trench open; utility protection and permit conditions active.', clashes: 4, cover: '1.2 m', status: 'Permit' },
  emergency: { label: 'Water burst', note: 'Burst main; isolation valves closed; traffic diversion.', clashes: 1, cover: '2.4 m', status: 'Emergency' },
};

export const UTILITIES = [
  { id: 'WAT', name: 'Potable water', depth: 1.6, diameter: '300 mm', status: 'Live', sensor: 'Pressure 4.2 bar', color: '#45c4f5' },
  { id: 'PWR', name: '11 kV power', depth: 1.2, diameter: '3 × 185 mm²', status: 'Live', sensor: 'Load 64%', color: '#f4bd72' },
  { id: 'TEL', name: 'Telecom ducts', depth: 1.0, diameter: '4 × 100 mm', status: 'Live', sensor: 'No alarm', color: '#a991ff' },
  { id: 'GAS', name: 'Gas main', depth: 1.4, diameter: '150 mm', status: 'Live', sensor: '0 ppm', color: '#ff9f43' },
  { id: 'DRN', name: 'Drainage', depth: 3.2, diameter: '600 mm', status: 'Live', sensor: 'Flow 38%', color: '#53f0be' },
  { id: 'DCS', name: 'District cooling', depth: 2.2, diameter: '2 × 400 mm', status: 'Commissioning', sensor: '6.2°C', color: '#51d6ff' },
];

export const UTILITIES_KPIS = [
  { label: 'Utilities', value: '6', unit: 'networks', delta: '1 commissioning' },
  { label: 'Clashes', value: '2', unit: 'open', delta: 'clearance' },
  { label: 'Minimum cover', value: '1.0', unit: 'm', delta: 'telecom' },
  { label: 'Leak alarms', value: '0', unit: 'active', delta: 'monitored' },
];

export const UTILITIES_ACTIONS = [
  { title: 'Power/water clearance', impact: '0.3 m', owner: 'Utilities', status: 'Review' },
  { title: 'Trial hole at chainage 120', impact: 'confirm depth', owner: 'Site', status: 'Booked' },
  { title: 'District cooling flush', impact: 'DCS sector 2', owner: 'MEP', status: 'Commissioning' },
  { title: 'Leak sensor calibration', impact: '6 sensors', owner: 'Operations', status: 'Live' },
];
