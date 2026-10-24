export type WasteMode = 'streams' | 'diversion' | 'carbon' | 'market';
export type WasteScenario = 'baseline' | 'demolition' | 'retrofit';

export const WASTE_MODES: Array<{ id: WasteMode; label: string; color: string; note: string }> = [
  { id: 'streams', label: 'Streams', color: '#f4bd72', note: 'Concrete, steel, timber, glass, MEP and mixed waste.' },
  { id: 'diversion', label: 'Diversion', color: '#53f0be', note: 'Reuse, recycling, recovery and landfill.' },
  { id: 'carbon', label: 'Carbon', color: '#51d6ff', note: 'Embodied carbon avoided by material recovery.' },
  { id: 'market', label: 'Market', color: '#a991ff', note: 'Material value, buyers and passport status.' },
];

export const WASTE_SCENARIOS: Record<WasteScenario, { label: string; note: string; tonnage: string; diversion: string; status: string }> = {
  baseline: { label: 'Baseline', note: 'Typical cut-and-fill; mixed skips; 68% diversion.', tonnage: '4,820 t', diversion: '68%', status: 'Tracking' },
  demolition: { label: 'Demolition', note: 'Selective demolition; steel and concrete recovery maximised.', tonnage: '9,640 t', diversion: '88%', status: 'Recovering' },
  retrofit: { label: 'Retrofit', note: 'Strip-out with reuse of façade, MEP and finishes.', tonnage: '2,140 t', diversion: '82%', status: 'Reuse' },
};

export const WASTE_STREAMS = [
  { id: 'CON', name: 'Concrete', type: 'Inert', tons: 1860, diversion: '92%', value: 'HK$340k', color: '#9b9b8f' },
  { id: 'STL', name: 'Steel', type: 'Metal', tons: 620, diversion: '98%', value: 'HK$1.24M', color: '#6f8a9a' },
  { id: 'TMB', name: 'Timber', type: 'Bio', tons: 140, diversion: '74%', value: 'HK$86k', color: '#a8794a' },
  { id: 'GLS', name: 'Glass', type: 'Inert', tons: 96, diversion: '61%', value: 'HK$42k', color: '#4f8f9a' },
  { id: 'MEP', name: 'MEP & metals', type: 'Metal', tons: 210, diversion: '86%', value: 'HK$510k', color: '#8a7a6a' },
  { id: 'MIX', name: 'Mixed waste', type: 'Mixed', tons: 320, diversion: '28%', value: '—', color: '#7a5a4a' },
];

export const WASTE_KPIS = [
  { label: 'Waste generated', value: '4,820', unit: 't', delta: '−12%' },
  { label: 'Diversion', value: '68', unit: '%', delta: '+8 pts' },
  { label: 'Carbon avoided', value: '1,240', unit: 'tCO₂e', delta: '+18%' },
  { label: 'Material value', value: 'HK$2.2M', unit: 'recovered', delta: '+22%' },
];

export const WASTE_ACTIONS = [
  { title: 'Selective demolition plan', impact: '88% diversion', owner: 'Delivery', status: 'Approved' },
  { title: 'Steel recovery contract', impact: 'HK$1.2M', owner: 'Procurement', status: 'Live' },
  { title: 'Timber reuse in fit-out', impact: '74% diversion', owner: 'Design', status: 'Pilot' },
  { title: 'Material passport tagging', impact: '100% traceable', owner: 'Digital', status: 'Live' },
];
