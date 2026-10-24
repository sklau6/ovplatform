import { useState } from 'react';
import {
  ArrowDown, ArrowRight, Blocks, Box, CheckCircle2, ChevronRight, Cloud, Cpu, Database,
  FileText, Fingerprint, Globe2, Layers, Lock, Network, Server, ShieldCheck, Sparkles,
  Workflow, Zap, Braces, GitBranch, ScanLine, Users, Building2, Gauge, HardDrive, Radio,
} from 'lucide-react';
import { Badge, Button, LiveTag, Progress, Tabs } from '../components/ui';
import { ArchitectureStackScene } from '../components/ArchitectureStackScene';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

type Tab = 'reference' | 'integration' | 'governance';

const LAYERS = [
  {
    id: 'L5', n: '05', name: 'Decision & experience', icon: Users, color: '#3ee0a1',
    summary: 'Executive cockpit · operator workspace · tenant & public services',
    chips: ['Command center', 'Role-based workspaces', 'Public dashboards'],
    description: 'The surface where operating decisions are made. One executive picture, focused operator workflows and transparent tenant services — all reading from the same governed model.',
    guardrail: 'Every screen must answer a named decision or task. No orphan dashboards.',
    controls: ['Role-based access and delegation', 'Decision audit trail', 'Accessibility and multilingual service design'],
    signals: [['Executive adoption', '94%'], ['Time to decision', '−38%'], ['Service SLA', '94.2%']],
    tech: ['React', 'Design system', 'SSO / SCIM', 'WCAG 2.2 AA'],
  },
  {
    id: 'L4', n: '04', name: 'Applications & use cases', icon: Blocks, color: '#45c4f5',
    summary: 'Asset lifecycle · energy optimisation · work orders · carbon · planning',
    chips: ['Asset lifecycle', 'Energy & carbon', 'Work orders', 'Planning insights'],
    description: 'Productised use cases with an accountable business owner, a measurable baseline and a defined service boundary. Applications compose shared platform services rather than rebuilding them.',
    guardrail: 'No use case without a baseline, owner, adoption plan and exit criteria.',
    controls: ['Value and adoption gates', 'Reusable service catalog', 'Product lifecycle and deprecation policy'],
    signals: [['Use cases live', '14'], ['Benefit realised', 'HK$86M'], ['Adoption', '87%']],
    tech: ['Next.js', 'Workflow engine', 'Rules service', 'Event mesh'],
  },
  {
    id: 'L3', n: '03', name: 'Digital twin & analytics', icon: Box, color: '#a78bfa',
    summary: 'BIM + GIS context · 3D/4D/5D · simulation · AI/ML · digital workflows',
    chips: ['IFC 4.3', 'GIS / EPSG:2326', 'Digital twin', 'AI models'],
    description: 'A fit-for-purpose digital representation linked to live asset state and business processes. Analytics and AI turn that representation into forecasts, anomalies and optimisations with human oversight.',
    guardrail: 'Do not call a static 3D model a live twin. Specify update frequency, decisions supported and fidelity.',
    controls: ['Model governance and versioning', 'Evaluation and drift monitoring', 'Twin fidelity and calibration records'],
    signals: [['Twin coverage', '78% GFA'], ['Model accuracy', '94.2%'], ['Data freshness', '2s']],
    tech: ['IFC 4.3', '3D Tiles', 'OGC API', 'GridSense', 'TwinFM'],
  },
  {
    id: 'L2', n: '02', name: 'Integration & data services', icon: Network, color: '#f5b748',
    summary: 'API gateway · event streaming · IoT ingestion · master data · metadata',
    chips: ['API gateway', 'Event streaming', 'IoT ingestion', 'Master data', 'Lineage'],
    description: 'The connective tissue. Contracts, identifiers and lineage are explicit so that assets, spaces, locations and work orders have one authoritative source per domain.',
    guardrail: 'Define export, API and exit arrangements before procurement. Make ownership and failure recovery explicit.',
    controls: ['Data contracts and schema registry', 'Idempotency and replay', 'Lineage, observability and error budgets'],
    signals: [['Integrations', '42'], ['Event latency', '1.4s'], ['Schema coverage', '100%']],
    tech: ['Kafka', 'GraphQL', 'MQTT', 'dbt', 'OpenLineage'],
  },
  {
    id: 'L1', n: '01', name: 'Data & connectivity', icon: Database, color: '#fb7185',
    summary: 'IoT / OT · BIM / CAD · GIS · ERP / CAFM / CMMS · documents · external',
    chips: ['IoT / OT', 'BIM / CAD', 'GIS', 'ERP / CMMS', 'Documents'],
    description: 'The physical and enterprise estate as sources of record. Operational technology is segmented from IT, and every source carries an owner, classification and retention rule.',
    guardrail: 'Separate OT risk from ordinary IT. Control coordinate systems, positional accuracy and licensing.',
    controls: ['Source system registers', 'OT/IT segmentation', 'Data classification and retention'],
    signals: [['Sources', '26'], ['Sensors', '1,284'], ['OT zones', '4']],
    tech: ['BACnet', 'Modbus', 'PostGIS', 'Autodesk', 'SAP'],
  },
];

const GOVERNANCE = {
  id: 'L0', n: '00', name: 'Trust, security & governance', icon: ShieldCheck, color: '#7dd3fc',
  summary: 'Identity · privacy · cyber resilience · data quality · model governance · audit',
  description: 'Cross-cutting controls that make the platform trustworthy: identity and least privilege, privacy by design, cyber resilience, data quality, model governance and independent audit.',
  guardrail: 'Security, privacy, safety and data rights are design requirements — not late-stage reviews.',
  controls: ['Zero-trust identity and segmentation', 'Model risk and human oversight', 'Independent assurance and immutable audit'],
  signals: [['Audit findings', '0 high'], ['Uptime', '99.98%'], ['Attestations', '19/19']],
  tech: ['OIDC / mTLS', 'SIEM / SOC', 'ISO 27001', 'PDPO', 'EU AI Act ready'],
};

const FLOWS = [
  {
    title: 'Sources of record', icon: Database, color: '#fb7185',
    items: ['BIM / CDE · IFC', 'GIS · PostGIS', 'ERP · SAP', 'CAFM / CMMS', 'IoT / OT · MQTT', 'Contracts & documents'],
  },
  {
    title: 'Integration & ingestion', icon: Workflow, color: '#f5b748',
    items: ['API gateway', 'Event streaming', 'IoT normalisation', 'Master data management', 'Metadata & lineage'],
  },
  {
    title: 'Governed data products', icon: HardDrive, color: '#a78bfa',
    items: ['Asset master', 'Spatial model', 'Time series', 'Carbon ledger', 'Work-order history', 'Model registry'],
  },
  {
    title: 'Decision surfaces', icon: Gauge, color: '#3ee0a1',
    items: ['Executive cockpit', 'Digital twin', 'AI operations', 'Tenant services', 'Trust ledger', 'Partner APIs'],
  },
];

const CONTRACTS = [
  { domain: 'Asset & space', owner: 'Platform / ops', freshness: '15 min', sla: '99.5%', consumers: 'Twin · finance · CAFM' },
  { domain: 'Spatial', owner: 'Geospatial', freshness: 'Daily', sla: '99.9%', consumers: 'Map · planning · field' },
  { domain: 'Sensor time series', owner: 'OT / platform', freshness: '2 s', sla: '99.0%', consumers: 'AI · alarms · ESG' },
  { domain: 'Work orders', owner: 'Operations', freshness: '5 min', sla: '99.5%', consumers: 'Delivery · AI · ledger' },
  { domain: 'Carbon & credits', owner: 'Sustainability', freshness: 'Hourly', sla: '99.9%', consumers: 'Reporting · audit · registry' },
  { domain: 'Model & provenance', owner: 'AI governance', freshness: 'Per event', sla: '99.95%', consumers: 'Ledger · audit · twin' },
];

const NFRS = [
  ['Availability', '99.95% core · 99.9% analytics', 'Measured monthly; error budget owned by platform'],
  ['Recovery', 'RTO 1h · RPO 15min', 'Tested quarterly with tabletop and restore drill'],
  ['Latency', 'p95 < 400ms UI · < 2s twin sync', 'Instrumented at edge and API gateway'],
  ['Data freshness', '2s telemetry · 15min asset master', 'Visible in every consumer surface'],
  ['Security', 'Zero-trust · least privilege · mTLS', 'Annual pen test · continuous posture scan'],
  ['Privacy', 'PDPO · data residency Hong Kong', 'PII minimisation at ingestion'],
  ['AI governance', 'Human approval on writes', 'Evaluation, drift, rollback and model cards'],
  ['Cost', '< 18% of run-rate', 'Unit economics per asset and per sensor'],
];

const RACI = [
  ['Growth strategy', 'Founder / CEO', 'COO', 'Exec committee', 'Board'],
  ['Operating plan & P&L', 'COO', 'Finance', 'Functional leads', 'CEO'],
  ['Twin & platform roadmap', 'COO', 'CTO / platform', 'Product owners', 'Investment committee'],
  ['Model promotion', 'COO', 'AI governance', 'Model owner', 'Risk committee'],
  ['Asset handover (G4)', 'COO', 'Project director', 'Client + QA', 'Board if > HK$100M'],
  ['Trust ledger anchoring', 'Platform ops', 'AI governance', 'CFO', 'Audit committee'],
];

export function Architecture() {
  const { toast } = useLive();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('reference');
  const [selected, setSelected] = useState('L3');
  const active = [...LAYERS, GOVERNANCE].find((l) => l.id === selected) ?? LAYERS[2];

  return (
    <div className="page-enter mx-auto max-w-[1540px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-2">Platform architecture</div>
          <h1 className="display text-[28px] text-white">{t('architecture.title', 'Built to compound.')}</h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)]">
            {t('architecture.desc', 'A reference architecture that connects physical assets, governed data and executive decisions — with the controls that make it safe to scale.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Reference v2.4</span>
          <Button variant="secondary" size="sm" onClick={() => toast('Architecture pack', 'Reference architecture, ADRs and data contract templates queued for export.', 'info')}><FileText size={12} /> Architecture pack</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Platform uptime', v: '99.98%', s: 'trailing 90 days', icon: Server },
          { l: 'Twin coverage', v: '78%', s: 'of portfolio GFA', icon: Box },
          { l: 'Integrations', v: '42', s: 'contract-tested APIs', icon: Network },
          { l: 'Model assurance', v: '4 / 4', s: 'evaluated & registered', icon: ShieldCheck },
        ].map((s) => (
          <div key={s.l} className="panel flex items-center gap-3 px-4 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white/[.02]"><s.icon size={14} className="text-[var(--muted)]" /></div>
            <div><div className="text-[8px] uppercase tracking-wider text-[var(--dim)]">{s.l}</div><div className="num text-[16px] text-white">{s.v}</div><div className="text-[8px] text-[var(--dim)]">{s.s}</div></div>
          </div>
        ))}
      </div>

      <section className="panel overflow-hidden">
        <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-12">
          <div className="dark-surface relative h-[300px] overflow-hidden rounded-lg border border-[var(--line)] xl:col-span-8">
            <ArchitectureStackScene layers={[...LAYERS, GOVERNANCE]} selectedId={selected} onSelect={(id) => { setSelected(id); setTab('reference'); }} />
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-[var(--line)] bg-[#061016]/75 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.13em] text-[var(--dim)] backdrop-blur">L1 → L5 · click a layer · drag to orbit</div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-[var(--line)] bg-white/[.012] p-4 xl:col-span-4">
            <div>
              <div className="flex items-center gap-2"><span className="font-mono text-[7px] text-[var(--dim)]">{active.id}</span><Badge tone="green">layer</Badge></div>
              <h3 className="mt-1 font-display text-[17px] text-white">{active.name}</h3>
              <p className="mt-1 text-[8px] leading-relaxed text-[var(--muted)]">{active.summary}</p>
              <p className="mt-3 border-t border-[var(--line)] pt-2 text-[8px] leading-relaxed text-[var(--dim)]">{active.guardrail}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {LAYERS.map((l) => <button key={l.id} onClick={() => { setSelected(l.id); setTab('reference'); }} className={cn('flex items-center gap-1.5 rounded border px-2 py-1 text-left font-mono text-[7px]', selected === l.id ? 'border-[var(--line-2)] bg-white/[.04] text-white' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />{l.id} {l.name}</button>)}
              <button onClick={() => { setSelected(GOVERNANCE.id); setTab('reference'); }} className={cn('col-span-2 flex items-center gap-1.5 rounded border px-2 py-1 text-left font-mono text-[7px]', selected === GOVERNANCE.id ? 'border-[var(--line-2)] bg-white/[.04] text-white' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: GOVERNANCE.color }} />L0 {GOVERNANCE.name}</button>
            </div>
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'reference', label: 'Reference architecture' },
          { value: 'integration', label: 'Data & integration' },
          { value: 'governance', label: 'Governance, risk & NFRs' },
        ]}
      />

      {tab === 'reference' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="panel relative overflow-hidden p-4 xl:col-span-7">
            <div className="pointer-events-none absolute inset-0 app-grid opacity-40" />
            <div className="relative space-y-1.5">
              {LAYERS.map((layer, i) => {
                const isActive = selected === layer.id;
                return (
                  <div key={layer.id}>
                    <button
                      onClick={() => setSelected(layer.id)}
                      className={cn('group relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all',
                        isActive ? 'border-[rgba(62,224,161,.32)] bg-[rgba(62,224,161,.05)]' : 'border-[var(--line)] bg-white/[.018] hover:border-[var(--line-2)] hover:bg-white/[.03]')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex w-8 flex-col items-center">
                          <span className="font-mono text-[8px] text-[var(--dim)]">{layer.n}</span>
                          <span className="mt-1 h-8 w-px" style={{ background: `linear-gradient(180deg, ${layer.color}88, transparent)` }} />
                        </div>
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border" style={{ borderColor: `${layer.color}33`, background: `${layer.color}0e` }}>
                          <layer.icon size={16} style={{ color: layer.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-[#e6eef5]">{layer.name}</span>
                            {isActive && <span className="font-mono text-[7px] uppercase tracking-wider text-[var(--accent)]">viewing</span>}
                          </div>
                          <div className="mt-0.5 truncate text-[9px] text-[var(--dim)]">{layer.summary}</div>
                        </div>
                        <ChevronRight size={13} className={cn('shrink-0 transition-all', isActive ? 'text-[var(--accent)]' : 'text-[var(--dim)] group-hover:translate-x-0.5')} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1 pl-[76px]">
                        {layer.chips.map((c) => <span key={c} className="rounded border border-[var(--line)] bg-black/20 px-1.5 py-0.5 font-mono text-[7.5px] text-[var(--muted)]">{c}</span>)}
                      </div>
                    </button>
                    {i < LAYERS.length - 1 && (
                      <div className="flex h-4 items-center justify-center">
                        <ArrowDown size={11} className="text-[rgba(120,160,175,.35)]" />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-2 flex items-center justify-center gap-2">
                <ArrowDown size={11} className="text-[rgba(120,160,175,.35)]" />
                <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-[var(--dim)]">cross-cutting</span>
                <ArrowDown size={11} className="text-[rgba(120,160,175,.35)]" />
              </div>

              <button
                onClick={() => setSelected('L0')}
                className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                  selected === 'L0' ? 'border-[rgba(255,255,255,.22)] bg-white/[.05]' : 'border-[var(--line-2)] bg-white/[.025] hover:bg-white/[.045]')}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line-2)] bg-white/[.04]"><Lock size={15} className="text-[#dbe5ee]" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-[#e6eef5]">{GOVERNANCE.name}</div>
                  <div className="mt-0.5 truncate text-[9px] text-[var(--dim)]">{GOVERNANCE.summary}</div>
                </div>
                <ShieldCheck size={14} className="text-[var(--muted)]" />
              </button>
            </div>
          </section>

          <aside className="space-y-4 xl:col-span-5">
            <section className="panel overflow-hidden">
              <div className="relative border-b border-[var(--line)] px-5 pb-4 pt-5">
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 100% 0%, ${active.color}14, transparent 60%)` }} />
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border" style={{ borderColor: `${active.color}33`, background: `${active.color}0f` }}>
                    <active.icon size={18} style={{ color: active.color }} />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--dim)]">Layer {active.n}</div>
                    <h2 className="font-display text-[16px] text-white">{active.name}</h2>
                  </div>
                </div>
                <p className="mt-3 text-[10.5px] leading-relaxed text-[var(--muted)]">{active.description}</p>
              </div>
              <div className="p-5">
                <div className="rounded-lg border border-[rgba(245,183,72,.18)] bg-[rgba(245,183,72,.04)] p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-wider text-[var(--amber)]"><Lock size={9} /> Executive guardrail</div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-[#d9c9a8]">{active.guardrail}</p>
                </div>

                <div className="mt-4">
                  <div className="eyebrow mb-2">Controls</div>
                  <div className="space-y-1.5">
                    {active.controls.map((c) => (
                      <div key={c} className="flex items-start gap-2 text-[9.5px] text-[var(--muted)]">
                        <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-[var(--accent)]" /> {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {active.signals.map(([l, v]) => (
                    <div key={l} className="rounded-md border border-[var(--line)] bg-white/[.015] p-2">
                      <div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">{l}</div>
                      <div className="num mt-0.5 text-[13px] text-white">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="eyebrow mb-1.5">Reference technologies</div>
                  <div className="flex flex-wrap gap-1">
                    {active.tech.map((t) => <span key={t} className="rounded border border-[var(--line)] bg-black/20 px-1.5 py-0.5 font-mono text-[7.5px] text-[var(--muted)]">{t}</span>)}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel p-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[8.5px]">Architecture principles</span>
                <Badge tone="neutral">6</Badge>
              </div>
              <div className="mt-2 space-y-2">
                {[
                  'Open interfaces and portable data before procurement.',
                  'One authoritative source per data domain.',
                  'Context before complexity: the minimum twin that serves a decision.',
                  'Lifecycle security, segmentation and recovery tested.',
                  'Observability of freshness, latency, quality and cost.',
                  'Human-centred workflows with clear escalation paths.',
                ].map((p, i) => (
                  <div key={p} className="flex items-start gap-2 text-[9px] leading-relaxed text-[var(--muted)]">
                    <span className="font-mono text-[8px] text-[var(--accent)]">0{i + 1}</span> {p}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}

      {tab === 'integration' && (
        <div className="space-y-4">
          <section className="panel p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="eyebrow mb-1">Data flow</div>
                <div className="font-display text-[14px] text-white">Source to decision, with contracts at every boundary</div>
              </div>
              <LiveTag label="42 integrations healthy" />
            </div>
            <div className="grid gap-2 lg:grid-cols-4">
              {FLOWS.map((flow, i) => (
                <div key={flow.title} className="relative">
                  <div className="h-full rounded-xl border border-[var(--line)] bg-white/[.015] p-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-md border" style={{ borderColor: `${flow.color}33`, background: `${flow.color}0d` }}><flow.icon size={13} style={{ color: flow.color }} /></div>
                      <span className="text-[10.5px] font-medium text-[#dbe5ee]">{flow.title}</span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {flow.items.map((item) => (
                        <div key={item} className="flex items-center gap-1.5 rounded border border-[var(--line)] bg-black/15 px-2 py-1.5">
                          <span className="h-1 w-1 rounded-full" style={{ background: flow.color }} />
                          <span className="font-mono text-[8px] text-[var(--muted)]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {i < FLOWS.length - 1 && (
                    <div className="absolute -right-[9px] top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                      <div className="grid h-4 w-4 place-items-center rounded-full border border-[var(--line-2)] bg-[#080e14]"><ArrowRight size={9} className="text-[var(--dim)]" /></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--line)] pt-3 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Contract tested</span>
              <span>Event-driven</span><span>Idempotent writes</span><span>Lineage on every dataset</span>
              <span className="ml-auto">Retention aligned to PDPO</span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="panel overflow-hidden xl:col-span-7">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div><div className="eyebrow mb-0.5">Data products</div><div className="font-display text-[13px] text-white">Contracts & service levels</div></div>
                <Badge tone="green">Registered</Badge>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Domain</th><th>Owner</th><th>Freshness</th><th>Quality SLA</th><th>Consumers</th></tr></thead>
                  <tbody>
                    {CONTRACTS.map((c) => (
                      <tr key={c.domain}>
                        <td><span className="text-[10px] text-[#dbe5ee]">{c.domain}</span></td>
                        <td><span className="text-[9px] text-[var(--muted)]">{c.owner}</span></td>
                        <td><span className="font-mono text-[9px] text-[var(--accent)]">{c.freshness}</span></td>
                        <td><span className="font-mono text-[9px] text-[var(--muted)]">{c.sla}</span></td>
                        <td><span className="text-[8.5px] text-[var(--dim)]">{c.consumers}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel p-4 xl:col-span-5">
              <div className="eyebrow mb-2">Middleware posture</div>
              <div className="space-y-3">
                {[
                  { l: 'API contract coverage', v: 100, color: 'var(--accent)' },
                  { l: 'Datasets with lineage', v: 96, color: 'var(--cyan)' },
                  { l: 'Event replay tested', v: 100, color: 'var(--violet)' },
                  { l: 'Master data reconciled', v: 98.4, color: 'var(--amber)' },
                ].map((x) => (
                  <div key={x.l}>
                    <div className="mb-1 flex items-center justify-between text-[9px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#cfdae4]">{x.v}%</span></div>
                    <Progress value={x.v} color={x.color} height={3} />
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-[var(--line)] bg-white/[.015] p-3">
                <div className="flex items-center gap-1.5 text-[9px] text-[var(--muted)]"><GitBranch size={10} className="text-[var(--violet)]" /> Key architectural decisions</div>
                <div className="mt-2 space-y-2">
                  {[
                    ['ADR-014', 'IFC 4.3 as the authoritative model exchange'],
                    ['ADR-021', 'Event-driven twin updates, 2s target'],
                    ['ADR-029', 'Ledger anchors only digests, never raw data'],
                  ].map(([id, text]) => (
                    <div key={id} className="flex gap-2 text-[8.5px]"><span className="font-mono text-[var(--dim)]">{id}</span><span className="text-[var(--muted)]">{text}</span></div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'governance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="panel overflow-hidden xl:col-span-7">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div><div className="eyebrow mb-0.5">Non-functional requirements</div><div className="font-display text-[13px] text-white">What “good” means, measurably</div></div>
                <Badge tone="cyan">Reviewed quarterly</Badge>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Dimension</th><th>Target</th><th>Assurance</th></tr></thead>
                  <tbody>
                    {NFRS.map(([d, t, a]) => (
                      <tr key={d}><td><span className="text-[10px] text-[#dbe5ee]">{d}</span></td><td><span className="font-mono text-[9px] text-[var(--accent)]">{t}</span></td><td><span className="text-[8.5px] text-[var(--dim)]">{a}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel p-4 xl:col-span-5">
              <div className="eyebrow mb-2">Assurance & standards</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['ISO 19650', 'BIM information management'],
                  ['IFC 4.3', 'Open model exchange'],
                  ['OGC API', 'Spatial interoperability'],
                  ['ISO 27001', 'Information security'],
                  ['PDPO', 'HK data privacy'],
                  ['EU AI Act', 'AI readiness'],
                  ['SOC 2 II', 'Service controls'],
                  ['ISO 41001', 'Facility management'],
                ].map(([code, name]) => (
                  <div key={code} className="rounded-lg border border-[var(--line)] bg-white/[.015] p-2.5">
                    <div className="flex items-center gap-1.5 font-mono text-[8.5px] text-[#dbe5ee]"><ShieldCheck size={9} className="text-[var(--accent)]" /> {code}</div>
                    <div className="mt-0.5 text-[7.5px] text-[var(--dim)]">{name}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-[rgba(62,224,161,.15)] bg-[rgba(62,224,161,.03)] p-3">
                <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--muted)]">Independent assurance</span><span className="font-mono text-[var(--accent)]">Next · 12 Nov</span></div>
                <div className="mt-1.5 text-[8.5px] leading-relaxed text-[var(--dim)]">Cyber, model risk, data privacy and benefit realisation reviewed by external auditors. Evidence pack is ledger-anchored.</div>
              </div>
            </section>
          </div>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div><div className="eyebrow mb-0.5">Decision rights</div><div className="font-display text-[13px] text-white">Who decides what</div></div>
              <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">RACI · approved by board</span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Decision</th><th>Accountable</th><th>Responsible</th><th>Consulted</th><th>Informed</th></tr></thead>
                <tbody>
                  {RACI.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td key={i}><span className={cn('text-[9.5px]', i === 0 ? 'text-[#dbe5ee]' : 'text-[var(--muted)]')}>{cell}</span></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { icon: Fingerprint, title: 'Identity & privilege', text: 'SSO + SCIM, just-in-time elevation, quarterly access review. Break-glass actions are logged and reviewed.' },
              { icon: Radio, title: 'OT / IT convergence', text: 'Four segmented zones, unidirectional data diodes at the control boundary, safe-change procedures for field devices.' },
              { icon: Sparkles, title: 'Responsible AI', text: 'Model registry, evaluation gates, drift alerts, human approval on writes, rollback in under 60 seconds.' },
            ].map((c) => (
              <div key={c.title} className="panel p-4">
                <div className="flex items-center gap-2"><c.icon size={13} className="text-[var(--accent)]" /><span className="text-[10.5px] text-[#dbe5ee]">{c.title}</span></div>
                <p className="mt-2 text-[9px] leading-relaxed text-[var(--muted)]">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
