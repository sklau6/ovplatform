export type LabsMode = 'portfolio' | 'experiments' | 'patents' | 'roi';
export type LabsScenario = 'ai' | 'robotics' | 'energy';

export const LABS_MODES: Array<{ id: LabsMode; label: string; color: string; note: string }> = [
  { id: 'portfolio', label: 'Portfolio', color: '#53f0be', note: 'Ventures, stage, ownership and capital deployed.' },
  { id: 'experiments', label: 'Experiments', color: '#51d6ff', note: 'Active tests, cycle time and evidence quality.' },
  { id: 'patents', label: 'IP', color: '#a991ff', note: 'Patents, trade secrets and freedom to operate.' },
  { id: 'roi', label: 'ROI', color: '#f4bd72', note: 'Value, payback and portfolio return.' },
];

export const LABS_SCENARIOS: Record<LabsScenario, { label: string; note: string; experiments: number; value: string; status: string }> = {
  ai: { label: 'AI platforms', note: 'Agentic operations and twin intelligence experiments at peak.', experiments: 18, value: 'HK$420M', status: 'Scaling' },
  robotics: { label: 'Robotics', note: 'Site robotics and prefab automation pilots in two programmes.', experiments: 12, value: 'HK$260M', status: 'Piloting' },
  energy: { label: 'Energy & carbon', note: 'Storage, carbon and circularity ventures in commercial validation.', experiments: 15, value: 'HK$310M', status: 'Validating' },
};

export const LABS_VENTURES = [
  { id: 'GRID', name: 'GridSense AI', stage: 'Scale', trl: 8, investment: 'HK$24M', value: 'HK$180M', status: 'Revenue', color: '#53f0be' },
  { id: 'TWIN', name: 'TwinFM', stage: 'Pilot', trl: 6, investment: 'HK$18M', value: 'HK$96M', status: 'Pilot', color: '#51d6ff' },
  { id: 'CARB', name: 'CarbonTrace', stage: 'Validate', trl: 5, investment: 'HK$9M', value: 'HK$42M', status: 'Validation', color: '#a991ff' },
  { id: 'ROBO', name: 'RoboBuild', stage: 'Pilot', trl: 6, investment: 'HK$14M', value: 'HK$74M', status: 'Pilot', color: '#f4bd72' },
  { id: 'WATER', name: 'WaterLoop', stage: 'Discover', trl: 3, investment: 'HK$4M', value: 'HK$18M', status: 'Experiment', color: '#45c4f5' },
  { id: 'LEASE', name: 'LeaseIQ', stage: 'Scale', trl: 8, investment: 'HK$12M', value: 'HK$88M', status: 'Revenue', color: '#ff9f43' },
];

export const LABS_KPIS = [
  { label: 'Ventures', value: '6', unit: 'active', delta: '2 scaling' },
  { label: 'Experiments', value: '18', unit: 'live', delta: '9 this quarter' },
  { label: 'Venture value', value: 'HK$498M', unit: 'marked', delta: '+22%' },
  { label: 'Time to pilot', value: '9.4', unit: 'weeks', delta: '−2.1' },
];

export const LABS_ACTIONS = [
  { title: 'Scale GridSense to TKO', impact: 'HK$42M ARR', owner: 'Ventures', status: 'Approved' },
  { title: 'RoboBuild site pilot 2', impact: '2 programmes', owner: 'Robotics', status: 'Pilot' },
  { title: 'CarbonTrace patent filing', impact: '2 claims', owner: 'Legal', status: 'Draft' },
  { title: 'WaterLoop commercial test', impact: '3 sites', owner: 'ESG', status: 'Design' },
];
