import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ClipboardCheck, KeyRound, PackageCheck, Settings, ShieldCheck, Wrench,
} from 'lucide-react';
import { HandoverScene, type HandoverSelection } from '../components/HandoverScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  HANDOVER_ACTIONS, HANDOVER_KPIS, HANDOVER_MODES, HANDOVER_SCENARIOS, HANDOVER_SYSTEMS,
  type HandoverMode, type HandoverScenario,
} from '../lib/handoverData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { commissioning: Settings, snags: Wrench, assets: PackageCheck, handover: KeyRound } as const;

export function Handover() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<HandoverMode>('commissioning');
  const [scenario, setScenario] = useState<HandoverScenario>('punch');
  const [selected, setSelected] = useState<HandoverSelection | null>({ id: 'HVAC', name: 'HVAC & BMS', floor: 'All', tests: '42 / 44', snags: 6, status: 'Commissioning' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = HANDOVER_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Commissioning & handover <span className="text-[var(--dim)]">/</span> project close</div>
          <h1 className="display text-[26px] text-white">{t('handover.title', 'Finish strong. Hand over clean.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('handover.desc', 'A 3D commissioning and handover twin: systems, tests, snags, asset tags, O&M and the handover gate across pre-handover, punch-list and ready states.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 systems · 4,820 assets</span>
          <span className="chip"><ClipboardCheck size={10} className="text-[var(--accent)]" /> {s.complete} complete</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/construction')}><ArrowRight size={12} /> Construction</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('ready'); toast('Ready for handover', 'Critical systems witnessed · O&M and training complete.', 'success'); }}><KeyRound size={12} /> Hand over</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <HandoverScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Handover twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.snags} snags</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.complete}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Handover lens</span><ClipboardCheck size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{HANDOVER_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['pre', 'punch', 'ready'] as HandoverScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{HANDOVER_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Close-out</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> complete</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> snag</span><span className="text-[7.5px]">click a system</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · system` : 'Handover'}</div><Badge tone={s.status === 'Ready' ? 'green' : 'amber'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Tower A'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.tests} tests · ${selected.snags} snags · ${selected.floor}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Snags', v: `${s.snags}` }, { l: 'Complete', v: s.complete }, { l: 'Assets', v: '4.8k' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Systems</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{HANDOVER_SYSTEMS.map((sys) => <button key={sys.id} onClick={() => setSelected({ id: sys.id, name: sys.name, floor: sys.floor, tests: sys.tests, snags: sys.snags, status: sys.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === sys.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', sys.status === 'Snagging' ? 'bg-[var(--rose)]' : sys.status === 'Complete' || sys.status === 'Witnessed' ? 'bg-[var(--accent)]' : 'bg-[var(--amber)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{sys.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{sys.snags} snags</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Commissioning</span><Settings size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1.5">{HANDOVER_SYSTEMS.slice(0, 4).map((sys) => <div key={sys.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{sys.name}</span><span className="font-mono text-[var(--dim)]">{sys.tests}</span></div><Progress value={sys.status === 'Complete' ? 100 : sys.status === 'Witnessed' ? 95 : 72} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{HANDOVER_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Handover pack exported', 'Commissioning, snags, assets and O&M exported.', 'success')}><PackageCheck size={11} /> Handover pack</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/workplace')}><ArrowRight size={11} /> Operate</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{HANDOVER_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><KeyRound size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Close-out" title="Snags by system" action={<Badge tone="amber">punch list</Badge>}><div className="space-y-2">{HANDOVER_SYSTEMS.map((sys) => <div key={sys.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{sys.name}</span><span className="font-mono text-[var(--muted)]">{sys.snags} snags</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(sys.snags / 12) * 100}%`, background: sys.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Digital handover" title="Twin, tags and O&M" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Every asset carries a tag, warranty and O&M link. The digital twin is handed over with the keys, with space and system data ready for operations.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 4,820 assets tagged · 96% O&M uploaded · 48 staff trained.</div></Panel>
      </div>
    </div>
  );
}
