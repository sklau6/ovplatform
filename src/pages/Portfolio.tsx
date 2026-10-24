import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Banknote, Briefcase, Building2, CheckCircle2, ChevronRight,
  CircleAlert, Download, FileText, Gauge, Layers, PieChart, ShieldAlert, Target, TrendingUp, Wallet,
} from 'lucide-react';
import { AreaChart, Donut, ProgressRing } from '../components/charts';
import { PortfolioTowerScene } from '../components/PortfolioTowerScene';
import { Badge, Button, Modal, Panel, Progress, SectionHeader, Segmented } from '../components/ui';
import { CAPABILITIES, PROJECTS, SERIES, districtById } from '../lib/data';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn, downloadFile, hkd, numberFormat, toCsv } from '../lib/utils';
import type { Project } from '../lib/types';

type Scenario = 'base' | 'downside' | 'upside';

const SCENARIOS: Record<Scenario, { revenue: number; cost: number; opex: number; label: string; note: string; margin: number }> = {
  base: { revenue: 1060, cost: 583, opex: 214, label: 'Base', margin: 24.8, note: 'Plan of record. TKO capacity resolved in Q2; two stage gates recovered by year end.' },
  downside: { revenue: 996, cost: 601, opex: 214, label: 'Downside', margin: 18.2, note: 'Two anchor renewals slip and the Kai Tak handover moves one quarter. Cost base flexes only partially.' },
  upside: { revenue: 1124, cost: 577, opex: 218, label: 'Upside', margin: 29.3, note: 'Carbon-linked managed services scale and the West Kowloon estate converts ahead of plan.' },
};

const RISKS = [
  { id: 'R1', title: 'TKO grid capacity constrains expansion', owner: 'D. Yip', likelihood: 5, impact: 5, exposure: 'HK$186M', category: 'Infrastructure', mitigation: 'Capacity study + CLP engagement' },
  { id: 'R2', title: 'Kowloon East BIM handover variance', owner: 'M. Lee', likelihood: 4, impact: 4, exposure: 'HK$7.2M', category: 'Delivery', mitigation: 'Recovery plan, weekly gate' },
  { id: 'R3', title: 'Data rights at West Kowloon estate', owner: 'L. Ho', likelihood: 3, impact: 4, exposure: 'HK$24M', category: 'Commercial', mitigation: 'Contract restructure' },
  { id: 'R4', title: 'Refinancing at higher rates', owner: 'T. Lau', likelihood: 3, impact: 5, exposure: 'HK$38M', category: 'Financial', mitigation: 'Hedge 60% of exposure' },
  { id: 'R5', title: 'OT/IT convergence cyber exposure', owner: 'A. Cheng', likelihood: 2, impact: 5, exposure: 'HK$52M', category: 'Cyber', mitigation: 'Segmentation + SOC uplift' },
  { id: 'R6', title: 'Executive talent density', owner: 'T. Lau', likelihood: 4, impact: 3, exposure: 'HK$12M', category: 'People', mitigation: 'Succession + search' },
];

const GATES = [
  { gate: 'G0', label: 'Originate', count: 1, value: 110 },
  { gate: 'G1', label: 'Validate', count: 1, value: 320 },
  { gate: 'G2', label: 'Prove', count: 2, value: 234 },
  { gate: 'G3', label: 'Scale', count: 3, value: 362 },
  { gate: 'G4', label: 'Realise', count: 2, value: 128 },
];

const RAG_STYLE = {
  green: { tone: 'green' as const, label: 'On track', color: 'var(--accent)' },
  amber: { tone: 'amber' as const, label: 'At risk', color: 'var(--amber)' },
  red: { tone: 'rose' as const, label: 'Off track', color: 'var(--rose)' },
};

export function Portfolio() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [scenario, setScenario] = useState<Scenario>('base');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoverRisk, setHoverRisk] = useState<string>('R1');
  const [towerId, setTowerId] = useState<string>(PROJECTS[0]?.id ?? '');

  const s = SCENARIOS[scenario];
  const gross = s.revenue - s.cost;
  const ebitda = gross - s.opex;
  const margin = (ebitda / s.revenue) * 100;
  const max = 1120;

  const waterfall = [
    { label: 'Revenue', value: s.revenue, start: 0, end: s.revenue, kind: 'total' as const },
    { label: 'Cost of delivery', value: -s.cost, start: gross, end: s.revenue, kind: 'negative' as const },
    { label: 'Gross profit', value: gross, start: 0, end: gross, kind: 'subtotal' as const },
    { label: 'Operating cost', value: -s.opex, start: ebitda, end: gross, kind: 'negative' as const },
    { label: 'EBITDA', value: ebitda, start: 0, end: ebitda, kind: 'result' as const },
  ];

  const totalBudget = PROJECTS.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = PROJECTS.reduce((sum, p) => sum + p.spent, 0);
  const weightedMargin = PROJECTS.filter((p) => p.margin > 0).reduce((sum, p) => sum + p.margin, 0) / PROJECTS.filter((p) => p.margin > 0).length;
  const activeRisk = RISKS.find((r) => r.id === hoverRisk) ?? RISKS[0];
  const towerProject = PROJECTS.find((p) => p.id === towerId) ?? PROJECTS[0];

  const exportPlan = () => {
    downloadFile('ophylla-portfolio-plan.csv', toCsv(PROJECTS.map((p) => ({
      id: p.id, project: p.name, client: p.client, district: p.district, gate: p.gate,
      rag: p.rag, budget_hkdm: p.budget, spent_hkdm: p.spent, margin_pct: p.margin,
      progress_pct: p.progress, owner: p.owner, next_gate: p.nextGate, value_hkdm: p.value,
    }))), 'text/csv');
    toast('Portfolio plan exported', `${PROJECTS.length} projects · CSV with gate and margin fields.`, 'success');
  };

  const gateCounts = useMemo(() => ['G0', 'G1', 'G2', 'G3', 'G4'].map((g) => PROJECTS.filter((p) => p.gate === g).length), []);

  return (
    <div className="page-enter mx-auto max-w-[1540px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-2">Executive operations · portfolio</div>
          <h1 className="display text-[28px] text-white">{t('portfolio.title', 'Growth with discipline.')}</h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)]">
            {t('portfolio.desc', 'One portfolio view from origination to realised value: capital allocation, delivery health, margin and the risks that could change the plan.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented value={scenario} onChange={setScenario} options={[{ value: 'downside', label: 'Downside' }, { value: 'base', label: 'Base' }, { value: 'upside', label: 'Upside' }]} />
          <Button variant="secondary" size="sm" onClick={exportPlan}><Download size={12} /> Export plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Revenue · T12M', v: hkd(s.revenue * 0.94), s: `${scenario === 'downside' ? '-6.4%' : scenario === 'upside' ? '+6.0%' : '+8.4%'} vs prior year`, icon: Banknote, tone: 'var(--accent)' },
          { l: 'EBITDA margin', v: `${margin.toFixed(1)}%`, s: `EBITDA ${hkd(ebitda * 0.94)}`, icon: Gauge, tone: 'var(--cyan)' },
          { l: 'Committed capital', v: hkd(totalBudget), s: `${hkd(totalSpent)} deployed · ${((totalSpent / totalBudget) * 100).toFixed(0)}%`, icon: Wallet, tone: 'var(--violet)' },
          { l: 'Weighted project margin', v: `${weightedMargin.toFixed(1)}%`, s: 'Target 22.0% · 3 projects above', icon: Target, tone: 'var(--accent)' },
        ].map((k) => (
          <div key={k.l} className="panel flex items-start justify-between p-4">
            <div>
              <div className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.1em] text-[var(--dim)]"><k.icon size={10} /> {k.l}</div>
              <div className="num mt-2 text-[22px] text-white">{k.v}</div>
              <div className="mt-0.5 text-[9px] text-[var(--dim)]">{k.s}</div>
            </div>
          </div>
        ))}
      </div>

      <Panel className="overflow-hidden" eyebrow="3D capital portfolio" title="Capital as a landscape" action={<span className="font-mono text-[8px] text-[var(--dim)]">click a tower · drag to orbit</span>}>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="dark-surface relative h-[292px] overflow-hidden rounded-lg border border-[var(--line)] xl:col-span-8">
            <PortfolioTowerScene projects={PROJECTS} selectedId={towerId} onSelect={setTowerId} />
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-[var(--line)] bg-[#061016]/75 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.13em] text-[var(--dim)] backdrop-blur">height = committed capital · colour = delivery health</div>
            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[7px] text-[var(--dim)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> on track <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> at risk <span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> off track</div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-[var(--line)] bg-white/[.012] p-4 xl:col-span-4">
            <div>
              <div className="flex items-center justify-between"><span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{towerProject?.gate} · {towerProject?.rag}</span><Badge tone={towerProject?.rag === 'green' ? 'green' : towerProject?.rag === 'amber' ? 'amber' : 'rose'}>{towerProject?.progress}% built</Badge></div>
              <h3 className="mt-2 font-display text-[17px] text-white">{towerProject?.name}</h3>
              <div className="mt-1 text-[9px] text-[var(--muted)]">{towerProject?.client} · {towerProject?.district}</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[{ l: 'Budget', v: `HK$${towerProject?.budget}M` }, { l: 'Spent', v: `HK$${towerProject?.spent}M` }, { l: 'Margin', v: `${towerProject?.margin.toFixed(1)}%` }].map((x) => (
                  <div key={x.l} className="rounded border border-[var(--line)] bg-black/15 p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-[#dbe5ee]">{x.v}</div></div>
                ))}
              </div>
              <div className="mt-3"><Progress value={towerProject?.progress ?? 0} color="var(--accent)" height={4} /></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setSelectedProject(towerProject ?? null)}>Open project <ArrowRight size={10} /></Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portfolio')}>{towerProject?.id}</Button>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          className="xl:col-span-7"
          eyebrow={`P&L bridge · ${s.label} case`}
          title="From revenue to EBITDA"
          action={<span className="font-mono text-[9px] text-[var(--dim)]">HK$M · T12M</span>}
        >
          <div className="mt-2">
            <div className="flex h-[230px] items-stretch gap-2 sm:gap-4">
              {waterfall.map((bar) => {
                const height = ((bar.end - bar.start) / max) * 100;
                const bottom = (Math.min(bar.start, bar.end) / max) * 100;
                const color = bar.kind === 'negative' ? 'linear-gradient(180deg, #fb7185, #c94b62)' : bar.kind === 'subtotal' ? 'linear-gradient(180deg, #45c4f5, #2b7fa3)' : 'linear-gradient(180deg, #4aeeb0, #2fae87)';
                return (
                  <div key={bar.label} className="group relative flex flex-1 flex-col justify-end">
                    <div className="relative flex-1">
                      <div className="absolute inset-x-0 top-0 flex justify-center">
                        <span className={cn('rounded border px-1.5 py-0.5 font-mono text-[8.5px] tabular-nums', bar.kind === 'negative' ? 'border-[rgba(251,113,133,.2)] bg-[#170c10] text-[#fda4b0]' : 'border-[var(--line)] bg-[#08110f] text-[#c9f7e6]')}>
                          {bar.value > 0 ? '' : '−'}{Math.abs(bar.value)}
                        </span>
                      </div>
                      <div
                        className="absolute inset-x-1 rounded-t-[3px] transition-all duration-500 group-hover:brightness-110 sm:inset-x-2"
                        style={{ bottom: `${bottom}%`, height: `${Math.max(2, height)}%`, background: color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)' }}
                      />
                    </div>
                    <div className="mt-2 min-h-[24px] text-center text-[8.5px] leading-tight text-[var(--dim)]">{bar.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-3">
              <p className="max-w-[70%] text-[9.5px] leading-relaxed text-[var(--muted)]">{s.note}</p>
              <div className="text-right">
                <div className="font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">EBITDA</div>
                <div className="num text-[18px] text-[var(--accent)]">{hkd(ebitda * 0.94)}</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="xl:col-span-5" eyebrow="Capital allocation" title="Where the next dollar goes">
          <div className="flex items-center gap-5">
            <Donut
              size={116}
              thickness={10}
              segments={CAPABILITIES.map((c) => ({ label: c.name, value: c.value, color: c.color }))}
              center={<><span className="num text-[18px] text-white">HK$1.38B</span><span className="mt-0.5 text-[7.5px] uppercase tracking-wider text-[var(--dim)]">programme</span></>}
            />
            <div className="flex-1 space-y-2">
              {CAPABILITIES.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="flex items-center gap-1.5 text-[var(--muted)]"><span className="legend-dot" style={{ background: c.color }} /> {c.name}</span>
                    <span className="font-mono text-[9px] text-[#cfdae4]">{c.share}%</span>
                  </div>
                  <div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/[.05]">
                    <div className="h-full rounded-full" style={{ width: `${c.share}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-[var(--line)] bg-white/[.018] p-3">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[var(--dim)]">2027 envelope</span>
              <span className="font-mono text-[var(--accent)]">HK$412M / HK$640M</span>
            </div>
            <Progress value={(412 / 640) * 100} height={4} className="mt-2" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[['Committed', 'HK$246M'], ['Reserve', 'HK$228M'], ['Discretionary', 'HK$166M']].map(([l, v]) => (
                <div key={l}><div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">{l}</div><div className="font-mono text-[10px] text-[#dbe5ee]">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[9px] text-[var(--dim)]">
            <span className="flex items-center gap-1.5"><ShieldAlert size={10} className="text-[var(--amber)]" /> 2 initiatives above risk appetite</span>
            <button onClick={() => toast('Allocation review', 'Capital committee pre-read prepared for 07 Nov.', 'info')} className="flex items-center gap-1 text-[var(--accent)]">Review <ChevronRight size={10} /></button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
            <div>
              <div className="eyebrow mb-1">Stage-gate portfolio</div>
              <div className="font-display text-[13.5px] text-white">Nine initiatives · {hkd(sumValues())} value</div>
            </div>
            <div className="flex items-center gap-1.5">
              {(['green', 'amber', 'red'] as const).map((r) => (
                <span key={r} className="flex items-center gap-1 text-[8px] text-[var(--dim)]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: RAG_STYLE[r].color }} /> {PROJECTS.filter((p) => p.rag === r).length}</span>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Initiative</th><th>Gate</th><th>Health</th><th className="text-right">Budget</th><th className="text-right">Spent</th><th className="text-right">Margin</th><th>Owner</th><th>Next gate</th><th /></tr></thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.id} className="group cursor-pointer" onClick={() => setSelectedProject(p)}>
                    <td>
                      <div className="text-[10.5px] text-[#dbe5ee]">{p.name}</div>
                      <div className="mt-0.5 font-mono text-[8px] text-[var(--dim)]">{p.id} · {districtById(p.district)?.name}</div>
                    </td>
                    <td><span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[8px] text-[var(--muted)]">{p.gate}</span></td>
                    <td><span className={cn('badge', RAG_STYLE[p.rag].tone === 'green' ? 'badge-green' : RAG_STYLE[p.rag].tone === 'amber' ? 'badge-amber' : 'badge-rose')}>{RAG_STYLE[p.rag].label}</span></td>
                    <td className="num-cell text-right">HK${p.budget}M</td>
                    <td className="num-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>HK${p.spent}M</span>
                        <span className="h-1 w-8 overflow-hidden rounded-full bg-white/[.06]"><span className="block h-full rounded-full bg-[var(--muted)]" style={{ width: `${Math.min(100, (p.spent / p.budget) * 100)}%` }} /></span>
                      </div>
                    </td>
                    <td className="num-cell text-right" style={{ color: p.margin < 15 ? 'var(--amber)' : undefined }}>{p.margin > 0 ? `${p.margin}%` : '—'}</td>
                    <td><span className="text-[9px] text-[var(--muted)]">{p.owner}</span></td>
                    <td><span className="font-mono text-[8.5px] text-[var(--dim)]">{p.nextGate}</span></td>
                    <td><ChevronRight size={12} className="text-[var(--dim)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-4 xl:col-span-4">
          <Panel eyebrow="Risk & control" title="Portfolio risk heatmap" action={<Badge tone="amber">6 active</Badge>} bodyClassName="!px-4 !pb-4">
            <div className="mt-1">
              <div className="flex gap-1.5">
                <div className="flex flex-col justify-between pb-5 pr-1 text-right">
                  {[5, 4, 3, 2, 1].map((i) => <span key={i} className="font-mono text-[7.5px] leading-[26px] text-[var(--dim)]">{i}</span>)}
                </div>
                <div className="grid flex-1 grid-cols-5 gap-1">
                  {[5, 4, 3, 2, 1].map((impact) => (
                    [1, 2, 3, 4, 5].map((likelihood) => {
                      const risks = RISKS.filter((r) => r.impact === impact && r.likelihood === likelihood);
                      const score = impact * likelihood;
                      const bg = score >= 15 ? 'rgba(251,113,133,.18)' : score >= 8 ? 'rgba(245,183,72,.14)' : 'rgba(62,224,161,.08)';
                      return (
                        <button
                          key={`${impact}-${likelihood}`}
                          onMouseEnter={() => risks[0] && setHoverRisk(risks[0].id)}
                          onClick={() => risks[0] && setHoverRisk(risks[0].id)}
                          className={cn('relative h-[26px] rounded-[3px] border transition-all', risks.length ? 'border-[rgba(255,255,255,.12)] hover:scale-[1.06]' : 'border-white/[.03]')}
                          style={{ background: risks.length ? (score >= 15 ? 'rgba(251,113,133,.35)' : score >= 8 ? 'rgba(245,183,72,.28)' : 'rgba(62,224,161,.18)') : bg }}
                        >
                          {risks.map((r) => (
                            <span key={r.id} className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-medium text-white">{r.id}</span>
                          ))}
                        </button>
                      );
                    })
                  ))}
                </div>
              </div>
              <div className="mt-1.5 grid grid-cols-5 gap-1 pl-5">
                {[1, 2, 3, 4, 5].map((l) => <span key={l} className="text-center font-mono text-[7.5px] text-[var(--dim)]">{l}</span>)}
              </div>
              <div className="mt-1 flex items-center justify-between pl-5 font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">
                <span>Likelihood →</span><span>Impact ↑</span>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-[var(--line)] bg-white/[.018] p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-[var(--accent)]">{activeRisk.id} · {activeRisk.category}</span>
                <span className="font-mono text-[9px] text-[var(--rose)]">{activeRisk.exposure}</span>
              </div>
              <div className="mt-1 text-[10.5px] text-[#dbe5ee]">{activeRisk.title}</div>
              <div className="mt-1 text-[8.5px] text-[var(--dim)]">Owner {activeRisk.owner} · mitigation: {activeRisk.mitigation}</div>
            </div>
          </Panel>

          <Panel eyebrow="Liquidity" title="Cash & covenants" bodyClassName="!px-4 !pb-4">
            <div className="flex items-center gap-4">
              <ProgressRing value={78} size={78} label="headroom" />
              <div className="flex-1 space-y-1.5">
                {[['Cash on hand', 'HK$186M'], ['Undrawn RCF', 'HK$240M'], ['Net debt / EBITDA', '2.4×'], ['Interest cover', '4.8×']].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">{l}</span><span className="font-mono text-[#cfdae4]">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-md border border-[rgba(62,224,161,.15)] bg-[rgba(62,224,161,.03)] px-2.5 py-1.5 text-[8.5px] text-[var(--muted)]">
              <CheckCircle2 size={10} className="text-[var(--accent)]" /> All covenants compliant · next test 31 Dec
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel eyebrow="Stage gates" title="Pipeline progression">
          <div className="space-y-2.5">
            {GATES.map((g, i) => (
              <div key={g.gate} className="flex items-center gap-2.5">
                <span className="w-6 font-mono text-[8.5px] text-[var(--dim)]">{g.gate}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--muted)]">{g.label}</span><span className="font-mono text-[var(--dim)]">{g.count} · HK${g.value}M</span></div>
                  <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/[.05]">
                    <div className="h-full rounded-full" style={{ width: `${(g.count / 3) * 100}%`, background: i < 2 ? 'var(--cyan)' : i < 4 ? 'var(--accent)' : 'var(--violet)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[8.5px] text-[var(--dim)]">Two initiatives in G3 are within 20% of their gate evidence.</div>
        </Panel>

        <Panel eyebrow="Delivery health" title="Margin & schedule">
          <div className="flex items-end justify-between">
            <div><div className="num text-[26px] text-white">92.6%</div><div className="text-[8.5px] text-[var(--dim)]">milestones on time</div></div>
            <Badge tone="amber">−0.8 pts</Badge>
          </div>
          <AreaChart height={96} className="mt-2" series={[{ name: 'On-time', color: '#45c4f5', data: SERIES.pipeline.slice(0, 16) }]} yFormat={(n) => `${Math.round(n)}`} labels={[]} />
          <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2 text-[8.5px]">
            <span className="text-[var(--dim)]">Forecast accuracy</span><span className="font-mono text-[var(--accent)]">±4.1%</span>
          </div>
        </Panel>

        <Panel eyebrow="COO perspective" title="What changes the plan">
          <p className="text-[10.5px] leading-relaxed text-[#c7d4df]">
            The portfolio does not need more initiatives. It needs <span className="text-white">three decisions executed well</span>: resolve TKO capacity, close the Kowloon East handover, and protect margin on the West Kowloon data-rights negotiation.
          </p>
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#2b4b44] to-[#10231f] font-display text-[8px] text-[#a7f3d4]">TL</div>
            <div className="text-[8.5px] text-[var(--dim)]">Operating review · 22 Oct 2026</div>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => navigate('/brief')}>Brief <ArrowRight size={10} /></Button>
          </div>
        </Panel>
      </div>

      <Modal
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        eyebrow={selectedProject ? `${selectedProject.id} · ${selectedProject.gate} · ${RAG_STYLE[selectedProject.rag].label}` : ''}
        title={selectedProject?.name ?? ''}
        footer={selectedProject ? (
          <>
            <Button variant="ghost" onClick={() => setSelectedProject(null)}>Close</Button>
            <Button variant="secondary" onClick={() => navigate('/twin')}>Open location</Button>
            <Button variant="primary" onClick={() => { toast('Gate pack generated', `${selectedProject.id} · evidence pack and decision paper prepared.`, 'success'); setSelectedProject(null); }}><FileText size={12} /> Prepare gate pack</Button>
          </>
        ) : null}
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Budget', `HK$${selectedProject.budget}M`], ['Spent', `HK$${selectedProject.spent}M`], ['Margin', `${selectedProject.margin}%`], ['Value', `HK$${selectedProject.value}M`]].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-[var(--line)] p-2.5"><div className="text-[8px] uppercase tracking-wider text-[var(--dim)]">{l}</div><div className="num mt-1 text-[15px] text-white">{v}</div></div>
              ))}
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Delivery progress</span><span className="font-mono text-white">{selectedProject.progress}%</span></div>
              <Progress value={selectedProject.progress} height={5} color={RAG_STYLE[selectedProject.rag].color} />
            </div>
            <div className="space-y-2 text-[10px]">
              {[['Client', selectedProject.client], ['District', districtById(selectedProject.district)?.name ?? ''], ['Capability', selectedProject.capability], ['Owner', selectedProject.owner], ['Next gate', selectedProject.nextGate], ['Primary risk', selectedProject.risk]].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-2 last:border-0"><span className="text-[var(--dim)]">{k}</span><span className="text-right text-[#dbe5ee]">{v}</span></div>
              ))}
            </div>
            <div className="rounded-lg border border-[rgba(62,224,161,.15)] bg-[rgba(62,224,161,.03)] p-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
              This initiative is reviewed at the monthly portfolio control. Gate evidence must include delivery health, margin forecast, customer acceptance and an independent benefit baseline.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function sumValues() {
  return PROJECTS.reduce((sum, p) => sum + p.value, 0);
}
