import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Box, Building2, ChevronRight, Clock3, FileText,
  BarChart3, Gauge, Loader2, MapPin, Radar, Sparkles, TrendingDown, TrendingUp, Users, Zap, HardHat, Bot, Layers3, Leaf, Boxes, Server, Navigation, ShieldCheck, Globe2, Factory, Trees, Thermometer, Landmark, Mountain, Anchor, Recycle, Car, Flame, Truck, Handshake, KeyRound, Ear, Umbrella, Database, ScanSearch, Waves, Wrench, BriefcaseBusiness, PlugZap, Droplets, Workflow,
} from 'lucide-react';
import { AreaChart, Donut, Sparkline } from '../components/charts';
import { Badge, Button, KpiCard, LiveTag, Modal, Panel, SectionHeader } from '../components/ui';
import { CityMap, DEFAULT_MAP_LAYERS } from '../components/CityMap';
import { TwinScene, type TwinLayers } from '../components/TwinScene';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import {
  ANOMALIES, ASSETS, CAPABILITIES, EXEC_DECISIONS, INSIGHTS, KPI_SERIES, SERIES, TELEMETRY, assetById,
} from '../lib/data';
import { cn, hkDate, hkd, signed } from '../lib/utils';
import type { Insight } from '../lib/types';

const HOME_TWIN_LAYERS: TwinLayers = { gis: true, iot: true, energy: false, transit: true };

const SEVERITY = {
  critical: { color: 'var(--rose)', tone: 'rose' as const, label: 'Act now' },
  warning: { color: 'var(--amber)', tone: 'amber' as const, label: 'Watch' },
  opportunity: { color: 'var(--accent)', tone: 'green' as const, label: 'Upside' },
  info: { color: 'var(--cyan)', tone: 'cyan' as const, label: 'Brief' },
};

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

function InsightRow({ insight, onClick }: { insight: Insight; onClick: () => void }) {
  const sev = SEVERITY[insight.severity];
  return (
    <button onClick={onClick} className="group w-full border-b border-[var(--line)] px-5 py-3.5 text-left transition-colors last:border-0 hover:bg-white/[.022]">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: sev.color, boxShadow: `0 0 8px ${sev.color}` }} />
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: sev.color }}>{sev.label}</span>
        <span className="ml-auto font-mono text-[8.5px] text-[var(--dim)]">{insight.confidence}% confidence</span>
      </div>
      <div className="mt-1.5 pr-3 text-[12px] font-medium leading-snug text-[#dce7f0] group-hover:text-white">{insight.title}</div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-[var(--muted)]">{insight.impact}</span>
        <ArrowUpRight size={12} className="shrink-0 text-[var(--dim)] transition-colors group-hover:text-[var(--accent)]" />
      </div>
    </button>
  );
}

export function Overview() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { insights, scan, scanStep, runScan, energy, occupancy, grid, sensors, now, dismissInsight, toast } = useLive();
  const [briefOpen, setBriefOpen] = useState(false);
  const [map3d, setMap3d] = useState(true);
  const active = insights.filter((i) => !i.dismissed);
  const top = useMemo(() => active.slice(0, 3), [active]);
  const deliveryRisk = 2;

  const openAsset = (id: string) => navigate(`/twin?asset=${id}`);

  return (
    <div className="page-enter mx-auto max-w-[1540px] space-y-5">
      <SectionHeader
        eyebrow={`Command center · ${hkDate(now)}`}
        title={t('home.title', 'Good afternoon, T. Lau.')}
        description={t('home.desc', 'One operating picture across 19 assets, 6 districts and 1,284 live sensor streams. The twin is synchronised; the ledger is attested.')}
        action={
          <>
            <Button variant="ghost" onClick={() => setBriefOpen(true)}><FileText size={13} /> {t('common.execBriefing', 'Executive briefing')}</Button>
            <Button variant="primary" onClick={runScan} disabled={scan === 'scanning'}>
              {scan === 'scanning' ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              {scan === 'scanning' ? t('common.scanning', 'Scanning city…') : t('common.runScan', 'Run city scan')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Portfolio value" value="12.84" unit="HK$B"
          delta="+3.2% QoQ" deltaTone="green"
          icon={<Building2 size={13} />}
          spark={<Sparkline data={KPI_SERIES.value} color="#3ee0a1" />}
          footer={<span>19 assets · 4.82M ft² under management</span>}
        />
        <KpiCard
          label="Operating margin" value="24.8" unit="%"
          delta="+1.3 pts YoY" deltaTone="green"
          icon={<Gauge size={13} />}
          spark={<Sparkline data={KPI_SERIES.margin} color="#45c4f5" />}
          footer={<span>EBITDA HK$318M · cash conversion 91%</span>}
        />
        <KpiCard
          label="Energy intensity" value={energy.toFixed(1)} unit="kWh/m²"
          delta="-11.6% YoY" deltaTone="green"
          icon={<Zap size={13} />}
          spark={<Sparkline data={KPI_SERIES.energy} color="#f5b748" />}
          footer={<span>vs 2026 pathway 88.0 · <span className="text-[var(--accent)]">ahead</span></span>}
        />
        <KpiCard
          label="Delivery on-time" value="92.6" unit="%"
          delta="-0.8 pts" deltaTone="rose"
          icon={<Activity size={13} />}
          spark={<Sparkline data={KPI_SERIES.delivery} color="#fb7185" />}
          footer={<span className="text-[var(--amber)]">{deliveryRisk} stage gates at risk · 1 recovery plan</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-[18px]">
            <div>
              <div className="eyebrow mb-1.5 flex items-center gap-2">Live twin <LiveTag label="Synchronised" /></div>
              <h2 className="panel-title">Kai Tak precinct · operational picture</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="tabs">
                <button className={cn('tab', !map3d && 'active')} onClick={() => setMap3d(false)}>2D</button>
                <button className={cn('tab', map3d && 'active')} onClick={() => setMap3d(true)}>3D</button>
              </div>
              <span className="chip"><span className="chip-dot" /> 8 assets in view</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/map')}><MapPin size={12} /> Geospatial</Button>
            </div>
          </div>

          <div className="relative mt-3 h-[318px] border-y border-[var(--line)]">
            {map3d ? (
              <TwinScene
                selectedId={null}
                onSelect={(id) => { if (id) openAsset(id); }}
                layers={HOME_TWIN_LAYERS}
                mode="night"
                autoRotate
                exploded={false}
                scenario="baseline"
                compact
              />
            ) : (
              <CityMap
                compact
                layers={{ ...DEFAULT_MAP_LAYERS, labels: true }}
                onSelect={openAsset}
                showControls={false}
              />
            )}
            <div className="pointer-events-none absolute left-4 top-4 w-[188px] rounded-lg border border-[var(--line-2)] bg-[#061016]/80 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">District status</span>
                <span className="live-dot" />
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                <div><div className="num text-[16px] text-white">{sensors.toLocaleString()}</div><div className="text-[8.5px] text-[var(--dim)]">Sensors live</div></div>
                <div><div className="num text-[16px] text-white">{occupancy.toFixed(1)}%</div><div className="text-[8.5px] text-[var(--dim)]">Occupancy</div></div>
                <div><div className="num text-[16px] text-white">{grid.toFixed(1)}<span className="ml-0.5 text-[9px] text-[var(--dim)]">MW</span></div><div className="text-[8.5px] text-[var(--dim)]">Grid load</div></div>
                <div><div className="num text-[16px] text-[var(--accent)]">99.2%</div><div className="text-[8.5px] text-[var(--dim)]">Availability</div></div>
              </div>
            </div>
            <button onClick={() => navigate('/twin')} className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-[rgba(62,224,161,.28)] bg-[#061016]/85 px-3 py-2 text-[10.5px] font-medium text-[#a9f2d7] backdrop-blur-md transition-colors hover:bg-[rgba(62,224,161,.12)]">
              <Box size={13} /> {t('common.openTwin', 'Enter digital twin')} <ArrowRight size={12} />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#061016]/70 to-transparent" />
          </div>

          <div className="grid grid-cols-2 divide-x divide-[var(--line)] sm:grid-cols-4">
            {TELEMETRY.map((t) => (
              <div key={t.label} className="px-4 py-3">
                <div className="text-[8.5px] uppercase tracking-[0.1em] text-[var(--dim)]">{t.label}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="num text-[17px] text-white">{t.label === 'Live sensors' ? sensors.toLocaleString() : t.value}</span>
                  <span className="text-[8.5px] text-[var(--dim)]">{t.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Panel
          className="xl:col-span-4"
          eyebrow={<span className="flex items-center gap-2"><Sparkles size={10} /> AI operations brief</span>}
          title="What needs your attention"
          action={<Badge tone="neutral">{active.length} actions</Badge>}
          bodyClassName="!px-0 !pb-0"
        >
          {scan === 'scanning' && (
            <div className="mx-4 mb-2 mt-1 rounded-lg border border-[rgba(62,224,161,.2)] bg-[rgba(62,224,161,.05)] p-3">
              <div className="flex items-center gap-2 text-[10px] text-[var(--accent)]"><Radar size={12} className="animate-spin" /> Scanning 4,218 signals</div>
              <div className="mt-1.5 text-[9.5px] text-[var(--muted)]">{scanStep}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[.06]">
                <div className="h-full w-1/2 rounded-full bg-[var(--accent)] shimmer" />
              </div>
            </div>
          )}
          <div className="mt-1">
            {top.map((insight) => (
              <InsightRow key={insight.id} insight={insight} onClick={() => navigate('/intelligence')} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/intelligence')}><Sparkles size={12} /> {t('common.ask', 'Ask intelligence')}</Button>
            <Button variant="ghost" size="sm" onClick={() => { top[0] && dismissInsight(top[0].id); toast('Action acknowledged', 'Assigned to the operating review on 24 Oct.', 'info'); }}>Acknowledge</Button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          className="xl:col-span-5"
          eyebrow="Financial performance"
          title="Revenue & margin trajectory"
          action={<span className="badge badge-green"><TrendingUp size={9} /> On plan</span>}
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="num text-[30px] text-white">HK$1.06B</span>
                <span className="font-mono text-[10px] text-[var(--accent)]">{signed(8.4)}%</span>
              </div>
              <div className="mt-1 text-[10px] text-[var(--dim)]">Trailing 12-month revenue · budget HK$1.02B</div>
            </div>
            <div className="text-right">
              <div className="eyebrow">EBITDA</div>
              <div className="num mt-1 text-[15px] text-[#dbe5ee]">HK$318M</div>
            </div>
          </div>
          <AreaChart
            className="mt-3"
            height={186}
            labels={MONTHS}
            series={[
              { name: 'Revenue', color: '#3ee0a1', data: SERIES.revenue.map((v) => v * 10) },
              { name: 'Plan', color: '#8a99aa', data: SERIES.revenue.map((_, i) => 860 + i * 12), dashed: true, fill: false },
            ]}
            yFormat={(n) => `${Math.round(n / 100) / 10}B`}
            xTicks={6}
          />
          <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-3 text-[9.5px] text-[var(--dim)]">
            <span>Revenue <span className="text-[var(--accent)]">●</span></span>
            <span>Budget <span className="text-[#8a99aa]">●</span></span>
            <span className="ml-auto text-[var(--muted)]">Recurring revenue 62%</span>
          </div>
        </Panel>

        <Panel
          className="xl:col-span-4"
          eyebrow="Operations"
          title="Anomalies & work orders"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/intelligence')}>All <ChevronRight size={11} /></Button>}
          bodyClassName="!px-0 !pb-0"
        >
          <div className="mt-1">
            {ANOMALIES.slice(0, 4).map((a) => (
              <button key={a.id} onClick={() => openAsset(a.assetId)} className="flex w-full items-center gap-3 border-b border-[var(--line)] px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-white/[.022]">
                <span className={cn('h-6 w-[2px] rounded-full', a.severity === 'critical' ? 'bg-[var(--rose)]' : a.severity === 'warning' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]')} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] text-[#d8e3ed]">{a.asset}</div>
                  <div className="mt-0.5 truncate text-[9.5px] text-[var(--dim)]">{a.signal} · {a.detected}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[10px] text-[var(--amber)]">{a.deviation.split(' ')[0]}</div>
                  <div className="mt-0.5 font-mono text-[8px] text-[var(--dim)]">HK${a.savings}M/yr</div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2.5">
            <span className="font-mono text-[8.5px] uppercase tracking-wider text-[var(--dim)]">47 open · 12 P1</span>
            <span className="flex items-center gap-1 text-[9.5px] text-[var(--accent)]"><Activity size={10} /> 94% SLA</span>
          </div>
        </Panel>

        <Panel className="xl:col-span-3" eyebrow="Carbon position" title="Pathway progress" action={<Badge tone="green">-11.6%</Badge>}>
          <div className="flex items-center gap-4">
            <Donut
              size={112}
              thickness={9}
              segments={[
                { label: 'Scope 1', value: 8, color: '#f5b748' },
                { label: 'Scope 2', value: 54, color: '#3ee0a1' },
                { label: 'Scope 3', value: 38, color: '#45c4f5' },
              ]}
              center={<><span className="num text-[18px] text-white">2,184</span><span className="mt-0.5 text-[8px] uppercase tracking-wider text-[var(--dim)]">tCO₂e</span></>}
            />
            <div className="flex-1 space-y-2">
              {[{ l: 'Scope 1', v: 8, c: '#f5b748' }, { l: 'Scope 2', v: 54, c: '#3ee0a1' }, { l: 'Scope 3', v: 38, c: '#45c4f5' }].map((s) => (
                <div key={s.l} className="flex items-center gap-2">
                  <span className="legend-dot" style={{ background: s.c }} />
                  <span className="flex-1 text-[9.5px] text-[var(--muted)]">{s.l}</span>
                  <span className="font-mono text-[9.5px] text-[#cfdae4]">{s.v}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-[var(--line)] bg-white/[.02] p-2.5">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[var(--dim)]">2026 target · 2,050 t</span>
              <span className="font-mono text-[var(--amber)]">gap 6.2%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#2fcf92] to-[#3ee0a1]" style={{ width: '78%' }} />
            </div>
            <div className="mt-1.5 text-[8.5px] text-[var(--dim)]">1,284 verified credits held · 420 retired YTD</div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { to: '/bim', icon: Boxes, titleKey: 'studio.bim.title', descKey: 'studio.bim.desc', metaKey: 'studio.bim.meta', label: 'BIM Studio', desc: 'Federated architecture, structure, MEP and fire coordination with 4D and COBie.', meta: 'LOD 350 · 5 clashes', color: '#51d6ff' },
          { to: '/bim-site', icon: HardHat, titleKey: 'studio.bimSite.title', descKey: 'studio.bimSite.desc', metaKey: 'studio.bimSite.meta', label: 'BIM on Site', desc: 'A live Kai Tak site: 4D sequence, cranes, clashes and as-built.', meta: 'Tower A · 62% complete', color: '#f4bd72' },
          { to: '/bim-workflows', icon: Workflow, titleKey: 'studio.bimWorkflows.title', descKey: 'studio.bimWorkflows.desc', metaKey: 'studio.bimWorkflows.meta', label: 'BIM Workflows', desc: 'Revit to Proptech.AI: ten-tool BIM workflow and access analytics.', meta: '10 tools · BCF 3.0', color: '#53f0be' },
          { to: '/design', icon: Sparkles, titleKey: 'studio.design.title', descKey: 'studio.design.desc', metaKey: 'studio.design.meta', label: 'Generative Design', desc: 'Three massing options compared on yield, daylight, carbon and cost.', meta: '3 options · scored', color: '#a991ff' },
          { to: '/bim-xr', icon: Sparkles, titleKey: 'studio.bimxr.title', descKey: 'studio.bimxr.desc', metaKey: 'studio.bimxr.meta', label: 'BIM XR', desc: 'Holographic data centre twin with exploded BIM and live telemetry.', meta: '32 racks · 12 MW · PUE 1.16', color: '#a991ff' },
          { to: '/esg-building', icon: Leaf, titleKey: 'studio.esgb.title', descKey: 'studio.esgb.desc', metaKey: 'studio.esgb.meta', label: 'ESG Building Twin', desc: 'Twelve floors of energy, carbon, water and wellbeing in 3D.', meta: 'BEAM Plus · GRESB 82', color: '#7ee787' },
          { to: '/esg-world', icon: Globe2, titleKey: 'studio.esgWorld.title', descKey: 'studio.esgWorld.desc', metaKey: 'studio.esgWorld.meta', label: 'ESG World Model', desc: 'A causal 2026–2050 world model linking BIM, carbon, climate and value.', meta: 'SSP2-4.5 · carbon budget', color: '#45c4f5' },
          { to: '/water', icon: Droplets, titleKey: 'studio.water.title', descKey: 'studio.water.desc', metaKey: 'studio.water.meta', label: 'Water & Circularity', desc: 'Reservoir, treatment, leaks, quality and greywater reuse in 3D.', meta: 'NRW 12.4% · 28% reuse', color: '#45c4f5' },
          { to: '/port', icon: Anchor, titleKey: 'studio.port.title', descKey: 'studio.port.desc', metaKey: 'studio.port.meta', label: 'Port & Logistics', desc: 'Container terminal, cranes, yard, trucks, rail and emissions in 3D.', meta: '32 moves/hr · 38% rail', color: '#51d6ff' },
          { to: '/dc-ops', icon: Server, titleKey: 'studio.dcops.title', descKey: 'studio.dcops.desc', metaKey: 'studio.dcops.meta', label: 'DC Operations', desc: 'AI-led energy, cooling and predictive maintenance for a 12 MW hall.', meta: '12 MW · PUE 1.16', color: '#51d6ff' },
          { to: '/plant', icon: Thermometer, titleKey: 'studio.plant.title', descKey: 'studio.plant.desc', metaKey: 'studio.plant.meta', label: 'Plant & BMS', desc: 'Chillers, pumps, tower, AHU and BMS in an interactive plant room.', meta: 'COP 6.4 · 7 assets', color: '#45c4f5' },
          { to: '/mobility', icon: Navigation, titleKey: 'studio.mobility.title', descKey: 'studio.mobility.desc', metaKey: 'studio.mobility.meta', label: 'Mobility', desc: 'Autonomous loop, transit, ferry, drones and curb management in 3D.', meta: '32 vehicles · 4 modes', color: '#f4bd72' },
          { to: '/traffic', icon: Car, titleKey: 'studio.traffic.title', descKey: 'studio.traffic.desc', metaKey: 'studio.traffic.meta', label: 'Traffic & Junctions', desc: 'Adaptive signals, cars, bus, cyclists and pedestrians in 3D.', meta: '42s delay · 4 approaches', color: '#51d6ff' },
          { to: '/resilience', icon: ShieldCheck, titleKey: 'studio.res.title', descKey: 'studio.res.desc', metaKey: 'studio.res.meta', label: 'Resilience', desc: 'Typhoon, storm surge, flood, outages, shelters and response in 3D.', meta: 'EOC · T8 live', color: '#45c4f5' },
          { to: '/place', icon: Trees, titleKey: 'studio.place.title', descKey: 'studio.place.desc', metaKey: 'studio.place.meta', label: 'Public Realm', desc: 'Lawns, market, water, stage, play and transit arrival measured for people.', meta: '3,840 visits · 38% canopy', color: '#7ee787' },
          { to: '/construction', icon: HardHat, titleKey: 'studio.construction.title', descKey: 'studio.construction.desc', metaKey: 'studio.construction.meta', label: 'Construction Twin', desc: '4D site, crane logistics and BIM-to-field control.', meta: '56% built · 3 NCRs', color: '#f4bd72' },
          { to: '/fleet', icon: Truck, titleKey: 'studio.fleet.title', descKey: 'studio.fleet.desc', metaKey: 'studio.fleet.meta', label: 'Fleet & Equipment', desc: 'Cranes, excavators, loaders, generator and drone in 3D.', meta: '86% utilised · 7 assets', color: '#f4bd72' },
          { to: '/handover', icon: KeyRound, titleKey: 'studio.handover.title', descKey: 'studio.handover.desc', metaKey: 'studio.handover.meta', label: 'Commissioning & Handover', desc: 'Systems, snags, asset tags and handover gate in 3D.', meta: '4,820 assets · 98% ready', color: '#53f0be' },
          { to: '/quality', icon: ScanSearch, titleKey: 'studio.quality.title', descKey: 'studio.quality.desc', metaKey: 'studio.quality.meta', label: 'Quality & Inspection', desc: 'Defect pins, drone scans, NCRs and rework in 3D.', meta: '91% FTR · 6 defects', color: '#ff7088' },
          { to: '/utilities', icon: Waves, titleKey: 'studio.utilities.title', descKey: 'studio.utilities.desc', metaKey: 'studio.utilities.meta', label: 'Underground Utilities', desc: 'Water, power, telecom, gas, drainage and cooling below ground.', meta: '6 networks · 2 clashes', color: '#45c4f5' },
          { to: '/assets', icon: BarChart3, titleKey: 'studio.assets.title', descKey: 'studio.assets.desc', metaKey: 'studio.assets.meta', label: 'Asset Lifecycle', desc: 'Condition, remaining life, capex and criticality in 3D.', meta: '4,820 assets · 78% B+', color: '#f4bd72' },
          { to: '/heritage', icon: Landmark, titleKey: 'studio.heritage.title', descKey: 'studio.heritage.desc', metaKey: 'studio.heritage.meta', label: 'Heritage & Reuse', desc: 'Masonry, arches, new core and courtyard in 3D.', meta: '82% retained · −64% carbon', color: '#f4bd72' },
          { to: '/maintenance', icon: Wrench, titleKey: 'studio.maintenance.title', descKey: 'studio.maintenance.desc', metaKey: 'studio.maintenance.meta', label: 'Maintenance', desc: 'Work orders, SLA, technicians and spares in 3D.', meta: '12 open · 94% SLA', color: '#51d6ff' },
          { to: '/power', icon: Zap, titleKey: 'studio.power.title', descKey: 'studio.power.desc', metaKey: 'studio.power.meta', label: 'Electrical Distribution', desc: 'Transformers, switchgear, ATS, UPS and generator in 3D.', meta: '1.84 MW · PF 0.96', color: '#f4bd72' },
          { to: '/ev', icon: PlugZap, titleKey: 'studio.ev.title', descKey: 'studio.ev.desc', metaKey: 'studio.ev.meta', label: 'EV Charging', desc: 'Solar canopy, fast chargers, battery and grid in 3D.', meta: '6 points · 62% solar', color: '#53f0be' },
          { to: '/vehicles', icon: Car, titleKey: 'studio.vehicles.title', descKey: 'studio.vehicles.desc', metaKey: 'studio.vehicles.meta', label: 'Vehicle Studio', desc: 'Sedan, SUV, van, bus and truck in a real-time showroom.', meta: '5 models · 6 paints', color: '#cfd8da' },
          { to: '/deals', icon: BriefcaseBusiness, titleKey: 'studio.deals.title', descKey: 'studio.deals.desc', metaKey: 'studio.deals.meta', label: 'Deal Room', desc: 'Target, diligence, IC gates and synergies in 3D.', meta: 'HK$6.5B · 3 deals', color: '#a991ff' },
          { to: '/safety', icon: ShieldCheck, titleKey: 'studio.safety.title', descKey: 'studio.safety.desc', metaKey: 'studio.safety.meta', label: 'Site Safety', desc: 'Hazard zones, crane lift exclusion, fire drill and typhoon readiness.', meta: 'LTIFR 0.42 · 148 workers', color: '#ff7088' },
          { to: '/fire', icon: Flame, titleKey: 'studio.fire.title', descKey: 'studio.fire.desc', metaKey: 'studio.fire.meta', label: 'Fire & Life Safety', desc: 'Compartments, detection, sprinklers, egress and fire service access.', meta: 'FR 120 · evac 4:20', color: '#ff9f43' },
          { to: '/supply', icon: Globe2, titleKey: 'studio.supply.title', descKey: 'studio.supply.desc', metaKey: 'studio.supply.meta', label: 'Supply Chain', desc: 'Global supplier network, lanes, inventory, risk and lane carbon in 3D.', meta: '9 nodes · 8 lanes', color: '#51d6ff' },
          { to: '/procurement', icon: Handshake, titleKey: 'studio.procurement.title', descKey: 'studio.procurement.desc', metaKey: 'studio.procurement.meta', label: 'Procurement', desc: 'Tender packages, bidders, award gate, savings and supply risk.', meta: '6 packages · 4.2% savings', color: '#53f0be' },
          { to: '/contracts', icon: FileText, titleKey: 'studio.contracts.title', descKey: 'studio.contracts.desc', metaKey: 'studio.contracts.meta', label: 'Contracts & Claims', desc: 'Obligations, claims, time bars and renewals in 3D.', meta: '6 contracts · 2 claims', color: '#f4bd72' },
          { to: '/waste', icon: Recycle, titleKey: 'studio.waste.title', descKey: 'studio.waste.desc', metaKey: 'studio.waste.meta', label: 'Waste & Circularity', desc: 'Material streams, skips, crusher, recovery and carbon avoided in 3D.', meta: '68% diverted · 6 streams', color: '#7ee787' },
          { to: '/factory', icon: Factory, titleKey: 'studio.factory.title', descKey: 'studio.factory.desc', metaKey: 'studio.factory.meta', label: 'Offsite Factory', desc: 'Robotic cells, conveyor, modules, AGVs and quality in 3D.', meta: '18 modules/week · OEE 78%', color: '#53f0be' },
          { to: '/engineering', icon: Building2, titleKey: 'studio.engineering.title', descKey: 'studio.engineering.desc', metaKey: 'studio.engineering.meta', label: 'Structural & Civil', desc: 'Load cases, deflection and a cable-stayed harbour link.', meta: 'UC 0.86 · 68 m link', color: '#51d6ff' },
          { to: '/ground', icon: Mountain, titleKey: 'studio.ground.title', descKey: 'studio.ground.desc', metaKey: 'studio.ground.meta', label: 'Ground Engineering', desc: 'Strata, boreholes, groundwater, piles and settlement in 3D.', meta: '5 strata · 6 piles', color: '#f4bd72' },
          { to: '/facade', icon: Layers3, titleKey: 'studio.facade.title', descKey: 'studio.facade.desc', metaKey: 'studio.facade.meta', label: 'Facade Lab', desc: 'Unitised facade mock-up, thermal, wind, water and installation QA.', meta: 'U 1.08 · 600 Pa', color: '#51d6ff' },
          { to: '/seismic', icon: Activity, titleKey: 'studio.seismic.title', descKey: 'studio.seismic.desc', metaKey: 'studio.seismic.meta', label: 'Seismic Resilience', desc: 'Base isolation, dampers, drift and damage under three earthquake levels.', meta: 'PGA 0.18 g · drift 1/420', color: '#ff7088' },
          { to: '/acoustics', icon: Ear, titleKey: 'studio.acoustics.title', descKey: 'studio.acoustics.desc', metaKey: 'studio.acoustics.meta', label: 'Acoustics & Vibration', desc: 'Concert hall, noise, speech privacy and rail vibration in 3D.', meta: 'RT 1.9 s · 6 zones', color: '#a991ff' },
          { to: '/proptech', icon: Layers3, titleKey: 'studio.proptech.title', descKey: 'studio.proptech.desc', metaKey: 'studio.proptech.meta', label: 'PropTech Stack', desc: 'A 16-floor leasing cutaway with rent and space signals.', meta: '84% occupied · 18% expiring', color: '#a991ff' },
          { to: '/workplace', icon: Building2, titleKey: 'studio.work.title', descKey: 'studio.work.desc', metaKey: 'studio.work.meta', label: 'Workplace', desc: 'Desk and room utilisation, comfort, bookings and tenant experience in 3D.', meta: '78% desks · NPS +42', color: '#53f0be' },
          { to: '/agents', icon: Bot, titleKey: 'studio.agents.title', descKey: 'studio.agents.desc', metaKey: 'studio.agents.meta', label: 'Agent Operations', desc: 'Eight specialists, four human gates and one board pack.', meta: '8 agents · 1 human', color: '#53f0be' },
          { to: '/war-room', icon: Bot, titleKey: 'studio.war.title', descKey: 'studio.war.desc', metaKey: 'studio.war.meta', label: 'Agent War Room', desc: 'Eight AI specialists debate an incident, quarter close or design review.', meta: 'Evidence · challenge · gate', color: '#ff9f43' },
          { to: '/people', icon: Users, titleKey: 'studio.people.title', descKey: 'studio.people.desc', metaKey: 'studio.people.meta', label: 'People & Talent', desc: 'Org graph, capacity, critical skills, hiring and succession in 3D.', meta: '438 people · 7 functions', color: '#f4bd72' },
          { to: '/esg', icon: Leaf, titleKey: 'studio.esg.title', descKey: 'studio.esg.desc', metaKey: 'studio.esg.meta', label: 'ESG & Climate', desc: 'Carbon, nature, climate risk and ESG assurance in one spatial view.', meta: 'GRESB 82 · net zero 2045', color: '#7ee787' },
          { to: '/energy', icon: Zap, titleKey: 'studio.energy.title', descKey: 'studio.energy.desc', metaKey: 'studio.energy.meta', label: 'Energy & Grid', desc: 'Microgrid, storage, critical load and island-mode resilience.', meta: 'CLP 11 kV · 50 Hz', color: '#f4bd72' },
          { to: '/capital', icon: Landmark, titleKey: 'studio.capital.title', descKey: 'studio.capital.desc', metaKey: 'studio.capital.meta', label: 'Capital & Investors', desc: 'Capital stack, returns, covenants and investor register in 3D.', meta: 'HK$1.20B · IRR 14.8%', color: '#53f0be' },
          { to: '/insurance', icon: Umbrella, titleKey: 'studio.insurance.title', descKey: 'studio.insurance.desc', metaKey: 'studio.insurance.meta', label: 'Insurance & Risk', desc: 'Policies, limits, claims, premiums and cat exposure in 3D.', meta: 'HK$8.7B cover · 6 policies', color: '#a991ff' },
          { to: '/data', icon: Database, titleKey: 'studio.data.title', descKey: 'studio.data.desc', metaKey: 'studio.data.meta', label: 'Data & AI Governance', desc: 'Seven domains, 102 products, lineage, quality and access in 3D.', meta: '94% quality · 98% lineage', color: '#51d6ff' },
          { to: '/labs', icon: Sparkles, titleKey: 'studio.labs.title', descKey: 'studio.labs.desc', metaKey: 'studio.labs.meta', label: 'Innovation Lab', desc: 'Six ventures, experiments, TRL, IP and value around an AI core.', meta: '6 ventures · 18 experiments', color: '#a991ff' },
          { to: '/cyber', icon: ShieldCheck, titleKey: 'studio.cyber.title', descKey: 'studio.cyber.desc', metaKey: 'studio.cyber.meta', label: 'Cyber & OT', desc: 'Attack paths, zones, SOC alerts and response in 3D.', meta: 'IEC 62443 · 19 assets', color: '#ff7088' },
        ].map((x) => (
          <button key={x.to} onClick={() => navigate(x.to)} className="panel group relative overflow-hidden p-4 text-left transition-colors hover:border-[var(--line-2)]">
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30" style={{ background: x.color }} />
            <div className="flex items-start justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white/[.03]" style={{ color: x.color }}><x.icon size={15} /></span>
              <ArrowUpRight size={13} className="text-[var(--dim)] transition-colors group-hover:text-white" />
            </div>
            <div className="mt-3 font-display text-[13px] text-white">{t(x.titleKey, x.label)}</div>
            <div className="mt-1 text-[9px] leading-relaxed text-[var(--muted)]">{t(x.descKey, x.desc)}</div>
            <div className="mt-2.5 border-t border-[var(--line)] pt-2 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: x.color }}>{t(x.metaKey, x.meta)}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          className="xl:col-span-8"
          eyebrow="Decision rights"
          title="Executive decisions queue"
          action={<span className="font-mono text-[9px] text-[var(--dim)]">4 awaiting COO</span>}
          bodyClassName="!px-0 !pb-0"
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Decision</th><th>Stage</th><th>Owner</th><th>Impact</th><th>Due</th><th /></tr>
              </thead>
              <tbody>
                {EXEC_DECISIONS.map((d) => (
                  <tr key={d.id} className="group">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full',
                          d.tone === 'critical' ? 'bg-[var(--rose)]' : d.tone === 'warning' ? 'bg-[var(--amber)]' : d.tone === 'opportunity' ? 'bg-[var(--accent)]' : 'bg-[var(--cyan)]')} />
                        <span className="text-[11.5px] text-[#d8e3ed]">{d.title}</span>
                      </div>
                    </td>
                    <td><span className="text-[10px] text-[var(--muted)]">{d.stage}</span></td>
                    <td><span className="font-mono text-[10px] text-[var(--muted)]">{d.owner}</span></td>
                    <td><span className="font-mono text-[10px] text-white">{d.impact}</span></td>
                    <td><span className="font-mono text-[10px] text-[var(--muted)]">{d.due}</span></td>
                    <td>
                      <Button size="sm" variant="ghost" className="opacity-60 group-hover:opacity-100" onClick={() => toast('Decision opened', `${d.title} · assigned for review.`, 'info')}>
                        Review <ArrowRight size={11} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="xl:col-span-4" eyebrow="Operating rhythm" title="Today in the business" action={<LiveTag label="HKT" />}>
          <div className="space-y-0">
            {[
              { time: '09:30', title: 'Executive Committee', meta: 'Portfolio, cash & delivery · Boardroom 2', tone: 'done' },
              { time: '11:00', title: 'CLP capacity working session', meta: 'TKO expansion · with GridSense', tone: 'done' },
              { time: '14:30', title: 'Kai Tak JV partner review', meta: 'Twin Phase 2 · G4 readiness', tone: 'live' },
              { time: '16:00', title: 'COO operating review', meta: 'Exceptions, risk & decisions', tone: 'next' },
            ].map((m) => (
              <div key={m.time} className="flex gap-3 border-b border-[var(--line)] py-2.5 last:border-0">
                <span className="mono-num w-10 shrink-0 pt-0.5 text-[10px] text-[var(--muted)]">{m.time}</span>
                <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', m.tone === 'done' ? 'bg-[var(--dim)]' : m.tone === 'live' ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'border border-[var(--dim)]')} />
                <div className="min-w-0">
                  <div className={cn('text-[11px] leading-tight', m.tone === 'done' ? 'text-[var(--muted)]' : 'text-[#dbe5ee]')}>{m.title}</div>
                  <div className="mt-0.5 truncate text-[9px] text-[var(--dim)]">{m.meta}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[rgba(62,224,161,.18)] bg-[rgba(62,224,161,.04)] px-3 py-2">
            <div className="flex items-center gap-2 text-[9.5px] text-[var(--muted)]"><Users size={12} className="text-[var(--accent)]" /> Exec team coverage</div>
            <span className="font-mono text-[10px] text-[var(--accent)]">5 / 5</span>
          </div>
        </Panel>
      </div>

      <Modal
        open={briefOpen}
        onClose={() => setBriefOpen(false)}
        eyebrow="Executive briefing · confidential"
        title={`Ophylla Ventures · operating brief · ${hkDate(now)}`}
        size="lg"
        footer={<><Button variant="ghost" onClick={() => setBriefOpen(false)}>Close</Button><Button variant="primary" onClick={() => window.print()}><FileText size={12} /> Print / save PDF</Button></>}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-[var(--line)] bg-white/[.02] p-4">
            <div className="eyebrow mb-2">Position</div>
            <p className="text-[12.5px] leading-relaxed text-[#c7d4df]">
              The portfolio is tracking <strong className="text-white">ahead of plan on margin</strong> and <strong className="text-white">ahead of the 2026 energy pathway</strong>, with delivery performance as the principal soft spot. Two stage gates are amber and one recovery plan is live in Kowloon East.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { k: 'Revenue', v: 'HK$1.06B', s: '+8.4% YoY' },
              { k: 'EBITDA margin', v: '24.8%', s: '+1.3 pts' },
              { k: 'Energy intensity', v: '84.2', s: '-11.6% YoY' },
            ].map((x) => (
              <div key={x.k} className="rounded-lg border border-[var(--line)] p-3">
                <div className="text-[9px] uppercase tracking-wider text-[var(--dim)]">{x.k}</div>
                <div className="num mt-1 text-[18px] text-white">{x.v}</div>
                <div className="mt-0.5 font-mono text-[9px] text-[var(--accent)]">{x.s}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="eyebrow mb-2">Decisions requested</div>
            <div className="space-y-2">
              {EXEC_DECISIONS.slice(0, 3).map((d, i) => (
                <div key={d.id} className="flex items-start gap-3 rounded-lg border border-[var(--line)] p-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-[var(--line-2)] font-mono text-[9px] text-[var(--muted)]">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-[#dbe5ee]">{d.title}</div>
                    <div className="mt-0.5 text-[9px] text-[var(--dim)]">Owner {d.owner} · due {d.due} · {d.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[rgba(245,183,72,.18)] bg-[rgba(245,183,72,.04)] p-3">
            <div className="flex items-center gap-2 text-[10px] text-[var(--amber)]"><Zap size={12} /> Single largest value lever</div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">TKO grid capacity. Resolving the 2.4 MW constraint before Q2 2027 protects HK$186M of contracted expansion revenue and preserves the data-centre growth thesis.</p>
          </div>
          <div className="text-[9px] leading-relaxed text-[var(--dim)]">Illustrative demo data for executive presentation. Not actual client or portfolio information.</div>
        </div>
      </Modal>
    </div>
  );
}
