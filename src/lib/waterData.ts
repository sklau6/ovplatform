export type WaterMode = 'supply' | 'quality' | 'leaks' | 'circularity';
export type WaterScenario = 'normal' | 'drought' | 'leak';

export const WATER_MODES: Array<{ id: WaterMode; label: string; color: string; note: string }> = [
  { id: 'supply', label: 'Supply', color: '#45c4f5', note: 'Reservoir, treatment, pumping and network pressure.' },
  { id: 'quality', label: 'Quality', color: '#53f0be', note: 'Turbidity, chlorine, pH and sensor confidence.' },
  { id: 'leaks', label: 'Leaks', color: '#ff7088', note: 'Non-revenue water, acoustic leak detection and repair crews.' },
  { id: 'circularity', label: 'Circularity', color: '#a991ff', note: 'Greywater, rainwater, recovery and reuse.' },
];

export const WATER_SCENARIOS: Record<WaterScenario, { label: string; note: string; nRW: string; pressure: string; quality: string; status: string }> = {
  normal: { label: 'Normal', note: 'Reservoir 82%; network pressure stable; one minor leak.', nRW: '12.4%', pressure: '4.2 bar', quality: '96.8', status: 'Stable' },
  drought: { label: 'Drought', note: 'Reservoir 38%; demand management and reuse maximised.', nRW: '11.8%', pressure: '3.6 bar', quality: '95.2', status: 'Restricted' },
  leak: { label: 'Major leak', note: 'Trunk main burst; pressure dropped; repair crew dispatched.', nRW: '18.6%', pressure: '2.4 bar', quality: '91.4', status: 'Responding' },
};

export const WATER_ASSETS = [
  { id: 'RES-01', name: 'Reservoir 01', type: 'Reservoir', metric: '82% · 18,400 m³', status: 'Normal', x: -14, z: -8 },
  { id: 'TRT-01', name: 'Treatment plant', type: 'Treatment', metric: '96.8 quality', status: 'Running', x: -4, z: -6 },
  { id: 'PMP-02', name: 'Pump station 02', type: 'Pump', metric: '4.2 bar', status: 'Running', x: 7, z: -3 },
  { id: 'TWR-01', name: 'Water tower', type: 'Tower', metric: '1,200 m³', status: 'Normal', x: 15, z: 3 },
  { id: 'LEAK-03', name: 'Leak · trunk main 03', type: 'Leak', metric: '18.6% NRW', status: 'Repair', x: 2, z: 8 },
  { id: 'REC-01', name: 'Greywater recovery', type: 'Circular', metric: '28% reuse', status: 'Running', x: -13, z: 8 },
  { id: 'SEN-07', name: 'Quality sensor 07', type: 'Sensor', metric: 'Cl 0.8 mg/L', status: 'Online', x: 10, z: 8 },
];

export const WATER_KPIS = [
  { label: 'Non-revenue water', value: '12.4', unit: '%', delta: '−2.1 pts' },
  { label: 'Water intensity', value: '1.6', unit: 'm³/m²', delta: '−8% YoY' },
  { label: 'Reuse rate', value: '28', unit: '%', delta: '+6 pts' },
  { label: 'Leak response', value: '38', unit: 'min', delta: '−12 min' },
];

export const WATER_ACTIONS = [
  { title: 'Pressure-managed district 03', impact: '−18% burst risk', owner: 'Network', status: 'Live' },
  { title: 'Acoustic leak survey', impact: '−2.1 pts NRW', owner: 'Leaks', status: 'Scheduled' },
  { title: 'Greywater expansion', impact: '+9 pts reuse', owner: 'ESG', status: 'Design' },
  { title: 'Reservoir 01 lining', impact: '−0.4% loss', owner: 'Assets', status: 'Approved' },
];
