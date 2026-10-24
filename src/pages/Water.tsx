import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Droplets, Gauge, Leaf, Recycle, ShieldCheck, Siren, Waves, Wrench,
} from 'lucide-react';
import { WaterScene, type WaterSelection } from '../components/WaterScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  WATER_ACTIONS, WATER_ASSETS, WATER_KPIS, WATER_MODES, WATER_SCENARIOS,
  type WaterMode, type WaterScenario,
} from '../lib/waterData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { supply: Waves, quality: Droplets, leaks: Siren, circularity: Recycle } as const;

export function Water() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<WaterMode>('supply');
  const [scenario, setScenario] = useState<WaterScenario>('normal');
  const [selected, setSelected] = useState<WaterSelection | null>({ id: 'RES-01', name: 'Reservoir 01', type: 'Reservoir', status: 'Normal', detail: '82% · 18,400 m³ · Normal' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = WATER_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Water <span className="text-[var(--dim)]">/</span> circular utility operations</div>
          <h1 className="display text-[26px] text-white">{t('water.title', 'Every drop, accounted for.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('water.desc', 'A 3D water and circularity twin: reservoir, treatment, pumps, network pressure, leak detection, water quality and greywater reuse.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 7 assets · network live</span>
          <span className="chip"><Droplets size={10} className="text-[var(--cyan)]" /> NRW {s.nRW}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/esg')}><Leaf size={12} /> ESG portfolio</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('leak'); toast('Leak scenario started', 'Trunk main 03 burst · pressure dropped · crew dispatched.', 'warning'); }}><Siren size={12} /> Leak drill</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <WaterScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Water twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">7 assets</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.pressure}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--cyan)]">{s.nRW}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Water lens</span><Droplets size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{WATER_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['normal', 'drought', 'leak'] as WaterScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(69,196,245,.35)] bg-[rgba(69,196,245,.08)] text-[var(--cyan)]' : 'border-[var(--line)] text-[var(--dim)]')}>{WATER_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Network</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> supply</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> reuse</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> leak</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Water network'}</div><Badge tone={s.status === 'Responding' ? 'rose' : 'cyan'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak water network'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Pressure', v: s.pressure }, { l: 'NRW', v: s.nRW }, { l: 'Quality', v: s.quality }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Assets</span><span className="font-mono text-[8px] text-[var(--accent)]">7 live</span></div><div className="mt-2 space-y-1">{WATER_ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, type: a.type, status: a.status, detail: `${a.metric} · ${a.status}` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', a.type === 'Leak' ? 'bg-[var(--rose)]' : a.type === 'Circular' ? 'bg-[var(--violet)]' : 'bg-[var(--cyan)]')} /><span className="flex-1 font-mono text-[6.5px] text-[var(--muted)]">{a.id} · {a.type}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><Wrench size={10} className="text-[var(--amber)]" /></div><div className="mt-2 space-y-1.5">{WATER_ACTIONS.map((a) => <div key={a.title} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex justify-between gap-2"><span className="text-[7.5px] text-[#dbe5ee]">{a.title}</span><span className="font-mono text-[6px] text-[var(--amber)]">{a.status}</span></div><div className="mt-0.5 font-mono text-[6.5px] text-[var(--dim)]">{a.impact} · {a.owner}</div></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Note</span><Gauge size={10} className="text-[var(--dim)]" /></div><p className="mt-1.5 text-[8px] leading-relaxed text-[var(--muted)]">{s.note}</p></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Water brief exported', 'Supply, quality, leaks and circularity metrics exported.', 'success')}><ShieldCheck size={11} /> Water brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/resilience')}><Siren size={11} /> Resilience</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{WATER_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Droplets size={12} className="text-[var(--cyan)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Water balance" title="Supply, loss and reuse" action={<Badge tone="cyan">28% reuse</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-3">{[{ l: 'Reservoir', v: '82%', c: 'var(--cyan)' }, { l: 'Treated', v: '96.8', c: 'var(--accent)' }, { l: 'Non-revenue', v: '12.4%', c: 'var(--rose)' }].map((x) => <div key={x.l} className="rounded border border-[var(--line)] bg-white/[.014] p-3"><div className="text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-1 num text-[18px] text-white">{x.v}</div></div>)}</div><div className="mt-3 flex items-center gap-1.5 text-[8px] text-[var(--dim)]"><Recycle size={9} className="text-[var(--violet)]" /> Greywater and rainwater recovery supply 28% of non-potable demand.</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Leak response" title="Find it before it spreads" action={<Siren size={12} className="text-[var(--rose)]" />}><div className="space-y-2">{[{ l: 'Acoustic sensors', v: '42 online' }, { l: 'Average detection', v: '38 min' }, { l: 'Crews available', v: '3' }, { l: 'Repair backlog', v: '2 jobs' }].map((x) => <div key={x.l} className="flex justify-between border-b border-[var(--line)] py-1.5 text-[8px] last:border-0"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#dbe5ee]">{x.v}</span></div>)}</div><button onClick={() => setScenario('leak')} className="mt-2 flex w-full items-center justify-between rounded border border-[rgba(255,112,136,.3)] px-2 py-1.5 text-[7.5px] text-[var(--rose)]">Simulate trunk-main burst <ArrowRight size={9} /></button></Panel>
      </div>
    </div>
  );
}
