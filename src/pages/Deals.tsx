import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BriefcaseBusiness, CheckCircle2, Handshake, Scale, ShieldAlert, TrendingUp,
} from 'lucide-react';
import { DealsScene, type DealsSelection } from '../components/DealsScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  DEALS_ACTIONS, DEAL_WORKSTREAMS, DEALS_KPIS, DEALS_MODES, DEALS_SCENARIOS,
  type DealsMode, type DealsScenario,
} from '../lib/dealsData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { pipeline: BriefcaseBusiness, diligence: CheckCircle2, synergies: TrendingUp, risk: ShieldAlert } as const;

export function Deals() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<DealsMode>('pipeline');
  const [scenario, setScenario] = useState<DealsScenario>('acquisition');
  const [selected, setSelected] = useState<DealsSelection | null>({ id: 'FIN', name: 'Financial', progress: 82, owner: 'Finance', status: 'On track' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = DEALS_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Deal room <span className="text-[var(--dim)]">/</span> corporate development</div>
          <h1 className="display text-[26px] text-white">{t('deals.title', 'Buy, build, or walk away.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('deals.desc', 'A 3D deal room: acquisition target, six diligence workstreams, IC gates, synergy rings and bid stages for acquisition, divestment and JV.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> HK$6.5B pipeline · 3 deals</span>
          <span className="chip"><Handshake size={10} className="text-[var(--accent)]" /> {s.synergy} synergy</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/capital')}><ArrowRight size={12} /> Capital</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('jv'); toast('Joint venture scenario', 'TKO data-centre JV · term sheet under committee review.', 'info'); }}><Handshake size={12} /> JV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <DealsScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Deal room</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.value}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.status}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">6 workstreams</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Deal lens</span><BriefcaseBusiness size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{DEALS_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['acquisition', 'divestment', 'jv'] as DealsScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{DEALS_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Diligence</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> on track</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> gap</span><span className="text-[7.5px]">click a stream</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · workstream` : 'Deal'}</div><Badge tone={selected?.status === 'Data gap' ? 'rose' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak East'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.progress}% complete · ${selected.owner}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Value', v: s.value }, { l: 'Synergy', v: s.synergy }, { l: 'DD', v: '72%' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[9px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Workstreams</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{DEAL_WORKSTREAMS.map((w) => <button key={w.id} onClick={() => setSelected({ id: w.id, name: w.name, progress: w.progress, owner: w.owner, status: w.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === w.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: w.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{w.name}</span><span className={cn('font-mono text-[6.5px]', w.status === 'Data gap' ? 'text-[var(--rose)]' : 'text-[var(--dim)]')}>{w.progress}%</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Diligence</span><Scale size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1.5">{DEAL_WORKSTREAMS.slice(0, 4).map((w) => <div key={w.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{w.name}</span><span className="font-mono text-[var(--dim)]">{w.progress}%</span></div><Progress value={w.progress} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{DEALS_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('IC pack exported', 'Deal, diligence, synergies and risk exported.', 'success')}><BriefcaseBusiness size={11} /> IC pack</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/capital')}><ArrowRight size={11} /> Capital</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{DEALS_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Handshake size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Diligence" title="Workstream progress" action={<Badge tone="cyan">72% complete</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{DEAL_WORKSTREAMS.map((w) => <div key={w.id} className="rounded border border-[var(--line)] bg-white/[.014] p-2"><div className="flex justify-between"><span className="text-[8px] text-[var(--muted)]">{w.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{w.progress}%</span></div><Progress value={w.progress} color={w.color} height={3} /></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Investment case" title="Synergy and risk" action={<TrendingUp size={12} className="text-[var(--amber)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">The deal clears the IC only when diligence gaps close, synergies are credible and integration risk is owned. Walk-away rights and conditions precedent are agreed before signing.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> HK$110M synergies · 2 IC gates · 1 ESG data gap.</div></Panel>
      </div>
    </div>
  );
}
