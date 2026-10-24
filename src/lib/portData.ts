export type PortMode = 'throughput' | 'berth' | 'landside' | 'emissions';
export type PortScenario = 'normal' | 'peak' | 'typhoon';

export const PORT_MODES: Array<{ id: PortMode; label: string; color: string; note: string }> = [
  { id: 'throughput', label: 'Throughput', color: '#51d6ff', note: 'Moves per hour, TEU and berth productivity.' },
  { id: 'berth', label: 'Berth', color: '#53f0be', note: 'Berth window, crane allocation and vessel turnaround.' },
  { id: 'landside', label: 'Landside', color: '#f4bd72', note: 'Truck turnaround, rail share and gate flow.' },
  { id: 'emissions', label: 'Emissions', color: '#a991ff', note: 'CO₂ per TEU, electrification and shore power.' },
];

export const PORT_SCENARIOS: Record<PortScenario, { label: string; note: string; moves: string; turnaround: string; status: string }> = {
  normal: { label: 'Normal', note: 'Two berths active; three STS cranes; rail on schedule.', moves: '32 / hr', turnaround: '18 h', status: 'Stable' },
  peak: { label: 'Peak call', note: 'Three vessels; six cranes; yard density high.', moves: '38 / hr', turnaround: '22 h', status: 'Busy' },
  typhoon: { label: 'Typhoon', note: 'T8 signal; cranes secured; vessel departures rescheduled.', moves: '0 / hr', turnaround: '—', status: 'Suspended' },
};

export const PORT_ASSETS = [
  { id: 'STS-01', name: 'STS crane 01', type: 'Crane', x: -8, z: 0, metric: '32 moves/hr', status: 'Active' },
  { id: 'STS-02', name: 'STS crane 02', type: 'Crane', x: -1, z: 0, metric: '34 moves/hr', status: 'Active' },
  { id: 'STS-03', name: 'STS crane 03', type: 'Crane', x: 6, z: 0, metric: '28 moves/hr', status: 'Standby' },
  { id: 'VSL-01', name: 'MV Ophylla Star', type: 'Vessel', x: -2, z: -5, metric: '18,400 TEU', status: 'Berthed' },
  { id: 'YARD-A', name: 'Yard block A', type: 'Yard', x: 10, z: 6, metric: '82% density', status: 'Active' },
  { id: 'RAIL', name: 'Rail terminal', type: 'Rail', x: -10, z: 7, metric: '38% share', status: 'Active' },
  { id: 'GATE', name: 'Gate complex', type: 'Gate', x: 0, z: 9, metric: '24 min', status: 'Active' },
];

export const PORT_KPIS = [
  { label: 'Moves / hour', value: '32', unit: 'moves', delta: '+4' },
  { label: 'Berth utilisation', value: '74', unit: '%', delta: '2 berths' },
  { label: 'Truck turnaround', value: '24', unit: 'min', delta: '−6 min' },
  { label: 'CO₂ / TEU', value: '14.2', unit: 'kg', delta: '−18%' },
];

export const PORT_ACTIONS = [
  { title: 'Shore power for berth 2', impact: '−28% berth CO₂', owner: 'Energy', status: 'Design' },
  { title: 'Twin-lift crane upgrade', impact: '+6 moves/hr', owner: 'Operations', status: 'Approved' },
  { title: 'Rail slot expansion', impact: '48% rail share', owner: 'Logistics', status: 'Pilot' },
  { title: 'Typhoon readiness drill', impact: 'T8 secure', owner: 'HSE', status: 'Live' },
];
