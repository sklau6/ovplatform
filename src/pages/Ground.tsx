import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, CircleDot, Drill, Gauge, Layers, Mountain, ShieldCheck, Waves,
} from 'lucide-react';
import { GroundScene, type GroundSelection } from '../components/GroundScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  GROUND_ACTIONS, GROUND_BOREHOLES, GROUND_KPIS, GROUND_LAYERS, GROUND_MODES, GROUND_PILES, GROUND_SCENARIOS,
  type GroundMode, type GroundScenario,
} from '../lib/groundData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { strata: Layers, boreholes: Drill, piles: CircleDot, settlement: Mountain } as const;

export function Ground() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<GroundMode>('strata');
  const [scenario, setScenario] = useState<GroundScenario>('baseline');
  const [selected, setSelected] = useState<GroundSelection | null>({ id: 'L2', name: 'Marine clay', type: 'Strata', detail: '3–9 m · SPT 2–6 · Soft compressible clay; settlement critical.' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = GROUND_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Ground engineering <span className="text-[var(--dim)]">/</span> geotechnical</div>
          <h1 className="display text-[26px] text-white">{t('ground.title', 'Build on solid ground.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('ground.desc', 'A 3D geotechnical ground model: soil strata, boreholes, groundwater, pile group, settlement contours and deep-excavation scenarios.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 4 boreholes · 6 piles</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> FoS {s.factor}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/engineering')}><ArrowRight size={12} /> Structural</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('excavation'); toast('Deep excavation scenario', '12 m basement · wall deflection and settlement reviewed.', 'warning'); }}><Mountain size={12} /> Excavation</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <GroundScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Ground model</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">5 strata</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">settlement {s.settlement}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Ground lens</span><Mountain size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{GROUND_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['baseline', 'groundwater', 'excavation'] as GroundScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{GROUND_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Ground</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> strata</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> borehole</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> pile</span><span className="text-[7.5px]">click the model</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Ground model'}</div><Badge tone="green">{s.label}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak ground'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Boreholes', v: '4' }, { l: 'Piles', v: '6' }, { l: 'Settlement', v: s.settlement }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Strata</span><span className="font-mono text-[8px] text-[var(--dim)]">5 layers</span></div><div className="mt-2 space-y-1">{GROUND_LAYERS.map((l) => <button key={l.id} onClick={() => setSelected({ id: l.id, name: l.name, type: 'Strata', detail: `${l.depth} · SPT ${l.spt} · ${l.note}` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === l.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{l.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{l.depth}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Boreholes</span><Drill size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 grid grid-cols-2 gap-2">{GROUND_BOREHOLES.map((b) => <button key={b.id} onClick={() => setSelected({ id: b.id, name: b.id, type: 'Borehole', detail: `${b.depth} m · water ${b.water} · SPT ${b.spt}` })} className="rounded border border-[var(--line)] bg-white/[.012] p-1.5 text-left"><div className="font-mono text-[6.5px] text-[var(--cyan)]">{b.id}</div><div className="mt-0.5 text-[6.5px] text-[var(--dim)]">{b.depth} m · {b.spt}</div></button>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Piles</span><CircleDot size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{GROUND_PILES.slice(0, 4).map((p) => <div key={p.id} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{p.id} · {p.length} m</span><span className="font-mono text-[var(--dim)]">{p.capacity}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Geotech brief exported', 'Strata, boreholes, piles and settlement exported.', 'success')}><Gauge size={11} /> Geotech brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/safety')}><ShieldCheck size={11} /> Safety</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{GROUND_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Mountain size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Design checks" title="Capacity and settlement" action={<Badge tone="green">within limits</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-3">{[{ l: 'Pile capacity', v: '9.2 MN' }, { l: 'Settlement', v: s.settlement }, { l: 'Safety factor', v: s.factor }].map((x) => <div key={x.l} className="rounded border border-[var(--line)] bg-white/[.014] p-3"><div className="text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-1 num text-[18px] text-white">{x.v}</div></div>)}</div><div className="mt-2 flex items-center gap-1.5 text-[8px] text-[var(--dim)]"><Waves size={9} className="text-[var(--cyan)]" /> Groundwater at -2.5 m; monitoring array live.</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Actions" title="Ground risk" action={<CheckCircle2 size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{GROUND_ACTIONS.map((a) => <div key={a.title} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{a.status}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
