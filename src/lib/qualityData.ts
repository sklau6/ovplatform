export type QualityMode = 'inspections' | 'defects' | 'ncr' | 'rework';
export type QualityScenario = 'concrete' | 'steel' | 'fitout';

export const QUALITY_MODES: Array<{ id: QualityMode; label: string; color: string; note: string }> = [
  { id: 'inspections', label: 'Inspections', color: '#51d6ff', note: 'Hold points, checklists and witnessed tests.' },
  { id: 'defects', label: 'Defects', color: '#ff7088', note: 'Location, severity, owner and due date.' },
  { id: 'ncr', label: 'NCR', color: '#f4bd72', note: 'Non-conformance, disposition and root cause.' },
  { id: 'rework', label: 'Rework', color: '#53f0be', note: 'Cost, time and first-time-right.' },
];

export const QUALITY_SCENARIOS: Record<QualityScenario, { label: string; note: string; defects: number; ftr: string; status: string }> = {
  concrete: { label: 'Concrete frame', note: 'Hold point release; cube results and cover meter checked.', defects: 12, ftr: '91%', status: 'Inspecting' },
  steel: { label: 'Steel erection', note: 'Bolt torque, weld NDT and alignment witnessed.', defects: 8, ftr: '94%', status: 'Witnessed' },
  fitout: { label: 'Fit-out', note: 'Partition, MEP and finishes snagging ahead of handover.', defects: 28, ftr: '88%', status: 'Snagging' },
};

export const QUALITY_DEFECTS = [
  { id: 'D-01', name: 'Honeycombing', trade: 'Concrete', level: 'L2', severity: 'Major', owner: 'Sub A', due: '3 days', status: 'Open', x: -2, y: 3.2, z: 3.0, color: '#ff7088' },
  { id: 'D-02', name: 'Cover shortfall', trade: 'Concrete', level: 'L2', severity: 'Major', owner: 'Sub A', due: '2 days', status: 'Open', x: 2, y: 3.6, z: 3.0, color: '#f4bd72' },
  { id: 'D-03', name: 'Bolt torque', trade: 'Steel', level: 'L3', severity: 'Critical', owner: 'Sub B', due: 'Today', status: 'NCR', x: 0, y: 5.2, z: 3.0, color: '#ff7088' },
  { id: 'D-04', name: 'Weld porosity', trade: 'Steel', level: 'L3', severity: 'Major', owner: 'Sub B', due: '4 days', status: 'Open', x: -3, y: 5.6, z: 2.8, color: '#f4bd72' },
  { id: 'D-05', name: 'Partition gap', trade: 'Fit-out', level: 'L4', severity: 'Minor', owner: 'Sub C', due: '5 days', status: 'Open', x: 3, y: 7.2, z: 2.8, color: '#53f0be' },
  { id: 'D-06', name: 'MEP alignment', trade: 'MEP', level: 'L4', severity: 'Minor', owner: 'Sub D', due: '7 days', status: 'Open', x: -2, y: 7.6, z: 2.8, color: '#51d6ff' },
];

export const QUALITY_KPIS = [
  { label: 'First-time-right', value: '91', unit: '%', delta: '+3 pts' },
  { label: 'Open defects', value: '12', unit: 'items', delta: '2 major' },
  { label: 'NCRs', value: '1', unit: 'open', delta: 'bolt torque' },
  { label: 'Rework cost', value: '0.8', unit: '% of value', delta: '−0.3%' },
];

export const QUALITY_ACTIONS = [
  { title: 'Bolt torque NCR', impact: 'hold point', owner: 'QA', status: 'Open' },
  { title: 'Concrete repair method', impact: 'honeycombing', owner: 'Sub A', status: 'Review' },
  { title: 'Drone scan comparison', impact: 'weekly', owner: 'Digital', status: 'Live' },
  { title: 'Fit-out snag close-out', impact: '28 items', owner: 'Delivery', status: 'Snagging' },
];
