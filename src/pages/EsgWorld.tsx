import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Atom, CalendarClock, CheckCircle2, CloudSun, Droplets, GitBranch, Globe2, Leaf,
  Radio, ScanLine, Sparkles, TrendingDown, Users, Wind,
} from 'lucide-react';
import { EsgWorldScene } from '../components/EsgWorldScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  WORLD_ASSUMPTIONS, WORLD_BASELINE, WORLD_DISCLOSURE, WORLD_LAYERS, WORLD_LEVERS, WORLD_MATERIALS,
  WORLD_NODES, simulateWorld, type WorldLayer,
} from '../lib/esgWorldData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

type Scenario = 'baseline' | 'transition' | 'netzero';
const ALL_LAYERS: Record<WorldLayer, boolean> = { embodied: true, operational: true, climate: true, social: true };
const DEFAULT_LEVERS = ['lowCarbonConcrete', 'steelReuse', 'circularFitout', 'transitModal', 'greenLease'];

export function EsgWorld() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [year, setYear] = useState(2032);
  const [layers, setLayers] = useState(ALL_LAYERS);
  const [levers, setLevers] = useState<string[]>(DEFAULT_LEVERS);
  const [selected, setSelected] = useState<string | null>('concrete');
  const [tab, setTab] = useState<'world' | 'levers' | 'carbon' | 'disclosure'>('world');
  const [scenario, setScenario] = useState<Scenario>('transition');
  const [autoRotate, setAutoRotate] = useState(true);
  const sim = useMemo(() => simulateWorld(year, levers), [year, levers]);
  const selectedLever = WORLD_LEVERS.find((l) => l.id === selected);

  const setPreset = (s: Scenario) => {
    setScenario(s);
    if (s === 'baseline') { setYear(2026); setLevers([]); }
    if (s === 'transition') { setYear(2034); setLevers(DEFAULT_LEVERS); }
    if (s === 'netzero') { setYear(2040); setLevers(WORLD_LEVERS.map((l) => l.id)); }
  };
  const toggleLever = (id: string) => {
    setScenario('transition');
    setLevers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleLayer = (id: WorldLayer) => setLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">ESG world model <span className="text-[var(--dim)]">/</span> construction · BIM · engineering · PropTech</div>
          <h1 className="display text-[26px] text-white">{t('esgworld.title', 'See the whole life of a building.')}</h1>
          <p className="mt-1.5 max-w-3xl text-[11.5px] text-[var(--muted)]">
            {t('esgworld.desc', 'A causal ESG world model that connects BIM quantities, structural material choices, construction logistics, operational energy, PropTech occupancy data and climate risk — from design to 2050.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> World model · v1.4</span>
          <span className="chip"><Leaf size={10} className="text-[var(--accent)]" /> GHG · GRESB · BEAM</span>
          <Button variant="secondary" size="sm" onClick={() => toast('World-model run complete', '2,400 Monte Carlo paths · climate, cost and carbon coupling updated.', 'success')}><Sparkles size={12} /> Run scenarios</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/esg-building')}><ArrowRight size={12} /> ESG building</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-236px)] min-h-[570px] w-full bg-[#06131a]">
            <EsgWorldScene year={year} layers={layers} levers={levers} selected={selected} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-auto absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/84 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Kai Tak precinct</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">scenario · {scenario}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{sim.total.toFixed(0)} tCO₂e</span></div>
              <button onClick={() => setAutoRotate((v) => !v)} className={cn('rounded-lg border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] backdrop-blur-md', autoRotate ? 'border-[var(--line-2)] bg-white/[.06] text-white' : 'border-[var(--line)] bg-[#050b10]/84 text-[var(--dim)]')}>Turntable</button>
            </div>

            <div className="absolute left-4 top-[66px] z-20 hidden w-[210px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/86 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">World layers</span><Globe2 size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{WORLD_LAYERS.map((l) => <button key={l.id} onClick={() => toggleLayer(l.id)} className={cn('flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left', layers[l.id] ? 'border-transparent bg-white/[.035]' : 'border-[var(--line)] opacity-40')}><span className="h-2 w-2 rounded-sm" style={{ background: l.color }} /><span className="min-w-0 flex-1"><span className="block text-[8px] text-white">{l.label}</span><span className="block text-[6px] text-[var(--dim)]">{l.detail}</span></span></button>)}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">Selected hotspot</div><div className="mt-1 text-[8px] text-white">{selectedLever?.label ?? 'Tower A core'}</div><div className="text-[6.5px] text-[var(--dim)]">{selectedLever?.bim ?? 'IfcMaterial · concrete'}</div></div>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 rounded-xl border border-[var(--line)] bg-[#050b10]/88 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(83,240,190,.12)] text-[var(--accent)]"><CalendarClock size={14} /></div>
                <div className="min-w-0 flex-1"><div className="flex justify-between font-mono text-[7px] uppercase tracking-[0.1em] text-[var(--dim)]"><span>World-model timeline</span><span className="text-[var(--accent)]">{year} · grid {sim.grid.toFixed(2)} kg/kWh</span></div><input type="range" min={2026} max={2050} step={1} value={year} onChange={(e) => { setYear(Number(e.target.value)); setScenario('transition'); }} className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded bg-white/[.12] accent-[var(--accent)]" /><div className="mt-1 flex justify-between font-mono text-[6.5px] text-[var(--dim)]"><span>2026</span><span>2030</span><span>2035</span><span>2040</span><span>2045</span><span>2050</span></div></div>
                <div className="hidden shrink-0 text-right md:block"><div className="num text-[19px] text-white">{sim.total < WORLD_BASELINE.budget2030 ? 'ON' : 'OVER'}</div><div className="font-mono text-[6px] uppercase tracking-wider text-[var(--dim)]">2030 budget</div></div>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-236px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">World model</div><Badge tone="green">{scenario}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">Kai Tak precinct</h2><div className="mt-0.5 text-[8.5px] text-[var(--muted)]">68,400 m² GFA · 312 units · 19 assets</div><div className="mt-3"><div className="flex justify-between font-mono text-[7px] text-[var(--dim)]"><span>2030 carbon budget</span><span className={sim.total < WORLD_BASELINE.budget2030 ? 'text-[var(--accent)]' : 'text-[var(--rose)]'}>{sim.total.toFixed(0)} / {WORLD_BASELINE.budget2030.toLocaleString()} t</span></div><Progress value={Math.min(100, (sim.total / WORLD_BASELINE.budget2030) * 100)} className="mt-1" /></div></div>
          <div className="flex border-b border-[var(--line)]">{[['world', 'World'], ['levers', 'Levers'], ['carbon', 'Carbon'], ['disclosure', 'Disclose']].map(([id, label]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={cn('flex-1 border-b-2 py-2 font-mono text-[7px] uppercase tracking-[0.08em]', tab === id ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--dim)] hover:text-white')}>{label}</button>)}</div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            {tab === 'world' && <div className="p-3"><div className="eyebrow mb-2">Causal chain</div><div className="space-y-1.5">{WORLD_NODES.map((n, i) => <div key={n.id}><div className="flex items-center gap-2 rounded border border-[var(--line)] bg-white/[.018] px-2 py-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} /><span className="flex-1 text-[8px] text-white">{n.label}</span><span className="font-mono text-[7px]" style={{ color: n.color }}>{n.value}</span></div>{i < WORLD_NODES.length - 1 && <div className="ml-3 h-2 border-l border-dashed border-[var(--line-2)]" />}</div>)}</div><div className="mt-2 rounded border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.04)] p-2"><div className="flex items-center justify-between"><span className="text-[7px] text-[var(--accent)]">MODEL CONFIDENCE</span><span className="font-mono text-[8px] text-white">78%</span></div><div className="mt-1 text-[6.5px] leading-relaxed text-[var(--muted)]">Quantities from federated BIM; factors from ICE/EPD; climate from SSP2-4.5. Site-specific validation required.</div></div></div>}

            {tab === 'levers' && <div className="p-2">{WORLD_LEVERS.map((l) => { const on = levers.includes(l.id); return <button key={l.id} onClick={() => toggleLever(l.id)} className={cn('mb-1 flex w-full items-start gap-2 rounded-lg border p-2 text-left', on ? 'border-[rgba(83,240,190,.3)] bg-[rgba(83,240,190,.045)]' : 'border-[var(--line)]')}><span className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border', on ? 'border-[var(--accent)] bg-[var(--accent)] text-[#04120d]' : 'border-[var(--line-2)]')}>{on && <CheckCircle2 size={10} />}</span><span className="min-w-0 flex-1"><span className="flex justify-between"><span className="text-[8px] text-white">{l.label}</span><span className="font-mono text-[6px] text-[var(--dim)]">{l.category}</span></span><span className="mt-0.5 block text-[6.5px] leading-snug text-[var(--dim)]">{l.detail}</span><span className="mt-1 flex gap-2 font-mono text-[6px]"><span className="text-[var(--rose)]">−{(l.embodied * 100).toFixed(0)}% emb</span><span className="text-[var(--amber)]">−{(l.operational * 100).toFixed(0)}% op</span><span className="text-[var(--accent)]">+{l.social} social</span></span></span></button>; })}<div className="mt-2 flex items-center justify-between rounded border border-[var(--line)] p-2 font-mono text-[7px]"><span className="text-[var(--dim)]">CAPEX delta</span><span className="text-white">HKD {sim.capex.toFixed(1)}M</span></div></div>}

            {tab === 'carbon' && <div className="p-3"><div className="eyebrow mb-2">Carbon inventory</div><div className="space-y-2">{[{ l: 'Embodied', v: sim.embodied, c: '#ff7088', max: WORLD_BASELINE.embodied }, { l: 'Operational', v: sim.operational, c: '#f4bd72', max: WORLD_BASELINE.operational }].map((x) => <div key={x.l}><div className="flex justify-between font-mono text-[7px]"><span className="text-[var(--dim)]">{x.l}</span><span className="text-white">{x.v.toFixed(0)} t</span></div><div className="mt-1 h-1.5 overflow-hidden rounded bg-white/[.06]"><div className="h-full rounded" style={{ width: `${Math.min(100, (x.v / x.max) * 100)}%`, background: x.c }} /></div></div>)}</div><div className="mt-3 rounded border border-[var(--line)] p-2"><div className="flex justify-between text-[7px]"><span className="text-[var(--dim)]">Total lifecycle</span><span className="num text-[12px] text-white">{sim.total.toFixed(0)} tCO₂e</span></div><div className="mt-1 flex justify-between text-[7px]"><span className="text-[var(--dim)]">Intensity</span><span className="font-mono text-white">{(sim.total / (WORLD_BASELINE.area / 1000)).toFixed(1)} kg/m²</span></div><div className="mt-1 flex justify-between text-[7px]"><span className="text-[var(--dim)]">2030 budget</span><span className={sim.total < WORLD_BASELINE.budget2030 ? 'font-mono text-[var(--accent)]' : 'font-mono text-[var(--rose)]'}>{sim.total < WORLD_BASELINE.budget2030 ? 'within' : 'over'}</span></div></div><div className="mt-3 eyebrow mb-1">Hotspots</div>{WORLD_MATERIALS.map((m) => <button key={m.item} onClick={() => setSelected(m.item.toLowerCase().includes('concrete') ? 'concrete' : m.item.toLowerCase().includes('steel') ? 'steel' : m.item.toLowerCase().includes('curtain') ? 'facade' : 'mep')} className="flex w-full items-center justify-between rounded px-1 py-1.5 text-left hover:bg-white/[.02]"><span className="text-[7.5px] text-white">{m.item}</span><span className="font-mono text-[6.5px] text-[var(--rose)]">{m.carbon} t</span></button>)}</div>}

            {tab === 'disclosure' && <div className="p-3"><div className="eyebrow mb-2">ESG disclosure</div><div className="space-y-1.5">{WORLD_DISCLOSURE.map((d) => <div key={d.framework} className="rounded border border-[var(--line)] p-2"><div className="flex justify-between"><span className="text-[8px] text-white">{d.framework}</span><span className="font-mono text-[6.5px] text-[var(--accent)]">{d.status}</span></div><div className="mt-0.5 text-[6.5px] text-[var(--dim)]">{d.scope} · {d.detail}</div></div>)}</div><div className="mt-3 rounded border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.04)] p-2 text-[6.5px] leading-relaxed text-[var(--accent)]"><CheckCircle2 size={9} className="inline" /> Every value is traceable to BIM quantity, EPD factor or metered data.</div><div className="mt-3 eyebrow mb-1">Assumptions</div><div className="space-y-1">{WORLD_ASSUMPTIONS.map((a) => <div key={a} className="text-[6.5px] leading-relaxed text-[var(--muted)]">· {a}</div>)}</div></div>}
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('ESG pack exported', 'Carbon, climate, social and disclosure pack exported for GRESB / ISSB review.', 'success')}><Leaf size={11} /> ESG pack</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/esg')}><ArrowRight size={11} /> Portfolio ESG</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[{ l: 'Lifecycle carbon', v: `${sim.total.toFixed(0)}`, u: 'tCO₂e', d: 'embodied + operational', icon: Wind }, { l: 'Energy intensity', v: sim.energy.toFixed(0), u: 'kWh/m²', d: '−24% vs baseline', icon: Radio }, { l: 'Waste diversion', v: `${sim.waste.toFixed(0)}`, u: '%', d: 'circular fit-out', icon: Droplets }, { l: 'Social value', v: sim.social.toFixed(0), u: 'pts', d: 'access + amenity + jobs', icon: Users }, { l: 'Climate risk', v: sim.risk.toFixed(0), u: '/100', d: 'flood + heat + wind', icon: CloudSun }, { l: 'Green premium', v: `${sim.greenPremium > 0 ? '+' : ''}${sim.greenPremium.toFixed(1)}`, u: '%', d: 'value vs. capex', icon: TrendingDown }].map((k) => <div key={k.l} className="panel p-3.5"><div className="flex items-center justify-between"><span className="text-[7.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.l}</span><k.icon size={12} className="text-[var(--accent)]" /></div><div className="mt-1.5 num text-[20px] text-white">{k.v}<span className="ml-0.5 text-[8px] text-[var(--dim)]">{k.u}</span></div><div className="mt-0.5 text-[7px] text-[var(--accent)]">{k.d}</div></div>)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="BIM quantity → carbon" title="The model is the carbon ledger" action={<Atom size={12} className="text-[var(--accent)]" />}><div className="space-y-1">{WORLD_MATERIALS.map((m) => <div key={m.item} className="grid grid-cols-12 items-center gap-2 rounded border border-[var(--line)] px-2 py-1.5"><span className="col-span-3 text-[8px] text-white">{m.item}</span><span className="col-span-3 font-mono text-[6.5px] text-[var(--dim)]">{m.qty}</span><span className="col-span-2 font-mono text-[6.5px] text-[var(--dim)]">{m.factor}</span><span className="col-span-2 text-right font-mono text-[7px] text-[var(--rose)]">{m.carbon} t</span><span className="col-span-2 text-right font-mono text-[6px] text-[var(--accent)]">{m.lever}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Scope" title="Construction to operations" action={<GitBranch size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{[{ l: 'Scope 1 · site & refrigerants', v: '6%' }, { l: 'Scope 2 · purchased energy', v: '24%' }, { l: 'Scope 3 · materials & fit-out', v: '70%' }].map((s) => <div key={s.l}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{s.l}</span><span className="font-mono text-white">{s.v}</span></div><Progress value={Number(s.v.replace('%', ''))} className="mt-1" /></div>)}</div><div className="mt-3 flex items-center gap-1.5 rounded border border-[var(--line)] p-2 text-[6.5px] text-[var(--dim)]"><ScanLine size={10} className="text-[var(--accent)]" /> 486,200 BIM elements · 18 federated models · 4D/5D coupled.</div></Panel>
      </div>
    </div>
  );
}
