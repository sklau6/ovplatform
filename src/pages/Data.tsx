import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Database, GitBranch, Lock, ShieldCheck, Sparkles, Workflow,
} from 'lucide-react';
import { DataScene, type DataSelection } from '../components/DataScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  DATA_ACTIONS, DATA_DOMAINS, DATA_KPIS, DATA_MODES, DATA_SCENARIOS,
  type DataMode, type DataScenario,
} from '../lib/dataData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { domains: Database, quality: ShieldCheck, lineage: GitBranch, access: Lock } as const;

export function Data() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<DataMode>('domains');
  const [scenario, setScenario] = useState<DataScenario>('ai');
  const [selected, setSelected] = useState<DataSelection | null>({ id: 'BIM', name: 'BIM & assets', products: 24, quality: 97, owner: 'Digital', access: 'Internal' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = DATA_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Data & AI governance <span className="text-[var(--dim)]">/</span> COO digital</div>
          <h1 className="display text-[26px] text-white">{t('data.title', 'Trust the data. Then the agents.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('data.desc', 'A 3D data mesh: seven domains, 102 data products, quality, lineage, access policy and the AI models and agents that consume them.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 7 domains · 102 products</span>
          <span className="chip"><Workflow size={10} className="text-[var(--accent)]" /> {s.quality} quality</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/agents')}><ArrowRight size={12} /> Agent Ops</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('breach'); toast('Access breach scenario', 'Suspicious export · access revoked · lineage traced.', 'warning'); }}><Lock size={12} /> Breach</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <DataScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Data mesh</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">7 domains</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.quality}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Contained' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Data lens</span><Database size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{DATA_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['audit', 'ai', 'breach'] as DataScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{DATA_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Data</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> product</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--violet)]" /> AI model</span><span className="text-[7.5px]">click a domain</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · domain` : 'Data mesh'}</div><Badge tone={s.status === 'Contained' ? 'rose' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Data mesh'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.products} products · ${selected.quality}% quality · ${selected.owner} · ${selected.access}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Products', v: `${selected?.products ?? 0}` }, { l: 'Quality', v: `${selected?.quality ?? 0}%` }, { l: 'Access', v: selected?.access ?? '—' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[9px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Domains</span><span className="font-mono text-[8px] text-[var(--accent)]">7 owned</span></div><div className="mt-2 space-y-1">{DATA_DOMAINS.map((d) => <button key={d.id} onClick={() => setSelected({ id: d.id, name: d.name, products: d.products, quality: d.quality, owner: d.owner, access: d.access })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === d.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{d.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{d.quality}%</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Quality</span><ShieldCheck size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{DATA_DOMAINS.slice(0, 4).map((d) => <div key={d.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{d.name}</span><span className="font-mono text-[var(--dim)]">{d.quality}%</span></div><Progress value={d.quality} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{DATA_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Data brief exported', 'Domains, products, quality, lineage and access exported.', 'success')}><Database size={11} /> Data brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/agents')}><Sparkles size={11} /> Agents</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{DATA_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Database size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Products" title="Quality by domain" action={<Badge tone="cyan">102 products</Badge>}><div className="space-y-2">{DATA_DOMAINS.map((d) => <div key={d.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{d.name}</span><span className="font-mono text-[var(--muted)]">{d.products} products · {d.quality}%</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${d.quality}%`, background: d.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="AI readiness" title="Curated, governed, traced" action={<Sparkles size={12} className="text-[var(--violet)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Agents only consume certified data products with lineage, owners and access policy. High-risk actions require a human gate; every access is logged.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 98% lineage · 100% access reviews · 7 domains.</div></Panel>
      </div>
    </div>
  );
}
