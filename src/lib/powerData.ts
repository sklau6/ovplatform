export type PowerMode = 'distribution' | 'load' | 'quality' | 'reliability';
export type PowerScenario = 'normal' | 'peak' | 'outage';

export const POWER_MODES: Array<{ id: PowerMode; label: string; color: string; note: string }> = [
  { id: 'distribution', label: 'Distribution', color: '#51d6ff', note: 'Transformers, LV switchgear, busbars and feeders.' },
  { id: 'load', label: 'Load', color: '#f4bd72', note: 'Demand, utilisation, spare capacity and diversity.' },
  { id: 'quality', label: 'Power quality', color: '#53f0be', note: 'Voltage, THD, power factor and harmonics.' },
  { id: 'reliability', label: 'Reliability', color: '#a991ff', note: 'N+1, ATS, UPS ride-through and outage response.' },
];

export const POWER_SCENARIOS: Record<PowerScenario, { label: string; note: string; load: string; pf: string; status: string }> = {
  normal: { label: 'Normal', note: 'Utility supply healthy; ATS on main; UPS float.', load: '68%', pf: '0.96', status: 'Normal' },
  peak: { label: 'Peak load', note: 'Demand at 92%; non-critical load shedding armed.', load: '92%', pf: '0.93', status: 'Peak' },
  outage: { label: 'Utility outage', note: 'Main lost; ATS transferred; generator and UPS carrying.', load: '74%', pf: '0.95', status: 'Island' },
};

export const POWER_ASSETS = [
  { id: 'TX-01', name: 'Transformer 01', type: 'Transformer', x: -7, z: -4, metric: '1,500 kVA · 64%', status: 'Loaded', color: '#51d6ff' },
  { id: 'TX-02', name: 'Transformer 02', type: 'Transformer', x: -2, z: -4, metric: '1,500 kVA · 58%', status: 'Loaded', color: '#51d6ff' },
  { id: 'LV-01', name: 'LV main switchboard', type: 'Switchgear', x: 4, z: -4, metric: '3,200 A · 68%', status: 'Closed', color: '#53f0be' },
  { id: 'ATS-01', name: 'Automatic transfer', type: 'ATS', x: 4, z: 1, metric: 'Main source', status: 'Main', color: '#f4bd72' },
  { id: 'UPS-01', name: 'UPS 01', type: 'UPS', x: -5, z: 3, metric: '500 kVA · 82%', status: 'Float', color: '#45c4f5' },
  { id: 'CAP-01', name: 'Capacitor bank', type: 'Power quality', x: 0, z: 4, metric: 'PF 0.96', status: 'Auto', color: '#a991ff' },
  { id: 'GEN-01', name: 'Standby generator', type: 'Generator', x: 8, z: 4, metric: '1,250 kVA', status: 'Standby', color: '#ff9f43' },
];

export const POWER_KPIS = [
  { label: 'Demand', value: '1.84', unit: 'MW', delta: '68%' },
  { label: 'Power factor', value: '0.96', unit: 'PF', delta: 'target 0.95' },
  { label: 'Spare capacity', value: '0.86', unit: 'MW', delta: 'N+1' },
  { label: 'SAIDI', value: '4.2', unit: 'min/yr', delta: '−18%' },
];

export const POWER_ACTIONS = [
  { title: 'Peak load shedding test', impact: 'non-critical', owner: 'Operations', status: 'Ready' },
  { title: 'Transformer 01 oil test', impact: 'annual', owner: 'Electrical', status: 'Scheduled' },
  { title: 'UPS battery replacement', impact: '2027', owner: 'Critical power', status: 'Plan' },
  { title: 'Harmonic filter study', impact: 'THD 4.1%', owner: 'Power quality', status: 'Live' },
];
