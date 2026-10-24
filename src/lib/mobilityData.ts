export type MobilityMode = 'traffic' | 'autonomous' | 'transit' | 'curb' | 'carbon';
export type MobilityScenario = 'peak' | 'event' | 'incident';

export const MOBILITY_MODES: Array<{ id: MobilityMode; label: string; color: string; note: string }> = [
  { id: 'traffic', label: 'Traffic', color: '#f4bd72', note: 'Live road, junction and congestion view across the precinct.' },
  { id: 'autonomous', label: 'Autonomous', color: '#53f0be', note: 'AV shuttle loop, pick-up bays, LiDAR coverage and remote supervision.' },
  { id: 'transit', label: 'Transit', color: '#51d6ff', note: 'Rail, bus and ferry connections with first/last-mile interchange.' },
  { id: 'curb', label: 'Curb & EV', color: '#a991ff', note: 'Curb allocation, loading, EV charging and micro-mobility docks.' },
  { id: 'carbon', label: 'Carbon', color: '#ff9f43', note: 'Mode-shift emissions, vehicle intensity and low-carbon corridors.' },
];

export const MOBILITY_SCENARIOS: Record<MobilityScenario, { label: string; speed: number; cars: number; journey: number; onTime: number; carbon: number; note: string }> = {
  peak: { label: 'AM peak', speed: 0.7, cars: 26, journey: 18.4, onTime: 91.2, carbon: 42.8, note: 'Peak commuter demand; AV loop and MTR feeder at capacity.' },
  event: { label: 'Event egress', speed: 0.9, cars: 34, journey: 24.6, onTime: 84.6, carbon: 51.2, note: 'Stadium egress; curb management and shuttle surge active.' },
  incident: { label: 'Incident', speed: 0.45, cars: 20, journey: 31.8, onTime: 72.4, carbon: 58.4, note: 'Junction incident; rerouting, remote AV supervision and incident response.' },
};

export const MOBILITY_ASSETS = [
  { id: 'AV-01', name: 'Autonomous shuttle AV-01', type: 'AV', status: 'In service', metric: '24 km/h · 82% SoC', detail: 'Kai Tak loop · 12 stops · remote supervisor armed.' },
  { id: 'BUS-02', name: 'MTR feeder bus 02', type: 'Bus', status: 'On time', metric: '18 km/h · 42 pax', detail: 'Kai Tak station ↔ Kowloon East campus.' },
  { id: 'DRONE-03', name: 'Survey drone 03', type: 'Drone', status: 'Airborne', metric: '120 m · 34 min', detail: 'Corridor 3 · construction progress and thermal scan.' },
  { id: 'FERRY-01', name: 'Harbour ferry 01', type: 'Ferry', status: 'Crossing', metric: '12 min ETA', detail: 'Kai Tak pier ↔ North Point · 186 passengers.' },
  { id: 'STATION-01', name: 'Kai Tak interchange', type: 'Station', status: 'Nominal', metric: '4 modes', detail: 'MTR, bus, AV and active travel in one interchange.' },
  { id: 'HUB-01', name: 'Mobility hub 01', type: 'Hub', status: '86% used', metric: '24 EV bays', detail: 'EV charging, bike share, parcel lockers and AV pick-up.' },
  { id: 'SIGNAL-04', name: 'Junction signal 04', type: 'Signal', status: 'Adaptive', metric: '42 s cycle', detail: 'AI signal control responding to pedestrian and AV demand.' },
  { id: 'CURB-02', name: 'Curb zone 02', type: 'Curb', status: 'Loading', metric: '2 bays free', detail: 'Dynamic loading, ride-hail and accessible drop-off.' },
];

export const MOBILITY_KPIS = [
  { label: 'Journey time', value: '18.4', unit: 'min', delta: '−12% YoY' },
  { label: 'On-time', value: '91.2', unit: '%', delta: '+3.4 pts' },
  { label: 'Active + shared', value: '64', unit: '%', delta: '+8 pts' },
  { label: 'Carbon / trip', value: '42.8', unit: 'g', delta: '−18% YoY' },
];
