import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BatteryCharging, CheckCircle2, PlugZap, ShieldCheck, Sun, Wrench, Zap,
} from 'lucide-react';
import { EvScene, type EvSelection } from '../components/EvScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  EV_ACTIONS, EV_CHARGERS, EV_KPIS, EV_MODES, EV_SCENARIOS,
  type EvMode, type EvScenario,
} from '../lib/evData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { charging: PlugZap, energy: BatteryCharging, grid: Zap, maintenance: Wrench } as const;

export function Ev() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<EvMode>('charging');
  const [scenario, setScenario] = useState<EvScenario>('peak');
  const [selected, setSelected] = useState<EvSelection | null>({ id: 'DC-01', name: 'DC fast 01', type: 'DC 150 kW', power: '128 kW', status: 'Charging' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = EV_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">EV charging & energy <span className="text-[var(--dim)]">/</span> smart mobility</div>
          <h1 className="display text-[26px] text-white">{t('ev.title', 'Charge the fleet. Protect the grid.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('ev.desc', 'A 3D charging hub: solar canopy, DC fast and AC chargers, vehicles, battery storage and grid connection, with load management, demand response and outage islanding.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 6 chargers · {s.power}</span>
          <span className="chip"><Sun size={10} className="text-[var(--amber)]" /> {s.solar} solar</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/energy')}><ArrowRight size={12} /> Energy</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('outage'); toast('Grid outage', 'Island mode · battery and solar keep priority chargers live.', 'warning'); }}><ShieldCheck size={12} /> Outage</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <EvScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">EV hub</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.power}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.solar} solar</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Island' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">EV lens</span><PlugZap size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{EV_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['peak', 'solar', 'outage'] as EvScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{EV_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Hub</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> charging</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> fault</span><span className="text-[7.5px]">click a charger</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · charger` : 'EV hub'}</div><Badge tone={selected?.status === 'Fault' ? 'rose' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Charging hub'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.type} · ${selected.power} · ${selected.status}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Power', v: s.power }, { l: 'Solar', v: s.solar }, { l: 'Uptime', v: '98.4%' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Chargers</span><span className="font-mono text-[8px] text-[var(--accent)]">6 points</span></div><div className="mt-2 space-y-1">{EV_CHARGERS.map((c) => <button key={c.id} onClick={() => setSelected({ id: c.id, name: c.name, type: c.type, power: c.power, status: c.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === c.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', c.status === 'Fault' ? 'bg-[var(--rose)]' : c.status === 'Available' ? 'bg-[var(--cyan)]' : 'bg-[var(--accent)]')} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{c.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{c.power}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Utilisation</span><GaugeIcon /></div><div className="mt-2 space-y-1.5">{EV_CHARGERS.slice(0, 4).map((c) => <div key={c.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{c.name}</span><span className="font-mono text-[var(--dim)]">{c.status}</span></div><Progress value={c.status === 'Charging' ? 82 : c.status === 'Available' ? 0 : 10} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{EV_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('EV brief exported', 'Charging, energy, grid and maintenance exported.', 'success')}><PlugZap size={11} /> EV brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/energy')}><ArrowRight size={11} /> Energy</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{EV_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><PlugZap size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Energy flow" title="Solar, battery, grid" action={<Badge tone="cyan">62% solar</Badge>}><div className="space-y-2">{[{ l: 'Solar canopy', v: 360, c: 'var(--amber)' }, { l: 'Battery', v: 180, c: 'var(--accent)' }, { l: 'Grid import', v: 120, c: 'var(--cyan)' }, { l: 'Charging load', v: 420, c: 'var(--violet)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v} kW</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(x.v / 420) * 100}%`, background: x.c }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Grid" title="Charge without the spike" action={<Zap size={12} className="text-[var(--cyan)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Battery buffering and smart charging cap the site import, absorb solar surplus and keep priority chargers live during an outage. Demand response is enrolled and tested.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 180 kW peak shaved · 98.4% uptime · 1 connector fault.</div></Panel>
      </div>
    </div>
  );
}

function GaugeIcon() {
  return <BatteryCharging size={10} className="text-[var(--accent)]" />;
}
