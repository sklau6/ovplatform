export type AcousticsMode = 'room' | 'vibration' | 'noise' | 'privacy';
export type AcousticsScenario = 'concert' | 'office' | 'rail';

export const ACOUSTICS_MODES: Array<{ id: AcousticsMode; label: string; color: string; note: string }> = [
  { id: 'room', label: 'Room acoustics', color: '#51d6ff', note: 'Reverberation, clarity and early reflections.' },
  { id: 'vibration', label: 'Vibration', color: '#a991ff', note: 'Rail, plant and footfall vibration.' },
  { id: 'noise', label: 'Noise', color: '#f4bd72', note: 'Environmental noise, breakout and ingress.' },
  { id: 'privacy', label: 'Privacy', color: '#53f0be', note: 'Speech privacy, STC and background noise.' },
];

export const ACOUSTICS_SCENARIOS: Record<AcousticsScenario, { label: string; note: string; rt: string; db: string; status: string }> = {
  concert: { label: 'Concert', note: 'Full hall; reflectors tuned; RT within 1.8–2.1 s.', rt: '1.9 s', db: '98 dBA', status: 'Tuned' },
  office: { label: 'Office', note: 'Open plan; speech privacy and HVAC noise checked.', rt: '0.6 s', db: '38 dBA', status: 'Compliant' },
  rail: { label: 'Rail vibration', note: 'Train pass-by; base isolation and track mitigation.', rt: '0.7 s', db: '42 dBA', status: 'Monitoring' },
};

export const ACOUSTICS_ZONES = [
  { id: 'STG', name: 'Stage', rt: '1.7 s', db: '102 dBA', stc: '—', vibration: 'Low', x: 0, z: -5, color: '#51d6ff' },
  { id: 'STL', name: 'Stalls', rt: '1.9 s', db: '96 dBA', stc: '—', vibration: 'Low', x: 0, z: 1, color: '#53f0be' },
  { id: 'BAL', name: 'Balcony', rt: '2.0 s', db: '92 dBA', stc: '—', vibration: 'Low', x: 0, z: 7, color: '#a991ff' },
  { id: 'ATR', name: 'Atrium', rt: '2.4 s', db: '48 dBA', stc: '—', vibration: 'Medium', x: 7, z: 4, color: '#f4bd72' },
  { id: 'OFF', name: 'Office', rt: '0.6 s', db: '38 dBA', stc: 'STC 48', vibration: 'Low', x: -7, z: 4, color: '#45c4f5' },
  { id: 'PLT', name: 'Plant room', rt: '1.2 s', db: '78 dBA', stc: 'STC 55', vibration: 'High', x: -7, z: 9, color: '#ff7088' },
];

export const ACOUSTICS_KPIS = [
  { label: 'Reverberation', value: '1.9', unit: 's', delta: 'target 2.0' },
  { label: 'Clarity C80', value: '4.2', unit: 'dB', delta: 'good' },
  { label: 'Background noise', value: 'NR 25', unit: 'criterion', delta: 'office' },
  { label: 'Vibration', value: '0.4', unit: 'mm/s', delta: 'rail pass-by' },
];

export const ACOUSTICS_ACTIONS = [
  { title: 'Tune ceiling reflectors', impact: 'RT 1.9 s', owner: 'Acoustics', status: 'Live' },
  { title: 'Rail isolation bearings', impact: '−6 dB', owner: 'Structure', status: 'Installed' },
  { title: 'Office speech privacy', impact: 'STC 48', owner: 'Fit-out', status: 'Pass' },
  { title: 'Plant room attenuators', impact: '−12 dBA', owner: 'MEP', status: 'Commissioning' },
];
