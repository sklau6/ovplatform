import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Award, Briefcase, Building2, Check, CheckCircle2, Clipboard,
  Cloud, Copy, Cpu, Download, FileText, Globe2, GraduationCap, Languages, Layers, Leaf,
  MapPin, Printer, Quote, ShieldCheck, Sparkles, Target, TrendingUp, Users, Workflow, Zap,
} from 'lucide-react';
import { Badge, Button, Panel, Progress, SectionHeader } from '../components/ui';
import { ExecutiveBoardroomScene } from '../components/ExecutiveBoardroomScene';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn, downloadFile, toCsv } from '../lib/utils';

const EXEC_PILLARS = [
  { id: 'strategy', label: 'Strategy', metric: '3 growth bets', color: '#53f0be', detail: 'A strategy on a page: three growth bets, two stop-doing decisions and a 3-year plan tied to capital.' },
  { id: 'capital', label: 'Capital', metric: 'HK$640M', color: '#f4bd72', detail: 'FY27 envelope, stage-gate capital allocation, portfolio mix and a disciplined P&L.' },
  { id: 'delivery', label: 'Delivery', metric: '96% on time', color: '#51d6ff', detail: 'Recover Kai Tak Twin Phase 2 and Kowloon East handover; make stage gates predictable.' },
  { id: 'ai', label: 'AI & twin', metric: '90% coverage', color: '#a991ff', detail: 'Move from dashboards to decision services: twin, agents, governed models and measurable baselines.' },
  { id: 'people', label: 'People', metric: '5 / 5 roles', color: '#ff9f43', detail: 'Design the executive team, decision rights, succession and a high-performance operating rhythm.' },
];

const STRENGTHS = [
  { icon: Sparkles, title: 'AI & data platforms', text: 'Turn fragmented data into governed products, decision services and measurable operating outcomes.' },
  { icon: Cloud, title: 'Cloud & architecture', text: 'Design resilient, interoperable platforms with explicit ownership, unit economics and exit paths.' },
  { icon: ShieldCheck, title: 'Cyber & resilience', text: 'Treat identity, segmentation, privacy and recovery as design requirements rather than late reviews.' },
  { icon: Workflow, title: 'Transformation delivery', text: 'Run multi-workstream programmes with stage gates, named owners, and a bias to realised value.' },
];

const ALIGNMENT = [
  { req: '15+ years in construction technology, BIM, civil/structural or PropTech', evidence: 'Adjacent enterprise technology, digital platforms, AI/data and transformation leadership. Built-environment fluency is a deliberate ramp, not a claimed tenure.', status: 'Adjacent' },
  { req: 'At least 5 years in an executive capacity', evidence: 'Executive-scope transformation and cross-functional leadership; formal title and reporting line to be confirmed in process.', status: 'Validate' },
  { req: 'Master’s or PhD; professional chartership valued', evidence: 'Technical depth across cloud architecture, data/AI and cybersecurity; formal qualifications to be evidenced.', status: 'Validate' },
  { req: 'Strategic thinking, communication, stakeholder management', evidence: 'Operating model design, board-ready communication, negotiation across clients, partners and delivery teams.', status: 'Strong' },
  { req: 'P&L and operational accountability', evidence: 'Commercial discipline, delivery economics, forecasting and capital allocation; ready to own a portfolio P&L.', status: 'Strong' },
  { req: 'AI, BIM/GIS and digital workflows', evidence: 'AI and data platform depth; BIM/GIS/twin fluency demonstrated through this working platform and a structured domain plan.', status: 'Adjacent' },
  { req: 'Build and mentor a high-calibre executive team', evidence: 'Team design, decision rights, coaching and succession; evidence of scaled teams to be discussed.', status: 'Strong' },
  { req: 'Fluent English; Cantonese and Putonghua a plus', evidence: 'Working English. Additional language proficiency to be confirmed directly — no claim is made here.', status: 'Confirm' },
];

const PHASES = [
  {
    range: 'Days 0–30', title: 'Listen, baseline, stabilise', color: '#45c4f5',
    items: ['30 structured stakeholder interviews — clients, partners, exec team, site teams', 'Portfolio deep-dive: margin, cash, delivery health, contract risk', 'Technical estate assessment: twin, BIM/GIS, integrations, cyber', 'Establish weekly exception review and decision log'],
    output: '“State of the business” memo · risk register · 90-day scorecard baseline',
  },
  {
    range: 'Days 31–60', title: 'Choose, align, resource', color: '#3ee0a1',
    items: ['Strategy on a page: three growth bets, two stop-doing decisions', 'Operating model and decision rights with the Founder/CEO', 'FY27 capital envelope, hiring plan and partner strategy', 'Twin and AI roadmap tied to named use cases and baselines'],
    output: '3-year plan · FY27 budget · executive team design · top-5 risk treatments',
  },
  {
    range: 'Days 61–90', title: 'Execute, prove, institutionalise', color: '#a78bfa',
    items: ['Close Kai Tak Twin Phase 2 gate and KE handover recovery', 'Resolve TKO capacity decision with CLP and the JV', 'Launch monthly operating review and quarterly board pack', 'Prove two value cases with independently measured baselines'],
    output: 'First 90-day scorecard · twin coverage 85% · margin and delivery recovery',
  },
];

const OUTCOMES = [
  { metric: '+250 bps', label: 'EBITDA margin', note: 'portfolio mix and delivery discipline' },
  { metric: '96%', label: 'Delivery on-time', note: 'stage-gate predictability' },
  { metric: '−15%', label: 'Energy intensity', note: 'against 2026 baseline' },
  { metric: '90%', label: 'Twin coverage', note: 'of managed GFA' },
  { metric: '5 / 5', label: 'Executive team', note: 'critical roles covered' },
  { metric: '100%', label: 'Ledger attestation', note: 'assets and carbon' },
];

const KEYWORDS = [
  {
    group: 'Evidenced',
    tone: 'green' as const,
    items: ['Executive leadership', 'Strategic planning', 'P&L accountability', 'Stakeholder management', 'Digital transformation', 'AI', 'Cloud architecture', 'Cybersecurity', 'Programme delivery', 'Operating model', 'Commercial negotiation', 'Public speaking'],
  },
  {
    group: 'Adjacent / ramp',
    tone: 'amber' as const,
    items: ['Construction technology', 'BIM', 'GIS', 'Digital twins', 'PropTech', 'Smart cities', 'Sustainability', 'Digital workflows', 'ISO 19650', 'IFC'],
  },
  {
    group: 'To confirm',
    tone: 'cyan' as const,
    items: ['Master’s / PhD', 'Professional chartership', 'Cantonese', 'Putonghua', '15+ years built environment'],
  },
];

const PITCH = 'I build operating systems for technology-led businesses: clear strategy, disciplined capital, predictable delivery and teams that own outcomes. Ophylla needs a COO who can turn a portfolio of smart-city assets into one legible, measurable and trusted operating platform. That is the work I do — and this platform is the demonstration.';

export function ExecutiveBrief() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [pillar, setPillar] = useState('strategy');
  const activePillar = EXEC_PILLARS.find((p) => p.id === pillar) ?? EXEC_PILLARS[0];

  const copyPitch = () => {
    navigator.clipboard?.writeText(PITCH).then(() => {
      setCopied(true);
      toast('60-second pitch copied', 'Paste into an email, cover letter or interview brief.', 'success');
      window.setTimeout(() => setCopied(false), 2500);
    }).catch(() => toast('Clipboard blocked', 'Select and copy the pitch directly from the page.', 'warning'));
  };

  const downloadKeywords = () => {
    downloadFile('ophylla_ats_keyword_map.csv', toCsv(KEYWORDS.flatMap((g) => g.items.map((k) => ({ keyword: k, status: g.group, note: g.group === 'To confirm' ? 'Not claimed — verify before submission' : g.group === 'Adjacent / ramp' ? 'Transferable evidence + development plan' : 'Demonstrated evidence' })))), 'text/csv');
    toast('ATS keyword map exported', '18 JD keywords mapped to evidence status. Use it to tailor the final CV.', 'success');
  };

  return (
    <div className="print-brief page-enter mx-auto max-w-[1400px] space-y-5">
      <div className="no-print">
        <SectionHeader
          eyebrow="Executive brief · candidate perspective"
          title={t('brief.title', 'The operating case for T. Lau.')}
          description={t('brief.desc', 'For the role of Chief Operating Officer — Smart Cities & Innovation, Ophylla Ventures. A candid, evidence-led positioning: what transfers, what to build, and how I would start.')}
          action={
            <>
              <Button variant="ghost" onClick={copyPitch}>{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : '60-second pitch'}</Button>
              <Button variant="secondary" onClick={downloadKeywords}><Download size={13} /> ATS map</Button>
              <Button variant="primary" onClick={() => window.print()}><Printer size={13} /> {t('common.print', 'Print / save PDF')}</Button>
            </>
          }
        />
      </div>

      <section className="panel no-print overflow-hidden">
        <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-12">
          <div className="dark-surface relative h-[300px] overflow-hidden rounded-lg border border-[var(--line)] xl:col-span-8">
            <ExecutiveBoardroomScene pillars={EXEC_PILLARS} selectedId={pillar} onSelect={setPillar} />
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-[var(--line)] bg-[#061016]/75 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.13em] text-[var(--dim)] backdrop-blur">COO decision room · click a pillar · drag to orbit</div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-[var(--line)] bg-white/[.012] p-4 xl:col-span-4">
            <div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-mono text-[7px] uppercase tracking-wider" style={{ color: activePillar.color }}>{activePillar.label}</span><Badge tone="green">mandate</Badge></div>
              <h3 className="mt-2 font-display text-[17px] text-white">{activePillar.metric}</h3>
              <p className="mt-1 text-[8.5px] leading-relaxed text-[var(--muted)]">{activePillar.detail}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {EXEC_PILLARS.map((p) => (
                <button key={p.id} onClick={() => setPillar(p.id)} className={cn('flex items-center gap-1.5 rounded border px-2 py-1 text-left font-mono text-[7px]', pillar === p.id ? 'border-[var(--line-2)] bg-white/[.04] text-white' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{p.label}</button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[7.5px] text-[var(--dim)]"><ShieldCheck size={9} className="text-[var(--accent)]" /> Evidence-led; no claim beyond the brief.</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <aside className="xl:col-span-4">
          <div className="panel sticky top-[76px] overflow-hidden">
            <div className="relative border-b border-[var(--line)] px-5 pb-5 pt-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(62,224,161,.13),transparent_60%)]" />
              <div className="relative flex items-start gap-4">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[rgba(62,224,161,.3)] bg-gradient-to-br from-[#173a32] to-[#0a1614]">
                  <span className="font-display text-[20px] tracking-[0.08em] text-[#b8ffdf]">TL</span>
                  <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-[#0b1219] bg-[var(--accent)]"><Check size={10} className="text-[#032018]" /></span>
                </div>
                <div className="min-w-0 pt-1">
                  <h2 className="font-display text-[20px] text-white">T. Lau</h2>
                  <div className="mt-1 text-[10.5px] leading-snug text-[var(--muted)]">Chief Operating Officer<br />Smart Cities & Innovation</div>
                  <div className="mt-2 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]"><MapPin size={9} /> Hong Kong SAR</div>
                </div>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-1.5">
                {['AI & data', 'Cloud', 'Cyber', 'Transformation', 'P&L'].map((t) => (
                  <span key={t} className="rounded-full border border-[var(--line)] bg-white/[.03] px-2 py-0.5 text-[8.5px] text-[var(--muted)]">{t}</span>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[8px]">Role alignment</span>
                <span className="font-mono text-[8px] text-[var(--dim)]">8 dimensions</span>
              </div>
              <div className="space-y-2">
                {[
                  { l: 'Direct evidence', v: 4, c: 'var(--accent)' },
                  { l: 'Transferable evidence', v: 3, c: 'var(--amber)' },
                  { l: 'To confirm / ramp', v: 1, c: 'var(--cyan)' },
                ].map((x) => (
                  <div key={x.l}>
                    <div className="mb-1 flex items-center justify-between text-[9px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#cfdae4]">{x.v}/8</span></div>
                    <Progress value={(x.v / 8) * 100} color={x.c} height={3} />
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[rgba(245,183,72,.18)] bg-[rgba(245,183,72,.04)] p-2.5">
                <div className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-wider text-[var(--amber)]"><Award size={9} /> Integrity position</div>
                <p className="mt-1 text-[8.5px] leading-relaxed text-[#d9c9a8]">No claim is made to 15+ years in BIM or construction, or to five years in a qualifying executive title. The case rests on transferable strength and a credible domain ramp.</p>
              </div>

              <div className="space-y-1.5 border-t border-[var(--line)] pt-3">
                <button onClick={() => window.print()} className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-[9.5px] text-[var(--muted)] hover:text-white"><span className="flex items-center gap-2"><FileText size={11} /> One-page executive brief</span><span className="font-mono text-[7.5px] text-[var(--dim)]">PDF</span></button>
                <button onClick={downloadKeywords} className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-[9.5px] text-[var(--muted)] hover:text-white"><span className="flex items-center gap-2"><Download size={11} /> ATS keyword map</span><span className="font-mono text-[7.5px] text-[var(--dim)]">CSV</span></button>
                <button onClick={() => navigate('/architecture')} className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-[9.5px] text-[var(--muted)] hover:text-white"><span className="flex items-center gap-2"><Layers size={11} /> Platform architecture</span><span className="font-mono text-[7.5px] text-[var(--dim)]">View</span></button>
                <button onClick={() => navigate('/twin')} className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-[9.5px] text-[var(--muted)] hover:text-white"><span className="flex items-center gap-2"><Building2 size={11} /> Working twin demo</span><span className="font-mono text-[7.5px] text-[var(--dim)]">Live</span></button>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-4 xl:col-span-8">
          <section className="panel relative overflow-hidden p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(62,224,161,.1),transparent_70%)]" />
            <Quote size={20} className="text-[rgba(62,224,161,.4)]" />
            <blockquote className="mt-3 max-w-2xl font-display text-[19px] leading-[1.4] tracking-[-0.02em] text-[#e8f2f8]">
              The mandate is not to add more technology. It is to make the portfolio legible, the delivery predictable and the growth repeatable.
            </blockquote>
            <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-[var(--muted)]">
              Ophylla is assembling a smart-city operating business at the moment when digital capability becomes the differentiator. The COO role is the hinge: converting the Founder/CEO’s ambition into a disciplined operating system, with technology as the enabler rather than the exhibit. My contribution is an operating model that connects strategy, capital, delivery, data and trust — and the judgement to know which initiatives to stop.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-4">
              {[
                { n: '01', t: 'Legibility', d: 'One picture of assets, margin, risk and delivery.' },
                { n: '02', t: 'Predictability', d: 'Stage gates, unit economics and early warning.' },
                { n: '03', t: 'Compounding', d: 'Reusable platforms and repeatable commercial offers.' },
              ].map((x) => (
                <div key={x.n}>
                  <div className="font-mono text-[8px] text-[var(--accent)]">{x.n}</div>
                  <div className="mt-1 text-[11px] font-medium text-white">{x.t}</div>
                  <div className="mt-0.5 text-[8.5px] leading-relaxed text-[var(--dim)]">{x.d}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            {STRENGTHS.map((s) => (
              <div key={s.title} className="panel p-4">
                <div className="flex items-center gap-2"><s.icon size={14} className="text-[var(--accent)]" /><span className="text-[10.5px] font-medium text-[#dbe5ee]">{s.title}</span></div>
                <p className="mt-2 text-[9px] leading-relaxed text-[var(--muted)]">{s.text}</p>
              </div>
            ))}
          </div>

          <Panel eyebrow="Role alignment" title="Requirement by requirement" action={<Badge tone="neutral">Candid mapping</Badge>} bodyClassName="!px-0 !pb-0">
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Requirement</th><th>Evidence</th><th>Status</th></tr></thead>
                <tbody>
                  {ALIGNMENT.map((a) => (
                    <tr key={a.req}>
                      <td className="w-[30%]"><span className="text-[9.5px] leading-snug text-[#dbe5ee]">{a.req}</span></td>
                      <td><span className="text-[8.5px] leading-relaxed text-[var(--muted)]">{a.evidence}</span></td>
                      <td>
                        <span className={cn('badge', a.status === 'Strong' ? 'badge-green' : a.status === 'Adjacent' ? 'badge-amber' : 'badge-cyan')}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] px-4 py-2.5">
              <CheckCircle2 size={11} className="text-[var(--accent)]" />
              <span className="text-[8.5px] text-[var(--dim)]">Direct claims are matched to evidence; everything else is labelled as adjacent, to validate, or to confirm.</span>
            </div>
          </Panel>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div><div className="eyebrow mb-0.5">First 90 days</div><div className="font-display text-[13px] text-white">A plan built for evidence, not theatre</div></div>
              <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">Listen → choose → prove</span>
            </div>
            <div className="p-4">
              <div className="relative space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-[var(--line-2)]">
                {PHASES.map((p) => (
                  <div key={p.range} className="relative pl-7">
                    <span className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-[#0a1017]" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}66` }} />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.12em]" style={{ color: p.color }}>{p.range}</span>
                      <span className="text-[10.5px] font-medium text-white">{p.title}</span>
                    </div>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {p.items.map((i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[8.5px] leading-relaxed text-[var(--muted)]">
                          <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full" style={{ background: p.color }} /> {i}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 rounded border border-[var(--line)] bg-white/[.018] px-2.5 py-1.5 text-[8px] text-[var(--dim)]">
                      <span className="font-mono uppercase tracking-wider text-[7px]">Deliverable</span> · {p.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Panel eyebrow="Year one" title="Outcomes I would commit to" action={<span className="font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">Targets, not forecasts</span>}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {OUTCOMES.map((o) => (
                <div key={o.label} className="rounded-lg border border-[var(--line)] bg-white/[.015] p-3">
                  <div className="num text-[20px] text-[var(--accent)]">{o.metric}</div>
                  <div className="mt-1 text-[9.5px] text-[#dbe5ee]">{o.label}</div>
                  <div className="mt-0.5 text-[8px] text-[var(--dim)]">{o.note}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="ATS & narrative" title="Keyword map with integrity" action={<Button size="sm" variant="ghost" onClick={downloadKeywords}><Download size={11} /> CSV</Button>}>
          <p className="text-[9.5px] leading-relaxed text-[var(--muted)]">
            Applicant tracking rewards specificity. This map separates what can be evidenced today from what must be built or confirmed — so the final CV and cover letter can be tailored without overstating the record.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {KEYWORDS.map((g) => (
              <div key={g.group} className="rounded-lg border border-[var(--line)] bg-black/15 p-3">
                <div className="flex items-center gap-1.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full', g.tone === 'green' ? 'bg-[var(--accent)]' : g.tone === 'amber' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]')} />
                  <span className="font-mono text-[8px] uppercase tracking-wider text-[#cfdae4]">{g.group}</span>
                  <span className="ml-auto font-mono text-[8px] text-[var(--dim)]">{g.items.length}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {g.items.map((k) => (
                    <span key={k} className={cn('rounded border px-1.5 py-0.5 text-[7.5px]',
                      g.tone === 'green' ? 'border-[rgba(62,224,161,.18)] text-[#9aefce]' : g.tone === 'amber' ? 'border-[rgba(245,183,72,.18)] text-[#fbd38d]' : 'border-[rgba(69,196,245,.18)] text-[#83d8fb]')}>{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white/[.015] p-2.5">
            <Target size={12} className="text-[var(--accent)]" />
            <span className="text-[8.5px] text-[var(--muted)]">Suggested framing: <span className="text-[#dbe5ee]">“Technology executive with platform, AI and transformation depth, building built-environment fluency and ready to own portfolio P&L.”</span></span>
          </div>
        </Panel>

        <Panel className="xl:col-span-5" eyebrow="Interview narrative" title="Three sentences that carry the case" action={<Button size="sm" variant="ghost" onClick={copyPitch}>{copied ? <Check size={11} /> : <Clipboard size={11} />} Copy</Button>}>
          <div className="space-y-3">
            {[
              { n: '01', text: '“I turn fragmented asset and delivery data into one operating system — so the executive team can see margin, risk and value in the same place.”' },
              { n: '02', text: '“I run a disciplined portfolio: stage gates, unit economics and cash. Technology earns its place by changing a decision or a cost line.”' },
              { n: '03', text: '“I build senior teams that can say no, own outcomes and raise the standard — and I stay close enough to the work to know when they are right.”' },
            ].map((x) => (
              <div key={x.n} className="flex gap-3">
                <span className="font-mono text-[8px] text-[var(--accent)]">{x.n}</span>
                <p className="text-[9.5px] leading-relaxed text-[#c7d4df]">{x.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[var(--line)] pt-3">
            <div className="eyebrow mb-2">Why Ophylla</div>
            <div className="space-y-1.5">
              {['A portfolio with real assets and real operating problems — not a concept.', 'A mandate to build the operating system, not just run one function.', 'A Founder/CEO partnership where commercial and technical judgement must meet.'].map((t) => (
                <div key={t} className="flex items-start gap-1.5 text-[8.5px] text-[var(--muted)]"><ArrowRight size={9} className="mt-0.5 shrink-0 text-[var(--accent)]" /> {t}</div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="eyebrow mb-1">Demonstration, not decoration</div>
          <p className="text-[10px] text-[var(--muted)]">This platform is a working sample of the operating system described above. Every module is a live, interactive prototype.</p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="secondary" size="sm" onClick={() => navigate('/twin')}>Explore the twin <ArrowUpRight size={11} /></Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={11} /> Save brief</Button>
        </div>
      </div>

      <p className="pb-2 text-center text-[8px] leading-relaxed text-[var(--dim)]">
        Prepared as a candidate perspective for discussion. No confidential Ophylla information has been used; portfolio figures in this demo are illustrative.
      </p>
    </div>
  );
}
