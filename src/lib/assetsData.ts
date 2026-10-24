export type AssetsMode = 'condition' | 'lifecycle' | 'capex' | 'criticality';
export type AssetsScenario = 'maintain' | 'replace' | 'retrofit';

export const ASSETS_MODES: Array<{ id: AssetsMode; label: string; color: string; note: string }> = [
  { id: 'condition', label: 'Condition', color: '#51d6ff', note: 'Condition grade and deterioration curve.' },
  { id: 'lifecycle', label: 'Lifecycle', color: '#f4bd72', note: 'Age, remaining life and replacement horizon.' },
  { id: 'capex', label: 'Capex', color: '#53f0be', note: 'Planned, reactive and deferred capital.' },
  { id: 'criticality', label: 'Criticality', color: '#ff7088', note: 'Business criticality and failure impact.' },
];

export const ASSETS_SCENARIOS: Record<AssetsScenario, { label: string; note: string; backlog: string; capex: string; status: string }> = {
  maintain: { label: 'Maintain', note: 'Planned maintenance; condition stable; backlog controlled.', backlog: 'HK$18M', capex: 'HK$64M / yr', status: 'Planned' },
  replace: { label: 'Replace', note: 'End-of-life plant and lifts replaced over three years.', backlog: 'HK$12M', capex: 'HK$148M', status: 'Invest' },
  retrofit: { label: 'Retrofit', note: 'Deep retrofit for carbon and resilience; capex phased.', backlog: 'HK$24M', capex: 'HK$210M', status: 'Design' },
};

export const ASSETS = [
  { id: 'STR', name: 'Structure', condition: 'B', life: '42 yrs', capex: 'HK$6M', criticality: 'High', status: 'Stable', color: '#51d6ff' },
  { id: 'FAC', name: 'Facade', condition: 'C', life: '18 yrs', capex: 'HK$24M', criticality: 'High', status: 'Repair', color: '#a991ff' },
  { id: 'MEP', name: 'MEP plant', condition: 'C', life: '8 yrs', capex: 'HK$38M', criticality: 'Critical', status: 'Replace', color: '#f4bd72' },
  { id: 'LFT', name: 'Lifts', condition: 'B', life: '12 yrs', capex: 'HK$18M', criticality: 'High', status: 'Modernise', color: '#53f0be' },
  { id: 'ICT', name: 'ICT & BMS', condition: 'B', life: '6 yrs', capex: 'HK$22M', criticality: 'Critical', status: 'Upgrade', color: '#45c4f5' },
  { id: 'FIT', name: 'Fit-out', condition: 'C', life: '5 yrs', capex: 'HK$40M', criticality: 'Medium', status: 'Refresh', color: '#ff9f43' },
];

export const ASSETS_KPIS = [
  { label: 'Assets', value: '4,820', unit: 'tagged', delta: '96%' },
  { label: 'Condition B+', value: '78', unit: '%', delta: '+4 pts' },
  { label: 'Backlog', value: 'HK$18M', unit: 'deferred', delta: '−12%' },
  { label: 'Capex plan', value: 'HK$64M', unit: '/ year', delta: '5-year' },
];

export const ASSETS_ACTIONS = [
  { title: 'Chiller replacement', impact: 'HK$38M', owner: 'Operations', status: 'Plan' },
  { title: 'Facade repair programme', impact: 'HK$24M', owner: 'Facade', status: 'Design' },
  { title: 'Lift modernisation', impact: '4 cars', owner: 'Vertical transport', status: 'Tender' },
  { title: 'ICT cyber upgrade', impact: 'HK$22M', owner: 'Digital', status: 'Approved' },
];
