export type ConstructionStageId = 'mobilise' | 'substructure' | 'superstructure' | 'envelope' | 'fitout';

export interface ConstructionStage {
  id: ConstructionStageId;
  label: string;
  short: string;
  window: string;
  progress: number;
  scheduleVariance: number;
  workforce: number;
  openNcr: number;
  safety: string;
  narrative: string;
  activities: Array<{ trade: string; zone: string; planned: string; actual: string; status: 'done' | 'active' | 'queued' | 'risk' }>;
}

export const CONSTRUCTION_STAGES: ConstructionStage[] = [
  {
    id: 'mobilise', label: 'Mobilise', short: 'MOB', window: 'Jun 2026', progress: 8,
    scheduleVariance: 2, workforce: 84, openNcr: 2, safety: '0.12 TRIR',
    narrative: 'Site establishment, hoarding, temporary utilities and the first BIM-to-field control points.',
    activities: [
      { trade: 'Site establishment', zone: 'Gate 3', planned: '02 Jun', actual: '04 Jun', status: 'done' },
      { trade: 'Survey control', zone: 'Grid A–F', planned: '06 Jun', actual: '06 Jun', status: 'done' },
      { trade: 'Temporary power', zone: 'East compound', planned: '09 Jun', actual: '11 Jun', status: 'risk' },
      { trade: 'Piling rig mobilisation', zone: 'Core', planned: '12 Jun', actual: '—', status: 'active' },
    ],
  },
  {
    id: 'substructure', label: 'Substructure', short: 'SUB', window: 'Jul–Sep 2026', progress: 24,
    scheduleVariance: -4, workforce: 142, openNcr: 1, safety: '0.09 TRIR',
    narrative: 'Bored piles, pile caps, basement raft and the first two levels of the core.',
    activities: [
      { trade: 'Bored piles', zone: 'Core', planned: '18 Jul', actual: '16 Jul', status: 'done' },
      { trade: 'Pile cap pour', zone: 'Zone B', planned: '02 Aug', actual: '01 Aug', status: 'done' },
      { trade: 'Basement raft', zone: 'Zone A–C', planned: '29 Aug', actual: '27 Aug', status: 'done' },
      { trade: 'Core jump form', zone: 'Core', planned: '14 Sep', actual: '13 Sep', status: 'active' },
    ],
  },
  {
    id: 'superstructure', label: 'Superstructure', short: 'STR', window: 'Oct 2026–Feb 2027', progress: 56,
    scheduleVariance: 1, workforce: 218, openNcr: 3, safety: '0.14 TRIR',
    narrative: 'Reinforced concrete frame, post-tensioned slabs, structural steel outriggers and façade brackets.',
    activities: [
      { trade: 'Level 6 slab', zone: 'Bay 2', planned: '18 Oct', actual: '19 Oct', status: 'done' },
      { trade: 'Level 7 columns', zone: 'Core + perimeter', planned: '24 Oct', actual: '24 Oct', status: 'active' },
      { trade: 'Level 8 PT slab', zone: 'Bay 1–3', planned: '31 Oct', actual: '—', status: 'queued' },
      { trade: 'Outrigger steel', zone: 'Level 9', planned: '08 Nov', actual: '—', status: 'risk' },
    ],
  },
  {
    id: 'envelope', label: 'Envelope', short: 'ENV', window: 'Feb–May 2027', progress: 78,
    scheduleVariance: -2, workforce: 196, openNcr: 2, safety: '0.11 TRIR',
    narrative: 'Unitised curtain wall, roof plant, waterproofing and the integrated façade access system.',
    activities: [
      { trade: 'Curtain wall L3–L8', zone: 'North elevation', planned: '12 Feb', actual: '12 Feb', status: 'done' },
      { trade: 'Curtain wall L9–L14', zone: 'East elevation', planned: '06 Mar', actual: '05 Mar', status: 'active' },
      { trade: 'Roof plant steel', zone: 'Roof', planned: '22 Mar', actual: '—', status: 'queued' },
      { trade: 'Façade mock-up sign-off', zone: 'Test rig', planned: '29 Mar', actual: '—', status: 'risk' },
    ],
  },
  {
    id: 'fitout', label: 'Fit-out & handover', short: 'FIT', window: 'May–Aug 2027', progress: 94,
    scheduleVariance: 3, workforce: 264, openNcr: 1, safety: '0.08 TRIR',
    narrative: 'Landlord fit-out, MEP commissioning, smart-building integration and the soft-landings programme.',
    activities: [
      { trade: 'Lobby stone', zone: 'Podium', planned: '04 May', actual: '06 May', status: 'risk' },
      { trade: 'MEP commissioning', zone: 'L1–L14', planned: '18 Jun', actual: '17 Jun', status: 'active' },
      { trade: 'BMS point-to-point', zone: 'Risers', planned: '02 Jul', actual: '—', status: 'queued' },
      { trade: 'Tenant soft landings', zone: 'L6–L10', planned: '21 Jul', actual: '—', status: 'queued' },
    ],
  },
];

export const CONSTRUCTION_LAYERS = [
  { id: 'bim', label: 'BIM / 4D', hint: 'IFC 4.3' },
  { id: 'safety', label: 'Safety zones', hint: '3 geofences' },
  { id: 'scan', label: 'Drone scan', hint: 'point cloud' },
  { id: 'logistics', label: 'Site logistics', hint: 'gate + routes' },
] as const;

export type ConstructionLayerId = (typeof CONSTRUCTION_LAYERS)[number]['id'];

export const SITE_RISKS = [
  { title: 'Crane slew zone overlaps Gate 3 pedestrian route', severity: 'high' as const, owner: 'K. Chan', action: 'Reroute + banksman' },
  { title: 'Level 9 outrigger steel lead time +6 days', severity: 'medium' as const, owner: 'P. Fung', action: 'Expedite / resequence' },
  { title: 'Curtain wall mock-up thermal test', severity: 'medium' as const, owner: 'A. Cheng', action: 'Book test rig' },
];

export interface StructuralStudy {
  id: 'tower' | 'bridge';
  label: string;
  eyebrow: string;
  summary: string;
  metrics: Array<{ label: string; value: string; unit?: string; tone: 'green' | 'amber' | 'rose' | 'cyan' }>;
}

export const STRUCTURAL_STUDIES: StructuralStudy[] = [
  {
    id: 'tower', label: 'Tower frame', eyebrow: 'KT-01 · reinforced concrete + steel outrigger',
    summary: 'A 42-storey hybrid frame with a central core, perimeter moment frame and two steel outriggers. The model is linked to IFC 4.3 and the site survey control network.',
    metrics: [
      { label: 'Max drift', value: 'H/612', unit: 'wind', tone: 'green' },
      { label: 'Peak utilisation', value: '0.86', unit: 'UC', tone: 'amber' },
      { label: 'First mode', value: '0.41', unit: 'Hz', tone: 'cyan' },
      { label: 'Pile settlement', value: '18', unit: 'mm', tone: 'green' },
    ],
  },
  {
    id: 'bridge', label: 'Harbour link', eyebrow: 'KT-07 · cable-stayed pedestrian bridge',
    summary: 'A 68 m cable-stayed link with two concrete pylons, 24 stay cables and a steel–concrete composite deck. The twin monitors cable tension, bearing displacement and modal response.',
    metrics: [
      { label: 'Deck deflection', value: 'L/840', unit: 'live load', tone: 'green' },
      { label: 'Max cable tension', value: '1,284', unit: 'kN', tone: 'amber' },
      { label: 'Bearing drift', value: '3.2', unit: 'mm', tone: 'green' },
      { label: 'Modal damping', value: '1.8', unit: '%', tone: 'cyan' },
    ],
  },
];

export type LoadCaseId = 'dead' | 'live' | 'wind' | 'seismic';

export const LOAD_CASES: Array<{ id: LoadCaseId; label: string; note: string }> = [
  { id: 'dead', label: 'Dead', note: 'Self-weight + superimposed dead' },
  { id: 'live', label: 'Live', note: 'Occupancy + fit-out allowance' },
  { id: 'wind', label: 'Wind', note: '1-in-50 year typhoon profile' },
  { id: 'seismic', label: 'Seismic', note: 'DBE response spectrum' },
];

export const STRUCTURAL_MEMBERS = [
  { id: 'C-07', type: 'Column', level: 'L07', section: '900 × 900 RC', uc: 0.86, force: '4,820 kN', note: 'Governing wind + dead combination' },
  { id: 'B-14', type: 'Beam', level: 'L07', section: '600 × 900 PT', uc: 0.72, force: '1,940 kNm', note: 'Transfer beam over lobby' },
  { id: 'BR-03', type: 'Outrigger brace', level: 'L09', section: 'S460 600 UB', uc: 0.81, force: '6,120 kN', note: 'Wind demand critical' },
  { id: 'P-22', type: 'Pile', level: 'Foundation', section: '1.5 m bored pile', uc: 0.64, force: '8,420 kN', note: 'Settlement within 18 mm' },
];

export const BRIDGE_TELEMETRY = [
  { label: 'Cable C-08', value: '1,284 kN', delta: '+2.1%', tone: 'amber' as const },
  { label: 'Bearing B-2', value: '3.2 mm', delta: '+0.4 mm', tone: 'green' as const },
  { label: 'Deck accel.', value: '0.06 g', delta: 'live load', tone: 'cyan' as const },
  { label: 'Corrosion risk', value: 'Low', delta: '9 sensors', tone: 'green' as const },
];

export interface ProptechFloor {
  level: number;
  label: string;
  use: 'Office' | 'Retail' | 'Amenity' | 'Plant';
  area: number;
  occupancy: number;
  rent: number;
  expiry: string;
  tenant: string;
  energy: number;
  nps: number;
  status: 'leased' | 'vacant' | 'expiring' | 'amenity';
}

export const PROPTECH_FLOORS: ProptechFloor[] = [
  { level: 1, label: 'Podium retail', use: 'Retail', area: 18400, occupancy: 96, rent: 182, expiry: '2031', tenant: 'Airside Market', energy: 118, nps: 44, status: 'leased' },
  { level: 2, label: 'Podium retail', use: 'Retail', area: 16200, occupancy: 91, rent: 168, expiry: '2029', tenant: 'Harbour Kitchen', energy: 112, nps: 39, status: 'leased' },
  { level: 3, label: 'L03 · workplace', use: 'Office', area: 14800, occupancy: 94, rent: 212, expiry: '2031', tenant: 'Northbridge', energy: 84, nps: 61, status: 'leased' },
  { level: 4, label: 'L04 · workplace', use: 'Office', area: 14800, occupancy: 92, rent: 210, expiry: '2029', tenant: 'Aster Capital', energy: 82, nps: 58, status: 'leased' },
  { level: 5, label: 'L05 · workplace', use: 'Office', area: 14800, occupancy: 88, rent: 208, expiry: '2028', tenant: 'Meridian Labs', energy: 86, nps: 55, status: 'expiring' },
  { level: 6, label: 'L06 · workplace', use: 'Office', area: 14800, occupancy: 96, rent: 214, expiry: '2032', tenant: 'Ophylla', energy: 80, nps: 66, status: 'leased' },
  { level: 7, label: 'L07 · workplace', use: 'Office', area: 14800, occupancy: 91, rent: 216, expiry: '2030', tenant: 'Kai Tak JV', energy: 83, nps: 60, status: 'leased' },
  { level: 8, label: 'L08 · workplace', use: 'Office', area: 14800, occupancy: 78, rent: 218, expiry: '2027', tenant: 'Vela Studio', energy: 88, nps: 47, status: 'expiring' },
  { level: 9, label: 'L09 · workplace', use: 'Office', area: 14800, occupancy: 0, rent: 220, expiry: '—', tenant: 'Vacant · campaign', energy: 54, nps: 0, status: 'vacant' },
  { level: 10, label: 'L10 · workplace', use: 'Office', area: 14800, occupancy: 94, rent: 222, expiry: '2033', tenant: 'Helix Health', energy: 81, nps: 64, status: 'leased' },
  { level: 11, label: 'L11 · workplace', use: 'Office', area: 14800, occupancy: 89, rent: 224, expiry: '2029', tenant: 'Civic Ventures', energy: 85, nps: 56, status: 'leased' },
  { level: 12, label: 'L12 · workplace', use: 'Office', area: 14800, occupancy: 92, rent: 226, expiry: '2031', tenant: 'Pulse Media', energy: 82, nps: 59, status: 'leased' },
  { level: 13, label: 'L13 · workplace', use: 'Office', area: 14800, occupancy: 90, rent: 228, expiry: '2030', tenant: 'TwinWorks', energy: 84, nps: 62, status: 'leased' },
  { level: 14, label: 'L14 · workplace', use: 'Office', area: 14800, occupancy: 86, rent: 230, expiry: '2028', tenant: 'Northstar', energy: 87, nps: 52, status: 'expiring' },
  { level: 15, label: 'L15 · workplace', use: 'Office', area: 14800, occupancy: 95, rent: 232, expiry: '2034', tenant: 'Aster Capital', energy: 79, nps: 67, status: 'leased' },
  { level: 16, label: 'Sky lounge', use: 'Amenity', area: 6200, occupancy: 74, rent: 0, expiry: '—', tenant: 'Ophylla Club', energy: 96, nps: 71, status: 'amenity' },
];

export const LEASE_PIPELINE = [
  { tenant: 'Northbridge', floor: 'L03', area: '14,800', stage: 'Heads of terms', rent: 'HK$212', probability: 82 },
  { tenant: 'Helix Health', floor: 'L16', area: '6,200', stage: 'Proposal', rent: 'HK$248', probability: 64 },
  { tenant: 'Vela Studio', floor: 'L08', area: '14,800', stage: 'Renewal', rent: 'HK$226', probability: 71 },
  { tenant: 'Meridian Labs', floor: 'L05', area: '14,800', stage: 'At risk', rent: 'HK$224', probability: 38 },
];

export const TENANT_MIX = [
  { name: 'Financial services', share: 34, color: '#3ee0a1' },
  { name: 'Technology', share: 27, color: '#45c4f5' },
  { name: 'Professional services', share: 19, color: '#a78bfa' },
  { name: 'Health & life science', share: 12, color: '#f5b748' },
  { name: 'Retail & amenity', share: 8, color: '#fb7185' },
];

export type AgentStatus = 'active' | 'thinking' | 'waiting' | 'idle';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  function: string;
  color: string;
  status: AgentStatus;
  autonomy: 'Recommend' | 'Execute · gated' | 'Execute · autonomous' | 'Veto · human';
  confidence: number;
  currentTask: string;
  tools: string[];
  lastAction: string;
  metric: { label: string; value: string };
}

export const AGENTS: AIAgent[] = [
  {
    id: 'atlas', name: 'ATLAS', role: 'Portfolio & Capital', function: 'Finance',
    color: '#53f0be', status: 'active', autonomy: 'Recommend', confidence: 94,
    currentTask: 'Reconcile the September close and rebuild the FY27 runway.',
    tools: ['P&L ledger', 'Forecast model', 'Cash view', 'Scenario engine'],
    lastAction: 'Flagged a HK$18M working-capital gap in Q3 collections.',
    metric: { label: 'Runway', value: '18 mo' },
  },
  {
    id: 'keystone', name: 'KEYSTONE', role: 'Delivery & Construction', function: 'Delivery',
    color: '#f4bd72', status: 'thinking', autonomy: 'Execute · gated', confidence: 89,
    currentTask: 'Scan nine stage gates and the critical path for Q4 recovery.',
    tools: ['4D BIM', 'Schedule', 'Site log', 'Change control'],
    lastAction: 'Opened a recovery plan for the KE BIM handover gate.',
    metric: { label: 'On-time', value: '92.6%' },
  },
  {
    id: 'lumen', name: 'LUMEN', role: 'BIM & Digital Twin', function: 'Technology',
    color: '#51d6ff', status: 'active', autonomy: 'Execute · autonomous', confidence: 91,
    currentTask: 'Run model assurance across the federated IFC packages.',
    tools: ['IFC 4.3', 'Clash engine', 'GIS', 'Model registry'],
    lastAction: 'Detected 42 clashes and three structural penetrations.',
    metric: { label: 'Model QA', value: '91.8%' },
  },
  {
    id: 'vector', name: 'VECTOR', role: 'Commercial & Leasing', function: 'Commercial',
    color: '#a991ff', status: 'waiting', autonomy: 'Recommend', confidence: 87,
    currentTask: 'Price lease expiry and vacancy exposure across the portfolio.',
    tools: ['Rent roll', 'Lease events', 'Market comps', 'CRM'],
    lastAction: 'Modelled 18% of KT income expiring within 24 months.',
    metric: { label: 'NRR', value: '108%' },
  },
  {
    id: 'sentinel', name: 'SENTINEL', role: 'Risk, Cyber & Compliance', function: 'Risk',
    color: '#ff7088', status: 'waiting', autonomy: 'Veto · human', confidence: 96,
    currentTask: 'Assess vendor, cyber and safety exposure before gate release.',
    tools: ['Risk register', 'Vendor trust', 'SIEM', 'Policy engine'],
    lastAction: 'Held the BMS integrator release pending remediation evidence.',
    metric: { label: 'High risks', value: '1' },
  },
  {
    id: 'terra', name: 'TERRA', role: 'Sustainability & Carbon', function: 'Sustainability',
    color: '#7ee787', status: 'thinking', autonomy: 'Execute · gated', confidence: 85,
    currentTask: 'Quantify carbon intensity and retrofit optionality.',
    tools: ['Carbon ledger', 'Energy model', 'Tariff data', 'Credits'],
    lastAction: 'Confirmed the Central Market retrofit at a 2.7-year payback.',
    metric: { label: 'Carbon', value: '84.1' },
  },
  {
    id: 'orbit', name: 'ORBIT', role: 'People & Capacity', function: 'People',
    color: '#ffd166', status: 'idle', autonomy: 'Recommend', confidence: 82,
    currentTask: 'Model critical-role coverage and delivery capacity.',
    tools: ['Org graph', 'Skills map', 'Capacity plan', 'Hiring'],
    lastAction: 'Found two uncovered critical roles in delivery leadership.',
    metric: { label: 'Coverage', value: '78%' },
  },
  {
    id: 'pulse', name: 'PULSE', role: 'Client Success & Growth', function: 'Commercial',
    color: '#67b7ff', status: 'active', autonomy: 'Execute · autonomous', confidence: 88,
    currentTask: 'Triage client sentiment and open escalations.',
    tools: ['CRM', 'NPS', 'Support desk', 'Account plans'],
    lastAction: 'Escalated two accounts to executive sponsorship.',
    metric: { label: 'NPS', value: '+41' },
  },
];

export interface OrchestrationStep {
  id: string;
  agentId: string;
  title: string;
  detail: string;
  output: string;
  kind: 'analysis' | 'action' | 'gate' | 'decision';
  requiresApproval?: boolean;
}

export const ORCHESTRATION_STEPS: OrchestrationStep[] = [
  {
    id: 'S1', agentId: 'atlas', title: 'Close the financial loop',
    detail: 'Reconcile the September close, rebuild the FY27 runway and isolate the decisions that change the plan.',
    output: 'Base case: HK$996M revenue · 24.8% EBITDA · HK$128M cash. Two scenarios require COO approval.',
    kind: 'analysis',
  },
  {
    id: 'S2', agentId: 'keystone', title: 'Test the delivery plan',
    detail: 'Scan all nine stage gates, critical path, change exposure and site productivity signals.',
    output: 'KE BIM handover is red; 11 days of float consumed. Recovery plan ready for approval.',
    kind: 'gate', requiresApproval: true,
  },
  {
    id: 'S3', agentId: 'lumen', title: 'Assure the model',
    detail: 'Federate the IFC packages, test model integrity and trace every clash to an owner.',
    output: '42 clashes · 3 structural penetrations · 1 fire-zone breach. Consultant issue pack generated.',
    kind: 'action',
  },
  {
    id: 'S4', agentId: 'vector', title: 'Price the leasing exposure',
    detail: 'Model lease events, vacancy, incentive cost and mark-to-market across the rent roll.',
    output: '18% of Kai Tak income expires within 24 months. Renewal programme at +6.2% MTM.',
    kind: 'analysis',
  },
  {
    id: 'S5', agentId: 'sentinel', title: 'Hold the risk gate',
    detail: 'Evaluate vendor concentration, cyber findings, safety observations and contractual exposure.',
    output: 'One high-severity BMS integrator finding. Release is held until evidence is verified.',
    kind: 'gate', requiresApproval: true,
  },
  {
    id: 'S6', agentId: 'terra', title: 'Quantify the carbon case',
    detail: 'Reconcile the carbon ledger, energy intensity and retrofit economics against the 2026 pathway.',
    output: 'Portfolio intensity 84.1 kWh/m². Central Market retrofit: HK$11.4M NPV, 2.7-year payback.',
    kind: 'decision', requiresApproval: true,
  },
  {
    id: 'S7', agentId: 'orbit', title: 'Check the capacity plan',
    detail: 'Map critical roles, succession coverage and delivery capacity against the FY27 pipeline.',
    output: 'Two critical delivery roles are uncovered. A 90-day contractor bridge preserves the plan.',
    kind: 'analysis',
  },
  {
    id: 'S8', agentId: 'pulse', title: 'Close the client loop',
    detail: 'Triage sentiment, escalations and executive sponsorship coverage across live accounts.',
    output: 'Two accounts need an executive sponsor this week. One renewal is ready to progress.',
    kind: 'decision', requiresApproval: true,
  },
];

export const COMPANY_FUNCTIONS = [
  { name: 'Commercial', owner: 'VECTOR', metric: '3.4× pipeline', tone: '#a991ff', note: 'Win rate 41% · NRR 108%' },
  { name: 'Delivery', owner: 'KEYSTONE', metric: '92.6% on-time', tone: '#f4bd72', note: '9 gates · 2 red' },
  { name: 'Technology', owner: 'LUMEN', metric: '99.98% uptime', tone: '#51d6ff', note: '42 integrations · 4 models' },
  { name: 'Finance', owner: 'ATLAS', metric: '24.8% EBITDA', tone: '#53f0be', note: 'HK$128M cash · 18 mo runway' },
  { name: 'People', owner: 'ORBIT', metric: '78% coverage', tone: '#ffd166', note: '3 critical roles · 9.8% attrition' },
  { name: 'Risk', owner: 'SENTINEL', metric: '1 high risk', tone: '#ff7088', note: '0 overdue actions' },
];

export const COO_CADENCE = [
  { day: 'MON', meeting: 'Delivery & site health', inputs: 'Gates, safety, NCRs, capacity', owner: 'KEYSTONE' },
  { day: 'TUE', meeting: 'Commercial & leasing', inputs: 'Pipeline, renewals, pricing', owner: 'VECTOR' },
  { day: 'WED', meeting: 'Technology & model assurance', inputs: 'Twin, AI, cyber, data quality', owner: 'LUMEN' },
  { day: 'THU', meeting: 'People & partner review', inputs: 'Coverage, succession, partners', owner: 'ORBIT' },
  { day: 'FRI', meeting: 'COO operating review', inputs: 'P&L, cash, risk, decisions', owner: 'ATLAS' },
];

export const HUMAN_GATES = [
  { title: 'KE handover recovery plan', owner: 'KEYSTONE', impact: 'HK$7.2M margin', sla: 'Due 24 Oct' },
  { title: 'BMS vendor release', owner: 'SENTINEL', impact: 'Cyber exposure', sla: 'Held' },
  { title: 'Central Market retrofit G1', owner: 'TERRA', impact: 'HK$11.4M NPV', sla: 'Due 29 Oct' },
  { title: 'FY27 capital envelope', owner: 'ATLAS', impact: 'HK$640M', sla: 'Pre-read' },
];
