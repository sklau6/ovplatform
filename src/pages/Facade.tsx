import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Droplets, Layers, Ruler, ShieldCheck, Sun, Wind,
} from 'lucide-react';
import { FacadeScene, type FacadeSelection } from '../components/FacadeScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  FACADE_ACTIONS, FACADE_KPIS, FACADE_MODES, FACADE_PANELS, FACADE_SCENARIOS,
  type FacadeMode, type FacadeScenario,
} from '../lib/facadeData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { thermal: Sun, structural: Wind, water: Droplets, install: Layers } as const;

export function Facade() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<FacadeMode>('thermal');
  const [scenario, setScenario] = useState<FacadeScenario>('wind');
  const [selected, setSelected] = useState<FacadeSelection | null>({ id: 'P-02', name: 'Unitised panel 02', u: '1.08', wind: '3.2 kPa', status: 'Pass' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = FACADE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Facade engineering <span className="text-[var(--dim)]">/</span> building envelope</div>
          <h1 className="display text-[26px] text-white">{t('facade.title', 'The envelope is the building.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('facade.desc', 'A 3D unitised facade mock-up: glass panels, mullions, brackets, thermal break and section layers, tested for thermal, structural, water and installation performance.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 panels · 1 mock-up</span>
          <span className="chip"><Ruler size={10} className="text-[var(--accent)]" /> U 1.08</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/bim')}><Layers size={12} /> BIM</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('rain'); toast('Driving-rain test', '600 Pa water test · drainage and gaskets verified.', 'info'); }}><Droplets size={12} /> Rain test</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <FacadeScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Facade mock-up</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">6 panels</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">U 1.08</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Facade lens</span><Layers size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{FACADE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['wind', 'rain', 'heat'] as FacadeScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{FACADE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Envelope</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> glass</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> mullion</span><span className="text-[7.5px]">click a panel</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · unitised` : 'Facade'}</div><Badge tone={s.status === 'Monitor' ? 'amber' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'West facade'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `U ${selected.u} W/m²K · wind ${selected.wind} · ${selected.status}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'U-value', v: selected?.u ?? '—' }, { l: 'Wind', v: selected?.wind ?? '—' }, { l: 'Water', v: s.water }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Panels</span><span className="font-mono text-[8px] text-[var(--accent)]">6 units</span></div><div className="mt-2 space-y-1">{FACADE_PANELS.map((p) => <button key={p.id} onClick={() => setSelected({ id: p.id, name: p.name, u: p.u, wind: p.wind, status: p.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === p.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{p.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{p.u}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Performance</span><ShieldCheck size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-2">{[{ l: 'Thermal', v: 88, c: 'var(--amber)' }, { l: 'Structural', v: 94, c: 'var(--cyan)' }, { l: 'Water', v: 96, c: 'var(--cyan)' }, { l: 'Install QA', v: 82, c: 'var(--accent)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--dim)]">{x.v}%</span></div><Progress value={x.v} color={x.c} height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{FACADE_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Facade brief exported', 'Panels, U-values, wind, water and QA exported.', 'success')}><Ruler size={11} /> Facade brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/safety')}><ArrowRight size={11} /> Safety</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{FACADE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Layers size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Section build-up" title="From glass to structure" action={<Badge tone="cyan">unitised</Badge>}><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{[{ l: 'Glass', v: '6 mm + 12 mm' }, { l: 'Air cavity', v: '24 mm' }, { l: 'Insulation', v: '80 mm' }, { l: 'Aluminium', v: 'low-carbon' }].map((x) => <div key={x.l} className="rounded border border-[var(--line)] bg-white/[.014] p-2"><div className="text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-1 text-[8px] text-[var(--muted)]">{x.v}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Testing" title="Mock-up results" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{[{ l: 'Water test 600 Pa', v: 'Pass' }, { l: 'Structural 3.2 kPa', v: 'Pass' }, { l: 'Thermal U 1.08', v: 'Pass' }, { l: 'Panel 03 gasket', v: 'Monitor' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className={cn('font-mono', x.v === 'Monitor' ? 'text-[var(--amber)]' : 'text-[var(--accent)]')}>{x.v}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
