import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, CheckCircle2, Gauge, Hammer, ShieldCheck, Wallet, Wrench,
} from 'lucide-react';
import { AssetsScene, type AssetsSelection } from '../components/AssetsScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  ASSETS, ASSETS_ACTIONS, ASSETS_KPIS, ASSETS_MODES, ASSETS_SCENARIOS,
  type AssetsMode, type AssetsScenario,
} from '../lib/assetsData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { condition: Gauge, lifecycle: Hammer, capex: Wallet, criticality: ShieldCheck } as const;

export function Assets() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<AssetsMode>('condition');
  const [scenario, setScenario] = useState<AssetsScenario>('maintain');
  const [selected, setSelected] = useState<AssetsSelection | null>({ id: 'MEP', name: 'MEP plant', condition: 'C', life: '8 yrs', capex: 'HK$38M', criticality: 'Critical', status: 'Replace' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = ASSETS_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Asset lifecycle <span className="text-[var(--dim)]">/</span> estate operations</div>
          <h1 className="display text-[26px] text-white">{t('assets.title', 'Know what you own.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('assets.desc', 'A 3D asset-lifecycle twin: structure, façade, MEP, lifts, ICT and fit-out with condition, remaining life, capex and criticality.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 4,820 assets · 96% tagged</span>
          <span className="chip"><Wallet size={10} className="text-[var(--accent)]" /> {s.capex}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/plant')}><ArrowRight size={12} /> Plant</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('retrofit'); toast('Deep retrofit scenario', 'Carbon and resilience retrofit · capex phased over five years.', 'info'); }}><Hammer size={12} /> Retrofit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <AssetsScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Asset twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">6 asset classes</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.status}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.backlog} backlog</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Asset lens</span><Gauge size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{ASSETS_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['maintain', 'replace', 'retrofit'] as AssetsScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{ASSETS_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Assets</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> stable</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> renew</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · asset` : 'Assets'}</div><Badge tone={selected?.criticality === 'Critical' ? 'rose' : selected?.condition === 'C' ? 'amber' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Estate assets'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `Condition ${selected.condition} · ${selected.life} remaining · ${selected.capex} · ${selected.criticality}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Condition', v: selected?.condition ?? '—' }, { l: 'Life', v: selected?.life ?? '—' }, { l: 'Capex', v: selected?.capex ?? '—' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Asset classes</span><span className="font-mono text-[8px] text-[var(--accent)]">6 groups</span></div><div className="mt-2 space-y-1">{ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, condition: a.condition, life: a.life, capex: a.capex, criticality: a.criticality, status: a.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{a.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{a.condition} · {a.life}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Condition</span><Gauge size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1.5">{ASSETS.slice(0, 4).map((a) => <div key={a.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.name}</span><span className="font-mono text-[var(--dim)]">{a.condition}</span></div><Progress value={a.condition === 'B' ? 78 : 52} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{ASSETS_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Asset brief exported', 'Condition, lifecycle, capex and criticality exported.', 'success')}><Wrench size={11} /> Asset brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/plant')}><ArrowRight size={11} /> Plant</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{ASSETS_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><BarChart3 size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Capex" title="Replacement horizon" action={<Badge tone="cyan">5-year plan</Badge>}><div className="space-y-2">{ASSETS.map((a) => <div key={a.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{a.name}</span><span className="font-mono text-[var(--muted)]">{a.capex} · {a.life}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(parseInt(a.capex.replace(/[^0-9]/g, ''), 10) / 40) * 100}%`, background: a.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Strategy" title="Maintain, replace or retrofit" action={<Hammer size={12} className="text-[var(--amber)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Condition data drives the choice: maintain while safe, replace at end of life, retrofit when carbon and resilience value justify the capital. Deferred backlog is visible, not hidden.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 78% condition B+ · HK$18M backlog · 4,820 tagged assets.</div></Panel>
      </div>
    </div>
  );
}
