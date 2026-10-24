import { useState } from 'react';
import {
  ArrowRight, Building2, CheckCircle2, Droplets, Gauge, Globe2, Leaf, Recycle,
  ShieldCheck, Sun, TrendingDown, Wind,
} from 'lucide-react';
import { ESGScene } from '../components/ESGScene';
import { Badge, Button, Panel, Progress, Segmented } from '../components/ui';
import { Donut } from '../components/charts';
import {
  CLIMATE_RISKS, ESG_ACTIONS, ESG_ASSETS, ESG_ASSURANCE, ESG_FRAMEWORKS,
  ESG_KPIS, SCOPE_BREAKDOWN, WHOLE_LIFE, type EsgMode, type EsgScenario,
} from '../lib/esgData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const scenarioMeta: Record<EsgScenario, { label: string; year: string; note: string }> = {
  baseline: { label: 'Baseline', year: '2026', note: 'Current operating carbon and energy intensity.' },
  transition: { label: 'Transition', year: '2030', note: 'Retrofits, solar, green leases and demand response.' },
  netzero: { label: 'Net zero', year: '2045', note: 'Residual emissions neutralised; nature-positive estate.' },
};

export function ESG() {
  const [mode, setMode] = useState<EsgMode>('carbon');
  const [scenario, setScenario] = useState<EsgScenario>('baseline');
  const [selectedId, setSelectedId] = useState<string | null>('KT-01');
  const [autoRotate, setAutoRotate] = useState(false);
  const { toast } = useLive();
  const { t } = useI18n();
  const selected = ESG_ASSETS.find((a) => a.id === selectedId) ?? null;
  const activeScenario = scenarioMeta[scenario];
  const carbonIntensity = '27.6';
  const renewable = 38;

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            ESG & climate <span className="text-[var(--dim)]">/</span> portfolio and asset
          </div>
          <h1 className="display text-[26px] text-white">{t('esg.title', 'Decarbonise the operating model.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('esg.desc', 'A spatial ESG twin connecting operational carbon, embodied carbon, climate risk, certifications, social value and assurance across the portfolio.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> GRESB 82</span>
          <span className="chip"><Leaf size={10} className="text-[var(--accent)]" /> SBTi 1.5°C</span>
          <Button variant="secondary" size="sm" onClick={() => toast('ESG assurance pack', 'Carbon ledger, water, waste, social value and framework mapping exported.', 'success')}>
            <ShieldCheck size={12} /> Assurance pack
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast('ESG action plan opened', 'Six actions · HK$96M capex · 3,700 tCO₂e/yr abatement.', 'info')}>
            <Leaf size={12} /> Action plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#040907]">
            <ESGScene mode={mode} scenario={scenario} selectedId={selectedId} autoRotate={autoRotate} onSelect={setSelectedId} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">ESG twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">9 assets</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{carbonIntensity} kgCO₂e/m²</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--cyan)]">{renewable}% renewable</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                {activeScenario.year} · <span className="text-[var(--accent)]">{activeScenario.label}</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[214px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/82 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">ESG lens</span>
                <Leaf size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                {([{ id: 'carbon', label: 'Carbon', icon: Wind }, { id: 'nature', label: 'Nature & people', icon: Leaf }] as const).map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]', mode === m.id && 'bg-white/[.045]')}>
                    <m.icon size={12} className={mode === m.id ? 'text-[var(--accent)]' : 'text-[var(--dim)]'} />
                    <span className={cn('flex-1 text-[10px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Pathway</div>
                <div className="space-y-1">
                  {(Object.keys(scenarioMeta) as EsgScenario[]).map((s) => (
                    <button key={s} onClick={() => setScenario(s)} className={cn('flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-[9px] transition-colors', scenario === s ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}>
                      <span>{scenarioMeta[s].label}</span>
                      <span className="font-mono text-[7px]">{scenarioMeta[s].year}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[22px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">{mode === 'carbon' ? 'Operational carbon' : 'Nature & wellbeing'}</span>
              {mode === 'carbon' ? (
                <>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> &lt; 80</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> 80–100</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> &gt; 100</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> green roof / solar</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#ffe28a]" /> biodiversity</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> clean energy</span>
                </>
              )}
              <span className="text-[7.5px]">click a building to inspect</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.short} · asset` : 'Portfolio'}</div>
              <Badge tone={selected ? (selected.rating === 'A' ? 'green' : selected.rating === 'B' ? 'amber' : 'rose') : 'green'}>{selected ? `${selected.rating} rating` : 'GRESB 82'}</Badge>
            </div>
            <h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Portfolio ESG position'}</h2>
            <div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.cert ?? 'Nine assets · six districts · 4.82M ft²'}</div>
            {selected ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { l: 'Carbon', v: `${selected.carbon}`, u: 'kgCO₂e/m²' },
                  { l: 'Energy', v: `${selected.energy}`, u: 'kWh/m²' },
                  { l: 'Water', v: `${selected.water}`, u: 'ML/yr' },
                  { l: 'Waste', v: `${selected.waste}`, u: '% diverted' },
                ].map((x) => (
                  <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2">
                    <div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                    <div className="mt-0.5 num text-[12px] text-white">{x.v} <span className="text-[7px] text-[var(--dim)]">{x.u}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ESG_KPIS.slice(0, 4).map((k) => (
                  <div key={k.label} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2">
                    <div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">{k.label}</div>
                    <div className="mt-0.5 num text-[13px] text-white">{k.value}<span className="text-[7px] text-[var(--dim)]"> {k.unit}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Net-zero pathway</span><span className="font-mono text-[8px] text-[var(--accent)]">2045</span></div>
              <div className="mt-2"><Progress value={scenario === 'netzero' ? 100 : scenario === 'transition' ? 58 : 32} color="var(--accent)" height={5} /></div>
              <div className="mt-1.5 flex justify-between font-mono text-[7.5px] text-[var(--dim)]"><span>2026 baseline</span><span>{activeScenario.year} · {activeScenario.label}</span><span>2045</span></div>
              <p className="mt-2 text-[8px] leading-relaxed text-[var(--muted)]">{activeScenario.note}</p>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Certifications</span><Globe2 size={10} className="text-[var(--dim)]" /></div>
              <div className="mt-2 flex flex-wrap gap-1">
                {ESG_FRAMEWORKS.map((f) => <span key={f} className="rounded border border-[var(--line)] bg-white/[.02] px-1.5 py-0.5 font-mono text-[7px] text-[var(--muted)]">{f}</span>)}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Assurance</span><ShieldCheck size={10} className="text-[var(--accent)]" /></div>
              <div className="mt-2 space-y-1.5">
                {ESG_ASSURANCE.map((a) => (
                  <div key={a.label} className="flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full', a.status === 'assured' ? 'bg-[var(--accent)]' : 'bg-[var(--amber)]')} />
                    <span className="flex-1 text-[8px] text-[var(--muted)]">{a.label}</span>
                    <span className="font-mono text-[7px] text-[var(--dim)]">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Social value</span><span className="font-mono text-[8px] text-[var(--cyan)]">SROI 3.4×</span></div>
              <p className="mt-1.5 text-[8px] leading-relaxed text-[var(--muted)]">Community space, local procurement, apprenticeships and tenant wellbeing across the portfolio.</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[{ l: 'Community', v: '12.4k' }, { l: 'Local spend', v: 'HK$86M' }, { l: 'Wellbeing', v: '71' }].map((x) => (
                  <div key={x.l} className="rounded border border-[var(--line)] bg-black/15 p-1.5"><div className="text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-[#dbe5ee]">{x.v}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Carbon ledger reconciled', 'Scope 2 market-based and location-based views reconciled to the trust ledger.', 'success')}><Recycle size={11} /> Reconcile</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => toast('Climate risk workshop', 'Physical and transition scenarios queued for the next COO review.', 'info')}><Gauge size={11} /> Climate risk</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ESG_KPIS.map((k) => (
          <div key={k.label} className="panel p-4">
            <div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Leaf size={12} className="text-[var(--accent)]" /></div>
            <div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[9px] text-[var(--dim)]">{k.unit}</span></div>
            <div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4" eyebrow="Carbon inventory" title="Where the emissions sit" action={<span className="font-mono text-[8px] text-[var(--dim)]">market-based</span>}>
          <div className="flex items-center gap-5">
            <Donut
              segments={SCOPE_BREAKDOWN.map((s) => ({ label: s.label, value: s.value, color: s.color }))}
              size={112}
              thickness={9}
              center={<><span className="num text-[18px] text-white">2,184</span><span className="mt-0.5 text-[8px] uppercase tracking-wider text-[var(--dim)]">tCO₂e</span></>}
            />
            <div className="flex-1 space-y-2">
              {SCOPE_BREAKDOWN.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} /><span className="flex-1 text-[9px] text-[var(--muted)]">{s.label}</span><span className="font-mono text-[9px] text-[#cfdae4]">{s.value}%</span></div>
                  <div className="mt-0.5 pl-3.5 text-[7px] text-[var(--dim)]">{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Whole-life carbon" title="A1 to C4, one view" action={<span className="font-mono text-[8px] text-[var(--dim)]">kgCO₂e/m²</span>}>
          <div className="space-y-2.5">
            {WHOLE_LIFE.map((s) => (
              <div key={s.stage}>
                <div className="mb-1 flex items-center justify-between text-[8.5px]"><span className="font-mono text-[7.5px] text-[var(--accent)]">{s.stage}</span><span className="text-[var(--muted)]">{s.label}</span><span className="font-mono text-[#cfdae4]">{s.value}%</span></div>
                <Progress value={s.value} color={s.color} height={4} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--dim)]"><Building2 size={9} className="text-[var(--accent)]" /> Low-carbon concrete and reuse reduce A1–A5 by 28%.</div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Climate risk" title="Physical and transition" action={<Badge tone="amber">4 live</Badge>}>
          <div className="space-y-2">
            {CLIMATE_RISKS.map((r) => (
              <div key={r.title} className="flex items-start gap-2 rounded-md border border-[var(--line)] bg-white/[.014] p-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.color }} />
                <div className="min-w-0 flex-1"><div className="text-[8.5px] leading-snug text-[#dbe5ee]">{r.title}</div><div className="mt-0.5 font-mono text-[7px] text-[var(--dim)]">{r.type} · {r.assets} assets · {r.horizon}</div></div>
                <span className={cn('font-mono text-[7.5px]', r.exposure === 'High' ? 'text-[var(--rose)]' : r.exposure === 'Medium' ? 'text-[var(--amber)]' : 'text-[var(--accent)]')}>{r.exposure}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-8" eyebrow="ESG action plan" title="Abatement, adaptation and social value" action={<span className="font-mono text-[8px] text-[var(--accent)]">6 actions · HK$96M</span>} bodyClassName="!px-0 !pb-0">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Action</th><th>Impact</th><th>Capex</th><th>Payback</th><th>Owner</th><th>Status</th></tr></thead>
              <tbody>
                {ESG_ACTIONS.map((a) => (
                  <tr key={a.title}>
                    <td><span className="text-[10px] text-[#dbe5ee]">{a.title}</span></td>
                    <td><span className="font-mono text-[9px] text-[var(--accent)]">{a.impact}</span></td>
                    <td><span className="font-mono text-[9px] text-[var(--muted)]">{a.capex}</span></td>
                    <td><span className="font-mono text-[9px] text-[var(--muted)]">{a.payback}</span></td>
                    <td><span className="font-mono text-[8px] text-[var(--dim)]">{a.owner}</span></td>
                    <td><Badge tone={a.status.includes('COO') ? 'amber' : a.status === 'Live' ? 'green' : 'cyan'}>{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Social & governance" title="Trust is part of ESG" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Community investment', v: 'HK$42M', icon: Building2 },
              { l: 'Local procurement', v: '86%', icon: Globe2 },
              { l: 'Wellbeing index', v: '71', icon: Sun },
              { l: 'Water intensity', v: '1.9 ML', icon: Droplets },
            ].map((x) => (
              <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.014] p-2.5">
                <x.icon size={12} className="text-[var(--accent)]" />
                <div className="mt-1.5 text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                <div className="mt-0.5 num text-[13px] text-white">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--muted)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 100% of disclosed metrics have an audit owner and ledger attestation.</div>
          <div className="mt-2 flex items-center gap-1 text-[8px] text-[var(--dim)]"><TrendingDown size={9} className="text-[var(--accent)]" /> Carbon intensity down 11.6% year on year; pathway remains 6.2% ahead.</div>
        </Panel>
      </div>
    </div>
  );
}
