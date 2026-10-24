import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, FileCheck, Shield, Umbrella, Wallet,
} from 'lucide-react';
import { InsuranceScene, type InsuranceSelection } from '../components/InsuranceScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  INSURANCE_ACTIONS, INSURANCE_KPIS, INSURANCE_MODES, INSURANCE_POLICIES, INSURANCE_SCENARIOS,
  type InsuranceMode, type InsuranceScenario,
} from '../lib/insuranceData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { coverage: Umbrella, claims: FileCheck, premiums: Wallet, cat: AlertTriangle } as const;

export function Insurance() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<InsuranceMode>('coverage');
  const [scenario, setScenario] = useState<InsuranceScenario>('base');
  const [selected, setSelected] = useState<InsuranceSelection | null>({ id: 'CAR', name: 'Construction all-risk', limit: 2400, premium: 8.4, deductible: 'HK$2M', claims: 1, status: 'Active' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = INSURANCE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Insurance & risk <span className="text-[var(--dim)]">/</span> COO protection</div>
          <h1 className="display text-[26px] text-white">{t('insurance.title', 'Protect the downside.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('insurance.desc', 'A 3D insurance and risk twin: six policies, limits, deductibles, premiums, claims and catastrophe exposure across typhoon, cyber and base scenarios.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 policies · HK$8.7B limits</span>
          <span className="chip"><Shield size={10} className="text-[var(--accent)]" /> {s.status}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/capital')}><ArrowRight size={12} /> Capital</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('typhoon'); toast('Typhoon event', 'Property and BI claims notified · loss adjuster appointed.', 'warning'); }}><AlertTriangle size={12} /> Typhoon</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <InsuranceScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Insurance twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">HK$8.7B</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.exposure} cat</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Claim' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Risk lens</span><Umbrella size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{INSURANCE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['base', 'typhoon', 'cyber'] as InsuranceScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{INSURANCE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Cover</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> policy</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--violet)]" /> cat ring</span><span className="text-[7.5px]">click a policy</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · policy` : 'Insurance'}</div><Badge tone={s.status === 'Claim' ? 'rose' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Insurance programme'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `HK$${selected.limit}M limit · HK$${selected.premium}M premium · deductible ${selected.deductible}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Limit', v: `HK$${selected?.limit ?? 0}M` }, { l: 'Premium', v: `HK$${selected?.premium ?? 0}M` }, { l: 'Claims', v: `${selected?.claims ?? 0}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Policies</span><span className="font-mono text-[8px] text-[var(--accent)]">6 active</span></div><div className="mt-2 space-y-1">{INSURANCE_POLICIES.map((p) => <button key={p.id} onClick={() => setSelected({ id: p.id, name: p.name, limit: p.limit, premium: p.premium, deductible: p.deductible, claims: p.claims, status: p.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === p.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{p.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">HK${p.limit}M</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{INSURANCE_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Cat modelling 1-in-200 · programme renewed.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Insurance brief exported', 'Policies, limits, claims and cat exposure exported.', 'success')}><FileCheck size={11} /> Insurance brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/capital')}><ArrowRight size={11} /> Capital</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{INSURANCE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Umbrella size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Programme" title="Limits by policy" action={<Badge tone="cyan">6 policies</Badge>}><div className="space-y-2">{INSURANCE_POLICIES.map((p) => <div key={p.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{p.name}</span><span className="font-mono text-[var(--muted)]">HK${p.limit}M · HK${p.premium}M</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(p.limit / 3600) * 100}%`, background: p.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Catastrophe" title="Typhoon and cyber" action={<AlertTriangle size={12} className="text-[var(--violet)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Property and BI are the largest typhoon exposure; cyber is the fastest-growing tail. Deductibles and sub-limits are tested against a 1-in-200 event and the business plan.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><Shield size={9} className="text-[var(--accent)]" /> Cat exposure HK$420M · deductibles reviewed · loss adjuster panel ready.</div></Panel>
      </div>
    </div>
  );
}
