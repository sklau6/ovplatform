import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, Flame, HardHat, HeartPulse, ShieldCheck,
  Siren, TriangleAlert, UserCheck, Wind,
} from 'lucide-react';
import { SafetyScene, type SafetySelection } from '../components/SafetyScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  EVAC_STEPS, HAZARDS, PERMITS, SAFETY_KPIS, SAFETY_MODES, SAFETY_SCENARIOS,
  type SafetyMode, type SafetyScenario,
} from '../lib/safetyData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { hazards: TriangleAlert, crane: HardHat, fire: Flame, weather: Wind } as const;

export function Safety() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<SafetyMode>('hazards');
  const [scenario, setScenario] = useState<SafetyScenario>('normal');
  const [selected, setSelected] = useState<SafetySelection | null>({ id: 'H-01', name: 'Suspended load over east core', type: 'Crane radius', status: 'Controlled', detail: 'Exclusion zone + tag line' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = SAFETY_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Site safety <span className="text-[var(--dim)]">/</span> construction command</div>
          <h1 className="display text-[26px] text-white">{t('safety.title', 'Everyone home safe.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('safety.desc', 'A 3D construction safety twin: work-zone hazards, crane lift exclusion, fire points, evacuation routes, typhoon readiness and permit-to-work in one command view.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 148 workers · zone live</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> LTIFR 0.42</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/construction')}><ArrowRight size={12} /> Construction twin</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('fire'); toast('Fire drill started', 'Evacuation tone active · assembly point A · roll call in progress.', 'warning'); }}><Siren size={12} /> Run drill</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <SafetyScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Safety twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">148 workers</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.status}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.risk === 'High' ? 'text-[var(--rose)]' : s.risk === 'Medium' ? 'text-[var(--amber)]' : 'text-[var(--accent)]'}>{s.risk} risk</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Safety lens</span><ShieldCheck size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{SAFETY_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['normal', 'lift', 'fire', 'typhoon'] as SafetyScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(255,112,136,.35)] bg-[rgba(255,112,136,.08)] text-[var(--rose)]' : 'border-[var(--line)] text-[var(--dim)]')}>{SAFETY_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Hazard zones</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> exclusion</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> lift</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> assembly</span><span className="text-[7.5px]">click a zone</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Site safety'}</div><Badge tone={s.risk === 'High' ? 'rose' : 'amber'}>{s.risk}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak site safety'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Workers', v: '148' }, { l: 'Permits', v: '12' }, { l: 'Evac', v: s.evacuation }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[12px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Hazard register</span><span className="font-mono text-[8px] text-[var(--amber)]">{HAZARDS.length} live</span></div><div className="mt-2 space-y-1">{HAZARDS.map((h) => <button key={h.id} onClick={() => setSelected({ id: h.id, name: h.title, type: h.zone, status: h.status, detail: h.mitigation })} className={cn('w-full rounded-md border p-2 text-left', selected?.id === h.id ? 'border-[rgba(255,112,136,.35)] bg-[rgba(255,112,136,.04)]' : 'border-[var(--line)] bg-white/[.012]')}><div className="flex items-center gap-2"><span className={cn('h-1.5 w-1.5 rounded-full', h.severity === 'High' ? 'bg-[var(--rose)]' : h.severity === 'Medium' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 font-mono text-[7px] text-[#dbe5ee]">{h.id}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{h.status}</span></div><div className="mt-0.5 truncate text-[7.5px] text-[var(--muted)]">{h.title}</div></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Permit to work</span><HardHat size={10} className="text-[var(--dim)]" /></div><div className="mt-2 space-y-1">{PERMITS.map((p) => <div key={p.id} className="flex items-center gap-2 text-[7.5px]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><span className="flex-1 text-[var(--muted)]">{p.type} · {p.zone}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{p.id}</span><span className={cn('font-mono text-[6.5px]', p.status === 'Active' ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{p.status}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Emergency sequence</span><Siren size={10} className="text-[var(--rose)]" /></div><div className="mt-2 space-y-2">{EVAC_STEPS.map((e) => <div key={e.t} className="flex gap-2 text-[7.5px]"><span className="w-8 shrink-0 font-mono text-[var(--dim)]">{e.t}</span><span className="text-[var(--muted)]">{e.event}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Safety pack exported', 'Hazard register, permits and emergency sequence exported.', 'success')}><ShieldCheck size={11} /> Safety pack</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => toast('Toolbox talk scheduled', 'Pre-lift briefing at 15:30 · all lift team and fire watch.', 'info')}><UserCheck size={11} /> Toolbox</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{SAFETY_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><HeartPulse size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Critical controls" title="Hierarchy of control on the live site" action={<Badge tone="green">0 lost-time</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{[{ t: 'Eliminate', d: 'Prefabricate services and lift modules off-site.' }, { t: 'Engineering', d: 'Exclusion zones, edge protection and crane limiting.' }, { t: 'Administrative', d: 'Permits, lift plans, toolbox talks and fire watch.' }, { t: 'PPE', d: 'Hard hats, harnesses, hearing and respiratory protection.' }].map((x) => <div key={x.t} className="rounded-lg border border-[var(--line)] bg-white/[.014] p-2.5"><div className="flex items-center gap-1.5 text-[8.5px] text-[#dbe5ee]"><CheckCircle2 size={9} className="text-[var(--accent)]" />{x.t}</div><div className="mt-1 text-[7.5px] leading-relaxed text-[var(--dim)]">{x.d}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Incident prevention" title="Leading indicators" action={<AlertTriangle size={12} className="text-[var(--amber)]" />}><div className="space-y-2">{[{ l: 'Observations closed', v: 82, c: 'var(--accent)' }, { l: 'Permit compliance', v: 96, c: 'var(--cyan)' }, { l: 'Toolbox attendance', v: 91, c: 'var(--violet)' }, { l: 'Crane lift assurance', v: 100, c: 'var(--amber)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}%</span></div><Progress value={x.v} color={x.c} height={4} /></div>)}</div></Panel>
      </div>
    </div>
  );
}
