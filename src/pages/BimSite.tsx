import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Boxes, Building2, CalendarClock, CheckCircle2, ClipboardList,
  FileCheck2, HardHat, Layers, Moon, Pause, Play, RotateCcw, Ruler, ScanLine, ShieldCheck, Sun, Truck, Users,
} from 'lucide-react';
import { BimSiteScene } from '../components/BimSiteScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  SITE_CLASHES, SITE_DISCIPLINES, SITE_LOGISTICS, SITE_MILESTONES, SITE_MODELS,
  SITE_PROJECT, SITE_QUANTITIES, SITE_TASKS, type SiteDiscipline, type SiteView,
} from '../lib/bimSiteData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const ALL_DISCIPLINES: Record<SiteDiscipline, boolean> = {
  structure: true, architecture: true, mep: true, facade: true, civil: true, temporary: true,
};

const VIEWS: Array<{ id: SiteView; label: string; icon: typeof Building2 }> = [
  { id: 'site', label: 'Site', icon: HardHat },
  { id: 'bim', label: 'BIM', icon: Boxes },
  { id: 'asbuilt', label: 'As-built', icon: ScanLine },
];

export function BimSite() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [progress, setProgress] = useState(SITE_PROJECT.progress);
  const [disciplines, setDisciplines] = useState(ALL_DISCIPLINES);
  const [showClashes, setShowClashes] = useState(true);
  const [view, setView] = useState<SiteView>('site');
  const [selectedClash, setSelectedClash] = useState<string | null>(SITE_CLASHES[0].id);
  const [tab, setTab] = useState<'model' | '4d' | 'clash' | 'qty'>('model');
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'dusk'>('day');

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPlaying(false); return 100; }
        return Math.min(100, p + 1);
      });
    }, 160);
    return () => window.clearInterval(timer);
  }, [playing]);

  const openClashes = useMemo(() => SITE_CLASHES.filter((c) => c.status.startsWith('Open') || c.status === 'In review'), []);
  const activeTask = SITE_TASKS.find((task) => task.status === 'active') ?? SITE_TASKS[0];
  const clash = SITE_CLASHES.find((c) => c.id === selectedClash) ?? SITE_CLASHES[0];

  const toggleDiscipline = (id: SiteDiscipline) => setDisciplines((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">BIM on site <span className="text-[var(--dim)]">/</span> Kai Tak 4B</div>
          <h1 className="display text-[26px] text-white">{t('bimsite.title', 'From model to site.')}</h1>
          <p className="mt-1.5 max-w-3xl text-[11.5px] text-[var(--muted)]">
            {t('bimsite.desc', 'A professional BIM demo on a live Kai Tak construction site: federated design, 4D sequence, site logistics, clash resolution and as-built verification for Tower A.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> IFC 4.3 · ISO 19650</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> LOD 350</span>
          <Button variant="secondary" size="sm" onClick={() => toast('BIM execution plan issued', 'ISO 19650 roles, EIR, MIDP, TIDP and CDE exchange dates issued to the supply chain.', 'success')}><FileCheck2 size={12} /> BEP</Button>
          <Button variant="primary" size="sm" onClick={() => { setTab('clash'); toast('Federation run complete', '18 models · 486,200 elements · 47 open clashes · 312 resolved.', 'info'); }}><Boxes size={12} /> Run federation</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[600px] w-full bg-[#081318]">
            <BimSiteScene progress={progress} disciplines={disciplines} showClashes={showClashes} view={view} selectedClash={selectedClash} autoRotate={autoRotate} timeOfDay={timeOfDay} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-auto absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/84 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Live site · Tower A</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">L21 / 34</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{progress}% complete</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[#050b10]/84 p-1 backdrop-blur-md">
                <button onClick={() => setTimeOfDay('day')} className={cn('flex items-center gap-1 rounded px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em]', timeOfDay === 'day' ? 'bg-[rgba(244,189,114,.16)] text-[#ffd79b]' : 'text-[var(--dim)] hover:text-white')}><Sun size={10} /> Day</button>
                <button onClick={() => setTimeOfDay('dusk')} className={cn('flex items-center gap-1 rounded px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em]', timeOfDay === 'dusk' ? 'bg-white/[.08] text-white' : 'text-[var(--dim)] hover:text-white')}><Moon size={10} /> Dusk</button>
                <span className="mx-0.5 h-4 w-px bg-[var(--line-2)]" />
                {VIEWS.map((v) => <button key={v.id} onClick={() => setView(v.id)} className={cn('flex items-center gap-1 rounded px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em]', view === v.id ? 'bg-white/[.08] text-white' : 'text-[var(--dim)] hover:text-white')}><v.icon size={10} /> {v.label}</button>)}
              </div>
            </div>

            <div className="absolute left-4 top-[66px] z-20 hidden w-[204px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/86 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Model layers</span><Layers size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">
                {SITE_DISCIPLINES.map((d) => <button key={d.id} onClick={() => toggleDiscipline(d.id)} className={cn('flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left', disciplines[d.id] ? 'border-transparent bg-white/[.035]' : 'border-[var(--line)] opacity-45')}><span className="h-2 w-2 rounded-sm" style={{ background: d.color }} /><span className="flex-1 text-[8px] text-white">{d.label}</span><span className="font-mono text-[6px] text-[var(--dim)]">{d.elements}</span></button>)}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <button onClick={() => setShowClashes((v) => !v)} className={cn('flex w-full items-center justify-between rounded-md border px-2 py-1.5', showClashes ? 'border-[rgba(255,112,136,.3)] bg-[rgba(255,112,136,.06)]' : 'border-[var(--line)]')}><span className="flex items-center gap-1.5 text-[8px] text-white"><AlertTriangle size={9} className="text-[var(--rose)]" /> Clash markers</span><span className="font-mono text-[7px] text-[var(--rose)]">{openClashes.length} open</span></button>
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 flex w-full items-center justify-center gap-1 rounded-md border py-1.5 text-[8px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}><RotateCcw size={9} /> Turntable</button>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[76px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">On site</span><span className="flex items-center gap-1"><Users size={9} /> {SITE_PROJECT.workers}</span><span className="flex items-center gap-1"><Truck size={9} /> {SITE_PROJECT.deliveries} deliveries</span><span className="flex items-center gap-1"><Building2 size={9} /> 2 tower cranes</span><span className="text-[7.5px]">drag to orbit</span>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 rounded-xl border border-[var(--line)] bg-[#050b10]/88 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying((v) => !v)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[#04120d]">{playing ? <Pause size={14} /> : <Play size={14} />}</button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between font-mono text-[7.5px] uppercase tracking-[0.12em] text-[var(--dim)]"><span>4D construction sequence</span><span className="text-[var(--accent)]">{progress}% · {activeTask.name}</span></div>
                  <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded bg-white/[.12] accent-[var(--accent)]" />
                  <div className="mt-1 flex justify-between font-mono text-[6.5px] text-[var(--dim)]">{SITE_MILESTONES.map((m) => <span key={m.date}>{m.date}</span>)}</div>
                </div>
                <div className="hidden shrink-0 text-right md:block"><div className="num text-[20px] text-white">{progress}%</div><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">complete</div></div>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">Project</div><Badge tone="green">On programme</Badge></div>
            <h2 className="mt-1 font-display text-[14px] leading-snug text-white">{SITE_PROJECT.name}</h2>
            <div className="mt-0.5 text-[8.5px] text-[var(--muted)]">{SITE_PROJECT.site}</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[7px]"><div className="rounded border border-[var(--line)] bg-white/[.018] p-1.5"><span className="text-[var(--dim)]">Contract</span><div className="num mt-0.5 text-[8.5px] text-white">{SITE_PROJECT.contract}</div></div><div className="rounded border border-[var(--line)] bg-white/[.018] p-1.5"><span className="text-[var(--dim)]">GFA</span><div className="num mt-0.5 text-[8.5px] text-white">{SITE_PROJECT.gfa}</div></div></div>
            <div className="mt-2"><div className="flex justify-between font-mono text-[7px] text-[var(--dim)]"><span>Level 21 of 34</span><span className="text-[var(--accent)]">{progress}%</span></div><Progress value={progress} className="mt-1" /></div>
          </div>

          <div className="flex border-b border-[var(--line)]">
            {([['model', 'Model'], ['4d', '4D'], ['clash', 'Clash'], ['qty', 'Qty']] as const).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={cn('flex-1 border-b-2 py-2 font-mono text-[7px] uppercase tracking-[0.1em]', tab === id ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--dim)] hover:text-white')}>{label}</button>)}
          </div>

          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            {tab === 'model' && <div className="divide-y divide-[var(--line)]">{SITE_MODELS.map((m) => <div key={m.name} className="px-4 py-2.5"><div className="flex items-center justify-between gap-2"><span className="truncate font-mono text-[8px] text-white">{m.name}</span><span className="shrink-0 font-mono text-[6.5px] text-[var(--dim)]">{m.version}</span></div><div className="mt-1 flex items-center justify-between"><span className="text-[7px] text-[var(--dim)]">{m.discipline} · {m.updated}</span><span className={cn('font-mono text-[6.5px] uppercase tracking-wider', m.status === 'Published' ? 'text-[var(--accent)]' : m.status === 'Shared' ? 'text-[var(--cyan)]' : 'text-[var(--amber)]')}>{m.status}</span></div></div>)}</div>}

            {tab === '4d' && <div className="p-3"><div className="mb-2 flex items-center justify-between"><span className="eyebrow">Sequence</span><span className="font-mono text-[7px] text-[var(--dim)]">{SITE_TASKS.length} tasks</span></div><div className="space-y-2">{SITE_TASKS.map((task) => <button key={task.id} onClick={() => setProgress(Math.round(task.end))} className="w-full text-left"><div className="flex items-center justify-between font-mono text-[7px]"><span className="text-white">{task.id} · {task.trade}</span><span className={cn(task.status === 'done' ? 'text-[var(--accent)]' : task.status === 'active' ? 'text-[var(--amber)]' : 'text-[var(--dim)]')}>{task.status}</span></div><div className="mt-0.5 truncate text-[7.5px] text-[var(--muted)]">{task.name}</div><div className="mt-1 h-1 overflow-hidden rounded bg-white/[.06]"><div className={cn('h-full rounded', task.status === 'done' ? 'bg-[var(--accent)]' : task.status === 'active' ? 'bg-[var(--amber)]' : 'bg-white/20')} style={{ width: `${task.end}%` }} /></div></button>)}</div></div>}

            {tab === 'clash' && <div className="p-3"><div className="mb-2 flex items-center justify-between"><span className="eyebrow">Coordination</span><span className="font-mono text-[7px] text-[var(--rose)]">{openClashes.length} open</span></div><div className="space-y-2">{SITE_CLASHES.map((c) => <button key={c.id} onClick={() => { setSelectedClash(c.id); setShowClashes(true); }} className={cn('w-full rounded-lg border p-2 text-left', c.id === selectedClash ? 'border-[rgba(255,112,136,.4)] bg-[rgba(255,112,136,.055)]' : 'border-[var(--line)]')}><div className="flex items-center justify-between"><span className="font-mono text-[7.5px] text-white">{c.id} · {c.level}</span><span className={cn('rounded px-1 py-0.5 font-mono text-[6px] uppercase', c.severity === 'high' ? 'bg-[rgba(255,112,136,.12)] text-[var(--rose)]' : c.severity === 'medium' ? 'bg-[rgba(244,189,114,.1)] text-[var(--amber)]' : 'bg-white/[.06] text-[var(--dim)]')}>{c.severity}</span></div><div className="mt-1 text-[7.5px] leading-snug text-[var(--muted)]">{c.title}</div><div className="mt-1 font-mono text-[6.5px] text-[var(--dim)]">{c.a} ↔ {c.b}</div><div className="mt-1 font-mono text-[6.5px] text-[var(--amber)]">{c.status}</div></button>)}</div><Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => toast('Clash report exported', 'BCF 3.0 issue package with viewpoints, components and comments exported.', 'success')}><FileCheck2 size={10} /> Export BCF</Button></div>}

            {tab === 'qty' && <div className="p-2">{SITE_QUANTITIES.map((q) => <div key={q.item} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-white/[.02]"><div><div className="text-[8px] text-white">{q.item}</div><div className="font-mono text-[6.5px] text-[var(--dim)]">{q.variance} vs. budget</div></div><div className="text-right"><span className="num text-[9px] text-white">{q.qty}</span><span className="ml-0.5 font-mono text-[6.5px] text-[var(--dim)]">{q.unit}</span></div></div>)}<div className="mt-2 rounded border border-[var(--line)] bg-white/[.018] p-2"><div className="flex items-center justify-between"><span className="text-[7px] text-[var(--dim)]">5D earned value</span><span className="font-mono text-[8px] text-[var(--accent)]">CPI 1.04</span></div><div className="mt-1 flex items-center justify-between"><span className="text-[7px] text-[var(--dim)]">Forecast at completion</span><span className="font-mono text-[8px] text-white">HKD 4.91B</span></div></div></div>}
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Site brief exported', 'BIM site brief with model status, 4D progress and open clashes exported.', 'success')}><ClipboardList size={11} /> Site brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/bim')}><ArrowRight size={11} /> BIM studio</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[
          { l: 'Elements', v: SITE_PROJECT.elements, u: '', d: `${SITE_PROJECT.federatedModels} models`, icon: Boxes },
          { l: 'Open clashes', v: `${SITE_PROJECT.openClashes}`, u: '', d: `${SITE_PROJECT.resolvedClashes} resolved`, icon: AlertTriangle },
          { l: 'Workforce', v: `${SITE_PROJECT.workers}`, u: '', d: 'peak 612', icon: Users },
          { l: 'Deliveries', v: `${SITE_PROJECT.deliveries}`, u: '/day', d: '6 concrete', icon: Truck },
          { l: 'RFIs open', v: `${SITE_PROJECT.rfiOpen}`, u: '', d: 'avg 3.2 days', icon: ClipboardList },
          { l: 'Model size', v: SITE_PROJECT.modelSize, u: '', d: 'IFC 4.3 · LOD 350', icon: Layers },
        ].map((k) => <div key={k.l} className="panel p-3.5"><div className="flex items-center justify-between"><span className="text-[7.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.l}</span><k.icon size={12} className="text-[var(--accent)]" /></div><div className="mt-1.5 num text-[20px] text-white">{k.v}<span className="ml-0.5 text-[8px] text-[var(--dim)]">{k.u}</span></div><div className="mt-0.5 text-[7px] text-[var(--accent)]">{k.d}</div></div>)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="Site logistics" title="A live construction site, not a diagram" action={<Badge tone="cyan">Live</Badge>}><div className="grid grid-cols-2 gap-2">{SITE_LOGISTICS.map((l) => <div key={l.label} className="rounded border border-[var(--line)] bg-white/[.018] p-2"><div className="flex items-center justify-between"><span className="text-[7.5px] text-[var(--dim)]">{l.label}</span><span className="num text-[12px] text-white">{l.value}</span></div><div className="mt-0.5 text-[6.5px] text-[var(--muted)]">{l.note}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-4" eyebrow="Federation" title="Design coordinated before work starts" action={<Badge tone="green">ISO 19650</Badge>}><div className="space-y-2">{SITE_DISCIPLINES.slice(0, 4).map((d) => <div key={d.id} className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: d.color }} /><span className="flex-1 text-[8px] text-white">{d.label}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{d.elements} elements · {d.lod}</span></div>)}</div><div className="mt-3 flex items-center gap-1.5 rounded border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.045)] px-2 py-1.5 text-[7px] text-[var(--accent)]"><CheckCircle2 size={9} /> 6 disciplines federated · 47 clashes assigned · CDE state controlled.</div></Panel>
        <Panel className="xl:col-span-3" eyebrow="Milestones" title="Programme to handover" action={<CalendarClock size={12} className="text-[var(--dim)]" />}><div className="space-y-2">{SITE_MILESTONES.map((m, i) => <div key={m.date} className="flex items-start gap-2"><span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', i < 3 ? 'bg-[var(--accent)]' : i === 3 ? 'bg-[var(--amber)]' : 'bg-white/20')} /><div><div className="font-mono text-[7px] text-[var(--dim)]">{m.date}</div><div className="text-[8px] text-white">{m.label}</div></div></div>)}</div></Panel>
      </div>
    </div>
  );
}
