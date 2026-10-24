export type PeopleMode = 'org' | 'skills' | 'capacity' | 'hiring';
export type PeopleScenario = 'growth' | 'restructure' | 'attrition';

export const PEOPLE_MODES: Array<{ id: PeopleMode; label: string; color: string; note: string }> = [
  { id: 'org', label: 'Organisation', color: '#53f0be', note: 'Executive team, functions, spans and decision rights.' },
  { id: 'skills', label: 'Skills', color: '#51d6ff', note: 'Capability clusters, critical skills and depth.' },
  { id: 'capacity', label: 'Capacity', color: '#f4bd72', note: 'Headcount, utilisation and delivery load by team.' },
  { id: 'hiring', label: 'Hiring', color: '#a991ff', note: 'Open roles, pipeline, time-to-hire and succession.' },
];

export const PEOPLE_SCENARIOS: Record<PeopleScenario, { label: string; note: string; attrition: string; open: number; engagement: number; status: string }> = {
  growth: { label: 'Growth plan', note: 'FY27 growth adds 24 roles across delivery, technology and commercial.', attrition: '8.4%', open: 24, engagement: 78, status: 'Hiring' },
  restructure: { label: 'Restructure', note: 'Operating model shift; three functions consolidate, two new capabilities.', attrition: '9.1%', open: 18, engagement: 72, status: 'Transition' },
  attrition: { label: 'Attrition stress', note: 'Critical-skill attrition in technology and delivery; succession tested.', attrition: '14.6%', open: 31, engagement: 64, status: 'At risk' },
};

export const PEOPLE_NODES = [
  { id: 'COO', name: 'COO', role: 'Chief Operating Officer', x: 0, z: 0, y: 3.5, color: '#ffffff', headcount: 1, open: 0, skills: 'Operating model · P&L · delivery', succession: '2 ready' },
  { id: 'FIN', name: 'Finance', role: 'Portfolio & capital', x: -5.5, z: 0, y: 3, color: '#53f0be', headcount: 34, open: 3, skills: 'FP&A · capital · risk', succession: '1 ready' },
  { id: 'DEL', name: 'Delivery', role: 'Construction & programme', x: -3.8, z: -4.5, y: 3.2, color: '#f4bd72', headcount: 186, open: 9, skills: '4D BIM · PMO · safety', succession: '2 ready' },
  { id: 'TEC', name: 'Technology', role: 'Platform, data & AI', x: 2, z: -5, y: 3.4, color: '#51d6ff', headcount: 74, open: 7, skills: 'Cloud · AI · cyber', succession: '1 ready' },
  { id: 'COM', name: 'Commercial', role: 'Leasing & revenue', x: 5.6, z: -1, y: 3, color: '#a991ff', headcount: 62, open: 4, skills: 'Leasing · pricing · partners', succession: '2 ready' },
  { id: 'RISK', name: 'Risk', role: 'Risk & assurance', x: 4.4, z: 4, y: 3.2, color: '#ff7088', headcount: 28, open: 2, skills: 'Cyber · HSE · audit', succession: '1 ready' },
  { id: 'SUS', name: 'Sustainability', role: 'ESG & climate', x: 0, z: 5.5, y: 3, color: '#53f0be', headcount: 22, open: 2, skills: 'Carbon · ESG · adaptation', succession: '1 ready' },
  { id: 'PPL', name: 'People', role: 'People & culture', x: -4.8, z: 4, y: 3.3, color: '#f4bd72', headcount: 31, open: 3, skills: 'Talent · culture · reward', succession: '1 ready' },
];

export const PEOPLE_LINKS: Array<[string, string]> = [
  ['COO', 'FIN'], ['COO', 'DEL'], ['COO', 'TEC'], ['COO', 'COM'], ['COO', 'RISK'], ['COO', 'SUS'], ['COO', 'PPL'],
  ['FIN', 'COM'], ['DEL', 'TEC'], ['TEC', 'RISK'], ['DEL', 'RISK'], ['SUS', 'TEC'], ['PPL', 'FIN'],
];

export const PEOPLE_KPIS = [
  { label: 'Engagement', value: '78', unit: '/100', delta: '+4 pts' },
  { label: 'Attrition', value: '8.4', unit: '%', delta: '−1.2 pts' },
  { label: 'Open roles', value: '24', unit: 'roles', delta: '14 critical' },
  { label: 'Succession cover', value: '11', unit: 'ready now', delta: '7 roles' },
];

export const PEOPLE_ACTIONS = [
  { title: 'Critical-skill hiring — AI platform', impact: '4 roles · 90 days', owner: 'Talent', status: 'Active' },
  { title: 'Delivery leadership succession', impact: '2 ready-now', owner: 'COO', status: 'Reviewed' },
  { title: 'Operating-model design', impact: '3 functions consolidate', owner: 'CEO/COO', status: 'Design' },
  { title: 'Engagement action plan', impact: '+4 pts target', owner: 'People', status: 'Live' },
];
