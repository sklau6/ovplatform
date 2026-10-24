export type FactoryMode = 'line' | 'automation' | 'quality' | 'carbon';
export type FactoryScenario = 'base' | 'surge' | 'automation';

export const FACTORY_MODES: Array<{ id: FactoryMode; label: string; color: string; note: string }> = [
  { id: 'line', label: 'Line', color: '#51d6ff', note: 'Takt time, WIP and station balance across the assembly line.' },
  { id: 'automation', label: 'Automation', color: '#53f0be', note: 'Robotic cells, AGVs, gantry and human–robot collaboration.' },
  { id: 'quality', label: 'Quality', color: '#f4bd72', note: 'In-line inspection, defect Pareto and rework loops.' },
  { id: 'carbon', label: 'Carbon', color: '#a991ff', note: 'Embodied carbon per module and material substitution.' },
];

export const FACTORY_SCENARIOS: Record<FactoryScenario, { label: string; note: string; oee: number; cycle: string; modules: number; defects: string; carbon: string }> = {
  base: { label: 'Base plan', note: '18 modules per week; balanced line and stable supply.', oee: 78, cycle: '4.2 h', modules: 18, defects: '0.8%', carbon: '−28%' },
  surge: { label: 'Programme surge', note: 'Kai Tak Phase 2 pulls forward; overtime and a second shift.', oee: 84, cycle: '3.6 h', modules: 24, defects: '1.1%', carbon: '−26%' },
  automation: { label: 'Automation step', note: 'New welding cell and AGV routing; higher throughput, fewer touches.', oee: 91, cycle: '3.1 h', modules: 27, defects: '0.5%', carbon: '−31%' },
};

export const FACTORY_STATIONS = [
  { id: 'ST-01', name: 'Robotic weld cell', type: 'Robotics', x: -15, z: -3, metric: '92% arc-on', status: 'Running' },
  { id: 'ST-02', name: 'MEP fit-out cell', type: 'MEP', x: -6, z: -3, metric: '4.0 h takt', status: 'Running' },
  { id: 'ST-03', name: 'Drywall & finish', type: 'Finish', x: 3, z: -3, metric: '3.8 h takt', status: 'Running' },
  { id: 'ST-04', name: 'Glazing & façade', type: 'Facade', x: 12, z: -3, metric: '4.1 h takt', status: 'Running' },
  { id: 'ST-05', name: 'In-line quality gate', type: 'Quality', x: 18, z: 3, metric: '0.8% defects', status: 'Pass' },
  { id: 'ST-06', name: 'Dispatch & logistics', type: 'Dispatch', x: -20, z: 7, metric: '6 modules staged', status: 'Ready' },
];

export const FACTORY_KPIS = [
  { label: 'OEE', value: '78', unit: '%', delta: '+4 pts' },
  { label: 'Modules / week', value: '18', unit: 'units', delta: '+3' },
  { label: 'Cycle time', value: '4.2', unit: 'hours', delta: '−0.4 h' },
  { label: 'Defect rate', value: '0.8', unit: '%', delta: '−0.3 pts' },
];

export const FACTORY_ACTIONS = [
  { title: 'Automate weld cell 02', impact: '+3 modules/week', owner: 'Operations', status: 'Business case' },
  { title: 'AGV route optimisation', impact: '−18 min per module', owner: 'Logistics', status: 'Pilot' },
  { title: 'Low-carbon concrete panel', impact: '−31% embodied carbon', owner: 'Engineering', status: 'Approved' },
  { title: 'Digital work instructions', impact: '−0.4% defects', owner: 'Quality', status: 'Live' },
];
