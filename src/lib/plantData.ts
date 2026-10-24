export type PlantMode = 'cooling' | 'energy' | 'water' | 'maintenance';
export type PlantScenario = 'normal' | 'peak' | 'fault';

export const PLANT_MODES: Array<{ id: PlantMode; label: string; color: string; note: string }> = [
  { id: 'cooling', label: 'Cooling', color: '#45c4f5', note: 'Chilled water, condenser water and cooling tower performance.' },
  { id: 'energy', label: 'Energy', color: '#f4bd72', note: 'kW/RT, part-load efficiency and demand.' },
  { id: 'water', label: 'Water', color: '#53f0be', note: 'Flow, pressure, make-up and treatment.' },
  { id: 'maintenance', label: 'Maintenance', color: '#a991ff', note: 'Condition, faults and predictive work orders.' },
];

export const PLANT_SCENARIOS: Record<PlantScenario, { label: string; note: string; cop: string; kwrt: string; faults: number; status: string }> = {
  normal: { label: 'Normal', note: 'Two chillers staged; condenser water reset active.', cop: '6.4', kwrt: '0.55', faults: 1, status: 'Stable' },
  peak: { label: 'Peak load', note: 'Third chiller online; cooling tower fans at 92%.', cop: '5.8', kwrt: '0.62', faults: 2, status: 'Peak' },
  fault: { label: 'Chiller fault', note: 'Chiller 02 trip; standby online; investigate compressor.', cop: '5.1', kwrt: '0.71', faults: 4, status: 'Fault' },
};

export const PLANT_ASSETS = [
  { id: 'CH-01', name: 'Chiller 01', type: 'Chiller', x: -8, z: -4, metric: '6.4 COP', status: 'Running' },
  { id: 'CH-02', name: 'Chiller 02', type: 'Chiller', x: -2, z: -4, metric: 'Tripped', status: 'Fault' },
  { id: 'PMP-01', name: 'CHW pump 01', type: 'Pump', x: 4, z: -3, metric: '4.8 bar', status: 'Running' },
  { id: 'PMP-02', name: 'CHW pump 02', type: 'Pump', x: 4, z: 0, metric: '4.7 bar', status: 'Standby' },
  { id: 'CT-01', name: 'Cooling tower', type: 'Tower', x: 9, z: 4, metric: '29.8°C', status: 'Running' },
  { id: 'AHU-01', name: 'AHU 01', type: 'AHU', x: -7, z: 6, metric: '18.2 kW', status: 'Running' },
  { id: 'BMS', name: 'BMS controller', type: 'BMS', x: 0, z: 7, metric: 'All points', status: 'Online' },
];

export const PLANT_KPIS = [
  { label: 'Plant COP', value: '6.4', unit: 'COP', delta: '+0.6' },
  { label: 'kW / RT', value: '0.55', unit: 'kW/RT', delta: '−0.04' },
  { label: 'Chilled water', value: '6.8', unit: '°C', delta: 'reset' },
  { label: 'Open faults', value: '1', unit: 'fault', delta: 'chiller 02' },
];

export const PLANT_ACTIONS = [
  { title: 'Condenser water reset', impact: '−4.2% energy', owner: 'BMS', status: 'Auto' },
  { title: 'Chiller 02 compressor inspection', impact: 'restore N+1', owner: 'O&M', status: 'Work order' },
  { title: 'Pump VFD tuning', impact: '−0.03 kW/RT', owner: 'Energy', status: 'Pilot' },
  { title: 'Cooling tower fill clean', impact: '+2.1% approach', owner: 'Maintenance', status: 'Scheduled' },
];
