import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Gauge, ScanSearch, ShieldCheck, Wrench,
} from 'lucide-react';
import { QualityScene, type QualitySelection } from '../components/QualityScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  QUALITY_ACTIONS, QUALITY_DEFECTS, QUALITY_KPIS, QUALITY_MODES, QUALITY_SCENARIOS,
  type QualityMode, type QualityScenario,
} from '../lib/qualityData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { inspections: ClipboardCheck, defects: AlertTriangle, ncr: ShieldCheck, rework: Wrench } as const;

export function Quality() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<QualityMode>('defects');
  const [scenario, setScenario] = useState<QualityScenario>('concrete');
  const [selected, setSelected] = useState<QualitySelection | null>({ id: 'D-01', name: 'Honeycombing', trade: 'Concrete', level: 'L2', severity: 'Major', owner: 'Sub A', due: '3 days', status: 'Open' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = QUALITY_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Quality & inspection <span className="text-[var(--dim)]">/</span> construction assurance</div>
          <h1 className="display text-[26px] text-white">{t('quality.title', 'Right first time. Prove it.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('quality.desc', 'A 3D construction quality twin: hold points, drone scans, defect pins, NCRs and rework across concrete, steel and fit-out scenarios.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 defects · 1 NCR</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> {s.ftr} FTR</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/handover')}><ArrowRight size={12} /> Handover</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('fitout'); toast('Fit-out snagging', '28 items · partition, MEP and finishes close-out.', 'info'); }}><ScanSearch size={12} /> Fit-out</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <QualityScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Quality twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.defects} defects</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.ftr}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Snagging' ? 'text-[var(--amber)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Quality lens</span><ScanSearch size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{QUALITY_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['concrete', 'steel', 'fitout'] as QualityScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{QUALITY_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Inspection</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> major</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> minor</span><span className="text-[7.5px]">click a pin</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · defect` : 'Quality'}</div><Badge tone={selected?.severity === 'Critical' ? 'rose' : selected?.severity === 'Major' ? 'amber' : 'green'}>{selected?.severity ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Tower A'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.trade} · ${selected.level} · ${selected.owner} · due ${selected.due}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Defects', v: `${s.defects}` }, { l: 'FTR', v: s.ftr }, { l: 'NCR', v: '1' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Defects</span><span className="font-mono text-[8px] text-[var(--accent)]">6 open</span></div><div className="mt-2 space-y-1">{QUALITY_DEFECTS.map((d) => <button key={d.id} onClick={() => setSelected({ id: d.id, name: d.name, trade: d.trade, level: d.level, severity: d.severity, owner: d.owner, due: d.due, status: d.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === d.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', d.severity === 'Critical' ? 'bg-[var(--rose)]' : d.severity === 'Major' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{d.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{d.level}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">First-time-right</span><Gauge size={10} className="text-[var(--accent)]" /></div><div className="mt-2"><Progress value={91} color="var(--accent)" height={4} /><div className="mt-1 flex justify-between font-mono text-[6.5px] text-[var(--dim)]"><span>0</span><span>91%</span><span>100</span></div></div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{QUALITY_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Quality brief exported', 'Inspections, defects, NCRs and rework exported.', 'success')}><ClipboardCheck size={11} /> Quality brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/handover')}><ArrowRight size={11} /> Handover</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{QUALITY_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><ScanSearch size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="By trade" title="Defects and severity" action={<Badge tone="amber">6 open</Badge>}><div className="space-y-2">{QUALITY_DEFECTS.map((d) => <div key={d.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{d.name}</span><span className="font-mono text-[var(--muted)]">{d.trade} · {d.severity}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: d.severity === 'Critical' ? '95%' : d.severity === 'Major' ? '70%' : '40%', background: d.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Assurance" title="Digital inspection" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Drone scans compare the built frame with the BIM model weekly; every defect has an owner, due date and evidence; hold points are released only when witnessed.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 91% first-time-right · 0.8% rework · 1 NCR open.</div></Panel>
      </div>
    </div>
  );
}
