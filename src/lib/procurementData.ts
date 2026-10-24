export type ProcurementMode = 'pipeline' | 'award' | 'risk' | 'savings';
export type ProcurementScenario = 'base' | 'fast' | 'shock';

export const PROCUREMENT_MODES: Array<{ id: ProcurementMode; label: string; color: string; note: string }> = [
  { id: 'pipeline', label: 'Pipeline', color: '#51d6ff', note: 'Packages, values, tender windows and bidders.' },
  { id: 'award', label: 'Award', color: '#53f0be', note: 'Evaluation, award and contract mobilisation.' },
  { id: 'risk', label: 'Risk', color: '#ff7088', note: 'Single-source, price and supply risk.' },
  { id: 'savings', label: 'Savings', color: '#f4bd72', note: 'Tender savings, value engineering and cost avoidance.' },
];

export const PROCUREMENT_SCENARIOS: Record<ProcurementScenario, { label: string; note: string; committed: string; savings: string; status: string }> = {
  base: { label: 'Base plan', note: 'Six packages in market; two-stage tender for MEP.', committed: 'HK$1.84B', savings: '4.2%', status: 'On plan' },
  fast: { label: 'Fast-track', note: 'Early works packages pulled forward;并行 tender.', committed: 'HK$2.06B', savings: '3.1%', status: 'Accelerated' },
  shock: { label: 'Supply shock', note: 'Steel and façade lead times extend; single-source exposure.', committed: 'HK$1.92B', savings: '1.8%', status: 'At risk' },
};

export const PROCUREMENT_PACKAGES = [
  { id: 'P-STR', name: 'Structure & basement', value: 640, bidders: 5, savings: '5.1%', risk: 'Low', status: 'Awarded', color: '#51d6ff' },
  { id: 'P-FAC', name: 'Facade & glazing', value: 320, bidders: 4, savings: '3.8%', risk: 'High', status: 'Tender', color: '#a991ff' },
  { id: 'P-MEP', name: 'MEP & controls', value: 410, bidders: 6, savings: '4.6%', risk: 'Medium', status: 'Two-stage', color: '#53f0be' },
  { id: 'P-FIT', name: 'Fit-out', value: 280, bidders: 5, savings: '6.2%', risk: 'Low', status: 'Awarded', color: '#f4bd72' },
  { id: 'P-LFT', name: 'Lifts & escalators', value: 120, bidders: 3, savings: '2.4%', risk: 'High', status: 'Negotiation', color: '#45c4f5' },
  { id: 'P-LND', name: 'Landscape & public realm', value: 90, bidders: 4, savings: '5.8%', risk: 'Low', status: 'Tender', color: '#ff9f43' },
];

export const PROCUREMENT_KPIS = [
  { label: 'Committed', value: 'HK$1.84B', unit: 'value', delta: '77% of budget' },
  { label: 'Tender savings', value: '4.2', unit: '%', delta: 'HK$82M' },
  { label: 'Cycle time', value: '9.4', unit: 'weeks', delta: '−1.8' },
  { label: 'Single-source', value: '2', unit: 'packages', delta: 'review' },
];

export const PROCUREMENT_ACTIONS = [
  { title: 'Facade tender clarification', impact: '4 bidders', owner: 'Procurement', status: 'Live' },
  { title: 'MEP two-stage award', impact: 'HK$410M', owner: 'Commercial', status: 'Evaluation' },
  { title: 'Lift single-source review', impact: '3 bidders', owner: 'Risk', status: 'Review' },
  { title: 'Steel index hedge', impact: 'price risk', owner: 'Treasury', status: 'Approved' },
];
