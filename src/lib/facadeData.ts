export type FacadeMode = 'thermal' | 'structural' | 'water' | 'install';
export type FacadeScenario = 'wind' | 'rain' | 'heat';

export const FACADE_MODES: Array<{ id: FacadeMode; label: string; color: string; note: string }> = [
  { id: 'thermal', label: 'Thermal', color: '#f4bd72', note: 'U-value, thermal bridging, solar gain and condensation risk.' },
  { id: 'structural', label: 'Structural', color: '#51d6ff', note: 'Wind load, mullion deflection, brackets and movement.' },
  { id: 'water', label: 'Water', color: '#45c4f5', note: 'Rain penetration, drainage, gaskets and pressure equalisation.' },
  { id: 'install', label: 'Install', color: '#53f0be', note: 'Unitised panels, sequencing, tolerances and QA.' },
];

export const FACADE_SCENARIOS: Record<FacadeScenario, { label: string; note: string; wind: string; water: string; status: string }> = {
  wind: { label: 'Design wind', note: '3.2 kPa peak gust; mullion deflection within L/250.', wind: '3.2 kPa', water: '600 Pa', status: 'Pass' },
  rain: { label: 'Driving rain', note: '600 Pa water test; drainage and gaskets verified.', wind: '1.4 kPa', water: '600 Pa', status: 'Tested' },
  heat: { label: 'Solar gain', note: 'West façade peak; shading and low-e coating active.', wind: '0.8 kPa', water: '—', status: 'Monitor' },
};

export const FACADE_PANELS = [
  { id: 'P-01', name: 'Unitised panel 01', x: -3.6, y: 1.2, z: 0, u: '1.08', wind: '3.1 kPa', status: 'Pass', color: '#51d6ff' },
  { id: 'P-02', name: 'Unitised panel 02', x: 0, y: 1.2, z: 0, u: '1.08', wind: '3.2 kPa', status: 'Pass', color: '#53f0be' },
  { id: 'P-03', name: 'Unitised panel 03', x: 3.6, y: 1.2, z: 0, u: '1.12', wind: '3.0 kPa', status: 'Monitor', color: '#f4bd72' },
  { id: 'P-04', name: 'Unitised panel 04', x: -3.6, y: 4.2, z: 0, u: '1.08', wind: '3.3 kPa', status: 'Pass', color: '#a991ff' },
  { id: 'P-05', name: 'Unitised panel 05', x: 0, y: 4.2, z: 0, u: '1.06', wind: '3.4 kPa', status: 'Pass', color: '#51d6ff' },
  { id: 'P-06', name: 'Unitised panel 06', x: 3.6, y: 4.2, z: 0, u: '1.10', wind: '3.2 kPa', status: 'Pass', color: '#53f0be' },
];

export const FACADE_KPIS = [
  { label: 'U-value', value: '1.08', unit: 'W/m²K', delta: '−8%' },
  { label: 'Wind load', value: '3.2', unit: 'kPa', delta: 'design' },
  { label: 'Water test', value: '600', unit: 'Pa', delta: 'passed' },
  { label: 'Embodied carbon', value: '28', unit: 'kg/m²', delta: '−22%' },
];

export const FACADE_ACTIONS = [
  { title: 'West façade shading', impact: '−18% solar gain', owner: 'Facade', status: 'Design' },
  { title: 'Panel 03 gasket review', impact: 'water risk', owner: 'QA', status: 'Open' },
  { title: 'Low-carbon aluminium', impact: '−22% embodied', owner: 'Procurement', status: 'Approved' },
  { title: 'Mock-up water test', impact: '600 Pa', owner: 'Testing', status: 'Complete' },
];
