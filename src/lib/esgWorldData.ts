export type WorldLayer = 'embodied' | 'operational' | 'climate' | 'social';

export interface WorldLever {
  id: string;
  label: string;
  category: 'Design' | 'Materials' | 'Construction' | 'Operations' | 'PropTech' | 'Adaptation';
  detail: string;
  embodied: number;
  operational: number;
  waste: number;
  social: number;
  capex: number;
  risk: number;
  bim: string;
}

export const WORLD_BASELINE = {
  embodied: 42800,
  operational: 8900,
  energy: 118,
  waste: 62,
  water: 1.82,
  social: 84,
  risk: 68,
  area: 68400,
  units: 312,
  gridFactor: 0.62,
  budget2030: 38000,
};

export const WORLD_LEVERS: WorldLever[] = [
  { id: 'lowCarbonConcrete', label: 'Low-carbon concrete', category: 'Materials', detail: 'GGBS / fly-ash mix in core, slabs and foundations', embodied: 0.18, operational: 0, waste: 0.02, social: 2, capex: 1.8, risk: -2, bim: 'IfcMaterial · 42,180 m³' },
  { id: 'steelReuse', label: 'Steel reuse & DfD', category: 'Materials', detail: 'Design for disassembly; reclaimed structural steel', embodied: 0.12, operational: 0, waste: 0.08, social: 4, capex: -1.2, risk: -1, bim: 'IfcRelAssociates · 6,840 t' },
  { id: 'facadeRetrofit', label: 'High-performance facade', category: 'Design', detail: 'Triple glazing, solar shading and airtightness', embodied: 0.04, operational: 0.24, waste: 0, social: 3, capex: 18, risk: -5, bim: 'IfcCurtainWall · 18,420 m²' },
  { id: 'heatPumps', label: 'Heat pumps & heat recovery', category: 'Operations', detail: 'Electrify cooling and heating; recover chiller heat', embodied: 0.02, operational: 0.31, waste: 0, social: 2, capex: 12, risk: -4, bim: 'IfcDistributionSystem · L03/L12' },
  { id: 'onsiteSolar', label: 'On-site solar & storage', category: 'Operations', detail: 'Canopy PV, rooftop PV and 2 MWh BESS', embodied: 0.03, operational: 0.12, waste: 0, social: 3, capex: 9, risk: -6, bim: 'IfcEnergyConversionDevice · 1.8 MWp' },
  { id: 'circularFitout', label: 'Circular fit-out', category: 'Construction', detail: 'Reusable partitions, raised floor and furniture', embodied: 0.08, operational: 0.02, waste: 0.14, social: 3, capex: 2.5, risk: -1, bim: 'IfcFurnishingElement · 24,800 m²' },
  { id: 'transitModal', label: 'Low-carbon site transport', category: 'Construction', detail: 'Rail deliveries, electric plant and consolidated logistics', embodied: 0.02, operational: 0.06, waste: 0.03, social: 6, capex: 1.2, risk: -2, bim: '4D logistics · 38 deliveries/day' },
  { id: 'refrigerant', label: 'Low-GWP refrigerant', category: 'Operations', detail: 'R-32 / CO₂ systems with leak detection', embodied: 0, operational: 0.09, waste: 0, social: 0, capex: 3.4, risk: -2, bim: 'IfcRefrigerant · 2 systems' },
  { id: 'greenLease', label: 'Green lease & tenant engagement', category: 'PropTech', detail: 'Sub-metering, fit-out rules and shared savings', embodied: 0, operational: 0.03, waste: 0.02, social: 4, capex: 0.4, risk: -1, bim: 'IfcSpace · 312 units' },
  { id: 'adaptation', label: 'Climate adaptation', category: 'Adaptation', detail: 'Flood barriers, cool roofs and passive resilience', embodied: 0.02, operational: 0.01, waste: 0, social: 5, capex: 9.5, risk: -35, bim: 'IfcSite · flood level +3.2 m' },
];

export const WORLD_LAYERS: Array<{ id: WorldLayer; label: string; color: string; detail: string }> = [
  { id: 'embodied', label: 'Embodied carbon', color: '#ff7088', detail: 'Materials, construction and fit-out' },
  { id: 'operational', label: 'Operational carbon', color: '#f4bd72', detail: 'Energy, cooling and tenant load' },
  { id: 'climate', label: 'Climate risk', color: '#45c4f5', detail: 'Flood, heat and wind exposure' },
  { id: 'social', label: 'Social value', color: '#53f0be', detail: 'Access, amenity, jobs and wellbeing' },
];

export const WORLD_NODES = [
  { id: 'climate', label: 'Climate', value: '1.5–2.4°C', color: '#45c4f5', detail: 'Hazard intensity · 2050' },
  { id: 'design', label: 'Design', value: 'IFC 4.3', color: '#a991ff', detail: 'Form, facade, structure' },
  { id: 'materials', label: 'Materials', value: '42.8 kt', color: '#ff7088', detail: 'Embodied carbon stock' },
  { id: 'construction', label: 'Construction', value: '4D · 5D', color: '#f4bd72', detail: 'Site logistics and waste' },
  { id: 'operations', label: 'Operations', value: '8.9 kt/yr', color: '#76c9c9', detail: 'Energy and cooling' },
  { id: 'occupancy', label: 'Occupancy', value: '312 units', color: '#53f0be', detail: 'PropTech and behaviour' },
  { id: 'value', label: 'Asset value', value: 'HKD 4.82B', color: '#e7a24b', detail: 'Green premium and risk' },
];

export const WORLD_ASSUMPTIONS = [
  'Grid carbon intensity falls from 0.62 to 0.28 kgCO₂e/kWh by 2050.',
  'Embodied factors are ICE v3.0 / EPD baselines; quantities come from the federated BIM.',
  'Operational model uses TMY weather, 312 units and 68,400 m² GFA.',
  'Climate hazard uses SSP2-4.5 flood and heat projections, not a site-specific study.',
  'Financial values are illustrative; no client or market data are connected.',
];

export const WORLD_DISCLOSURE = [
  { framework: 'GHG Protocol', scope: 'Scope 1 · 2 · 3', status: 'Assured', detail: 'Corporate and asset boundary' },
  { framework: 'GRESB', scope: 'Standing investment', status: '82 / 100', detail: 'Management and performance' },
  { framework: 'BEAM Plus', scope: 'New buildings', status: 'Platinum target', detail: 'Energy, water, materials' },
  { framework: 'ISSB / IFRS S2', scope: 'Climate disclosure', status: 'In progress', detail: 'Scenario and physical risk' },
  { framework: 'CSRD / ESRS E1', scope: 'EU reporting', status: 'Gap analysis', detail: 'Double materiality' },
];

export const WORLD_MATERIALS = [
  { item: 'Concrete', qty: '42,180 m³', factor: '0.31 tCO₂e/m³', carbon: '13,076', lever: 'Low-carbon mix' },
  { item: 'Reinforcement', qty: '6,840 t', factor: '0.72 tCO₂e/t', carbon: '4,925', lever: 'Recycled content' },
  { item: 'Structural steel', qty: '3,260 t', factor: '1.35 tCO₂e/t', carbon: '4,401', lever: 'Reuse / DfD' },
  { item: 'Curtain wall', qty: '18,420 m²', factor: '0.42 tCO₂e/m²', carbon: '7,736', lever: 'Low-carbon aluminium' },
  { item: 'MEP & fit-out', qty: '184,200 el.', factor: '—', carbon: '12,662', lever: 'Circular fit-out' },
];

export function simulateWorld(year: number, enabled: string[]) {
  const active = WORLD_LEVERS.filter((l) => enabled.includes(l.id));
  const embodiedReduction = Math.min(0.55, active.reduce((s, l) => s + l.embodied, 0));
  const operationalReduction = Math.min(0.7, active.reduce((s, l) => s + l.operational, 0));
  const wasteGain = active.reduce((s, l) => s + l.waste, 0);
  const socialGain = active.reduce((s, l) => s + l.social, 0);
  const capex = active.reduce((s, l) => s + l.capex, 0);
  const riskReduction = Math.min(0.5, active.reduce((s, l) => s + Math.abs(l.risk) * 0.012, 0));
  const grid = Math.max(0.22, 0.62 - (Math.max(0, year - 2026) / 24) * 0.4);
  const embodied = WORLD_BASELINE.embodied * (1 - embodiedReduction);
  const operational = WORLD_BASELINE.operational * (1 - operationalReduction) * (grid / 0.62);
  const total = embodied + operational;
  const energy = WORLD_BASELINE.energy * (1 - operationalReduction * 0.62);
  const waste = Math.min(96, WORLD_BASELINE.waste + wasteGain * 100);
  const social = WORLD_BASELINE.social + socialGain;
  const risk = Math.max(12, WORLD_BASELINE.risk * (1 - riskReduction));
  const greenPremium = Math.round((-capex * 0.35 + social * 0.22 + (100 - risk) * 0.18) * 10) / 10;
  return { active, embodied, operational, total, energy, waste, social, capex, risk, greenPremium, grid, embodiedReduction, operationalReduction };
}
