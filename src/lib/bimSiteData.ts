export type SiteDiscipline = 'structure' | 'architecture' | 'mep' | 'facade' | 'civil' | 'temporary';
export type SiteView = 'site' | 'bim' | 'asbuilt';

export const SITE_PROJECT = {
  name: 'Kai Tak Innovation Quarter · Tower A',
  site: 'Kai Tak Area 3A, Site 4B · Kowloon, Hong Kong',
  client: 'Ophylla Kai Tak Holdings',
  contractor: 'Ophylla Construction · Gammon JV',
  architect: 'Rocco Design Architects',
  engineer: 'Arup Hong Kong',
  bimManager: 'Ophylla Digital Delivery',
  contract: 'HKD 4.82B',
  gfa: '68,400 m²',
  floors: 34,
  height: '128 m',
  start: 'Q2 2025',
  completion: 'Q4 2027',
  status: 'Structure · Level 21 of 34',
  progress: 62,
  modelSize: '1.24 GB',
  elements: '486,200',
  federatedModels: 18,
  openClashes: 47,
  resolvedClashes: 312,
  rfiOpen: 23,
  workers: 428,
  deliveries: 38,
};

export const SITE_DISCIPLINES: Array<{ id: SiteDiscipline; label: string; color: string; elements: string; lod: string }> = [
  { id: 'structure', label: 'Structure', color: '#76c9c9', elements: '128,400', lod: 'LOD 350' },
  { id: 'architecture', label: 'Architecture', color: '#a991ff', elements: '96,800', lod: 'LOD 350' },
  { id: 'mep', label: 'MEP', color: '#53f0be', elements: '184,200', lod: 'LOD 400' },
  { id: 'facade', label: 'Facade', color: '#f4bd72', elements: '42,600', lod: 'LOD 350' },
  { id: 'civil', label: 'Civil', color: '#8aa6a0', elements: '18,400', lod: 'LOD 300' },
  { id: 'temporary', label: 'Temporary works', color: '#ff7088', elements: '15,800', lod: 'LOD 300' },
];

export const SITE_TASKS: Array<{ id: string; name: string; start: number; end: number; trade: string; status: 'done' | 'active' | 'planned' }> = [
  { id: 'T-010', name: 'Hoarding, site setup and ELS', start: 0, end: 12, trade: 'Site', status: 'done' },
  { id: 'T-020', name: 'Piling and pile caps', start: 8, end: 26, trade: 'Civil', status: 'done' },
  { id: 'T-030', name: 'Basement and podium structure', start: 22, end: 44, trade: 'Structure', status: 'done' },
  { id: 'T-040', name: 'Tower core and floors 1–21', start: 40, end: 68, trade: 'Structure', status: 'active' },
  { id: 'T-050', name: 'Curtain wall installation', start: 58, end: 82, trade: 'Facade', status: 'active' },
  { id: 'T-060', name: 'MEP risers and plant rooms', start: 54, end: 86, trade: 'MEP', status: 'active' },
  { id: 'T-070', name: 'Fit-out and finishes', start: 76, end: 94, trade: 'Architecture', status: 'planned' },
  { id: 'T-080', name: 'Testing, commissioning and handover', start: 90, end: 100, trade: 'Commissioning', status: 'planned' },
];

export const SITE_CLASHES: Array<{ id: string; title: string; a: string; b: string; level: string; severity: 'high' | 'medium' | 'low'; status: string; position: [number, number, number] }> = [
  { id: 'CL-1042', title: 'Transfer beam vs. chilled-water riser', a: 'Structure · B-08', b: 'MEP · CHWR-02', level: 'L08', severity: 'high', status: 'Open · 6 days', position: [2.2, 6.1, -1.5] },
  { id: 'CL-1088', title: 'Facade bracket vs. slab edge', a: 'Facade · FB-214', b: 'Structure · S-21', level: 'L17', severity: 'medium', status: 'Open · 2 days', position: [-4.4, 12.6, 3.1] },
  { id: 'CL-1101', title: 'Cable tray vs. fire damper', a: 'MEP · CT-08', b: 'Fire · FD-31', level: 'L12', severity: 'low', status: 'In review', position: [3.6, 9.2, 2.4] },
];

export const SITE_MODELS: Array<{ name: string; discipline: string; version: string; status: string; updated: string }> = [
  { name: 'AR-Tower-A.ifc', discipline: 'Architecture', version: 'v42', status: 'Published', updated: '23 Oct 09:12' },
  { name: 'ST-Tower-A.ifc', discipline: 'Structure', version: 'v38', status: 'Published', updated: '23 Oct 08:46' },
  { name: 'MEP-Tower-A.ifc', discipline: 'MEP', version: 'v27', status: 'Shared', updated: '22 Oct 18:20' },
  { name: 'FA-Facade-A.ifc', discipline: 'Facade', version: 'v19', status: 'Shared', updated: '22 Oct 16:05' },
  { name: 'CV-Site-4B.ifc', discipline: 'Civil', version: 'v14', status: 'Published', updated: '21 Oct 11:34' },
  { name: 'TW-Crane-4B.ifc', discipline: 'Temporary', version: 'v08', status: 'Work in progress', updated: '23 Oct 07:58' },
];

export const SITE_QUANTITIES: Array<{ item: string; qty: string; unit: string; variance: string; trend: 'up' | 'down' | 'flat' }> = [
  { item: 'Concrete', qty: '42,180', unit: 'm³', variance: '+1.8%', trend: 'up' },
  { item: 'Reinforcement', qty: '6,840', unit: 't', variance: '+0.6%', trend: 'up' },
  { item: 'Structural steel', qty: '3,260', unit: 't', variance: '−0.4%', trend: 'down' },
  { item: 'Curtain wall', qty: '18,420', unit: 'm²', variance: '0.0%', trend: 'flat' },
  { item: 'Ductwork', qty: '9,860', unit: 'm', variance: '+2.1%', trend: 'up' },
  { item: 'Cable containment', qty: '14,280', unit: 'm', variance: '−1.2%', trend: 'down' },
];

export const SITE_LOGISTICS: Array<{ label: string; value: string; note: string }> = [
  { label: 'Tower cranes', value: '2', note: 'TC-01 38 m · TC-02 32 m' },
  { label: 'Deliveries today', value: '38', note: '6 concrete · 11 rebar · 9 facade' },
  { label: 'Site workforce', value: '428', note: 'Peak 612 · 4 shifts' },
  { label: 'Hoists', value: '4', note: '2 passenger · 2 material' },
  { label: 'Exclusion zones', value: '3', note: 'Lifting · excavation · facade' },
  { label: 'Open permits', value: '12', note: '4 hot works · 3 lifting' },
];

export const SITE_MILESTONES = [
  { date: 'Q2 2025', label: 'Site possession & ELS' },
  { date: 'Q4 2025', label: 'Piling complete' },
  { date: 'Q2 2026', label: 'Podium topped out' },
  { date: 'Q1 2027', label: 'Tower structure complete' },
  { date: 'Q3 2027', label: 'Facade & MEP complete' },
  { date: 'Q4 2027', label: 'Handover & COBie' },
];
