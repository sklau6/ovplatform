import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Droplets, Hospital, ShieldCheck, Siren, Tent, Wind, Zap,
} from 'lucide-react';
import { ResilienceScene, type ResilienceSelection } from '../components/ResilienceScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  RESILIENCE_ASSETS, RESILIENCE_KPIS, RESILIENCE_MODES, RESILIENCE_SCENARIOS, RESPONSE_STEPS,
  type ResilienceMode, type ResilienceScenario,
} from '../lib/resilienceData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { flood: Droplets, wind: Wind, power: Zap, response: Siren } as const;

export function Resilience() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<ResilienceMode>('flood');
  const [scenario, setScenario] = useState<ResilienceScenario>('t8');
  const [selected, setSelected] = useState<ResilienceSelection | null>({ id: 'SH-01', name: 'Shelter · Kai Tak community hall', type: 'Shelter', status: 'Open', detail: '420 people · Open' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = RESILIENCE_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Resilience <span className="text-[var(--dim)]">/</span> emergency operations</div>
          <h1 className="display text-[26px] text-white">{t('res.title', 'The city before, during, after.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('res.desc', 'A 3D resilience command twin: typhoon wind and rain, storm surge and flood extent, power outages, shelters, pumps and emergency response routes.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> EOC live · T8</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/twin')}><Wind size={12} /> Digital twin</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('surge'); toast('Storm surge simulated', '1.9 m surge · 5 feeders out · shelters 4 and 5 opening.', 'warning'); }}><AlertTriangle size={12} /> Surge test</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <ResilienceScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Resilience command</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">EOC</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.status}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className="text-[var(--rose)]">{s.flood}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Resilience lens</span><ShieldCheck size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{RESILIENCE_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['t8', 'surge', 'blackout'] as ResilienceScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(255,112,136,.35)] bg-[rgba(255,112,136,.08)] text-[var(--rose)]' : 'border-[var(--line)] text-[var(--dim)]')}>{RESILIENCE_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">EOC</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> shelter</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> pump</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> power</span><span className="text-[7.5px]">click an asset</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.type}` : 'EOC'}</div><Badge tone={s.status === 'Responding' ? 'rose' : 'amber'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'Kai Tak resilience'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected?.detail ?? s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'Flood', v: s.flood }, { l: 'Wind', v: `${s.wind}`, u: 'km/h' }, { l: 'Outages', v: s.outages }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v} <span className="text-[6px] text-[var(--dim)]">{x.u}</span></div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Critical assets</span><span className="font-mono text-[8px] text-[var(--accent)]">7 tracked</span></div><div className="mt-2 space-y-1">{RESILIENCE_ASSETS.map((a) => <button key={a.id} onClick={() => setSelected({ id: a.id, name: a.name, type: a.type, status: a.status, detail: `${a.capacity} · ${a.status}` })} className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-white/[.03]', selected?.id === a.id && 'bg-white/[.03]')}><span className={cn('h-1.5 w-1.5 rounded-full', a.type === 'Shelter' ? 'bg-[var(--accent)]' : a.type === 'Power' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]')} /><span className="flex-1 font-mono text-[6.5px] text-[var(--muted)]">{a.id} · {a.type}</span><span className="font-mono text-[6px] text-[var(--dim)]">{a.status}</span></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Response timeline</span><Siren size={10} className="text-[var(--rose)]" /></div><div className="mt-2 space-y-2">{RESPONSE_STEPS.map((e) => <div key={e.t} className="flex gap-2 text-[7.5px]"><span className="w-9 shrink-0 font-mono text-[var(--dim)]">{e.t}</span><span className={cn(e.tone === 'rose' ? 'text-[var(--rose)]' : e.tone === 'green' ? 'text-[var(--accent)]' : 'text-[var(--muted)]')}>{e.event}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Shelters</span><Tent size={10} className="text-[var(--accent)]" /></div><div className="mt-2 grid grid-cols-2 gap-2">{RESILIENCE_ASSETS.filter((a) => a.type === 'Shelter').map((a) => <div key={a.id} className="rounded border border-[var(--line)] bg-black/15 p-1.5"><div className="font-mono text-[6px] text-[var(--dim)]">{a.id}</div><div className="mt-0.5 text-[7px] text-[var(--muted)]">{a.capacity}</div><div className="font-mono text-[6px] text-[var(--accent)]">{a.status}</div></div>)}</div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('EOC snapshot exported', 'Flood, outages, shelters and response timeline exported.', 'success')}><ShieldCheck size={11} /> EOC pack</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/safety')}><Hospital size={11} /> Site safety</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{RESILIENCE_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><ShieldCheck size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Readiness" title="Before the storm" action={<Badge tone="green">prepared</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{['Shelter capacity verified', 'Drainage and pumps staged', 'Loose objects secured', 'Backup generation tested', 'Public alerts issued', 'Vulnerable residents contacted'].map((x) => <div key={x} className="flex items-center gap-2 rounded border border-[var(--line)] bg-white/[.014] p-2 text-[8px]"><CheckCircle size={9} className="text-[var(--accent)]" /><span className="text-[var(--muted)]">{x}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Watch" title="Next 12 hours" action={<ArrowRight size={12} className="text-[var(--dim)]" />}><div className="space-y-2"><div className="flex items-center gap-2 text-[8px]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /><span className="text-[var(--muted)]">High tide 14:20 · surge peak</span></div><div className="flex items-center gap-2 text-[8px]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /><span className="text-[var(--muted)]">2 feeders remain out · 1,840 customers</span></div><div className="flex items-center gap-2 text-[8px]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /><span className="text-[var(--muted)]">Pumps 03 and 05 running at 84%</span></div></div></Panel>
      </div>
    </div>
  );
}

function CheckCircle({ size = 10, className = '' }: { size?: number; className?: string }) {
  return <span className={className} style={{ display: 'inline-block', width: size, height: size, borderRadius: 99, border: '1px solid currentColor' }} />;
}
