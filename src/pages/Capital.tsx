import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Building2, CheckCircle2, Landmark, Percent, ShieldCheck, TrendingUp, Wallet,
} from 'lucide-react';
import { CapitalScene, type CapitalSelection } from '../components/CapitalScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  CAPITAL_ACTIONS, CAPITAL_INVESTORS, CAPITAL_KPIS, CAPITAL_LAYERS, CAPITAL_MODES, CAPITAL_SCENARIOS,
  type CapitalMode, type CapitalScenario,
} from '../lib/capitalData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { stack: Landmark, returns: TrendingUp, risk: ShieldCheck, investors: Building2 } as const;

export function Capital() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<CapitalMode>('stack');
  const [scenario, setScenario] = useState<CapitalScenario>('base');
  const [selected, setSelected] = useState<CapitalSelection | null>({ id: 'DEBT', name: 'Senior debt', amount: 620, rate: '5.2%', note: 'Club of three banks' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = CAPITAL_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Capital & investors <span className="text-[var(--dim)]">/</span> COO finance</div>
          <h1 className="display text-[26px] text-white">{t('capital.title', 'Capital with conviction.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('capital.desc', 'A 3D capital-stack twin: senior debt, mezzanine, equity and grants linked to assets, investors, returns, covenants and refinancing.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> HK$1.20B stack</span>
          <span className="chip"><Percent size={10} className="text-[var(--accent)]" /> IRR {s.irr}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/portfolio')}><BarChart3 size={12} /> Portfolio</Button>
          <Button variant="primary" size="sm" onClick={() => toast('Investor pack opened', 'Capital stack, returns, covenants and use of proceeds.', 'info')}><Wallet size={12} /> Investor pack</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <CapitalScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Capital stack</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">HK$1.20B</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">IRR {s.irr}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">DSCR {s.dscr}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Capital lens</span><Landmark size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{CAPITAL_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['base', 'upside', 'downside'] as CapitalScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{CAPITAL_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Stack</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> debt</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> mezz</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> equity</span><span className="text-[7.5px]">click a layer</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · layer` : 'Capital stack'}</div><Badge tone="green">{s.label}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Capital stack'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `HK$${selected.amount}M · ${selected.rate} · ${selected.note}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'IRR', v: s.irr }, { l: 'Multiple', v: s.multiple }, { l: 'LTV', v: s.ltv }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Layers</span><span className="font-mono text-[8px] text-[var(--accent)]">HK$1.20B</span></div><div className="mt-2 space-y-1">{CAPITAL_LAYERS.map((l) => <button key={l.id} onClick={() => setSelected({ id: l.id, name: l.name, amount: l.amount, rate: l.rate, note: l.note })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === l.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{l.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">HK${l.amount}M</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Investors</span><Building2 size={10} className="text-[var(--violet)]" /></div><div className="mt-2 space-y-1">{CAPITAL_INVESTORS.map((i) => <div key={i.id} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[7.5px] last:border-0"><span className="text-[var(--muted)]">{i.name}</span><span className="font-mono text-[var(--dim)]">{i.commitment}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><Wallet size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1.5">{CAPITAL_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Capital pack exported', 'Stack, returns, covenants and investor register exported.', 'success')}><CheckCircle2 size={11} /> Capital pack</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/portfolio')}><ArrowRight size={11} /> Portfolio</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{CAPITAL_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><TrendingUp size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Covenants" title="Headroom at a glance" action={<Badge tone="green">compliant</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-3">{[{ l: 'DSCR', v: s.dscr, c: 'covenant 1.20x' }, { l: 'LTV', v: s.ltv, c: 'covenant 70%' }, { l: 'Interest cover', v: '2.4x', c: 'covenant 1.8x' }].map((x) => <div key={x.l} className="rounded border border-[var(--line)] bg-white/[.014] p-3"><div className="text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-1 num text-[18px] text-white">{x.v}</div><div className="text-[6.5px] text-[var(--dim)]">{x.c}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Use of proceeds" title="Where capital goes" action={<Landmark size={12} className="text-[var(--cyan)]" />}><div className="space-y-2">{[{ l: 'Kai Tak Phase 2', v: 38 }, { l: 'TKO data centre', v: 26 }, { l: 'Retrofit programme', v: 18 }, { l: 'Workplace & placemaking', v: 10 }, { l: 'Liquidity', v: 8 }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}%</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${x.v}%` }} /></div></div>)}</div></Panel>
      </div>
    </div>
  );
}
