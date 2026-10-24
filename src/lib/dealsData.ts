export type DealsMode = 'pipeline' | 'diligence' | 'synergies' | 'risk';
export type DealsScenario = 'acquisition' | 'divestment' | 'jv';

export const DEALS_MODES: Array<{ id: DealsMode; label: string; color: string; note: string }> = [
  { id: 'pipeline', label: 'Pipeline', color: '#51d6ff', note: 'Targets, stages, value and IC gates.' },
  { id: 'diligence', label: 'Diligence', color: '#53f0be', note: 'Legal, financial, technical, ESG and cyber.' },
  { id: 'synergies', label: 'Synergies', color: '#f4bd72', note: 'Cost, revenue and capital synergies.' },
  { id: 'risk', label: 'Risk', color: '#ff7088', note: 'Execution, integration and valuation risk.' },
];

export const DEALS_SCENARIOS: Record<DealsScenario, { label: string; note: string; value: string; synergy: string; status: string }> = {
  acquisition: { label: 'Acquisition', note: 'Kai Tak East tower; 62% let; technical and ESG diligence underway.', value: 'HK$2.4B', synergy: 'HK$42M', status: 'Diligence' },
  divestment: { label: 'Divestment', note: 'Mature logistics asset; data room open; three bidders shortlisted.', value: 'HK$980M', synergy: '—', status: 'Bids' },
  jv: { label: 'Joint venture', note: 'TKO data-centre JV; land, power and anchor tenant aligned.', value: 'HK$3.1B', synergy: 'HK$68M', status: 'Term sheet' },
};

export const DEAL_WORKSTREAMS = [
  { id: 'FIN', name: 'Financial', progress: 82, owner: 'Finance', status: 'On track', color: '#f4bd72' },
  { id: 'LEG', name: 'Legal', progress: 74, owner: 'Legal', status: 'Review', color: '#51d6ff' },
  { id: 'TEC', name: 'Technical', progress: 66, owner: 'Engineering', status: 'Site visit', color: '#53f0be' },
  { id: 'ESG', name: 'ESG', progress: 58, owner: 'Sustainability', status: 'Data gap', color: '#7ee787' },
  { id: 'CYB', name: 'Cyber', progress: 71, owner: 'Security', status: 'On track', color: '#ff7088' },
  { id: 'COM', name: 'Commercial', progress: 84, owner: 'Commercial', status: 'On track', color: '#a991ff' },
];

export const DEALS_KPIS = [
  { label: 'Pipeline', value: 'HK$6.5B', unit: 'value', delta: '3 deals' },
  { label: 'Synergies', value: 'HK$110M', unit: 'identified', delta: 'run-rate' },
  { label: 'Diligence', value: '72', unit: '% complete', delta: '6 streams' },
  { label: 'IC gates', value: '2', unit: 'approved', delta: 'next Q1' },
];

export const DEALS_ACTIONS = [
  { title: 'Kai Tak East technical DD', impact: 'site visit', owner: 'Engineering', status: 'Live' },
  { title: 'ESG data gap close', impact: 'EPC + carbon', owner: 'Sustainability', status: 'Open' },
  { title: 'Divestment data room', impact: '3 bidders', owner: 'Corporate finance', status: 'Live' },
  { title: 'JV term sheet review', impact: 'HK$3.1B', owner: 'Legal', status: 'Committee' },
];
