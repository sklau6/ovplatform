import { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Building2, CheckCircle2, ChevronRight, Layers, Maximize2,
  Leaf, PieChart, Sparkles, TrendingUp, Users,
} from 'lucide-react';
import { PropTechScene, type PropTechMode } from '../components/PropTechScene';
import { Badge, Button, Panel, Progress, Segmented } from '../components/ui';
import { LEASE_PIPELINE, PROPTECH_FLOORS, TENANT_MIX } from '../lib/platformData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const MODES: Array<{ id: PropTechMode; label: string; hint: string }> = [
  { id: 'leasing', label: 'Leasing', hint: 'lease expiry' },
  { id: 'occupancy', label: 'Occupancy', hint: 'utilisation' },
  { id: 'energy', label: 'Energy', hint: 'kWh/m²' },
  { id: 'experience', label: 'Experience', hint: 'tenant NPS' },
];

const modeColor = (mode: PropTechMode, floor: (typeof PROPTECH_FLOORS)[number]) => {
  if (mode === 'leasing') {
    if (floor.status === 'vacant') return 'var(--rose)';
    if (floor.status === 'expiring') return 'var(--amber)';
    if (floor.status === 'amenity') return 'var(--violet)';
    return 'var(--accent)';
  }
  if (mode === 'occupancy') return floor.occupancy >= 88 ? 'var(--accent)' : floor.occupancy >= 70 ? 'var(--amber)' : 'var(--rose)';
  if (mode === 'energy') return floor.energy < 80 ? 'var(--accent)' : floor.energy < 100 ? 'var(--amber)' : 'var(--rose)';
  return floor.nps >= 60 ? 'var(--cyan)' : floor.nps >= 45 ? 'var(--accent)' : 'var(--amber)';
};

export function PropTech() {
  const [mode, setMode] = useState<PropTechMode>('leasing');
  const [exploded, setExploded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(6);
  const [autoRotate, setAutoRotate] = useState(false);
  const { toast } = useLive();
  const { t } = useI18n();

  const selected = selectedLevel ? PROPTECH_FLOORS.find((f) => f.level === selectedLevel) ?? null : null;
  const portfolioOccupancy = Math.round(PROPTECH_FLOORS.reduce((sum, f) => sum + f.occupancy, 0) / PROPTECH_FLOORS.length);
  const passingRent = Math.round(PROPTECH_FLOORS.filter((f) => f.rent > 0).reduce((sum, f) => sum + f.rent, 0) / PROPTECH_FLOORS.filter((f) => f.rent > 0).length);

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">
            PropTech <span className="text-[var(--dim)]">/</span> Kai Tak Tower I
          </div>
          <h1 className="display text-[26px] text-white">{t('proptech.title', 'Every square metre, legible.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('proptech.desc', 'A live leasing and space model of the flagship tower: floor-by-floor occupancy, lease events, energy and tenant experience in one decision surface.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Rent roll live</span>
          <Button variant="secondary" size="sm" onClick={() => toast('Leasing campaign drafted', 'L09 vacancy pack generated for three target tenants.', 'success')}>
            <Sparkles size={12} /> Leasing campaign
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast('Space plan opened', 'L08–L10 test-fit · 3 scenarios · 42,000 sq ft.', 'info')}>
            <Maximize2 size={12} /> Space planner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-9">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <PropTechScene
              mode={mode}
              exploded={exploded}
              selectedLevel={selectedLevel}
              autoRotate={autoRotate}
              onSelect={setSelectedLevel}
            />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-3 py-1.5 backdrop-blur-md">
                <span className="live-dot" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">PropTech twin</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">42 storeys</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--dim)]">684,000 ft²</span>
                <span className="h-3 w-px bg-[var(--line-2)]" />
                <span className="font-mono text-[8.5px] text-[var(--accent)]">{portfolioOccupancy}% occupied</span>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/80 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">
                Mode · <span className="text-[var(--accent)]">{t(`proptech.${mode}`, mode)}</span>
              </div>
            </div>

            <div className="absolute left-4 top-[68px] hidden w-[204px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/82 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5">
                <span className="eyebrow text-[8.5px]">View mode</span>
                <PieChart size={12} className="text-[var(--dim)]" />
              </div>
              <div className="space-y-0.5 p-2">
                {MODES.map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[.04]', mode === m.id && 'bg-white/[.045]')}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', mode === m.id ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'bg-[var(--dim)]')} />
                    <span className={cn('flex-1 text-[10px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{t(`proptech.${m.id}`, m.label)}</span>
                    <span className="font-mono text-[7px] text-[var(--dim)]">{m.hint}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--line)] p-2">
                <button onClick={() => setExploded((v) => !v)} className={cn('flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9.5px]', exploded ? 'border-[rgba(62,224,161,.35)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)]')}>
                  <Layers size={11} /> {exploded ? t('proptech.collapse', 'Collapse stack') : t('proptech.explode', 'Explode stack')}
                </button>
                <button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-[9.5px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>
                  Orbit
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[22px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/74 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur">
              <span className="uppercase tracking-[0.12em]">{mode}</span>
              {(mode === 'leasing' ? [
                { l: 'leased', c: 'var(--accent)' },
                { l: 'expiring', c: 'var(--amber)' },
                { l: 'vacant', c: 'var(--rose)' },
                { l: 'amenity', c: 'var(--violet)' },
              ] : mode === 'occupancy' ? [
                { l: '> 88%', c: 'var(--accent)' },
                { l: '70–88%', c: 'var(--amber)' },
                { l: '< 70%', c: 'var(--rose)' },
              ] : mode === 'energy' ? [
                { l: '< 80', c: 'var(--accent)' },
                { l: '80–100', c: 'var(--amber)' },
                { l: '> 100', c: 'var(--rose)' },
              ] : [
                { l: 'NPS > 60', c: 'var(--cyan)' },
                { l: '45–60', c: 'var(--accent)' },
                { l: '< 45', c: 'var(--amber)' },
              ]).map((x) => (
                <span key={x.l} className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: x.c }} /> {x.l}</span>
              ))}
              <span className="text-[7.5px]">click a floor to inspect</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-3 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">Asset · KT-01</div>
              <Badge tone={selected?.status === 'vacant' ? 'rose' : selected?.status === 'expiring' ? 'amber' : 'green'}>
                {selected ? selected.status : 'portfolio'}
              </Badge>
            </div>
            <h2 className="mt-1 font-display text-[16px] text-white">{selected ? `Level ${selected.level.toString().padStart(2, '0')}` : 'Kai Tak Tower I'}</h2>
            <div className="mt-0.5 text-[9.5px] text-[var(--muted)]">{selected ? selected.tenant : '16 floors in this cutaway · 42 storeys total'}</div>
            {selected && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { l: 'Occupancy', v: `${selected.occupancy}%` },
                  { l: 'Passing rent', v: selected.rent ? `HK$${selected.rent}` : '—' },
                  { l: 'Expiry', v: selected.expiry },
                  { l: 'Area', v: `${selected.area.toLocaleString()} ft²` },
                ].map((x) => (
                  <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2">
                    <div className="font-mono text-[7px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                    <div className="mt-0.5 num text-[11px] text-white">{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Floor stack</span><span className="font-mono text-[8px] text-[var(--dim)]">16 floors</span></div>
              <div className="mt-2 max-h-[250px] space-y-0.5 overflow-y-auto pr-1">
                {[...PROPTECH_FLOORS].reverse().map((f) => (
                  <button
                    key={f.level}
                    onClick={() => setSelectedLevel(f.level)}
                    className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-white/[.04]', selectedLevel === f.level && 'bg-white/[.055]')}
                  >
                    <span className="font-mono text-[8px] text-[var(--dim)]">{f.level.toString().padStart(2, '0')}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-white/[.06]"><span className="block h-full rounded-full" style={{ width: `${Math.max(4, f.occupancy)}%`, background: modeColor(mode, f) }} /></span>
                    <span className={cn('w-8 text-right font-mono text-[7.5px]', f.status === 'vacant' ? 'text-[var(--rose)]' : 'text-[var(--muted)]')}>{f.occupancy}%</span>
                    <ChevronRight size={9} className="text-[var(--dim)]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Leasing pipeline</span><span className="font-mono text-[8px] text-[var(--accent)]">4 live</span></div>
              <div className="mt-2 space-y-1.5">
                {LEASE_PIPELINE.slice(0, 3).map((l) => (
                  <div key={l.tenant} className="rounded-md border border-[var(--line)] bg-white/[.015] px-2.5 py-2">
                    <div className="flex items-center justify-between"><span className="text-[9px] text-[#dbe5ee]">{l.tenant}</span><span className="font-mono text-[7.5px] text-[var(--dim)]">{l.floor}</span></div>
                    <div className="mt-1 flex items-center justify-between"><span className="text-[7.5px] text-[var(--dim)]">{l.stage} · {l.rent}</span><span className="font-mono text-[7.5px] text-[var(--accent)]">{l.probability}%</span></div>
                    <Progress value={l.probability} color={l.probability > 60 ? 'var(--accent)' : 'var(--amber)'} height={2} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Tenant mix</span><span className="font-mono text-[8px] text-[var(--dim)]">income</span></div>
              <div className="mt-2 space-y-1.5">
                {TENANT_MIX.map((t) => (
                  <div key={t.name}>
                    <div className="flex justify-between text-[8px]"><span className="text-[var(--muted)]">{t.name}</span><span className="font-mono text-[#cfdae4]">{t.share}%</span></div>
                    <div className="mt-1 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${t.share * 2.2}%`, background: t.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between"><span className="eyebrow">Certification & green lease</span><Leaf size={10} className="text-[var(--accent)]" /></div>
              <div className="mt-2 flex flex-wrap gap-1">
                {['BEAM Plus Platinum', 'LEED Gold', 'WELL Gold'].map((c) => <span key={c} className="rounded border border-[rgba(62,224,161,.2)] bg-[rgba(62,224,161,.05)] px-1.5 py-0.5 font-mono text-[7px] text-[var(--accent)]">{c}</span>)}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[{ l: 'Green clauses', v: '18 / 24' }, { l: 'IAQ', v: '96' }, { l: 'Embodied', v: '−28%' }].map((x) => (
                  <div key={x.l} className="rounded border border-[var(--line)] bg-black/15 p-1.5"><div className="text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[10px] text-[#dbe5ee]">{x.v}</div></div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('Rent roll exported', 'Floor-by-floor rent roll and lease events exported to CSV.', 'success')}><ArrowUpRight size={11} /> Rent roll</Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={() => toast('Lease review opened', 'L08 renewal at +6.2% mark-to-market. Broker brief ready.', 'info')}><Building2 size={11} /> Review lease</Button>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Portfolio occupancy', v: `${portfolioOccupancy}%`, d: '+1.8 pts QoQ', icon: Users },
          { l: 'Passing rent', v: `HK$${passingRent}`, d: 'per sq ft / month', icon: TrendingUp },
          { l: 'WALE', v: '4.6 yrs', d: 'weighted lease expiry', icon: Building2 },
          { l: 'Net effective rent', v: '88.2%', d: 'after incentives', icon: PieChart },
        ].map((x) => (
          <div key={x.l} className="panel p-4">
            <div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{x.l}</span><x.icon size={12} className="text-[var(--dim)]" /></div>
            <div className="mt-2 num text-[22px] text-white">{x.v}</div>
            <div className="mt-1 text-[8px] text-[var(--dim)]">{x.d}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel eyebrow="Asset strategy" title="Where the next 24 months land" action={<Badge tone="amber">18% expiring</Badge>}>
          <div className="space-y-2.5">
            {[
              { l: 'L05 Meridian Labs', d: '2028 · 14,800 ft²', p: 38, c: 'var(--rose)' },
              { l: 'L08 Vela Studio', d: '2027 · 14,800 ft²', p: 71, c: 'var(--amber)' },
              { l: 'L14 Northstar', d: '2028 · 14,800 ft²', p: 52, c: 'var(--amber)' },
              { l: 'L16 Sky lounge', d: 'amenity · 6,200 ft²', p: 74, c: 'var(--accent)' },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: x.c }} />
                <div className="min-w-0 flex-1"><div className="truncate text-[9px] text-[#dbe5ee]">{x.l}</div><div className="text-[7.5px] text-[var(--dim)]">{x.d}</div></div>
                <span className="font-mono text-[8px]" style={{ color: x.c }}>{x.p}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-2 text-[8px] text-[var(--muted)]"><ArrowRight size={9} className="text-[var(--accent)]" /> Renewal programme at +6.2% MTM reviewed at Tuesday commercial.</div>
        </Panel>
        <Panel eyebrow="Space & experience" title="The product is the floor" action={<CheckCircle2 size={12} className="text-[var(--accent)]" />}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Utilisation', v: '78%' },
              { l: 'Desk ratio', v: '1 : 1.4' },
              { l: 'Meeting rooms', v: '92% booked' },
              { l: 'Tenant NPS', v: '+41' },
            ].map((x) => (
              <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.016] p-2.5">
                <div className="text-[7.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div>
                <div className="mt-0.5 num text-[14px] text-white">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 rounded-md border border-[rgba(81,214,255,.2)] bg-[rgba(81,214,255,.03)] p-2.5 text-[8px] leading-relaxed text-[var(--muted)]">
            L09 is the only fully vacant floor. Test-fits for a 42,000 ft² anchor are in review; leasing incentive is priced at 3.2 months rent-free.
          </div>
        </Panel>
        <Panel eyebrow="COO decision" title="One property, three levers" action={<Sparkles size={12} className="text-[var(--accent)]" />}>
          <div className="space-y-2">
            {[
              { l: 'Approve L09 anchor incentive', v: 'HK$4.8M', tone: 'amber' },
              { l: 'Fund L05 renewal package', v: 'HK$1.2M', tone: 'cyan' },
              { l: 'Retrofit L16 sky lounge', v: 'HK$3.1M', tone: 'violet' },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/[.014] p-2.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', x.tone === 'amber' ? 'bg-[var(--amber)]' : x.tone === 'cyan' ? 'bg-[var(--cyan)]' : 'bg-[var(--violet)]')} />
                <span className="flex-1 text-[8.5px] text-[#dbe5ee]">{x.l}</span>
                <span className="font-mono text-[8px] text-[#cfdae4]">{x.v}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[8px] text-[var(--dim)]"><CheckCircle2 size={9} className="text-[var(--accent)]" /> Human approval required before any concession is offered.</div>
        </Panel>
      </div>
    </div>
  );
}
