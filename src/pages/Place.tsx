import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Accessibility, Calendar, CheckCircle2, Leaf, MapPin, Sparkles, Sun, Trees, Users,
} from 'lucide-react';
import { PlaceScene, type PlaceSelection } from '../components/PlaceScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  PLACE_ACTIONS, PLACE_KPIS, PLACE_MODES, PLACE_SCENARIOS, PLACE_ZONES,
  type PlaceMode, type PlaceScenario,
} from '../lib/placeData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { comfort: Sun, green: Leaf, activation: Users, access: Accessibility } as const;

export function Place() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<PlaceMode>('activation');
  const [scenario, setScenario] = useState<PlaceScenario>('weekday');
  const [selected, setSelected] = useState<PlaceSelection | null>({ id: 'P-01', name: 'Central lawn', type: 'Lawn', detail: '1,240 visits · 81 comfort · 42% canopy' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = PLACE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Public realm <span className="text-[var(--dim)]">/</span> placemaking</div>
          <h1 className="display text-[26px] text-white">{t('place.title', 'The city between buildings.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('place.desc', 'A 3D public-realm twin: lawns, market square, water garden, event stage, play, transit arrival, trees, paths and people — measured for comfort, green, activation and access.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 3,840 visits / day</span>
          <span className="chip"><Trees size={10} className="text-[var(--accent)]" /> 38% canopy</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/mobility')}><MapPin size={12} /> Mobility</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('event'); toast('Event mode activated', 'Stage live · market extended · crowd management on.', 'info'); }}><Sparkles size={12} /> Event mode</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <PlaceScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Public realm twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.footfall}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">comfort {s.comfort}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Place lens</span><Sun size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{PLACE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['weekday', 'event', 'night'] as PlaceScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{PLACE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Public realm</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> green</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> active</span><span className="text-[7.5px]">click a zone</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Public realm'}</div><Badge tone="green">{s.label}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak public realm'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Visits', v: s.footfall.split(' ')[0] }, { l: 'Dwell', v: s.dwell }, { l: 'Comfort', v: `${s.comfort}` }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Zones</span><span className="font-mono text-[8px] text-[var(--accent)]">6 places</span></div><div className="mt-2 space-y-1">{PLACE_ZONES.map((z) => <button key={z.id} onClick={() => setSelected({ id: z.id, name: z.name, type: z.type, detail: `${z.footfall} visits · ${z.comfort} comfort · ${z.canopy}% canopy` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === z.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{z.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{z.footfall}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><Sparkles size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{PLACE_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 100% step-free route to transit arrival.</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Place brief exported', 'Footfall, dwell, comfort, canopy and access exported.', 'success')}><Calendar size={11} /> Place brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/workplace')}><ArrowRight size={11} /> Workplace</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{PLACE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Trees size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Activation" title="Footfall by place" action={<Badge tone="cyan">weekday</Badge>}><div className="space-y-2">{PLACE_ZONES.map((z) => <div key={z.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{z.name}</span><span className="font-mono text-[var(--muted)]">{z.footfall}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(z.footfall / 1240) * 100}%` }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Comfort & access" title="A place for everyone" action={<Accessibility size={12} className="text-[var(--violet)]" />}><div className="space-y-2">{[{ l: 'Canopy cover', v: '38%' }, { l: 'Step-free routes', v: '100%' }, { l: 'Lighting at night', v: '92%' }, { l: 'Sightline coverage', v: '88%' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--accent)]">{x.v}</span></div>)}</div></Panel>
      </div>
    </div>
  );
}
