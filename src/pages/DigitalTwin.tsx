import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, ArrowRight, Box, CheckCircle2, ChevronDown, ChevronRight, CircleAlert, Crosshair,
  Database, GitBranch, Layers, Loader2, Lock, MapPin, Maximize, Moon, Network, Play, RotateCw,
  ScanLine, Sun, Thermometer, TriangleAlert, Waves, Wind, Zap, Boxes, Radio, HardDrive,
} from 'lucide-react';
import { TwinScene, type TwinLayers, type TwinScenario } from '../components/TwinScene';
import { Sparkline } from '../components/charts';
import { Badge, Button, LiveTag, Progress, Segmented, Tabs } from '../components/ui';
import { ASSETS, DISTRICTS, districtById, KIND_LABEL, STATUS_LABEL, assetById } from '../lib/data';
import { SERIES } from '../lib/data';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn, hkTime } from '../lib/utils';

type InspectorTab = 'overview' | 'bim' | 'clash';

const LODS = [200, 300, 350, 400];

export function DigitalTwin() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = params.get('asset');
  const [selectedId, setSelectedId] = useState<string | null>(initial && assetById(initial) ? initial : 'KT-01');
  const [mode, setMode] = useState<'day' | 'night'>('night');
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [scenario, setScenario] = useState<TwinScenario>('baseline');
  const [tab, setTab] = useState<InspectorTab>('overview');
  const [lod, setLod] = useState(350);
  const [hour, setHour] = useState(14);
  const [layers, setLayers] = useState<TwinLayers>({ gis: true, iot: true, energy: false, transit: false });
  const { toast, now } = useLive();
  const { t } = useI18n();

  const selected = selectedId ? assetById(selectedId) ?? null : null;
  const district = selected ? districtById(selected.district) : null;

  const select = (id: string | null) => {
    setSelectedId(id);
    setParams(id ? { asset: id } : {}, { replace: true });
  };

  const toggleLayer = (key: keyof TwinLayers) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  };

  const energyAtHour = SERIES.energy[hour * 2] ?? 84;
  const gridAtHour = SERIES.grid[hour * 2] ?? 62;

  const totals = useMemo(() => ({
    floors: selected?.floors ?? 0,
    elements: selected ? Math.round(selected.gfa / 240) : 0,
  }), [selected]);

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Digital twin <span className="text-[var(--dim)]">/</span> Kai Tak Innovation Mile</div>
          <h1 className="display text-[26px] text-white">{t('twin.title', 'A living model of the precinct.')}</h1>
          <p className="mt-1.5 text-[11.5px] text-[var(--muted)]">{t('twin.desc', 'BIM geometry, GIS context, 1,284 live sensors and asset provenance in one operational view.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Synced 2s ago</span>
          <span className="chip"><Lock size={10} className="text-[var(--accent)]" /> Ledger attested</span>
          <Button variant="secondary" size="sm" onClick={() => { setTab('bim'); toast('BIM workspace', 'IFC 4.3 model loaded · LOD 350', 'info'); }}>
            <Boxes size={12} /> BIM explorer
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setTab('clash'); toast('QA workspace', 'Clash register and handover gates loaded.', 'info'); }}>
            <ScanLine size={12} /> QA the model
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-230px)] min-h-[560px] w-full bg-[#04080c]">
            <TwinScene
              selectedId={selectedId}
              onSelect={select}
              layers={layers}
              mode={mode}
              autoRotate={autoRotate}
              exploded={exploded}
              scenario={scenario}
            />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            {/* Top HUD */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/70 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Live twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">LOD {lod}</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">IFC 4.3</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">EPSG:2326</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[#050b10]/70 px-2.5 py-1.5 backdrop-blur-md">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--dim)]">{scenario === 'baseline' ? 'Realtime' : scenario === 'typhoon' ? 'Typhoon · T8' : 'Heat island'}</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">WebGL 2</span>
              </div>
            </div>

            {/* Left controls */}
            <div className="absolute left-4 top-[68px] hidden w-[208px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/78 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">View controls</span>
                <Layers size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                {([
                  { key: 'gis', label: 'GIS context', icon: MapPin, hint: 'zones' },
                  { key: 'iot', label: 'IoT sensors', icon: Radio, hint: '1,284' },
                  { key: 'energy', label: 'Energy heatmap', icon: Zap, hint: 'kWh/m²' },
                  { key: 'transit', label: 'Transit line', icon: GitBranch, hint: '2 lines' },
                ] as const).map(({ key, label, icon: Icon, hint }) => (
                  <button key={key} onClick={() => toggleLayer(key)} className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]">
                    <Icon size={13} className={layers[key] ? 'text-[var(--accent)]' : 'text-[var(--dim)]'} />
                    <span className="flex-1 text-[10.5px] text-[#c9d5e0]">{label}</span>
                    <span className={cn('relative h-[14px] w-[24px] rounded-full border transition-colors', layers[key] ? 'border-[rgba(62,224,161,.5)] bg-[rgba(62,224,161,.2)]' : 'border-[var(--line-2)] bg-white/[.04]')}>
                      <span className={cn('absolute top-[2px] h-[8px] w-[8px] rounded-full transition-all', layers[key] ? 'left-[12px] bg-[var(--accent)]' : 'left-[2px] bg-[var(--dim)]')} />
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Presentation</div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => setMode('day')} className={cn('flex items-center justify-center gap-1 rounded-md border py-1.5 text-[9.5px]', mode === 'day' ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}><Sun size={11} /> Day</button>
                  <button onClick={() => setMode('night')} className={cn('flex items-center justify-center gap-1 rounded-md border py-1.5 text-[9.5px]', mode === 'night' ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}><Moon size={11} /> Night</button>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <button onClick={() => setAutoRotate((v) => !v)} className={cn('flex items-center justify-center gap-1 rounded-md border py-1.5 text-[9.5px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.06] text-white' : 'border-[var(--line)] text-[var(--dim)]')}><RotateCw size={11} className={autoRotate ? 'animate-[spin_9s_linear_infinite]' : ''} /> Orbit</button>
                  <button onClick={() => setExploded((v) => !v)} className={cn('flex items-center justify-center gap-1 rounded-md border py-1.5 text-[9.5px]', exploded ? 'border-[var(--line-2)] bg-white/[.06] text-white' : 'border-[var(--line)] text-[var(--dim)]')}><Layers size={11} /> Levels</button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 font-mono text-[8px] text-[var(--dim)]">
                  <span>LOD</span>
                  <div className="flex gap-1">
                    {LODS.map((l) => (
                      <button key={l} onClick={() => setLod(l)} className={cn('rounded px-1 py-0.5 text-[8px]', lod === l ? 'bg-white/10 text-white' : 'text-[var(--dim)] hover:text-white')}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Resilience scenario</div>
                <div className="grid grid-cols-3 gap-1">
                  {([
                    { id: 'baseline', label: 'Base' },
                    { id: 'typhoon', label: 'Typhoon' },
                    { id: 'heat', label: 'Heat' },
                  ] as const).map((s) => (
                    <button key={s.id} onClick={() => { setScenario(s.id); toast(s.id === 'typhoon' ? 'Typhoon scenario applied' : s.id === 'heat' ? 'Heat-island scenario applied' : 'Baseline restored', s.id === 'typhoon' ? 'Signal 8 · rain, wind and flood extent visible.' : s.id === 'heat' ? 'Urban heat haze · cooling load sensitivity.' : 'Live city baseline.', 'info'); }} className={cn('rounded-md border py-1.5 text-[9px] transition-colors', scenario === s.id ? 'border-[rgba(81,214,255,.4)] bg-[rgba(81,214,255,.1)] text-[var(--cyan)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}>{s.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected label chip */}
            <div className="pointer-events-none absolute left-4 top-[68px] xl:hidden">
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-3 py-2 backdrop-blur">
                <div className="font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">{selected?.district} · {selected?.id}</div>
                <div className="mt-0.5 text-[11px] text-white">{selected?.name}</div>
              </div>
            </div>

            {/* Bottom timeline */}
            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-[var(--line)] bg-[#050b10]/82 px-3.5 py-2.5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[#032018] shadow-[0_0_18px_rgba(62,224,161,.4)]" aria-label="Play twin timeline">
                  <Play size={11} fill="currentColor" />
                </button>
                <div className="min-w-[150px] flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Operational playback · 22 Oct</span>
                    <span className="font-mono text-[8.5px] text-[var(--accent)]">{String(hour).padStart(2, '0')}:00 HKT</span>
                  </div>
                  <input
                    type="range" min={0} max={23} value={hour}
                    onChange={(e) => setHour(Number(e.target.value))}
                    className="h-[3px] w-full cursor-pointer appearance-none rounded-full bg-white/10"
                    style={{ accentColor: '#3ee0a1' }}
                    aria-label="Twin playback hour"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[7.5px] text-[var(--dim)]">
                    {['00', '06', '12', '18', '23'].map((t) => <span key={t}>{t}:00</span>)}
                  </div>
                </div>
                <div className="hidden items-center gap-4 border-l border-[var(--line)] pl-4 sm:flex">
                  <div><div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Intensity</div><div className="num text-[13px] text-white">{energyAtHour.toFixed(1)} <span className="text-[8px] text-[var(--dim)]">kWh/m²</span></div></div>
                  <div><div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Grid load</div><div className="num text-[13px] text-white">{gridAtHour.toFixed(1)} <span className="text-[8px] text-[var(--dim)]">MW</span></div></div>
                  <div className="h-7 w-16"><Sparkline data={SERIES.energy.slice(hour * 2, hour * 2 + 12)} color="#3ee0a1" /></div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(62,224,161,.25)] to-transparent" />
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[92px] left-4 flex items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/70 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> &lt; 60</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> 60–90</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> &gt; 90</span>
              <span className="text-[7.5px] text-[var(--dim)]">kWh/m²</span>
            </div>
          </div>
        </section>

        {/* Inspector */}
        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-230px)]">
          <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
            <div className="min-w-0">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.district}` : 'No selection'}</div>
              <h2 className="mt-1 truncate font-display text-[15px] text-white">{selected?.name ?? 'Select an asset'}</h2>
              <div className="mt-1 flex items-center gap-1.5">
                {selected && <Badge tone={selected.status === 'operational' ? 'green' : selected.status === 'construction' ? 'amber' : 'cyan'}>{STATUS_LABEL[selected.status]}</Badge>}
                {selected && <span className="text-[9px] text-[var(--dim)]">{KIND_LABEL[selected.kind]}</span>}
              </div>
            </div>
            {selected && (
              <button onClick={() => select(null)} className="btn btn-ghost btn-icon btn-sm shrink-0" aria-label="Clear selection"><Crosshair size={13} /></button>
            )}
          </div>

          <Tabs
            className="px-3"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'overview', label: 'Live' },
              { value: 'bim', label: 'BIM' },
              { value: 'clash', label: 'Clash', count: 6 },
            ]}
          />

          <div className="scroll-area min-h-0 flex-1 px-4 py-3.5">
            {!selected && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Box size={22} className="text-[var(--dim)]" />
                <div className="text-[11px] text-[var(--muted)]">Select any tower, campus or civic asset in the twin to inspect its live state and model.</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {ASSETS.slice(0, 3).map((a) => (
                    <button key={a.id} onClick={() => select(a.id)} className="chip hover:text-white">{a.id}</button>
                  ))}
                </div>
              </div>
            )}

            {selected && tab === 'overview' && (
              <div className="fade-in space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Energy', value: selected.energy.toFixed(1), unit: 'kWh/m²', tone: selected.energy > 95 ? 'var(--rose)' : 'var(--accent)' },
                    { label: 'Occupancy', value: selected.occupancy.toFixed(1), unit: '%', tone: 'var(--cyan)' },
                    { label: 'Availability', value: selected.availability || 99.0, unit: '%', tone: 'var(--accent)' },
                    { label: 'Sensors', value: selected.sensors, unit: 'live', tone: 'var(--text)' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-[var(--line)] bg-white/[.018] p-2.5">
                      <div className="text-[8.5px] uppercase tracking-wider text-[var(--dim)]">{m.label}</div>
                      <div className="num mt-1 text-[17px]" style={{ color: m.tone }}>{m.value}<span className="ml-1 text-[8px] font-normal text-[var(--dim)]">{m.unit}</span></div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="eyebrow text-[8.5px]">Last 24 hours</span>
                    <span className="font-mono text-[8px] text-[var(--accent)]">-6.4% vs baseline</span>
                  </div>
                  <div className="h-[46px] rounded-lg border border-[var(--line)] bg-white/[.012] px-2 py-1">
                    <Sparkline data={SERIES.energy.slice(10, 34)} color="#3ee0a1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--dim)]">Model version</span><span className="font-mono text-[10px] text-[#cfdae4]">{selected.modelVersion}</span></div>
                  <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--dim)]">Lease expiry</span><span className="font-mono text-[10px] text-[#cfdae4]">{selected.leaseExpiry}</span></div>
                  <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--dim)]">Asset manager</span><span className="text-[10px] text-[#cfdae4]">{selected.manager}</span></div>
                  <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--dim)]">Open work orders</span><span className="font-mono text-[10px] text-[var(--amber)]">{selected.workOrders}</span></div>
                  <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--dim)]">GFA</span><span className="font-mono text-[10px] text-[#cfdae4]">{selected.gfa.toLocaleString()} ft²</span></div>
                </div>

                <div className="rounded-lg border border-[var(--line)] bg-white/[.018] p-3">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-[8.5px]">Provenance</span>
                    <CheckCircle2 size={11} className="text-[var(--accent)]" />
                  </div>
                  <p className="mt-1.5 text-[9.5px] leading-relaxed text-[var(--muted)]">Handover pack, sensor bindings and model revision are anchored on the Ophylla trust ledger.</p>
                  <button onClick={() => navigate(`/trust?asset=${selected.id}`)} className="mt-2 flex items-center gap-1 text-[9.5px] text-[var(--accent)] hover:underline">Open asset passport <ArrowRight size={10} /></button>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => toast('Work order raised', `${selected.name} · P2 maintenance request created.`, 'success')}><Activity size={12} /> Raise order</Button>
                  <Button size="sm" variant="ghost" onClick={() => setTab('bim')}><Box size={12} /> Model</Button>
                </div>
              </div>
            )}

            {selected && tab === 'bim' && (
              <div className="fade-in space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><Box size={12} className="text-[var(--accent)]" /><span className="text-[10.5px] text-[#dbe5ee]">IFC 4.3 · Arch + MEP</span></div>
                  <span className="font-mono text-[8px] text-[var(--dim)]">{totals.elements.toLocaleString()} elements</span>
                </div>

                <div className="space-y-1 rounded-lg border border-[var(--line)] bg-black/20 p-2">
                  {[
                    { label: 'Architecture', count: Math.round(totals.elements * 0.46), open: true },
                    { label: 'Structure', count: Math.round(totals.elements * 0.31), open: false },
                    { label: 'MEP systems', count: Math.round(totals.elements * 0.18), open: false },
                    { label: 'Site & context', count: Math.round(totals.elements * 0.05), open: false },
                  ].map((d) => (
                    <div key={d.label}>
                      <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] text-[#cfdae4]">
                        {d.open ? <ChevronDown size={10} className="text-[var(--dim)]" /> : <ChevronRight size={10} className="text-[var(--dim)]" />}
                        <span className="flex-1">{d.label}</span>
                        <span className="font-mono text-[8px] text-[var(--dim)]">{d.count.toLocaleString()}</span>
                      </div>
                      {d.open && (
                        <div className="ml-4 border-l border-[var(--line)] pl-2">
                          {[
                            ['IfcWall', 0.28], ['IfcSlab', 0.12], ['IfcColumn', 0.09], ['IfcDoor', 0.06], ['IfcWindow', 0.14], ['IfcSpace', 0.07],
                          ].map(([name, ratio]) => (
                            <div key={name as string} className="flex items-center justify-between py-[3px] text-[9px]">
                              <span className="text-[var(--muted)]">{name}</span>
                              <span className="font-mono text-[8.5px] text-[var(--dim)]">{Math.round(totals.elements * (ratio as number)).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-[var(--line)] p-3">
                  <div className="eyebrow text-[8px]">Element properties</div>
                  {[
                    ['GlobalId', selected.modelUrn.split('/')[3] + '…'],
                    ['Levels', `${selected.floors}`],
                    ['Storeys above ground', `${Math.max(1, selected.floors - 2)}`],
                    ['Gross floor area', `${selected.gfa.toLocaleString()} ft²`],
                    ['Classification', 'Uniclass 2015 · En'],
                    ['Fire rating', '2h · structural'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-[var(--line)] py-1.5 text-[9px] last:border-0">
                      <span className="text-[var(--dim)]">{k}</span>
                      <span className="max-w-[55%] truncate font-mono text-[8.5px] text-[#cfdae4]">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Attribute completeness</span><span className="font-mono text-[var(--accent)]">96.4%</span></div>
                  <Progress value={96.4} height={3} />
                  <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Geometry / COBie coverage</span><span className="font-mono text-[var(--accent)]">91.8%</span></div>
                  <Progress value={91.8} color="#45c4f5" height={3} />
                </div>

                <Button size="sm" variant="outline" className="w-full" onClick={() => toast('IFC package prepared', 'Model + property set export is ready for the project common data environment.', 'success')}>
                  <HardDrive size={12} /> Export IFC + COBie
                </Button>
              </div>
            )}

            {selected && tab === 'clash' && (
              <div className="fade-in space-y-3.5">
                <div className="grid grid-cols-3 gap-1.5">
                  {[{ l: 'Open', v: 6, c: 'var(--amber)' }, { l: 'Resolved', v: 82, c: 'var(--accent)' }, { l: 'Tolerance', v: '3%', c: 'var(--cyan)' }].map((x) => (
                    <div key={x.l} className="rounded-lg border border-[var(--line)] p-2 text-center">
                      <div className="num text-[15px]" style={{ color: x.c }}>{x.v}</div>
                      <div className="mt-0.5 text-[8px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: 'CL-118', sev: 'high', title: 'Duct crossing structural beam', loc: 'L18 · grid C4', owner: 'MEP / STR' },
                    { id: 'CL-121', sev: 'medium', title: 'Sprinkler vs cable tray clearance', loc: 'L22 · corridor E', owner: 'MEP' },
                    { id: 'CL-124', sev: 'medium', title: 'Curtain wall fixing offset', loc: 'L31 · façade N', owner: 'ARC / STR' },
                    { id: 'CL-126', sev: 'low', title: 'Access panel obstruction', loc: 'L09 · plant room', owner: 'ARC / MEP' },
                    { id: 'CL-129', sev: 'high', title: 'Slab penetration clash', loc: 'L27 · riser 4', owner: 'STR / MEP' },
                    { id: 'CL-131', sev: 'low', title: 'Ceiling void tolerance', loc: 'L12 · lobby', owner: 'ARC' },
                  ].map((c) => (
                    <button key={c.id} onClick={() => toast('Clash opened', `${c.id} · ${c.title}`, 'info')} className="flex w-full items-start gap-2 rounded-md border border-[var(--line)] p-2 text-left transition-colors hover:bg-white/[.03]">
                      <span className={cn('mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full', c.sev === 'high' ? 'bg-[var(--rose)]' : c.sev === 'medium' ? 'bg-[var(--amber)]' : 'bg-[var(--dim)]')} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[9.5px] text-[#dbe5ee]">{c.title}</div>
                        <div className="mt-0.5 font-mono text-[8px] text-[var(--dim)]">{c.id} · {c.loc} · {c.owner}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-lg border border-[rgba(245,183,72,.18)] bg-[rgba(245,183,72,.04)] p-2.5">
                  <div className="flex items-center gap-1.5 text-[9.5px] text-[var(--amber)]"><TriangleAlert size={11} /> Handover gate G4 at risk</div>
                  <div className="mt-1 text-[9px] leading-relaxed text-[var(--muted)]">Two high-severity clashes remain unresolved. Closing both by 31 Oct preserves the practical completion date.</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]"><Lock size={9} /> {hkTime(now)} attestation</span>
            <span className="font-mono text-[8px] text-[var(--accent)]">0x8f3a…c21b</span>
          </div>
        </aside>
      </div>

      {/* Mobile / secondary insight strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Twin coverage', value: '78%', sub: 'of portfolio GFA', icon: Box },
          { label: 'Sensor health', value: '99.1%', sub: '1,272 / 1,284 online', icon: Radio },
          { label: 'Model variance', value: '1.8%', sub: 'vs 3.0% tolerance', icon: Crosshair },
          { label: 'Energy avoided', value: '1,284 MWh', sub: 'year to date', icon: Zap },
        ].map((s) => (
          <div key={s.label} className="panel flex items-center gap-3 p-3.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white/[.02]"><s.icon size={14} className="text-[var(--muted)]" /></div>
            <div>
              <div className="text-[8.5px] uppercase tracking-[0.1em] text-[var(--dim)]">{s.label}</div>
              <div className="num mt-0.5 text-[15px] text-white">{s.value} <span className="text-[8.5px] font-normal text-[var(--dim)]">{s.sub}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
