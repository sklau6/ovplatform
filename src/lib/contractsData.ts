export type ContractsMode = 'obligations' | 'claims' | 'time' | 'renewals';
export type ContractsScenario = 'base' | 'claim' | 'dispute';

export const CONTRACTS_MODES: Array<{ id: ContractsMode; label: string; color: string; note: string }> = [
  { id: 'obligations', label: 'Obligations', color: '#51d6ff', note: 'Parties, deliverables, payment and insurance.' },
  { id: 'claims', label: 'Claims', color: '#ff7088', note: 'Variations, EOT, loss and expense and evidence.' },
  { id: 'time', label: 'Time bars', color: '#f4bd72', note: 'Notice periods, determination and limitation.' },
  { id: 'renewals', label: 'Renewals', color: '#53f0be', note: 'Expiry, extension, retender and exit.' },
];

export const CONTRACTS_SCENARIOS: Record<ContractsScenario, { label: string; note: string; exposure: string; claims: number; status: string }> = {
  base: { label: 'Base position', note: 'Two live claims; notices served in time; renewals on track.', exposure: 'HK$24M', claims: 2, status: 'Managed' },
  claim: { label: 'Major claim', note: 'EOT and loss-and-expense claim on facade; evidence pack assembled.', exposure: 'HK$68M', claims: 4, status: 'Claim' },
  dispute: { label: 'Dispute', note: 'MEP payment dispute referred to adjudication; cash ring-fenced.', exposure: 'HK$96M', claims: 5, status: 'Dispute' },
};

export const CONTRACTS = [
  { id: 'C-01', name: 'Main works', party: 'Principal / contractor', value: 1840, obligations: 42, claims: 1, renewal: '2029', risk: 'Medium', status: 'Live', color: '#51d6ff' },
  { id: 'C-02', name: 'Facade package', party: 'Contractor / façade sub', value: 320, obligations: 18, claims: 2, renewal: '2027', risk: 'High', status: 'Claim', color: '#a991ff' },
  { id: 'C-03', name: 'MEP package', party: 'Contractor / MEP sub', value: 410, obligations: 24, claims: 1, renewal: '2028', risk: 'High', status: 'Payment', color: '#53f0be' },
  { id: 'C-04', name: 'Design consultancy', party: 'Principal / consultant', value: 86, obligations: 12, claims: 0, renewal: '2026', risk: 'Low', status: 'Live', color: '#f4bd72' },
  { id: 'C-05', name: 'O&M contract', party: 'Owner / operator', value: 64, obligations: 16, claims: 0, renewal: '2027', risk: 'Low', status: 'Live', color: '#45c4f5' },
  { id: 'C-06', name: 'Anchor lease', party: 'Landlord / tenant', value: 220, obligations: 14, claims: 1, renewal: '2030', risk: 'Medium', status: 'Live', color: '#ff9f43' },
];

export const CONTRACTS_KPIS = [
  { label: 'Contract value', value: 'HK$2.94B', unit: 'under management', delta: '6 contracts' },
  { label: 'Open claims', value: '2', unit: 'claims', delta: 'HK$24M' },
  { label: 'Notices on time', value: '100', unit: '%', delta: 'time bars' },
  { label: 'Renewals 12m', value: '1', unit: 'contract', delta: 'design 2026' },
];

export const CONTRACTS_ACTIONS = [
  { title: 'Facade EOT evidence pack', impact: 'HK$38M', owner: 'Commercial', status: 'Due' },
  { title: 'MEP payment adjudication', impact: 'HK$12M', owner: 'Legal', status: 'Active' },
  { title: 'Design consultancy renewal', impact: '2026 expiry', owner: 'Procurement', status: 'Plan' },
  { title: 'Lease break option review', impact: '2030', owner: 'Asset mgmt', status: 'Track' },
];
