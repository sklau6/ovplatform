export type DesignOptionId = 'A' | 'B' | 'C';

export const DESIGN_OPTIONS = [
  { id: 'A' as const, name: 'Twin towers', color: '#53f0be', gfa: '42,800', far: '7.4', height: '128 m', units: 286, carbon: '382', cost: 'HK$2.42B', daylight: 72, score: 84, note: 'Maximum yield; two towers over a shared podium and public deck.' },
  { id: 'B' as const, name: 'Stepped terraces', color: '#51d6ff', gfa: '39,600', far: '6.8', height: '96 m', units: 248, carbon: '318', cost: 'HK$2.26B', daylight: 86, score: 91, note: 'Best daylight and shared terraces; lower yield, lower carbon.' },
  { id: 'C' as const, name: 'Courtyard mid-rise', color: '#a991ff', gfa: '36,200', far: '6.2', height: '64 m', units: 214, carbon: '286', cost: 'HK$2.08B', daylight: 92, score: 88, note: 'Lowest carbon and best public realm; smallest commercial envelope.' },
];

export const DESIGN_KPIS = [
  { label: 'GFA', value: '42.8k', unit: 'm²', delta: 'Option A' },
  { label: 'FAR', value: '7.4', unit: 'x', delta: 'max' },
  { label: 'Carbon', value: '318', unit: 'kg/m²', delta: 'Option B' },
  { label: 'Daylight', value: '92', unit: '/100', delta: 'Option C' },
];

export const DESIGN_PROMPTS = [
  '42,000 m² mixed-use scheme, 120 m height cap, maximize daylight',
  'Lower-carbon residential scheme with public courtyard',
  'Maximum-yield twin towers with transit podium',
];
