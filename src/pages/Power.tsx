import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, CheckCircle2, Gauge, ShieldCheck, Zap,
} from 'lucide-react';
import { PowerScene, type PowerSelection } from '../components/PowerScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  POWER_ACTIONS, POWER_ASSETS, POWER_KPIS, POWER_MODES, POWER_SCENARIOS,
  type PowerMode, type PowerScenario,
} from '../lib/powerData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { distribution: Zap, load: Gauge, quality: Activity, reliability: ShieldCheck } as const;

export function Power() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<PowerMode>('distribution');
  const [scenario, setScenario] = useState<PowerScenario>('normal');
  const [selected, setSelected] = useState<PowerSelection | null>({ id: 'TX-01', name: 'Transformer 01', type: 'Transformer', metric: '1,500 kVA · 64%', status: 'Loaded' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = POWER_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Electrical distribution <span className="text-[var(--dim)]">/</span> power reliability</div>
          <h1 className="display text-[26px] text-white">{t('power.title', 'Power, controlled end to end.')}</h1>
          <p className="mt-1.5 max-w-[680px] text-[11.5px] text-[var(--muted)]">
            {t('power.desc', 'A 3D electrical room: transformers, LV switchgear, busbars, ATS, UPS, capacitor bank and standby generator, with load, power quality, reliability and outage response.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 7 assets · 1.84 MW</span>
          <span className="chip"><Zap size={10} className="text-[var(--accent)]" /> PF {s.pf}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/energy')}><ArrowRight size={12} /> Energy</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('outage'); toast('Utility outage', 'ATS transferred · generator and UPS carrying · non-critical shed.', 'warning'); }}><ShieldCheck size={12} /> Outage</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <PowerScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Power twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">{s.load} load</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">PF {s.pf}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.status === 'Island' ? 'text-[var(--rose)]' : 'text-[var(--accent)]'}>{s.status}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Power lens</span><Zap size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{POWER_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['normal', 'peak', 'outage'] as PowerScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>{POWER_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Power</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> live</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> backup</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'Power'}</div><Badge tone={selected?.status === 'Standby' ? 'amber' : 'green'}>{selected?.status ?? s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Electrical room'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.metric} · ${selected.status}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Load', v: s.load }, { l: 'PF', v: s.pf }, { l: 'Assets', v: '7' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Assets</span><span className="font-mono text-[8px] text-[var(--accent)]">7 live</span></div><div className="mt-2 space-y-1">{POWER_ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, type: a.type, metric: a.metric, status: a.status })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} /><span className="flex-1 text-[7.5px] text-[var(--muted)]">{a.name}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{a.metric}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Load</span><Gauge size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{[{ l: 'Transformer 01', v: 64 }, { l: 'Transformer 02', v: 58 }, { l: 'LV main', v: 68 }, { l: 'UPS', v: 82 }].map((x) => <div key={x.l}><div className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[var(--dim)]">{x.v}%</span></div><Progress value={x.v} color="var(--accent)" height={3} /></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Actions</span><CheckCircle2 size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1">{POWER_ACTIONS.map((a) => <div key={a.title} className="flex justify-between text-[7px]"><span className="text-[var(--muted)]">{a.title}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Power brief exported', 'Load, quality, reliability and outages exported.', 'success')}><Zap size={11} /> Power brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/energy')}><ArrowRight size={11} /> Energy</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{POWER_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Zap size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Distribution" title="Load by asset" action={<Badge tone="cyan">N+1</Badge>}><div className="space-y-2">{POWER_ASSETS.map((a) => <div key={a.id}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{a.name}</span><span className="font-mono text-[var(--muted)]">{a.metric}</span></div><div className="mt-0.5 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${parseInt(a.metric.match(/(\\d+)%/)?.[1] ?? '50', 10)}%`, background: a.color }} /></div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Reliability" title="Keep the lights on" action={<ShieldCheck size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">N+1 transformers, ATS transfer, UPS ride-through and standby generation protect critical load. Power quality is corrected at the source; outages are rehearsed, not improvised.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> 0.86 MW spare · SAIDI 4.2 min · THD 4.1%.</div></Panel>
      </div>
    </div>
  );
}
