export type SafetyMode = 'hazards' | 'crane' | 'fire' | 'weather';
export type SafetyScenario = 'normal' | 'lift' | 'fire' | 'typhoon';

export const SAFETY_MODES: Array<{ id: SafetyMode; label: string; color: string; note: string }> = [
  { id: 'hazards', label: 'Hazards', color: '#f4bd72', note: 'Work-zone risk, exclusion areas and open permits across the site.' },
  { id: 'crane', label: 'Crane', color: '#51d6ff', note: 'Lift plan, slew envelope, suspended-load exclusion and wind limits.' },
  { id: 'fire', label: 'Fire & evac', color: '#ff7088', note: 'Hot works, fire points, evacuation routes and assembly point.' },
  { id: 'weather', label: 'Weather', color: '#a991ff', note: 'Typhoon readiness, wind speed, drainage and flood exposure.' },
];

export const SAFETY_SCENARIOS: Record<SafetyScenario, { label: string; note: string; evacuation: string; risk: string; status: string }> = {
  normal: { label: 'Normal shift', note: 'Routine work fronts active; permits and crane limits normal.', evacuation: '—', risk: 'Low', status: 'Controlled' },
  lift: { label: 'Critical lift', note: 'Suspended load over the east core; exclusion zone enforced.', evacuation: '—', risk: 'Medium', status: 'Lift plan active' },
  fire: { label: 'Fire drill', note: 'Hot-works ignition simulated; evacuation and roll call activated.', evacuation: '4:12', risk: 'High', status: 'Evacuating' },
  typhoon: { label: 'Typhoon T8', note: 'Crane locked, loose materials secured, drainage pumps on standby.', evacuation: '—', risk: 'High', status: 'Site securing' },
};

export const SAFETY_KPIS = [
  { label: 'LTIFR', value: '0.42', unit: 'per 200k hrs', delta: '−18% YoY' },
  { label: 'Near misses', value: '7', unit: 'open', delta: '−3 this month' },
  { label: 'Permits live', value: '12', unit: 'active', delta: '2 high-risk' },
  { label: 'Safety observations', value: '86', unit: 'this month', delta: '+14%' },
];

export const HAZARDS = [
  { id: 'H-01', title: 'Suspended load over east core', zone: 'Crane radius', severity: 'High', status: 'Controlled', owner: 'Lift supervisor', mitigation: 'Exclusion zone + tag line' },
  { id: 'H-02', title: 'Excavation edge unprotected', zone: 'North basement', severity: 'High', status: 'Open', owner: 'Site manager', mitigation: 'Edge protection + barrier' },
  { id: 'H-03', title: 'Hot works near membrane', zone: 'Level 04', severity: 'Medium', status: 'Permitted', owner: 'Fire watch', mitigation: 'Fire watch + extinguisher' },
  { id: 'H-04', title: 'Public interface at hoarding', zone: 'South gate', severity: 'Medium', status: 'Controlled', owner: 'Security', mitigation: 'Segregated walkway' },
  { id: 'H-05', title: 'Loose materials in wind', zone: 'Laydown', severity: 'Medium', status: 'Open', owner: 'Logistics', mitigation: 'Secure / remove' },
  { id: 'H-06', title: 'Worker fatigue — night shift', zone: 'All zones', severity: 'Low', status: 'Monitored', owner: 'HSE', mitigation: 'Rotation + checks' },
];

export const PERMITS = [
  { id: 'PTW-218', type: 'Hot works', zone: 'Level 04', status: 'Active', expires: '18:00' },
  { id: 'PTW-224', type: 'Lift plan', zone: 'East core', status: 'Active', expires: '16:30' },
  { id: 'PTW-231', type: 'Confined space', zone: 'Basement', status: 'Suspended', expires: '—' },
  { id: 'PTW-236', type: 'Electrical isolation', zone: 'Plant room', status: 'Active', expires: '17:00' },
];

export const EVAC_STEPS = [
  { t: 'T+0:00', event: 'Alarm raised at Level 04 hot-works zone', tone: 'rose' },
  { t: 'T+0:20', event: 'Fire watch confirms; site-wide evacuation tone', tone: 'amber' },
  { t: 'T+1:05', event: 'Workers moving to assembly point A', tone: 'cyan' },
  { t: 'T+3:40', event: 'Roll call complete — 148 / 148 accounted', tone: 'green' },
  { t: 'T+4:12', event: 'Fire service access confirmed; all clear pending', tone: 'green' },
];
