export type DataMode = 'domains' | 'quality' | 'lineage' | 'access';
export type DataScenario = 'audit' | 'ai' | 'breach';

export const DATA_MODES: Array<{ id: DataMode; label: string; color: string; note: string }> = [
  { id: 'domains', label: 'Domains', color: '#51d6ff', note: 'Data domains, owners and products.' },
  { id: 'quality', label: 'Quality', color: '#53f0be', note: 'Completeness, accuracy, timeliness and trust.' },
  { id: 'lineage', label: 'Lineage', color: '#a991ff', note: 'Source-to-consumption lineage and transformations.' },
  { id: 'access', label: 'Access', color: '#f4bd72', note: 'Policies, least privilege and audit trail.' },
];

export const DATA_SCENARIOS: Record<DataScenario, { label: string; note: string; quality: string; issues: number; status: string }> = {
  audit: { label: 'Audit', note: 'Evidence pack for data lineage and access review.', quality: '96%', issues: 2, status: 'Evidence' },
  ai: { label: 'AI enablement', note: 'Agent access to curated products with human gates.', quality: '94%', issues: 4, status: 'Scaling' },
  breach: { label: 'Access breach', note: 'Suspicious export; access revoked; lineage traced.', quality: '91%', issues: 7, status: 'Contained' },
};

export const DATA_DOMAINS = [
  { id: 'BIM', name: 'BIM & assets', products: 24, quality: 97, owner: 'Digital', access: 'Internal', color: '#51d6ff' },
  { id: 'IOT', name: 'IoT & sensors', products: 18, quality: 92, owner: 'Operations', access: 'Restricted', color: '#53f0be' },
  { id: 'FIN', name: 'Finance', products: 12, quality: 99, owner: 'Finance', access: 'Confidential', color: '#f4bd72' },
  { id: 'PPL', name: 'People', products: 8, quality: 95, owner: 'People', access: 'Confidential', color: '#a991ff' },
  { id: 'ESG', name: 'ESG & carbon', products: 14, quality: 93, owner: 'ESG', access: 'Internal', color: '#45c4f5' },
  { id: 'CYB', name: 'Cyber', products: 10, quality: 98, owner: 'Security', access: 'Restricted', color: '#ff7088' },
  { id: 'OPS', name: 'Operations', products: 16, quality: 90, owner: 'COO', access: 'Internal', color: '#ff9f43' },
];

export const DATA_KPIS = [
  { label: 'Domains', value: '7', unit: 'owned', delta: '102 products' },
  { label: 'Quality', value: '94', unit: '%', delta: '+6 pts' },
  { label: 'Lineage', value: '98', unit: '% covered', delta: 'audited' },
  { label: 'Access reviews', value: '100', unit: '%', delta: 'quarterly' },
];

export const DATA_ACTIONS = [
  { title: 'Finance product certification', impact: '99% quality', owner: 'Finance', status: 'Certified' },
  { title: 'Agent access to BIM products', impact: 'scoped API', owner: 'Digital', status: 'Live' },
  { title: 'IoT sensor data contract', impact: '18 products', owner: 'Operations', status: 'Draft' },
  { title: 'Quarterly access recertification', impact: '100%', owner: 'Security', status: 'Complete' },
];
