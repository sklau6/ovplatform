export type GraphNodeType = 'data' | 'model' | 'agent' | 'decision' | 'gate';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  x: number;
  y: number;
  z: number;
  detail: string;
  metric: string;
}

export const GRAPH_NODES: GraphNode[] = [
  { id: 'iot', label: 'IoT / BMS', type: 'data', x: -9, y: 0.8, z: -3, detail: '1,284 live sensor streams across 19 assets, normalised into the operating model.', metric: '1,284 streams' },
  { id: 'bim', label: 'BIM / IFC', type: 'data', x: -4, y: 0.8, z: 3, detail: 'Federated model, COBie assets and construction-stage information from the CDE.', metric: '91.4k objects' },
  { id: 'ledger', label: 'Trust ledger', type: 'data', x: 2, y: 0.8, z: -4, detail: 'Immutable model, handover and carbon attestations with SHA-256 provenance.', metric: '18,212 blocks' },
  { id: 'market', label: 'Market / tariff', type: 'data', x: 8, y: 0.8, z: 3, detail: 'Tariff, demand-charge and carbon-price signals for portfolio decisions.', metric: '24h horizon' },
  { id: 'gridsense', label: 'GridSense v4', type: 'model', x: -7, y: 4.2, z: 1, detail: 'Energy and cooling model; 91% confidence on retrofit savings and peak-shave dispatch.', metric: '91% confidence' },
  { id: 'delivery', label: 'Delivery ETA', type: 'model', x: -1, y: 4.6, z: -4, detail: 'Stage-gate delivery risk model; identifies handover variance and recovery paths.', metric: '92.6% on time' },
  { id: 'carbon', label: 'Carbon pathway', type: 'model', x: 5, y: 4.4, z: 2, detail: 'Whole-life carbon and credit-retirement model linked to the trust ledger.', metric: '6.2% gap' },
  { id: 'atlas', label: 'ATLAS', type: 'agent', x: -7, y: 7.6, z: -2, detail: 'Portfolio & capital agent; reconciles close, runway and capital allocation.', metric: '94% confidence' },
  { id: 'terra', label: 'TERRA', type: 'agent', x: -2, y: 8.0, z: 3, detail: 'Sustainability agent; optimises carbon, energy and climate adaptation actions.', metric: '87% confidence' },
  { id: 'sentinel', label: 'SENTINEL', type: 'agent', x: 3, y: 7.8, z: -3, detail: 'Risk agent; monitors delivery, cyber, OT and asset resilience.', metric: '91% confidence' },
  { id: 'vector', label: 'VECTOR', type: 'agent', x: 8, y: 7.5, z: 1, detail: 'Commercial agent; lease events, pricing and tenant-experience signals.', metric: '93% confidence' },
  { id: 'retrofit', label: 'Retrofit decision', type: 'decision', x: -6, y: 11.2, z: 1, detail: 'Central Market retrofit; HK$11.4M NPV, 2.7-year payback; G1 approved.', metric: 'HK$11.4M NPV' },
  { id: 'handover', label: 'Handover recovery', type: 'decision', x: 0, y: 11.5, z: -2, detail: 'Kowloon East BIM handover recovery plan; margin at risk HK$7.2M.', metric: 'HK$7.2M at risk' },
  { id: 'tco', label: 'TKO capacity', type: 'decision', x: 6, y: 11.4, z: 2, detail: 'TKO data-centre expansion constrained by grid capacity; HK$186M revenue exposure.', metric: 'HK$186M exposure' },
  { id: 'gate', label: 'COO gate', type: 'gate', x: 0, y: 14.4, z: 0, detail: 'Human decision gate: approve, reject or request more evidence. No autonomous spend.', metric: '4 approvals' },
];

export const GRAPH_LINKS: Array<[string, string]> = [
  ['iot', 'gridsense'], ['bim', 'delivery'], ['ledger', 'carbon'], ['market', 'carbon'],
  ['iot', 'delivery'], ['bim', 'gridsense'], ['market', 'atlas'], ['ledger', 'sentinel'],
  ['gridsense', 'atlas'], ['gridsense', 'terra'], ['delivery', 'sentinel'], ['carbon', 'terra'],
  ['market', 'vector'], ['atlas', 'retrofit'], ['terra', 'retrofit'], ['sentinel', 'handover'],
  ['vector', 'tco'], ['atlas', 'tco'], ['retrofit', 'gate'], ['handover', 'gate'], ['tco', 'gate'],
];

export const GRAPH_TYPE_META: Record<GraphNodeType, { label: string; color: string }> = {
  data: { label: 'Data', color: '#51d6ff' },
  model: { label: 'Model', color: '#a991ff' },
  agent: { label: 'Agent', color: '#53f0be' },
  decision: { label: 'Decision', color: '#f4bd72' },
  gate: { label: 'Human gate', color: '#ff7088' },
};
