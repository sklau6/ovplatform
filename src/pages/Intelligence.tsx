import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Bot, Check, CheckCircle2, ChevronRight, CircleDot, Cpu, Database,
  Gauge, Info, Loader2, Lock, MessageSquare, Radar, Send, ShieldCheck, Sparkles, ThumbsDown,
  ThumbsUp, TrendingDown, User, Zap, AlertTriangle, Activity, Layers, RefreshCw, SlidersHorizontal,
} from 'lucide-react';
import { AreaChart, ProgressRing } from '../components/charts';
import { IntelligenceGraphScene } from '../components/IntelligenceGraphScene';
import { GRAPH_NODES, GRAPH_TYPE_META } from '../lib/intelligenceGraphData';
import { Badge, Button, LiveTag, Panel, Progress, SectionHeader } from '../components/ui';
import { ANOMALIES, ASSETS, MODELS, PROJECTS } from '../lib/data';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn, series } from '../lib/utils';

interface ChatTable { cols: string[]; rows: Array<Array<string>> }
interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text?: string;
  metrics?: Array<{ label: string; value: string; sub?: string }>;
  table?: ChatTable;
  actions?: string[];
  source?: string;
  confidence?: number;
  time: string;
}

const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Hong_Kong' });

const SUGGESTIONS = [
  'Which assets are most exposed to energy-cost overrun?',
  'What is at risk in delivery this quarter?',
  'Draft a board-level operating summary.',
  'Where can we retire carbon credits?',
];

const FAILURE_PREDICTED = series(211, 16, 34, 2.4, 1.6, 0);
const FAILURE_MITIGATED = series(212, 16, 31, 1.4, 0.15, 0);

function buildAnswer(q: string): Omit<ChatMessage, 'id' | 'role' | 'time'> {
  const lower = q.toLowerCase();
  if (lower.includes('energy') || lower.includes('cost') || lower.includes('kwh') || lower.includes('utility')) {
    const top = [...ASSETS].sort((a, b) => b.energy * b.gfa - a.energy * a.gfa).slice(0, 3);
    return {
      text: 'Three assets concentrate 46% of the portfolio’s energy cost variance. The exposure is driven by tariff timing and refrigeration load, not weather — intervention now avoids the Q4 demand-charge step.',
      table: {
        cols: ['Asset', 'Intensity', 'Exposure', 'Lever'],
        rows: top.map((a) => [a.name, `${a.energy} kWh/m²`, `HK$${(a.energy * a.gfa / 180000).toFixed(1)}M`, a.id === 'CH-03' ? 'Retrofit' : a.id === 'TKO-01' ? 'Setpoint' : 'Peak shave']),
      },
      metrics: [
        { label: 'Identified savings', value: 'HK$4.8M', sub: 'annualised' },
        { label: 'Payback', value: '2.7 yrs', sub: 'staged retrofit' },
      ],
      actions: ['Approve dispatch plan', 'Open investment case'],
      source: 'GridSense v4.0 · 18 months interval data · ledger #18,212',
      confidence: 91,
    };
  }
  if (lower.includes('delivery') || lower.includes('delay') || lower.includes('project') || lower.includes('risk')) {
    const atRisk = PROJECTS.filter((p) => p.rag !== 'green');
    return {
      text: 'Delivery is broadly controlled, but two workstreams sit outside tolerance. Kowloon East BIM handover is the only red: as-built model variance is consuming margin, and the recovery plan needs a COO decision by 31 October.',
      table: {
        cols: ['Project', 'Gate', 'Status', 'Next'],
        rows: atRisk.map((p) => [p.name, p.gate, p.rag.toUpperCase(), p.nextGate]),
      },
      metrics: [
        { label: 'On-time', value: '92.6%', sub: '-0.8 pts' },
        { label: 'Margin at risk', value: 'HK$7.2M', sub: '1 recovery plan' },
      ],
      actions: ['Open recovery plan', 'Convene gate review'],
      source: 'Portfolio register · stage-gate data · 22 Oct',
      confidence: 94,
    };
  }
  if (lower.includes('carbon') || lower.includes('credit') || lower.includes('emission') || lower.includes('sustain')) {
    return {
      text: 'The portfolio is 6.2% off the 2026 pathway. Retiring 4,200 verified credits closes the residual gap, but structural measures remain the better economic answer beyond 2027. Harbourview has 420 credits eligible for immediate retirement.',
      metrics: [
        { label: 'Pathway gap', value: '6.2%', sub: '≈ 4,200 tCO₂e' },
        { label: 'Credits held', value: '1,284', sub: '420 ready to retire' },
        { label: 'Abatement NPV', value: 'HK$18.6M', sub: 'structural measures' },
      ],
      actions: ['Retire 420 credits', 'Model structural pathway'],
      source: 'Carbon ledger · verified registry feed · assurance review pending',
      confidence: 87,
    };
  }
  if (lower.includes('board') || lower.includes('summary') || lower.includes('brief')) {
    return {
      text: 'Board narrative: growth is on plan, margin is expanding, and the energy programme is ahead of the 2026 pathway. Delivery is the soft spot. The single decision that matters is TKO grid capacity — it protects HK$186M of contracted expansion revenue.',
      metrics: [
        { label: 'Revenue', value: 'HK$1.06B', sub: '+8.4%' },
        { label: 'EBITDA margin', value: '24.8%', sub: '+1.3 pts' },
        { label: 'Pipeline', value: 'HK$2.4B', sub: '3.1× coverage' },
      ],
      actions: ['Generate board pre-read', 'Schedule decision session'],
      source: 'Consolidated portfolio · finance close 20 Oct · ledger attested',
      confidence: 96,
    };
  }
  if (lower.includes('blockchain') || lower.includes('ledger') || lower.includes('trust') || lower.includes('provenance')) {
    return {
      text: 'The trust ledger holds 18,212 blocks across 19 assets. Every model revision, handover pack and carbon retirement is anchored with a SHA-256 digest. Integrity verification of the last 60 days returned zero breaks.',
      metrics: [
        { label: 'Assets attested', value: '19 / 19', sub: '100%' },
        { label: 'Integrity', value: '100%', sub: '0 breaks' },
        { label: 'Avg anchor', value: '6 min', sub: 'batch cadence' },
      ],
      actions: ['Open ledger explorer', 'Anchor current snapshot'],
      source: 'Ophylla trust ledger · validator quorum 4/5',
      confidence: 99,
    };
  }
  return {
    text: 'I can reason across the live twin, the portfolio register, work-order history and the trust ledger. Ask me about energy, delivery risk, carbon, asset provenance or board-level decisions. For anything outside the evidence set, I will say so rather than infer.',
    metrics: [
      { label: 'Evidence domains', value: '6', sub: 'connected' },
      { label: 'Answers grounded', value: '100%', sub: 'with citations' },
    ],
    source: 'Ophylla Intelligence · retrieval-augmented over governed data products',
    confidence: 90,
  };
}

function TableBlock({ table }: { table: ChatTable }) {
  return (
    <div className="mt-2.5 overflow-x-auto rounded-lg border border-[var(--line)] bg-black/15">
      <table className="w-full text-left">
        <thead>
          <tr>{table.cols.map((c) => <th key={c} className="border-b border-[var(--line)] px-2.5 py-1.5 font-mono text-[7.5px] font-medium uppercase tracking-wider text-[var(--dim)]">{c}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--line)] last:border-0">
              {row.map((cell, j) => <td key={j} className={cn('px-2.5 py-1.5 text-[9.5px]', j === 0 ? 'text-[#dbe5ee]' : 'font-mono text-[var(--muted)]')}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="relative grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[rgba(62,224,161,.3)] bg-[rgba(62,224,161,.09)]">
      <Sparkles size={12} className="text-[var(--accent)]" />
      <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-[#0a1017] bg-[var(--accent)]" />
    </div>
  );
}

export function Intelligence() {
  const navigate = useNavigate();
  const { runScan, scan, toast } = useLive();
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1, role: 'assistant', time: '09:41',
      text: 'Good morning. I am grounded in the live twin, 1,284 sensor streams, 18 months of work orders and the attested trust ledger. I will show my confidence and sources on every answer.',
      source: 'Ophylla Intelligence · retrieval-augmented · no external inference', confidence: 98,
    },
    { id: 2, role: 'user', time: '09:42', text: 'Which assets carry the most energy-cost risk this quarter?' },
    {
      id: 3, role: 'assistant', time: '09:42',
      text: 'Three assets concentrate 46% of the portfolio’s energy-cost variance. Central Market is the clearest intervention: refrigeration load is 23% above its peer set and a staged retrofit pays back inside the current tariff cycle.',
      table: {
        cols: ['Asset', 'Intensity', 'Exposure', 'Lever'],
        rows: [
          ['Central Market Place', '112.3 kWh/m²', 'HK$4.2M', 'Retrofit'],
          ['TKO Data Centre', '118.6 kWh/m²', 'HK$3.9M', 'Setpoint'],
          ['Harbourview Residences', '88.9 kWh/m²', 'HK$2.8M', 'Peak shave'],
        ],
      },
      metrics: [{ label: 'Identified savings', value: 'HK$4.8M', sub: 'annualised' }, { label: 'Payback', value: '2.7 yrs', sub: 'staged retrofit' }],
      actions: ['Approve dispatch plan', 'Open investment case'],
      source: 'GridSense v4.0 · 18 months interval data · ledger #18,212', confidence: 91,
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [approved, setApproved] = useState<string[]>([]);
  const [graphNode, setGraphNode] = useState('atlas');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: q, time: nowTime() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    const timer = window.setTimeout(() => {
      const answer = buildAnswer(q);
      setMessages((m) => [...m, { ...answer, id: Date.now() + 1, role: 'assistant', time: nowTime() }]);
      setThinking(false);
    }, 1150);
    timers.current.push(timer);
  };

  const approve = (label: string) => {
    setApproved((a) => [...a, label]);
    toast('Approved', `${label} · sent to the operations desk for execution.`, 'success');
  };

  const selectedNode = GRAPH_NODES.find((n) => n.id === graphNode) ?? GRAPH_NODES[7];

  const optimisations = [
    { id: 'O-1', name: 'Coincident peak shaving', detail: 'Marina Central · Harbourview · Central Market', value: 2.1, confidence: 92, effort: 'Low', icon: Zap },
    { id: 'O-2', name: 'Chiller staging at KT-01', detail: 'Ophylla Kai Tak Tower I', value: 1.2, confidence: 88, effort: 'Low', icon: SlidersHorizontal },
    { id: 'O-3', name: 'Retro-commissioning', detail: 'Kowloon East Campus A + B', value: 0.8, confidence: 84, effort: 'Medium', icon: RefreshCw },
  ];

  return (
    <div className="page-enter mx-auto max-w-[1540px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-2">Intelligence · AI operations</div>
          <h1 className="display text-[28px] text-white">{t('intelligence.title', 'From signals to decisions.')}</h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)]">
            {t('intelligence.desc', 'A governed intelligence layer over the portfolio. Every recommendation is grounded, attributable and reversible.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 4 models live</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/architecture')}><Layers size={12} /> Model architecture</Button>
          <Button variant="primary" size="sm" onClick={runScan} disabled={scan === 'scanning'}>
            {scan === 'scanning' ? <Loader2 size={12} className="animate-spin" /> : <Radar size={12} />}
            {scan === 'scanning' ? 'Scanning…' : 'Run city scan'}
          </Button>
        </div>
      </div>

      <Panel className="overflow-hidden" eyebrow="3D decision graph" title="Signals, models, agents, decisions — one graph" action={<span className="font-mono text-[8px] text-[var(--dim)]">click a node · drag to orbit</span>}>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="dark-surface relative h-[330px] overflow-hidden rounded-lg border border-[var(--line)] xl:col-span-8">
            <IntelligenceGraphScene selectedId={graphNode} onSelect={setGraphNode} />
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded border border-[var(--line)] bg-[#061016]/72 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.13em] text-[var(--dim)] backdrop-blur"><span className="live-dot" /> governed graph · {GRAPH_NODES.length} nodes</div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-[var(--line)] bg-white/[.012] p-4 xl:col-span-4">
            <div>
              <span className="rounded px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.12em]" style={{ color: GRAPH_TYPE_META[selectedNode.type].color, border: `1px solid ${GRAPH_TYPE_META[selectedNode.type].color}44`, background: `${GRAPH_TYPE_META[selectedNode.type].color}0d` }}>{GRAPH_TYPE_META[selectedNode.type].label}</span>
              <h3 className="mt-2 font-display text-[17px] text-white">{selectedNode.label}</h3>
              <div className="mt-1 font-mono text-[8px] text-[var(--accent)]">{selectedNode.metric}</div>
              <p className="mt-2 text-[8.5px] leading-relaxed text-[var(--muted)]">{selectedNode.detail}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">{GRAPH_NODES.filter((n) => n.type === selectedNode.type && n.id !== selectedNode.id).slice(0, 3).map((n) => <button key={n.id} onClick={() => setGraphNode(n.id)} className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[6.5px] text-[var(--dim)] hover:text-white">{n.label}</button>)}</div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[7.5px] text-[var(--dim)]"><ShieldCheck size={9} className="text-[var(--accent)]" /> Human approval gate required before execution.</div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel flex h-[640px] flex-col overflow-hidden xl:col-span-8">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AssistantAvatar />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-white">Ophylla Intelligence</span>
                  <Badge tone="green">v4.2</Badge>
                </div>
                <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">Grounded · governed · auditor-ready</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-1.5 rounded-md border border-[var(--line)] px-2 py-1 font-mono text-[8px] text-[var(--dim)] sm:flex"><Lock size={9} /> HK data residency</span>
              <button onClick={() => setMessages(messages.slice(0, 1))} className="btn btn-ghost btn-icon btn-sm" aria-label="Clear conversation" title="New conversation"><RefreshCw size={12} /></button>
            </div>
          </div>

          <div ref={scrollRef} className="scroll-area flex-1 space-y-4 px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
                {m.role === 'assistant' ? <AssistantAvatar /> : (
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[var(--line-2)] bg-white/[.04] font-[10px] font-medium text-[var(--muted)]">TL</div>
                )}
                <div className={cn('max-w-[86%] sm:max-w-[78%]', m.role === 'user' && 'text-right')}>
                  <div className={cn('inline-block rounded-xl border px-3.5 py-2.5 text-left',
                    m.role === 'user'
                      ? 'rounded-tr-sm border-[rgba(62,224,161,.18)] bg-[rgba(62,224,161,.07)]'
                      : 'rounded-tl-sm border-[var(--line)] bg-white/[.022]')}>
                    {m.text && <p className="text-[11.5px] leading-relaxed text-[#d5e1eb]">{m.text}</p>}
                    {m.metrics && (
                      <div className="mt-2.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(3, m.metrics.length)}, minmax(0, 1fr))` }}>
                        {m.metrics.map((x) => (
                          <div key={x.label} className="rounded-md border border-[var(--line)] bg-black/20 px-2 py-1.5">
                            <div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">{x.label}</div>
                            <div className="num mt-0.5 text-[14px] text-white">{x.value}</div>
                            {x.sub && <div className="text-[7.5px] text-[var(--dim)]">{x.sub}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {m.table && <TableBlock table={m.table} />}
                    {m.actions && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {m.actions.map((a) => (
                          <button key={a} onClick={() => (a.includes('Approve') ? approve(a) : toast('Action queued', `${a} · added to the COO decision queue.`, 'info'))} className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] transition-colors',
                            approved.includes(a) ? 'border-[rgba(62,224,161,.4)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line-2)] text-[#cfdae4] hover:border-[rgba(62,224,161,.4)] hover:text-white')}>
                            {approved.includes(a) ? <Check size={9} /> : <ArrowUpRight size={9} />} {approved.includes(a) ? 'Approved' : a}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={cn('mt-1.5 flex items-center gap-2', m.role === 'user' ? 'justify-end' : '')}>
                    <span className="font-mono text-[7.5px] text-[var(--dim)]">{m.time}</span>
                    {m.confidence && <span className="font-mono text-[7.5px] text-[var(--dim)]">· {m.confidence}% confidence</span>}
                    {m.role === 'assistant' && (
                      <span className="flex items-center gap-1 opacity-60">
                        <button className="text-[var(--dim)] hover:text-white" aria-label="Helpful"><ThumbsUp size={9} /></button>
                        <button className="text-[var(--dim)] hover:text-white" aria-label="Not helpful"><ThumbsDown size={9} /></button>
                      </span>
                    )}
                  </div>
                  {m.source && <div className="mt-0.5 flex items-start gap-1 font-mono text-[7.5px] leading-relaxed text-[var(--dim)]"><Database size={8} className="mt-[2px] shrink-0" /> {m.source}</div>}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-2.5">
                <AssistantAvatar />
                <div className="rounded-xl rounded-tl-sm border border-[var(--line)] bg-white/[.022] px-3.5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
                    <span className="ml-1.5 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">Reasoning over governed evidence</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--line)] p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-[var(--line)] bg-white/[.02] px-2.5 py-1 text-[9px] text-[var(--muted)] transition-colors hover:border-[rgba(62,224,161,.3)] hover:text-[#dbe5ee]">{s}</button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-xl border border-[var(--line-2)] bg-black/25 p-1.5 focus-within:border-[rgba(62,224,161,.4)]">
              <button className="btn btn-ghost btn-icon btn-sm" aria-label="Scope" title="Scope: portfolio"><SlidersHorizontal size={13} /></button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about the portfolio, an asset or a decision…"
                className="h-8 flex-1 bg-transparent text-[11.5px] text-white outline-none placeholder:text-[var(--dim)]"
              />
              <span className="hidden font-mono text-[8px] text-[var(--dim)] sm:inline">ENTER ↵</span>
              <button onClick={() => send(input)} disabled={!input.trim() || thinking} className="btn btn-primary btn-icon btn-sm" aria-label="Send"><Send size={12} /></button>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[7.5px] text-[var(--dim)]">
              <span className="flex items-center gap-1"><ShieldCheck size={8} /> Human approves every write · recommendations are reversible</span>
              <span>Scope: 19 assets · 6 districts</span>
            </div>
          </div>
        </section>

        <div className="space-y-4 xl:col-span-4">
          <Panel eyebrow="Model registry" title="Production intelligence" action={<Badge tone="green">4 live</Badge>} bodyClassName="!px-3 !pb-3">
            <div className="space-y-2">
              {MODELS.map((m) => (
                <div key={m.id} className="rounded-lg border border-[var(--line)] bg-white/[.015] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={11} className="text-[var(--dim)]" />
                      <span className="text-[10.5px] font-medium text-[#dbe5ee]">{m.name}</span>
                      <span className="font-mono text-[8px] text-[var(--dim)]">{m.version}</span>
                    </div>
                    <span className={cn('badge',
                      m.status === 'production' ? 'badge-green' : m.status === 'shadow' ? 'badge-violet' : 'badge-amber')}>{m.status}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[8px] text-[var(--dim)]">
                    <span>{m.domain}</span>
                    <span>{m.accuracy.toFixed(1)}% acc · drift {m.drift}%</span>
                  </div>
                  <div className="mt-1.5 h-[2px] overflow-hidden rounded-full bg-white/[.06]">
                    <div className="h-full rounded-full" style={{ width: `${m.accuracy}%`, background: m.status === 'production' ? 'var(--accent)' : 'var(--violet)' }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast('Model registry', 'Full evaluation history and model cards are available to authorised reviewers.', 'info')} className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-[var(--line)] py-1.5 text-[9px] text-[var(--muted)] hover:text-white">
              Model cards & evaluations <ChevronRight size={10} />
            </button>
          </Panel>

          <Panel eyebrow="Guardrails" title="Governed by design" bodyClassName="!px-4 !pb-4">
            <div className="space-y-2">
              {[
                ['Human approval on all writes', 'No autonomous setpoint changes'],
                ['Evidence-linked answers', 'Every claim carries a source'],
                ['Data residency · Hong Kong', 'No cross-border inference'],
                ['PII redaction at ingestion', 'Tenant data excluded'],
                ['Evaluation gate before promotion', 'Shadow ≥ 4 weeks'],
                ['Rollback under 60 seconds', 'Model + workflow versioning'],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-start gap-2">
                  <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <div>
                    <div className="text-[9.5px] text-[#cfdae4]">{title}</div>
                    <div className="text-[8px] text-[var(--dim)]">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-[rgba(62,224,161,.15)] bg-[rgba(62,224,161,.03)] px-2.5 py-2">
              <span className="text-[9px] text-[var(--muted)]">Human-in-the-loop</span>
              <span className="flex items-center gap-1.5 font-mono text-[8.5px] text-[var(--accent)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> ENFORCED</span>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="Predictive maintenance" title="Failure risk · 90-day horizon" action={<span className="badge badge-green"><TrendingDown size={9} /> 38% avoided</span>}>
          <div className="flex items-end gap-5">
            <div>
              <div className="num text-[26px] text-white">61%</div>
              <div className="mt-0.5 text-[9.5px] text-[var(--dim)]">KE Campus A chiller · 18 months</div>
            </div>
            <div className="ml-auto text-right">
              <div className="num text-[16px] text-[var(--accent)]">HK$11.4M</div>
              <div className="text-[8.5px] text-[var(--dim)]">avoided replacement cost</div>
            </div>
          </div>
          <AreaChart
            height={190}
            className="mt-2"
            series={[
              { name: 'Unmitigated', color: '#fb7185', data: FAILURE_PREDICTED, dashed: true, fill: false },
              { name: 'With intervention', color: '#3ee0a1', data: FAILURE_MITIGATED },
            ]}
            yFormat={(n) => `${Math.round(n)}%`}
            labels={['W0', '', '', 'W4', '', '', 'W8', '', '', 'W12', '', '', 'W16']}
            xTicks={8}
            showLegend
          />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3">
            {[
              { l: 'Assets monitored', v: '1,284' },
              { l: 'High-risk', v: '7' },
              { l: 'Work orders avoided', v: '42' },
            ].map((s) => (
              <div key={s.l}><div className="text-[8px] uppercase tracking-wider text-[var(--dim)]">{s.l}</div><div className="num mt-0.5 text-[14px] text-white">{s.v}</div></div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-7" eyebrow="Anomaly engine" title="Signals needing a decision" action={<Button size="sm" variant="ghost" onClick={() => navigate('/twin?asset=KE-04')}>Inspect <ArrowRight size={10} /></Button>} bodyClassName="!px-0 !pb-0">
          <div className="table-wrap max-h-[320px] overflow-y-auto">
            <table className="table">
              <thead className="sticky top-0 bg-[#0a1017]">
                <tr><th>Asset</th><th>Signal</th><th>Deviation</th><th>Conf.</th><th>Savings</th><th /></tr>
              </thead>
              <tbody>
                {ANOMALIES.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={cn('h-1.5 w-1.5 rounded-full', a.severity === 'critical' ? 'bg-[var(--rose)]' : a.severity === 'warning' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]')} />
                        <div>
                          <div className="text-[10px] text-[#dbe5ee]">{a.asset}</div>
                          <div className="font-mono text-[8px] text-[var(--dim)]">{a.detected}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-[9.5px] text-[var(--muted)]">{a.signal}</span></td>
                    <td><span className="font-mono text-[9.5px] text-[var(--amber)]">{a.deviation}</span></td>
                    <td><span className="font-mono text-[9px] text-[var(--muted)]">{a.confidence}%</span></td>
                    <td><span className="font-mono text-[9.5px] text-[var(--accent)]">HK${a.savings}M</span></td>
                    <td>
                      <button onClick={() => navigate(`/twin?asset=${a.assetId}`)} className="btn btn-ghost btn-icon btn-sm" aria-label={`Inspect ${a.asset}`}><ArrowUpRight size={11} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="eyebrow">Optimisation queue</div>
            <span className="font-mono text-[8.5px] text-[var(--dim)]">Est. annual value HK$4.1M</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {optimisations.map((o) => (
              <div key={o.id} className="panel panel-hover flex flex-col p-4">
                <div className="flex items-center justify-between">
                  <div className="grid h-7 w-7 place-items-center rounded-md border border-[var(--line)] bg-white/[.02]"><o.icon size={13} className="text-[var(--accent)]" /></div>
                  <span className={cn('badge', o.effort === 'Low' ? 'badge-green' : 'badge-amber')}>{o.effort} effort</span>
                </div>
                <div className="mt-3 text-[11.5px] font-medium text-[#e6eef5]">{o.name}</div>
                <div className="mt-0.5 text-[9px] text-[var(--dim)]">{o.detail}</div>
                <div className="mt-3 flex items-end justify-between">
                  <div><div className="num text-[18px] text-[var(--accent)]">HK${o.value}M</div><div className="text-[8px] text-[var(--dim)]">annual · {o.confidence}% conf.</div></div>
                  <Button size="sm" variant={approved.includes(o.name) ? 'outline' : 'secondary'} onClick={() => !approved.includes(o.name) ? (setApproved((a) => [...a, o.name]), toast('Optimisation approved', `${o.name} · queued for controlled dispatch.`, 'success')) : undefined}>
                    {approved.includes(o.name) ? <><Check size={10} /> Queued</> : 'Approve'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Panel className="xl:col-span-4" eyebrow="Responsible AI" title="Trust metrics" action={<LiveTag label="Continuous" />}>
          <div className="flex items-center gap-4">
            <ProgressRing value={94.2} size={92} label="evaluation" />
            <div className="flex-1 space-y-2">
              {[
                ['Coverage of assets', '100%', 'var(--accent)'],
                ['Human overrides (30d)', '12', 'var(--cyan)'],
                ['Safety incidents', '0', 'var(--accent)'],
                ['Data freshness', '2s', 'var(--muted)'],
              ].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between text-[9.5px]">
                  <span className="text-[var(--dim)]">{l}</span><span className="font-mono" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-[var(--line)] bg-white/[.015] p-2.5 text-[9px] leading-relaxed text-[var(--muted)]">
            <Info size={10} className="mr-1 inline text-[var(--cyan)]" />
            All models are registered, versioned and evaluated against a held-out asset cohort. Shadow deployments run for a minimum of four weeks before any operational write.
          </div>
        </Panel>
      </div>
    </div>
  );
}
