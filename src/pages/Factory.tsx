import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, Boxes, CheckCircle2, Gauge, Leaf, PackageCheck, Sparkles, Wrench,
} from 'lucide-react';
import { FactoryScene, type FactorySelection } from '../components/FactoryScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  FACTORY_ACTIONS, FACTORY_KPIS, FACTORY_MODES, FACTORY_SCENARIOS, FACTORY_STATIONS,
  type FactoryMode, type FactoryScenario,
} from '../lib/factoryData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { line: Boxes, automation: Bot, quality: PackageCheck, carbon: Leaf } as const;

export function Factory() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<FactoryMode>('line');
  const [scenario, setScenario] = useState<FactoryScenario>('base');
  const [selected, setSelected] = useState<FactorySelection | null>({ id: 'ST-01', name: 'Robotic weld cell', type: 'Robotics', status: 'Running', detail: '92% arc-on · Running' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = FACTORY_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Offsite manufacturing <span className="text-[var(--dim)]">/</span> factory twin</div>
          <h1 className="display text-[26px] text-white">{t('factory.title', 'Build the building in a factory.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('factory.desc', 'A 3D offsite prefabrication twin: robotic weld cells, MEP fit-out, finishing, glazing, in-line quality, AGVs and dispatch.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Line running · 18 modules/week</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> OEE {s.oee}%</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/supply')}><ArrowRight size={12} /> Supply chain</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('automation'); toast('Automation step simulated', 'New weld cell + AGV routing · 27 modules/week · OEE 91%.', 'info'); }}><Sparkles size={12} /> Automate line</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <FactoryScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Factory twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.modules} modules/week</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">OEE {s.oee}%</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--cyan)]">{s.cycle}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Factory lens</span><Bot size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{FACTORY_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['base', 'surge', 'automation'] as FactoryScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{FACTORY_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Line</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> robot</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> module</span><span className="text-[7.5px]">click a station</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Factory'}</div><Badge tone="green">{s.label}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Offsite factory'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'OEE', v: `${s.oee}%` }, { l: 'Cycle', v: s.cycle }, { l: 'Defects', v: s.defects }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Stations</span><span className="font-mono text-[8px] text-[var(--accent)]">6 live</span></div><div className="mt-2 space-y-1">{FACTORY_STATIONS.map((st) => <button key={st.id} onClick={() => setSelected({ id: st.id, name: st.name, type: st.type, status: st.status, detail: `${st.metric} · ${st.status}` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === st.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><span className="flex-1 font-mono text-[6.5px] text-[var(--muted)]">{st.id} · {st.type}</span><span className="font-mono text-[6px] text-[var(--dim)]">{st.status}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Improvement actions</span><Wrench size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1.5">{FACTORY_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Quality</span><PackageCheck size={10} className="text-[var(--accent)]" /></div><div className="mt-2 flex items-center gap-2 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> In-line inspection · {s.defects} defects · 0 escapes.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Factory brief exported', 'OEE, cycle, defects and carbon exported.', 'success')}><Gauge size={11} /> Factory brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/construction')}><Boxes size={11} /> Construction</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{FACTORY_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Gauge size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Takt & balance" title="Station cycle time" action={<Badge tone="cyan">line running</Badge>}><div className="space-y-2">{[{ l: 'Weld', v: 92 }, { l: 'MEP fit-out', v: 86 }, { l: 'Drywall', v: 81 }, { l: 'Glazing', v: 88 }, { l: 'Quality', v: 96 }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}%</span></div><Progress value={x.v} color="var(--accent)" height={3} /></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Offsite benefit" title="Factory vs traditional" action={<Leaf size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{[{ l: 'Programme', v: '−35%' }, { l: 'Site labour', v: '−42%' }, { l: 'Waste', v: '−28%' }, { l: 'Embodied carbon', v: '−31%' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--accent)]">{x.v}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
