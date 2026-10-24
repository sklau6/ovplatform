import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Boxes, Building2, CheckCircle2, Leaf, Lightbulb, Sparkles, Sun, Wand2,
} from 'lucide-react';
import { DesignScene } from '../components/DesignScene';
import { Badge, Button, Panel, Progress } from '../components/ui';
import { DESIGN_KPIS, DESIGN_OPTIONS, DESIGN_PROMPTS, type DesignOptionId } from '../lib/designData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

export function Design() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [selected, setSelected] = useState<DesignOptionId>('B');
  const [prompt, setPrompt] = useState(DESIGN_PROMPTS[0]);
  const [generating, setGenerating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const opt = DESIGN_OPTIONS.find((o) => o.id === selected)!;

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setSelected('B');
      toast('Three options generated', 'Massing, FAR, daylight and carbon evaluated against the brief.', 'success');
    }, 1300);
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Generative design <span className="text-[var(--dim)]">/</span> BIM options</div>
          <h1 className="display text-[26px] text-white">{t('design.title', 'Many futures. One decision.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('design.desc', 'A 3D generative design twin: three massing options compared on yield, height, daylight, embodied carbon, cost and public realm before the BIM model is fixed.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> 3 options · Stage 2</span>
          <span className="chip"><Sun size={10} className="text-[var(--amber)]" /> Daylight {opt.daylight}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/bim')}><Boxes size={12} /> BIM Studio</Button>
          <Button variant="primary" size="sm" onClick={() => toast('Option B selected', 'Stepped terraces carried forward to Stage 3 BIM coordination.', 'success')}><CheckCircle2 size={12} /> Select option</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <DesignScene selectedId={selected} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Generative design</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">3 options</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">score {opt.score}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">Option {opt.id} · <span className="text-[var(--accent)]">{opt.name}</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[200px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Options</span><Lightbulb size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-1 p-2">{DESIGN_OPTIONS.map((o) => <button key={o.id} onClick={() => setSelected(o.id)} className={cn('w-full rounded-md border px-2 py-1.5 text-left', selected === o.id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)]' : 'border-[var(--line)]')}><div className="flex items-center justify-between"><span className="font-mono text-[7px]" style={{ color: o.color }}>OPTION {o.id}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{o.gfa} m²</span></div><div className="mt-0.5 text-[8px] text-[#dbe5ee]">{o.name}</div></button>)}</div>
              <div className="border-t border-[var(--line)] p-2"><button onClick={() => setAutoRotate((v) => !v)} className={cn('w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Massing</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> option A</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> B</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--violet)]" /> C</span><span className="text-[7.5px]">click a massing</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">Option {opt.id} · Stage 2</div><Badge tone="green">score {opt.score}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{opt.name}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{opt.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'GFA', v: opt.gfa }, { l: 'FAR', v: opt.far }, { l: 'Height', v: opt.height }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Compare</span><span className="font-mono text-[8px] text-[var(--dim)]">3 options</span></div><div className="mt-2 space-y-1.5">{DESIGN_OPTIONS.map((o) => <button key={o.id} onClick={() => setSelected(o.id)} className={cn('w-full rounded border p-2 text-left', selected === o.id ? 'border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.04)]' : 'border-[var(--line)]')}><div className="flex justify-between"><span className="font-mono text-[7px]" style={{ color: o.color }}>OPTION {o.id}</span><span className="font-mono text-[6px] text-[var(--dim)]">score {o.score}</span></div><div className="mt-0.5 flex justify-between text-[7px]"><span className="text-[var(--muted)]">{o.units} units</span><span className="text-[var(--muted)]">{o.carbon} kg/m²</span><span className="text-[var(--muted)]">{o.cost}</span></div></button>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Brief</span><Wand2 size={10} className="text-[var(--accent)]" /></div><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className="mt-2 w-full resize-none rounded border border-[var(--line)] bg-black/20 p-2 text-[8px] text-[#dbe5ee] outline-none" aria-label="Generative design prompt" /><button onClick={generate} disabled={generating} className="mt-1 flex w-full items-center justify-center gap-1.5 rounded bg-[var(--accent)] py-1.5 font-mono text-[7.5px] uppercase tracking-wider text-[#032018] disabled:opacity-60"><Sparkles size={10} /> {generating ? 'Generating' : 'Generate options'}</button><div className="mt-1 flex flex-wrap gap-1">{DESIGN_PROMPTS.slice(1).map((p) => <button key={p} onClick={() => setPrompt(p)} className="rounded border border-[var(--line)] px-1 py-0.5 font-mono text-[6px] text-[var(--dim)]">{p.split(',')[0]}</button>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Daylight</span><Sun size={10} className="text-[var(--amber)]" /></div><div className="mt-2"><Progress value={opt.daylight} color="var(--amber)" height={4} /><div className="mt-1 flex justify-between font-mono text-[6.5px] text-[var(--dim)]"><span>0</span><span>{opt.daylight}/100</span><span>100</span></div></div></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Options exported', 'Massing, metrics and carbon exported for the design review.', 'success')}><Building2 size={11} /> Export</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/bim')}><ArrowRight size={11} /> BIM</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{DESIGN_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><Leaf size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="Trade-offs" title="Yield vs comfort vs carbon" action={<Badge tone="cyan">Stage 2</Badge>}><div className="space-y-2">{DESIGN_OPTIONS.map((o) => <div key={o.id} className="flex items-center gap-3 border-b border-[var(--line)] py-2 last:border-0"><span className="h-2 w-2 rounded-full" style={{ background: o.color }} /><span className="w-24 text-[8px] text-[var(--muted)]">Option {o.id} · {o.name}</span><div className="flex-1"><Progress value={o.score} color={o.color} height={3} /></div><span className="font-mono text-[7px] text-[var(--dim)]">{o.score}</span></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Decision" title="Why option B" action={<CheckCircle2 size={12} className="text-[var(--accent)]" />}><p className="text-[8.5px] leading-relaxed text-[var(--muted)]">Option B gives the best balance: 39,600 m² GFA, 248 units, 86 daylight score, 318 kgCO₂e/m² and a lower cost than the twin towers. Option C wins on carbon and public realm but gives up 6,600 m² of GFA.</p><div className="mt-2 flex items-center gap-1.5 text-[7.5px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Human design review required before BIM freeze.</div></Panel>
      </div>
    </div>
  );
}
