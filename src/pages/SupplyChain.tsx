import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Boxes, Factory, Gauge, Globe2, Leaf, Package, Ship, ShieldAlert, Truck, Warehouse,
} from 'lucide-react';
import { SupplyGlobeScene, type SupplySelection } from '../components/SupplyGlobeScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  SUPPLIER_ACTIONS, SUPPLY_KPIS, SUPPLY_MODES, SUPPLY_NODES, SUPPLY_ROUTES, SUPPLY_SCENARIOS,
  type SupplyMode, type SupplyScenario,
} from '../lib/supplyData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { suppliers: Factory, logistics: Ship, inventory: Warehouse, risk: ShieldAlert, carbon: Leaf } as const;

export function SupplyChain() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<SupplyMode>('suppliers');
  const [scenario, setScenario] = useState<SupplyScenario>('normal');
  const [selected, setSelected] = useState<SupplySelection | null>({ id: 'SZX', name: 'Shenzhen prefab', type: 'Prefab', detail: 'Shenzhen · OTIF 96% · risk Low' });
  const [autoRotate, setAutoRotate] = useState(true);
  const s = SUPPLY_SCENARIOS[scenario];
  const node = SUPPLY_NODES.find((n) => n.id === selected?.id);

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Supply chain <span className="text-[var(--dim)]">/</span> construction procurement</div>
          <h1 className="display text-[26px] text-white">{t('supply.title', 'Source the world. Deliver the site.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('supply.desc', 'A 3D global supply-chain twin for prefab, steel, MEP, facades and AV systems: supplier nodes, sea/air/road lanes, inventory, risk and lane carbon in one operating picture.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 9 nodes · 8 lanes</span>
          <span className="chip"><Ship size={10} className="text-[var(--cyan)]" /> OTIF {s.otif}%</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/construction')}><ArrowRight size={12} /> Construction twin</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('port'); toast('Port disruption simulated', 'Singapore transhipment delay · air-freight mitigation active.', 'warning'); }}><ShieldAlert size={12} /> Stress test</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <SupplyGlobeScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Global supply twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">9 nodes</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">OTIF {s.otif}%</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.risk === 'High' ? 'text-[var(--rose)]' : s.risk === 'Medium' ? 'text-[var(--amber)]' : 'text-[var(--accent)]'}>{s.risk} risk</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[200px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Supply lens</span><Globe2 size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{SUPPLY_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['normal', 'port', 'typhoon'] as SupplyScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{SUPPLY_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Network</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> supplier</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> lane</span><span className="text-[7.5px]">click a node</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{node ? `${node.id} · ${node.type}` : 'Supply chain'}</div><Badge tone={node?.risk === 'High' ? 'rose' : node?.risk === 'Medium' ? 'amber' : 'green'}>{node?.risk ?? s.risk}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{node?.name ?? 'Global construction supply'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{node ? `${node.city} · OTIF ${node.otif}% · lead ${node.lead} days` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'OTIF', v: `${s.otif}%` }, { l: 'Lead', v: `${s.lead}d` }, { l: 'Lanes', v: '8' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[12px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Supplier network</span><span className="font-mono text-[8px] text-[var(--accent)]">9 qualified</span></div><div className="mt-2 space-y-1">{SUPPLY_NODES.filter((n) => n.id !== 'HKG').map((n) => <button key={n.id} onClick={() => setSelected({ id: n.id, name: n.name, type: n.type, detail: `${n.city} · OTIF ${n.otif}% · risk ${n.risk}` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === n.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', n.risk === 'High' ? 'bg-[var(--rose)]' : n.risk === 'Medium' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} /><span className="flex-1 font-mono text-[7px] text-[var(--muted)]">{n.id} · {n.city}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{n.otif}%</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Lanes</span><Ship size={10} className="text-[var(--cyan)]" /></div><div className="mt-2 space-y-1">{SUPPLY_ROUTES.slice(0, 6).map((r) => <div key={`${r.from}-${r.to}`} className="flex items-center gap-2 text-[7px]"><span className="w-9 font-mono text-[var(--cyan)]">{r.mode}</span><span className="flex-1 text-[var(--muted)]">{r.from} → {r.to}</span><span className="font-mono text-[var(--dim)]">{r.carbon} kg/t</span></div>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Inventory cover</span><Package size={10} className="text-[var(--violet)]" /></div><div className="mt-2 space-y-2">{[{ l: 'Prefab modules', v: 72, c: 'var(--accent)' }, { l: 'Steel', v: 58, c: 'var(--cyan)' }, { l: 'MEP packages', v: 64, c: 'var(--violet)' }, { l: 'Facade', v: 41, c: 'var(--amber)' }].map((x) => <div key={x.l}><div className="flex justify-between text-[7.5px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--muted)]">{x.v}%</span></div><Progress value={x.v} color={x.c} height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Note</span><Truck size={10} className="text-[var(--dim)]" /></div><p className="mt-1.5 text-[8px] leading-relaxed text-[var(--muted)]">{s.note}</p></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Supply plan exported', 'Nodes, lanes, risk and inventory cover exported for the procurement review.', 'success')}><Boxes size={11} /> Export</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/safety')}><Gauge size={11} /> Site safety</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{SUPPLY_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Globe2 size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Procurement actions" title="Remove single-source exposure" action={<Badge tone="amber">4 actions</Badge>}>{SUPPLIER_ACTIONS.map((a) => <div key={a.title} className="flex items-start gap-2 border-b border-[var(--line)] py-2 last:border-0"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /><div className="min-w-0 flex-1"><div className="text-[8.5px] text-[#dbe5ee]">{a.title}</div><div className="mt-0.5 font-mono text-[7px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div><span className="font-mono text-[6.5px] text-[var(--amber)]">{a.status}</span></div>)}</Panel>
        <Panel className="xl:col-span-5" eyebrow="Lane carbon" title="Lower-carbon routes" action={<Leaf size={12} className="text-[var(--accent)]" />}>{SUPPLY_ROUTES.slice(0, 5).map((r) => <div key={`${r.from}-${r.to}`} className="flex items-center gap-2 border-b border-[var(--line)] py-1.5 last:border-0 text-[7.5px]"><span className="w-9 font-mono text-[var(--cyan)]">{r.mode}</span><span className="flex-1 text-[var(--muted)]">{r.from} → {r.to}</span><span className="w-12"><Progress value={Math.min(100, r.carbon)} color={r.carbon > 50 ? 'var(--rose)' : 'var(--accent)'} height={3} /></span><span className="font-mono text-[var(--dim)]">{r.carbon}</span></div>)}</Panel>
      </div>
    </div>
  );
}
