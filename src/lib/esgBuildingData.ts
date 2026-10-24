export type EsgBuildingMode = 'energy' | 'carbon' | 'water' | 'wellbeing';
export type EsgBuildingScenario = 'now' | 'retrofit' | 'netzero';

export interface EsgFloor {
  level: number;
  use: string;
  area: number;
  energy: number;
  carbon: number;
  water: number;
  comfort: number;
  occupancy: number;
  cert: string;
}

export const ESG_FLOORS: EsgFloor[] = [
  { level: 12, use: 'Sky lounge / plant', area: 2480, energy: 92.6, carbon: 31.2, water: 1.8, comfort: 78, occupancy: 62, cert: 'BEAM Plus Platinum' },
  { level: 11, use: 'Executive office', area: 2680, energy: 78.4, carbon: 25.1, water: 1.1, comfort: 82, occupancy: 91, cert: 'BEAM Plus Platinum' },
  { level: 10, use: 'Flex office', area: 2740, energy: 81.8, carbon: 27.4, water: 1.2, comfort: 76, occupancy: 88, cert: 'BEAM Plus Platinum' },
  { level: 9, use: 'Technology', area: 2800, energy: 96.2, carbon: 34.8, water: 1.6, comfort: 74, occupancy: 94, cert: 'BEAM Plus Platinum' },
  { level: 8, use: 'Client floor', area: 2860, energy: 86.1, carbon: 29.2, water: 1.3, comfort: 81, occupancy: 86, cert: 'BEAM Plus Platinum' },
  { level: 7, use: 'Flex office', area: 2860, energy: 84.4, carbon: 27.8, water: 1.2, comfort: 79, occupancy: 90, cert: 'BEAM Plus Platinum' },
  { level: 6, use: 'Meeting / forum', area: 2920, energy: 89.7, carbon: 30.4, water: 1.4, comfort: 75, occupancy: 72, cert: 'BEAM Plus Platinum' },
  { level: 5, use: 'Workplace', area: 2960, energy: 83.2, carbon: 27.1, water: 1.1, comfort: 80, occupancy: 92, cert: 'BEAM Plus Platinum' },
  { level: 4, use: 'Workplace', area: 2960, energy: 84.8, carbon: 28.0, water: 1.2, comfort: 78, occupancy: 89, cert: 'BEAM Plus Platinum' },
  { level: 3, use: 'Collaboration', area: 3020, energy: 88.3, carbon: 29.7, water: 1.3, comfort: 77, occupancy: 68, cert: 'BEAM Plus Platinum' },
  { level: 2, use: 'Retail / public', area: 3100, energy: 104.6, carbon: 37.5, water: 2.8, comfort: 71, occupancy: 81, cert: 'BEAM Plus Gold' },
  { level: 1, use: 'Lobby / amenity', area: 3200, energy: 112.8, carbon: 39.4, water: 3.4, comfort: 73, occupancy: 64, cert: 'BEAM Plus Gold' },
];

export const ESG_BUILDING_SCENARIOS: Record<EsgBuildingScenario, { label: string; year: string; energy: number; carbon: number; renewable: number; comfort: number; note: string }> = {
  now: { label: 'Current', year: '2026', energy: 88.4, carbon: 29.6, renewable: 24, comfort: 76, note: 'Grid-led operation with rooftop solar and demand response.' },
  retrofit: { label: 'Retrofit', year: '2030', energy: 64.2, carbon: 18.8, renewable: 52, comfort: 81, note: 'Chiller optimisation, LED, smart controls and green leases.' },
  netzero: { label: 'Net zero', year: '2040', energy: 41.8, carbon: 6.4, renewable: 100, comfort: 84, note: 'All-electric, on-site renewables and residual offset.' },
};

export const ESG_BUILDING_ASSETS = [
  { id: 'SOLAR-ROOF', name: 'Rooftop solar array', type: 'Renewable', metric: '386 kWp', status: 'Generating' },
  { id: 'CHILLER-01', name: 'Chiller plant 01', type: 'Cooling', metric: 'COP 6.4', status: 'Optimised' },
  { id: 'AHU-12', name: 'AHU level 12', type: 'HVAC', metric: '18.2 kW', status: 'Healthy' },
  { id: 'WATER-TANK', name: 'Rainwater harvesting', type: 'Water', metric: '42 m³', status: 'Harvesting' },
  { id: 'BESS-01', name: 'Building battery', type: 'Storage', metric: '480 kWh', status: 'Standby' },
  { id: 'GREEN-ROOF', name: 'Sky garden', type: 'Nature', metric: '+18% habitat', status: 'Thriving' },
];

export const OCEAN_PILLARS = [
  { name: 'Intelligent core platform', note: 'One pane of glass for chillers, HVAC, IoT, meters and facility workflows.', color: '#53f0be' },
  { name: 'Open management overlay', note: 'Open data models, APIs and edge control across mixed vendors.', color: '#51d6ff' },
  { name: 'Partner ecosystem', note: 'Robotics, AI apps and equipment partners deploy into the same twin.', color: '#a991ff' },
];

export const OCEAN_OUTCOMES = [
  { value: '30%', label: 'Energy reduction', note: 'AI cooling optimisation and demand response' },
  { value: '50%', label: 'Maintenance saving', note: 'Predictive rather than preventive tasks' },
  { value: '75%', label: 'Less downtime', note: 'Fault detection and root-cause automation' },
  { value: '180×', label: 'More data', note: 'Direct equipment data at real-time density' },
];

export const ESG_BUILDING_ACTIONS = [
  { title: 'Chilled-water reset', impact: '−8.4% cooling energy', owner: 'AI / OCEAN', status: 'Recommended' },
  { title: 'Level 9 after-hours setback', impact: '−HK$186k / yr', owner: 'Facilities', status: 'Approved' },
  { title: 'Solar + BESS dispatch', impact: '+9 pts renewable', owner: 'Energy', status: 'Live' },
  { title: 'Green lease clause 18', impact: '6 tenants in scope', owner: 'Leasing', status: 'Pilot' },
];
