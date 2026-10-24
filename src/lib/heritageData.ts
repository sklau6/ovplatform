export type HeritageMode = 'heritage' | 'structure' | 'adaptive' | 'carbon';
export type HeritageScenario = 'museum' | 'office' | 'hotel';

export const HERITAGE_MODES: Array<{ id: HeritageMode; label: string; color: string; note: string }> = [
  { id: 'heritage', label: 'Heritage', color: '#f4bd72', note: 'Significance, fabric, arches and conservation.' },
  { id: 'structure', label: 'Structure', color: '#51d6ff', note: 'Masonry, roof, ties and seismic strengthening.' },
  { id: 'adaptive', label: 'Adaptive reuse', color: '#53f0be', note: 'New core, insertions and lettable area.' },
  { id: 'carbon', label: 'Carbon', color: '#a991ff', note: 'Embodied carbon avoided by retention.' },
];

export const HERITAGE_SCENARIOS: Record<HeritageScenario, { label: string; note: string; retained: string; carbon: string; status: string }> = {
  museum: { label: 'Museum', note: 'Gallery insertions; controlled environment; public courtyard.', retained: '82%', carbon: '−64%', status: 'Consented' },
  office: { label: 'Office', note: 'New core and floors; heritage façade retained; Grade A.', retained: '71%', carbon: '−52%', status: 'Design' },
  hotel: { label: 'Hotel', note: 'Rooms in the roof; courtyard restaurant; conservation repairs.', retained: '76%', carbon: '−58%', status: 'Planning' },
};

export const HERITAGE_ELEMENTS = [
  { id: 'FAC', name: 'Masonry façade', age: '1898', condition: 'Fair', intervention: 'Repair & repoint', carbon: 'Retained', color: '#f4bd72' },
  { id: 'ROF', name: 'Timber roof', age: '1898', condition: 'Poor', intervention: 'Strengthen', carbon: 'Part retained', color: '#a8794a' },
  { id: 'ARC', name: 'Arched colonnade', age: '1898', condition: 'Good', intervention: 'Conserve', carbon: 'Retained', color: '#53f0be' },
  { id: 'COR', name: 'New core', age: '2026', condition: 'New', intervention: 'Insert', carbon: 'New build', color: '#51d6ff' },
  { id: 'GAL', name: 'Gallery insertion', age: '2026', condition: 'New', intervention: 'Insert', carbon: 'Low carbon', color: '#a991ff' },
  { id: 'CRT', name: 'Courtyard', age: '—', condition: 'Good', intervention: 'Reopen', carbon: 'Retained', color: '#ff9f43' },
];

export const HERITAGE_KPIS = [
  { label: 'Fabric retained', value: '82', unit: '%', delta: 'vs demolition' },
  { label: 'Carbon avoided', value: '64', unit: '%', delta: '−1,840 tCO₂e' },
  { label: 'New GFA', value: '8,400', unit: 'm²', delta: 'adaptive' },
  { label: 'Consent', value: '1', unit: 'approval', delta: 'conditions' },
];

export const HERITAGE_ACTIONS = [
  { title: 'Façade repair trial', impact: '5 bays', owner: 'Conservation', status: 'Live' },
  { title: 'Roof strengthening', impact: 'timber ties', owner: 'Structure', status: 'Design' },
  { title: 'Gallery environmental control', impact: '22°C / 50% RH', owner: 'MEP', status: 'Commissioning' },
  { title: 'Heritage interpretation', impact: 'public', owner: 'Culture', status: 'Plan' },
];
