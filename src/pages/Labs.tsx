import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Beaker, CheckCircle2, FlaskConical, Lightbulb, Rocket, Sparkles, TrendingUp,
} from 'lucide-react';
import { LabsScene, type LabsSelection } from '../components/LabsScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  LABS_ACTIONS, LABS_KPIS, LABS_MODES, LABS_SCENARIOS, LABS_VENTURES,
  type LabsMode, type LabsScenario,
} from '../lib/labsData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { portfolio: Rocket, experiments: FlaskConical, patents: Lightbulb, roi: TrendingUp } as const;

export function Labs() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<LabsMode>('portfolio');
  const [scenario, setScenario] = useState<LabsScenario>('ai');
  const [selected, setSelected] = useState<LabsSelection | null>({ id: 'GRID', name: 'GridSense AI', stage: 'Scale', trl: 8, investment: 'HK$24M', value: 'HK$180M', status: 'Revenue' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = LABS_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Innovation lab <span className="text-[var(--dim)]">/</span> venture portfolio</div>
          <h1 className="display text-[26px] text-white">{t('labs.title', 'Invent the next operating model.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('labs.desc', 'A 3D innovation lab: six ventures around an AI core, with experiments, TRL, capital, IP and value in one portfolio view.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 ventures · 18 experiments</span>
          <span className="chip"><Sparkles size={10} className="text-[var(--accent)]" /> {s.value} value</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/intelligence')}><Beaker size={12} /> Intelligence</Button>
          <Button variant="primary" size="sm" onClick={() => toast('Venture review opened', 'GridSense scale-up, RoboBuild pilot and CarbonTrace IP.', 'info')}><Rocket size={12} /> Venture review</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <LabsScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Innovation lab</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">6 ventures</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.experiments} experiments</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Lab lens</span><Sparkles size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{LABS_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['ai', 'robotics', 'energy'] as LabsScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{LABS_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Lab</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> venture</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> experiment</span><span className="text-[7.5px]">click a venture</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.stage}` : 'Labs'}</div><Badge tone="green">{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Innovation portfolio'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `TRL ${selected.trl} · ${selected.investment} invested · ${selected.value} value` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Ventures', v: '6' }, { l: 'Value', v: s.value }, { l: 'TRL', v: `${selected?.trl ?? 0}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Ventures</span><span className="font-mono text-[8px] text-[var(--accent)]">6 active</span></div><div className="mt-2 space-y-1">{LABS_VENTURES.map((v) => <button key={v.id} onClick={() => setSelected({ id: v.id, name: v.name, stage: v.stage, trl: v.trl, investment: v.investment, value: v.value, status: v.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === v.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: v.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{v.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">TRL {v.trl}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><Rocket size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1.5">{LABS_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 2 ventures revenue-generating · 2 pilots · 2 validation.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Venture brief exported', 'Portfolio, TRL, capital and value exported.', 'success')}><Beaker size={11} /> Venture brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/capital')}><ArrowRight size={11} /> Capital</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{LABS_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Sparkles size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Venture portfolio" title="Stage and value" action={<Badge tone="cyan">6 ventures</Badge>}><div className="space-y-2">{LABS_VENTURES.map((v) => <div key={v.id} className="flex items-center gap-3 border-b border-[var(--line)] py-1.5 last:border-0"><span className="h-2 w-2 rounded-full" style={{ background: v.color }} /><span className="w-24 text-[8px] text-[var(--muted)]">{v.name}</span><span className="w-16 font-mono text-[6.5px] text-[var(--dim)]">{v.stage}</span><div className="flex-1"><div className="h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(v.trl / 9) * 100}%` }} /></div></div><span className="font-mono text-[6.5px] text-[var(--dim)]">TRL {v.trl}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Innovation thesis" title="From experiment to operating model" action={<Lightbulb size={12} className="text-[var(--amber)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Ventures are only scaled when they prove a measurable operating outcome: lower energy, faster delivery, better tenant experience or auditable carbon. Every experiment has a baseline, owner and kill criteria.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 9 experiments this quarter · 2 patents drafted.</div></Panel>
      </div>
    </div>
  );
}
