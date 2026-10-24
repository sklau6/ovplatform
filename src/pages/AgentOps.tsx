import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Bot, CheckCircle2, ChevronRight, CircleDot, Clock3, Command, Gauge,
  Network, Pause, Play, ShieldCheck, Sparkles, Users, Workflow,
} from 'lucide-react';
import { AgentScene } from '../components/AgentScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  AGENTS, COMPANY_FUNCTIONS, COO_CADENCE, ORCHESTRATION_STEPS,
  type AgentStatus, type OrchestrationStep,
} from '../lib/platformData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

type RunState = 'idle' | 'running' | 'paused' | 'complete';
type LogEntry = { status: 'complete' | 'pending'; output: string };

const GATES = [
  { stepId: 'S2', title: 'KE handover recovery plan', owner: 'KEYSTONE', impact: 'HK$7.2M margin' },
  { stepId: 'S5', title: 'BMS vendor release', owner: 'SENTINEL', impact: 'Cyber exposure' },
  { stepId: 'S6', title: 'Central Market retrofit G1', owner: 'TERRA', impact: 'HK$11.4M NPV' },
  { stepId: 'S8', title: 'Client executive sponsorship', owner: 'PULSE', impact: '2 accounts' },
];

const autonomyTone = (autonomy: string) => {
  if (autonomy.includes('autonomous')) return 'green' as const;
  if (autonomy.includes('gated')) return 'cyan' as const;
  if (autonomy.includes('Veto')) return 'rose' as const;
  return 'amber' as const;
};

const agentStatus = (agentId: string, activeId: string | null): AgentStatus => {
  if (activeId === agentId) return 'active';
  const base = AGENTS.find((a) => a.id === agentId)?.status ?? 'idle';
  return base;
};

const stepStatus = (step: OrchestrationStep, logs: Record<string, LogEntry>, current: OrchestrationStep | null, pending: string | null) => {
  if (logs[step.id]?.status === 'complete') return 'complete';
  if (pending === step.id) return 'pending';
  if (current?.id === step.id) return 'active';
  return 'queued';
};

export function AgentOps() {
  const [selectedAgentId, setSelectedAgentId] = useState('atlas');
  const [runState, setRunState] = useState<RunState>('idle');
  const [stepIndex, setStepIndex] = useState(-1);
  const [logs, setLogs] = useState<Record<string, LogEntry>>({});
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [pendingApproval, setPendingApproval] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const { toast } = useLive();
  const { t } = useI18n();
  const completedToast = useRef(false);

  const selectedAgent = AGENTS.find((a) => a.id === selectedAgentId) ?? AGENTS[0];
  const currentStep = stepIndex >= 0 ? ORCHESTRATION_STEPS[stepIndex] : null;
  const activeId = (runState === 'running' || runState === 'paused') ? currentStep?.agentId ?? null : null;
  const activeStep = pendingApproval ? ORCHESTRATION_STEPS.find((s) => s.id === pendingApproval) ?? null : null;
  const completed = Object.values(logs).filter((l) => l.status === 'complete').length;
  const progress = Math.round((completed / ORCHESTRATION_STEPS.length) * 100);

  useEffect(() => {
    if (runState !== 'running' || stepIndex < 0) return;
    const step = ORCHESTRATION_STEPS[stepIndex];
    const timer = window.setTimeout(() => {
      setLogs((prev) => ({ ...prev, [step.id]: { status: step.requiresApproval ? 'pending' : 'complete', output: step.output } }));
      if (step.requiresApproval) {
        setPendingApproval(step.id);
        setRunState('paused');
        return;
      }
      if (stepIndex >= ORCHESTRATION_STEPS.length - 1) {
        setRunState('complete');
      } else {
        setStepIndex((i) => i + 1);
      }
    }, 1650);
    return () => window.clearTimeout(timer);
  }, [runState, stepIndex]);

  useEffect(() => {
    if ((runState === 'running' || runState === 'paused') && currentStep) {
      setSelectedAgentId(currentStep.agentId);
    }
  }, [runState, currentStep]);

  useEffect(() => {
    if (runState === 'complete' && !completedToast.current) {
      completedToast.current = true;
      toast('Operating review complete', '8 agents · 4 human gates · board pack ready for the COO.', 'success');
    }
    if (runState !== 'complete') completedToast.current = false;
  }, [runState, toast]);

  const startRun = () => {
    setLogs({});
    setApproved(new Set());
    setPendingApproval(null);
    setStepIndex(0);
    setRunState('running');
    toast('Agent council mobilised', 'Eight specialists are working the Q4 operating review in parallel.', 'info');
  };

  const approveGate = (stepId: string) => {
    if (pendingApproval !== stepId) return;
    setLogs((prev) => ({ ...prev, [stepId]: { status: 'complete', output: prev[stepId]?.output ?? '' } }));
    setApproved((prev) => new Set(prev).add(stepId));
    setPendingApproval(null);
    if (stepIndex >= ORCHESTRATION_STEPS.length - 1) {
      setRunState('complete');
    } else {
      setStepIndex((i) => i + 1);
      setRunState('running');
    }
    toast('Human gate approved', 'The agent continues with the decision recorded in the audit trail.', 'success');
  };

  const handlePrimary = () => {
    if (runState === 'running') return;
    if (runState === 'paused') {
      if (pendingApproval) approveGate(pendingApproval);
      return;
    }
    startRun();
  };

  const runLabel = useMemo(() => {
    if (runState === 'running') return `Running · ${Math.min(stepIndex + 1, 8)}/8`;
    if (runState === 'paused') return 'Paused · human gate';
    if (runState === 'complete') return 'Complete · board pack';
    return 'Ready · 8 agents';
  }, [runState, stepIndex]);

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            Agent operations <span className="text-[var(--dim)]">/</span> COO operating system
          </div>
          <h1 className="display text-[26px] text-white">{t('agents.title', 'A company that thinks in parallel.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('agents.desc', 'Eight specialist agents work the company’s operating rhythm — each with a mandate, tools, a confidence level and a named human gate. The COO orchestrates; the agents execute the analysis.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 8 agents · 1 human</span>
          <Button variant="secondary" size="sm" onClick={() => toast('Autonomy policy', 'Recommend → gated execute → autonomous, with a veto reserved for risk and safety.', 'info')}>
            <ShieldCheck size={12} /> {t('agents.autonomy', 'Autonomy policy')}
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrimary} disabled={runState === 'running'}>
            {runState === 'running' ? <Pause size={12} /> : runState === 'paused' ? <ShieldCheck size={12} /> : runState === 'complete' ? <Workflow size={12} /> : <Play size={12} />}
            {runState === 'running' ? runLabel : runState === 'paused' ? t('agents.approve', 'Approve gate') : runState === 'complete' ? 'Run again' : t('agents.run', 'Run operating review')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <AgentScene selectedId={selectedAgentId} activeId={activeId} autoRotate={autoRotate} onSelect={(id) => id && setSelectedAgentId(id)} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Agent council</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">8 specialists</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">human-gated</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                Run 04 · <span className={cn(runState === 'running' ? 'text-[var(--accent)]' : runState === 'paused' ? 'text-[var(--amber)]' : 'text-[var(--muted)]')}>{runLabel}</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[210px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/82 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">Council</span>
                <Network size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                {AGENTS.map((a) => {
                  const status = agentStatus(a.id, activeId);
                  return (
                    <button key={a.id} onClick={() => setSelectedAgentId(a.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-white/[.04]', selectedAgentId === a.id && 'bg-white/[.045]')}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color, boxShadow: status === 'active' ? `0 0 8px ${a.color}` : 'none' }} />
                      <span className="flex-1 truncate font-mono text-[8px] tracking-[0.08em]" style={{ color: selectedAgentId === a.id ? '#fff' : '#b9c9c5' }}>{a.name}</span>
                      <span className="font-mono text-[7px] text-[var(--dim)]">{a.confidence}%</span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9.5px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>
                  Orbit network
                </button>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-[var(--line)] bg-[#050b10]/88 px-3.5 py-2.5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button onClick={handlePrimary} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#032018] shadow-[0_0_18px_rgba(62,224,161,.4)]" aria-label="Run agent operating review">
                  {runState === 'running' ? <Pause size={10} fill="currentColor" /> : runState === 'paused' ? <ShieldCheck size={10} /> : <Play size={10} fill="currentColor" />}
                </button>
                <div className="min-w-[210px] flex-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Q4 operating review · live orchestration</span>
                    <span className="font-mono text-[8px] text-[var(--accent)]">{progress}%</span>
                  </div>
                  <Progress value={progress} color={runState === 'paused' ? 'var(--amber)' : 'var(--accent)'} height={3} />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ORCHESTRATION_STEPS.map((step, i) => {
                      const status = stepStatus(step, logs, currentStep, pendingApproval);
                      return (
                        <span key={step.id} className={cn('h-1.5 flex-1 rounded-full', status === 'complete' ? 'bg-[var(--accent)]' : status === 'pending' ? 'bg-[var(--amber)]' : status === 'active' ? 'animate-pulse bg-[var(--cyan)]' : 'bg-white/[.09]')} title={step.title} />
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 border-l border-[var(--line)] pl-3">
                  <div><div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Active</div><div className="mt-0.5 font-mono text-[10px]" style={{ color: activeId ? AGENTS.find((a) => a.id === activeId)?.color : 'var(--dim)' }}>{activeId ? AGENTS.find((a) => a.id === activeId)?.name : '—'}</div></div>
                  <div><div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Gate</div><div className={cn('mt-0.5 font-mono text-[10px]', pendingApproval ? 'text-[var(--amber)]' : 'text-[var(--accent)]')}>{pendingApproval ? 'waiting' : 'clear'}</div></div>
                </div>
              </div>
            </div>

            {pendingApproval && (
              <div className="absolute bottom-[106px] left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[rgba(245,183,72,.38)] bg-[rgba(35,27,13,.9)] px-3 py-2 backdrop-blur">
                <div className="flex items-center gap-2 text-[9px] text-[#f3d7a4]"><ShieldCheck size={12} className="text-[var(--amber)]" /> Human gate held: {activeStep?.title}</div>
                <button onClick={() => pendingApproval && approveGate(pendingApproval)} className="rounded-md border border-[rgba(245,183,72,.45)] bg-[rgba(245,183,72,.12)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider text-[var(--amber)] hover:bg-[rgba(245,183,72,.2)]">{t('agents.approve', 'Approve & continue')}</button>
              </div>
            )}
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: selectedAgent.color }}>
                  <Bot size={10} /> {selectedAgent.name}
                </div>
                <h2 className="mt-1 font-display text-[16px] text-white">{selectedAgent.role}</h2>
                <div className="mt-0.5 text-[9px] text-[var(--dim)]">{selectedAgent.function} · {selectedAgent.confidence}% confidence</div>
              </div>
              <Badge tone={autonomyTone(selectedAgent.autonomy)}>{selectedAgent.autonomy}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn('h-1.5 w-1.5 rounded-full', pendingApproval && activeId === selectedAgent.id ? 'bg-[var(--amber)]' : activeId === selectedAgent.id ? 'animate-pulse bg-[var(--accent)]' : runState === 'complete' ? 'bg-[var(--accent)]' : 'bg-[var(--dim)]')} />
              <span className="font-mono text-[8px] text-[var(--muted)]">{pendingApproval && activeId === selectedAgent.id ? 'WAITING · human gate' : activeId === selectedAgent.id ? 'ACTIVE · reasoning' : runState === 'complete' ? 'IDLE · review complete' : selectedAgent.status.toUpperCase()}</span>
              <span className="ml-auto font-mono text-[8px] text-[var(--dim)]">{selectedAgent.metric.label} {selectedAgent.metric.value}</span>
            </div>
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="eyebrow">Current task</div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[#dbe5ee]">{selectedAgent.currentTask}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedAgent.tools.map((t) => <span key={t} className="rounded border border-[var(--line)] bg-white/[.025] px-1.5 py-0.5 font-mono text-[7px] text-[var(--muted)]">{t}</span>)}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Latest action</span><CircleDot size={10} style={{ color: selectedAgent.color }} /></div>
              <p className="mt-1.5 text-[9px] leading-relaxed text-[var(--muted)]">{selectedAgent.lastAction}</p>
              <div className="mt-2 rounded-md border border-[var(--line)] bg-white/[.015] px-2.5 py-2">
                <div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">Audit</div>
                <div className="mt-0.5 font-mono text-[8px] text-[var(--accent)]">logged · human review {selectedAgent.autonomy.includes('Veto') ? 'mandatory' : 'available'}</div>
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Agent roster</span><span className="font-mono text-[8px] text-[var(--dim)]">8 live</span></div>
              <div className="mt-2 space-y-1">
                {AGENTS.map((a) => (
                  <button key={a.id} onClick={() => setSelectedAgentId(a.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-white/[.04]', selectedAgentId === a.id && 'bg-white/[.045]')}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color, boxShadow: activeId === a.id ? `0 0 8px ${a.color}` : 'none' }} />
                    <span className="flex-1 truncate text-[8.5px] text-[#c9d5e0]">{a.name} <span className="text-[var(--dim)]">· {a.function}</span></span>
                    <span className="font-mono text-[7px] text-[var(--dim)]">{activeId === a.id ? 'live' : `${a.confidence}%`}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Autonomy ladder</span><Gauge size={10} className="text-[var(--dim)]" /></div>
              <div className="mt-2 space-y-1.5">
                {[
                  { l: 'Recommend', c: 'var(--amber)', active: selectedAgent.autonomy === 'Recommend' },
                  { l: 'Execute · gated', c: 'var(--cyan)', active: selectedAgent.autonomy.includes('gated') },
                  { l: 'Execute · autonomous', c: 'var(--accent)', active: selectedAgent.autonomy.includes('autonomous') },
                  { l: 'Veto · human', c: 'var(--rose)', active: selectedAgent.autonomy.includes('Veto') },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full', x.active ? '' : 'opacity-25')} style={{ background: x.c }} />
                    <span className={cn('text-[8px]', x.active ? 'text-[#dbe5ee]' : 'text-[var(--dim)]')}>{x.l}</span>
                    {x.active && <span className="ml-auto font-mono text-[7px] text-[var(--accent)]">current</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Agent brief exported', `${selectedAgent.name} mandate, tools, recent decisions and audit trail exported.`, 'success')}><ChevronRight size={11} /> Agent brief</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => setSelectedAgentId(selectedAgent.id)}><Workflow size={11} /> Delegate</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-8" eyebrow="Orchestration" title="The operating review, step by step" action={<span className="font-mono text-[8px] text-[var(--dim)]">{completed}/8 complete</span>} bodyClassName="!px-0 !pb-0">
          <div className="divide-y divide-[var(--line)]">
            {ORCHESTRATION_STEPS.map((step, i) => {
              const status = stepStatus(step, logs, currentStep, pendingApproval);
              const agent = AGENTS.find((a) => a.id === step.agentId);
              const log = logs[step.id];
              return (
                <div key={step.id} className={cn('flex items-start gap-3 px-4 py-2.5 transition-colors', status === 'active' && 'bg-[rgba(81,214,255,.035)]', status === 'pending' && 'bg-[rgba(245,183,72,.035)]')}>
                  <div className="mt-0.5 w-6 shrink-0 font-mono text-[8px] text-[var(--dim)]">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mt-0.5 shrink-0">
                    {status === 'complete' ? <CheckCircle2 size={11} className="text-[var(--accent)]" /> : status === 'pending' ? <ShieldCheck size={11} className="text-[var(--amber)]" /> : status === 'active' ? <span className="live-dot" /> : <Clock3 size={11} className="text-[var(--dim)]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[7.5px] uppercase tracking-wider" style={{ color: agent?.color }}>{agent?.name}</span>
                      <span className="text-[9px] text-[#dbe5ee]">{step.title}</span>
                      {step.requiresApproval && <Badge tone={status === 'complete' ? 'green' : status === 'pending' ? 'amber' : 'neutral'}>human gate</Badge>}
                    </div>
                    <div className="mt-0.5 text-[8px] leading-relaxed text-[var(--dim)]">{step.detail}</div>
                    {log && <div className="mt-1 rounded border border-[var(--line)] bg-black/20 px-2 py-1 text-[8px] leading-relaxed text-[#c6d4db]">{log.output}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Human gates" title="Where the COO decides" action={<Badge tone={pendingApproval ? 'amber' : 'green'}>{pendingApproval ? '1 waiting' : 'clear'}</Badge>}>
          <div className="space-y-2">
            {GATES.map((gate) => {
              const step = ORCHESTRATION_STEPS.find((s) => s.id === gate.stepId);
              const isPending = pendingApproval === gate.stepId;
              const isApproved = approved.has(gate.stepId);
              return (
                <div key={gate.stepId} className={cn('rounded-lg border p-2.5', isPending ? 'border-[rgba(245,183,72,.35)] bg-[rgba(245,183,72,.04)]' : isApproved ? 'border-[rgba(62,224,161,.25)] bg-[rgba(62,224,161,.025)]' : 'border-[var(--line)] bg-white/[.014]')}>
                  <div className="flex items-start gap-2">
                    <span className={cn('mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full', isPending ? 'animate-pulse bg-[var(--amber)]' : isApproved ? 'bg-[var(--accent)]' : 'bg-[var(--dim)]')} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] text-[#dbe5ee]">{gate.title}</div>
                      <div className="mt-0.5 font-mono text-[7px] text-[var(--dim)]">{gate.owner} · {gate.impact}</div>
                    </div>
                    {isPending ? (
                      <button onClick={() => approveGate(gate.stepId)} className="rounded border border-[rgba(245,183,72,.4)] bg-[rgba(245,183,72,.1)] px-1.5 py-1 font-mono text-[7px] uppercase tracking-wider text-[var(--amber)]">approve</button>
                    ) : isApproved ? (
                      <CheckCircle2 size={12} className="text-[var(--accent)]" />
                    ) : (
                      <span className="font-mono text-[7px] text-[var(--dim)]">{step?.requiresApproval ? 'locked' : '—'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t border-[var(--line)] pt-3">
            <div className="eyebrow mb-1.5">Board pack</div>
            <p className="text-[8.5px] leading-relaxed text-[var(--muted)]">On completion, the council assembles one board-ready pack: decisions, exceptions, capital asks and the audit trail behind each recommendation.</p>
            <button onClick={() => { if (runState === 'complete') toast('Board pack ready', '8 agent outputs · 4 approvals · decision log attached.', 'success'); else toast('Review not complete', 'Run the operating review to assemble the board pack.', 'warning'); }} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--line-2)] bg-white/[.04] py-1.5 text-[8.5px] text-[#dbe5ee] hover:bg-white/[.07]"><ArrowRight size={10} /> {runState === 'complete' ? 'Open board pack' : 'Preview board pack'}</button>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Company operating system" title="Six functions, one cadence" action={<span className="font-mono text-[8px] text-[var(--dim)]">COO-owned · agent-assisted</span>}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {COMPANY_FUNCTIONS.map((fn) => (
            <button key={fn.name} onClick={() => setSelectedAgentId(AGENTS.find((a) => a.name === fn.owner)?.id ?? 'atlas')} className="rounded-lg border border-[var(--line)] bg-white/[.015] p-3 text-left transition-colors hover:border-[var(--line-2)] hover:bg-white/[.03]">
              <div className="flex items-center justify-between"><span className="h-1.5 w-1.5 rounded-full" style={{ background: fn.tone }} /><span className="font-mono text-[7px] text-[var(--dim)]">{fn.owner}</span></div>
              <div className="mt-2 text-[8px] uppercase tracking-wider text-[var(--dim)]">{fn.name}</div>
              <div className="mt-0.5 num text-[13px] text-white">{fn.metric}</div>
              <div className="mt-0.5 text-[7.5px] text-[var(--dim)]">{fn.note}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-3">
          {COO_CADENCE.map((c) => (
            <div key={c.day} className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-black/15 px-2.5 py-1.5">
              <span className="font-mono text-[7px] text-[var(--accent)]">{c.day}</span>
              <span className="text-[8px] text-[var(--muted)]">{c.meeting}</span>
              <span className="font-mono text-[7px] text-[var(--dim)]">{c.owner}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
