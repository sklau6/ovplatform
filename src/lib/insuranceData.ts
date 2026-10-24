export type InsuranceMode = 'coverage' | 'claims' | 'premiums' | 'cat';
export type InsuranceScenario = 'base' | 'typhoon' | 'cyber';

export const INSURANCE_MODES: Array<{ id: InsuranceMode; label: string; color: string; note: string }> = [
  { id: 'coverage', label: 'Coverage', color: '#51d6ff', note: 'Limits, deductibles and gaps by policy.' },
  { id: 'claims', label: 'Claims', color: '#ff7088', note: 'Open claims, reserves and recovery.' },
  { id: 'premiums', label: 'Premiums', color: '#f4bd72', note: 'Premium, rate and programme efficiency.' },
  { id: 'cat', label: 'Cat risk', color: '#a991ff', note: 'Typhoon, flood and cyber catastrophe exposure.' },
];

export const INSURANCE_SCENARIOS: Record<InsuranceScenario, { label: string; note: string; exposure: string; claims: number; status: string }> = {
  base: { label: 'Base year', note: 'Programme renewed; limits adequate; one open claim.', exposure: 'HK$420M', claims: 1, status: 'Covered' },
  typhoon: { label: 'Typhoon event', note: 'T8 event; property and BI claims notified; loss adjuster appointed.', exposure: 'HK$680M', claims: 4, status: 'Claim' },
  cyber: { label: 'Cyber event', note: 'Ransomware event; cyber policy triggered; forensics engaged.', exposure: 'HK$540M', claims: 2, status: 'Notified' },
};

export const INSURANCE_POLICIES = [
  { id: 'CAR', name: 'Construction all-risk', limit: 2400, premium: 8.4, deductible: 'HK$2M', claims: 1, status: 'Active', color: '#51d6ff' },
  { id: 'PROP', name: 'Property & BI', limit: 3600, premium: 6.2, deductible: 'HK$5M', claims: 0, status: 'Active', color: '#53f0be' },
  { id: 'CYB', name: 'Cyber', limit: 500, premium: 2.8, deductible: 'HK$1M', claims: 0, status: 'Active', color: '#a991ff' },
  { id: 'D&O', name: 'Directors & officers', limit: 400, premium: 1.9, deductible: 'HK$0', claims: 0, status: 'Active', color: '#f4bd72' },
  { id: 'LIAB', name: 'Public liability', limit: 1000, premium: 1.4, deductible: 'HK$250k', claims: 0, status: 'Active', color: '#45c4f5' },
  { id: 'ALOP', name: 'Advanced loss of profit', limit: 800, premium: 2.1, deductible: '30 days', claims: 0, status: 'Review', color: '#ff9f43' },
];

export const INSURANCE_KPIS = [
  { label: 'Limits', value: 'HK$8.7B', unit: 'cover', delta: '6 policies' },
  { label: 'Premium', value: 'HK$22.8M', unit: 'annual', delta: '−4%' },
  { label: 'Open claims', value: '1', unit: 'claim', delta: 'HK$8M reserve' },
  { label: 'Cat exposure', value: 'HK$420M', unit: 'modelled', delta: '1-in-200' },
];

export const INSURANCE_ACTIONS = [
  { title: 'Typhoon claim notification', impact: 'property + BI', owner: 'Risk', status: 'Open' },
  { title: 'Cyber forensics panel', impact: '24h response', owner: 'Cyber', status: 'Ready' },
  { title: 'ALOP deductible review', impact: '30 days', owner: 'Finance', status: 'Review' },
  { title: 'Cat modelling refresh', impact: '1-in-200', owner: 'Insurance', status: 'Complete' },
];
