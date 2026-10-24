import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, Droplets, Gauge, Radio, ShieldCheck, Waves, Wrench,
} from 'lucide-react';
import { UtilitiesScene, type UtilitiesSelection } from '../components/UtilitiesScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  UTILITIES, UTILITIES_ACTIONS, UTILITIES_KPIS, UTILITIES_MODES, UTILITIES_SCENARIOS,
  type UtilitiesMode, type UtilitiesScenario,
} from '../lib/utilitiesData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { network: Waves, clashes: AlertTriangle, depth: Gauge, sensors: Radio } as const;

export function Utilities() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<UtilitiesMode>('network');
  const [scenario, setScenario] = useState<UtilitiesScenario>('base');
  const [selected, setSelected] = useState<UtilitiesSelection | null>({ id: 'WAT', name: 'Potable water', depth: 1.6, diameter: '300 mm', status: 'Live', sensor: 'Pressure 4.2 bar' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = UTILITIES_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Underground utilities <span className="text-[var(--dim)]">/</span> street works</div>
          <h1 className="display text-[26px] text-white">{t('utilities.title', 'What lies beneath, made visible.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('utilities.desc', 'A 3D utilities corridor: water, power, telecom, gas, drainage and district cooling, with clashes, cover, excavation, sensors and emergency isolation.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 networks · 2 clashes</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> cover {s.cover}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/construction')}><ArrowRight size={12} /> Construction</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('emergency'); toast('Water burst scenario', 'Isolation valves closed · traffic diversion · repair crew mobilised.', 'warning'); }}><Droplets size={12} /> Water burst</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <UtilitiesScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Utilities twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">6 networks</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.clashes} clashes</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Emergency' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Utilities lens</span><Waves size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{UTILITIES_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['base', 'excavation', 'emergency'] as UtilitiesScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{UTILITIES_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Underground</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> water</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> power</span><span className="text-[7.5px]">click a pipe</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · utility` : 'Utilities'}</div><Badge tone={s.status === 'Emergency' ? 'rose' : selected?.status === 'Commissioning' ? 'amber' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Utilities corridor'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.depth} m deep · ${selected.diameter} · ${selected.sensor}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Depth', v: `${selected?.depth ?? 0}m` }, { l: 'Clashes', v: `${s.clashes}` }, { l: 'Leaks', v: '0' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Networks</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{UTILITIES.map((u) => <button key={u.id} onClick={() => setSelected({ id: u.id, name: u.name, depth: u.depth, diameter: u.diameter, status: u.status, sensor: u.sensor })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === u.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: u.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{u.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{u.depth} m</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Clearance</span><ShieldCheck size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{UTILITIES.slice(0, 4).map((u) => <div key={u.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{u.name}</span><span className="font-mono text-[var(--dim)]">{u.depth} m</span></div><Progress value={(u.depth / 3.2) * 100} color={u.depth < 1.2 ? 'var(--rose)' : 'var(--accent)'} height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{UTILITIES_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Utilities brief exported', 'Networks, depths, clashes and sensors exported.', 'success')}><Wrench size={11} /> Utilities brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/construction')}><ArrowRight size={11} /> Site</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{UTILITIES_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Waves size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Section" title="Depth and diameter" action={<Badge tone="cyan">6 networks</Badge>}><div className="space-y-2">{UTILITIES.map((u) => <div key={u.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{u.name}</span><span className="font-mono text-[var(--muted)]">{u.depth} m · {u.diameter}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(u.depth / 3.2) * 100}%`, background: u.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Street works" title="Dig safe" action={<AlertTriangle size={12} className="text-[var(--amber)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Trial holes, utility scans and permit conditions protect every excavation. Clearance issues are resolved before the trench opens; emergency isolation is rehearsed.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 2 clearance issues · 0 leak alarms · 6 sensors.</div></Panel>
      </div>
    </div>
  );
}
