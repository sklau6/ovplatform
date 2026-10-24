export type DistrictId = 'KT' | 'KE' | 'WK' | 'CH' | 'TKO' | 'NM';
export type AssetStatus = 'operational' | 'commissioning' | 'construction';
export type AssetKind = 'tower' | 'campus' | 'retail' | 'residential' | 'civic' | 'industrial' | 'infrastructure' | 'data';

export interface District {
  id: DistrictId;
  name: string;
  short: string;
  polygon: string;
  labelX: number;
  labelY: number;
  energyIntensity: number;
  assets: number;
  gfa: number;
  carbon: number;
  accent: string;
  note: string;
}

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  district: DistrictId;
  status: AssetStatus;
  x: number;
  y: number;
  height: number;
  floors: number;
  gfa: number;
  year: number;
  energy: number;
  occupancy: number;
  availability: number;
  carbon: number;
  value: number;
  sensors: number;
  workOrders: number;
  risk: 'low' | 'medium' | 'high';
  modelUrn: string;
  modelVersion: string;
  leaseExpiry: string;
  manager: string;
  tenants: number;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  district: DistrictId;
  gate: 'G0' | 'G1' | 'G2' | 'G3' | 'G4';
  rag: 'green' | 'amber' | 'red';
  budget: number;
  spent: number;
  margin: number;
  progress: number;
  owner: string;
  nextGate: string;
  risk: string;
  value: number;
  capability: string;
}

export interface Insight {
  id: string;
  severity: 'critical' | 'warning' | 'opportunity' | 'info';
  title: string;
  detail: string;
  impact: string;
  confidence: number;
  source: string;
  action: string;
  dismissed?: boolean;
}

export interface Anomaly {
  id: string;
  assetId: string;
  asset: string;
  signal: string;
  deviation: string;
  detected: string;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
  recommendation: string;
  savings: number;
}

export interface ModelCard {
  id: string;
  name: string;
  version: string;
  domain: string;
  status: 'production' | 'shadow' | 'pilot';
  accuracy: number;
  drift: number;
  latency: number;
  lastEval: string;
  owner: string;
  notes: string;
}

export interface Tx {
  id: string;
  type: 'ASSET_ANCHOR' | 'CARBON_RETIRE' | 'WORK_ORDER' | 'MODEL_AUDIT' | 'HANDOVER' | 'CARBON_TRANSFER';
  subject: string;
  detail: string;
  actor: string;
  value?: number;
  hash: string;
}

export interface LedgerBlock {
  index: number;
  height: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  nonce: number;
  validator: string;
  txCount: number;
  transactions: Tx[];
}

export interface ProvenanceEvent {
  label: string;
  actor: string;
  date: string;
  hash: string;
  status: 'verified' | 'pending';
}
