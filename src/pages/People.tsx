import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Briefcase, CheckCircle2, GraduationCap, HeartPulse, Network, Sparkles, Users,
} from 'lucide-react';
import { PeopleScene, type PeopleSelection } from '../components/PeopleScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  PEOPLE_ACTIONS, PEOPLE_KPIS, PEOPLE_MODES, PEOPLE_NODES, PEOPLE_SCENARIOS,
  type PeopleMode, type PeopleScenario,
} from '../lib/peopleData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { org: Network, skills: GraduationCap, capacity: Users, hiring: Briefcase } as const;

export function People() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<PeopleMode>('org');
  const [scenario, setScenario] = useState<PeopleScenario>('growth');
  const [selected, setSelected] = useState<PeopleSelection | null>({ id: 'COO', name: 'COO', role: 'Chief Operating Officer', headcount: 1, open: 0, skills: 'Operating model · P&L · delivery', succession: '2 ready' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = PEOPLE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">People & talent <span className="text-[var(--dim)]">/</span> COO organisation</div>
          <h1 className="display text-[26px] text-white">{t('people.title', 'The operating model is people.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('people.desc', 'A 3D talent and organisation twin: executive team, functions, capacity, critical skills, open roles, succession and the people actions that make the plan real.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 438 people · 7 functions</span>
          <span className="chip"><HeartPulse size={10} className="text-[var(--accent)]" /> Engagement 78</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/agents')}><Users size={12} /> Agent Ops</Button>
          <Button variant="primary" size="sm" onClick={() => toast('Talent plan opened', '4 critical roles · succession review · operating-model design.', 'info')}><Sparkles size={12} /> Talent plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <PeopleScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">People twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">438 people</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.open} open roles</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'At risk' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">People lens</span><Network size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{PEOPLE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['growth', 'restructure', 'attrition'] as PeopleScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{PEOPLE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Org</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> function</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--violet)]" /> open role</span><span className="text-[7.5px]">click a node</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.name} · function` : 'Organisation'}</div><Badge tone={s.status === 'At risk' ? 'rose' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.role ?? 'COO organisation'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.headcount} people · ${selected.open} open roles` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Engage', v: `${s.engagement}` }, { l: 'Attrition', v: s.attrition }, { l: 'Open', v: `${s.open}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Functions</span><span className="font-mono text-[8px] text-[var(--accent)]">7 + COO</span></div><div className="mt-2 space-y-1">{PEOPLE_NODES.map((n) => <button key={n.id} onClick={() => setSelected({ id: n.id, name: n.name, role: n.role, headcount: n.headcount, open: n.open, skills: n.skills, succession: n.succession })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === n.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} /><span className="flex-1 font-mono text-[6.5px] text-[var(--muted)]">{n.name}</span><span className="font-mono text-[6px] text-[var(--dim)]">{n.headcount}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Critical skills</span><GraduationCap size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1">{['AI & data platforms', '4D BIM & programme', 'Cyber / OT', 'Commercial & leasing', 'ESG & climate'].map((x) => <div key={x} className="flex items-center gap-2 text-[7.5px]"><CheckCircle2 size={9} className="text-[var(--accent)]" /><span className="text-[var(--muted)]">{x}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><Sparkles size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{PEOPLE_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Talent brief exported', 'Capacity, skills, hiring and succession exported.', 'success')}><Briefcase size={11} /> Talent brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/portfolio')}><ArrowRight size={11} /> Portfolio</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{PEOPLE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Users size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Organisation" title="Span and capacity" action={<Badge tone="cyan">7 functions</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{PEOPLE_NODES.slice(1).map((n) => <div key={n.id} className="flex items-center gap-2 rounded border border-[var(--line)] bg-white/[.014] p-2"><span className="h-2 w-2 rounded-full" style={{ background: n.color }} /><span className="flex-1 text-[8px] text-[var(--muted)]">{n.name}</span><span className="font-mono text-[7px] text-[var(--dim)]">{n.headcount}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Succession" title="Ready now" action={<GraduationCap size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{PEOPLE_NODES.filter((n) => n.id !== 'COO').slice(0, 5).map((n) => <div key={n.id} className="flex items-center justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{n.role}</span><span className="font-mono text-[var(--accent)]">{n.succession}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
