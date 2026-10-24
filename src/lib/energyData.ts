export type EnergyScenario = 'normal' | 'peak' | 'island' | 'carbon';

export interface EnergyAsset {
  id: string;
  name: string;
  short: string;
  type: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  load: number;
  capacity: number;
  voltage: string;
  temp: number;
  condition: number;
  criticality: 'Critical' | 'High' | 'Medium';
  note: string;
}

export const ENERGY_ASSETS: EnergyAsset[] = [
  { id: 'GRID', name: 'CLP 11 kV grid connection', short: 'GRID', type: 'Grid', x: -32, z: -12, w: 3, d: 3, h: 11, load: 6.8, capacity: 12, voltage: '11 kV', temp: 34, condition: 96, criticality: 'Critical', note: 'Two independent 11 kV feeds with auto-transfer.' },
  { id: 'TX-01', name: 'Transformer T1', short: 'TX-01', type: 'Transformer', x: -21, z: -10, w: 4.2, d: 3.2, h: 3.2, load: 5.4, capacity: 8, voltage: '11 kV / 400 V', temp: 68, condition: 92, criticality: 'Critical', note: 'ONAN cooling; dissolved gas analysis normal.' },
  { id: 'SWG-01', name: 'LV main switchgear', short: 'SWG-01', type: 'Switchgear', x: -11, z: -8, w: 6, d: 2.4, h: 2.6, load: 5.8, capacity: 10, voltage: '400 V', temp: 42, condition: 94, criticality: 'Critical', note: 'Selective coordination with generator and BESS.' },
  { id: 'BESS-01', name: 'Battery energy storage', short: 'BESS-01', type: 'BESS', x: 6, z: -13, w: 8.5, d: 4.2, h: 3.4, load: 0, capacity: 2.4, voltage: '400 V', temp: 29, condition: 97, criticality: 'High', note: '2.4 MWh LFP; 1.2 MW inverter; island-capable.' },
  { id: 'PV-01', name: 'Solar canopy', short: 'PV-01', type: 'Solar', x: -1, z: 9, w: 15, d: 6.5, h: 3.6, load: 1.2, capacity: 1.8, voltage: '400 V', temp: 41, condition: 95, criticality: 'High', note: '1.8 MWp bifacial canopy over the mobility hub.' },
  { id: 'WT-01', name: 'Wind turbine W1', short: 'WT-01', type: 'Wind', x: 28, z: 18, w: 2, d: 2, h: 22, load: 0.4, capacity: 0.5, voltage: '690 V', temp: 36, condition: 91, criticality: 'Medium', note: 'Tropical-cyclone rated; cut-out at 25 m/s.' },
  { id: 'WT-02', name: 'Wind turbine W2', short: 'WT-02', type: 'Wind', x: 38, z: 14, w: 2, d: 2, h: 22, load: 0.2, capacity: 0.5, voltage: '690 V', temp: 35, condition: 89, criticality: 'Medium', note: 'Shared converter platform with W1.' },
  { id: 'DC-01', name: 'Data centre load', short: 'DC-01', type: 'Load', x: 24, z: -2, w: 10, d: 8, h: 10, load: 5.2, capacity: 8.4, voltage: '400 V', temp: 23, condition: 99, criticality: 'Critical', note: 'Tier III+; 2N UPS topology; grid capacity constrained.' },
  { id: 'CH-01', name: 'Chiller plant', short: 'CH-01', type: 'Cooling', x: 12, z: 3, w: 8, d: 5, h: 3.4, load: 2.1, capacity: 3.6, voltage: '400 V', temp: 7, condition: 93, criticality: 'High', note: 'Three 1.2 MW chillers; condenser water reset active.' },
  { id: 'GEN-01', name: 'Backup generators', short: 'GEN-01', type: 'Generator', x: 34, z: 4, w: 6, d: 3, h: 3, load: 0, capacity: 5, voltage: '400 V', temp: 31, condition: 90, criticality: 'High', note: '2 × 2.5 MW; 10-second black-start capability.' },
  { id: 'EV-01', name: 'EV charging hub', short: 'EV-01', type: 'Mobility', x: -15, z: 10, w: 9, d: 5, h: 1.2, load: 0.7, capacity: 1.4, voltage: '400 V', temp: 38, condition: 88, criticality: 'Medium', note: '24 bays; managed charging and V2G trial.' },
];

export interface EnergyScenarioData {
  id: EnergyScenario;
  label: string;
  note: string;
  grid: number;
  solar: number;
  wind: number;
  bess: number;
  generator: number;
  load: number;
  renewable: number;
  carbon: number;
  frequency: number;
  cost: string;
}

export const ENERGY_SCENARIOS: Record<EnergyScenario, EnergyScenarioData> = {
  normal: { id: 'normal', label: 'Normal', note: 'Grid-led supply with solar and wind; BESS on standby.', grid: 6.8, solar: 1.2, wind: 0.6, bess: 0, generator: 0, load: 8.4, renewable: 21, carbon: 0.42, frequency: 50.01, cost: 'HK$1.12/kWh' },
  peak: { id: 'peak', label: 'Peak shave', note: 'BESS discharges into the evening peak; demand response active.', grid: 4.7, solar: 1.4, wind: 0.5, bess: 1.8, generator: 0, load: 8.4, renewable: 23, carbon: 0.34, frequency: 49.98, cost: 'HK$0.94/kWh' },
  island: { id: 'island', label: 'Island mode', note: 'Grid loss simulated; BESS, solar, wind and generators carry critical load.', grid: 0, solar: 1.6, wind: 0.8, bess: 2.4, generator: 3.4, load: 8.2, renewable: 29, carbon: 0.58, frequency: 49.92, cost: 'HK$2.40/kWh' },
  carbon: { id: 'carbon', label: 'Carbon sprint', note: 'Maximum renewables, BESS arbitrage and low-carbon dispatch.', grid: 3.0, solar: 1.9, wind: 1.1, bess: 2.4, generator: 0, load: 8.4, renewable: 64, carbon: 0.18, frequency: 50.0, cost: 'HK$0.71/kWh' },
};

export const ECOPS_LAYERS = [
  { level: 'L4', name: 'Services', items: ['Managed energy', 'APM', 'Sustainability reporting', '24/7 OT support'] },
  { level: 'L3', name: 'Apps & analytics', items: ['Microgrid advisor', 'Power monitoring', 'BMS analytics', 'Carbon ledger'] },
  { level: 'L2', name: 'Edge control', items: ['Microgrid controller', 'Protection relays', 'Power meters', 'Building controller'] },
  { level: 'L1', name: 'Connected products', items: ['Transformers', 'Switchgear', 'BESS', 'Solar / wind / EV'] },
];

export const HK_COMPLIANCE = [
  { label: 'CLP / HKE grid code', note: '11 kV connection, protection and metering' },
  { label: 'IEC 61850', note: 'Substation automation and GOOSE messaging' },
  { label: 'IEC 62443', note: 'OT cyber segmentation and zones' },
  { label: 'ISO 50001', note: 'Energy management system' },
  { label: 'BEAM Plus', note: 'Building sustainability assessment' },
  { label: 'CIC BIM Standards', note: 'ISO 19650 information workflow' },
];

export const ISLAND_SEQUENCE = [
  { t: 'T+0s', event: 'Grid loss detected at CLP incomer', state: 'trip' },
  { t: 'T+0.2s', event: 'Protection isolates the utility feeder', state: 'trip' },
  { t: 'T+0.5s', event: 'BESS forms the island grid', state: 'active' },
  { t: 'T+1.8s', event: 'Generators synchronise; critical load restored', state: 'done' },
  { t: 'T+10s', event: 'Chillers staged; frequency held within 49.8–50.2 Hz', state: 'done' },
];
