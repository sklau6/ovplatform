export type CyberMode = 'network' | 'zones' | 'threats' | 'response';
export type CyberScenario = 'phishing' | 'ransomware' | 'ot';

export const CYBER_MODES: Array<{ id: CyberMode; label: string; color: string; note: string }> = [
  { id: 'network', label: 'Network', color: '#51d6ff', note: 'IT, OT, cloud, BIM and vendor connections.' },
  { id: 'zones', label: 'Zones', color: '#53f0be', note: 'IEC 62443 zones, conduits and least privilege.' },
  { id: 'threats', label: 'Threats', color: '#ff7088', note: 'Attack paths, detections and blast radius.' },
  { id: 'response', label: 'Response', color: '#f4bd72', note: 'Containment, isolation and recovery sequence.' },
];

export const CYBER_SCENARIOS: Record<CyberScenario, { label: string; note: string; risk: string; status: string; compromised: string }> = {
  phishing: { label: 'Phishing', note: 'Credential phishing against a facilities vendor; identity risk elevated.', risk: 'Medium', status: 'Contained', compromised: 'VENDOR-01' },
  ransomware: { label: 'Ransomware', note: 'Ransomware detonation in the corporate segment; backups isolated.', risk: 'High', status: 'Containing', compromised: 'IT-APP-02' },
  ot: { label: 'OT intrusion', note: 'Lateral movement toward BMS; OT conduit segmentation holding.', risk: 'High', status: 'Isolating', compromised: 'BMS-01' },
};

export const CYBER_NODES = [
  { id: 'CLOUD', name: 'Cloud platform', zone: 'Cloud', type: 'Cloud', x: -12, z: -8, y: 5, risk: 'Low', metric: '99.98% uptime' },
  { id: 'IT-APP-02', name: 'Corporate apps', zone: 'IT', type: 'App', x: -4, z: -8, y: 3, risk: 'High', metric: 'Ransomware signal' },
  { id: 'CDE', name: 'BIM common data environment', zone: 'IT', type: 'BIM', x: 5, z: -8, y: 4, risk: 'Medium', metric: '42 models' },
  { id: 'BMS-01', name: 'Building management', zone: 'OT', type: 'BMS', x: 13, z: -3, y: 2, risk: 'High', metric: 'Lateral movement' },
  { id: 'SCADA', name: 'Energy SCADA', zone: 'OT', type: 'SCADA', x: 13, z: 5, y: 2, risk: 'Medium', metric: 'IEC 61850' },
  { id: 'IOT', name: 'IoT sensor mesh', zone: 'OT', type: 'IoT', x: 4, z: 7, y: 2, risk: 'Medium', metric: '1,284 sensors' },
  { id: 'SOC', name: 'Security operations centre', zone: 'IT', type: 'SOC', x: -8, z: 5, y: 4, risk: 'Low', metric: '24/7 monitored' },
  { id: 'IDENT', name: 'Identity & access', zone: 'IT', type: 'Identity', x: -14, z: 0, y: 4, risk: 'Medium', metric: 'Zero trust' },
  { id: 'BACKUP', name: 'Immutable backup', zone: 'DMZ', type: 'Backup', x: -2, z: 10, y: 2, risk: 'Low', metric: 'Air-gapped' },
  { id: 'VENDOR-01', name: 'Facilities vendor', zone: 'DMZ', type: 'Vendor', x: -12, z: 10, y: 2, risk: 'High', metric: 'Phishing target' },
];

export const CYBER_LINKS: Array<[string, string]> = [
  ['CLOUD', 'IT-APP-02'], ['IT-APP-02', 'CDE'], ['IT-APP-02', 'SOC'], ['SOC', 'IDENT'],
  ['CLOUD', 'IDENT'], ['CDE', 'BMS-01'], ['BMS-01', 'SCADA'], ['BMS-01', 'IOT'],
  ['SOC', 'BACKUP'], ['VENDOR-01', 'IDENT'], ['VENDOR-01', 'IT-APP-02'], ['SCADA', 'SOC'],
];

export const CYBER_ALERTS = [
  { id: 'AL-91', title: 'Credential phishing at vendor', severity: 'High', status: 'Contained', detail: 'Mailbox isolated; MFA challenge blocked sign-in from new ASN.' },
  { id: 'AL-94', title: 'Ransomware behaviour on IT-APP-02', severity: 'Critical', status: 'Containing', detail: 'EDR isolated host; backup snapshots locked; restore tested.' },
  { id: 'AL-97', title: 'BMS lateral movement attempt', severity: 'High', status: 'Isolating', detail: 'OT conduit blocked; BMS controller quarantined; local control retained.' },
  { id: 'AL-102', title: 'Vendor account privilege drift', severity: 'Medium', status: 'Open', detail: 'Excess access detected; recertification requested.' },
];

export const CYBER_KPIS = [
  { label: 'Mean time to detect', value: '6.2', unit: 'min', delta: '−2.1 min' },
  { label: 'Mean time to contain', value: '18.4', unit: 'min', delta: '−6 min' },
  { label: 'Assets covered', value: '100', unit: '%', delta: '19 assets' },
  { label: 'Open critical', value: '1', unit: 'alert', delta: 'contained' },
];

export const CYBER_CONTROLS = [
  { label: 'IEC 62443 zones', value: '4 zones · 6 conduits' },
  { label: 'Identity', value: 'Zero trust · 100% MFA' },
  { label: 'Backup', value: 'Immutable · restore tested' },
  { label: 'OT monitoring', value: 'Passive · 24/7 SOC' },
];
