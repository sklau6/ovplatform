export type EsgMode = 'carbon' | 'nature';
export type EsgScenario = 'baseline' | 'transition' | 'netzero';

export interface EsgAsset {
  id: string;
  name: string;
  short: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  carbon: number;
  energy: number;
  water: number;
  waste: number;
  cert: string;
  rating: 'A' | 'B' | 'C';
  solar: number;
  social: number;
}

export const ESG_ASSETS: EsgAsset[] = [
  { id: 'KT-01', name: 'Ophylla Kai Tak Tower I', short: 'KT-01', x: 0, z: -2, w: 9, d: 7.5, h: 20, carbon: 18.2, energy: 72.4, water: 1.8, waste: 62, cert: 'BEAM Plus Platinum', rating: 'A', solar: 32, social: 78 },
  { id: 'KT-02', name: 'Kai Tak Tower II', short: 'KT-02', x: 14, z: -10, w: 7.5, d: 6.5, h: 15, carbon: 21.4, energy: 78.2, water: 2.1, waste: 58, cert: 'BEAM Plus Gold', rating: 'A', solar: 24, social: 71 },
  { id: 'KT-03', name: 'Airside Exchange', short: 'KT-03', x: 18, z: 4, w: 9, d: 6, h: 7, carbon: 38.6, energy: 108.2, water: 3.4, waste: 44, cert: 'BEAM Plus Silver', rating: 'C', solar: 12, social: 64 },
  { id: 'KE-01', name: 'Kowloon East Campus A', short: 'KE-01', x: -15, z: -9, w: 9.5, d: 7, h: 11, carbon: 31.2, energy: 88.7, water: 2.6, waste: 51, cert: 'BEAM Plus Gold', rating: 'B', solar: 18, social: 66 },
  { id: 'CH-01', name: 'Marina Central', short: 'CH-01', x: -18, z: 8, w: 8, d: 7, h: 14, carbon: 27.4, energy: 84.1, water: 2.0, waste: 55, cert: 'LEED Gold', rating: 'B', solar: 20, social: 69 },
  { id: 'CH-02', name: 'Harbourview Residences', short: 'CH-02', x: -31, z: 10, w: 7, d: 6, h: 16, carbon: 29.8, energy: 89.1, water: 3.1, waste: 49, cert: 'BEAM Plus Gold', rating: 'B', solar: 15, social: 61 },
  { id: 'WK-01', name: 'West Kowloon Gateway', short: 'WK-01', x: -35, z: -5, w: 8, d: 7, h: 17, carbon: 24.6, energy: 79.8, water: 2.2, waste: 57, cert: 'LEED Platinum', rating: 'A', solar: 26, social: 74 },
  { id: 'TKO-01', name: 'TKO Data Centre', short: 'TKO-01', x: 30, z: -9, w: 11, d: 8, h: 9, carbon: 42.8, energy: 118.6, water: 4.2, waste: 38, cert: 'LEED Gold', rating: 'C', solar: 41, social: 52 },
  { id: 'NM-01', name: 'Northern Metropolis Living Lab', short: 'NM-01', x: -8, z: -22, w: 10, d: 7, h: 8, carbon: 16.8, energy: 61.0, water: 1.4, waste: 66, cert: 'BEAM Plus Platinum', rating: 'A', solar: 34, social: 82 },
];

export const ESG_KPIS = [
  { label: 'GRESB score', value: '82', unit: '/100', delta: '+6 pts YoY', tone: 'green' as const },
  { label: 'Carbon intensity', value: '27.6', unit: 'kgCO₂e/m²', delta: '−11.6% YoY', tone: 'green' as const },
  { label: 'Renewable share', value: '38', unit: '%', delta: '+9 pts YoY', tone: 'cyan' as const },
  { label: 'Certified GFA', value: '71', unit: '%', delta: 'BEAM / LEED / WELL', tone: 'violet' as const },
];

export const SCOPE_BREAKDOWN = [
  { label: 'Scope 1', value: 8, color: '#f5b748', note: 'Direct combustion · fleet · refrigerants' },
  { label: 'Scope 2', value: 54, color: '#3ee0a1', note: 'Purchased electricity · district cooling' },
  { label: 'Scope 3', value: 38, color: '#45c4f5', note: 'Embodied carbon · tenants · supply chain' },
];

export const WHOLE_LIFE = [
  { stage: 'A1–A3', label: 'Materials & production', value: 42, color: '#f5b748' },
  { stage: 'A4–A5', label: 'Transport & construction', value: 11, color: '#f4bd72' },
  { stage: 'B1–B7', label: 'Use & maintenance', value: 31, color: '#3ee0a1' },
  { stage: 'C1–C4', label: 'End of life', value: 16, color: '#45c4f5' },
];

export const CLIMATE_RISKS = [
  { title: 'Typhoon & storm surge', type: 'Physical', exposure: 'High', assets: 3, horizon: 'Now', color: '#fb7185' },
  { title: 'Heat stress / cooling load', type: 'Physical', exposure: 'Medium', assets: 8, horizon: '2030', color: '#f5b748' },
  { title: 'Carbon price & regulation', type: 'Transition', exposure: 'Medium', assets: 6, horizon: '2028', color: '#45c4f5' },
  { title: 'Stranded asset / leasing', type: 'Transition', exposure: 'Low', assets: 2, horizon: '2032', color: '#a78bfa' },
];

export const ESG_ACTIONS = [
  { title: 'Rooftop solar phase 2', impact: '−1,840 tCO₂e/yr', capex: 'HK$24M', payback: '5.1 yrs', owner: 'TERRA', status: 'G2 approved' },
  { title: 'Central Market chiller retrofit', impact: '−1,860 tCO₂e/yr', capex: 'HK$18M', payback: '2.7 yrs', owner: 'TERRA', status: 'COO gate' },
  { title: 'Low-carbon concrete framework', impact: '−28% embodied carbon', capex: 'In delivery', payback: '—', owner: 'KEYSTONE', status: 'Live' },
  { title: 'Green lease standard', impact: '18 leases in scope', capex: 'HK$2.1M', payback: '3.4 yrs', owner: 'VECTOR', status: 'Pilot' },
  { title: 'Climate adaptation — seawall', impact: '3 assets protected', capex: 'HK$46M', payback: 'Resilience', owner: 'SENTINEL', status: 'Business case' },
  { title: 'Biodiversity net gain', impact: '+12% habitat', capex: 'HK$6M', payback: '—', owner: 'TERRA', status: 'Design' },
];

export const ESG_FRAMEWORKS = ['GRESB', 'BEAM Plus', 'LEED', 'WELL', 'TCFD', 'SBTi', 'HKEX ESG', 'ISO 14001'];

export const ESG_ASSURANCE = [
  { label: 'Carbon ledger', value: '12 / 12 sites', status: 'assured' },
  { label: 'Energy data', value: '99.1% complete', status: 'assured' },
  { label: 'Water & waste', value: '11 / 12 sites', status: 'review' },
  { label: 'Social value', value: 'SROI 3.4×', status: 'assured' },
];
