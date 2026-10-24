import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Cog, Fuel, Gauge, ShieldCheck, Truck, Wrench, Zap,
} from 'lucide-react';
import { FleetScene, type FleetSelection } from '../components/FleetScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  FLEET_ACTIONS, FLEET_ASSETS, FLEET_KPIS, FLEET_MODES, FLEET_SCENARIOS,
  type FleetMode, type FleetScenario,
} from '../lib/fleetData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { fleet: Truck, utilisation: Gauge, maintenance: Wrench, emissions: Fuel } as const;

export function Fleet() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<FleetMode>('fleet');
  const [scenario, setScenario] = useState<FleetScenario>('peak');
  const [selected, setSelected] = useState<FleetSelection | null>({ id: 'TC-01', name: 'Tower crane 01', type: 'Crane', metric: '86% utilised', status: 'Active' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = FLEET_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Fleet & equipment <span className="text-[var(--dim)]">/</span> construction plant</div>
          <h1 className="display text-[26px] text-white">{t('fleet.title', 'Every machine, accounted for.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('fleet.desc', 'A 3D construction plant yard: tower crane, excavators, loader, telehandler, generator and survey drone, with utilisation, maintenance and emissions.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 7 assets · telematics live</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> {s.utilisation} utilised</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/construction')}><ArrowRight size={12} /> Construction</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('breakdown'); toast('Breakdown scenario', 'Excavator 02 hydraulic fault · replacement mobilised.', 'warning'); }}><Wrench size={12} /> Breakdown</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <FleetScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Plant yard</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">7 assets</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.utilisation}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Recovery' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Fleet lens</span><Truck size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{FLEET_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['peak', 'idle', 'breakdown'] as FleetScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{FLEET_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Plant</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> diesel</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> electric</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Fleet'}</div><Badge tone={selected?.status === 'Fault' ? 'rose' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Plant yard'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.metric} · ${selected.status}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Util.', v: s.utilisation }, { l: 'Idle', v: s.idle }, { l: 'Assets', v: '7' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Assets</span><span className="font-mono text-[8px] text-[var(--accent)]">7 live</span></div><div className="mt-2 space-y-1">{FLEET_ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, type: a.type, metric: a.metric, status: a.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', a.status === 'Fault' ? 'bg-[var(--rose)]' : a.status === 'Idle' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{a.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{a.metric}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Utilisation</span><Gauge size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{FLEET_ASSETS.slice(0, 4).map((a) => <div key={a.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.name}</span><span className="font-mono text-[var(--dim)]">{a.metric}</span></div><Progress value={parseInt(a.metric, 10)} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{FLEET_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Fleet brief exported', 'Assets, utilisation, maintenance and emissions exported.', 'success')}><Cog size={11} /> Fleet brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/construction')}><ArrowRight size={11} /> Site</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{FLEET_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Truck size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Electrification" title="Diesel to electric" action={<Badge tone="cyan">transition</Badge>}><div className="space-y-2">{[{ l: 'Telehandler', v: 82 }, { l: 'Generator', v: 64 }, { l: 'Excavators', v: 38 }, { l: 'Loader', v: 46 }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}% electric-ready</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${x.v}%` }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Telematics" title="Condition-based service" action={<Wrench size={12} className="text-[var(--violet)]" />}><div className="space-y-2">{[{ l: 'Tower crane', v: 'service 240 h' }, { l: 'Excavator 01', v: 'service 180 h' }, { l: 'Excavator 02', v: 'urgent repair' }, { l: 'Generator', v: 'service 320 h' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className={cn('font-mono', x.v === 'urgent repair' ? 'text-[var(--rose)]' : 'text-[var(--dim)]')}>{x.v}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
