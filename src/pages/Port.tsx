import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor, ArrowRight, CheckCircle2, Container, Gauge, Ship, Train, Truck, Wind,
} from 'lucide-react';
import { PortScene, type PortSelection } from '../components/PortScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  PORT_ACTIONS, PORT_ASSETS, PORT_KPIS, PORT_MODES, PORT_SCENARIOS,
  type PortMode, type PortScenario,
} from '../lib/portData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { throughput: Container, berth: Anchor, landside: Truck, emissions: Wind } as const;

export function Port() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<PortMode>('throughput');
  const [scenario, setScenario] = useState<PortScenario>('normal');
  const [selected, setSelected] = useState<PortSelection | null>({ id: 'STS-01', name: 'STS crane 01', type: 'Crane', metric: '32 moves/hr', status: 'Active' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = PORT_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Port & logistics <span className="text-[var(--dim)]">/</span> ocean operations</div>
          <h1 className="display text-[26px] text-white">{t('port.title', "The port is the city's front door.")}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('port.desc', 'A 3D container-terminal twin: vessel, ship-to-shore cranes, yard blocks, trucks, rail and gate, with throughput, berth, landside and emissions lenses.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 2 berths · 3 STS cranes</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> {s.moves}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/supply')}><ArrowRight size={12} /> Supply chain</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('typhoon'); toast('Typhoon mode activated', 'T8 signal · cranes secured · vessel departures rescheduled.', 'warning'); }}><Wind size={12} /> Typhoon</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <PortScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Port twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.moves}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.turnaround}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Suspended' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Port lens</span><Anchor size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{PORT_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['normal', 'peak', 'typhoon'] as PortScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{PORT_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Terminal</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> berth</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> landside</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Port'}</div><Badge tone={s.status === 'Suspended' ? 'rose' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak terminal'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.metric} · ${selected.status}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Moves', v: s.moves }, { l: 'Turn', v: s.turnaround }, { l: 'Rail', v: '38%' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Assets</span><span className="font-mono text-[8px] text-[var(--accent)]">7 live</span></div><div className="mt-2 space-y-1">{PORT_ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, type: a.type, metric: a.metric, status: a.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', a.status === 'Standby' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{a.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{a.metric}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{PORT_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><Train size={9} className="text-[var(--accent)]" /> Rail share 38% · gate 24 min · shore power designed.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Port brief exported', 'Berth, crane, yard, rail and emissions exported.', 'success')}><Ship size={11} /> Port brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/supply')}><ArrowRight size={11} /> Supply</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{PORT_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Anchor size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Berth plan" title="Crane and vessel window" action={<Badge tone="cyan">2 berths</Badge>}><div className="space-y-2">{[{ l: 'Berth 1 · MV Ophylla Star', v: 'STS 01–03', t: '18 h' }, { l: 'Berth 2 · feeder', v: 'STS 04–05', t: '9 h' }, { l: 'Yard block A', v: '82% density', t: '—' }, { l: 'Rail terminal', v: '38% share', t: 'on time' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--dim)]">{x.v} · {x.t}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Decarbonisation" title="Electrify the berth" action={<Wind size={12} className="text-[var(--violet)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Shore power, electrified yard equipment and rail modal shift cut berth emissions while improving local air quality. Each measure is tracked against CO₂ per TEU.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 14.2 kg CO₂/TEU · −18% year on year.</div></Panel>
      </div>
    </div>
  );
}
