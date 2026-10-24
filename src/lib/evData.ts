export type EvMode = 'charging' | 'energy' | 'grid' | 'maintenance';
export type EvScenario = 'peak' | 'solar' | 'outage';

export const EV_MODES: Array<{ id: EvMode; label: string; color: string; note: string }> = [
  { id: 'charging', label: 'Charging', color: '#53f0be', note: 'Sessions, power, state of charge and queues.' },
  { id: 'energy', label: 'Energy', color: '#f4bd72', note: 'Solar, battery, grid import and load shifting.' },
  { id: 'grid', label: 'Grid', color: '#51d6ff', note: 'Capacity, demand response and transformer headroom.' },
  { id: 'maintenance', label: 'Maintenance', color: '#a991ff', note: 'Uptime, faults and cable/connector health.' },
];

export const EV_SCENARIOS: Record<EvScenario, { label: string; note: string; power: string; solar: string; status: string }> = {
  peak: { label: 'Evening peak', note: 'Six vehicles charging; battery buffers the site peak.', power: '420 kW', solar: '0 kW', status: 'Peak' },
  solar: { label: 'Solar surplus', note: 'Midday solar; vehicles and battery absorb the canopy output.', power: '280 kW', solar: '360 kW', status: 'Solar' },
  outage: { label: 'Grid outage', note: 'Island mode; battery and solar keep priority chargers live.', power: '120 kW', solar: '240 kW', status: 'Island' },
};

export const EV_CHARGERS = [
  { id: 'DC-01', name: 'DC fast 01', type: 'DC 150 kW', x: -6, z: 3, power: '128 kW', status: 'Charging', color: '#53f0be' },
  { id: 'DC-02', name: 'DC fast 02', type: 'DC 150 kW', x: -3, z: 3, power: '142 kW', status: 'Charging', color: '#53f0be' },
  { id: 'DC-03', name: 'DC fast 03', type: 'DC 150 kW', x: 0, z: 3, power: '0 kW', status: 'Available', color: '#51d6ff' },
  { id: 'AC-01', name: 'AC 22 kW 01', type: 'AC 22 kW', x: 3, z: 3, power: '18 kW', status: 'Charging', color: '#45c4f5' },
  { id: 'AC-02', name: 'AC 22 kW 02', type: 'AC 22 kW', x: 6, z: 3, power: '20 kW', status: 'Charging', color: '#45c4f5' },
  { id: 'AC-03', name: 'AC 22 kW 03', type: 'AC 22 kW', x: 9, z: 3, power: '0 kW', status: 'Fault', color: '#ff7088' },
];

export const EV_KPIS = [
  { label: 'Chargers', value: '6', unit: 'points', delta: '3 DC · 3 AC' },
  { label: 'Energy today', value: '1.84', unit: 'MWh', delta: '62% solar' },
  { label: 'Uptime', value: '98.4', unit: '%', delta: '1 fault' },
  { label: 'Peak shaved', value: '180', unit: 'kW', delta: 'battery' },
];

export const EV_ACTIONS = [
  { title: 'AC-03 connector repair', impact: 'uptime', owner: 'O&M', status: 'Open' },
  { title: 'Demand-response enrolment', impact: '180 kW', owner: 'Energy', status: 'Approved' },
  { title: 'Solar canopy cleaning', impact: '+4% yield', owner: 'Solar', status: 'Scheduled' },
  { title: 'Battery health check', impact: 'SOH 94%', owner: 'Storage', status: 'Live' },
];
