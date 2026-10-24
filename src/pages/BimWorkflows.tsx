import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Boxes, CheckCircle2, CircleAlert, ClipboardList, Cloud, Cpu, Eye, FileCheck2,
  GitBranch, HardHat, Layers, Play, ScanFace, ShieldCheck, UserCheck, Users, Workflow,
} from 'lucide-react';
import { BimWorkflowScene } from '../components/BimWorkflowScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import {
  ACCESS_EVENTS, ACCESS_METRICS, BIM_TOOLS, OCCUPANCY_SERIES, WORKFLOW_ISSUES, WORKFLOW_STEPS,
} from '../lib/bimWorkflowData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const CATEGORY_ICON = {
  Authoring: Layers,
  'BIM management': ClipboardList,
  CDE: Cloud,
  'Design review': Eye,
  'Issue management': CircleAlert,
};

export function BimWorkflows() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [selected, setSelected] = useState<string | null>('revit');
  const [stage, setStage] = useState('all');
  const [tab, setTab] = useState<'tools' | 'issues' | 'access' | 'handover'>('tools');
  const [autoRotate, setAutoRotate] = useState(true);
  const [events, setEvents] = useState(ACCESS_EVENTS);
  const [onSite, setOnSite] = useState(312);
  const [resolved, setResolved] = useState<string[]>([]);

  const tool = BIM_TOOLS.find((x) => x.id === selected) ?? BIM_TOOLS[0];
  const openIssues = WORKFLOW_ISSUES.filter((i) => !resolved.includes(i.id) && i.status !== 'Closed');
  const peak = Math.max(...OCCUPANCY_SERIES);

  const simulate = () => {
    const entry = { time: 'Now', person: 'Visitor · Arup', role: 'Design review', gate: 'Gate 2 · Reception', method: 'Visitor QR', result: 'Granted' };
    setEvents((prev) => [entry, ...prev].slice(0, 7));
    setOnSite((v) => v + 1);
    toast('Visitor checked in', 'Pre-registered visitor · Arup design review · Gate 2 reception. Access granted for 4 hours.', 'success');
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">BIM toolchain <span className="text-[var(--dim)]">/</span> workflows & AI operations</div>
          <h1 className="display text-[26px] text-white">{t('bimwf.title', 'Ten tools. One model. One truth.')}</h1>
          <p className="mt-1.5 max-w-3xl text-[11.5px] text-[var(--muted)]">
            {t('bimwf.desc', 'The professional BIM workflow in one demo: Revit, ArchiCAD, SketchUp, Rhino, Vectorworks and AutoCAD authoring; Plannerly scope, Trimble Connect CDE, Revizto review and BIMcollab issues — handed over to Proptech.AI access, occupancy and visitor operations.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 10 tools connected</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> ISO 19650 · BCF 3.0</span>
          <Button variant="secondary" size="sm" onClick={() => toast('Coordination cycle started', 'Models pulled from Trimble Connect, federated in IFC 4.3 and pushed to Revizto/BIMcollab.', 'info')}><Play size={12} /> Run cycle</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/bim-site')}><ArrowRight size={12} /> BIM on site</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-246px)] min-h-[560px] w-full bg-[#04090c]">
            <BimWorkflowScene selected={selected} stage={stage} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/84 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Model graph</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">IFC 4.3 · BCF 3.0</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{BIM_TOOLS.length} tools</span></div>
              <button onClick={() => setAutoRotate((v) => !v)} className={cn('pointer-events-auto rounded-lg border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] backdrop-blur-md', autoRotate ? 'border-[var(--line-2)] bg-white/[.06] text-white' : 'border-[var(--line)] bg-[#050b10]/84 text-[var(--dim)]')}>Turntable</button>
            </div>
            <div className="absolute left-4 top-[66px] z-20 hidden w-[210px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/86 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Workflow stage</span><Workflow size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">
                <button onClick={() => setStage('all')} className={cn('flex w-full items-center justify-between rounded border px-2 py-1.5', stage === 'all' ? 'border-[rgba(83,240,190,.3)] bg-[rgba(83,240,190,.06)] text-white' : 'border-transparent text-[var(--dim)]')}><span className="text-[8px]">All stages</span><span className="font-mono text-[6.5px]">10</span></button>
                {WORKFLOW_STEPS.map((s) => <button key={s.id} onClick={() => setStage(s.id)} className={cn('flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left', stage === s.id ? 'border-[rgba(83,240,190,.3)] bg-[rgba(83,240,190,.06)]' : 'border-transparent')}><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} /><span className="flex-1 text-[8px] text-white">{s.label}</span><span className="font-mono text-[6px] text-[var(--dim)]">{BIM_TOOLS.filter((x) => x.stage === s.id).length}</span></button>)}
              </div>
              <div className="border-t border-[var(--line)] p-2"><div className="rounded border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.04)] p-2 text-[7px] leading-relaxed text-[var(--accent)]"><CheckCircle2 size={9} className="inline" /> IFC exchange validated · 486,200 elements · 0 schema errors.</div></div>
            </div>
            <div className="pointer-events-none absolute bottom-[18px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Selected</span><span className="text-white">{tool.name}</span><span className="h-3 w-px bg-[var(--line-2)]" /><span>{tool.category}</span><span className="text-[7.5px]">click a node</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-246px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">Toolchain</div><Badge tone="green">Connected</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">Federated delivery stack</h2><div className="mt-0.5 text-[8.5px] text-[var(--muted)]">10 tools · 6 authoring formats · 1 CDE · BCF issue loop</div><div className="mt-3 grid grid-cols-3 gap-1.5"><div className="rounded border border-[var(--line)] bg-white/[.018] p-1.5"><div className="font-mono text-[6px] uppercase text-[var(--dim)]">Open issues</div><div className="num mt-0.5 text-[11px] text-[var(--rose)]">{openIssues.length}</div></div><div className="rounded border border-[var(--line)] bg-white/[.018] p-1.5"><div className="font-mono text-[6px] uppercase text-[var(--dim)]">On site</div><div className="num mt-0.5 text-[11px] text-white">{onSite}</div></div><div className="rounded border border-[var(--line)] bg-white/[.018] p-1.5"><div className="font-mono text-[6px] uppercase text-[var(--dim)]">Face match</div><div className="num mt-0.5 text-[11px] text-[var(--accent)]">99.9%</div></div></div></div>
          <div className="flex border-b border-[var(--line)]">{[['tools', 'Tools'], ['issues', 'Issues'], ['access', 'Access AI'], ['handover', 'Handover']].map(([id, label]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={cn('flex-1 border-b-2 py-2 font-mono text-[7px] uppercase tracking-[0.08em]', tab === id ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--dim)] hover:text-white')}>{label}</button>)}</div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            {tab === 'tools' && <div className="divide-y divide-[var(--line)]">{BIM_TOOLS.map((x) => { const Icon = CATEGORY_ICON[x.category]; return <button key={x.id} onClick={() => setSelected(x.id)} className={cn('flex w-full items-start gap-2 px-3 py-2 text-left', selected === x.id ? 'bg-white/[.04]' : 'hover:bg-white/[.02]')}><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border" style={{ borderColor: `${x.color}44`, background: `${x.color}12`, color: x.color }}><Icon size={11} /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-1"><span className="truncate text-[8px] text-white">{x.name}</span><span className="shrink-0 font-mono text-[6px] text-[var(--dim)]">{x.version}</span></span><span className="mt-0.5 block truncate text-[6.5px] text-[var(--dim)]">{x.category} · {x.formats}</span><span className={cn('mt-0.5 inline-block font-mono text-[6px] uppercase tracking-wider', x.status === 'Connected' ? 'text-[var(--accent)]' : x.status === 'Syncing' ? 'text-[var(--amber)]' : 'text-[var(--dim)]')}>{x.status}</span></span></button>; })}</div>}

            {tab === 'issues' && <div className="p-3"><div className="mb-2 flex items-center justify-between"><span className="eyebrow">BCF issues</span><span className="font-mono text-[7px] text-[var(--rose)]">{openIssues.length} open</span></div><div className="space-y-2">{WORKFLOW_ISSUES.map((issue) => <div key={issue.id} className={cn('rounded-lg border p-2', resolved.includes(issue.id) ? 'border-[var(--line)] opacity-45' : issue.priority === 'High' ? 'border-[rgba(255,112,136,.28)]' : 'border-[var(--line)]')}><div className="flex items-center justify-between"><span className="font-mono text-[7px] text-white">{issue.id} · {issue.tool}</span><span className={cn('rounded px-1 py-0.5 font-mono text-[6px] uppercase', issue.priority === 'High' ? 'bg-[rgba(255,112,136,.12)] text-[var(--rose)]' : 'bg-white/[.06] text-[var(--dim)]')}>{issue.priority}</span></div><div className="mt-1 text-[7.5px] leading-snug text-[var(--muted)]">{issue.title}</div><div className="mt-1 font-mono text-[6.5px] text-[var(--dim)]">{issue.viewpoint} · {issue.assignee} · {issue.due}</div><div className="mt-1.5 flex items-center justify-between"><span className="font-mono text-[6.5px] text-[var(--amber)]">{issue.status}</span>{!resolved.includes(issue.id) && issue.status !== 'Closed' ? <button onClick={() => { setResolved((p) => [...p, issue.id]); toast('Issue resolved', `${issue.id} closed in BIMcollab with viewpoint and comment.`, 'success'); }} className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[6.5px] text-white">Resolve</button> : <span className="text-[6.5px] text-[var(--accent)]">Closed</span>}</div></div>)}</div><Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => toast('BCF exported', 'Open issues exported as BCF 3.0 with viewpoints and model context.', 'success')}><FileCheck2 size={10} /> Export BCF</Button></div>}

            {tab === 'access' && <div className="p-3"><div className="mb-2 flex items-center justify-between"><span className="eyebrow">Proptech.AI operations</span><Badge tone="green">Live</Badge></div><div className="grid grid-cols-2 gap-1.5">{ACCESS_METRICS.map((m) => <div key={m.label} className="rounded border border-[var(--line)] bg-white/[.018] p-2"><div className="text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{m.label}</div><div className="num mt-0.5 text-[13px] text-white">{m.value}</div><div className="mt-0.5 font-mono text-[6px] text-[var(--accent)]">{m.note}</div></div>)}</div><div className="mt-3 rounded border border-[var(--line)] p-2"><div className="flex items-center justify-between"><span className="text-[7px] text-[var(--dim)]">Occupancy by hour</span><span className="font-mono text-[6.5px] text-[var(--accent)]">peak {peak}/hr</span></div><div className="mt-2 flex h-14 items-end gap-1">{OCCUPANCY_SERIES.map((v, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / peak) * 100}%`, background: v === peak ? 'var(--accent)' : 'rgba(83,240,190,.24)' }} />)}</div><div className="mt-1 flex justify-between font-mono text-[6px] text-[var(--dim)]"><span>06:00</span><span>12:00</span><span>18:00</span></div></div><div className="mt-3"><div className="mb-1 flex items-center justify-between"><span className="eyebrow text-[8px]">Access log</span><button onClick={simulate} className="text-[7px] text-[var(--accent)]">+ Simulate visitor</button></div><div className="space-y-1">{events.map((e, i) => <div key={`${e.time}-${i}`} className="rounded border border-[var(--line)] px-2 py-1.5"><div className="flex items-center justify-between"><span className="font-mono text-[7px] text-white">{e.time} · {e.person}</span><span className={cn('font-mono text-[6px] uppercase', e.result === 'Granted' ? 'text-[var(--accent)]' : 'text-[var(--rose)]')}>{e.result}</span></div><div className="mt-0.5 font-mono text-[6px] text-[var(--dim)]">{e.role} · {e.gate} · {e.method}</div></div>)}</div></div><div className="mt-2 flex items-center gap-1.5 rounded border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.04)] px-2 py-1.5 text-[7px] text-[var(--accent)]"><ScanFace size={10} /> App-less onboarding · hands-free access · people counting.</div></div>}

            {tab === 'handover' && <div className="p-3"><div className="eyebrow mb-2">COBie & asset handover</div><div className="space-y-1.5">{[{ a: 'AHU-07', t: 'Air handling unit', l: 'L12 plant', s: 'Commissioned' }, { a: 'CH-02', t: 'Chiller', l: 'L03 plant', s: 'Commissioned' }, { a: 'CW-214', t: 'Curtain wall panel', l: 'L17 east', s: 'As-built' }, { a: 'FD-31', t: 'Fire damper', l: 'L12 corridor', s: 'In progress' }, { a: 'ACC-06', t: 'Access turnstile', l: 'Gate 1', s: 'Proptech.AI' }].map((r) => <div key={r.a} className="flex items-center justify-between rounded border border-[var(--line)] px-2 py-1.5"><div><div className="font-mono text-[7.5px] text-white">{r.a} · {r.t}</div><div className="text-[6.5px] text-[var(--dim)]">{r.l}</div></div><span className={cn('font-mono text-[6.5px]', r.s === 'In progress' ? 'text-[var(--amber)]' : 'text-[var(--accent)]')}>{r.s}</span></div>)}</div><div className="mt-3 rounded border border-[var(--line)] p-2"><div className="flex items-center justify-between"><span className="text-[7px] text-[var(--dim)]">Digital twin handover</span><span className="font-mono text-[7px] text-[var(--accent)]">COBie 2.4</span></div><div className="mt-1 text-[7px] text-[var(--muted)]">Model, asset register, O&M, commissioning and Proptech.AI access data in one package.</div></div><Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => toast('Handover package prepared', 'COBie 2.4, IFC 4.3 and O&M documents assembled for Tower A.', 'success')}><FileCheck2 size={10} /> Prepare handover</Button></div>}
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Toolchain brief exported', 'Ten-tool BIM workflow, integrations and AI access notes exported.', 'success')}><ClipboardList size={11} /> Toolchain brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/bim')}><ArrowRight size={11} /> BIM studio</Button></div>
        </aside>
      </div>

      <div className="panel px-3 py-3">
        <div className="flex items-center justify-between px-1 pb-2"><span className="eyebrow">End-to-end workflow</span><span className="font-mono text-[7px] text-[var(--dim)]">author → federate → review → resolve → construct → handover → operate</span></div>
        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 xl:grid-cols-7">{WORKFLOW_STEPS.map((s, i) => <button key={s.id} onClick={() => { setStage(s.id); setTab(s.id === 'operate' ? 'access' : s.id === 'review' ? 'issues' : 'tools'); }} className={cn('rounded-lg border p-2 text-left', stage === s.id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.05)]' : 'border-[var(--line)] hover:bg-white/[.02]')}><div className="flex items-center justify-between"><span className="font-mono text-[6px] text-[var(--dim)]">0{i + 1}</span><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} /></div><div className="mt-1 text-[8.5px] text-white">{s.label}</div><div className="mt-0.5 line-clamp-2 text-[6.5px] leading-relaxed text-[var(--dim)]">{s.detail}</div></button>)}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[{ l: 'Authoring tools', v: '6', u: 'connected', d: 'Revit · ArchiCAD · SketchUp · Rhino · Vectorworks · AutoCAD' }, { l: 'Federated models', v: '18', u: 'IFC', d: '486,200 elements' }, { l: 'Issues', v: `${openIssues.length}`, u: 'open', d: 'BCF 3.0 workflow' }, { l: 'Access events', v: '1,284', u: 'today', d: '99.9% face match' }, { l: 'Handover', v: 'COBie', u: '2.4', d: 'assets + O&M + twin' }].map((k) => <div key={k.l} className="panel p-3.5"><div className="text-[7.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.l}</div><div className="mt-1 num text-[20px] text-white">{k.v} <span className="text-[8px] text-[var(--dim)]">{k.u}</span></div><div className="mt-1 text-[7px] text-[var(--accent)]">{k.d}</div></div>)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="Authoring" title="Open formats, one federated truth" action={<Boxes size={12} className="text-[var(--accent)]" />}><div className="space-y-1.5">{BIM_TOOLS.slice(0, 6).map((x) => <div key={x.id} className="flex items-center justify-between rounded border border-[var(--line)] px-2 py-1.5"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: x.color }} /><span className="text-[8px] text-white">{x.name}</span></div><span className="font-mono text-[6.5px] text-[var(--dim)]">{x.formats}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-4" eyebrow="Coordination" title="Plannerly → Trimble → Revizto → BIMcollab" action={<GitBranch size={12} className="text-[var(--accent)]" />}><div className="space-y-2">{BIM_TOOLS.slice(6).map((x) => <div key={x.id} className="rounded border border-[var(--line)] p-2"><div className="flex items-center justify-between"><span className="text-[8px] text-white">{x.name}</span><span className="font-mono text-[6px] text-[var(--accent)]">{x.status}</span></div><div className="mt-0.5 text-[7px] text-[var(--dim)]">{x.role}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-3" eyebrow="Operate" title="Proptech.AI at handover" action={<Cpu size={12} className="text-[var(--violet)]" />}><div className="space-y-2 text-[7.5px] text-[var(--muted)]"><div className="flex items-center gap-2"><ScanFace size={12} className="text-[var(--accent)]" /> App-less facial recognition · 99.9%</div><div className="flex items-center gap-2"><UserCheck size={12} className="text-[var(--accent)]" /> Visitor management · pre-registration</div><div className="flex items-center gap-2"><Users size={12} className="text-[var(--accent)]" /> People counting · peak hours</div><div className="flex items-center gap-2"><ShieldCheck size={12} className="text-[var(--accent)]" /> Integrates with existing card systems</div></div><div className="mt-3 flex items-center gap-1.5 rounded border border-[rgba(83,240,190,.18)] bg-[rgba(83,240,190,.04)] px-2 py-1.5 text-[7px] text-[var(--accent)]"><CheckCircle2 size={9} /> Site access data feeds the digital twin.</div></Panel>
      </div>
    </div>
  );
}
