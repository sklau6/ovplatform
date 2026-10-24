import { useState } from 'react';
import {
  Activity, ArrowRight, Box, Building2, CheckCircle2, ChevronRight, Crosshair, FileText,
  GitBranch, Layers, RotateCw, ShieldCheck, TriangleAlert, Waves, Zap,
} from 'lucide-react';
import { EngineeringScene, type EngineeringStudy, type MemberSelection } from '../components/EngineeringScene';
import { Badge, Button, Panel, Progress, Segmented } from '../components/ui';
import {
  BRIDGE_TELEMETRY, LOAD_CASES, STRUCTURAL_MEMBERS, STRUCTURAL_STUDIES,
  type LoadCaseId,
} from '../lib/platformData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

export function Engineering() {
  const [study, setStudy] = useState<EngineeringStudy>('tower');
  const [loadCase, setLoadCase] = useState<LoadCaseId>('wind');
  const [deflection, setDeflection] = useState(true);
  const [foundation, setFoundation] = useState(false);
  const [orbit, setOrbit] = useState(false);
  const [member, setMember] = useState<MemberSelection | null>(null);
  const { toast } = useLive();
  const { t } = useI18n();

  const activeStudy = STRUCTURAL_STUDIES.find((s) => s.id === study) ?? STRUCTURAL_STUDIES[0];
  const activeLoad = LOAD_CASES.find((l) => l.id === loadCase) ?? LOAD_CASES[0];

  const switchStudy = (next: EngineeringStudy) => {
    setStudy(next);
    setMember(null);
    toast(next === 'tower' ? 'Structural frame loaded' : 'Harbour link loaded',
      next === 'tower' ? '12-storey hybrid frame · IFC 4.3 · ETABS link' : '68 m cable-stay · 24 stay cables · 9 sensors', 'info');
  };

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            Civil & structural engineering <span className="text-[var(--dim)]">/</span> design assurance
          </div>
          <h1 className="display text-[26px] text-white">{t('engineering.title', 'Engineer the load path.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('engineering.desc', 'A structural and civil twin connecting the analysis model, geotechnical assumptions, site survey and the operating asset. Every utilisation ratio is traceable to a load case.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={study}
            onChange={switchStudy}
            options={[{ value: 'tower', label: t('engineering.tower', 'Tower frame') }, { value: 'bridge', label: t('engineering.bridge', 'Harbour link') }]}
          />
          <Button variant="secondary" size="sm" onClick={() => { setDeflection(true); setLoadCase('wind'); setMember(null); toast('Wind case applied', '1-in-50 year profile · 12-storey frame · drift H/612', 'info'); }}>
            <Zap size={12} /> Run wind case
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast('Analysis package exported', 'IFC + ETABS results + assumptions issued to the checking engineer.', 'success')}>
            <FileText size={12} /> Export check
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <EngineeringScene
              study={study}
              loadCase={loadCase}
              deflection={deflection}
              foundation={foundation}
              autoRotate={orbit}
              onSelect={setMember}
            />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/78 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Structural twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">IFC 4.3</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">ETABS link</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{t(`engineering.${study}`, activeStudy.label)}</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/78 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                Load case · <span className="text-[var(--amber)]">{activeLoad.label}</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[206px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/80 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">Analysis layers</span>
                <Layers size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                <div className="flex items-center gap-2 rounded-md px-1.5 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  <span className="flex-1 text-[10px] text-[#c9d5e0]">Structural frame</span>
                  <span className="font-mono text-[7.5px] text-[var(--dim)]">always</span>
                </div>
                <button onClick={() => setDeflection((v) => !v)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]">
                  <span className={cn('h-1.5 w-1.5 rounded-full', deflection ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'bg-[var(--dim)]')} />
                  <span className="flex-1 text-[10px] text-[#c9d5e0]">{t('engineering.deflection', 'Deflection shape')}</span>
                  <span className="font-mono text-[7.5px] text-[var(--dim)]">×20</span>
                </button>
                <button onClick={() => setFoundation((v) => !v)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]">
                  <span className={cn('h-1.5 w-1.5 rounded-full', foundation ? 'bg-[var(--amber)] shadow-[0_0_8px_var(--amber)]' : 'bg-[var(--dim)]')} />
                  <span className="flex-1 text-[10px] text-[#c9d5e0]">{t('engineering.foundation', 'Foundation inset')}</span>
                  <span className="font-mono text-[7.5px] text-[var(--dim)]">piles</span>
                </button>
                <button onClick={() => setOrbit((v) => !v)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]">
                  <span className={cn('h-1.5 w-1.5 rounded-full', orbit ? 'bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]' : 'bg-[var(--dim)]')} />
                  <span className="flex-1 text-[10px] text-[#c9d5e0]">Orbit model</span>
                  <RotateCw size={10} className={orbit ? 'text-[var(--cyan)]' : 'text-[var(--dim)]'} />
                </button>
              </div>
              <div className="border-t border-[var(--line)] p-3">
                <div className="mb-2 font-mono text-[7.5px] uppercase tracking-[0.14em] text-[var(--dim)]">Load case</div>
                <div className="grid grid-cols-2 gap-1">
                  {LOAD_CASES.map((lc) => (
                    <button
                      key={lc.id}
                      onClick={() => setLoadCase(lc.id)}
                      className={cn(
                        'rounded-md border px-1.5 py-1.5 text-[9px] transition-colors',
                        loadCase === lc.id ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-white',
                      )}
                    >
                      {t(`engineering.${lc.id}`, lc.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[24px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">Utilisation</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#4cecc4]" /> &lt; 0.55</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#a7e86e]" /> 0.55–0.75</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> 0.75–0.88</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" /> &gt; 0.88</span>
            </div>

            <div className="pointer-events-none absolute bottom-[24px] right-4 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              Click a member to inspect · drag to orbit
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{activeStudy.eyebrow}</div>
              <Badge tone="green">checked</Badge>
            </div>
            <h2 className="mt-1 font-display text-[16px] text-white">{t(`engineering.${study}`, activeStudy.label)}</h2>
            <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--muted)]">{activeStudy.summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-px border-b border-[var(--line)] bg-[var(--line)]">
            {activeStudy.metrics.map((m) => (
              <div key={m.label} className="bg-[#080e13] px-4 py-3">
                <div className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{m.label}</div>
                <div className="mt-1 num text-[17px] text-white">{m.value} <span className="text-[8px] text-[var(--dim)]">{m.unit}</span></div>
              </div>
            ))}
          </div>

          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            {study === 'tower' ? (
              <div className="border-b border-[var(--line)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Member inspector</span>
                  <span className="font-mono text-[8px] text-[var(--dim)]">{member ? member.id : 'none'}</span>
                </div>
                {member ? (
                  <div className="mt-2.5 rounded-lg border border-[rgba(62,224,161,.22)] bg-[rgba(62,224,161,.035)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-[15px] text-[var(--accent)]">{member.id}</div>
                        <div className="mt-0.5 text-[9px] text-[var(--muted)]">{member.type} · {member.level}</div>
                      </div>
                      <Badge tone={member.uc > 0.88 ? 'rose' : member.uc > 0.75 ? 'amber' : 'green'}>{member.uc.toFixed(2)} UC</Badge>
                    </div>
                    <div className="mt-2.5"><Progress value={member.uc * 100} color={member.uc > 0.88 ? 'var(--rose)' : member.uc > 0.75 ? 'var(--amber)' : 'var(--accent)'} height={4} /></div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-2.5">
                      <div><div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Demand</div><div className="mt-0.5 num text-[11px] text-white">{member.force}</div></div>
                      <div><div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Load case</div><div className="mt-0.5 text-[10px] text-[#dbe5ee]">{activeLoad.label}</div></div>
                    </div>
                    <p className="mt-2 text-[8px] leading-relaxed text-[var(--dim)]">{member.note}</p>
                    <button onClick={() => setMember(null)} className="mt-2 flex items-center gap-1 text-[8px] text-[var(--dim)] hover:text-white"><Crosshair size={9} /> clear selection</button>
                  </div>
                ) : (
                  <div className="mt-2.5 rounded-lg border border-dashed border-[var(--line-2)] p-3 text-center">
                    <Crosshair size={15} className="mx-auto text-[var(--dim)]" />
                    <div className="mt-1.5 text-[9px] text-[var(--muted)]">Click a column, beam or brace in the 3D model.</div>
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  <div className="font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]">Governing members</div>
                  {STRUCTURAL_MEMBERS.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMember({ id: m.id, type: m.type, level: m.level, uc: m.uc, force: m.force, note: m.note })}
                      className="flex w-full items-center gap-2 rounded-md border border-[var(--line)] bg-white/[.015] px-2 py-1.5 text-left hover:border-[var(--line-2)] hover:bg-white/[.035]"
                    >
                      <span className="font-mono text-[8px] text-[var(--accent)]">{m.id}</span>
                      <span className="flex-1 truncate text-[8px] text-[var(--muted)]">{m.type}</span>
                      <span className={cn('font-mono text-[8px]', m.uc > 0.8 ? 'text-[var(--amber)]' : 'text-[#cfdae4]')}>{m.uc.toFixed(2)}</span>
                      <ChevronRight size={9} className="text-[var(--dim)]" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-b border-[var(--line)] px-4 py-3">
                <div className="flex items-center justify-between"><span className="eyebrow">Bridge telemetry</span><span className="font-mono text-[8px] text-[var(--accent)]">9 sensors</span></div>
                <div className="mt-2.5 space-y-2">
                  {BRIDGE_TELEMETRY.map((t) => (
                    <div key={t.label} className="rounded-lg border border-[var(--line)] bg-white/[.018] p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[#dbe5ee]">{t.label}</span>
                        <span className="num text-[11px] text-white">{t.value}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[7.5px] text-[var(--dim)]">live reading</span>
                        <span className={cn('font-mono text-[7.5px]', t.tone === 'amber' ? 'text-[var(--amber)]' : 'text-[var(--accent)]')}>{t.delta}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-[rgba(81,214,255,.2)] bg-[rgba(81,214,255,.035)] p-2.5">
                  <div className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-wider text-[var(--cyan)]"><Waves size={9} /> Load test</div>
                  <p className="mt-1 text-[8px] leading-relaxed text-[var(--muted)]">A 32 t test vehicle is crossing the deck. Deck deflection is exaggerated ×20; the live response remains within L/840.</p>
                </div>
              </div>
            )}

            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Design assurance</span><span className="font-mono text-[8px] text-[var(--dim)]">4 checks</span></div>
              <div className="mt-2 space-y-1.5">
                {[
                  { l: 'Global stability', v: 'Pass', tone: 'green' as const },
                  { l: 'Serviceability drift', v: 'H/612', tone: 'green' as const },
                  { l: 'Pile settlement', v: '18 mm', tone: 'green' as const },
                  { l: 'Clash / penetrations', v: '3 open', tone: 'amber' as const },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-2 text-[8.5px]">
                    <CheckCircle2 size={10} className={x.tone === 'green' ? 'text-[var(--accent)]' : 'text-[var(--amber)]'} />
                    <span className="flex-1 text-[var(--muted)]">{x.l}</span>
                    <span className={cn('font-mono', x.tone === 'green' ? 'text-[var(--accent)]' : 'text-[var(--amber)]')}>{x.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Engineer's note</span><ShieldCheck size={11} className="text-[var(--accent)]" /></div>
              <p className="mt-2 text-[8.5px] leading-relaxed text-[var(--muted)]">
                The twin supports engineering judgement; it does not replace it. Every safety-critical output is reviewed and signed by the qualified structural engineer before site release.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setFoundation((v) => !v)}><GitBranch size={11} /> Foundation</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => toast('Design review booked', 'Independent check · wind + seismic envelope · Friday 10:00.', 'success')}><ShieldCheck size={11} /> Review</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel eyebrow="Civil works" title="Ground is a system" action={<Waves size={13} className="text-[var(--cyan)]" />}>
          <div className="space-y-2">
            {[
              { l: 'Marine piling', v: '24 / 24 installed', tone: 'green' },
              { l: 'Dewatering drawdown', v: '0.8 m · within limit', tone: 'green' },
              { l: 'Settlement array', v: '18 mm · 25 mm alarm', tone: 'green' },
              { l: 'Seawall movement', v: '6 mm · monitor', tone: 'amber' },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/[.014] px-2.5 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full', x.tone === 'green' ? 'bg-[var(--accent)]' : 'bg-[var(--amber)]')} />
                <span className="flex-1 text-[8.5px] text-[var(--muted)]">{x.l}</span>
                <span className="font-mono text-[8px] text-[#cfdae4]">{x.v}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel eyebrow="Analysis" title="Assumptions under control" action={<Activity size={13} className="text-[var(--accent)]" />}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Code basis', v: 'HK CoP 2011' },
              { l: 'Wind profile', v: '1-in-50 yr' },
              { l: 'Seismic', v: 'DBE 475 yr' },
              { l: 'Fire', v: '2 hr integrity' },
            ].map((x) => (
              <div key={x.l} className="rounded-md border border-[var(--line)] bg-black/15 p-2.5">
                <div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                <div className="mt-0.5 text-[9px] text-[#dbe5ee]">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Independent check complete · 12 Oct 2026</div>
        </Panel>
        <Panel eyebrow="COO decision" title="What needs a human" action={<Badge tone="amber">2 gates</Badge>}>
          <div className="space-y-2">
            {[
              { l: 'Outrigger connection — wind UC 0.86', s: 'Review detailing', t: 'rose' },
              { l: 'Marine piling — 6 mm seawall movement', s: 'Monitor weekly', t: 'amber' },
              { l: 'Bridge bearing — 3.2 mm drift', s: 'Within design', t: 'green' },
            ].map((x) => (
              <div key={x.l} className="flex items-start gap-2 rounded-md border border-[var(--line)] bg-white/[.014] p-2.5">
                <TriangleAlert size={11} className={x.t === 'green' ? 'mt-0.5 text-[var(--accent)]' : x.t === 'rose' ? 'mt-0.5 text-[var(--rose)]' : 'mt-0.5 text-[var(--amber)]'} />
                <div className="min-w-0 flex-1">
                  <div className="text-[8.5px] leading-snug text-[#dbe5ee]">{x.l}</div>
                  <div className="mt-0.5 text-[7.5px] text-[var(--dim)]">{x.s}</div>
                </div>
                <ArrowRight size={9} className="mt-0.5 text-[var(--dim)]" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
