export type ResilienceMode = 'flood' | 'wind' | 'power' | 'response';
export type ResilienceScenario = 't8' | 'surge' | 'blackout';

export const RESILIENCE_MODES: Array<{ id: ResilienceMode; label: string; color: string; note: string }> = [
  { id: 'flood', label: 'Flood', color: '#45c4f5', note: 'Storm surge, rainfall, flood extent and drainage.' },
  { id: 'wind', label: 'Wind', color: '#53f0be', note: 'Gust field, exposed facades and crane/loose-object risk.' },
  { id: 'power', label: 'Power', color: '#f4bd72', note: 'Substation status, outage footprint and critical load.' },
  { id: 'response', label: 'Response', color: '#ff7088', note: 'Shelters, hospitals, pumps, routes and response units.' },
];

export const RESILIENCE_SCENARIOS: Record<ResilienceScenario, { label: string; note: string; flood: string; wind: number; outages: string; shelters: string; status: string }> = {
  t8: { label: 'Typhoon T8', note: 'Signal 8 with 120 km/h gusts and 180 mm rainfall forecast.', flood: '0.4 m', wind: 120, outages: '2 feeders', shelters: '3 open', status: 'Prepared' },
  surge: { label: 'Storm surge', note: '1.9 m surge at high tide; low-lying assets and tunnels exposed.', flood: '1.9 m', wind: 145, outages: '5 feeders', shelters: '5 open', status: 'Responding' },
  blackout: { label: 'Grid blackout', note: 'Substation fault; critical load on backup generation.', flood: '0.2 m', wind: 65, outages: '11 feeders', shelters: '4 open', status: 'Islanding' },
};

export const RESILIENCE_ASSETS = [
  { id: 'SH-01', name: 'Shelter · Kai Tak community hall', type: 'Shelter', capacity: '420 people', status: 'Open', x: -8, z: 2 },
  { id: 'SH-02', name: 'Shelter · Kowloon East school', type: 'Shelter', capacity: '280 people', status: 'Open', x: 12, z: -5 },
  { id: 'HOSP-01', name: 'Hospital · United Christian', type: 'Hospital', capacity: '1,240 beds', status: 'On backup', x: 5, z: 7 },
  { id: 'PUMP-03', name: 'Pump station 03', type: 'Pump', capacity: '4.2 m³/s', status: 'Running', x: -2, z: 11 },
  { id: 'SUB-02', name: 'Substation 02', type: 'Power', capacity: '132 kV', status: 'Fault', x: 15, z: 3 },
  { id: 'RES-01', name: 'Response unit A', type: 'Response', capacity: '6 crew', status: 'En route', x: 0, z: 5 },
  { id: 'VUL-04', name: 'Vulnerable asset · basement car park', type: 'Vulnerable', capacity: '320 spaces', status: 'At risk', x: -12, z: 9 },
];

export const RESILIENCE_KPIS = [
  { label: 'Flood extent', value: '0.4', unit: 'm', delta: '3 assets exposed' },
  { label: 'Power outages', value: '2', unit: 'feeders', delta: '1,840 customers' },
  { label: 'Shelters open', value: '3', unit: 'sites', delta: '1,120 capacity' },
  { label: 'Response time', value: '6.4', unit: 'min', delta: '−1.8 min' },
];

export const RESPONSE_STEPS = [
  { t: 'T−6h', event: 'Typhoon T8 alert; EOC activated', tone: 'amber' },
  { t: 'T−3h', event: 'Shelters opened; pumps staged; loose objects secured', tone: 'cyan' },
  { t: 'T+0h', event: 'Signal 8; harbour crossing suspended', tone: 'rose' },
  { t: 'T+2h', event: '3 assets flooded; response units deployed', tone: 'amber' },
  { t: 'T+6h', event: 'Water receding; power restoration sequenced', tone: 'green' },
];
