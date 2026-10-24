export type HoloMode = 'overview' | 'power' | 'cooling' | 'network' | 'ai';
export type HoloLayout = 'ai' | 'cloud' | 'colo';

export interface HoloRack {
  id: string;
  row: number;
  index: number;
  x: number;
  z: number;
  load: number;
  temp: number;
  status: 'healthy' | 'warm' | 'maintenance';
  type: 'GPU' | 'CPU' | 'Storage';
}

export const HOLO_RACKS: HoloRack[] = Array.from({ length: 32 }, (_, i) => {
  const row = Math.floor(i / 8);
  const index = i % 8;
  return {
    id: `R${row + 1}-${String(index + 1).padStart(2, '0')}`,
    row,
    index,
    x: -17.5 + index * 5.0,
    z: -9 + row * 6.0,
    load: 18 + ((i * 7) % 24),
    temp: 19 + ((i * 3) % 7),
    status: i % 13 === 0 ? 'maintenance' : i % 7 === 0 ? 'warm' : 'healthy',
    type: i % 5 === 0 ? 'Storage' : i % 3 === 0 ? 'CPU' : 'GPU',
  };
});

export const HOLO_MODES: Array<{ id: HoloMode; label: string; icon: string; color: string; note: string }> = [
  { id: 'overview', label: 'Overview', icon: 'Orbit', color: '#51d6ff', note: 'Full BIM model with live IT load, capacity and spatial hierarchy.' },
  { id: 'power', label: 'Power', icon: 'Zap', color: '#f4bd72', note: 'Rack power density, busway utilisation and UPS headroom.' },
  { id: 'cooling', label: 'Cooling', icon: 'Snowflake', color: '#53f0be', note: 'Cold aisle containment, CRAC duty and supply/return temperatures.' },
  { id: 'network', label: 'Network', icon: 'Network', color: '#a991ff', note: 'Spine–leaf fabric, cable trays, port utilisation and latency.' },
  { id: 'ai', label: 'AI capacity', icon: 'Sparkles', color: '#ff9f43', note: 'GPU allocation, training queue and liquid-cooling readiness.' },
];

export const AI_LAYOUTS: Record<HoloLayout, {
  label: string; it: number; pue: number; racks: number; density: string; gpus: string; cooling: string; note: string;
}> = {
  ai: { label: 'AI factory', it: 12, pue: 1.16, racks: 32, density: '40 kW / rack', gpus: '8,192 GPUs', cooling: 'Direct-to-chip liquid', note: 'High-density accelerated compute with rear-door heat exchangers and liquid cooling.' },
  cloud: { label: 'Cloud hall', it: 8, pue: 1.22, racks: 32, density: '18 kW / rack', gpus: '1,280 nodes', cooling: 'Air + containment', note: 'Balanced general-purpose cloud capacity with N+1 CRAC and air containment.' },
  colo: { label: 'Colocation', it: 6, pue: 1.28, racks: 32, density: '10 kW / rack', gpus: 'Multi-tenant', cooling: 'Air cooled', note: 'Flexible multi-tenant hall with metered power and per-cage containment.' },
};

export const HOLO_LAYERS = [
  { id: 'structure', label: 'Structure', color: '#51d6ff' },
  { id: 'racks', label: 'IT racks', color: '#53f0be' },
  { id: 'power', label: 'Power / UPS', color: '#f4bd72' },
  { id: 'cooling', label: 'Cooling loop', color: '#45c4f5' },
  { id: 'network', label: 'Cable trays', color: '#a991ff' },
  { id: 'scan', label: 'Scan plane', color: '#ff9f43' },
];

export const HOLO_ASSET_LIST = [
  { id: 'CRAC-01', name: 'CRAC unit 01', type: 'Cooling', metric: '142 kW', status: 'Healthy' },
  { id: 'CRAC-02', name: 'CRAC unit 02', type: 'Cooling', metric: '138 kW', status: 'Healthy' },
  { id: 'UPS-A', name: 'UPS line A', type: 'Power', metric: '94% load', status: 'Healthy' },
  { id: 'UPS-B', name: 'UPS line B', type: 'Power', metric: '91% load', status: 'Healthy' },
  { id: 'PDU-03', name: 'PDU row 3', type: 'Power', metric: '82% load', status: 'Watch' },
  { id: 'BUS-01', name: 'Busway row 1', type: 'Power', metric: '76% load', status: 'Healthy' },
  { id: 'SPINE-01', name: 'Spine switch 01', type: 'Network', metric: '8.4 Tbps', status: 'Healthy' },
  { id: 'CHILLER-01', name: 'Chiller plant 01', type: 'Cooling', metric: 'PUE contribution 0.16', status: 'Healthy' },
];
