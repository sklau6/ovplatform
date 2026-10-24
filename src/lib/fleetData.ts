export type FleetMode = 'fleet' | 'utilisation' | 'maintenance' | 'emissions';
export type FleetScenario = 'peak' | 'idle' | 'breakdown';

export const FLEET_MODES: Array<{ id: FleetMode; label: string; color: string; note: string }> = [
  { id: 'fleet', label: 'Fleet', color: '#f4bd72', note: 'Assets, status, location and ownership.' },
  { id: 'utilisation', label: 'Utilisation', color: '#53f0be', note: 'Hours, idle time and demand matching.' },
  { id: 'maintenance', label: 'Maintenance', color: '#a991ff', note: 'Condition, service and breakdown risk.' },
  { id: 'emissions', label: 'Emissions', color: '#51d6ff', note: 'Diesel, electric and carbon per machine.' },
];

export const FLEET_SCENARIOS: Record<FleetScenario, { label: string; note: string; utilisation: string; idle: string; status: string }> = {
  peak: { label: 'Peak programme', note: 'All critical plant deployed; crane and concrete peak.', utilisation: '86%', idle: '8%', status: 'Deployed' },
  idle: { label: 'Wet weather', note: 'Earthworks paused; plant stood down; idle cost accruing.', utilisation: '42%', idle: '38%', status: 'Standby' },
  breakdown: { label: 'Breakdown', note: 'Excavator 02 hydraulic fault; replacement mobilised.', utilisation: '71%', idle: '12%', status: 'Recovery' },
};

export const FLEET_ASSETS = [
  { id: 'TC-01', name: 'Tower crane 01', type: 'Crane', x: -8, z: -3, metric: '86% utilised', status: 'Active' },
  { id: 'EX-01', name: 'Excavator 01', type: 'Earthworks', x: -2, z: 4, metric: '7.4 h / day', status: 'Active' },
  { id: 'EX-02', name: 'Excavator 02', type: 'Earthworks', x: 3, z: 4, metric: 'Hydraulic fault', status: 'Fault' },
  { id: 'LD-01', name: 'Wheel loader', type: 'Earthworks', x: 8, z: 2, metric: '64% utilised', status: 'Active' },
  { id: 'TH-01', name: 'Telehandler', type: 'Lifting', x: 7, z: 7, metric: '3.2 h / day', status: 'Idle' },
  { id: 'GEN-01', name: 'Generator 01', type: 'Power', x: -10, z: 7, metric: '42 L / day', status: 'Active' },
  { id: 'DRN-01', name: 'Survey drone', type: 'Digital', x: 0, z: -8, metric: '2 flights / week', status: 'Ready' },
];

export const FLEET_KPIS = [
  { label: 'Fleet utilisation', value: '86', unit: '%', delta: '+6 pts' },
  { label: 'Idle time', value: '8', unit: '%', delta: '−4 pts' },
  { label: 'Breakdowns', value: '1', unit: 'asset', delta: 'excavator 02' },
  { label: 'Diesel', value: '2,840', unit: 'L / week', delta: '−12%' },
];

export const FLEET_ACTIONS = [
  { title: 'Electrify telehandler', impact: '−18 tCO₂e/yr', owner: 'Fleet', status: 'Business case' },
  { title: 'Excavator 02 repair', impact: 'restore 7.4 h', owner: 'Maintenance', status: 'Urgent' },
  { title: 'Crane utilisation sharing', impact: '+8% utilisation', owner: 'Operations', status: 'Pilot' },
  { title: 'Telematics on all plant', impact: '100% visibility', owner: 'Digital', status: 'Live' },
];
