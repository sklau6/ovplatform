import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Hammer, Landmark, Leaf, ShieldCheck, Sparkles,
} from 'lucide-react';
import { HeritageScene, type HeritageSelection } from '../components/HeritageScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  HERITAGE_ACTIONS, HERITAGE_ELEMENTS, HERITAGE_KPIS, HERITAGE_MODES, HERITAGE_SCENARIOS,
  type HeritageMode, type HeritageScenario,
} from '../lib/heritageData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { heritage: Landmark, structure: ShieldCheck, adaptive: Hammer, carbon: Leaf } as const;

export function Heritage() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<HeritageMode>('heritage');
  const [scenario, setScenario] = useState<HeritageScenario>('museum');
  const [selected, setSelected] = useState<HeritageSelection | null>({ id: 'FAC', name: 'Masonry façade', age: '1898', condition: 'Fair', intervention: 'Repair & repoint', carbon: 'Retained' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = HERITAGE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Heritage & adaptive reuse <span className="text-[var(--dim)]">/</span> placemaking</div>
          <h1 className="display text-[26px] text-white">{t('heritage.title', 'Keep what matters. Add what’s next.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('heritage.desc', 'A 3D heritage adaptive-reuse twin: masonry façade, arched colonnade, timber roof, new core, gallery insertions and courtyard, measured for fabric, carbon and consent.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 82% fabric retained</span>
          <span className="chip"><Leaf size={10} className="text-[var(--accent)]" /> {s.carbon} carbon</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/place')}><ArrowRight size={12} /> Public realm</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('office'); toast('Office adaptive reuse', 'New core and floors · heritage façade retained · Grade A.', 'info'); }}><Sparkles size={12} /> Office scheme</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <HeritageScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Heritage twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.retained} retained</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.carbon} carbon</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--accent)]">{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Heritage lens</span><Landmark size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{HERITAGE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['museum', 'office', 'hotel'] as HeritageScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{HERITAGE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Fabric</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> heritage</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> new</span><span className="text-[7.5px]">click an element</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · element` : 'Heritage'}</div><Badge tone={s.status === 'Planning' ? 'amber' : 'green'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Heritage building'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.age} · ${selected.condition} · ${selected.intervention} · ${selected.carbon}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Fabric', v: s.retained }, { l: 'Carbon', v: s.carbon }, { l: 'GFA', v: '8,400' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Elements</span><span className="font-mono text-[8px] text-[var(--accent)]">6 parts</span></div><div className="mt-2 space-y-1">{HERITAGE_ELEMENTS.map((e) => <button key={e.id} onClick={() => setSelected({ id: e.id, name: e.name, age: e.age, condition: e.condition, intervention: e.intervention, carbon: e.carbon })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === e.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{e.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{e.condition}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Retention</span><Leaf size={10} className="text-[var(--accent)]" /></div><div className="mt-2"><Progress value={82} color="var(--accent)" height={4} /><div className="mt-1 flex justify-between font-mono text-[6.5px] text-[var(--dim)]"><span>0</span><span>82%</span><span>100</span></div></div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{HERITAGE_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Heritage brief exported', 'Fabric, interventions, carbon and consent exported.', 'success')}><Landmark size={11} /> Heritage brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/place')}><ArrowRight size={11} /> Public realm</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{HERITAGE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Landmark size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Interventions" title="Repair, retain, insert" action={<Badge tone="amber">consented</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{HERITAGE_ELEMENTS.map((e) => <div key={e.id} className="rounded border border-[var(--line)] bg-white/[.014] p-2"><div className="flex justify-between"><span className="text-[8px] text-[var(--muted)]">{e.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{e.age}</span></div><div className="mt-0.5 text-[7px] text-[var(--dim)]">{e.intervention} · {e.carbon}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Carbon" title="The greenest building" action={<Leaf size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Retaining 82% of the fabric avoids 1,840 tCO₂e compared with demolition and rebuild. New insertions use low-carbon steel and timber, and the courtyard is reopened to the city.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 64% carbon avoided · public courtyard · conservation-led.</div></Panel>
      </div>
    </div>
  );
}
