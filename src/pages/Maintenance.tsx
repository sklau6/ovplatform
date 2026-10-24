import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ClipboardList, Clock, Package, ShieldCheck, UserCheck, Wrench,
} from 'lucide-react';
import { MaintenanceScene, type MaintenanceSelection } from '../components/MaintenanceScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  MAINTENANCE_ACTIONS, MAINTENANCE_KPIS, MAINTENANCE_MODES, MAINTENANCE_ORDERS, MAINTENANCE_SCENARIOS,
  type MaintenanceMode, type MaintenanceScenario,
} from '../lib/maintenanceData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { orders: ClipboardList, sla: Clock, parts: Package, technicians: UserCheck } as const;

export function Maintenance() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<MaintenanceMode>('orders');
  const [scenario, setScenario] = useState<MaintenanceScenario>('reactive');
  const [selected, setSelected] = useState<MaintenanceSelection | null>({ id: 'WO-1042', name: 'Lift 2 trapped passenger', trade: 'Lifts', priority: 'P1', sla: '18 min', tech: 'T. Chan', parts: 'Door sensor', status: 'In progress' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = MAINTENANCE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Maintenance & work orders <span className="text-[var(--dim)]">/</span> building operations</div>
          <h1 className="display text-[26px] text-white">{t('maintenance.title', 'Fix it before it fails.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('maintenance.desc', 'A 3D maintenance twin: work orders, SLA clocks, technicians, critical spares and BMS-triggered jobs across four floors.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 12 open · 2 P1</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> {s.sla} SLA</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/assets')}><ArrowRight size={12} /> Assets</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('emergency'); toast('Emergency escalation', 'Chiller failure · critical spares · vendor escalation.', 'warning'); }}><Wrench size={12} /> Emergency</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <MaintenanceScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Maintenance twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.open} jobs</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.sla} SLA</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Escalated' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Maintenance lens</span><Wrench size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{MAINTENANCE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['reactive', 'ppm', 'emergency'] as MaintenanceScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{MAINTENANCE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Jobs</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> P1</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> P2</span><span className="text-[7.5px]">click a pin</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · order` : 'Maintenance'}</div><Badge tone={selected?.priority === 'P1' ? 'rose' : selected?.priority === 'P2' ? 'amber' : 'green'}>{selected?.priority ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Work orders'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.trade} · ${selected.sla} SLA · ${selected.tech} · ${selected.parts}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Open', v: `${s.open}` }, { l: 'SLA', v: s.sla }, { l: 'P1', v: '2' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Orders</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{MAINTENANCE_ORDERS.map((o) => <button key={o.id} onClick={() => setSelected({ id: o.id, name: o.name, trade: o.trade, priority: o.priority, sla: o.sla, tech: o.tech, parts: o.parts, status: o.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === o.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', o.priority === 'P1' ? 'bg-[var(--rose)]' : o.priority === 'P2' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{o.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{o.sla}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">SLA</span><Clock size={10} className="text-[var(--amber)]" /></div><div className="mt-2"><Progress value={94} color="var(--accent)" height={4} /><div className="mt-1 flex justify-between font-mono text-[6.5px] text-[var(--dim)]"><span>0</span><span>94%</span><span>100</span></div></div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{MAINTENANCE_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Maintenance brief exported', 'Work orders, SLA, parts and technicians exported.', 'success')}><ClipboardList size={11} /> Ops brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/assets')}><ArrowRight size={11} /> Assets</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{MAINTENANCE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Wrench size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Priority" title="Jobs by priority" action={<Badge tone="rose">2 P1</Badge>}><div className="space-y-2">{MAINTENANCE_ORDERS.map((o) => <div key={o.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{o.name}</span><span className="font-mono text-[var(--muted)]">{o.priority} · {o.sla}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: o.priority === 'P1' ? '95%' : o.priority === 'P2' ? '65%' : '35%', background: o.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Response" title="Dispatch and spares" action={<Package size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">BMS and IoT alarms raise work orders automatically; the nearest skilled technician is dispatched with the right part. P1 jobs escalate to the duty manager.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 94% SLA · 82% first-time fix · 96% critical spares.</div></Panel>
      </div>
    </div>
  );
}
