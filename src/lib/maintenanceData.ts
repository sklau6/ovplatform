export type MaintenanceMode = 'orders' | 'sla' | 'parts' | 'technicians';
export type MaintenanceScenario = 'reactive' | 'ppm' | 'emergency';

export const MAINTENANCE_MODES: Array<{ id: MaintenanceMode; label: string; color: string; note: string }> = [
  { id: 'orders', label: 'Work orders', color: '#51d6ff', note: 'Open, assigned, in progress and closed.' },
  { id: 'sla', label: 'SLA', color: '#f4bd72', note: 'Response, restoration and breach risk.' },
  { id: 'parts', label: 'Parts', color: '#53f0be', note: 'Stock, lead time and critical spares.' },
  { id: 'technicians', label: 'Technicians', color: '#a991ff', note: 'Skills, routes and utilisation.' },
];

export const MAINTENANCE_SCENARIOS: Record<MaintenanceScenario, { label: string; note: string; open: number; sla: string; status: string }> = {
  reactive: { label: 'Reactive day', note: 'Twelve reactive jobs; two P1; lift trapped passenger.', open: 12, sla: '94%', status: 'Busy' },
  ppm: { label: 'PPM week', note: 'Planned maintenance; 38 jobs scheduled; access confirmed.', open: 38, sla: '98%', status: 'Planned' },
  emergency: { label: 'Emergency', note: 'Chiller failure; critical spares and vendor escalation.', open: 6, sla: '71%', status: 'Escalated' },
};

export const MAINTENANCE_ORDERS = [
  { id: 'WO-1042', name: 'Lift 2 trapped passenger', trade: 'Lifts', priority: 'P1', sla: '18 min', tech: 'T. Chan', parts: 'Door sensor', status: 'In progress', x: -3, y: 7.2, z: 2.6, color: '#ff7088' },
  { id: 'WO-1043', name: 'AHU 3 high supply temp', trade: 'HVAC', priority: 'P2', sla: '2 h', tech: 'M. Lee', parts: 'Valve actuator', status: 'Assigned', x: 3, y: 5.2, z: 2.6, color: '#f4bd72' },
  { id: 'WO-1044', name: 'Lighting circuit trip', trade: 'Electrical', priority: 'P2', sla: '4 h', tech: 'S. Wong', parts: 'MCB 32A', status: 'Open', x: -2, y: 3.0, z: 2.6, color: '#51d6ff' },
  { id: 'WO-1045', name: 'Washroom leak', trade: 'Plumbing', priority: 'P1', sla: '30 min', tech: 'K. Ho', parts: 'Flexi connector', status: 'Closed', x: 4, y: 3.0, z: 2.6, color: '#45c4f5' },
  { id: 'WO-1046', name: 'Fire damper test', trade: 'Fire', priority: 'P3', sla: '5 days', tech: 'A. Ng', parts: '—', status: 'Scheduled', x: 0, y: 1.2, z: 2.6, color: '#53f0be' },
  { id: 'WO-1047', name: 'BMS point offline', trade: 'BMS', priority: 'P2', sla: '4 h', tech: 'R. Yip', parts: 'Controller', status: 'Assigned', x: -4, y: 5.2, z: 2.6, color: '#a991ff' },
];

export const MAINTENANCE_KPIS = [
  { label: 'Open orders', value: '12', unit: 'jobs', delta: '2 P1' },
  { label: 'SLA achieved', value: '94', unit: '%', delta: '+2 pts' },
  { label: 'First-time fix', value: '82', unit: '%', delta: '+5 pts' },
  { label: 'Critical spares', value: '96', unit: '% in stock', delta: '2 gaps' },
];

export const MAINTENANCE_ACTIONS = [
  { title: 'Lift engineer dispatch', impact: 'P1 · 18 min', owner: 'Helpdesk', status: 'Live' },
  { title: 'AHU valve replacement', impact: 'parts on site', owner: 'HVAC', status: 'Assigned' },
  { title: 'Critical spares review', impact: '2 gaps', owner: 'Stores', status: 'Review' },
  { title: 'PPM access confirmations', impact: '38 jobs', owner: 'Planning', status: 'Scheduled' },
];
