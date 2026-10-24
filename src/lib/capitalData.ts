export type CapitalMode = 'stack' | 'returns' | 'risk' | 'investors';
export type CapitalScenario = 'base' | 'upside' | 'downside';

export const CAPITAL_MODES: Array<{ id: CapitalMode; label: string; color: string; note: string }> = [
  { id: 'stack', label: 'Capital stack', color: '#51d6ff', note: 'Senior debt, mezzanine, equity and grants.' },
  { id: 'returns', label: 'Returns', color: '#53f0be', note: 'IRR, equity multiple, distributions and yield.' },
  { id: 'risk', label: 'Risk', color: '#ff7088', note: 'LTV, DSCR, covenant headroom and refinancing.' },
  { id: 'investors', label: 'Investors', color: '#a991ff', note: 'LP/GP, co-investors and strategic capital.' },
];

export const CAPITAL_SCENARIOS: Record<CapitalScenario, { label: string; note: string; irr: string; multiple: string; ltv: string; dscr: string }> = {
  base: { label: 'Base plan', note: 'Base underwriting; refinancing in 2028 at 5.2%.', irr: '14.8%', multiple: '1.9×', ltv: '58%', dscr: '1.42×' },
  upside: { label: 'Upside', note: 'Leasing ahead, carbon-linked services scale and capex under budget.', irr: '18.4%', multiple: '2.2×', ltv: '54%', dscr: '1.58×' },
  downside: { label: 'Downside', note: 'Rates higher, two leases slip and handover moves one quarter.', irr: '9.2%', multiple: '1.4×', ltv: '66%', dscr: '1.18×' },
};

export const CAPITAL_LAYERS = [
  { id: 'GRANT', name: 'Green grant', amount: 60, rate: '0%', color: '#53f0be', note: 'CITF / green finance grant' },
  { id: 'EQ', name: 'Equity', amount: 340, rate: 'target 15%', color: '#53f0be', note: 'Ophylla and co-investors' },
  { id: 'MEZZ', name: 'Mezzanine', amount: 180, rate: '8.4%', color: '#f4bd72', note: 'Stretched senior, 2028' },
  { id: 'DEBT', name: 'Senior debt', amount: 620, rate: '5.2%', color: '#51d6ff', note: 'Club of three banks' },
];

export const CAPITAL_KPIS = [
  { label: 'Portfolio value', value: '12.84', unit: 'HK$B', delta: '+3.2% QoQ' },
  { label: 'Net debt', value: '4.62', unit: 'HK$B', delta: 'LTV 58%' },
  { label: 'IRR', value: '14.8', unit: '%', delta: 'base plan' },
  { label: 'DSCR', value: '1.42', unit: 'x', delta: 'covenant 1.20x' },
];

export const CAPITAL_INVESTORS = [
  { id: 'OPH', name: 'Ophylla Ventures', type: 'Sponsor / GP', commitment: 'HK$220M', share: '32%' },
  { id: 'LP-01', name: 'Anchor LP', type: 'Institutional', commitment: 'HK$180M', share: '26%' },
  { id: 'LP-02', name: 'Strategic co-investor', type: 'Industrial', commitment: 'HK$120M', share: '18%' },
  { id: 'BANK', name: 'Bank club', type: 'Senior debt', commitment: 'HK$620M', share: '—' },
];

export const CAPITAL_ACTIONS = [
  { title: 'Refinance 2028 senior', impact: '−40 bps', owner: 'Treasury', status: 'Planning' },
  { title: 'Carbon-linked loan KPI', impact: '+0.15% margin step', owner: 'ESG / Finance', status: 'Live' },
  { title: 'Co-investor onboarding', impact: 'HK$80M', owner: 'Capital markets', status: 'Diligence' },
  { title: 'Hedge 60% of rate exposure', impact: 'protect DSCR', owner: 'Treasury', status: 'Approved' },
];
