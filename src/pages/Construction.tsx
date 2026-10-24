import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Boxes, Camera, CheckCircle2, Clock3, HardHat, Layers,
  MapPin, Pause, Play, RotateCw, ScanLine, ShieldAlert, TriangleAlert, Truck,
} from 'lucide-react';
import { ConstructionScene } from '../components/ConstructionScene';
import { Badge, Button, LiveTag, Panel, Progress } from '../components/ui';
import {
  CONSTRUCTION_LAYERS, CONSTRUCTION_STAGES, SITE_RISKS,
  type ConstructionLayerId, type ConstructionStageId,
} from '../lib/platformData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const statusIcon = {
  done: <CheckCircle2 size={11} className="text-[var(--accent)]" />,
  active: <span className="live-dot" />,
  queued: <Clock3 size={11} className="text-[var(--dim)]" />,
  risk: <TriangleAlert size={11} className="text-[var(--amber)]" />,
};

export function Construction() {
  const [stageId, setStageId] = useState<ConstructionStageId>('superstructure');
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [layers, setLayers] = useState<Record<ConstructionLayerId, boolean>>({
    bim: true, safety: true, scan: false, logistics: true,
  });
  const { toast } = useLive();
  const { t } = useI18n();

  const stageIndex = CONSTRUCTION_STAGES.findIndex((s) => s.id === stageId);
  const stage = CONSTRUCTION_STAGES[stageIndex];
  const totalProgress = useMemo(() => stage.progress, [stage.progress]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (stageIndex >= CONSTRUCTION_STAGES.length - 1) {
        setPlaying(false);
      } else {
        setStageId(CONSTRUCTION_STAGES[stageIndex + 1].id);
      }
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [playing, stageIndex]);

  const toggleLayer = (id: ConstructionLayerId) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            Construction technology <span className="text-[var(--dim)]">/</span> Kai Tak Tower II
          </div>
          <h1 className="display text-[26px] text-white">{t('construction.title', 'Build the truth, not the narrative.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('construction.desc', 'A 4D site twin connecting BIM, survey control, crane logistics and the field. Every activity carries a time, a zone and an accountable owner.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Site live</span>
          <span className="chip"><Layers size={10} className="text-[var(--accent)]" /> IFC 4.3</span>
          <Button variant="secondary" size="sm" onClick={() => { setPlaying(false); setStageId('superstructure'); toast('4D sequence loaded', 'Superstructure stage · 56% complete · 11-day look-ahead', 'info'); }}>
            <Boxes size={12} /> BIM explorer
          </Button>
          <Button variant="primary" size="sm" onClick={() => setPlaying((v) => !v)}>
            {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? 'Pause 4D' : t('construction.replay', 'Replay 4D')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <ConstructionScene progress={stage.progress / 100} layers={layers} autoRotate={autoRotate} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/78 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">4D site twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">KT-02</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">IFC 4.3</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{totalProgress}% built</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/78 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                Drone sync · 18 min
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[194px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/80 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">{t('construction.layers', 'Site layers')}</span>
                <Layers size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                {CONSTRUCTION_LAYERS.map(({ id, label, hint }) => (
                  <button key={id} onClick={() => toggleLayer(id)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]">
                    <span className={cn('h-1.5 w-1.5 rounded-full', layers[id] ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'bg-[var(--dim)]')} />
                    <span className="flex-1 text-[10px] text-[#c9d5e0]">{t(`construction.layer.${id}`, label)}</span>
                    <span className="font-mono text-[7.5px] text-[var(--dim)]">{hint}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9.5px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>
                  <RotateCw size={11} className={autoRotate ? 'animate-[spin_9s_linear_infinite]' : ''} /> Orbit
                </button>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-[var(--line)] bg-[#050b10]/86 px-3.5 py-2.5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button onClick={() => setPlaying((v) => !v)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#032018] shadow-[0_0_18px_rgba(62,224,161,.4)]" aria-label={playing ? 'Pause 4D sequence' : 'Play 4D sequence'}>
                  {playing ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                </button>
                <div className="flex min-w-[220px] flex-1 items-center gap-1">
                  {CONSTRUCTION_STAGES.map((s, i) => (
                    <button key={s.id} onClick={() => { setPlaying(false); setStageId(s.id); }} className={cn('group relative flex-1 border-t-2 pt-2 text-left transition-colors', i <= stageIndex ? 'border-[var(--accent)]' : 'border-white/10 hover:border-white/25')}>
                      <div className={cn('font-mono text-[7.5px] uppercase tracking-[0.1em]', i === stageIndex ? 'text-[var(--accent)]' : 'text-[var(--dim)]')}>{s.short}</div>
                      <div className={cn('mt-0.5 truncate text-[9.5px]', i === stageIndex ? 'text-white' : 'text-[#9caab5]')}>{t(`construction.stage.${s.id}`, s.label)}</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 border-l border-[var(--line)] pl-4">
                  <div><div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Stage</div><div className="num text-[12px] text-white">{stage.progress}%</div></div>
                  <div><div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Variance</div><div className={cn('num text-[12px]', stage.scheduleVariance > 0 ? 'text-[var(--rose)]' : 'text-[var(--accent)]')}>{stage.scheduleVariance > 0 ? '+' : ''}{stage.scheduleVariance}d</div></div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[94px] left-4 flex items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> on plan</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> watch</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> variance</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">Site control · {stage.short}</div>
              <Badge tone={stage.scheduleVariance > 0 ? 'amber' : 'green'}>{stage.scheduleVariance > 0 ? 'Watch' : 'On plan'}</Badge>
            </div>
            <h2 className="mt-1 font-display text-[15px] text-white">{t(`construction.stage.${stage.id}`, stage.label)}</h2>
            <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--muted)]">{stage.narrative}</p>
            <div className="mt-3 flex items-end justify-between">
              <div><div className="num text-[30px] leading-none text-white">{stage.progress}<span className="text-[12px] text-[var(--dim)]">%</span></div><div className="mt-1 text-[8.5px] text-[var(--dim)]">physical progress</div></div>
              <div className="w-28"><Progress value={stage.progress} color={stage.scheduleVariance > 0 ? 'var(--amber)' : 'var(--accent)'} height={5} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border-b border-[var(--line)] bg-[var(--line)]">
            {[
              { l: 'Workforce', v: stage.workforce.toString(), u: 'on site' },
              { l: 'Open NCRs', v: stage.openNcr.toString(), u: 'quality' },
              { l: 'Safety', v: stage.safety, u: 'TRIR' },
              { l: 'Look-ahead', v: '11', u: 'days' },
            ].map((x) => (
              <div key={x.l} className="bg-[#080e13] px-4 py-3">
                <div className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{x.l}</div>
                <div className="mt-1.5 num text-[16px] text-white">{x.v} <span className="text-[8px] text-[var(--dim)]">{x.u}</span></div>
              </div>
            ))}
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Look-ahead</span><span className="font-mono text-[8px] text-[var(--dim)]">4 activities</span></div>
              <div className="mt-2.5 space-y-2">
                {stage.activities.map((a) => (
                  <div key={`${a.trade}-${a.zone}`} className="rounded-lg border border-[var(--line)] bg-white/[.018] p-2.5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">{statusIcon[a.status]}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[10px] text-[#dbe5ee]">{a.trade}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[8px] text-[var(--dim)]"><MapPin size={8} /> {a.zone} <span className="text-[var(--line-2)]">·</span> {a.planned} <span className="text-[var(--line-2)]">→</span> {a.actual}</div>
                      </div>
                      {a.status === 'risk' && <Badge tone="amber">risk</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">BIM to field</span><span className="font-mono text-[8px] text-[var(--accent)]">within tolerance</span></div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {[{ v: '+18', u: 'mm', l: 'L07 survey' }, { v: '1.8', u: '%', l: 'model variance' }, { v: '96', u: '%', l: 'scan coverage' }].map((x) => (
                  <div key={x.l} className="rounded-md border border-[var(--line)] bg-black/20 p-2">
                    <div className="num text-[13px] text-[var(--accent)]">{x.v}<span className="text-[7px] text-[var(--dim)]">{x.u}</span></div>
                    <div className="mt-0.5 text-[7.5px] text-[var(--dim)]">{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Site risks</span><span className="font-mono text-[8px] text-[var(--rose)]">3 open</span></div>
              <div className="mt-2 space-y-2">
                {SITE_RISKS.map((r) => (
                  <div key={r.title} className="flex items-start gap-2">
                    <ShieldAlert size={11} className={r.severity === 'high' ? 'mt-0.5 shrink-0 text-[var(--rose)]' : 'mt-0.5 shrink-0 text-[var(--amber)]'} />
                    <div className="min-w-0">
                      <div className="text-[8.5px] leading-snug text-[#c9d5e0]">{r.title}</div>
                      <div className="mt-0.5 font-mono text-[7px] text-[var(--dim)]">{r.owner} · {r.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Site package', 'Survey, NCR and crane lift plan exported to the field folder.', 'info')}><Camera size={11} /> Site pack</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => toast('Field instruction issued', 'BIM-to-field variance accepted; survey team notified.', 'success')}><ScanLine size={11} /> Issue</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel eyebrow="Construction technology" title="One field truth" action={<HardHat size={13} className="text-[var(--accent)]" />}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Truck, l: 'Logistics', v: 'Gate 3 · 14 slots' },
              { icon: Activity, l: 'Productivity', v: '0.82 m² / LH' },
              { icon: Layers, l: 'Model federation', v: '42 linked models' },
              { icon: ScanLine, l: 'Scan vs BIM', v: '96% coverage' },
            ].map((x) => (
              <div key={x.l} className="rounded-lg border border-[var(--line)] bg-white/[.018] p-3">
                <x.icon size={13} className="text-[var(--accent)]" />
                <div className="mt-2 text-[8px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                <div className="mt-0.5 text-[10px] text-[#dbe5ee]">{x.v}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel eyebrow="COO lever" title="Where margin leaks" action={<span className="font-mono text-[8px] text-[var(--amber)]">HK$7.2M</span>}>
          <div className="space-y-2.5">
            {[
              { l: 'Rework from late design change', v: 42, c: 'var(--rose)' },
              { l: 'Crane idle time', v: 28, c: 'var(--amber)' },
              { l: 'Material double handling', v: 18, c: 'var(--cyan)' },
              { l: 'Unpriced site instruction', v: 12, c: 'var(--violet)' },
            ].map((x) => (
              <div key={x.l}>
                <div className="mb-1 flex justify-between text-[8.5px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#cfdae4]">{x.v}%</span></div>
                <Progress value={x.v} color={x.c} height={3} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--dim)]"><ArrowRight size={9} className="text-[var(--accent)]" /> Recovery plan reviewed at Friday operating review.</div>
        </Panel>
        <Panel eyebrow="Field governance" title="Human control points" action={<Badge tone="green">enforced</Badge>}>
          <div className="space-y-2">
            {[
              'Crane lift plan — engineer sign-off',
              'Level 9 pour — survey hold point',
              'Façade mock-up — architect approval',
              'Handover gate — client acceptance',
            ].map((x, i) => (
              <div key={x} className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/[.015] px-2.5 py-2">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-[rgba(62,224,161,.28)] font-mono text-[7px] text-[var(--accent)]">{i + 1}</span>
                <span className="text-[8.5px] text-[var(--muted)]">{x}</span>
                <CheckCircle2 size={10} className="ml-auto text-[var(--accent)]" />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="5D commercial control" title="Earned value, not optimism" action={<span className="font-mono text-[8px] text-[var(--amber)]">forecast +2.8%</span>} bodyClassName="!px-0 !pb-0">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Control</th><th>Budget</th><th>Actual / earned</th><th>Forecast</th><th>Variance</th></tr></thead>
              <tbody>
                {[
                  { l: 'Design & approvals', b: 'HK$86M', a: 'HK$81M', f: 'HK$84M', v: '−2.3%' },
                  { l: 'Structure & envelope', b: 'HK$642M', a: 'HK$418M', f: 'HK$668M', v: '+4.0%' },
                  { l: 'MEP & smart systems', b: 'HK$392M', a: 'HK$241M', f: 'HK$404M', v: '+3.1%' },
                  { l: 'Fit-out & commissioning', b: 'HK$300M', a: 'HK$84M', f: 'HK$304M', v: '+1.3%' },
                ].map((r) => (
                  <tr key={r.l}>
                    <td><span className="text-[9.5px] text-[#dbe5ee]">{r.l}</span></td>
                    <td><span className="font-mono text-[9px] text-[var(--muted)]">{r.b}</span></td>
                    <td><span className="font-mono text-[9px] text-[#cfdae4]">{r.a}</span></td>
                    <td><span className="font-mono text-[9px] text-white">{r.f}</span></td>
                    <td><span className={cn('font-mono text-[9px]', r.v.startsWith('−') ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{r.v}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-px border-t border-[var(--line)] bg-[var(--line)]">
            {[{ l: 'CPI', v: '0.96' }, { l: 'SPI', v: '0.98' }, { l: 'Cost to complete', v: 'HK$642M' }].map((x) => (
              <div key={x.l} className="bg-[#080e13] px-4 py-2.5"><div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[14px] text-white">{x.v}</div></div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-5" eyebrow="ISO 19650 · common data environment" title="One model, controlled states" action={<Badge tone="green">CDE live</Badge>}>
          <div className="grid grid-cols-4 gap-2">
            {[{ l: 'WIP', v: '148' }, { l: 'Shared', v: '96' }, { l: 'Published', v: '41' }, { l: 'Archived', v: '312' }].map((x) => (
              <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.015] p-2 text-center">
                <div className="num text-[15px] text-white">{x.v}</div>
                <div className="mt-0.5 font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {[
              { l: 'Federated models', v: '42 linked', ok: true },
              { l: 'Open clashes', v: '3 · structure / MEP', ok: false },
              { l: 'Information requirements', v: 'ISO 19650-2 aligned', ok: true },
              { l: 'Asset information model', v: 'COBie handover ready', ok: true },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2 text-[8.5px]">
                <CheckCircle2 size={10} className={x.ok ? 'text-[var(--accent)]' : 'text-[var(--amber)]'} />
                <span className="flex-1 text-[var(--muted)]">{x.l}</span>
                <span className={cn('font-mono text-[7.5px]', x.ok ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{x.v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--dim)]"><Layers size={9} className="text-[var(--accent)]" /> Common data environment audited against the appointing party’s exchange requirements.</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {['CIC BIM Standards', 'ISO 19650', 'BEAM Plus', 'BD / FSD', 'EMSD', 'CITF'].map((x) => <span key={x} className="rounded border border-[var(--line)] bg-white/[.02] px-1.5 py-0.5 font-mono text-[6.5px] text-[var(--muted)]">{x}</span>)}
          </div>
        </Panel>
      </div>
    </div>
  );
}
