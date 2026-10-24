import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, CheckCircle2, Gauge, Layers, ShieldCheck, Waves, Wind,
} from 'lucide-react';
import { SeismicScene, type SeismicSelection } from '../components/SeismicScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  SEISMIC_ACTIONS, SEISMIC_FLOORS, SEISMIC_KPIS, SEISMIC_MODES, SEISMIC_SCENARIOS, SEISMIC_SYSTEMS,
  type SeismicMode, type SeismicScenario,
} from '../lib/seismicData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { drift: Waves, isolation: Layers, damping: Activity, damage: ShieldCheck } as const;

export function Seismic() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<SeismicMode>('drift');
  const [scenario, setScenario] = useState<SeismicScenario>('moderate');
  const [selected, setSelected] = useState<SeismicSelection | null>({ id: 'F5', name: 'Level 5', type: 'Floor', detail: 'drift 1/520 · 0.20 g · Minor' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = SEISMIC_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Seismic resilience <span className="text-[var(--dim)]">/</span> structural dynamics</div>
          <h1 className="display text-[26px] text-white">{t('seismic.title', 'Design for the ground that moves.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('seismic.desc', 'A 3D seismic structural twin: base isolators, viscous dampers, an eight-storey frame, drift, acceleration and damage under three earthquake levels.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 8 floors · 12 isolators</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> drift {s.drift}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/engineering')}><ArrowRight size={12} /> Structural</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('major'); toast('Major earthquake scenario', 'MCE · drift 1/210 · damage control and evacuation.', 'warning'); }}><ShieldCheck size={12} /> Major event</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <SeismicScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Seismic twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">PGA {s.pga}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">drift {s.drift}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Review' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Seismic lens</span><Waves size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{SEISMIC_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['minor', 'moderate', 'major'] as SeismicScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{SEISMIC_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Seismic</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> isolator</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> damper</span><span className="text-[7.5px]">click a floor</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Seismic'}</div><Badge tone={s.status === 'Review' ? 'rose' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Tower A'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'PGA', v: s.pga }, { l: 'Drift', v: s.drift }, { l: 'Accel', v: s.accel }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Floors</span><span className="font-mono text-[8px] text-[var(--accent)]">8 levels</span></div><div className="mt-2 space-y-1">{SEISMIC_FLOORS.map((f) => <button key={f.id} onClick={() => setSelected({ id: f.id, name: f.name, type: 'Floor', detail: `drift ${f.drift} · ${f.accel} · ${f.damage}` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === f.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', f.damage === 'Moderate' ? 'bg-[var(--rose)]' : f.damage === 'Minor' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{f.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{f.drift}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Systems</span><Layers size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1">{SEISMIC_SYSTEMS.map((sys) => <button key={sys.id} onClick={() => setSelected({ id: sys.id, name: sys.name, type: sys.type, detail: sys.detail })} className="w-full rounded border border-[var(--line)] px-1.5 py-1 text-left"><div className="flex justify-between"><span className="text-[7px] text-[#dbe5ee]">{sys.name}</span><span className="font-mono text-[6px] text-[var(--accent)]">{sys.status}</span></div></button>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{SEISMIC_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Seismic brief exported', 'Drift, acceleration, isolators and damage exported.', 'success')}><Gauge size={11} /> Seismic brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/resilience')}><ShieldCheck size={11} /> Resilience</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{SEISMIC_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Waves size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Drift profile" title="Height vs inter-storey drift" action={<Badge tone="cyan">design earthquake</Badge>}><div className="space-y-1.5">{SEISMIC_FLOORS.map((f) => <div key={f.id} className="flex items-center gap-2"><span className="w-12 font-mono text-[6.5px] text-[var(--dim)]">{f.id}</span><div className="flex-1"><Progress value={parseInt(f.drift.split('/')[1], 10) / 10} color={f.damage === 'Moderate' ? 'var(--rose)' : f.damage === 'Minor' ? 'var(--amber)' : 'var(--accent)'} height={3} /></div><span className="w-10 text-right font-mono text-[6.5px] text-[var(--muted)]">{f.drift}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Protection" title="Isolation and damping" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{[{ l: 'Base isolators', v: '12 LRB · 420 mm' }, { l: 'Viscous dampers', v: '8 × 1,200 kN' }, { l: 'Added damping', v: '18%' }, { l: 'Roof acceleration', v: `${s.accel} · −38%` }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--dim)]">{x.v}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
