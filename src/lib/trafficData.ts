export type TrafficMode = 'flow' | 'safety' | 'transit' | 'emissions';
export type TrafficScenario = 'peak' | 'event' | 'incident';

export const TRAFFIC_MODES: Array<{ id: TrafficMode; label: string; color: string; note: string }> = [
  { id: 'flow', label: 'Flow', color: '#51d6ff', note: 'Queue, delay, saturation and green time.' },
  { id: 'safety', label: 'Safety', color: '#ff7088', note: 'Conflicts, vulnerable users and red-light risk.' },
  { id: 'transit', label: 'Transit', color: '#53f0be', note: 'Bus priority, headway and passenger delay.' },
  { id: 'emissions', label: 'Emissions', color: '#f4bd72', note: 'Idling, NOx and CO₂ by approach.' },
];

export const TRAFFIC_SCENARIOS: Record<TrafficScenario, { label: string; note: string; delay: string; queue: string; status: string }> = {
  peak: { label: 'AM peak', note: 'Adaptive control active; bus priority on the north approach.', delay: '42 s', queue: '180 m', status: 'Adaptive' },
  event: { label: 'Event egress', note: 'Stadium release; pedestrian phase extended; traffic marshals.', delay: '68 s', queue: '320 m', status: 'Event' },
  incident: { label: 'Incident', note: 'Lane blocked westbound; diversion via the ring road.', delay: '124 s', queue: '540 m', status: 'Incident' },
};

export const TRAFFIC_APPROACHES = [
  { id: 'N', name: 'North approach', queue: 180, delay: 42, peds: 240, bus: '12 / hr', co2: '18.4 kg', status: 'Adaptive' },
  { id: 'E', name: 'East approach', queue: 140, delay: 36, peds: 180, bus: '8 / hr', co2: '14.2 kg', status: 'Adaptive' },
  { id: 'S', name: 'South approach', queue: 210, delay: 48, peds: 320, bus: '10 / hr', co2: '21.6 kg', status: 'Monitor' },
  { id: 'W', name: 'West approach', queue: 160, delay: 39, peds: 160, bus: '6 / hr', co2: '16.8 kg', status: 'Adaptive' },
];

export const TRAFFIC_KPIS = [
  { label: 'Avg delay', value: '42', unit: 's', delta: '−8 s' },
  { label: 'Max queue', value: '210', unit: 'm', delta: 'south' },
  { label: 'Bus priority', value: '92', unit: '%', delta: '+6 pts' },
  { label: 'Idling CO₂', value: '71', unit: 'kg/hr', delta: '−14%' },
];

export const TRAFFIC_ACTIONS = [
  { title: 'Adaptive signal tuning', impact: '−8 s delay', owner: 'Traffic', status: 'Live' },
  { title: 'Bus priority north', impact: '−90 s passenger', owner: 'Transit', status: 'Live' },
  { title: 'Pedestrian scramble', impact: '240 peds/hr', owner: 'Safety', status: 'Trial' },
  { title: 'Incident diversion plan', impact: 'ring road', owner: 'Operations', status: 'Ready' },
];
