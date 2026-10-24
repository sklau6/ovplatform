import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Building2, CalendarCheck, Coffee, Leaf, Monitor, Sparkles, Thermometer, Users, Wind, Zap,
} from 'lucide-react';
import { WorkplaceScene, type WorkplaceSelection } from '../components/WorkplaceScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  EXPERIENCE_SIGNALS, ROOM_BOOKINGS, WORKPLACE_KPIS, WORKPLACE_MODES, WORKPLACE_SCENARIOS, WORKPLACE_ZONES,
  type WorkplaceMode, type WorkplaceScenario,
} from '../lib/workplaceData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { occupancy: Users, comfort: Thermometer, energy: Zap, bookings: CalendarCheck } as const;

export function Workplace() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<WorkplaceMode>('occupancy');
  const [scenario, setScenario] = useState<WorkplaceScenario>('peak');
  const [selected, setSelected] = useState<WorkplaceSelection | null>({ id: 'Z-01', name: 'Open studio', type: 'Work', detail: '34/48 people · 79 comfort · 18 kWh/m²' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = WORKPLACE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Workplace <span className="text-[var(--dim)]">/</span> tenant experience</div>
          <h1 className="display text-[26px] text-white">{t('work.title', 'The building, as a service.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('work.desc', 'A 3D smart workplace floor: desk and room utilisation, comfort, energy, bookings and tenant experience across an entire occupied level.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Level 08 · 112 people</span>
          <span className="chip"><Wind size={10} className="text-[var(--cyan)]" /> CO₂ 612 ppm</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/proptech')}><Building2 size={12} /> PropTech stack</Button>
          <Button variant="primary" size="sm" onClick={() => toast('Workplace playbook opened', 'Desk reset, room-release and after-hours zoning actions queued.', 'info')}><Sparkles size={12} /> Optimise floor</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <WorkplaceScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Workplace twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.people} people</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.util}% desks</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · comfort {s.comfort}</div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Experience lens</span><Monitor size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{WORKPLACE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Day</div>{(['morning', 'peak', 'evening'] as WorkplaceScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{WORKPLACE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Floor 08</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> low</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> busy</span><span className="text-[7.5px]">click a zone</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Floor 08'}</div><Badge tone="green">{s.label}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Ophylla workplace'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Desks', v: `${s.util}%` }, { l: 'Comfort', v: `${s.comfort}` }, { l: 'Energy', v: `${s.energy}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[12px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Zones</span><span className="font-mono text-[8px] text-[var(--accent)]">6 zones</span></div><div className="mt-2 space-y-1">{WORKPLACE_ZONES.map((z) => <button key={z.id} onClick={() => setSelected({ id: z.id, name: z.name, type: z.type, detail: `${z.occupancy}/${z.capacity} people · ${z.comfort} comfort · ${z.energy} kWh/m²` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === z.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: z.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{z.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{Math.round((z.occupancy / z.capacity) * 100)}%</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Room bookings</span><CalendarCheck size={10} className="text-[var(--violet)]" /></div><div className="mt-2 space-y-1.5">{ROOM_BOOKINGS.map((r) => <div key={r.room} className="rounded border border-[var(--line)] bg-white/[.012] p-1.5"><div className="flex items-center justify-between"><span className="text-[7.5px] text-[var(--muted)]">{r.room}</span><span className={cn('font-mono text-[6.5px]', r.status === 'Available' ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{r.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{r.time} · {r.pax} pax</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Tenant signals</span><Coffee size={10} className="text-[var(--amber)]" /></div><div className="mt-2 grid grid-cols-2 gap-2">{EXPERIENCE_SIGNALS.map((x) => <div key={x.label} className="rounded border border-[var(--line)] bg-black/15 p-1.5"><div className="text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.label}</div><div className="mt-0.5 num text-[10px] text-[#dbe5ee]">{x.value}</div><div className="text-[6px] text-[var(--dim)]">{x.note}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><Leaf size={9} className="text-[var(--accent)]" /> 78% of occupied desks have daylight access.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Workplace brief exported', 'Zone occupancy, comfort, bookings and energy exported.', 'success')}><Users size={11} /> Floor brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/esg-building')}><Leaf size={11} /> ESG building</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{WORKPLACE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><GaugeIcon /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Space performance" title="Utilisation by zone" action={<Badge tone="cyan">live</Badge>}><div className="space-y-2">{WORKPLACE_ZONES.map((z) => <div key={z.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{z.name}</span><span className="font-mono text-[var(--muted)]">{Math.round((z.occupancy / z.capacity) * 100)}%</span></div><Progress value={(z.occupancy / z.capacity) * 100} color={z.color} height={3} /></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Tenant experience" title="What people tell us" action={<Sparkles size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{EXPERIENCE_SIGNALS.map((x) => <div key={x.label} className="flex items-center justify-between border-b border-[var(--line)] py-1.5 last:border-0"><span className="text-[8px] text-[var(--muted)]">{x.label}</span><span className="num text-[11px] text-white">{x.value}</span></div>)}</div><div className="mt-2 text-[7.5px] text-[var(--dim)]">NPS +42 · meeting-room no-show 9% · 2.1 min average wayfinding.</div></Panel>
      </div>
    </div>
  );
}

function GaugeIcon() { return <div className="h-3 w-3 rounded-full border border-[var(--accent)]" />; }
