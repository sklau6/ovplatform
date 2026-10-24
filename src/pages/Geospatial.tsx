import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Box, Download, Droplets, Filter, GitBranch, Layers, MapPin,
  Radar, Radio, Search, ShieldAlert, SquareStack, Waves, Zap,
} from 'lucide-react';
import { CityMap, DEFAULT_MAP_LAYERS, heatColor, type MapLayers } from '../components/CityMap';
import { TwinScene, type TwinLayers } from '../components/TwinScene';
import { Progress, Segmented, Badge, Button, LiveTag } from '../components/ui';
import { ASSETS, DISTRICTS, DISTRICTS_SUMMARY, districtById, KIND_LABEL, STATUS_LABEL } from '../lib/data';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn, downloadFile, hkd, numberFormat } from '../lib/utils';
import type { Asset } from '../lib/types';

type Metric = 'energy' | 'occupancy' | 'carbon';

const metricMeta: Record<Metric, { label: string; min: number; max: number; unit: string }> = {
  energy: { label: 'Energy intensity', min: 65, max: 110, unit: 'kWh/m²' },
  occupancy: { label: 'Occupancy', min: 50, max: 96, unit: '%' },
  carbon: { label: 'Carbon', min: 18, max: 48, unit: 'tCO₂e' },
};

export function Geospatial() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string>('KT-01');
  const [metric, setMetric] = useState<Metric>('energy');
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_MAP_LAYERS);
  const [query, setQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('3d');
  const [autoRotate3d, setAutoRotate3d] = useState(false);

  const selected = ASSETS.find((a) => a.id === selectedId) ?? null;
  const twinLayers = useMemo<TwinLayers>(() => ({
    gis: true,
    iot: layers.sensors,
    energy: layers.choropleth,
    transit: layers.transit,
  }), [layers.sensors, layers.choropleth, layers.transit]);

  const filtered = useMemo(() => ASSETS.filter((a) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${a.name} ${a.id} ${a.district} ${KIND_LABEL[a.kind]}`.toLowerCase().includes(q);
    const matchesDistrict = districtFilter === 'ALL' || a.district === districtFilter;
    return matchesQuery && matchesDistrict;
  }), [query, districtFilter]);

  const ranking = useMemo(() => [...DISTRICTS].sort((a, b) => {
    const av = metric === 'occupancy' ? DISTRICTS_SUMMARY.find((d) => d.id === a.id)?.occupancy ?? 0 : metric === 'carbon' ? a.carbon : a.energyIntensity;
    const bv = metric === 'occupancy' ? DISTRICTS_SUMMARY.find((d) => d.id === b.id)?.occupancy ?? 0 : metric === 'carbon' ? b.carbon : b.energyIntensity;
    return bv - av;
  }), [metric]);

  const toggle = (key: keyof MapLayers) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const exportGeo = () => {
    const collection = {
      type: 'FeatureCollection',
      name: 'ophylla_portfolio',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: ASSETS.map((a) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [114.05 + (a.x / 1400) * 0.32, 22.36 - (a.y / 900) * 0.18] },
        properties: { id: a.id, name: a.name, district: a.district, status: a.status, gfa_ft2: a.gfa, energy_kwh_m2: a.energy, occupancy_pct: a.occupancy, sensors: a.sensors },
      })),
    };
    downloadFile('ophylla-portfolio.geojson', JSON.stringify(collection, null, 2), 'application/geo+json');
    toast('GeoJSON exported', `${ASSETS.length} asset records · CRS84 · property schema included.`, 'success');
  };

  return (
    <div className="page-enter mx-auto max-w-[1540px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-2">Geospatial intelligence</div>
          <h1 className="display text-[28px] text-white">{t('map.title', 'Everything has a place.')}</h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)]">
            {t('map.desc', 'Six districts, nineteen assets and one spatial model. Move from location to operating decision without leaving the map.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Sensor mesh live</span>
          <Button variant="secondary" size="sm" onClick={exportGeo}><Download size={12} /> Export GeoJSON</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/twin')}><Box size={12} /> Open twin</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: SquareStack, label: 'Portfolio GFA', value: '4.82M', unit: 'ft²', sub: 'across 6 districts' },
          { icon: Radio, label: 'Live sensors', value: '1,284', unit: 'streams', sub: '99.1% healthy' },
          { icon: Droplets, label: 'Flood exposure', value: '3', unit: 'assets', sub: 'within 1-in-50 zone' },
          { icon: ShieldAlert, label: 'Spatial risk', value: '2', unit: 'flags', sub: 'grid + planning' },
        ].map((k) => (
          <div key={k.label} className="panel flex items-center gap-3 px-4 py-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] bg-white/[.02]"><k.icon size={15} className="text-[var(--muted)]" /></div>
            <div>
              <div className="text-[8.5px] uppercase tracking-[0.1em] text-[var(--dim)]">{k.label}</div>
              <div className="num text-[18px] text-white">{k.value} <span className="text-[9px] font-normal text-[var(--dim)]">{k.unit}</span></div>
              <div className="text-[8.5px] text-[var(--dim)]">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-[var(--accent)]" />
              <span className="text-[11px] font-medium text-[#dbe5ee]">Portfolio spatial view</span>
              <LiveTag label="WGS84" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="tabs">
                <button className={cn('tab', mapMode === '2d' && 'active')} onClick={() => setMapMode('2d')}>2D map</button>
                <button className={cn('tab', mapMode === '3d' && 'active')} onClick={() => setMapMode('3d')}>3D GIS</button>
              </div>
              {mapMode === '2d' && (
                <Segmented
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: 'energy', label: 'Energy' },
                    { value: 'occupancy', label: 'Occupancy' },
                    { value: 'carbon', label: 'Carbon' },
                  ]}
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[var(--line)] px-4 py-2">
            {([
              ['choropleth', 'Choropleth', Layers],
              ['assets', 'Assets', MapPin],
              ['sensors', 'Sensor mesh', Radar],
              ['transit', 'Transit', GitBranch],
              ['flood', 'Flood zones', Waves],
              ['labels', 'Labels', Filter],
            ] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => toggle(key)} className="flex items-center gap-1.5 text-[9.5px]">
                <span className={cn('h-[13px] w-[22px] rounded-full border transition-colors', layers[key] ? 'border-[rgba(62,224,161,.5)] bg-[rgba(62,224,161,.2)]' : 'border-[var(--line-2)] bg-white/[.03]')}>
                  <span className={cn('block h-[7px] w-[7px] translate-y-[2px] rounded-full transition-all', layers[key] ? 'translate-x-[12px] bg-[var(--accent)]' : 'translate-x-[2px] bg-[var(--dim)]')} />
                </span>
                <Icon size={10} className={layers[key] ? 'text-[var(--accent)]' : 'text-[var(--dim)]'} />
                <span className={layers[key] ? 'text-[#cfdae4]' : 'text-[var(--dim)]'}>{label}</span>
              </button>
            ))}
          </div>
          <div className="relative h-[568px] dark-surface">
            {mapMode === '2d' ? (
              <CityMap
                selectedId={selectedId}
                onSelect={setSelectedId}
                layers={layers}
                metric={metric}
              />
            ) : (
              <>
                <TwinScene
                  selectedId={selectedId}
                  onSelect={(id) => { if (id) setSelectedId(id); }}
                  layers={twinLayers}
                  mode="night"
                  autoRotate={autoRotate3d}
                  exploded={false}
                  scenario="baseline"
                />
                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-[var(--line-2)] bg-[#061016]/85 px-3 py-2 backdrop-blur-md">
                  <span className="live-dot" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#bfe9da]">3D GIS · interactive</span>
                  <span className="text-[7.5px] text-[var(--dim)]">click an asset · drag to orbit</span>
                </div>
                <button onClick={() => setAutoRotate3d((v) => !v)} className="absolute bottom-4 right-4 rounded-md border border-[var(--line)] bg-[#061016]/85 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-wider text-[var(--muted)] backdrop-blur hover:text-white">
                  {autoRotate3d ? 'Stop orbit' : 'Orbit'}
                </button>
              </>
            )}
            {mapMode === '2d' && (
              <>
                <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-[var(--line-2)] bg-[#061016]/85 px-3 py-2 backdrop-blur-md">
                  <div className="eyebrow text-[7.5px]">{metricMeta[metric].label}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-[8px] text-[var(--dim)]">{metricMeta[metric].min}</span>
                    <span className="h-1.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${heatColor(metricMeta[metric].min, metricMeta[metric].min, metricMeta[metric].max)}, ${heatColor((metricMeta[metric].min + metricMeta[metric].max) / 2, metricMeta[metric].min, metricMeta[metric].max)}, ${heatColor(metricMeta[metric].max, metricMeta[metric].min, metricMeta[metric].max)})` }} />
                    <span className="font-mono text-[8px] text-[var(--dim)]">{metricMeta[metric].max}</span>
                    <span className="font-mono text-[8px] text-[var(--muted)]">{metricMeta[metric].unit}</span>
                  </div>
                </div>
                <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-[var(--line-2)] bg-[#061016]/85 px-2.5 py-2 font-mono text-[8px] text-[var(--dim)] backdrop-blur-md">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Operational</div>
                  <div className="mt-1 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> Commissioning</div>
                  <div className="mt-1 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> In construction</div>
                </div>
              </>
            )}
          </div>
        </section>

        <div className="space-y-4 xl:col-span-4">
          {selected && (
            <section className="panel overflow-hidden">
              <div className="relative border-b border-[var(--line)] px-4 pb-3.5 pt-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(62,224,161,.08),transparent_60%)]" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected.id} · {districtById(selected.district)?.name}</div>
                    <h2 className="mt-1 font-display text-[15px] text-white">{selected.name}</h2>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge tone={selected.status === 'operational' ? 'green' : selected.status === 'construction' ? 'amber' : 'cyan'}>{STATUS_LABEL[selected.status]}</Badge>
                      <span className="text-[9px] text-[var(--dim)]">{KIND_LABEL[selected.kind]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="eyebrow text-[7.5px]">Book value</div>
                    <div className="num mt-1 text-[13px] text-white">{hkd(selected.value)}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-[var(--line)] border-b border-[var(--line)]">
                {[
                  ['Energy', `${selected.energy.toFixed(1)}`, 'kWh/m²', selected.energy > 95 ? 'var(--rose)' : 'var(--accent)'],
                  ['Occupancy', `${selected.occupancy.toFixed(1)}`, '%', 'var(--cyan)'],
                  ['Sensors', selected.sensors.toString(), 'live', '#dbe5ee'],
                  ['Work orders', selected.workOrders.toString(), 'open', selected.workOrders > 20 ? 'var(--amber)' : '#dbe5ee'],
                ].map(([l, v, u, c]) => (
                  <div key={l} className="px-4 py-2.5">
                    <div className="text-[8px] uppercase tracking-wider text-[var(--dim)]">{l}</div>
                    <div className="num mt-0.5 text-[15px]" style={{ color: c }}>{v} <span className="text-[8px] font-normal text-[var(--dim)]">{u}</span></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Risk profile</span><span className={cn('font-mono uppercase', selected.risk === 'high' ? 'text-[var(--rose)]' : selected.risk === 'medium' ? 'text-[var(--amber)]' : 'text-[var(--accent)]')}>{selected.risk}</span></div>
                <Progress value={selected.risk === 'high' ? 82 : selected.risk === 'medium' ? 54 : 24} color={selected.risk === 'high' ? 'var(--rose)' : selected.risk === 'medium' ? 'var(--amber)' : 'var(--accent)'} height={3} />
                <div className="flex items-center justify-between pt-1 text-[9px]"><span className="text-[var(--dim)]">Lease expiry</span><span className="font-mono text-[#cfdae4]">{selected.leaseExpiry}</span></div>
                <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Asset manager</span><span className="text-[#cfdae4]">{selected.manager}</span></div>
              </div>
              <div className="flex gap-2 border-t border-[var(--line)] px-4 py-3">
                <Button size="sm" variant="primary" className="flex-1" onClick={() => navigate(`/twin?asset=${selected.id}`)}><Box size={12} /> Open twin</Button>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/trust?asset=${selected.id}`)}><ArrowUpRight size={12} /> Passport</Button>
              </div>
            </section>
          )}

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <span className="eyebrow text-[8.5px]">District ranking</span>
              <span className="font-mono text-[8px] text-[var(--dim)]">{metricMeta[metric].unit}</span>
            </div>
            <div className="space-y-2.5 p-4">
              {ranking.map((d) => {
                const value = metric === 'occupancy'
                  ? DISTRICTS_SUMMARY.find((x) => x.id === d.id)?.occupancy ?? 0
                  : metric === 'carbon' ? d.carbon : d.energyIntensity;
                const pct = Math.min(100, (value / metricMeta[metric].max) * 100);
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      const first = ASSETS.find((a) => a.district === d.id);
                      if (first) setSelectedId(first.id);
                    }}
                    className="group w-full text-left"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] text-[#cfdae4] group-hover:text-white">{d.name}</span>
                      <span className="font-mono text-[9.5px] text-[var(--muted)]">{value.toFixed(1)}</span>
                    </div>
                    <div className="h-[3px] overflow-hidden rounded-full bg-white/[.05]">
                      <div className="h-full rounded-full transition-all group-hover:brightness-125" style={{ width: `${pct}%`, background: heatColor(value, metricMeta[metric].min, metricMeta[metric].max) }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[8.5px]">Spatial observations</span>
              <Radar size={11} className="text-[var(--accent)]" />
            </div>
            <div className="mt-2.5 space-y-2">
              {[
                { icon: Zap, text: 'TKO load centre is 2.4 MW short of contracted expansion capacity.', tone: 'var(--rose)' },
                { icon: Droplets, text: 'Three waterfront assets sit inside the 1-in-50 flood return zone.', tone: 'var(--cyan)' },
                { icon: GitBranch, text: 'Transit line 2 unlocks a 9-minute walk catchment for 3 assets.', tone: 'var(--accent)' },
              ].map((o, i) => (
                <div key={i} className="flex items-start gap-2">
                  <o.icon size={11} className="mt-0.5 shrink-0" style={{ color: o.tone }} />
                  <span className="text-[9.5px] leading-relaxed text-[var(--muted)]">{o.text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
          <div>
            <div className="eyebrow mb-0.5">Asset register</div>
            <h2 className="font-display text-[14px] text-white">Spatial portfolio · {filtered.length} of {ASSETS.length} assets</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--dim)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets…" className="input h-8 w-[180px] pl-7 text-[11px]" />
            </div>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="input h-8 w-[120px] text-[11px]" aria-label="Filter district">
              <option value="ALL">All districts</option>
              {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}
            </select>
            <Button size="sm" variant="ghost" onClick={() => { setQuery(''); setDistrictFilter('ALL'); }}>Reset</Button>
          </div>
        </div>
        <div className="table-wrap max-h-[380px] overflow-y-auto">
          <table className="table">
            <thead className="sticky top-0 z-10 bg-[#0a1017]">
              <tr>
                <th>Asset</th><th>District</th><th>Type</th><th>Status</th><th className="text-right">GFA (ft²)</th><th className="text-right">Energy</th><th className="text-right">Occupancy</th><th className="text-right">Sensors</th><th>Risk</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className={cn('cursor-pointer', a.id === selectedId && 'bg-[rgba(62,224,161,.045)]')} onClick={() => setSelectedId(a.id)}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', a.status === 'operational' ? 'bg-[var(--accent)]' : a.status === 'commissioning' ? 'bg-[var(--cyan)]' : 'bg-[var(--amber)]')} />
                      <div>
                        <div className="text-[11px] text-[#dbe5ee]">{a.name}</div>
                        <div className="font-mono text-[8px] text-[var(--dim)]">{a.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-mono text-[9.5px] text-[var(--muted)]">{a.district}</span></td>
                  <td><span className="text-[10px] text-[var(--muted)]">{KIND_LABEL[a.kind]}</span></td>
                  <td><span className="text-[9.5px]" style={{ color: a.status === 'operational' ? 'var(--accent)' : a.status === 'commissioning' ? 'var(--cyan)' : 'var(--amber)' }}>{STATUS_LABEL[a.status]}</span></td>
                  <td className="num-cell text-right">{numberFormat(a.gfa)}</td>
                  <td className="num-cell text-right" style={{ color: a.energy > 95 ? 'var(--rose)' : undefined }}>{a.energy.toFixed(1)}</td>
                  <td className="num-cell text-right">{a.occupancy.toFixed(1)}%</td>
                  <td className="num-cell text-right">{a.sensors}</td>
                  <td>
                    <span className={cn('badge', a.risk === 'high' ? 'badge-rose' : a.risk === 'medium' ? 'badge-amber' : 'badge-green')}>{a.risk}</span>
                  </td>
                  <td><ArrowRight size={12} className="text-[var(--dim)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
