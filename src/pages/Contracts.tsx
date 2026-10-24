import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, FileText, Scale, ShieldCheck, Timer, Wallet,
} from 'lucide-react';
import { ContractsScene, type ContractsSelection } from '../components/ContractsScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  CONTRACTS, CONTRACTS_ACTIONS, CONTRACTS_KPIS, CONTRACTS_MODES, CONTRACTS_SCENARIOS,
  type ContractsMode, type ContractsScenario,
} from '../lib/contractsData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { obligations: FileText, claims: AlertTriangle, time: Timer, renewals: ShieldCheck } as const;

export function Contracts() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<ContractsMode>('obligations');
  const [scenario, setScenario] = useState<ContractsScenario>('base');
  const [selected, setSelected] = useState<ContractsSelection | null>({ id: 'C-01', name: 'Main works', party: 'Principal / contractor', value: 1840, obligations: 42, claims: 1, renewal: '2029', risk: 'Medium', status: 'Live' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = CONTRACTS_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Contracts & claims <span className="text-[var(--dim)]">/</span> commercial governance</div>
          <h1 className="display text-[26px] text-white">{t('contracts.title', 'Every obligation, visible.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('contracts.desc', 'A 3D contract portfolio: six contracts, parties, obligations, claims, time bars and renewals across base, claim and dispute scenarios.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 contracts · HK$2.94B</span>
          <span className="chip"><Scale size={10} className="text-[var(--accent)]" /> exposure {s.exposure}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/procurement')}><ArrowRight size={12} /> Procurement</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('dispute'); toast('Dispute scenario', 'MEP payment dispute referred to adjudication · cash ring-fenced.', 'warning'); }}><Scale size={12} /> Dispute</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <ContractsScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Contract portfolio</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">HK$2.94B</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--rose)]">{s.claims} claims</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Dispute' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Contract lens</span><FileText size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{CONTRACTS_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['base', 'claim', 'dispute'] as ContractsScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{CONTRACTS_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Contracts</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> live</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> claim</span><span className="text-[7.5px]">click a contract</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · contract` : 'Contracts'}</div><Badge tone={selected?.risk === 'High' || s.status === 'Dispute' ? 'rose' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Contract portfolio'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.party} · HK$${selected.value}M · renew ${selected.renewal}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Oblig.', v: `${selected?.obligations ?? 0}` }, { l: 'Claims', v: `${selected?.claims ?? 0}` }, { l: 'Risk', v: selected?.risk ?? '—' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Contracts</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{CONTRACTS.map((c) => <button key={c.id} onClick={() => setSelected({ id: c.id, name: c.name, party: c.party, value: c.value, obligations: c.obligations, claims: c.claims, renewal: c.renewal, risk: c.risk, status: c.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === c.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{c.name}</span><span className={cn('font-mono text-[6.5px]', c.claims > 0 ? 'text-[var(--rose)]' : 'text-[var(--dim)]')}>{c.claims} claims</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{CONTRACTS_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 100% notices served within time bars · 2 live claims.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Contracts brief exported', 'Contracts, obligations, claims and renewals exported.', 'success')}><FileText size={11} /> Contract brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/capital')}><ArrowRight size={11} /> Capital</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{CONTRACTS_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Scale size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Obligations" title="Value under management" action={<Badge tone="cyan">6 contracts</Badge>}><div className="space-y-2">{CONTRACTS.map((c) => <div key={c.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{c.name}</span><span className="font-mono text-[var(--muted)]">HK${c.value}M · {c.claims} claims</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(c.value / 1840) * 100}%`, background: c.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Governance" title="Time bars and evidence" action={<Timer size={12} className="text-[var(--amber)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Notices, records and contemporaneous evidence protect entitlement. Every claim has an owner, a deadline and an evidence pack; every renewal has a decision date.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><Wallet size={9} className="text-[var(--accent)]" /> Exposure HK$24M · notices 100% on time.</div></Panel>
      </div>
    </div>
  );
}
