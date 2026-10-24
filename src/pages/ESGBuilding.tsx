import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, CheckCircle2, Droplets, Gauge, Leaf, Server, Sparkles, Sun, Thermometer, Wind,
} from 'lucide-react';
import { ESGBuildingScene, type ESGBuildingSelection } from '../components/ESGBuildingScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  ESG_BUILDING_ACTIONS, ESG_BUILDING_ASSETS, ESG_BUILDING_SCENARIOS, ESG_FLOORS,
  OCEAN_OUTCOMES, OCEAN_PILLARS, type EsgBuildingMode, type EsgBuildingScenario,
} from '../lib/esgBuildingData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modes: Array<{ id: EsgBuildingMode; label: string; icon: typeof Sun; color: string }> = [
  { id: 'energy', label: 'Energy', icon: Sun, color: '#f4bd72' },
  { id: 'carbon', label: 'Carbon', icon: Wind, color: '#ff7088' },
  { id: 'water', label: 'Water', icon: Droplets, color: '#45c4f5' },
  { id: 'wellbeing', label: 'Wellbeing', icon: Thermometer, color: '#53f0be' },
];
const scenarioOrder: EsgBuildingScenario[] = ['now', 'retrofit', 'netzero'];

export function ESGBuilding() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<EsgBuildingMode>('carbon');
  const [scenario, setScenario] = useState<EsgBuildingScenario>('now');
  const [selected, setSelected] = useState<ESGBuildingSelection>({ kind: 'floor', floor: ESG_FLOORS[3] });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = ESG_BUILDING_SCENARIOS[scenario];
  const floor = selected?.kind === 'floor' ? selected.floor : null;
  const asset = selected?.kind === 'asset' ? selected : null;
  const floorEnergy = floor ? (floor.energy * (s.energy / 88.4)).toFixed(1) : s.energy.toFixed(1);
  const floorCarbon = floor ? (floor.carbon * (s.carbon / 29.6)).toFixed(1) : s.carbon.toFixed(1);
  const floorComfort = floor ? Math.round(floor.comfort + (s.comfort - 76)) : s.comfort;

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            ESG building <span className="text-[var(--dim)]">/</span> OCEAN twin
          </div>
          <h1 className="display text-[26px] text-white">{t('esgb.title', 'Every floor has a carbon story.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('esgb.desc', 'A 3D ESG building twin for a 12-storey workplace: energy, carbon, water, wellbeing, certifications and AI-led retrofit actions, one floor at a time.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><Leaf size={10} className="text-[var(--accent)]" /> BEAM Plus Platinum</span>
          <span className="chip"><Gauge size={10} className="text-[var(--cyan)]" /> GRESB 82</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dc-ops')}><Server size={12} /> Data centre demo</Button>
          <Button variant="primary" size="sm" onClick={() => toast('AI retrofit plan', 'Chilled-water reset, level 9 setback and solar dispatch queued for approval.', 'success')}><Sparkles size={12} /> AI action plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#030a08]">
            <ESGBuildingScene mode={mode} scenario={scenario} selected={selected} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">ESG building</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">12 floors</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{s.energy} kWh/m²</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--cyan)]">{s.renewable}% renewable</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                {s.year} · <span className="text-[var(--accent)]">{s.label}</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Performance lens</span><Leaf size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">
                {modes.map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]', mode === m.id && 'bg-white/[.045]')}>
                    <m.icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} />
                    <span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span>
                    <span className="font-mono text-[6.5px] text-[var(--dim)]">{m.id === 'energy' ? `${s.energy}` : m.id === 'carbon' ? `${s.carbon}` : m.id === 'water' ? '1.6' : `${s.comfort}`}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Pathway</div>
                {scenarioOrder.map((id) => (
                  <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-[9px]', scenario === id ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}>
                    <span>{ESG_BUILDING_SCENARIOS[id].label}</span><span className="font-mono text-[7px]">{ESG_BUILDING_SCENARIOS[id].year}</span>
                  </button>
                ))}
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">{mode} view</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> low</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> medium</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> high</span>
              <span className="text-[7.5px]">click a floor or rooftop asset</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{floor ? `L${String(floor.level).padStart(2, '0')} · ${floor.use}` : asset ? `${asset.id} · ${asset.type}` : 'Building'}</div><Badge tone="green">{s.label}</Badge></div>
            <h2 className="mt-1 font-display text-[15px] text-white">{floor ? `${floor.area.toLocaleString()} ft² · ${floor.cert}` : asset ? asset.name : 'Ophylla Central'}</h2>
            <div className="mt-0.5 text-[9px] text-[var(--muted)]">{floor ? `Occupancy ${floor.occupancy}% · ${floor.comfort} comfort index` : asset ? `${asset.metric} · ${asset.status}` : '12 floors · 34,600 ft² · BEAM Plus Platinum'}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[{ l: 'Energy', v: `${floorEnergy}`, u: 'kWh/m²' }, { l: 'Carbon', v: `${floorCarbon}`, u: 'kg/m²' }, { l: 'Comfort', v: `${floorComfort}`, u: 'index' }].map((x) => (
                <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[12px] text-white">{x.v} <span className="text-[6.5px] text-[var(--dim)]">{x.u}</span></div></div>
              ))}
            </div>
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Net-zero pathway</span><span className="font-mono text-[8px] text-[var(--accent)]">2040</span></div>
              <div className="mt-2"><Progress value={scenario === 'netzero' ? 100 : scenario === 'retrofit' ? 58 : 32} color="var(--accent)" height={5} /></div>
              <p className="mt-2 text-[8px] leading-relaxed text-[var(--muted)]">{s.note}</p>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Certifications</span><Gauge size={10} className="text-[var(--dim)]" /></div>
              <div className="mt-2 flex flex-wrap gap-1">{['BEAM Plus Platinum', 'LEED Gold', 'WELL Gold', 'ISO 50001', 'TCFD'].map((c) => <span key={c} className="rounded border border-[rgba(62,224,161,.2)] bg-[rgba(62,224,161,.05)] px-1.5 py-0.5 font-mono text-[6.5px] text-[var(--accent)]">{c}</span>)}</div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">AI actions</span><Sparkles size={10} className="text-[var(--accent)]" /></div>
              <div className="mt-2 space-y-1.5">
                {ESG_BUILDING_ACTIONS.map((a) => (
                  <div key={a.title} className="rounded-md border border-[var(--line)] bg-white/[.014] p-2">
                    <div className="flex items-center justify-between gap-2"><span className="text-[8px] text-[#dbe5ee]">{a.title}</span><span className={cn('font-mono text-[6.5px]', a.status === 'Live' ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{a.status}</span></div>
                    <div className="mt-0.5 flex justify-between font-mono text-[6.5px] text-[var(--dim)]"><span>{a.impact}</span><span>{a.owner}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Rooftop assets</span><Sun size={10} className="text-[var(--amber)]" /></div>
              <div className="mt-2 space-y-1">
                {ESG_BUILDING_ASSETS.slice(0, 4).map((a) => (
                  <button key={a.id} onClick={() => setSelected({ kind: 'asset', ...a })} className="flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><span className="flex-1 font-mono text-[7px] text-[var(--muted)]">{a.id}</span><span className="font-mono text-[7px] text-[var(--dim)]">{a.metric}</span></button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('ESG floor brief exported', 'Floor-level carbon, energy, water and wellbeing data exported for assurance.', 'success')}><Activity size={11} /> Floor brief</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/esg')}><Leaf size={11} /> Portfolio ESG</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {OCEAN_OUTCOMES.map((x) => (
          <div key={x.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{x.label}</span><CheckCircle2 size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{x.value}</div><div className="mt-1 text-[7.5px] text-[var(--muted)]">{x.note}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Open building operating model" title="One core, an open overlay, a partner ecosystem" action={<Badge tone="cyan">OCEAN-style</Badge>}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {OCEAN_PILLARS.map((p, i) => (
              <div key={p.name} className="rounded-lg border border-[var(--line)] bg-white/[.014] p-3"><div className="font-mono text-[7px]" style={{ color: p.color }}>0{i + 1}</div><div className="mt-1 text-[9px] text-[#dbe5ee]">{p.name}</div><div className="mt-1 text-[7.5px] leading-relaxed text-[var(--dim)]">{p.note}</div></div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Core platform unifies chillers, HVAC, IoT, meters and facility workflows; the open overlay exposes APIs and edge control.</div>
        </Panel>
        <Panel className="xl:col-span-5" eyebrow="3D data centre" title="From building floors to racks" action={<Server size={12} className="text-[var(--cyan)]" />}>
          <p className="text-[8.5px] leading-relaxed text-[var(--muted)]">The same operating model runs the 3D data centre twin: rack power, cooling, predictive maintenance, AI capacity and carbon. Open the dedicated demo to inspect the hall.</p>
          <button onClick={() => navigate('/dc-ops')} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[rgba(81,214,255,.25)] bg-[rgba(81,214,255,.05)] px-3 py-2 text-left transition-colors hover:bg-[rgba(81,214,255,.09)]"><span><span className="block font-mono text-[7px] uppercase tracking-wider text-[var(--cyan)]">Open demo</span><span className="mt-0.5 block text-[10px] text-white">Data Centre Operations</span></span><ArrowRight size={13} className="text-[var(--cyan)]" /></button>
        </Panel>
      </div>
    </div>
  );
}
