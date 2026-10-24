import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, CircleDot, Gauge, Palette, RotateCcw, Sofa, Sparkles, Weight,
} from 'lucide-react';
import { ShowroomScene, type ShowroomView } from '../components/ShowroomScene';
import { Badge, Button, Panel } from '../components/ui';
import type { VehicleKind } from '../lib/vehicleModels';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const MODELS: Array<{ id: VehicleKind; name: string; body: string; seats: number; energy: string; drag: string; length: string; width: string; height: string }> = [
  { id: 'sedan', name: 'Ophylla S', body: 'Electric saloon', seats: 5, energy: '520 km', drag: '0.23 Cd', length: '4,500 mm', width: '1,820 mm', height: '1,420 mm' },
  { id: 'suv', name: 'Ophylla X', body: 'Electric SUV', seats: 5, energy: '480 km', drag: '0.28 Cd', length: '4,750 mm', width: '1,920 mm', height: '1,680 mm' },
  { id: 'van', name: 'Ophylla V', body: 'Electric van', seats: 7, energy: '420 km', drag: '0.31 Cd', length: '5,100 mm', width: '1,980 mm', height: '1,950 mm' },
  { id: 'bus', name: 'Ophylla Transit', body: 'Electric bus', seats: 60, energy: '300 km', drag: '0.60 Cd', length: '10,800 mm', width: '2,500 mm', height: '3,150 mm' },
  { id: 'truck', name: 'Ophylla Haul', body: 'Electric truck', seats: 2, energy: '380 km', drag: '0.55 Cd', length: '7,400 mm', width: '2,300 mm', height: '2,900 mm' },
];

const PAINTS = [
  { name: 'Pearl white', color: 0xe8ecea },
  { name: 'Graphite', color: 0x3a4145 },
  { name: 'Midnight blue', color: 0x1c3b5a },
  { name: 'Racing green', color: 0x1f4d3a },
  { name: 'Copper', color: 0x9a5b3a },
  { name: 'Solar yellow', color: 0xd9b23a },
];

const WHEELS = [
  { name: 'Silver', color: 0xaeb8b6 },
  { name: 'Satin black', color: 0x24282a },
  { name: 'Bronze', color: 0x8a6a45 },
];

const VIEWS: Array<{ id: ShowroomView; label: string }> = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'profile', label: 'Profile' },
  { id: 'rear', label: 'Rear' },
  { id: 'interior', label: 'Interior' },
  { id: 'wheels', label: 'Wheels' },
];

export function Vehicles() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [kind, setKind] = useState<VehicleKind>('sedan');
  const [paint, setPaint] = useState(PAINTS[1].color);
  const [wheel, setWheel] = useState(WHEELS[0].color);
  const [view, setView] = useState<ShowroomView>('exterior');
  const [autoRotate, setAutoRotate] = useState(true);
  const model = MODELS.find((m) => m.id === kind)!;

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Vehicle studio <span className="text-[var(--dim)]">/</span> fleet design</div>
          <h1 className="display text-[26px] text-white">{t('vehicles.title', 'Engineered to be seen.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('vehicles.desc', 'A real-time vehicle showroom: sedan, SUV, van, bus and truck with clear-coat paint, glass, alloy wheels, interiors, lights and studio reflections.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 5 models · studio live</span>
          <span className="chip"><Gauge size={10} className="text-[var(--accent)]" /> {model.energy}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/ev')}><ArrowRight size={12} /> EV hub</Button>
          <Button variant="primary" size="sm" onClick={() => toast('Added to fleet', `${model.name} · ${PAINTS.find((p) => p.color === paint)?.name} · ${WHEELS.find((w) => w.color === wheel)?.name} wheels.`, 'success')}><CheckCircle2 size={12} /> Add to fleet</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#050708]">
            <ShowroomScene kind={kind} paint={paint} wheelColor={wheel} view={view} autoRotate={autoRotate} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Vehicle studio</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{model.body}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{model.drag}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">Studio · <span className="text-[var(--accent)]">{view}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Model</span><Sparkles size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-1 p-2">{MODELS.map((m) => <button key={m.id} onClick={() => setKind(m.id)} className={cn('w-full rounded-md border px-2 py-1.5 text-left', kind === m.id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)]' : 'border-[var(--line)]')}><div className="flex justify-between"><span className="text-[8.5px] text-white">{m.name}</span><span className="font-mono text-[6px] text-[var(--dim)]">{m.seats} seats</span></div><div className="mt-0.5 text-[6.5px] text-[var(--dim)]">{m.body}</div></button>)}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Camera</div><div className="grid grid-cols-2 gap-1">{VIEWS.map((v) => <button key={v.id} onClick={() => setView(v.id)} className={cn('rounded border px-1 py-1.5 text-[7px]', view === v.id ? 'border-[var(--line-2)] bg-white/[.06] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>{v.label}</button>)}</div><button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 flex w-full items-center justify-center gap-1 rounded-md border py-1.5 text-[8px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}><RotateCcw size={9} /> Turntable</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Studio</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> clear-coat</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> glass</span><span className="text-[7.5px]">drag to orbit</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{model.id} · configurator</div><Badge tone="green">{model.energy}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{model.name}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{model.body} · {model.seats} seats · {model.length}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Length', v: model.length }, { l: 'Width', v: model.width }, { l: 'Height', v: model.height }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[8px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Paint</span><Palette size={10} className="text-[var(--accent)]" /></div><div className="mt-2 grid grid-cols-3 gap-2">{PAINTS.map((p) => <button key={p.name} onClick={() => setPaint(p.color)} className={cn('rounded-md border p-1.5 text-left', paint === p.color ? 'border-[rgba(83,240,190,.5)]' : 'border-[var(--line)]')}><span className="block h-5 w-full rounded" style={{ background: `#${p.color.toString(16).padStart(6, '0')}` }} /><span className="mt-1 block text-[6.5px] text-[var(--muted)]">{p.name}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Wheels</span><CircleDot size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 flex gap-2">{WHEELS.map((w) => <button key={w.name} onClick={() => setWheel(w.color)} className={cn('flex-1 rounded-md border p-1.5 text-[6.5px]', wheel === w.color ? 'border-[rgba(83,240,190,.5)] text-white' : 'border-[var(--line)] text-[var(--dim)]')}><span className="mx-auto mb-1 block h-3 w-3 rounded-full" style={{ background: `#${w.color.toString(16).padStart(6, '0')}` }} />{w.name}</button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Interior</span><Sofa size={10} className="text-[var(--violet)]" /></div><div className="mt-2 space-y-1 text-[7px] text-[var(--muted)]"><div className="flex justify-between"><span>Seats</span><span className="font-mono text-[var(--dim)]">{model.seats}</span></div><div className="flex justify-between"><span>Dashboard</span><span className="font-mono text-[var(--dim)]">12.3″ display</span></div><div className="flex justify-between"><span>Glass roof</span><span className="font-mono text-[var(--accent)]">available</span></div></div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Efficiency</span><Weight size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1 text-[7px] text-[var(--muted)]"><div className="flex justify-between"><span>Energy</span><span className="font-mono text-[var(--dim)]">{model.energy}</span></div><div className="flex justify-between"><span>Drag</span><span className="font-mono text-[var(--dim)]">{model.drag}</span></div><div className="flex justify-between"><span>Wheelbase</span><span className="font-mono text-[var(--dim)]">{kind === 'bus' ? '6,200' : kind === 'truck' ? '4,200' : '2,700'} mm</span></div></div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Spec sheet exported', `${model.name} specification and configuration exported.`, 'success')}><Gauge size={11} /> Spec sheet</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/ev')}><ArrowRight size={11} /> EV hub</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[{ l: 'Models', v: '5', u: 'body styles', d: 'sedan → truck' }, { l: 'Paint', v: '6', u: 'finishes', d: 'clear-coat' }, { l: 'Wheels', v: '3', u: 'finishes', d: 'alloy' }, { l: 'Seats', v: `${model.seats}`, u: 'configured', d: model.body }].map((k) => <div key={k.l} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.l}</span><Sparkles size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.v} <span className="text-[8px] text-[var(--dim)]">{k.u}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.d}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Model range" title="One platform, five bodies" action={<Badge tone="cyan">EV</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{MODELS.map((m) => <button key={m.id} onClick={() => setKind(m.id)} className={cn('rounded border p-2 text-left', kind === m.id ? 'border-[rgba(83,240,190,.4)] bg-[rgba(83,240,190,.05)]' : 'border-[var(--line)]')}><div className="flex justify-between"><span className="text-[8px] text-white">{m.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{m.energy}</span></div><div className="mt-0.5 text-[7px] text-[var(--dim)]">{m.body} · {m.seats} seats · {m.drag}</div></button>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Materials" title="Built from surfaces, not boxes" action={<CheckCircle2 size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">The body is an extruded silhouette with bevels, clear-coat paint, tinted glazing, alloy wheels, brake discs and calipers, interior seats and dashboard, mirrors, plates and lights — all lit by studio softboxes and image-based reflections.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 5 models · 6 paints · 3 wheel finishes · 5 camera views.</div><div className="mt-2 font-mono text-[6px] text-[var(--dim)]">Sedan hero mesh: Khronos CarConcept · CC BY 4.0.</div></Panel>
      </div>
    </div>
  );
}
