export type BimDiscipline = 'architecture' | 'structure' | 'mep' | 'fire' | 'site' | 'clashes';
export type BimStage = 'mobilise' | 'foundation' | 'structure' | 'mep' | 'facade' | 'handover';
export type LodLevel = 200 | 350 | 500;

export const BIM_STAGES: Array<{ id: BimStage; label: string; short: string; progress: number; note: string }> = [
  { id: 'mobilise', label: 'Mobilise', short: 'MOB', progress: 6, note: 'Site establishment, survey control and temporary works.' },
  { id: 'foundation', label: 'Foundation', short: 'FND', progress: 18, note: 'Piles, pile caps, raft and basement core.' },
  { id: 'structure', label: 'Structure', short: 'STR', progress: 52, note: 'Columns, beams, slabs and core jump form.' },
  { id: 'mep', label: 'MEP / FP', short: 'MEP', progress: 72, note: 'Ducts, pipes, cable trays, fire protection and plant.' },
  { id: 'facade', label: 'Facade', short: 'FAC', progress: 88, note: 'Unitised curtain wall and roof plant.' },
  { id: 'handover', label: 'Handover', short: 'H/O', progress: 100, note: 'Commissioning, COBie asset data and soft landings.' },
];

export const BIM_DISCIPLINES: Array<{ id: BimDiscipline; label: string; color: string; note: string }> = [
  { id: 'architecture', label: 'Architecture', color: '#a991ff', note: 'Walls, façade, cores, rooms' },
  { id: 'structure', label: 'Structure', color: '#51d6ff', note: 'Columns, beams, slabs, foundations' },
  { id: 'mep', label: 'MEP', color: '#53f0be', note: 'Ducts, pipes, cable trays, plant' },
  { id: 'fire', label: 'Fire', color: '#ff7088', note: 'Sprinklers, hydrants, fire riser' },
  { id: 'site', label: 'Site', color: '#f4bd72', note: 'Crane, laydown, offices, logistics' },
  { id: 'clashes', label: 'Clashes', color: '#ff9f43', note: 'Federated model conflicts' },
];

export const LOD_LEVELS: Array<{ value: LodLevel; label: string; note: string }> = [
  { value: 200, label: 'LOD 200', note: 'Massing and approximate geometry' },
  { value: 350, label: 'LOD 350', note: 'Coordinated fabrication-level detail' },
  { value: 500, label: 'LOD 500', note: 'As-built + COBie asset data' },
];

export interface BimClash {
  id: string;
  title: string;
  left: string;
  right: string;
  level: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In review' | 'Resolved';
  distance: string;
  position: [number, number, number];
  recommendation: string;
  owner: string;
  due: string;
}

export const BIM_CLASHES: BimClash[] = [
  { id: 'CL-014', title: 'Supply duct intersects L07 beam', left: 'MEP · SA-07 supply duct', right: 'Structure · B-L07-04', level: 'L07', severity: 'High', status: 'Open', distance: '42 mm', position: [3.4, 20.6, -2.1], recommendation: 'Lower duct 150 mm and add beam penetration sleeve.', owner: 'MEP coordinator', due: '24 Oct' },
  { id: 'CL-022', title: 'Fire riser clashes with L03 column', left: 'Fire · FP-RISER-02', right: 'Structure · C-L03-07', level: 'L03', severity: 'High', status: 'In review', distance: '68 mm', position: [-5.4, 8.8, -3.2], recommendation: 'Offset riser 220 mm into the service zone.', owner: 'Fire engineer', due: '26 Oct' },
  { id: 'CL-031', title: 'Cable tray penetrates L09 slab edge', left: 'MEP · CT-L09-03', right: 'Structure · S-L09-02', level: 'L09', severity: 'Medium', status: 'Open', distance: '31 mm', position: [2.2, 26.2, 3.1], recommendation: 'Coordinate a 200 × 100 mm slab penetration.', owner: 'Electrical lead', due: '28 Oct' },
  { id: 'CL-044', title: 'Chilled-water pipe below L05 beam', left: 'MEP · CHW-L05-01', right: 'Structure · B-L05-02', level: 'L05', severity: 'Medium', status: 'Open', distance: '24 mm', position: [-3.7, 14.7, 2.4], recommendation: 'Raise pipe 80 mm within the ceiling void.', owner: 'MEP coordinator', due: '29 Oct' },
  { id: 'CL-052', title: 'AHU access zone blocked by core wall', left: 'MEP · AHU-07', right: 'Architecture · Core wall L07', level: 'L07', severity: 'Low', status: 'Resolved', distance: '0 mm', position: [0.8, 21.5, 1.4], recommendation: 'Relocate access door to the east face.', owner: 'Architect', due: 'Closed' },
];

export interface BimAsset {
  id: string;
  name: string;
  system: 'MEP' | 'Fire' | 'Structure' | 'Architecture';
  level: string;
  zone: string;
  type: string;
  manufacturer: string;
  installed: string;
  warranty: string;
  maintenance: string;
  status: 'Commissioned' | 'Installed' | 'In progress';
}

export const BIM_ASSETS: BimAsset[] = [
  { id: 'AHU-07', name: 'Air handling unit · L07', system: 'MEP', level: 'L07', zone: 'Core east', type: 'AHU', manufacturer: 'Trane', installed: '12 Sep 2026', warranty: '24 months', maintenance: 'Quarterly filter + coil', status: 'Installed' },
  { id: 'FCU-09', name: 'Fan coil unit · L09', system: 'MEP', level: 'L09', zone: 'East perimeter', type: 'FCU', manufacturer: 'Daikin', installed: '28 Sep 2026', warranty: '24 months', maintenance: '6-monthly', status: 'Installed' },
  { id: 'CHW-P03', name: 'Chilled-water pump P03', system: 'MEP', level: 'B1', zone: 'Plant room', type: 'Pump', manufacturer: 'Grundfos', installed: '02 Aug 2026', warranty: '36 months', maintenance: 'Vibration monthly', status: 'Commissioned' },
  { id: 'FP-RISER-02', name: 'Fire riser 02', system: 'Fire', level: 'L03–L12', zone: 'West core', type: 'Riser', manufacturer: 'Tyco', installed: '18 Sep 2026', warranty: '12 months', maintenance: 'Annual flow test', status: 'In progress' },
  { id: 'SPR-L07-04', name: 'Sprinkler head L07-04', system: 'Fire', level: 'L07', zone: 'Open office', type: 'Sprinkler', manufacturer: 'Viking', installed: '21 Sep 2026', warranty: '12 months', maintenance: 'Annual inspection', status: 'Installed' },
  { id: 'CT-L09-03', name: 'Cable tray L09-03', system: 'MEP', level: 'L09', zone: 'Service corridor', type: 'Cable tray', manufacturer: 'Legrand', installed: '05 Oct 2026', warranty: '24 months', maintenance: 'Annual thermographic scan', status: 'Installed' },
  { id: 'C-L07-04', name: 'Column L07-04', system: 'Structure', level: 'L07', zone: 'Grid D4', type: 'Column', manufacturer: 'In-situ RC', installed: '14 Sep 2026', warranty: 'Design life', maintenance: 'Visual + NDT 5-yearly', status: 'Commissioned' },
  { id: 'CW-L07-01', name: 'Curtain wall panel L07-01', system: 'Architecture', level: 'L07', zone: 'North elevation', type: 'Unitised panel', manufacturer: 'Permasteelisa', installed: '11 Oct 2026', warranty: '10 years', maintenance: 'Annual seal check', status: 'Installed' },
];

export const FEDERATION = [
  { discipline: 'Architecture', version: 'v12.4', updated: '21 Oct · 09:14', lod: 'LOD 350', objects: '18,420', status: 'Federated' },
  { discipline: 'Structure', version: 'v9.8', updated: '21 Oct · 09:20', lod: 'LOD 400', objects: '26,180', status: 'Federated' },
  { discipline: 'MEP', version: 'v7.2', updated: '21 Oct · 10:02', lod: 'LOD 350', objects: '31,640', status: 'Federated' },
  { discipline: 'Fire / FP', version: 'v4.6', updated: '21 Oct · 10:15', lod: 'LOD 350', objects: '6,920', status: 'Federated' },
  { discipline: 'Civil / site', version: 'v5.1', updated: '20 Oct · 16:40', lod: 'LOD 300', objects: '8,240', status: 'Federated' },
];

export const BIM_USES = [
  { title: 'Detailed design & visualization', note: 'Immersive 3D review of architecture, structure and services before work starts.', metric: '3D / LOD 350' },
  { title: 'MEP–FP coordination', note: 'Ducts, pipes, cable trays and fire protection resolved in a federated model.', metric: '31.6k objects' },
  { title: 'Clash detection', note: 'Automated conflict tests with owners, distance and recommended resolution.', metric: '5 live clashes' },
  { title: '4D scheduling', note: 'Every element linked to a sequence, zone and planned installation date.', metric: '6 stages' },
  { title: 'COBie & facility management', note: 'Handover asset data, warranty and maintenance instructions linked to geometry.', metric: '8 asset records' },
  { title: 'Quantity takeoff & 5D', note: 'Model quantities feed commercial control and earned-value reporting.', metric: '5D live' },
  { title: 'Prefabrication', note: 'Service modules and façade panels built off-site from coordinated models.', metric: '18 modules' },
  { title: 'As-built & digital handover', note: 'LOD 500 model becomes the operating asset information model.', metric: 'LOD 500' },
];
