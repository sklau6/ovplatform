import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Leaf, Package, Recycle, Truck, Wallet, Weight,
} from 'lucide-react';
import { WasteScene, type WasteSelection } from '../components/WasteScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  WASTE_ACTIONS, WASTE_KPIS, WASTE_MODES, WASTE_SCENARIOS, WASTE_STREAMS,
  type WasteMode, type WasteScenario,
} from '../lib/wasteData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { streams: Package, diversion: Recycle, carbon: Leaf, market: Wallet } as const;

export function Waste() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<WasteMode>('streams');
  const [scenario, setScenario] = useState<WasteScenario>('baseline');
  const [selected, setSelected] = useState<WasteSelection | null>({ id: 'CON', name: 'Concrete', type: 'Inert', tons: 1860, diversion: '92%', value: 'HK$340k' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = WASTE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Waste & circularity <span className="text-[var(--dim)]">/</span> construction resources</div>
          <h1 className="display text-[26px] text-white">{t('waste.title', 'Nothing is wasted.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('waste.desc', 'A 3D construction waste and circularity yard: material streams, skips, crusher, conveyor, recovery, carbon avoided and material value.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 4,820 t · 6 streams</span>
          <span className="chip"><Recycle size={10} className="text-[var(--accent)]" /> {s.diversion} diverted</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/esg')}><Leaf size={12} /> ESG</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('demolition'); toast('Selective demolition scenario', 'Steel and concrete recovery maximised · 88% diversion.', 'info'); }}><Recycle size={12} /> Demolition</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <WasteScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Circularity yard</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.tonnage}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.diversion} diverted</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Waste lens</span><Recycle size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{WASTE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['baseline', 'demolition', 'retrofit'] as WasteScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{WASTE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Yard</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> recover</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> mixed</span><span className="text-[7.5px]">click a stream</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Circularity'}</div><Badge tone="green">{s.diversion}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Construction waste'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.tons} t · ${selected.diversion} diverted · ${selected.value}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Waste', v: s.tonnage }, { l: 'Diversion', v: s.diversion }, { l: 'Streams', v: '6' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Streams</span><span className="font-mono text-[8px] text-[var(--accent)]">6 materials</span></div><div className="mt-2 space-y-1">{WASTE_STREAMS.map((st) => <button key={st.id} onClick={() => setSelected({ id: st.id, name: st.name, type: st.type, tons: st.tons, diversion: st.diversion, value: st.value })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === st.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{st.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{st.tons} t</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Diversion</span><Recycle size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{WASTE_STREAMS.slice(0, 4).map((st) => <div key={st.id}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{st.name}</span><span className="font-mono text-[var(--dim)]">{st.diversion}</span></div><Progress value={parseInt(st.diversion, 10)} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{WASTE_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Circularity brief exported', 'Streams, diversion, carbon and value exported.', 'success')}><Weight size={11} /> Circularity brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/esg')}><ArrowRight size={11} /> ESG</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{WASTE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Recycle size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Material recovery" title="Tons by stream" action={<Badge tone="cyan">6 streams</Badge>}><div className="space-y-2">{WASTE_STREAMS.map((st) => <div key={st.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{st.name}</span><span className="font-mono text-[var(--muted)]">{st.tons} t · {st.value}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${(st.tons / 1860) * 100}%`, background: st.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Circularity" title="Passport and provenance" action={<Truck size={12} className="text-[var(--cyan)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Every recovered material is tagged with source, quantity, diversion route and a material passport. Reuse is preferred, then recycling, then recovery — landfill is the last resort.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 1,240 tCO₂e avoided · HK$2.2M material value.</div></Panel>
      </div>
    </div>
  );
}
