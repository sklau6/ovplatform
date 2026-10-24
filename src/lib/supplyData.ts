export type SupplyMode = 'suppliers' | 'logistics' | 'inventory' | 'risk' | 'carbon';
export type SupplyScenario = 'normal' | 'port' | 'typhoon';

export const SUPPLY_MODES: Array<{ id: SupplyMode; label: string; color: string; note: string }> = [
  { id: 'suppliers', label: 'Suppliers', color: '#53f0be', note: 'Qualified suppliers and prefabrication partners by discipline.' },
  { id: 'logistics', label: 'Logistics', color: '#51d6ff', note: 'Sea, air and road routes with live shipment positions.' },
  { id: 'inventory', label: 'Inventory', color: '#a991ff', note: 'Committed spend, buffer stock and lead-time exposure.' },
  { id: 'risk', label: 'Risk', color: '#ff7088', note: 'Concentration, port disruption and single-source exposure.' },
  { id: 'carbon', label: 'Carbon', color: '#f4bd72', note: 'Transport and embodied-carbon intensity by lane.' },
];

export const SUPPLY_SCENARIOS: Record<SupplyScenario, { label: string; note: string; otif: number; lead: number; risk: string; status: string }> = {
  normal: { label: 'Normal', note: 'Ports and lanes operating normally; buffer stock within policy.', otif: 94.6, lead: 18.2, risk: 'Low', status: 'Stable' },
  port: { label: 'Port congestion', note: 'Singapore transhipment delay; air-freight mitigation active.', otif: 88.4, lead: 25.6, risk: 'Medium', status: 'Mitigating' },
  typhoon: { label: 'Typhoon T8', note: 'South China ports closed; road and sea lanes suspended.', otif: 72.8, lead: 34.8, risk: 'High', status: 'Recovering' },
};

export interface SupplyNode {
  id: string; name: string; city: string; lat: number; lon: number; type: string; spend: number; lead: number; otif: number; risk: string; carbon: number;
}

export const SUPPLY_NODES: SupplyNode[] = [
  { id: 'HKG', name: 'Hong Kong hub', city: 'Hong Kong', lat: 22.3, lon: 114.17, type: 'Hub', spend: 0, lead: 0, otif: 97, risk: 'Low', carbon: 0 },
  { id: 'SZX', name: 'Shenzhen prefab', city: 'Shenzhen', lat: 22.54, lon: 114.06, type: 'Prefab', spend: 186, lead: 2, otif: 96, risk: 'Low', carbon: 18 },
  { id: 'CAN', name: 'Guangzhou steel', city: 'Guangzhou', lat: 23.13, lon: 113.26, type: 'Steel', spend: 142, lead: 3, otif: 92, risk: 'Medium', carbon: 28 },
  { id: 'SHA', name: 'Shanghai MEP', city: 'Shanghai', lat: 31.23, lon: 121.47, type: 'MEP', spend: 214, lead: 7, otif: 91, risk: 'Medium', carbon: 34 },
  { id: 'SIN', name: 'Singapore transhipment', city: 'Singapore', lat: 1.35, lon: 103.82, type: 'Port', spend: 98, lead: 9, otif: 88, risk: 'High', carbon: 21 },
  { id: 'TYO', name: 'Tokyo controls', city: 'Tokyo', lat: 35.68, lon: 139.69, type: 'Controls', spend: 76, lead: 6, otif: 95, risk: 'Low', carbon: 42 },
  { id: 'RTM', name: 'Rotterdam facade', city: 'Rotterdam', lat: 51.92, lon: 4.48, type: 'Facade', spend: 168, lead: 28, otif: 86, risk: 'Medium', carbon: 58 },
  { id: 'DXB', name: 'Dubai logistics', city: 'Dubai', lat: 25.2, lon: 55.27, type: 'Logistics', spend: 64, lead: 12, otif: 90, risk: 'Medium', carbon: 47 },
  { id: 'LAX', name: 'Los Angeles AV systems', city: 'Los Angeles', lat: 34.05, lon: -118.24, type: 'AV systems', spend: 88, lead: 21, otif: 84, risk: 'High', carbon: 62 },
];

export const SUPPLY_ROUTES: Array<{ from: string; to: string; mode: string; volume: string; carbon: number; risk: string }> = [
  { from: 'SZX', to: 'HKG', mode: 'Road', volume: '18 modules / week', carbon: 18, risk: 'Low' },
  { from: 'CAN', to: 'HKG', mode: 'Road', volume: '340 t / week', carbon: 28, risk: 'Low' },
  { from: 'SHA', to: 'HKG', mode: 'Sea', volume: '12 containers', carbon: 34, risk: 'Medium' },
  { from: 'SIN', to: 'HKG', mode: 'Sea', volume: '8 containers', carbon: 21, risk: 'High' },
  { from: 'TYO', to: 'HKG', mode: 'Air', volume: '2.4 t / week', carbon: 42, risk: 'Low' },
  { from: 'RTM', to: 'HKG', mode: 'Sea', volume: '6 facade containers', carbon: 58, risk: 'Medium' },
  { from: 'DXB', to: 'HKG', mode: 'Air', volume: '1.8 t / week', carbon: 47, risk: 'Medium' },
  { from: 'LAX', to: 'HKG', mode: 'Sea', volume: '4 AV containers', carbon: 62, risk: 'High' },
];

export const SUPPLY_KPIS = [
  { label: 'OTIF', value: '94.6', unit: '%', delta: '+2.1 pts' },
  { label: 'Lead time', value: '18.2', unit: 'days', delta: '−1.4 days' },
  { label: 'Committed spend', value: '1.04', unit: 'HK$B', delta: '38 suppliers' },
  { label: 'Lane carbon', value: '38', unit: 'kg/t', delta: '−12% YoY' },
];

export const SUPPLIER_ACTIONS = [
  { title: 'Dual-source AV systems', impact: 'Remove LAX single-source risk', owner: 'Procurement', status: 'Business case' },
  { title: 'Shift 20% Shanghai MEP to rail', impact: '−14% lane carbon', owner: 'Logistics', status: 'Pilot' },
  { title: 'Buffer stock at HKG hub', impact: '+6 days cover', owner: 'Operations', status: 'Approved' },
  { title: 'Qualify Shenzhen prefab line 2', impact: '+18 modules/week', owner: 'Quality', status: 'Audit' },
];
