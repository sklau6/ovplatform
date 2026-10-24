import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bike, Bus, Car, CheckCircle2, Gauge, Leaf, MapPin, Navigation,
  Plane, Ship, Sparkles, Train, Users, Zap,
} from 'lucide-react';
import { MobilityScene, type MobilitySelection } from '../components/MobilityScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  MOBILITY_ASSETS, MOBILITY_KPIS, MOBILITY_MODES, MOBILITY_SCENARIOS,
  type MobilityMode, type MobilityScenario,
} from '../lib/mobilityData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { traffic: Car, autonomous: Zap, transit: Train, curb: Bike, carbon: Leaf } as const;
const scenarioOrder: MobilityScenario[] = ['peak', 'event', 'incident'];

export function Mobility() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<MobilityMode>('traffic');
  const [scenario, setScenario] = useState<MobilityScenario>('peak');
  const [selected, setSelected] = useState<MobilitySelection | null>(MOBILITY_ASSETS[0]);
  const [autoRotate, setAutoRotate] = useState(false);
  const s = MOBILITY_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Mobility <span className="text-[var(--dim)]">/</span> smart city operations</div>
          <h1 className="display text-[26px] text-white">{t('mobility.title', 'Move the city, not just the traffic.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('mobility.desc', 'A 3D mobility twin for the Kai Tak precinct: autonomous shuttles, bus and rail interchange, ferry, drones, EV charging, curb allocation and carbon per trip.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 32 vehicles · 4 modes</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/map')}><MapPin size={12} /> Geospatial</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('incident'); toast('Incident response activated', 'Junction 04 rerouting · AV remote supervision · 2-minute ETA.', 'warning'); }}><Sparkles size={12} /> Simulate incident</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <MobilityScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Mobility twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.journey} min</span>
                <span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.onTime}% on time</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--amber)]">{s.cars} vehicles</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[204px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Mobility lens</span><Navigation size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">
                {MOBILITY_MODES.map((m) => {
                  const Icon = modeIcon[m.id];
                  return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>;
                })}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>
                {scenarioOrder.map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{MOBILITY_SCENARIOS[id].label}</button>)}
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">Live network</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> autonomous loop</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> transit</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> road</span>
              <span className="text-[7.5px]">click a vehicle or hub</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Network'}</div><Badge tone="green">{s.label}</Badge></div>
            <h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak mobility network'}</h2>
            <div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? 'One operating picture across road, rail, AV, ferry and curb.'}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[{ l: 'Journey', v: `${s.journey}`, u: 'min' }, { l: 'On-time', v: `${s.onTime}`, u: '%' }, { l: 'Carbon', v: `${s.carbon}`, u: 'g/trip' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[12px] text-white">{x.v} <span className="text-[6.5px] text-[var(--dim)]">{x.u}</span></div></div>)}
            </div>
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Mode share</span><span className="font-mono text-[8px] text-[var(--accent)]">64% shared</span></div>
              <div className="mt-2 space-y-2">
                {[{ l: 'Walk / cycle', v: 28, c: 'var(--accent)' }, { l: 'Rail & bus', v: 36, c: 'var(--cyan)' }, { l: 'Autonomous', v: 18, c: 'var(--violet)' }, { l: 'Private car', v: 18, c: 'var(--amber)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#dbe5ee]">{x.v}%</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${x.v}%`, background: x.c }} /></div></div>)}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Fleet status</span><Bus size={10} className="text-[var(--dim)]" /></div>
              <div className="mt-2 space-y-1">{MOBILITY_ASSETS.slice(0, 5).map((a) => <button key={a.id} onClick={() => setSelected(a)} className="flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><span className="flex-1 font-mono text-[7px] text-[var(--muted)]">{a.id}</span><span className="font-mono text-[7px] text-[var(--dim)]">{a.status}</span></button>)}</div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Curb & charging</span><Zap size={10} className="text-[var(--violet)]" /></div><div className="mt-2 grid grid-cols-3 gap-2">{[{ l: 'EV bays', v: '24' }, { l: 'Occupied', v: '86%' }, { l: 'Loading', v: '2 free' }].map((x) => <div key={x.l} className="rounded border border-[var(--line)] bg-black/15 p-1.5"><div className="text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-[#dbe5ee]">{x.v}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Operational note</span><Sparkles size={10} className="text-[var(--accent)]" /></div><p className="mt-1.5 text-[8px] leading-relaxed text-[var(--muted)]">{s.note}</p></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Mobility plan exported', 'Network KPIs, mode share, fleet status and incidents exported.', 'success')}><Navigation size={11} /> Export</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/twin')}><ArrowRight size={11} /> Digital twin</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MOBILITY_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Gauge size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[9px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="Mode shift" title="Shared and active travel" action={<Users size={12} className="text-[var(--accent)]" />}>
          <div className="space-y-2">{[{ l: 'Active travel', v: 28, c: 'var(--accent)' }, { l: 'Rail & bus', v: 36, c: 'var(--cyan)' }, { l: 'Autonomous shuttle', v: 18, c: 'var(--violet)' }, { l: 'Private car', v: 18, c: 'var(--amber)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}%</span></div><Progress value={x.v} color={x.c} height={4} /></div>)}</div>
        </Panel>
        <Panel className="xl:col-span-4" eyebrow="Autonomous operations" title="AV loop and remote supervision" action={<Badge tone="green">4 pods</Badge>}>
          <div className="space-y-1.5">{['12 stops · 6.4 km loop', 'Remote supervisor armed', 'LiDAR + V2X connected', 'Average 24 km/h · 82% SoC'].map((x) => <div key={x} className="flex items-center gap-2 text-[8px]"><CheckCircle2 size={9} className="text-[var(--accent)]" /><span className="text-[var(--muted)]">{x}</span></div>)}</div>
          <div className="mt-3 flex items-center gap-2 text-[8px] text-[var(--dim)]"><Plane size={9} className="text-[var(--cyan)]" /> Drone corridors above 90 m.</div>
        </Panel>
        <Panel className="xl:col-span-3" eyebrow="Multi-modal" title="One interchange" action={<Ship size={12} className="text-[var(--cyan)]" />}>
          <div className="space-y-2">{[{ l: 'MTR', v: '4 min' }, { l: 'Bus', v: '2 min' }, { l: 'Ferry', v: '12 min' }, { l: 'AV', v: '3 min' }].map((x) => <div key={x.l} className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#dbe5ee]">{x.v}</span></div>)}</div>
        </Panel>
      </div>
    </div>
  );
}
