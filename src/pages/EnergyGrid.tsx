import { useState } from 'react';
import {
  Activity, ArrowRight, BatteryCharging, CheckCircle2, Cpu, Gauge, Radio, Server,
  ShieldCheck, Sun, Wind, Zap,
} from 'lucide-react';
import { EnergyScene } from '../components/EnergyScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  ECOPS_LAYERS, ENERGY_ASSETS, ENERGY_SCENARIOS, HK_COMPLIANCE, ISLAND_SEQUENCE,
  type EnergyScenario,
} from '../lib/energyData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const scenarioOrder: EnergyScenario[] = ['normal', 'peak', 'island', 'carbon'];
const typeIcon = {
  Grid: Zap, Transformer: Cpu, Switchgear: Radio, BESS: BatteryCharging, Solar: Sun,
  Wind: Wind, Load: Server, Cooling: Activity, Generator: Zap, Mobility: BatteryCharging,
} as const;

export function EnergyGrid() {
  const [scenario, setScenario] = useState<EnergyScenario>('normal');
  const [selectedId, setSelectedId] = useState<string | null>('SWG-01');
  const [autoRotate, setAutoRotate] = useState(false);
  const { toast } = useLive();
  const { t } = useI18n();
  const s = ENERGY_SCENARIOS[scenario];
  const selected = ENERGY_ASSETS.find((a) => a.id === selectedId) ?? null;
  const supply = s.grid + s.solar + s.wind + s.bess + s.generator;
  const balance = supply - s.load;

  const choose = (next: EnergyScenario) => {
    setScenario(next);
    toast(`${ENERGY_SCENARIOS[next].label} scenario`, ENERGY_SCENARIOS[next].note, next === 'island' ? 'warning' : 'info');
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            Energy & grid <span className="text-[var(--dim)]">/</span> EcoOps operations
          </div>
          <h1 className="display text-[26px] text-white">{t('energy.title', 'Keep the city powered, whatever the grid does.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('energy.desc', 'A live electrical and microgrid twin for the Kai Tak precinct: grid import, solar, wind, storage, generators, critical loads and island-mode resilience in one operating picture.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> CLP 11 kV · 50 Hz</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> IEC 62443</span>
          <Button variant="secondary" size="sm" onClick={() => toast('EcoOps architecture', 'Connected products → edge control → apps & analytics → managed services.', 'info')}>
            <Cpu size={12} /> EcoOps stack
          </Button>
          <Button variant="primary" size="sm" onClick={() => choose('island')}>
            <Zap size={12} /> Run island test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <EnergyScene scenario={scenario} selectedId={selectedId} autoRotate={autoRotate} onSelect={setSelectedId} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">EcoOps twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">CLP 11 kV</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{s.frequency.toFixed(2)} Hz</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--cyan)]">{s.renewable}% renewable</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                {s.label} · <span className={cn(s.grid === 0 ? 'text-[var(--rose)]' : 'text-[var(--accent)]')}>{s.grid === 0 ? 'islanded' : 'grid-connected'}</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[210px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/82 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">Operating mode</span>
                <Zap size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-1 p-2">
                {scenarioOrder.map((id) => {
                  const item = ENERGY_SCENARIOS[id];
                  return (
                    <button key={id} onClick={() => choose(id)} className={cn('flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-[9px] transition-colors', scenario === id ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}>
                      <span>{item.label}</span>
                      <span className="font-mono text-[7px]">{item.grid === 0 ? 'ISLAND' : `${item.renewable}% RE`}</span>
                    </button>
                  );
                })}
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[22px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">Power flow</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> grid</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#f4d06a]" /> solar</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> wind</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> BESS / load</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> generator</span>
              <span className="text-[7.5px]">click equipment to inspect</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.short} · ${selected.type}` : 'Microgrid'}</div>
              <Badge tone={scenario === 'island' ? 'amber' : 'green'}>{scenario === 'island' ? 'Island' : 'Grid'}</Badge>
            </div>
            <h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak microgrid'}</h2>
            <div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.note ?? 'One operating picture across supply, storage and critical load.'}</div>
            {selected ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { l: 'Load', v: `${selected.load}`, u: 'MW' },
                  { l: 'Capacity', v: `${selected.capacity}`, u: 'MW' },
                  { l: 'Voltage', v: selected.voltage, u: '' },
                  { l: 'Condition', v: `${selected.condition}`, u: '%' },
                ].map((x) => (
                  <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2">
                    <div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                    <div className="mt-0.5 num text-[12px] text-white">{x.v} <span className="text-[7px] text-[var(--dim)]">{x.u}</span></div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Power balance</span><span className="font-mono text-[8px] text-[var(--accent)]">{balance >= 0 ? '+' : ''}{balance.toFixed(1)} MW</span></div>
              <div className="mt-2 space-y-1.5">
                {[
                  { l: 'Grid import', v: s.grid, c: 'var(--amber)' },
                  { l: 'Solar', v: s.solar, c: '#f4d06a' },
                  { l: 'Wind', v: s.wind, c: 'var(--cyan)' },
                  { l: 'BESS discharge', v: s.bess, c: 'var(--accent)' },
                  { l: 'Generators', v: s.generator, c: 'var(--rose)' },
                  { l: 'Critical load', v: s.load, c: 'var(--violet)' },
                ].map((x) => (
                  <div key={x.l}>
                    <div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#cfdae4]">{x.v.toFixed(1)} MW</span></div>
                    <div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (x.v / 10) * 100)}%`, background: x.c }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Resilience state</span><span className="font-mono text-[8px] text-[var(--muted)]">{s.frequency.toFixed(2)} Hz</span></div>
              <div className="mt-2 space-y-1.5">
                {[
                  { l: 'Grid connection', v: s.grid > 0 ? 'Healthy' : 'Lost', ok: s.grid > 0 },
                  { l: 'BESS state of charge', v: `${Math.round(62 + s.bess * 8)}%`, ok: true },
                  { l: 'Generator readiness', v: scenario === 'island' ? 'Running' : 'Standby', ok: true },
                  { l: 'Critical load', v: scenario === 'island' ? '98.2% served' : '100% served', ok: scenario === 'island' },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-2 text-[8px]"><CheckCircle2 size={9} className={x.ok ? 'text-[var(--accent)]' : 'text-[var(--amber)]'} /><span className="flex-1 text-[var(--muted)]">{x.l}</span><span className="font-mono text-[7px] text-[var(--dim)]">{x.v}</span></div>
                ))}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">EcoOps layer</span><span className="font-mono text-[8px] text-[var(--dim)]">L2</span></div>
              <div className="mt-2 flex flex-wrap gap-1">
                {['Microgrid controller', 'Protection', 'Power meters', 'BMS', 'IEC 61850'].map((x) => <span key={x} className="rounded border border-[var(--line)] bg-white/[.02] px-1.5 py-0.5 font-mono text-[7px] text-[var(--muted)]">{x}</span>)}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Carbon position</span><span className="font-mono text-[8px] text-[var(--accent)]">{s.carbon} kg/kWh</span></div>
              <div className="mt-2"><Progress value={Math.max(4, 100 - s.carbon * 120)} color="var(--accent)" height={5} /></div>
              <div className="mt-1.5 flex justify-between font-mono text-[7px] text-[var(--dim)]"><span>grid-heavy</span><span>{s.renewable}% renewable</span><span>low-carbon</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Power quality report', 'THD 2.1% · voltage 398–402 V · no waveform events in 24h.', 'success')}><Gauge size={11} /> PQ report</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => toast('Switching order raised', 'Island-mode sequence staged for the operations team.', 'info')}><ArrowRight size={11} /> Switch</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Grid import', v: s.grid.toFixed(1), u: 'MW', d: s.grid === 0 ? 'islanded' : 'CLP 11 kV' },
          { l: 'Renewable share', v: `${s.renewable}`, u: '%', d: 'solar + wind / load' },
          { l: 'Frequency', v: s.frequency.toFixed(2), u: 'Hz', d: 'nominal 50.00' },
          { l: 'Carbon intensity', v: `${s.carbon}`, u: 'kg/kWh', d: 'location-based' },
        ].map((x) => (
          <div key={x.l} className="panel p-4">
            <div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{x.l}</span><Zap size={12} className="text-[var(--accent)]" /></div>
            <div className="mt-2 num text-[23px] text-white">{x.v} <span className="text-[9px] text-[var(--dim)]">{x.u}</span></div>
            <div className="mt-1 text-[8px] text-[var(--dim)]">{x.d}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="Reference operating model" title="Connected products to managed services" action={<Badge tone="cyan">EcoOps</Badge>}>
          <div className="space-y-2">
            {ECOPS_LAYERS.map((layer) => (
              <div key={layer.level} className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-white/[.014] p-2.5">
                <span className="font-mono text-[8px] text-[var(--accent)]">{layer.level}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-[#dbe5ee]">{layer.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{layer.items.map((i) => <span key={i} className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[6.5px] text-[var(--dim)]">{i}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[7.5px] leading-relaxed text-[var(--dim)]">A Schneider/EcoStruxure-style layered operating model, adapted for Hong Kong grid, OT security and BEAM Plus reporting. No affiliation implied.</div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Hong Kong SAR" title="Grid, code and compliance" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}>
          <div className="space-y-1.5">
            {HK_COMPLIANCE.map((x) => (
              <div key={x.label} className="flex items-start gap-2 rounded-md border border-[var(--line)] bg-white/[.014] px-2.5 py-2">
                <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div className="min-w-0"><div className="text-[8.5px] text-[#dbe5ee]">{x.label}</div><div className="mt-0.5 text-[7px] text-[var(--dim)]">{x.note}</div></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-3" eyebrow="Island test" title="Black-start sequence" action={<span className="font-mono text-[8px] text-[var(--amber)]">T+10s</span>}>
          <div className="relative space-y-3 before:absolute before:bottom-1 before:left-[4px] before:top-1 before:w-px before:bg-[var(--line-2)]">
            {ISLAND_SEQUENCE.map((x) => (
              <div key={x.t} className="relative pl-4">
                <span className={cn('absolute left-0 top-1 h-[7px] w-[7px] rounded-full border-2 border-[#0a1017]', x.state === 'trip' ? 'bg-[var(--rose)]' : x.state === 'done' ? 'bg-[var(--accent)]' : 'bg-[var(--amber)]')} />
                <div className="font-mono text-[7px] text-[var(--dim)]">{x.t}</div>
                <div className="mt-0.5 text-[8px] leading-snug text-[var(--muted)]">{x.event}</div>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => choose('island')}><Zap size={11} /> Replay island sequence</Button>
        </Panel>
      </div>
    </div>
  );
}
