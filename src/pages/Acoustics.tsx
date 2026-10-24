import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, CheckCircle2, Ear, Music, Radio, ShieldCheck, Volume2, Waves,
} from 'lucide-react';
import { AcousticsScene, type AcousticsSelection } from '../components/AcousticsScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  ACOUSTICS_ACTIONS, ACOUSTICS_KPIS, ACOUSTICS_MODES, ACOUSTICS_SCENARIOS, ACOUSTICS_ZONES,
  type AcousticsMode, type AcousticsScenario,
} from '../lib/acousticsData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { room: Music, vibration: Activity, noise: Volume2, privacy: Ear } as const;

export function Acoustics() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<AcousticsMode>('room');
  const [scenario, setScenario] = useState<AcousticsScenario>('concert');
  const [selected, setSelected] = useState<AcousticsSelection | null>({ id: 'STL', name: 'Stalls', rt: '1.9 s', db: '96 dBA', stc: '—', vibration: 'Low' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = ACOUSTICS_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Acoustics & vibration <span className="text-[var(--dim)]">/</span> building performance</div>
          <h1 className="display text-[26px] text-white">{t('acoustics.title', 'Design for the ear.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('acoustics.desc', 'A 3D concert-hall and workplace acoustics twin: stage, stalls, balcony, reflectors, reverberation, noise, speech privacy and rail vibration.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> RT {s.rt} · {s.db}</span>
          <span className="chip"><Waves size={10} className="text-[var(--accent)]" /> 6 zones</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/engineering')}><ArrowRight size={12} /> Structural</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('rail'); toast('Rail vibration scenario', 'Train pass-by · base isolation and track mitigation.', 'info'); }}><Activity size={12} /> Rail</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <AcousticsScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Acoustic twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">RT {s.rt}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.status}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Monitoring' ? 'text-[var(--amber)]' : 'text-[var(--accent)]'}>{s.db}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Acoustic lens</span><Ear size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{ACOUSTICS_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['concert', 'office', 'rail'] as AcousticsScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{ACOUSTICS_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Hall</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> direct</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--violet)]" /> vibration</span><span className="text-[7.5px]">click a zone</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · zone` : 'Acoustics'}</div><Badge tone={s.status === 'Monitoring' ? 'amber' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Concert hall'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `RT ${selected.rt} · ${selected.db} · ${selected.stc} · vibration ${selected.vibration}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'RT', v: s.rt }, { l: 'Level', v: s.db }, { l: 'Zones', v: '6' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Zones</span><span className="font-mono text-[8px] text-[var(--accent)]">6 spaces</span></div><div className="mt-2 space-y-1">{ACOUSTICS_ZONES.map((z) => <button key={z.id} onClick={() => setSelected({ id: z.id, name: z.name, rt: z.rt, db: z.db, stc: z.stc, vibration: z.vibration })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === z.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: z.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{z.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{z.rt}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Reverberation</span><Waves size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1.5">{ACOUSTICS_ZONES.slice(0, 4).map((z) => <div key={z.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{z.name}</span><span className="font-mono text-[var(--dim)]">{z.rt}</span></div><Progress value={parseFloat(z.rt) * 40} color="var(--cyan)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{ACOUSTICS_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Acoustic brief exported', 'RT, levels, STC, vibration and actions exported.', 'success')}><Radio size={11} /> Acoustic brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/workplace')}><ArrowRight size={11} /> Workplace</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{ACOUSTICS_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Ear size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Noise map" title="Level by zone" action={<Badge tone="cyan">concert</Badge>}><div className="space-y-2">{ACOUSTICS_ZONES.map((z) => <div key={z.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{z.name}</span><span className="font-mono text-[var(--muted)]">{z.db}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(parseInt(z.db, 10) / 105) * 100}%`, background: z.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Comfort" title="Quiet by design" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Room shape, reflectors and absorption tune the hall; isolation bearings and track mitigation control rail vibration; STC-rated partitions protect speech privacy in the workplace.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> RT 1.9 s · C80 4.2 dB · vibration 0.4 mm/s.</div></Panel>
      </div>
    </div>
  );
}
