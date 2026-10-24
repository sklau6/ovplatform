import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowRight, BatteryCharging, CheckCircle2, Cpu, Gauge, Network,
  Server, ShieldCheck, Snowflake, Sparkles, Thermometer, TrendingDown, Zap,
} from 'lucide-react';
import { HoloDataCentreScene, type HoloSelection } from '../components/HoloDataCentreScene';
import { Badge, Button, Panel } from '../components/ui';
import { HOLO_ASSET_LIST, HOLO_RACKS, type HoloMode } from '../lib/holoBimData';
import { OCEAN_OUTCOMES, OCEAN_PILLARS } from '../lib/esgBuildingData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

type OpsTab = 'operations' | 'energy' | 'cooling' | 'maintenance' | 'capacity';
const tabs: Array<{ id: OpsTab; label: string; icon: typeof Zap; mode: HoloMode; color: string }> = [
  { id: 'operations', label: 'Operations', icon: Activity, mode: 'overview', color: '#51d6ff' },
  { id: 'energy', label: 'Energy', icon: Zap, mode: 'power', color: '#f4bd72' },
  { id: 'cooling', label: 'Cooling', icon: Snowflake, mode: 'cooling', color: '#53f0be' },
  { id: 'maintenance', label: 'Maintenance', icon: ShieldCheck, mode: 'network', color: '#a991ff' },
  { id: 'capacity', label: 'AI capacity', icon: Sparkles, mode: 'ai', color: '#ff9f43' },
];

const alerts = [
  { id: 'AL-218', title: 'CRAC-02 filter differential rising', detail: 'Predicted filter change in 12 days; work order auto-created.', tone: 'amber' as const, impact: 'Avoid 4.2% cooling penalty' },
  { id: 'AL-224', title: 'PDU-03 load imbalance at 82%', detail: 'Shift 6 racks to PDU-04 to restore N+1 headroom.', tone: 'rose' as const, impact: 'Protect 1.8 MW capacity' },
  { id: 'AL-231', title: 'Rack R4-07 inlet temperature 27°C', detail: 'Containment door open; airflow recirculation detected.', tone: 'amber' as const, impact: 'Thermal risk · medium' },
  { id: 'AL-240', title: 'Chiller approach temperature +0.8°C', detail: 'Condenser fouling signature; schedule tube clean.', tone: 'cyan' as const, impact: 'Recover 3.1% COP' },
];

export function DCOps() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [tab, setTab] = useState<OpsTab>('energy');
  const [selected, setSelected] = useState<HoloSelection>({ kind: 'rack', rack: HOLO_RACKS[2] });
  const [explode, setExplode] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const mode = tabs.find((x) => x.id === tab)!.mode;
  const rack = selected?.kind === 'rack' ? selected.rack : null;
  const asset = selected?.kind === 'asset' ? selected : null;

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            DC operations <span className="text-[var(--dim)]">/</span> OCEAN twin
          </div>
          <h1 className="display text-[26px] text-white">{t('dcops.title', 'The data centre that optimises itself.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('dcops.desc', 'A 3D data centre operations twin with AI-led energy optimisation, cooling analytics, predictive maintenance and capacity planning across a 12 MW AI hall.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 32 racks · 12 MW</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/esg-building')}><ArrowLeft size={12} /> ESG building</Button>
          <Button variant="primary" size="sm" onClick={() => toast('AI optimisation applied', 'Chilled-water setpoint +0.8°C · PUE 1.16 → 1.12 · projected 4.2% energy saving.', 'success')}><Sparkles size={12} /> Optimise hall</Button>
        </div>
      </div>

      <section className="panel dark-surface relative overflow-hidden">
        <div className="holo-canvas relative h-[calc(100vh-228px)] min-h-[620px] w-full bg-[#020509]">
          <HoloDataCentreScene mode={mode} layout="ai" explode={explode} selected={selected} autoRotate={autoRotate} onSelect={setSelected} />
          <div className="pointer-events-none absolute inset-0 holo-vignette" />
          <div className="pointer-events-none absolute inset-0 holo-scanlines opacity-30" />
          <div className="pointer-events-none absolute inset-4 holo-corners" />

          <div className="pointer-events-none absolute left-5 top-5 flex flex-col gap-2">
            <div className="flex w-fit items-center gap-2.5 rounded-lg border border-[rgba(81,214,255,.22)] bg-[#030a0f]/85 px-3 py-2 backdrop-blur-xl">
              <span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#bfeaff]">OCEAN DC</span><span className="h-3 w-px bg-white/10" /><span className="font-mono text-[8px] text-[#88aab2]">HALL 03</span><span className="h-3 w-px bg-white/10" /><span className="font-mono text-[8px] text-[var(--accent)]">AI OPTIMISED</span>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-lg border border-[rgba(81,214,255,.12)] bg-[#030a0f]/65 px-3 py-1.5 backdrop-blur-md">
              <span className="font-mono text-[7.5px] text-[#789ba4]">PUE 1.16</span><span className="h-2.5 w-px bg-white/10" /><span className="font-mono text-[7.5px] text-[#d8f6ff]">12 MW IT</span><span className="h-2.5 w-px bg-white/10" /><span className="font-mono text-[7.5px] text-[var(--accent)]">−30% energy</span>
            </div>
          </div>

          <div className="pointer-events-auto absolute right-5 top-5 hidden items-center gap-1 rounded-lg border border-[rgba(81,214,255,.14)] bg-[#030a0f]/78 p-1 backdrop-blur-xl xl:flex">
            {tabs.map((x) => (
              <button key={x.id} onClick={() => setTab(x.id)} className={cn('flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-wider transition-colors', tab === x.id ? 'border-white/10 bg-white/[.08] text-white' : 'text-[#a9c5cc] hover:text-white')}>
                <x.icon size={10} style={{ color: tab === x.id ? x.color : undefined }} />{x.label}
              </button>
            ))}
          </div>

          <aside className="pointer-events-auto absolute right-5 top-[76px] hidden w-[292px] overflow-hidden rounded-xl border border-[rgba(81,214,255,.18)] bg-[#030a0f]/88 shadow-[0_30px_80px_-30px_#000] backdrop-blur-2xl xl:block">
            <div className="flex items-center justify-between border-b border-white/[.07] px-3.5 py-2.5"><span className="font-mono text-[7.5px] uppercase tracking-[0.16em] text-[#789ba4]">Live inspection</span><Badge tone="cyan">AI ops</Badge></div>
            <div className="p-3.5">
              {rack ? (
                <>
                  <div className="flex items-center justify-between"><span className="font-mono text-[15px] text-[var(--cyan)]">{rack.id}</span><span className="font-mono text-[7px] uppercase tracking-wider text-[var(--accent)]">{rack.status}</span></div>
                  <div className="mt-1 text-[9px] text-[#b8d1d8]">IT rack · row {rack.row + 1} · {rack.type}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[{ l: 'Load', v: `${rack.load}`, u: 'kW' }, { l: 'Inlet temp', v: `${rack.temp}`, u: '°C' }, { l: 'Cooling', v: 'Cold A', u: '' }, { l: 'Capacity', v: '42', u: 'kW' }].map((x) => (
                      <div key={x.l} className="rounded-md border border-white/[.07] bg-white/[.025] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[#6d8c95]">{x.l}</div><div className="mt-0.5 num text-[13px] text-white">{x.v} <span className="text-[7px] text-[#6d8c95]">{x.u}</span></div></div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 rounded-md border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.04)] p-2 text-[7.5px] text-[#a9d8cc]"><Sparkles size={9} className="text-[var(--accent)]" /> Shift 8% load to row 3 to improve airflow.</div>
                </>
              ) : asset ? (
                <>
                  <div className="flex items-center justify-between"><span className="font-mono text-[15px] text-[var(--accent)]">{asset.id}</span><Badge tone="green">{asset.status}</Badge></div>
                  <div className="mt-1 text-[9px] text-[#b8d1d8]">{asset.name} · {asset.type}</div>
                  <div className="mt-3 rounded-md border border-white/[.07] bg-white/[.025] p-2.5"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[#6d8c95]">Telemetry</div><div className="mt-1 num text-[18px] text-white">{asset.metric}</div></div>
                </>
              ) : null}
            </div>
            <div className="border-t border-white/[.07] px-3.5 py-2.5">
              <div className="flex items-center justify-between text-[7.5px]"><span className="text-[#6d8c95]">AI energy saving</span><span className="font-mono text-[var(--accent)]">−30%</span></div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: '68%' }} /></div>
            </div>
          </aside>

          <div className="absolute inset-x-5 bottom-4 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
            <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-[rgba(81,214,255,.14)] bg-[#030a0f]/82 px-3 py-2 backdrop-blur-xl">
              <button onClick={() => setAutoRotate((v) => !v)} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-[#9db5bd] hover:text-white" aria-label="Toggle orbit"><Activity size={11} /></button>
              <span className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#6d8c95]">Explode</span>
              <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} className="holo-range w-24" aria-label="Explode data centre view" />
              <span className="w-7 font-mono text-[8px] text-[var(--cyan)]">{Math.round(explode * 100)}%</span>
              <span className="h-4 w-px bg-white/10" />
              <span className="font-mono text-[7px] text-[#6d8c95]">{tabs.find((x) => x.id === tab)?.label}</span>
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              {[{ l: 'IT load', v: '12 MW', c: 'var(--cyan)' }, { l: 'PUE', v: '1.16', c: 'var(--accent)' }, { l: 'Energy', v: '−30%', c: 'var(--amber)' }, { l: 'Downtime', v: '−75%', c: 'var(--violet)' }].map((x) => (
                <div key={x.l} className="rounded-lg border border-white/[.08] bg-[#030a0f]/78 px-3 py-1.5 backdrop-blur-md"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[#6d8c95]">{x.l}</div><div className="mt-0.5 font-mono text-[10px]" style={{ color: x.c }}>{x.v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {OCEAN_OUTCOMES.map((x) => (
          <div key={x.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{x.label}</span><TrendingDown size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{x.value}</div><div className="mt-1 text-[7.5px] text-[var(--muted)]">{x.note}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="AI recommendations" title="Energy and cooling actions" action={<Sparkles size={12} className="text-[var(--accent)]" />}>
          <div className="space-y-2">
            {[{ t: 'Raise chilled-water setpoint +0.8°C', d: 'Save 4.2% energy · PUE 1.16 → 1.12 · low risk', icon: Thermometer }, { t: 'Shift 8% IT load to row 3', d: 'Improve airflow and reduce hot spots · 12 racks', icon: Network }, { t: 'Discharge BESS into evening peak', d: 'Reduce grid import 1.8 MW · HK$0.94/kWh', icon: BatteryCharging }, { t: 'Pre-cool hall before tariff peak', d: 'Use weather forecast and thermal mass · −6.1% cost', icon: Snowflake }].map((x) => (
              <div key={x.t} className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-white/[.014] p-2.5"><x.icon size={12} className="mt-0.5 shrink-0 text-[var(--accent)]" /><div className="min-w-0 flex-1"><div className="text-[8.5px] text-[#dbe5ee]">{x.t}</div><div className="mt-0.5 font-mono text-[7px] text-[var(--dim)]">{x.d}</div></div><ArrowRight size={10} className="mt-1 shrink-0 text-[var(--dim)]" /></div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Predictive maintenance" title="Alerts with an owner" action={<Badge tone="amber">4 open</Badge>}>
          <div className="space-y-1.5">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-md border border-[var(--line)] bg-white/[.012] p-2.5"><div className="flex items-center gap-2"><span className={cn('h-1.5 w-1.5 rounded-full', a.tone === 'rose' ? 'bg-[var(--rose)]' : a.tone === 'amber' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]')} /><span className="flex-1 font-mono text-[6.5px] text-[var(--dim)]">{a.id}</span><span className="font-mono text-[6.5px] text-[var(--muted)]">{a.impact}</span></div><div className="mt-1 text-[8px] text-[#dbe5ee]">{a.title}</div><div className="mt-0.5 text-[7px] leading-relaxed text-[var(--dim)]">{a.detail}</div></div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-3" eyebrow="Open ecosystem" title="OCEAN-style layers" action={<ShieldCheck size={12} className="text-[var(--cyan)]" />}>
          <div className="space-y-2">
            {OCEAN_PILLARS.map((p, i) => (<div key={p.name} className="rounded-md border border-[var(--line)] bg-white/[.014] p-2.5"><div className="font-mono text-[6.5px]" style={{ color: p.color }}>0{i + 1}</div><div className="mt-1 text-[8.5px] text-[#dbe5ee]">{p.name}</div><div className="mt-0.5 text-[7px] leading-relaxed text-[var(--dim)]">{p.note}</div></div>))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Open data collection reduces vendor lock-in.</div>
        </Panel>
      </div>

      <Panel eyebrow="Model and telemetry" title="Every rack has a BIM asset and a live sensor" action={<div className="flex items-center gap-2"><span className="font-mono text-[7px] text-[var(--dim)]">IFC · LOD 400 · 8 COBie assets</span><Button variant="secondary" size="sm" onClick={() => navigate('/bim-xr')}><Cpu size={11} /> BIM XR</Button></div>} bodyClassName="!px-0 !pb-0">
        <div className="grid grid-cols-2 gap-px bg-[var(--line)] md:grid-cols-4">
          {HOLO_ASSET_LIST.map((a) => (
            <button key={a.id} onClick={() => setSelected({ kind: 'asset', ...a })} className="bg-[#080e13] px-3 py-2.5 text-left hover:bg-[#0a1319]"><div className="flex items-center gap-2"><Server size={9} className="text-[var(--cyan)]" /><span className="font-mono text-[7px] text-[#dbe5ee]">{a.id}</span><span className="ml-auto font-mono text-[6.5px] text-[var(--accent)]">{a.status}</span></div><div className="mt-1 flex items-center justify-between"><span className="text-[7px] text-[var(--dim)]">{a.name}</span><span className="font-mono text-[7px] text-[var(--muted)]">{a.metric}</span></div></button>
          ))}
        </div>
      </Panel>
      <div className="flex items-center gap-1.5 px-1 text-[7.5px] text-[var(--dim)]"><Gauge size={9} /> Reference operating pattern: OCEAN Intelligence-style smart-building platform (core platform, management overlay, partner ecosystem). No affiliation implied.</div>
    </div>
  );
}
