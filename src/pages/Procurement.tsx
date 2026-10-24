import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ClipboardCheck, Handshake, PackageCheck, ShieldAlert, Wallet,
} from 'lucide-react';
import { ProcurementScene, type ProcurementSelection } from '../components/ProcurementScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  PROCUREMENT_ACTIONS, PROCUREMENT_KPIS, PROCUREMENT_MODES, PROCUREMENT_PACKAGES, PROCUREMENT_SCENARIOS,
  type ProcurementMode, type ProcurementScenario,
} from '../lib/procurementData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { pipeline: ClipboardCheck, award: Handshake, risk: ShieldAlert, savings: Wallet } as const;

export function Procurement() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<ProcurementMode>('pipeline');
  const [scenario, setScenario] = useState<ProcurementScenario>('base');
  const [selected, setSelected] = useState<ProcurementSelection | null>({ id: 'P-MEP', name: 'MEP & controls', value: 410, bidders: 6, savings: '4.6%', risk: 'Medium', status: 'Two-stage' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = PROCUREMENT_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Procurement <span className="text-[var(--dim)]">/</span> commercial control</div>
          <h1 className="display text-[26px] text-white">{t('procurement.title', 'Buy well. Build better.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('procurement.desc', 'A 3D procurement control tower: six tender packages, bidders, award gate, savings, single-source risk and supply shocks.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 packages · HK$1.86B</span>
          <span className="chip"><PackageCheck size={10} className="text-[var(--accent)]" /> {s.savings} savings</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/supply')}><ArrowRight size={12} /> Supply chain</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('shock'); toast('Supply shock scenario', 'Steel and facade lead times extend · single-source exposure reviewed.', 'warning'); }}><ShieldAlert size={12} /> Supply shock</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <ProcurementScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Procurement tower</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">6 packages</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.savings} savings</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'At risk' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Procurement lens</span><Handshake size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{PROCUREMENT_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['base', 'fast', 'shock'] as ProcurementScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{PROCUREMENT_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Tender</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> awarded</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> in market</span><span className="text-[7.5px]">click a package</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · package` : 'Procurement'}</div><Badge tone={s.status === 'At risk' ? 'rose' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Tender pipeline'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `HK$${selected.value}M · ${selected.bidders} bidders · ${selected.savings} savings · risk ${selected.risk}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Committed', v: s.committed }, { l: 'Savings', v: s.savings }, { l: 'Bidders', v: `${selected?.bidders ?? 0}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Packages</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{PROCUREMENT_PACKAGES.map((p) => <button key={p.id} onClick={() => setSelected({ id: p.id, name: p.name, value: p.value, bidders: p.bidders, savings: p.savings, risk: p.risk, status: p.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === p.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{p.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">HK${p.value}M</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Savings</span><Wallet size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1.5">{PROCUREMENT_PACKAGES.slice(0, 4).map((p) => <div key={p.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{p.name}</span><span className="font-mono text-[var(--dim)]">{p.savings}</span></div><Progress value={parseFloat(p.savings) * 12} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{PROCUREMENT_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Procurement brief exported', 'Packages, bidders, savings and risk exported.', 'success')}><ClipboardCheck size={11} /> Tender brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/capital')}><ArrowRight size={11} /> Capital</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{PROCUREMENT_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Handshake size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Award plan" title="Value by package" action={<Badge tone="cyan">6 packages</Badge>}><div className="space-y-2">{PROCUREMENT_PACKAGES.map((p) => <div key={p.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{p.name}</span><span className="font-mono text-[var(--muted)]">HK${p.value}M · {p.bidders} bidders</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(p.value / 640) * 100}%`, background: p.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Risk" title="Single-source and price" action={<ShieldAlert size={12} className="text-[var(--rose)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Two packages have limited competition: lifts and facade. Steel and façade lead times are the main supply shock. Mitigations: early award, index hedging and qualified alternates.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 4.2% savings · HK$82M value · 9.4-week cycle.</div></Panel>
      </div>
    </div>
  );
}
