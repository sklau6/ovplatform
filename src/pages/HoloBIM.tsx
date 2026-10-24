import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowRight, Boxes, CheckCircle2, Cpu, Gauge, Maximize2,
  Network, Orbit, Pause, Play, ScanLine, Snowflake, Sparkles, Thermometer, Zap,
} from 'lucide-react';
import { HoloDataCentreScene, type HoloSelection } from '../components/HoloDataCentreScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  AI_LAYOUTS, HOLO_ASSET_LIST, HOLO_MODES, HOLO_RACKS, type HoloLayout, type HoloMode,
} from '../lib/holoBimData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { overview: Orbit, power: Zap, cooling: Snowflake, network: Network, ai: Sparkles } as const;

export function HoloBIM() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<HoloMode>('overview');
  const [layout, setLayout] = useState<HoloLayout>('ai');
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<HoloSelection>({ kind: 'rack', rack: HOLO_RACKS[9] });
  const [autoRotate, setAutoRotate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('Design a 12 MW liquid-cooled AI hall with 32 racks and N+1 cooling');
  const model = AI_LAYOUTS[layout];
  const modeMeta = HOLO_MODES.find((m) => m.id === mode)!;
  const selectedRack = selected?.kind === 'rack' ? selected.rack : null;
  const selectedAsset = selected?.kind === 'asset' ? selected : null;

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setLayout('ai');
      setMode('ai');
      setExplode(0.42);
      toast('AI layout generated', '32 racks · 12 MW IT · direct-to-chip liquid cooling · PUE 1.16.', 'success');
    }, 1400);
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            BIM XR <span className="text-[var(--dim)]">/</span> data centre digital twin
          </div>
          <h1 className="display text-[26px] text-white">{t('holo.title', 'A data centre you can walk through.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('holo.desc', 'A cinematic, holographic BIM twin of a 12 MW AI data hall: 32 racks, containment, power, cooling, network, live telemetry and an exploded construction view.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> DC-03 · live</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/bim')}><ArrowLeft size={12} /> BIM Studio</Button>
          <Button variant="primary" size="sm" onClick={() => { setMode('ai'); setExplode(0.5); toast('Cinematic exploded view', 'Structure, trays, containment, racks and cooling separated for review.', 'info'); }}><Maximize2 size={12} /> Exploded view</Button>
        </div>
      </div>

      <section className="panel dark-surface relative overflow-hidden">
        <div className="holo-canvas relative h-[calc(100vh-215px)] min-h-[640px] w-full bg-[#020509]">
          <HoloDataCentreScene mode={mode} layout={layout} explode={explode} selected={selected} autoRotate={autoRotate} onSelect={setSelected} />
          <div className="pointer-events-none absolute inset-0 holo-vignette" />
          <div className="pointer-events-none absolute inset-0 holo-scanlines opacity-40" />
          <div className="pointer-events-none absolute inset-4 holo-corners" />

          <div className="pointer-events-none absolute left-5 top-5 flex flex-col gap-2">
            <div className="pointer-events-auto flex w-fit items-center gap-2.5 rounded-lg border border-[rgba(81,214,255,.22)] bg-[#030a0f]/85 px-3 py-2 backdrop-blur-xl">
              <span className="live-dot" />
              <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#bfeaff]">Holo BIM</span>
              <span className="h-3 w-px bg-white/10" />
              <span className="font-mono text-[8px] text-[#88aab2]">DC-03</span>
              <span className="h-3 w-px bg-white/10" />
              <span className="font-mono text-[8px] text-[var(--accent)]">LOD 400</span>
            </div>
            <div className="pointer-events-auto flex w-fit items-center gap-3 rounded-lg border border-[rgba(81,214,255,.12)] bg-[#030a0f]/65 px-3 py-1.5 backdrop-blur-md">
              <span className="font-mono text-[7.5px] uppercase tracking-wider text-[#789ba4]">32 racks</span>
              <span className="h-2.5 w-px bg-white/10" />
              <span className="font-mono text-[7.5px] text-[#d8f6ff]">{model.it} MW IT</span>
              <span className="h-2.5 w-px bg-white/10" />
              <span className="font-mono text-[7.5px] text-[var(--accent)]">PUE {model.pue}</span>
            </div>
          </div>

          <div className="pointer-events-auto absolute right-5 top-5 hidden flex-wrap items-center gap-1 rounded-lg border border-[rgba(81,214,255,.14)] bg-[#030a0f]/78 p-1 backdrop-blur-xl xl:flex">
            {HOLO_MODES.map((m) => {
              const Icon = modeIcon[m.id];
              return (
                <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-wider transition-colors', mode === m.id ? 'border-white/10 bg-white/[.08] text-white' : 'text-[#a9c5cc] hover:text-white')}>
                  <Icon size={10} style={{ color: mode === m.id ? m.color : undefined }} />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="absolute left-5 top-[104px] hidden w-[148px] flex-col gap-1.5 xl:flex">
            {HOLO_MODES.map((m, i) => {
              const Icon = modeIcon[m.id];
              return (
                <button key={m.id} onClick={() => setMode(m.id)} className={cn('group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left backdrop-blur-md transition-colors', mode === m.id ? 'border-[rgba(81,214,255,.35)] bg-[#06131a]/85' : 'border-transparent bg-[#030a0f]/45 hover:bg-[#06131a]/70')}>
                  <span className="grid h-5 w-5 place-items-center rounded border" style={{ borderColor: mode === m.id ? `${m.color}88` : 'rgba(255,255,255,.08)' }}><Icon size={10} style={{ color: m.color }} /></span>
                  <span className={cn('flex-1 text-[9px]', mode === m.id ? 'text-white' : 'text-[#9db5bd]')}>{m.label}</span>
                  <span className="font-mono text-[6px] text-[#5c7d86]">0{i + 1}</span>
                </button>
              );
            })}
          </div>

          <aside className="pointer-events-auto absolute right-5 top-[76px] hidden w-[286px] overflow-hidden rounded-xl border border-[rgba(81,214,255,.18)] bg-[#030a0f]/88 shadow-[0_30px_80px_-30px_#000] backdrop-blur-2xl xl:block">
            <div className="flex items-center justify-between border-b border-white/[.07] px-3.5 py-2.5">
              <span className="font-mono text-[7.5px] uppercase tracking-[0.16em] text-[#789ba4]">Live inspection</span>
              <Badge tone="cyan">telemetry</Badge>
            </div>
            {selectedRack ? (
              <div className="p-3.5">
                <div className="flex items-center justify-between"><span className="font-mono text-[15px] text-[var(--cyan)]">{selectedRack.id}</span><span className={cn('font-mono text-[7px] uppercase tracking-wider', selectedRack.status === 'healthy' ? 'text-[var(--accent)]' : selectedRack.status === 'warm' ? 'text-[var(--amber)]' : 'text-[var(--rose)]')}>{selectedRack.status}</span></div>
                <div className="mt-1 text-[9px] text-[#b8d1d8]">IT rack · row {selectedRack.row + 1} · {selectedRack.type}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[{ l: 'Load', v: `${selectedRack.load}`, u: 'kW' }, { l: 'Inlet temp', v: `${selectedRack.temp}`, u: '°C' }, { l: 'Power cap', v: '42', u: 'kW' }, { l: 'U space', v: '42', u: '/ 48U' }].map((x) => (
                    <div key={x.l} className="rounded-md border border-white/[.07] bg-white/[.025] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[#6d8c95]">{x.l}</div><div className="mt-0.5 num text-[13px] text-white">{x.v} <span className="text-[7px] text-[#6d8c95]">{x.u}</span></div></div>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5 text-[8px]">
                  {[{ l: 'Rack PDU', v: 'PDU-03' }, { l: 'Network leaf', v: 'LEAF-12' }, { l: 'Cooling', v: 'Cold aisle A' }, { l: 'BIM asset', v: 'IFC / LOD 400' }].map((x) => (
                    <div key={x.l} className="flex justify-between"><span className="text-[#6d8c95]">{x.l}</span><span className="font-mono text-[#b8d1d8]">{x.v}</span></div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/[.07] pt-2 text-[7.5px] text-[#6d8c95]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Last telemetry 4 seconds ago</div>
              </div>
            ) : selectedAsset ? (
              <div className="p-3.5">
                <div className="flex items-center justify-between"><span className="font-mono text-[15px] text-[var(--accent)]">{selectedAsset.id}</span><Badge tone="green">{selectedAsset.status}</Badge></div>
                <div className="mt-1 text-[9px] text-[#b8d1d8]">{selectedAsset.name} · {selectedAsset.type}</div>
                <div className="mt-3 rounded-md border border-white/[.07] bg-white/[.025] p-2.5"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[#6d8c95]">Telemetry</div><div className="mt-1 num text-[18px] text-white">{selectedAsset.metric}</div></div>
                <div className="mt-3 text-[8px] leading-relaxed text-[#8daab1]">Asset is federated from the MEP model and linked to the operating work order register.</div>
              </div>
            ) : (
              <div className="p-3.5 text-[9px] text-[#8daab1]">Click a rack, CRAC, UPS, PDU or chiller to inspect its live telemetry.</div>
            )}
            <div className="border-t border-white/[.07] px-3.5 py-2.5">
              <div className="flex items-center justify-between text-[7.5px]"><span className="text-[#6d8c95]">AI hall utilisation</span><span className="font-mono text-[var(--accent)]">78%</span></div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: '78%' }} /></div>
            </div>
          </aside>

          <div className="absolute inset-x-5 bottom-5 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
            <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-[rgba(81,214,255,.14)] bg-[#030a0f]/82 px-3 py-2 backdrop-blur-xl">
              <button onClick={() => setAutoRotate((v) => !v)} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-[#9db5bd] hover:text-white" aria-label="Toggle orbit">{autoRotate ? <Pause size={11} /> : <Play size={11} />}</button>
              <span className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#6d8c95]">Explode</span>
              <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} className="holo-range w-24" aria-label="Explode BIM view" />
              <span className="w-7 font-mono text-[8px] text-[var(--cyan)]">{Math.round(explode * 100)}%</span>
              <span className="h-4 w-px bg-white/10" />
              <span className="font-mono text-[7px] text-[#6d8c95]">{modeMeta.label}</span>
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              {[
                { l: 'IT load', v: `${model.it} MW`, c: 'var(--cyan)' },
                { l: 'PUE', v: `${model.pue}`, c: 'var(--accent)' },
                { l: 'Density', v: model.density, c: 'var(--amber)' },
                { l: 'Racks', v: `${model.racks}`, c: 'var(--violet)' },
              ].map((x) => (
                <div key={x.l} className="rounded-lg border border-white/[.08] bg-[#030a0f]/78 px-3 py-1.5 backdrop-blur-md"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[#6d8c95]">{x.l}</div><div className="mt-0.5 font-mono text-[10px]" style={{ color: x.c }}>{x.v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-5" eyebrow="AI design copilot" title="Describe the hall. Generate the BIM." action={<Badge tone="violet">{generating ? 'generating' : 'ready'}</Badge>}>
          <div className="rounded-lg border border-[var(--line)] bg-black/20 p-2.5">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className="w-full resize-none bg-transparent text-[10px] leading-relaxed text-[#dbe5ee] outline-none" aria-label="AI data centre design prompt" />
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[7px] text-[var(--dim)]">BIM-aware layout · power · cooling · capacity</span>
              <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-wider text-[#032018] disabled:opacity-60"><Sparkles size={10} /> {generating ? 'Generating' : 'Generate'}</button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[{ id: 'ai', l: 'AI factory' }, { id: 'cloud', l: 'Cloud hall' }, { id: 'colo', l: 'Colocation' }].map((x) => (
              <button key={x.id} onClick={() => { setLayout(x.id as HoloLayout); setMode('overview'); setExplode(0.2); }} className={cn('rounded-md border px-2 py-1 font-mono text-[7.5px]', layout === x.id ? 'border-[rgba(62,224,161,.4)] bg-[rgba(62,224,161,.08)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white')}>{x.l}</button>
            ))}
          </div>
          <p className="mt-2 text-[8px] leading-relaxed text-[var(--muted)]">{model.note}</p>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="BIM model register" title="Geometry and asset data" action={<Boxes size={12} className="text-[var(--cyan)]" />}>
          <div className="grid grid-cols-3 gap-2">
            {[{ l: 'Racks', v: '32' }, { l: 'IFC objects', v: '12.4k' }, { l: 'LOD', v: '400' }, { l: 'Federated', v: '6 models' }, { l: 'Assets', v: '8 live' }, { l: 'COBie', v: 'Linked' }].map((x) => (
              <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.014] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {HOLO_ASSET_LIST.slice(0, 5).map((a) => (
              <button key={a.id} onClick={() => setSelected({ kind: 'asset', ...a })} className="flex w-full items-center gap-2 rounded border border-transparent px-1 py-1 text-left hover:border-[var(--line)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /><span className="flex-1 font-mono text-[7px] text-[var(--muted)]">{a.id}</span><span className="font-mono text-[7px] text-[var(--dim)]">{a.metric}</span></button>
            ))}
          </div>
        </Panel>

        <Panel className="xl:col-span-3" eyebrow="Operating envelope" title="Live hall telemetry" action={<Activity size={12} className="text-[var(--accent)]" />}>
          <div className="space-y-2">
            {[
              { l: 'IT load', v: `${model.it} MW`, p: 78, c: 'var(--cyan)' },
              { l: 'Cooling duty', v: `${(model.it * 1.16).toFixed(1)} MW`, p: 64, c: 'var(--accent)' },
              { l: 'Power headroom', v: '2.1 MW', p: 82, c: 'var(--amber)' },
              { l: 'Network fabric', v: '8.4 Tbps', p: 61, c: 'var(--violet)' },
            ].map((x) => (
              <div key={x.l}><div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{x.l}</span><span className="font-mono text-[#dbe5ee]">{x.v}</span></div><div className="mt-1 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${x.p}%`, background: x.c }} /></div></div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--dim)]"><Thermometer size={9} className="text-[var(--accent)]" /> Cold aisle 22.4°C · hot aisle 31.8°C</div>
          <div className="mt-1 flex items-center gap-1.5 text-[8px] text-[var(--dim)]"><Gauge size={9} className="text-[var(--cyan)]" /> 32 racks · 12 MW · N+1 cooling</div>
          <div className="mt-1 flex items-center gap-1.5 text-[8px] text-[var(--dim)]"><Cpu size={9} className="text-[var(--violet)]" /> GPU allocation 78% · queue 12 jobs</div>
        </Panel>
      </div>
    </div>
  );
}
