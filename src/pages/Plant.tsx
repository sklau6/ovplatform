import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Droplets, Gauge, Thermometer, Waves, Wrench, Zap,
} from 'lucide-react';
import { PlantScene, type PlantSelection } from '../components/PlantScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  PLANT_ACTIONS, PLANT_ASSETS, PLANT_KPIS, PLANT_MODES, PLANT_SCENARIOS,
  type PlantMode, type PlantScenario,
} from '../lib/plantData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { cooling: Thermometer, energy: Zap, water: Droplets, maintenance: Wrench } as const;

export function Plant() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<PlantMode>('cooling');
  const [scenario, setScenario] = useState<PlantScenario>('normal');
  const [selected, setSelected] = useState<PlantSelection | null>({ id: 'CH-01', name: 'Chiller 01', type: 'Chiller', status: 'Running', metric: '6.4 COP' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = PLANT_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Plant & BMS <span className="text-[var(--dim)]">/</span> building services</div>
          <h1 className="display text-[26px] text-white">{t('plant.title', 'The plant room, under control.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('plant.desc', 'A 3D plant-room twin: chillers, pumps, cooling tower, AHU, BMS controller and chilled-water pipework, with energy, water and maintenance lenses.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> BMS online · 7 assets</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> COP {s.cop}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dc-ops')}><ArrowRight size={12} /> DC Ops</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('fault'); toast('Chiller fault simulated', 'Chiller 02 trip · standby online · work order raised.', 'warning'); }}><Wrench size={12} /> Fault drill</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <PlantScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Plant twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">7 assets</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">COP {s.cop}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Fault' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Plant lens</span><Thermometer size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{PLANT_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['normal', 'peak', 'fault'] as PlantScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(69,196,245,.35)] bg-[rgba(69,196,245,.08)] text-[var(--cyan)]' : 'border-[var(--line)] text-[var(--dim)]')}>{PLANT_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Plant</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> chilled water</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> BMS</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Plant room'}</div><Badge tone={s.status === 'Fault' ? 'rose' : 'cyan'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Central plant'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.metric} · ${selected.status}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'COP', v: s.cop }, { l: 'kW/RT', v: s.kwrt }, { l: 'Faults', v: `${s.faults}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Equipment</span><span className="font-mono text-[8px] text-[var(--accent)]">7 live</span></div><div className="mt-2 space-y-1">{PLANT_ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, type: a.type, status: a.status, metric: a.metric })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', a.status === 'Fault' ? 'bg-[var(--rose)]' : 'bg-[var(--accent)]')} /><span className="flex-1 font-mono text-[6.5px] text-[var(--muted)]">{a.id} · {a.type}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.metric}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><Wrench size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1.5">{PLANT_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Chilled-water reset active · condenser water 29.8°C.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('O&M brief exported', 'Plant condition, energy, water and work orders exported.', 'success')}><Gauge size={11} /> O&M brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/energy')}><Zap size={11} /> Energy</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{PLANT_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Waves size={12} className="text-[var(--cyan)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Cooling performance" title="Chiller staging" action={<Badge tone="cyan">2 of 3 online</Badge>}><div className="space-y-2">{[{ l: 'Chiller 01', v: 64, c: 'var(--cyan)' }, { l: 'Chiller 02', v: 0, c: 'var(--rose)' }, { l: 'Chiller 03 standby', v: 38, c: 'var(--accent)' }, { l: 'Cooling tower', v: 82, c: 'var(--cyan)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}%</span></div><Progress value={x.v} color={x.c} height={3} /></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Maintenance" title="Condition & work orders" action={<Wrench size={12} className="text-[var(--amber)]" />}><div className="space-y-2">{[{ l: 'Chiller 02 compressor', v: 'Work order' }, { l: 'Cooling tower fill', v: 'Scheduled' }, { l: 'Pump VFD tuning', v: 'Pilot' }, { l: 'Sensor calibration', v: 'Current' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--dim)]">{x.v}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
