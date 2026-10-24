export type GroundMode = 'strata' | 'boreholes' | 'piles' | 'settlement';
export type GroundScenario = 'baseline' | 'groundwater' | 'excavation';

export const GROUND_MODES: Array<{ id: GroundMode; label: string; color: string; note: string }> = [
  { id: 'strata', label: 'Strata', color: '#f4bd72', note: 'Fill, marine clay, alluvium, decomposed granite and bedrock.' },
  { id: 'boreholes', label: 'Boreholes', color: '#51d6ff', note: 'SPT, groundwater and lab results by borehole.' },
  { id: 'piles', label: 'Piles', color: '#53f0be', note: 'Pile group, capacity, stiffness and load distribution.' },
  { id: 'settlement', label: 'Settlement', color: '#a991ff', note: 'Predicted settlement, differential movement and monitoring.' },
];

export const GROUND_SCENARIOS: Record<GroundScenario, { label: string; note: string; settlement: string; factor: string; status: string }> = {
  baseline: { label: 'Baseline', note: 'Service load with groundwater at -2.5 m.', settlement: '18 mm', factor: '2.4', status: 'Within limits' },
  groundwater: { label: 'Groundwater rise', note: 'Groundwater at -1.0 m; uplift and excavation stability checked.', settlement: '24 mm', factor: '2.1', status: 'Monitor' },
  excavation: { label: 'Deep excavation', note: '12 m basement; temporary works and wall deflection analysed.', settlement: '31 mm', factor: '1.8', status: 'Review' },
};

export const GROUND_LAYERS = [
  { id: 'L1', name: 'Fill', depth: '0–3 m', thickness: 3, color: '#8b7a5b', spt: '4–8', note: 'Loose fill; remove below podium.' },
  { id: 'L2', name: 'Marine clay', depth: '3–9 m', thickness: 6, color: '#5b7f7a', spt: '2–6', note: 'Soft compressible clay; settlement critical.' },
  { id: 'L3', name: 'Alluvium', depth: '9–16 m', thickness: 7, color: '#8c7b5a', spt: '12–24', note: 'Medium dense sand and silt.' },
  { id: 'L4', name: 'Decomposed granite', depth: '16–26 m', thickness: 10, color: '#7a6b58', spt: '30–60', note: 'Pile bearing stratum.' },
  { id: 'L5', name: 'Bedrock', depth: '26 m+', thickness: 8, color: '#4f5f62', spt: '>100', note: 'Moderately strong granite.' },
];

export const GROUND_BOREHOLES = [
  { id: 'BH-01', x: -10, z: -6, depth: 32, water: '2.4 m', spt: 'N=42', status: 'Complete' },
  { id: 'BH-02', x: 4, z: -4, depth: 34, water: '2.7 m', spt: 'N=55', status: 'Complete' },
  { id: 'BH-03', x: 12, z: 4, depth: 30, water: '2.2 m', spt: 'N=36', status: 'Complete' },
  { id: 'BH-04', x: -4, z: 8, depth: 28, water: '2.5 m', spt: 'N=48', status: 'Verification' },
];

export const GROUND_PILES = [
  { id: 'P-01', x: -4, z: -2, length: 28, capacity: '8.4 MN', settlement: '16 mm', status: 'Verified' },
  { id: 'P-02', x: 0, z: -2, length: 30, capacity: '9.1 MN', settlement: '14 mm', status: 'Verified' },
  { id: 'P-03', x: 4, z: -2, length: 29, capacity: '8.8 MN', settlement: '15 mm', status: 'Verified' },
  { id: 'P-04', x: -4, z: 2, length: 31, capacity: '9.4 MN', settlement: '13 mm', status: 'Tested' },
  { id: 'P-05', x: 0, z: 2, length: 32, capacity: '9.8 MN', settlement: '12 mm', status: 'Tested' },
  { id: 'P-06', x: 4, z: 2, length: 30, capacity: '9.2 MN', settlement: '14 mm', status: 'Verified' },
];

export const GROUND_KPIS = [
  { label: 'Boreholes', value: '4', unit: 'complete', delta: '1 verification' },
  { label: 'Piles', value: '6', unit: 'tested', delta: '9.2 MN avg' },
  { label: 'Settlement', value: '18', unit: 'mm', delta: 'limit 25' },
  { label: 'Safety factor', value: '2.4', unit: 'x', delta: '≥2.0' },
];

export const GROUND_ACTIONS = [
  { title: 'Borehole BH-04 verification', impact: 'confirm pile toe', owner: 'Geotech', status: 'Field' },
  { title: 'Settlement monitoring array', impact: 'weekly readings', owner: 'Instrumentation', status: 'Live' },
  { title: 'Marine clay treatment', impact: 'reduce settlement', owner: 'Design', status: 'Review' },
  { title: 'Pile load test P-05', impact: '9.8 MN verified', owner: 'Testing', status: 'Complete' },
];
