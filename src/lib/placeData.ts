export type PlaceMode = 'comfort' | 'green' | 'activation' | 'access';
export type PlaceScenario = 'weekday' | 'event' | 'night';

export const PLACE_MODES: Array<{ id: PlaceMode; label: string; color: string; note: string }> = [
  { id: 'comfort', label: 'Comfort', color: '#f4bd72', note: 'Thermal comfort, shade, wind and noise.' },
  { id: 'green', label: 'Green', color: '#53f0be', note: 'Canopy, biodiversity, water and cooling.' },
  { id: 'activation', label: 'Activation', color: '#51d6ff', note: 'Footfall, dwell time, events and ground-floor activity.' },
  { id: 'access', label: 'Access', color: '#a991ff', note: 'Step-free routes, lighting, sightlines and safety.' },
];

export const PLACE_SCENARIOS: Record<PlaceScenario, { label: string; note: string; footfall: string; dwell: string; comfort: number; status: string }> = {
  weekday: { label: 'Weekday', note: 'Lunchtime peak; market and lawn active; office crowd.', footfall: '3,840 / day', dwell: '22 min', comfort: 78, status: 'Active' },
  event: { label: 'Event mode', note: 'Evening concert; stage and market activated; crowd management on.', footfall: '8,200 / day', dwell: '46 min', comfort: 74, status: 'Event' },
  night: { label: 'Night', note: 'Low footfall; lighting and safety focus; market closed.', footfall: '620 / night', dwell: '14 min', comfort: 71, status: 'Quiet' },
};

export const PLACE_ZONES = [
  { id: 'P-01', name: 'Central lawn', type: 'Lawn', x: -8, z: -4, w: 12, d: 8, footfall: 1240, dwell: 34, canopy: 42, comfort: 81, access: 100 },
  { id: 'P-02', name: 'Market square', type: 'Market', x: 6, z: -5, w: 9, d: 7, footfall: 980, dwell: 26, canopy: 18, comfort: 74, access: 96 },
  { id: 'P-03', name: 'Water garden', type: 'Water', x: -9, z: 7, w: 8, d: 5, footfall: 420, dwell: 18, canopy: 58, comfort: 86, access: 92 },
  { id: 'P-04', name: 'Event stage', type: 'Stage', x: 5, z: 7, w: 8, d: 5, footfall: 760, dwell: 42, canopy: 12, comfort: 70, access: 88 },
  { id: 'P-05', name: 'Play & fitness', type: 'Play', x: 15, z: 2, w: 6, d: 6, footfall: 310, dwell: 28, canopy: 35, comfort: 76, access: 94 },
  { id: 'P-06', name: 'Transit arrival', type: 'Arrival', x: 15, z: -8, w: 6, d: 5, footfall: 620, dwell: 8, canopy: 22, comfort: 72, access: 100 },
];

export const PLACE_KPIS = [
  { label: 'Daily footfall', value: '3,840', unit: 'visits', delta: '+12%' },
  { label: 'Dwell time', value: '22', unit: 'min', delta: '+3 min' },
  { label: 'Canopy cover', value: '38', unit: '%', delta: '+6 pts' },
  { label: 'Comfort index', value: '78', unit: '/100', delta: '+4 pts' },
];

export const PLACE_ACTIONS = [
  { title: 'Shade canopy at market square', impact: '+6°C comfort', owner: 'Placemaking', status: 'Design' },
  { title: 'Evening market trial', impact: '+1,200 visits', owner: 'Operations', status: 'Pilot' },
  { title: 'Step-free route audit', impact: '100% accessible', owner: 'Access', status: 'Live' },
  { title: 'Water garden biodiversity', impact: '+14 species', owner: 'ESG', status: 'Approved' },
];
