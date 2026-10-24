import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, CheckCircle2, ChevronRight, Command, Cpu, Send, ShieldCheck, Sparkles, Users,
} from 'lucide-react';
import { WarRoomScene } from '../components/WarRoomScene';
import { Badge, Button, Panel } from '../components/ui';
import { AGENTS } from '../lib/platformData';
import { WAR_GATES, WAR_SCENARIOS, type WarScenario } from '../lib/warRoomData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

export function WarRoom() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [scenario, setScenario] = useState<WarScenario>('incident');
  const [selectedAgent, setSelectedAgent] = useState('sentinel');
  const [autoRotate, setAutoRotate] = useState(false);
  const [approved, setApproved] = useState(false);
  const data = WAR_SCENARIOS[scenario];
  const agent = AGENTS.find((a) => a.id === selectedAgent) ?? AGENTS[0];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Agent war room <span className="text-[var(--dim)]">/</span> COO operating system</div>
          <h1 className="display text-[26px] text-white">{t('war.title', 'Eight minds. One accountable decision.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('war.desc', 'A 3D agent war room where eight specialists debate an incident, a quarter close or a design review — with evidence, challenge and a human approval gate.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 8 agents · 1 human</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/agents')}><Bot size={12} /> Agent Ops</Button>
          <Button variant="primary" size="sm" onClick={() => { setApproved(true); toast('Decision approved', data.decision, 'success'); }}><ShieldCheck size={12} /> Approve decision</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <WarRoomScene scenario={scenario} selectedId={selectedAgent} autoRotate={autoRotate} onSelect={setSelectedAgent} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">War room live</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">8 agents</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{data.label}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">Human gate · <span className="text-[var(--accent)]">COO</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[192px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Scenario</span><Command size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-1 p-2">{(['incident', 'quarter', 'design'] as WarScenario[]).map((id) => <button key={id} onClick={() => { setScenario(id); setApproved(false); }} className={cn('w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{WAR_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1 font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">Room</div>{AGENTS.map((a) => <button key={a.id} onClick={() => setSelectedAgent(a.id)} className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left hover:bg-white/[.03]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} /><span className="flex-1 font-mono text-[6.5px] text-[var(--muted)]">{a.name}</span></button>)}</div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Decision room</span><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><span>click an agent · drag to orbit</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{agent.name} · {agent.function}</div><Badge tone={approved ? 'green' : 'amber'}>{approved ? 'Approved' : 'Live'}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{agent.role}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{agent.currentTask}</div><div className="mt-2 flex items-center gap-3 font-mono text-[7px] text-[var(--dim)]"><span>{agent.confidence}% confidence</span><span className="h-3 w-px bg-[var(--line-2)]" /><span>{agent.autonomy}</span></div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Live transcript</span><span className="font-mono text-[7px] text-[var(--accent)]">grounded</span></div><div className="mt-2 space-y-2.5">{data.messages.map((m, i) => { const a = AGENTS.find((x) => x.id === m.agentId); return <div key={`${scenario}-${i}`} className="rounded-lg border border-[var(--line)] bg-white/[.012] p-2.5"><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: a?.color }} /><span className="font-mono text-[6.5px]" style={{ color: a?.color }}>{a?.name}</span><span className="ml-auto font-mono text-[6px] uppercase tracking-wider text-[var(--dim)]">{m.kind}</span></div><div className="mt-1 text-[8px] leading-relaxed text-[var(--muted)]">{m.text}</div>{m.action && <div className="mt-1 font-mono text-[6.5px] text-[var(--cyan)]">→ {m.action}</div>}</div>; })}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Human gates</span><ShieldCheck size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{WAR_GATES.map((g) => <div key={g.label} className="flex items-center gap-2 text-[7.5px]"><CheckCircle2 size={9} className={g.status === 'complete' ? 'text-[var(--accent)]' : 'text-[var(--amber)]'} /><span className="flex-1 text-[var(--muted)]">{g.label}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{g.owner}</span><span className={cn('font-mono text-[6.5px]', g.status === 'complete' ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{g.status}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Decision</span><Sparkles size={10} className="text-[var(--accent)]" /></div><p className="mt-1.5 text-[8px] leading-relaxed text-[var(--muted)]">{data.decision}</p><div className="mt-2 flex items-center gap-1.5 text-[7px] text-[var(--dim)]"><Cpu size={8} /> Evidence linked · reversible · audit trail written.</div></div>
          </div>
          <div className="border-t border-[var(--line)] p-3"><button onClick={() => { setApproved(true); toast('Decision approved', data.decision, 'success'); }} className={cn('flex w-full items-center justify-center gap-1.5 rounded-md border py-2 font-mono text-[8px] uppercase tracking-wider', approved ? 'border-[rgba(62,224,161,.4)] bg-[rgba(62,224,161,.08)] text-[var(--accent)]' : 'border-[var(--line-2)] bg-white/[.03] text-white')}><ShieldCheck size={10} /> {approved ? 'Human gate cleared' : 'Approve decision'}</button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
        { l: 'Agents in room', v: '8', s: '1 human gate' }, { l: 'Evidence links', v: '24', s: 'models · ledger · sensors' }, { l: 'Decision time', v: '4m 12s', s: 'from signal to gate' }, { l: 'Actions gated', v: approved ? '3' : '0', s: 'no autonomous spend' },
      ].map((x) => <div key={x.l} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{x.l}</span><Users size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{x.v}</div><div className="mt-1 text-[8px] text-[var(--muted)]">{x.s}</div></div>)}</div>

      <Panel eyebrow="How the room works" title="Evidence → challenge → decision → human gate" action={<Badge tone="cyan">governed</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-4">{['Signal and evidence', 'Specialist analysis', 'Adversarial challenge', 'COO approval'].map((x, i) => <div key={x} className="rounded-lg border border-[var(--line)] bg-white/[.014] p-2.5"><div className="font-mono text-[7px] text-[var(--accent)]">0{i + 1}</div><div className="mt-1 text-[8.5px] text-[#dbe5ee]">{x}</div><div className="mt-1 text-[7px] text-[var(--dim)]">{['Grounded in the twin, models and ledger.', 'Each agent owns a function and a toolset.', 'SENTINEL and TERRA test the recommendation.', 'No action executes without a named human.'][i]}</div></div>)}</div></Panel>
    </div>
  );
}
