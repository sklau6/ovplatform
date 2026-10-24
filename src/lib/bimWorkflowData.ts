export type ToolCategory = 'Authoring' | 'BIM management' | 'CDE' | 'Design review' | 'Issue management';

export interface BimTool {
  id: string;
  name: string;
  category: ToolCategory;
  role: string;
  formats: string;
  status: 'Connected' | 'Syncing' | 'Review';
  version: string;
  color: string;
  stage: 'author' | 'federate' | 'review' | 'construct' | 'operate';
}

export const BIM_TOOLS: BimTool[] = [
  { id: 'revit', name: 'Autodesk Revit', category: 'Authoring', role: 'Parametric architecture, structure and MEP authoring', formats: 'RVT · IFC 4.3', status: 'Connected', version: '2026.2', color: '#4aa3ff', stage: 'author' },
  { id: 'archicad', name: 'ArchiCAD', category: 'Authoring', role: 'Architectural BIM, documentation and model publishing', formats: 'PLN · IFC 4.3', status: 'Connected', version: '28', color: '#6ec6a8', stage: 'author' },
  { id: 'sketchup', name: 'SketchUp', category: 'Authoring', role: 'Concept massing and early-stage design studies', formats: 'SKP · IFC', status: 'Connected', version: '2026', color: '#e7a24b', stage: 'author' },
  { id: 'rhino', name: 'Rhino + Grasshopper', category: 'Authoring', role: 'Complex geometry, computational design and facade rationalisation', formats: '3DM · IFC', status: 'Syncing', version: '8', color: '#b08bff', stage: 'author' },
  { id: 'vectorworks', name: 'Vectorworks', category: 'Authoring', role: 'Architectural planning, drafting and BIM documentation', formats: 'VWX · IFC', status: 'Connected', version: '2026', color: '#e77a9b', stage: 'author' },
  { id: 'autocad', name: 'AutoCAD', category: 'Authoring', role: '2D documentation, details and survey base drawings', formats: 'DWG · DXF', status: 'Connected', version: '2026', color: '#9eb7c9', stage: 'author' },
  { id: 'plannerly', name: 'Plannerly', category: 'BIM management', role: 'BIM execution plan, scope, responsibilities and information requirements', formats: 'BCF · Excel · API', status: 'Connected', version: 'Cloud', color: '#53f0be', stage: 'federate' },
  { id: 'trimble', name: 'Trimble Connect', category: 'CDE', role: 'Federated model CDE, version control and construction-ready data', formats: 'IFC · BCF · RVT', status: 'Connected', version: 'Cloud', color: '#f4bd72', stage: 'construct' },
  { id: 'revizto', name: 'Revizto', category: 'Design review', role: 'Interactive 3D model review, viewpoints, markups and issue tracking', formats: 'IFC · BCF · JSON', status: 'Connected', version: '7', color: '#ff8f6b', stage: 'review' },
  { id: 'bimcollab', name: 'BIMcollab', category: 'Issue management', role: 'Clash and issue management, BCF workflow and change tracking', formats: 'BCF 3.0 · IFC', status: 'Connected', version: 'Cloud', color: '#ff7088', stage: 'review' },
];

export const WORKFLOW_STEPS = [
  { id: 'author', label: 'Author', detail: 'Revit · ArchiCAD · SketchUp · Rhino · Vectorworks · AutoCAD', color: '#4aa3ff' },
  { id: 'federate', label: 'Federate', detail: 'IFC 4.3 · Plannerly scope · Trimble Connect CDE', color: '#53f0be' },
  { id: 'review', label: 'Review', detail: 'Revizto viewpoints · BIMcollab BCF issues', color: '#ff8f6b' },
  { id: 'resolve', label: 'Resolve', detail: 'Clash resolution · model re-federation · sign-off', color: '#f4bd72' },
  { id: 'construct', label: 'Construct', detail: '4D sequence · site logistics · as-built verification', color: '#b08bff' },
  { id: 'handover', label: 'Handover', detail: 'COBie · asset data · O&M · digital twin', color: '#76c9c9' },
  { id: 'operate', label: 'Operate', detail: 'Proptech.AI access · occupancy · visitor analytics', color: '#e77a9b' },
] as const;

export const WORKFLOW_ISSUES = [
  { id: 'BCF-2041', title: 'Transfer beam vs. chilled-water riser', tool: 'BIMcollab', author: 'MEP coordination', assignee: 'A. Cheng', due: 'Today 17:00', status: 'Open', priority: 'High', viewpoint: 'L08 · Grid C4' },
  { id: 'BCF-2048', title: 'Facade bracket clashes with slab edge', tool: 'Revizto', author: 'Facade review', assignee: 'K. Wong', due: 'Tomorrow', status: 'In review', priority: 'Medium', viewpoint: 'L17 · East elevation' },
  { id: 'BCF-2053', title: 'Cable tray obstructs fire damper access', tool: 'BIMcollab', author: 'Fire coordination', assignee: 'S. Lee', due: '25 Oct', status: 'Open', priority: 'Medium', viewpoint: 'L12 · Plant room' },
  { id: 'BCF-2061', title: 'Revit family parameter missing for riser', tool: 'Plannerly', author: 'Information management', assignee: 'D. Chan', due: 'Resolved', status: 'Closed', priority: 'Low', viewpoint: 'Model audit' },
];

export const ACCESS_METRICS = [
  { label: 'Enrolled people', value: '428', note: 'app-less onboarding' },
  { label: 'On site now', value: '312', note: '73% of enrolled' },
  { label: 'Visitors today', value: '38', note: '12 pre-registered' },
  { label: 'Entries today', value: '1,284', note: '6 turnstiles' },
  { label: 'Face match', value: '99.9%', note: 'hands-free access' },
  { label: 'Peak hour', value: '08:15', note: '184 entries/hr' },
];

export const ACCESS_EVENTS = [
  { time: '08:12', person: 'Chan K. W.', role: 'Site engineer', gate: 'Gate 1 · Turnstile 2', method: 'Facial recognition', result: 'Granted' },
  { time: '08:14', person: 'Wong M. Y.', role: 'Facade installer', gate: 'Gate 1 · Turnstile 1', method: 'Facial recognition', result: 'Granted' },
  { time: '08:17', person: 'Visitor · Arup', role: 'Design review', gate: 'Gate 2 · Reception', method: 'Visitor QR', result: 'Granted' },
  { time: '08:21', person: 'Lee S. H.', role: 'MEP coordinator', gate: 'Gate 1 · Turnstile 3', method: 'Facial recognition', result: 'Granted' },
  { time: '08:29', person: 'Unknown', role: 'No induction', gate: 'Gate 1 · Turnstile 2', method: 'Facial recognition', result: 'Denied' },
];

export const OCCUPANCY_SERIES = [18, 22, 35, 68, 142, 184, 162, 148, 158, 171, 149, 138, 128, 142, 156, 121, 96, 62];
