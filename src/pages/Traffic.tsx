import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Car, Gauge, Leaf, ShieldCheck, Timer, TrafficCone, TramFront,
} from 'lucide-react';
import { TrafficScene, type TrafficSelection } from '../components/TrafficScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  TRAFFIC_ACTIONS, TRAFFIC_APPROACHES, TRAFFIC_KPIS, TRAFFIC_MODES, TRAFFIC_SCENARIOS,
  type TrafficMode, type TrafficScenario,
} from '../lib/trafficData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { flow: Gauge, safety: ShieldCheck, transit: TramFront, emissions: Leaf } as const;

export function Traffic() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<TrafficMode>('flow');
  const [scenario, setScenario] = useState<TrafficScenario>('peak');
  const [selected, setSelected] = useState<TrafficSelection | null>({ id: 'N', name: 'North approach', queue: 180, delay: 42, peds: 240, bus: '12 / hr', status: 'Adaptive' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = TRAFFIC_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Traffic & junctions <span className="text-[var(--dim)]">/</span> smart mobility</div>
          <h1 className="display text-[26px] text-white">{t('traffic.title', 'Every movement, choreographed.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('traffic.desc', 'A 3D city intersection: adaptive signals, cars, bus, cyclists, pedestrians and buildings, measured for flow, safety, transit and emissions.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 4 approaches · adaptive</span>
          <span className="chip"><Timer size={10} className="text-[var(--accent)]" /> {s.delay} delay</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/mobility')}><ArrowRight size={12} /> Mobility</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('incident'); toast('Incident scenario', 'Westbound lane blocked · diversion via ring road.', 'warning'); }}><TrafficCone size={12} /> Incident</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <TrafficScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Junction twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.delay}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.queue} queue</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Incident' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Traffic lens</span><Gauge size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{TRAFFIC_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['peak', 'event', 'incident'] as TrafficScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{TRAFFIC_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Junction</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> traffic</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> bus</span><span className="text-[7.5px]">click a signal</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · approach` : 'Junction'}</div><Badge tone={s.status === 'Incident' ? 'rose' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Harbour junction'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.queue} m queue · ${selected.delay}s delay · ${selected.peds} peds/hr` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Delay', v: `${selected?.delay ?? 0}s` }, { l: 'Queue', v: `${selected?.queue ?? 0}m` }, { l: 'Bus', v: selected?.bus ?? '—' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Approaches</span><span className="font-mono text-[8px] text-[var(--accent)]">4 arms</span></div><div className="mt-2 space-y-1">{TRAFFIC_APPROACHES.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, queue: a.queue, delay: a.delay, peds: a.peds, bus: a.bus, status: a.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className="grid h-4 w-4 place-items-center rounded-full border border-[var(--line-2)] font-mono text-[6px] text-[var(--dim)]">{a.id}</span><span className="flex-1 text-[7.5px] text-[var(--muted)]">{a.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{a.delay}s</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Flow</span><Gauge size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1.5">{TRAFFIC_APPROACHES.map((a) => <div key={a.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.id} · {a.name}</span><span className="font-mono text-[var(--dim)]">{a.queue} m</span></div><Progress value={(a.queue / 210) * 100} color="var(--cyan)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{TRAFFIC_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Traffic brief exported', 'Approaches, delays, queues and actions exported.', 'success')}><Car size={11} /> Traffic brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/mobility')}><ArrowRight size={11} /> Mobility</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{TRAFFIC_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Gauge size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Signal plan" title="Green time by approach" action={<Badge tone="cyan">adaptive</Badge>}><div className="space-y-2">{[{ l: 'North · bus priority', v: 34 }, { l: 'East', v: 24 }, { l: 'South', v: 26 }, { l: 'West', v: 20 }, { l: 'Pedestrian', v: 16 }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}s</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(x.v / 34) * 100}%` }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Safety" title="Vulnerable users" action={<ShieldCheck size={12} className="text-[var(--rose)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Pedestrian phases, protected cycle crossings and leading pedestrian intervals reduce conflicts at the junction. Red-light and speed enforcement are monitored.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 900 pedestrians/hr · 4 cycle movements · 0 serious conflicts.</div></Panel>
      </div>
    </div>
  );
}
