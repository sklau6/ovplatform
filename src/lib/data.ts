import type { Anomaly, Asset, District, Insight, ModelCard, Project } from './types';
import { series } from './utils';

export const COMPANY = {
  name: 'Ophylla Ventures Management Company Limited',
  short: 'Ophylla Ventures',
  platform: 'Ophylla Ventures OS',
  location: 'Hong Kong SAR',
  role: 'Chief Operating Officer — Smart Cities & Innovation',
};

export const DISTRICTS: District[] = [
  {
    id: 'NM', name: 'Northern Metropolis', short: 'NORTH METRO', labelX: 430, labelY: 195,
    polygon: 'M180,60 L560,45 L760,130 L720,300 L470,330 L250,250 L150,150 Z',
    energyIntensity: 91.6, assets: 2, gfa: 240000, carbon: 18.4, accent: '#5eead4',
    note: 'Growth frontier — two live labs, land bank optionality to 2032.',
  },
  {
    id: 'WK', name: 'West Kowloon', short: 'WEST KOWLOON', labelX: 245, labelY: 430,
    polygon: 'M80,340 L380,320 L480,420 L430,540 L200,555 L70,460 Z',
    energyIntensity: 79.8, assets: 2, gfa: 720000, carbon: 31.2, accent: '#45c4f5',
    note: 'Cultural and gateway assets; premium tenant demand, tight delivery windows.',
  },
  {
    id: 'KE', name: 'Kowloon East', short: 'KOWLOON EAST', labelX: 640, labelY: 408,
    polygon: 'M470,300 L800,285 L860,430 L800,540 L540,545 L500,440 Z',
    energyIntensity: 88.2, assets: 5, gfa: 1310000, carbon: 47.6, accent: '#a78bfa',
    note: 'Largest operating cluster; retrofit pipeline and campus consolidation.',
  },
  {
    id: 'KT', name: 'Kai Tak Innovation Mile', short: 'KAI TAK', labelX: 1000, labelY: 330,
    polygon: 'M840,250 L1100,235 L1210,370 L1140,520 L900,540 L830,420 Z',
    energyIntensity: 72.4, assets: 4, gfa: 1466000, carbon: 22.8, accent: '#3ee0a1',
    note: 'Flagship precinct and twin pilot; highest growth and margin contribution.',
  },
  {
    id: 'CH', name: 'Central Harbour', short: 'CENTRAL HARBOUR', labelX: 650, labelY: 615,
    polygon: 'M360,575 L820,560 L1000,605 L940,650 L620,652 L380,620 Z',
    energyIntensity: 84.1, assets: 3, gfa: 1406000, carbon: 38.9, accent: '#f5b748',
    note: 'Waterfront retail and residential mix; energy price exposure is material.',
  },
  {
    id: 'TKO', name: 'Tseung Kwan O', short: 'TKO', labelX: 1270, labelY: 345,
    polygon: 'M1150,170 L1370,190 L1395,440 L1210,500 L1140,420 Z',
    energyIntensity: 96.4, assets: 3, gfa: 740000, carbon: 26.1, accent: '#fb7185',
    note: 'Data and logistics load centre; grid capacity constrains expansion.',
  },
];

export const ASSETS: Asset[] = [
  {
    id: 'KT-01', name: 'Ophylla Kai Tak Tower I', kind: 'tower', district: 'KT', status: 'operational',
    x: 930, y: 360, height: 34, floors: 42, gfa: 684000, year: 2021, energy: 68.4, occupancy: 94.2,
    availability: 99.4, carbon: 9.8, value: 3820, sensors: 286, workOrders: 12, risk: 'low',
    modelUrn: 'ifc://ophylla/kt-tower-01/v7', modelVersion: 'v7.2', leaseExpiry: '2031-06-30',
    manager: 'A. Cheng', tenants: 38, notes: 'Flagship twin pilot. 42 storeys, LEED Platinum, district cooling connected.',
  },
  {
    id: 'KT-02', name: 'Kai Tak Tower II', kind: 'tower', district: 'KT', status: 'commissioning',
    x: 1005, y: 420, height: 28, floors: 34, gfa: 512000, year: 2025, energy: 74.1, occupancy: 61.5,
    availability: 98.1, carbon: 7.2, value: 2940, sensors: 198, workOrders: 24, risk: 'medium',
    modelUrn: 'ifc://ophylla/kt-tower-02/v3', modelVersion: 'v3.6', leaseExpiry: '2032-03-31',
    manager: 'R. Ma', tenants: 11, notes: 'Practical completion staged Q1. 34 storeys; handover gates G3–G4 in progress.',
  },
  {
    id: 'KT-03', name: 'Airside Exchange', kind: 'retail', district: 'KT', status: 'operational',
    x: 860, y: 455, height: 12, floors: 5, gfa: 210000, year: 2022, energy: 108.2, occupancy: 88.7,
    availability: 99.8, carbon: 4.1, value: 1180, sensors: 142, workOrders: 19, risk: 'medium',
    modelUrn: 'ifc://ophylla/airside-exchange/v4', modelVersion: 'v4.0', leaseExpiry: '2030-12-31',
    manager: 'J. Wong', tenants: 64, notes: 'High footfall retail; heat pump retrofit under business case review.',
  },
  {
    id: 'KT-04', name: 'Green Spine Pavilion', kind: 'civic', district: 'KT', status: 'operational',
    x: 950, y: 480, height: 5, floors: 2, gfa: 42000, year: 2023, energy: 41.8, occupancy: 76.0,
    availability: 99.9, carbon: 0.9, value: 260, sensors: 64, workOrders: 3, risk: 'low',
    modelUrn: 'ifc://ophylla/green-pavilion/v2', modelVersion: 'v2.1', leaseExpiry: '2043-12-31',
    manager: 'S. Ng', tenants: 6, notes: 'Public realm and events venue; net-zero pilot with rooftop PV canopy.',
  },
  {
    id: 'KE-01', name: 'Kowloon East Campus A', kind: 'campus', district: 'KE', status: 'operational',
    x: 600, y: 350, height: 16, floors: 14, gfa: 320000, year: 2016, energy: 92.4, occupancy: 91.3,
    availability: 98.9, carbon: 12.6, value: 1420, sensors: 168, workOrders: 21, risk: 'medium',
    modelUrn: 'ifc://ophylla/ke-campus-a/v11', modelVersion: 'v11.4', leaseExpiry: '2029-09-30',
    manager: 'M. Lee', tenants: 22, notes: 'Single-tenant technology campus; chiller plant reaching end of economic life.',
  },
  {
    id: 'KE-02', name: 'Kowloon East Campus B', kind: 'campus', district: 'KE', status: 'operational',
    x: 670, y: 315, height: 14, floors: 12, gfa: 260000, year: 2018, energy: 86.7, occupancy: 87.5,
    availability: 99.1, carbon: 10.4, value: 1160, sensors: 154, workOrders: 14, risk: 'low',
    modelUrn: 'ifc://ophylla/ke-campus-b/v9', modelVersion: 'v9.0', leaseExpiry: '2030-03-31',
    manager: 'M. Lee', tenants: 18, notes: 'Integrates with Campus A on shared energy and security platform.',
  },
  {
    id: 'KE-03', name: 'Eastline Logistics', kind: 'industrial', district: 'KE', status: 'operational',
    x: 550, y: 480, height: 9, floors: 4, gfa: 410000, year: 2014, energy: 74.9, occupancy: 96.8,
    availability: 99.6, carbon: 13.8, value: 980, sensors: 112, workOrders: 9, risk: 'low',
    modelUrn: 'ifc://ophylla/eastline/v5', modelVersion: 'v5.2', leaseExpiry: '2028-12-31',
    manager: 'K. Chan', tenants: 9, notes: 'Cold-chain capable; rooftop solar covering 31% of base load.',
  },
  {
    id: 'KE-04', name: 'Skyline Civic Centre', kind: 'civic', district: 'KE', status: 'operational',
    x: 520, y: 355, height: 11, floors: 8, gfa: 140000, year: 2012, energy: 104.6, occupancy: 82.4,
    availability: 97.8, carbon: 8.2, value: 640, sensors: 96, workOrders: 26, risk: 'high',
    modelUrn: 'ifc://ophylla/skyline-civic/v6', modelVersion: 'v6.8', leaseExpiry: '2042-06-30',
    manager: 'S. Ng', tenants: 1, notes: 'Public-sector client; BMS obsolescence flagged. Replacement funded at G2.',
  },
  {
    id: 'KE-05', name: 'Ophylla Smart Yard', kind: 'industrial', district: 'KE', status: 'operational',
    x: 735, y: 485, height: 7, floors: 3, gfa: 180000, year: 2020, energy: 66.2, occupancy: 93.1,
    availability: 99.2, carbon: 5.1, value: 520, sensors: 88, workOrders: 7, risk: 'low',
    modelUrn: 'ifc://ophylla/smart-yard/v4', modelVersion: 'v4.3', leaseExpiry: '2035-03-31',
    manager: 'K. Chan', tenants: 12, notes: 'MEP fabrication and circular-economy materials hub.',
  },
  {
    id: 'WK-01', name: 'West Kowloon Gateway', kind: 'tower', district: 'WK', status: 'operational',
    x: 330, y: 380, height: 31, floors: 38, gfa: 540000, year: 2019, energy: 77.3, occupancy: 95.6,
    availability: 99.5, carbon: 12.2, value: 3060, sensors: 214, workOrders: 11, risk: 'low',
    modelUrn: 'ifc://ophylla/wk-gateway/v8', modelVersion: 'v8.1', leaseExpiry: '2033-12-31',
    manager: 'L. Ho', tenants: 41, notes: 'Grade A office with strong renewal pipeline through 2027.',
  },
  {
    id: 'WK-02', name: 'West Kowloon Arts Hub', kind: 'civic', district: 'WK', status: 'operational',
    x: 240, y: 440, height: 10, floors: 6, gfa: 180000, year: 2020, energy: 95.8, occupancy: 70.2,
    availability: 99.0, carbon: 6.8, value: 760, sensors: 104, workOrders: 16, risk: 'medium',
    modelUrn: 'ifc://ophylla/wk-arts/v5', modelVersion: 'v5.7', leaseExpiry: '2045-06-30',
    manager: 'L. Ho', tenants: 9, notes: 'Anchor cultural venue; visitor-linked energy volatility.',
  },
  {
    id: 'CH-01', name: 'Marina Central', kind: 'tower', district: 'CH', status: 'operational',
    x: 600, y: 595, height: 26, floors: 32, gfa: 488000, year: 2018, energy: 81.4, occupancy: 92.8,
    availability: 99.3, carbon: 15.1, value: 2480, sensors: 176, workOrders: 13, risk: 'low',
    modelUrn: 'ifc://ophylla/marina-central/v6', modelVersion: 'v6.4', leaseExpiry: '2030-06-30',
    manager: 'V. Tsang', tenants: 29, notes: 'Waterfront premium office; cooling load driven by glazing ratio.',
  },
  {
    id: 'CH-02', name: 'Harbourview Residences', kind: 'residential', district: 'CH', status: 'operational',
    x: 720, y: 600, height: 30, floors: 40, gfa: 620000, year: 2017, energy: 88.9, occupancy: 97.4,
    availability: 98.7, carbon: 18.4, value: 2840, sensors: 232, workOrders: 31, risk: 'medium',
    modelUrn: 'ifc://ophylla/harbourview/v7', modelVersion: 'v7.0', leaseExpiry: '2067-12-31',
    manager: 'V. Tsang', tenants: 312, notes: 'Residential strata; tenant energy disputes rose 9% this quarter.',
  },
  {
    id: 'CH-03', name: 'Central Market Place', kind: 'retail', district: 'CH', status: 'operational',
    x: 480, y: 580, height: 8, floors: 4, gfa: 96000, year: 2015, energy: 112.3, occupancy: 89.1,
    availability: 99.1, carbon: 3.2, value: 480, sensors: 72, workOrders: 12, risk: 'high',
    modelUrn: 'ifc://ophylla/central-market/v4', modelVersion: 'v4.5', leaseExpiry: '2029-03-31',
    manager: 'J. Wong', tenants: 46, notes: 'Highest energy intensity in portfolio; refrigeration upgrade at G1.',
  },
  {
    id: 'TKO-01', name: 'TKO Data Centre', kind: 'data', district: 'TKO', status: 'operational',
    x: 1270, y: 300, height: 11, floors: 4, gfa: 240000, year: 2022, energy: 118.6, occupancy: 84.0,
    availability: 99.99, carbon: 12.9, value: 1980, sensors: 342, workOrders: 5, risk: 'medium',
    modelUrn: 'ifc://ophylla/tko-dc/v5', modelVersion: 'v5.1', leaseExpiry: '2037-12-31',
    manager: 'D. Yip', tenants: 4, notes: 'Tier III+ design; grid capacity is the binding constraint on expansion.',
  },
  {
    id: 'TKO-02', name: 'TKO Logistics Park', kind: 'industrial', district: 'TKO', status: 'operational',
    x: 1320, y: 400, height: 8, floors: 5, gfa: 380000, year: 2013, energy: 79.2, occupancy: 94.5,
    availability: 99.4, carbon: 9.8, value: 1120, sensors: 126, workOrders: 10, risk: 'low',
    modelUrn: 'ifc://ophylla/tko-logistics/v6', modelVersion: 'v6.2', leaseExpiry: '2029-12-31',
    manager: 'D. Yip', tenants: 15, notes: 'Heavy vehicle electrification pilot scheduled for 2027.',
  },
  {
    id: 'TKO-03', name: 'TKO Marine Labs', kind: 'campus', district: 'TKO', status: 'construction',
    x: 1200, y: 460, height: 7, floors: 5, gfa: 120000, year: 2027, energy: 61.0, occupancy: 0,
    availability: 0, carbon: 3.4, value: 860, sensors: 28, workOrders: 6, risk: 'medium',
    modelUrn: 'ifc://ophylla/tko-marine/v1', modelVersion: 'v1.9', leaseExpiry: '2049-06-30',
    manager: 'P. Fung', tenants: 0, notes: 'Under construction; BIM-to-field variance at 1.8% vs 3% tolerance.',
  },
  {
    id: 'NM-01', name: 'Northern Metropolis Living Lab', kind: 'campus', district: 'NM', status: 'construction',
    x: 430, y: 150, height: 9, floors: 7, gfa: 150000, year: 2026, energy: 58.2, occupancy: 0,
    availability: 0, carbon: 2.2, value: 720, sensors: 42, workOrders: 4, risk: 'low',
    modelUrn: 'ifc://ophylla/nm-living-lab/v1', modelVersion: 'v1.4', leaseExpiry: '2051-03-31',
    manager: 'E. Kwan', tenants: 0, notes: 'Modular construction pilot; 14% programme float retained.',
  },
  {
    id: 'NM-02', name: 'NM Transit Hub', kind: 'infrastructure', district: 'NM', status: 'commissioning',
    x: 600, y: 175, height: 6, floors: 3, gfa: 90000, year: 2026, energy: 71.5, occupancy: 40.0,
    availability: 99.0, carbon: 1.8, value: 540, sensors: 68, workOrders: 8, risk: 'medium',
    modelUrn: 'ifc://ophylla/nm-transit/v2', modelVersion: 'v2.2', leaseExpiry: '2054-12-31',
    manager: 'E. Kwan', tenants: 3, notes: 'Transport interchange; integration testing with two operators.',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'P-104', name: 'Kai Tak Twin — Phase 2', client: 'Ophylla / JV partner', district: 'KT', gate: 'G3',
    rag: 'green', budget: 240, spent: 156, margin: 22.4, progress: 68, owner: 'A. Cheng', nextGate: 'G4 · 14 Nov',
    risk: 'Sensor supply lead time', value: 620, capability: 'Digital twin',
  },
  {
    id: 'P-118', name: 'West Kowloon Smart Estate', client: 'WK Cultural District', district: 'WK', gate: 'G2',
    rag: 'amber', budget: 186, spent: 79, margin: 18.1, progress: 41, owner: 'L. Ho', nextGate: 'G3 · 02 Dec',
    risk: 'Data rights negotiation', value: 480, capability: 'AI operations',
  },
  {
    id: 'P-097', name: 'TKO Energy Retrofit', client: 'TKO Portfolio SPV', district: 'TKO', gate: 'G4',
    rag: 'green', budget: 92, spent: 88, margin: 31.6, progress: 94, owner: 'D. Yip', nextGate: 'Closure · 28 Oct',
    risk: 'Commissioning weather window', value: 260, capability: 'Energy / carbon',
  },
  {
    id: 'P-121', name: 'Northern Metropolis Living Lab', client: 'NM Development Alliance', district: 'NM', gate: 'G1',
    rag: 'amber', budget: 320, spent: 42, margin: 14.8, progress: 19, owner: 'E. Kwan', nextGate: 'G2 · 19 Dec',
    risk: 'Planning approval timing', value: 880, capability: 'Modular construction',
  },
  {
    id: 'P-088', name: 'Enterprise AI Rollout', client: 'Ophylla internal', district: 'KE', gate: 'G3',
    rag: 'green', budget: 64, spent: 39, margin: 0, progress: 61, owner: 'A. Cheng', nextGate: 'G4 · 09 Dec',
    risk: 'Model evaluation coverage', value: 190, capability: 'AI platform',
  },
  {
    id: 'P-112', name: 'Harbourview Carbon Ledger', client: 'Harbourview Owners Corp.', district: 'CH', gate: 'G2',
    rag: 'green', budget: 48, spent: 18, margin: 26.2, progress: 38, owner: 'V. Tsang', nextGate: 'G3 · 21 Nov',
    risk: 'Registry integration', value: 140, capability: 'Blockchain trust',
  },
  {
    id: 'P-076', name: 'Kowloon East BIM Handover', client: 'KE Campus Client', district: 'KE', gate: 'G4',
    rag: 'red', budget: 36, spent: 35, margin: 9.4, progress: 86, owner: 'M. Lee', nextGate: 'Recovery · 31 Oct',
    risk: 'As-built model variance', value: 60, capability: 'BIM delivery',
  },
  {
    id: 'P-126', name: 'Ophylla OS — Enterprise', client: 'Ophylla Ventures', district: 'KT', gate: 'G3',
    rag: 'green', budget: 58, spent: 31, margin: 0, progress: 57, owner: 'T. Lau', nextGate: 'G4 · 15 Jan',
    risk: 'Adoption across ops', value: 410, capability: 'Platform',
  },
  {
    id: 'P-131', name: 'Marina Central Retrofit', client: 'Marina Central SPV', district: 'CH', gate: 'G0',
    rag: 'green', budget: 110, spent: 4, margin: 24.0, progress: 4, owner: 'V. Tsang', nextGate: 'G1 · 12 Dec',
    risk: 'Business case validation', value: 320, capability: 'Energy / carbon',
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: 'I-01', severity: 'critical',
    title: 'TKO grid capacity will constrain Data Centre expansion by Q2 2027',
    detail: 'Load growth plus committed tenant capacity exceeds the 11 kV supply envelope by an estimated 2.4 MW. Expansion revenue at risk is HK$186M over the lease term.',
    impact: 'HK$186M revenue at risk', confidence: 92, source: 'Grid model · CLP tariff data · Twin scenario 7', action: 'Approve capacity study',
  },
  {
    id: 'I-02', severity: 'opportunity',
    title: 'Central Market refrigeration retrofit pays back in 2.7 years',
    detail: 'Sub-metering shows refrigeration base load 23% above peer set. A staged retrofit with demand response participation reduces energy intensity from 112 to 84 kWh/m².',
    impact: 'HK$11.4M NPV · 1,860 tCO₂e/yr', confidence: 87, source: 'Anomaly engine · 18 months telemetry', action: 'Open investment case',
  },
  {
    id: 'I-03', severity: 'warning',
    title: 'Kowloon East Campus A chiller plant is at end of economic life',
    detail: 'Failure probability reached 61% within 18 months. Reactive replacement would cost HK$28M and risk up to 4 days of tenant downtime; planned replacement is HK$17M with a 9-day window.',
    impact: 'HK$11M avoided cost', confidence: 84, source: 'TwinFM v2.3 · maintenance ledger', action: 'Schedule G2 review',
  },
  {
    id: 'I-04', severity: 'info',
    title: 'Portfolio carbon intensity is tracking 6.2% ahead of the 2026 pathway',
    detail: 'Scope 2 reductions from the TKO retrofit offset growth in Central Harbour. Retiring 4,200 verified credits would close the residual gap; structural measures are preferable beyond 2027.',
    impact: 'Pathway gap 6.2%', confidence: 78, source: 'Carbon ledger · 12 sites', action: 'Review carbon strategy',
  },
];

export const ANOMALIES: Anomaly[] = [
  {
    id: 'A-01', assetId: 'TKO-01', asset: 'TKO Data Centre', signal: 'Cooling plant kW / IT load',
    deviation: '+18.6% vs baseline', detected: '4 min ago', confidence: 96, severity: 'critical',
    recommendation: 'Shift CRAH setpoint 0.4°C and inspect chiller 3 condenser water flow.', savings: 2.8,
  },
  {
    id: 'A-02', assetId: 'CH-03', asset: 'Central Market Place', signal: 'Refrigeration base load',
    deviation: '+23.1% vs peers', detected: '22 min ago', confidence: 93, severity: 'warning',
    recommendation: 'Dispatch refrigeration technician; validate door seals and defrost schedule.', savings: 1.4,
  },
  {
    id: 'A-03', assetId: 'KE-04', asset: 'Skyline Civic Centre', signal: 'BMS controller resets',
    deviation: '17 resets / 24h', detected: '1 hr ago', confidence: 98, severity: 'critical',
    recommendation: 'Escalate to controls vendor; controller firmware is 4 releases behind.', savings: 0.6,
  },
  {
    id: 'A-04', assetId: 'CH-02', asset: 'Harbourview Residences', signal: 'Domestic water overnight draw',
    deviation: '+9.4% vs baseline', detected: '3 hrs ago', confidence: 71, severity: 'info',
    recommendation: 'Correlate with level 18–22 valve telemetry; likely minor leak.', savings: 0.3,
  },
  {
    id: 'A-05', assetId: 'KE-01', asset: 'Kowloon East Campus A', signal: 'Chiller 2 vibration',
    deviation: 'ISO 10816 zone C', detected: '5 hrs ago', confidence: 89, severity: 'warning',
    recommendation: 'Book bearing inspection within 14 days; reduce load share in the interim.', savings: 3.1,
  },
  {
    id: 'A-06', assetId: 'KT-01', asset: 'Ophylla Kai Tak Tower I', signal: 'AHU 12 supply-air ΔT',
    deviation: '−2.8°C vs design', detected: '6 hrs ago', confidence: 76, severity: 'info',
    recommendation: 'Recalibrate sensor and re-baseline after filter change.', savings: 0.2,
  },
];

export const MODELS: ModelCard[] = [
  {
    id: 'M-01', name: 'TwinFM', version: 'v2.3', domain: 'Predictive maintenance', status: 'production',
    accuracy: 94.2, drift: 1.2, latency: 38, lastEval: '18 Oct 2026', owner: 'Platform / AI',
    notes: 'Failure-risk scoring across 1,284 assets. Shadow mode 6 weeks; promoted 12 Sep.',
  },
  {
    id: 'M-02', name: 'GridSense', version: 'v4.0', domain: 'Energy optimisation', status: 'production',
    accuracy: 91.8, drift: 2.4, latency: 22, lastEval: '20 Oct 2026', owner: 'Energy / AI',
    notes: 'Load forecast and setpoint recommendations. Human approval required for all writes.',
  },
  {
    id: 'M-03', name: 'LeaseIQ', version: 'v1.6', domain: 'Commercial analytics', status: 'shadow',
    accuracy: 88.4, drift: 3.1, latency: 54, lastEval: '14 Oct 2026', owner: 'Commercial',
    notes: 'Renewal propensity and rent sensitivity. Shadow until two full renewal cycles.',
  },
  {
    id: 'M-04', name: 'CarbonTrace', version: 'v0.9', domain: 'Emissions accounting', status: 'pilot',
    accuracy: 86.1, drift: 4.8, latency: 110, lastEval: '09 Oct 2026', owner: 'Sustainability',
    notes: 'Scope 2 attribution and credit matching. Pending assurance review; not used in reporting.',
  },
];

export const SERIES = {
  energy: series(11, 48, 103, 2.6, -0.36, 60),
  baseline: series(29, 48, 102, 0.8, 0, 60),
  revenue: series(7, 12, 86, 7.5, 1.9, 0),
  margin: series(15, 12, 19.5, 1.2, 0.45, 0),
  occupancy: series(31, 24, 89, 1.4, 0.05, 60),
  grid: series(41, 48, 62, 8.5, 0.25, 10),
  carbon: series(53, 12, 118, 4.2, -1.6, 0),
  satisfaction: series(61, 24, 7.9, 0.16, 0.02, 0),
  pipeline: series(77, 16, 210, 22, 4, 0),
};

export const KPI_SERIES = {
  energy: series(101, 24, 92, 2.2, -0.55, 40),
  value: series(102, 24, 12.2, 0.12, 0.028, 0),
  availability: series(103, 24, 98.9, 0.16, 0.012, 90),
  delivery: series(104, 24, 91.5, 0.9, 0.06, 70),
  margin: series(105, 24, 23.8, 0.5, 0.05, 0),
  carbon: series(106, 24, 142, 2.5, -0.6, 0),
};

export const DISTRICTS_SUMMARY = [
  { id: 'KT', energy: 72.4, occupancy: 87.2, alerts: 2, delta: -4.2 },
  { id: 'KE', energy: 88.2, occupancy: 90.1, alerts: 5, delta: -1.1 },
  { id: 'WK', energy: 79.8, occupancy: 88.4, alerts: 1, delta: -2.8 },
  { id: 'CH', energy: 84.1, occupancy: 92.6, alerts: 3, delta: 0.6 },
  { id: 'TKO', energy: 96.4, occupancy: 91.8, alerts: 4, delta: 1.9 },
  { id: 'NM', energy: 91.6, occupancy: 54.0, alerts: 0, delta: -6.4 },
];

export const TELEMETRY = [
  { label: 'Grid load', value: 68.4, unit: 'MW', target: 74, tone: 'cyan' as const },
  { label: 'Indoor air quality', value: 96.2, unit: 'index', target: 90, tone: 'green' as const },
  { label: 'Live sensors', value: 1284, unit: 'online', target: 1300, tone: 'green' as const },
  { label: 'Open work orders', value: 47, unit: 'active', target: 60, tone: 'amber' as const },
];

export const EXEC_DECISIONS = [
  {
    id: 'D-01', title: 'TKO expansion capacity study', owner: 'D. Yip', due: '24 Oct',
    impact: 'HK$186M', tone: 'critical' as const, stage: 'Awaiting COO',
  },
  {
    id: 'D-02', title: 'Central Market retrofit — G1 approval', owner: 'V. Tsang', due: '29 Oct',
    impact: 'HK$11.4M NPV', tone: 'opportunity' as const, stage: 'Business case',
  },
  {
    id: 'D-03', title: 'Kowloon East BIM handover recovery plan', owner: 'M. Lee', due: '31 Oct',
    impact: 'HK$7.2M margin', tone: 'warning' as const, stage: 'Recovery plan',
  },
  {
    id: 'D-04', title: '2027 capital allocation envelope', owner: 'T. Lau', due: '07 Nov',
    impact: 'HK$640M', tone: 'info' as const, stage: 'Pre-read',
  },
];

export const CAPABILITIES = [
  { name: 'Digital twin', share: 31, value: 428, color: '#3ee0a1' },
  { name: 'AI operations', share: 24, value: 332, color: '#45c4f5' },
  { name: 'BIM delivery', share: 18, value: 249, color: '#a78bfa' },
  { name: 'Energy & carbon', share: 15, value: 207, color: '#f5b748' },
  { name: 'Trust & ledger', share: 12, value: 166, color: '#fb7185' },
];

export function assetById(id: string) {
  return ASSETS.find((a) => a.id === id);
}

export function districtById(id: string) {
  return DISTRICTS.find((d) => d.id === id);
}

export const KIND_LABEL: Record<Asset['kind'], string> = {
  tower: 'Office tower',
  campus: 'Campus',
  retail: 'Retail',
  residential: 'Residential',
  civic: 'Civic / cultural',
  industrial: 'Industrial',
  infrastructure: 'Infrastructure',
  data: 'Data centre',
};

export const STATUS_LABEL: Record<Asset['status'], string> = {
  operational: 'Operational',
  commissioning: 'Commissioning',
  construction: 'In construction',
};
