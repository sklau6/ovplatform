import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Boxes, CheckCircle2, ChevronRight, CircleAlert, FileCheck2, Layers,
  Play, RotateCw, ShieldCheck, TriangleAlert,
} from 'lucide-react';
import { BIMScene, type BimSelection } from '../components/BIMScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  BIM_ASSETS, BIM_CLASHES, BIM_DISCIPLINES, BIM_STAGES, BIM_USES, FEDERATION, LOD_LEVELS,
  type BimDiscipline, type BimStage, type LodLevel,
} from '../lib/bimData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const allFilters: Record<BimDiscipline, boolean> = {
  architecture: true, structure: true, mep: true, fire: true, site: true, clashes: true,
};

export function BIMStudio() {
  const [stage, setStage] = useState<BimStage>('mep');
  const [lod, setLod] = useState<LodLevel>(350);
  const [filters, setFilters] = useState<Record<BimDiscipline, boolean>>(allFilters);
  const [selected, setSelected] = useState<BimSelection | null>({ kind: 'clash', clash: BIM_CLASHES[0] });
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const { toast } = useLive();
  const { t } = useI18n();
  const stageIndex = BIM_STAGES.findIndex((s) => s.id === stage);
  const activeStage = BIM_STAGES[stageIndex];
  const openClashes = useMemo(() => BIM_CLASHES.filter((c) => c.status !== 'Resolved'), []);
  const selectedAsset = selected?.kind === 'asset' ? selected.asset : selected?.kind === 'clash' ? BIM_ASSETS.find((a) => a.id === (selected.clash.left.includes('AHU') ? 'AHU-07' : 'C-07')) ?? null : null;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (stageIndex >= BIM_STAGES.length - 1) setPlaying(false);
      else setStage(BIM_STAGES[stageIndex + 1].id);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [playing, stageIndex]);

  const toggleFilter = (id: BimDiscipline) => setFilters((prev) => ({ ...prev, [id]: !prev[id] }));

  const resolveClash = (id: string) => {
    toast('Clash resolution logged', `${id} assigned to the coordination lead; model federation will re-run tonight.`, 'success');
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            BIM studio <span className="text-[var(--dim)]">/</span> construction site
          </div>
          <h1 className="display text-[26px] text-white">{t('bim.title', 'Model once. Build right.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('bim.desc', 'A federated construction-site BIM demo: architecture, structure, MEP and fire protection coordinated before work starts, with 4D sequencing, clash resolution and COBie handover data.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> IFC 4.3 · ISO 19650</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> CIC BIM</span>
          <Button variant="secondary" size="sm" onClick={() => toast('BIM execution plan', 'ISO 19650 roles, information requirements, CDE states and exchange dates issued.', 'success')}>
            <FileCheck2 size={12} /> BIM execution plan
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast('Federation run', '5 models · 31.6k MEP objects · 5 clash results. Audit complete.', 'info')}>
            <Boxes size={12} /> Run clash audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <BIMScene stage={stage} lod={lod} filters={filters} selected={selected} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">BIM studio</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">IFC 4.3</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">LOD {lod}</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">5 federated models</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                {activeStage.label} · <span className="text-[var(--accent)]">{activeStage.progress}%</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[210px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/82 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">Model disciplines</span>
                <Layers size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                {BIM_DISCIPLINES.map((d) => (
                  <button key={d.id} onClick={() => toggleFilter(d.id)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-white/[.04]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color, opacity: filters[d.id] ? 1 : 0.25 }} />
                    <span className={cn('flex-1 text-[9.5px]', filters[d.id] ? 'text-[#dbe5ee]' : 'text-[var(--dim)]')}>{d.label}</span>
                    <span className="font-mono text-[6.5px] text-[var(--dim)]">{d.id === 'clashes' ? '5' : 'on'}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Level of detail</div>
                <div className="grid grid-cols-3 gap-1">
                  {LOD_LEVELS.map((l) => (
                    <button key={l.value} onClick={() => setLod(l.value)} className={cn('rounded-md border py-1.5 font-mono text-[7.5px] transition-colors', lod === l.value ? 'border-[rgba(81,214,255,.4)] bg-[rgba(81,214,255,.1)] text-[var(--cyan)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}>{l.value}</button>
                  ))}
                </div>
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-[var(--line)] bg-[#050b10]/88 px-3.5 py-2.5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button onClick={() => setPlaying((v) => !v)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#032018] shadow-[0_0_18px_rgba(62,224,161,.4)]" aria-label="Play 4D sequence">
                  <Play size={10} fill="currentColor" />
                </button>
                <div className="flex min-w-[220px] flex-1 items-center gap-1">
                  {BIM_STAGES.map((s, i) => (
                    <button key={s.id} onClick={() => { setPlaying(false); setStage(s.id); }} className={cn('group relative flex-1 border-t-2 pt-2 text-left transition-colors', i <= stageIndex ? 'border-[var(--accent)]' : 'border-white/10 hover:border-white/25')}>
                      <div className={cn('font-mono text-[7px] uppercase tracking-[0.1em]', i === stageIndex ? 'text-[var(--accent)]' : 'text-[var(--dim)]')}>{s.short}</div>
                      <div className={cn('mt-0.5 truncate text-[9px]', i === stageIndex ? 'text-white' : 'text-[#9caab5]')}>{s.label}</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 border-l border-[var(--line)] pl-3">
                  <div><div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">Stage</div><div className="num text-[11px] text-white">{activeStage.progress}%</div></div>
                  <div><div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">Clashes</div><div className="num text-[11px] text-[var(--amber)]">{openClashes.length}</div></div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[96px] left-4 flex items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#a991ff]" /> architecture</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> structure</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> MEP</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> fire</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> site</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">Federated model</div>
              <Badge tone="amber">{openClashes.length} clashes</Badge>
            </div>
            <h2 className="mt-1 font-display text-[15px] text-white">KT-02 · Tower II</h2>
            <div className="mt-0.5 text-[9px] text-[var(--muted)]">5 disciplines · 91.4k objects · LOD {lod}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[{ l: 'Models', v: '5' }, { l: 'Objects', v: '91.4k' }, { l: 'COBie', v: '8' }].map((x) => (
                <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[12px] text-white">{x.v}</div></div>
              ))}
            </div>
          </div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Selected object</span><span className="font-mono text-[8px] text-[var(--dim)]">{selected?.kind ?? 'model'}</span></div>
              {selected?.kind === 'clash' ? (
                <div className="mt-2 rounded-lg border border-[rgba(255,112,136,.3)] bg-[rgba(255,112,136,.045)] p-3">
                  <div className="flex items-center justify-between"><span className="font-mono text-[13px] text-[var(--rose)]">{selected.clash.id}</span><Badge tone={selected.clash.severity === 'High' ? 'rose' : 'amber'}>{selected.clash.severity}</Badge></div>
                  <div className="mt-1 text-[10px] text-[#dbe5ee]">{selected.clash.title}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-2 text-[7.5px]">
                    <div><div className="text-[var(--dim)]">Clash distance</div><div className="mt-0.5 font-mono text-[10px] text-white">{selected.clash.distance}</div></div>
                    <div><div className="text-[var(--dim)]">Level</div><div className="mt-0.5 font-mono text-[10px] text-white">{selected.clash.level}</div></div>
                    <div><div className="text-[var(--dim)]">Owner</div><div className="mt-0.5 text-[9px] text-[#dbe5ee]">{selected.clash.owner}</div></div>
                    <div><div className="text-[var(--dim)]">Due</div><div className="mt-0.5 font-mono text-[9px] text-white">{selected.clash.due}</div></div>
                  </div>
                  <div className="mt-2 rounded border border-[var(--line)] bg-black/20 p-2 text-[8px] leading-relaxed text-[var(--muted)]">{selected.clash.recommendation}</div>
                  <button onClick={() => resolveClash(selected.clash.id)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-[rgba(255,112,136,.4)] py-1.5 font-mono text-[8px] uppercase tracking-wider text-[var(--rose)] hover:bg-[rgba(255,112,136,.1)]"><CheckCircle2 size={10} /> Log resolution</button>
                </div>
              ) : selected?.kind === 'asset' ? (
                <div className="mt-2 rounded-lg border border-[rgba(62,224,161,.25)] bg-[rgba(62,224,161,.035)] p-3">
                  <div className="flex items-center justify-between"><span className="font-mono text-[13px] text-[var(--accent)]">{selected.asset.id}</span><Badge tone="green">{selected.asset.status}</Badge></div>
                  <div className="mt-1 text-[10px] text-[#dbe5ee]">{selected.asset.name}</div>
                  <div className="mt-2 space-y-1 text-[8px]">
                    {[{ l: 'COBie type', v: selected.asset.type }, { l: 'Zone', v: selected.asset.zone }, { l: 'Manufacturer', v: selected.asset.manufacturer }, { l: 'Installed', v: selected.asset.installed }, { l: 'Warranty', v: selected.asset.warranty }, { l: 'Maintenance', v: selected.asset.maintenance }].map((x) => (
                      <div key={x.l} className="flex justify-between gap-2"><span className="text-[var(--dim)]">{x.l}</span><span className="text-right text-[var(--muted)]">{x.v}</span></div>
                    ))}
                  </div>
                </div>
              ) : selected?.kind === 'element' ? (
                <div className="mt-2 rounded-lg border border-[rgba(81,214,255,.25)] bg-[rgba(81,214,255,.03)] p-3">
                  <div className="font-mono text-[13px] text-[var(--cyan)]">{selected.id}</div>
                  <div className="mt-1 text-[10px] text-[#dbe5ee]">{selected.type} · {selected.level}</div>
                  <div className="mt-1 font-mono text-[8px] text-[var(--dim)]">{selected.discipline}</div>
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-dashed border-[var(--line-2)] p-3 text-center text-[9px] text-[var(--dim)]">Click a structural, MEP, fire or clash object in the 3D model.</div>
              )}
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Clash register</span><span className="font-mono text-[8px] text-[var(--amber)]">{openClashes.length} open</span></div>
              <div className="mt-2 space-y-1.5">
                {BIM_CLASHES.map((c) => (
                  <button key={c.id} onClick={() => setSelected({ kind: 'clash', clash: c })} className={cn('w-full rounded-md border p-2 text-left transition-colors', selected?.kind === 'clash' && selected.clash.id === c.id ? 'border-[rgba(255,112,136,.35)] bg-[rgba(255,112,136,.04)]' : 'border-[var(--line)] bg-white/[.012] hover:border-[var(--line-2)]')}>
                    <div className="flex items-center gap-2"><span className={cn('h-1.5 w-1.5 rounded-full', c.status === 'Resolved' ? 'bg-[var(--accent)]' : c.severity === 'High' ? 'bg-[var(--rose)]' : 'bg-[var(--amber)]')} /><span className="flex-1 font-mono text-[8px] text-[#dbe5ee]">{c.id}</span><span className="font-mono text-[7px] text-[var(--dim)]">{c.level}</span><ChevronRight size={9} className="text-[var(--dim)]" /></div>
                    <div className="mt-0.5 truncate text-[7.5px] text-[var(--muted)]">{c.title}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Federation</span><span className="font-mono text-[8px] text-[var(--accent)]">5 / 5</span></div>
              <div className="mt-2 space-y-1">
                {FEDERATION.map((f) => (
                  <div key={f.discipline} className="flex items-center gap-2 text-[7.5px]">
                    <CheckCircle2 size={8} className="text-[var(--accent)]" />
                    <span className="flex-1 text-[var(--muted)]">{f.discipline}</span>
                    <span className="font-mono text-[var(--dim)]">{f.version}</span>
                    <span className="font-mono text-[6.5px] text-[var(--accent)]">{f.lod}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Coordination workflow</span><RotateCw size={10} className="text-[var(--dim)]" /></div>
              <div className="mt-2 space-y-1.5">
                {['Detect', 'Assign', 'Resolve', 'Verify', 'Publish'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2"><span className={cn('grid h-4 w-4 place-items-center rounded-full border font-mono text-[6.5px]', i < 3 ? 'border-[rgba(62,224,161,.4)] text-[var(--accent)]' : 'border-[var(--line-2)] text-[var(--dim)]')}>{i + 1}</span><span className={cn('text-[8px]', i < 3 ? 'text-[#c9d5e0]' : 'text-[var(--dim)]')}>{s}</span>{i === 2 && <span className="ml-auto font-mono text-[6.5px] text-[var(--amber)]">3 open</span>}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('COBie export', '8 asset records with warranty and maintenance data exported for the asset information model.', 'success')}><FileCheck2 size={11} /> Export COBie</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => setLod(500)}><Boxes size={11} /> LOD 500</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-8" eyebrow="BIM uses" title="One model, eight construction outcomes" action={<span className="font-mono text-[8px] text-[var(--dim)]">ISO 19650</span>}>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {BIM_USES.map((u, i) => (
              <div key={u.title} className="rounded-lg border border-[var(--line)] bg-white/[.014] p-2.5">
                <div className="font-mono text-[7px] text-[var(--accent)]">0{i + 1}</div>
                <div className="mt-1 text-[8.5px] leading-snug text-[#dbe5ee]">{u.title}</div>
                <div className="mt-1 text-[7px] leading-relaxed text-[var(--dim)]">{u.note}</div>
                <div className="mt-1.5 font-mono text-[6.5px] text-[var(--muted)]">{u.metric}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Federated model register" title="Discipline health" action={<Badge tone="green">audited</Badge>} bodyClassName="!px-0 !pb-0">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Discipline</th><th>Version</th><th>LOD</th><th>Objects</th><th>Status</th></tr></thead>
              <tbody>
                {FEDERATION.map((f) => (
                  <tr key={f.discipline}>
                    <td><span className="text-[9px] text-[#dbe5ee]">{f.discipline}</span></td>
                    <td><span className="font-mono text-[8px] text-[var(--muted)]">{f.version}</span></td>
                    <td><span className="font-mono text-[8px] text-[var(--cyan)]">{f.lod}</span></td>
                    <td><span className="font-mono text-[8px] text-[var(--muted)]">{f.objects}</span></td>
                    <td><span className="font-mono text-[7px] text-[var(--accent)]">{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          { t: 'Coordination before construction', d: 'Federated BIM resolves MEP–structure–architecture conflicts before fabrication and site installation.', icon: Layers },
          { t: '4D sequence linked to objects', d: 'Every floor, service and façade panel is tied to a planned installation window and site zone.', icon: Play },
          { t: 'COBie for the operating asset', d: 'Manufacturer, warranty, installed date and maintenance instructions hand over with the model.', icon: FileCheck2 },
        ].map((x) => (
          <Panel key={x.t} eyebrow="Why it matters" title={x.t} action={<x.icon size={12} className="text-[var(--accent)]" />}>
            <p className="text-[8.5px] leading-relaxed text-[var(--muted)]">{x.d}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
