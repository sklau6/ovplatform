import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, BarChart3, Bell, Box, CheckCircle2, ChevronRight, Command,
  FileText, Layers3, LayoutDashboard, Link2, Map as MapIcon, Maximize2, Menu, Minimize2,
  Search, Sparkles, X, Zap, AlertTriangle, Info, CircleDot, ShieldCheck, HardHat, Building2, Bot, Sun, Moon, Globe2, Leaf, Boxes, Server, Navigation, Droplets, Users, Trees, Thermometer, Landmark, Mountain, Anchor, Recycle, Car, Flame, Truck, Handshake, KeyRound, Ear, Umbrella, Database, ScanSearch, Waves, Wrench, BriefcaseBusiness, PlugZap, Workflow,
  Factory,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLive } from '../lib/store';
import { useTheme } from '../lib/theme';
import { useI18n, LOCALES, type Locale } from '../lib/i18n';
import { cn, hkDate, hkTime } from '../lib/utils';
import { COMPANY } from '../lib/data';
import { LiveTag } from './ui';

const NAV: Array<{ label: string; sectionKey: string; items: Array<{ to: string; label: string; labelKey: string; icon: LucideIcon; key: string; badge?: string }> }> = [
  {
    label: 'Command',
    sectionKey: 'nav.section.command',
    items: [
      { to: '/', label: 'Command Center', labelKey: 'nav.command', icon: LayoutDashboard, key: 'G C' },
      { to: '/twin', label: 'Digital Twin', labelKey: 'nav.twin', icon: Box, key: 'G T' },
      { to: '/map', label: 'Geospatial', labelKey: 'nav.map', icon: MapIcon, key: 'G M' },
      { to: '/mobility', label: 'Mobility', labelKey: 'nav.mobility', icon: Navigation, key: 'G V' },
      { to: '/traffic', label: 'Traffic & Junctions', labelKey: 'nav.traffic', icon: Car, key: 'G T' },
      { to: '/ev', label: 'EV Charging', labelKey: 'nav.ev', icon: PlugZap, key: 'G E' },
      { to: '/vehicles', label: 'Vehicle Studio', labelKey: 'nav.vehicles', icon: Car, key: 'G V' },
      { to: '/resilience', label: 'Resilience', labelKey: 'nav.res', icon: ShieldCheck, key: 'G Z' },
      { to: '/place', label: 'Public Realm', labelKey: 'nav.place', icon: Trees, key: 'G L' },
      { to: '/heritage', label: 'Heritage & Reuse', labelKey: 'nav.heritage', icon: Landmark, key: 'G H' },
      { to: '/intelligence', label: 'Intelligence', labelKey: 'nav.intelligence', icon: Sparkles, key: 'G I', badge: '3' },
      { to: '/data', label: 'Data & AI Governance', labelKey: 'nav.data', icon: Database, key: 'G D' },
      { to: '/trust', label: 'Trust Ledger', labelKey: 'nav.trust', icon: Link2, key: 'G B' },
    ],
  },
  {
    label: 'Build & operate',
    sectionKey: 'nav.section.build',
    items: [
      { to: '/construction', label: 'Construction Twin', labelKey: 'nav.construction', icon: HardHat, key: 'G H' },
      { to: '/fleet', label: 'Fleet & Equipment', labelKey: 'nav.fleet', icon: Truck, key: 'G Q' },
      { to: '/handover', label: 'Handover', labelKey: 'nav.handover', icon: KeyRound, key: 'G X' },
      { to: '/quality', label: 'Quality & Inspection', labelKey: 'nav.quality', icon: ScanSearch, key: 'G Q' },
      { to: '/utilities', label: 'Underground Utilities', labelKey: 'nav.utilities', icon: Waves, key: 'G W' },
      { to: '/safety', label: 'Site Safety', labelKey: 'nav.safety', icon: ShieldCheck, key: 'G Y' },
      { to: '/fire', label: 'Fire & Life Safety', labelKey: 'nav.fire', icon: Flame, key: 'G B' },
      { to: '/supply', label: 'Supply Chain', labelKey: 'nav.supply', icon: Globe2, key: 'G C' },
      { to: '/procurement', label: 'Procurement', labelKey: 'nav.procurement', icon: Handshake, key: 'G A' },
      { to: '/contracts', label: 'Contracts & Claims', labelKey: 'nav.contracts', icon: FileText, key: 'G K' },
      { to: '/waste', label: 'Waste & Circularity', labelKey: 'nav.waste', icon: Recycle, key: 'G E' },
      { to: '/factory', label: 'Offsite Factory', labelKey: 'nav.factory', icon: Factory, key: 'G F' },
      { to: '/bim', label: 'BIM Studio', labelKey: 'nav.bim', icon: Boxes, key: 'G I' },
      { to: '/bim-site', label: 'BIM on Site', labelKey: 'nav.bimSite', icon: HardHat, key: 'G O' },
      { to: '/bim-workflows', label: 'BIM Workflows', labelKey: 'nav.bimWorkflows', icon: Workflow, key: 'G W' },
      { to: '/design', label: 'Generative Design', labelKey: 'nav.design', icon: Sparkles, key: 'G J' },
      { to: '/bim-xr', label: 'BIM XR', labelKey: 'nav.bimxr', icon: Box, key: 'G X' },
      { to: '/engineering', label: 'Structural & Civil', labelKey: 'nav.engineering', icon: Building2, key: 'G N' },
      { to: '/ground', label: 'Ground Engineering', labelKey: 'nav.ground', icon: Mountain, key: 'G G' },
      { to: '/facade', label: 'Facade Lab', labelKey: 'nav.facade', icon: Layers3, key: 'G F' },
      { to: '/seismic', label: 'Seismic Resilience', labelKey: 'nav.seismic', icon: Activity, key: 'G S' },
      { to: '/acoustics', label: 'Acoustics & Vibration', labelKey: 'nav.acoustics', icon: Ear, key: 'G V' },
      { to: '/proptech', label: 'PropTech Stack', labelKey: 'nav.proptech', icon: Layers3, key: 'G R' },
      { to: '/workplace', label: 'Workplace', labelKey: 'nav.workplace', icon: Building2, key: 'G K' },
      { to: '/esg', label: 'ESG & Climate', labelKey: 'nav.esg', icon: Leaf, key: 'G S' },
      { to: '/energy', label: 'Energy & Grid', labelKey: 'nav.energy', icon: Zap, key: 'G G' },
    ],
  },
  {
    label: 'OCEAN operations',
    sectionKey: 'nav.section.ocean',
    items: [
      { to: '/esg-building', label: 'ESG Building Twin', labelKey: 'nav.esgb', icon: Leaf, key: 'G E' },
      { to: '/esg-world', label: 'ESG World Model', labelKey: 'nav.esgWorld', icon: Globe2, key: 'G W' },
      { to: '/water', label: 'Water & Circularity', labelKey: 'nav.water', icon: Droplets, key: 'G U' },
      { to: '/port', label: 'Port & Logistics', labelKey: 'nav.port', icon: Anchor, key: 'G O' },
      { to: '/dc-ops', label: 'DC Operations', labelKey: 'nav.dcops', icon: Server, key: 'G D' },
      { to: '/plant', label: 'Plant & BMS', labelKey: 'nav.plant', icon: Thermometer, key: 'G N' },
      { to: '/power', label: 'Electrical Distribution', labelKey: 'nav.power', icon: Zap, key: 'G P' },
      { to: '/assets', label: 'Asset Lifecycle', labelKey: 'nav.assets', icon: BarChart3, key: 'G A' },
      { to: '/maintenance', label: 'Maintenance', labelKey: 'nav.maintenance', icon: Wrench, key: 'G M' },
    ],
  },
  {
    label: 'Executive',
    sectionKey: 'nav.section.executive',
    items: [
      { to: '/agents', label: 'Agent Operations', labelKey: 'nav.agents', icon: Bot, key: 'G O', badge: '8' },
      { to: '/war-room', label: 'Agent War Room', labelKey: 'nav.war', icon: Bot, key: 'G W' },
      { to: '/people', label: 'People & Talent', labelKey: 'nav.people', icon: Users, key: 'G P' },
      { to: '/portfolio', label: 'Portfolio & P&L', labelKey: 'nav.portfolio', icon: BarChart3, key: 'G P' },
      { to: '/capital', label: 'Capital & Investors', labelKey: 'nav.capital', icon: Landmark, key: 'G V' },
      { to: '/insurance', label: 'Insurance & Risk', labelKey: 'nav.insurance', icon: Umbrella, key: 'G I' },
      { to: '/deals', label: 'Deal Room', labelKey: 'nav.deals', icon: BriefcaseBusiness, key: 'G Z' },
      { to: '/labs', label: 'Innovation Lab', labelKey: 'nav.labs', icon: Sparkles, key: 'G L' },
      { to: '/architecture', label: 'Platform Architecture', labelKey: 'nav.architecture', icon: Layers3, key: 'G A' },
      { to: '/brief', label: 'Executive Brief', labelKey: 'nav.brief', icon: FileText, key: 'G E' },
    ],
  },
];

export const PAGE_META: Record<string, { title: string; crumb: string; titleKey: string }> = {
  '/': { title: 'Command Center', crumb: 'Overview', titleKey: 'nav.command' },
  '/twin': { title: 'Digital Twin', crumb: 'Kai Tak precinct', titleKey: 'nav.twin' },
  '/map': { title: 'Geospatial', crumb: 'Portfolio intelligence', titleKey: 'nav.map' },
  '/mobility': { title: 'Mobility', crumb: 'Smart city movement', titleKey: 'nav.mobility' },
  '/traffic': { title: 'Traffic & Junctions', crumb: 'Adaptive signals', titleKey: 'nav.traffic' },
  '/ev': { title: 'EV Charging', crumb: 'Smart energy & mobility', titleKey: 'nav.ev' },
  '/vehicles': { title: 'Vehicle Studio', crumb: 'Fleet design & configurator', titleKey: 'nav.vehicles' },
  '/resilience': { title: 'Resilience', crumb: 'Emergency operations', titleKey: 'nav.res' },
  '/place': { title: 'Public Realm', crumb: 'Placemaking', titleKey: 'nav.place' },
  '/heritage': { title: 'Heritage & Adaptive Reuse', crumb: 'Conservation & placemaking', titleKey: 'nav.heritage' },
  '/intelligence': { title: 'Intelligence', crumb: 'AI operations', titleKey: 'nav.intelligence' },
  '/data': { title: 'Data & AI Governance', crumb: 'Data mesh & access', titleKey: 'nav.data' },
  '/trust': { title: 'Trust Ledger', crumb: 'Asset provenance', titleKey: 'nav.trust' },
  '/cyber': { title: 'Cyber & OT Security', crumb: 'Threat & response', titleKey: 'nav.cyber' },
  '/agents': { title: 'Agent Operations', crumb: 'COO operating system', titleKey: 'nav.agents' },
  '/war-room': { title: 'Agent War Room', crumb: 'Eight minds, one decision', titleKey: 'nav.war' },
  '/people': { title: 'People & Talent', crumb: 'Organisation & capability', titleKey: 'nav.people' },
  '/portfolio': { title: 'Portfolio & P&L', crumb: 'Executive operations', titleKey: 'nav.portfolio' },
  '/capital': { title: 'Capital & Investors', crumb: 'Capital stack', titleKey: 'nav.capital' },
  '/insurance': { title: 'Insurance & Risk', crumb: 'COO protection', titleKey: 'nav.insurance' },
  '/deals': { title: 'Deal Room', crumb: 'Corporate development', titleKey: 'nav.deals' },
  '/labs': { title: 'Innovation Lab', crumb: 'Venture portfolio', titleKey: 'nav.labs' },
  '/architecture': { title: 'Platform Architecture', crumb: 'Reference design', titleKey: 'nav.architecture' },
  '/construction': { title: 'Construction Twin', crumb: '4D site operations', titleKey: 'nav.construction' },
  '/fleet': { title: 'Fleet & Equipment', crumb: 'Construction plant', titleKey: 'nav.fleet' },
  '/handover': { title: 'Commissioning & Handover', crumb: 'Project close-out', titleKey: 'nav.handover' },
  '/quality': { title: 'Quality & Inspection', crumb: 'Construction assurance', titleKey: 'nav.quality' },
  '/utilities': { title: 'Underground Utilities', crumb: 'Street works & networks', titleKey: 'nav.utilities' },
  '/safety': { title: 'Site Safety', crumb: 'Zero-harm operations', titleKey: 'nav.safety' },
  '/fire': { title: 'Fire & Life Safety', crumb: 'Building resilience', titleKey: 'nav.fire' },
  '/supply': { title: 'Supply Chain', crumb: 'Global procurement', titleKey: 'nav.supply' },
  '/procurement': { title: 'Procurement', crumb: 'Tender pipeline', titleKey: 'nav.procurement' },
  '/contracts': { title: 'Contracts & Claims', crumb: 'Commercial governance', titleKey: 'nav.contracts' },
  '/waste': { title: 'Waste & Circularity', crumb: 'Construction resources', titleKey: 'nav.waste' },
  '/factory': { title: 'Offsite Factory', crumb: 'Prefab & automation', titleKey: 'nav.factory' },
  '/bim': { title: 'BIM Studio', crumb: 'Federated model & clashes', titleKey: 'nav.bim' },
  '/bim-site': { title: 'BIM on Site', crumb: 'Kai Tak construction site', titleKey: 'nav.bimSite' },
  '/bim-workflows': { title: 'BIM Workflows', crumb: 'Toolchain & AI operations', titleKey: 'nav.bimWorkflows' },
  '/design': { title: 'Generative Design', crumb: 'Massing options', titleKey: 'nav.design' },
  '/bim-xr': { title: 'BIM XR', crumb: 'Holographic data centre', titleKey: 'nav.bimxr' },
  '/esg-building': { title: 'ESG Building Twin', crumb: 'Floor-level ESG intelligence', titleKey: 'nav.esgb' },
  '/esg-world': { title: 'ESG World Model', crumb: 'Climate, carbon & value', titleKey: 'nav.esgWorld' },
  '/water': { title: 'Water & Circularity', crumb: 'Utility operations', titleKey: 'nav.water' },
  '/port': { title: 'Port & Logistics', crumb: 'Container terminal', titleKey: 'nav.port' },
  '/dc-ops': { title: 'DC Operations', crumb: 'AI data-centre operations', titleKey: 'nav.dcops' },
  '/plant': { title: 'Plant & BMS', crumb: 'Building services', titleKey: 'nav.plant' },
  '/power': { title: 'Electrical Distribution', crumb: 'Power reliability', titleKey: 'nav.power' },
  '/assets': { title: 'Asset Lifecycle', crumb: 'Estate operations', titleKey: 'nav.assets' },
  '/maintenance': { title: 'Maintenance & Work Orders', crumb: 'Building operations', titleKey: 'nav.maintenance' },
  '/engineering': { title: 'Structural & Civil', crumb: 'Design assurance', titleKey: 'nav.engineering' },
  '/ground': { title: 'Ground Engineering', crumb: 'Geotechnical', titleKey: 'nav.ground' },
  '/facade': { title: 'Facade Lab', crumb: 'Building envelope', titleKey: 'nav.facade' },
  '/seismic': { title: 'Seismic Resilience', crumb: 'Structural dynamics', titleKey: 'nav.seismic' },
  '/acoustics': { title: 'Acoustics & Vibration', crumb: 'Building performance', titleKey: 'nav.acoustics' },
  '/proptech': { title: 'PropTech Stack', crumb: 'Leasing & space', titleKey: 'nav.proptech' },
  '/workplace': { title: 'Workplace', crumb: 'Tenant experience', titleKey: 'nav.workplace' },
  '/esg': { title: 'ESG & Climate', crumb: 'Decarbonisation & assurance', titleKey: 'nav.esg' },
  '/energy': { title: 'Energy & Grid', crumb: 'Microgrid & EcoOps', titleKey: 'nav.energy' },
  '/brief': { title: 'Executive Brief', crumb: 'Candidate perspective', titleKey: 'nav.brief' },
};

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#64f2bc" />
            <stop offset="100%" stopColor="#1fae83" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#logo-g)" />
        <path d="M16 6.4l8.2 4.8v9.6L16 25.6l-8.2-4.8v-9.6z" fill="none" stroke="#03231a" strokeWidth="1.35" opacity="0.55" />
        <path d="M16 10.6l4.3 2.5v5.8L16 21.4l-4.3-2.5v-5.8z" fill="#03231a" opacity="0.9" />
        <circle cx="16" cy="16" r="1.15" fill="#8dffd3" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-[14.5px] font-semibold tracking-[0.24em] text-white">OPHYLLA</div>
          <div className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.28em] text-[var(--dim)]">Ventures OS</div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { insights, now } = useLive();
  const { t } = useI18n();
  const active = insights.filter((i) => !i.dismissed).length;
  const navigate = useNavigate();
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={cn('app-sidebar fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-[var(--line)] bg-[#060b10]/95 backdrop-blur-xl transition-all duration-300', open ? 'open translate-x-0 lg:w-[252px]' : '-translate-x-full lg:w-[72px] lg:translate-x-0')}>
        <div className={cn('flex h-[60px] items-center', open ? 'justify-between px-[18px]' : 'justify-center px-2')}>
          <button onClick={() => { navigate('/'); onClose(); }} className="flex items-center" aria-label="Ophylla home">
            {open ? <Logo /> : <span className="grid h-8 w-8 place-items-center rounded-lg border border-[rgba(83,240,190,.35)] bg-[rgba(83,240,190,.08)] font-display text-[13px] text-[var(--accent)]">O</span>}
          </button>
          {open && <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close navigation"><X size={15} /></button>}
        </div>
        <div className={cn("h-px bg-gradient-to-r from-transparent via-[var(--line-2)] to-transparent", open ? "mx-[18px]" : "mx-3")} />

        <nav className={cn("scroll-area flex-1 pb-4 pt-2", open ? "px-[13px]" : "px-2")} aria-label="Primary">
          {NAV.map((section) => (
            <div key={section.label} className={cn(!open && "lg:mt-2 lg:border-t lg:border-[var(--line)] lg:pt-2 first:mt-0 first:border-t-0 first:pt-0")}>
              <div className={cn("eyebrow nav-label", !open && "lg:hidden")}>{t(section.sectionKey, section.label)}</div>
              {section.items.map(({ to, label, labelKey, icon: Icon, badge, key }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  title={!open ? t(labelKey, label) : undefined}
                  aria-label={t(labelKey, label)}
                  className={({ isActive }) => cn('nav-item group', isActive && 'active', !open && 'lg:justify-center lg:px-0')}
                >
                  <Icon size={15.5} strokeWidth={1.7} className="shrink-0 transition-colors" />
                  <span className={cn("flex-1 truncate", !open && "lg:hidden")}>{t(labelKey, label)}</span>
                  {labelKey === 'nav.intelligence' && active > 0 && open ? (
                    <span className="rounded border border-[rgba(62,224,161,.22)] bg-[rgba(62,224,161,.1)] px-1.5 py-0.5 font-mono text-[8.5px] leading-none text-[var(--accent)]">{active}</span>
                  ) : (
                    <span className={cn("hidden font-mono text-[8px] tracking-wide text-[var(--dim)] opacity-0 transition-opacity group-hover:opacity-100 xl:block", !open && "xl:hidden")}>{key}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}

          <div className={cn("mt-6 rounded-xl border border-[var(--line)] bg-white/[.018] p-3", !open && "lg:hidden")}>
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[8.5px]">{t('shell.twinEngine', 'Twin engine')}</span>
              <LiveTag label={t('top.live', 'Live')} />
            </div>
            <div className="mt-2.5 flex items-end justify-between">
              <div>
                <div className="num text-[19px] leading-none text-white">1,284</div>
                <div className="mt-1 text-[9.5px] text-[var(--dim)]">{t('shell.sensors', 'sensor streams')}</div>
              </div>
              <div className="flex h-7 items-end gap-[2px]">
                {[40, 62, 48, 76, 58, 84, 70, 92, 66, 80].map((h, i) => (
                  <span key={i} className="w-[3px] rounded-sm bg-[var(--accent)]" style={{ height: `${h}%`, opacity: 0.25 + i * 0.07 }} />
                ))}
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-[var(--line)] pt-2 font-mono text-[8.5px] text-[var(--dim)]">
              <span>{t('shell.synced', 'Twin sync 2s')}</span>
              <span className="text-[var(--accent)]">99.98%</span>
            </div>
          </div>

          <button
            onClick={() => { navigate('/brief'); onClose(); }}
            className={cn("mt-2 flex w-full items-center gap-2 rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2.5 text-left transition-colors hover:border-[var(--line-2)] hover:bg-white/[.04]", !open && "lg:hidden")}
          >
            <ShieldCheck size={13} className="text-[var(--accent)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-medium text-[#cfdae4]">{t('shell.cooBrief', 'COO transition brief')}</div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">{t('shell.ready', '90-day plan · ready')}</div>
            </div>
            <ChevronRight size={12} className="text-[var(--dim)]" />
          </button>
        </nav>

        <div className="border-t border-[var(--line)] p-3">
          <div className={cn("flex items-center gap-2.5 rounded-lg px-1 py-1.5", !open && "lg:justify-center lg:px-0")}>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2b4b44] to-[#10231f] font-display text-[11px] text-[#a7f3d4] ring-1 ring-[rgba(62,224,161,.3)]">TL</div>
            <div className={cn("min-w-0 flex-1", !open && "lg:hidden")}>
              <div className="truncate text-[11.5px] font-medium text-[#e6eef5]">T. Lau</div>
              <div className="truncate text-[9px] text-[var(--dim)]">{t('shell.sponsor', 'Executive sponsor · HK')}</div>
            </div>
            <span className={cn("font-mono text-[8px] text-[var(--dim)]", !open && "lg:hidden")}>{hkTime(now)}</span>
          </div>
          <div className={cn("mt-2 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]", !open && "lg:hidden")}>
            <span>{t('shell.demo', 'Demo environment')}</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function NotificationPopover({ onClose }: { onClose: () => void }) {
  const { insights, dismissInsight } = useLive();
  const { t } = useI18n();
  return (
    <div className="absolute right-0 top-[42px] z-50 w-[330px] overflow-hidden rounded-xl border border-[var(--line-2)] bg-[#080e14]/98 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3.5 py-2.5">
        <span className="text-[11px] font-medium text-white">{t('top.alerts', 'Executive alerts')}</span>
        <span className="font-mono text-[8.5px] text-[var(--dim)]">{insights.filter((i) => !i.dismissed).length} OPEN</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {insights.filter((i) => !i.dismissed).slice(0, 4).map((i) => (
          <div key={i.id} className="group border-b border-[var(--line)] px-3.5 py-3 last:border-0 hover:bg-white/[.025]">
            <div className="flex items-center gap-2">
              <span className={cn('h-1.5 w-1.5 rounded-full', i.severity === 'critical' ? 'bg-[var(--rose)]' : i.severity === 'warning' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]')} />
              <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">{i.severity}</span>
              <span className="ml-auto font-mono text-[8px] text-[var(--dim)]">{i.confidence}%</span>
            </div>
            <div className="mt-1 pr-4 text-[10.5px] leading-snug text-[#c7d4df]">{i.title}</div>
            <button onClick={() => dismissInsight(i.id)} className="mt-1 text-[9px] text-[var(--dim)] opacity-0 transition-opacity hover:text-[var(--accent)] group-hover:opacity-100">Dismiss</button>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full border-t border-[var(--line)] py-2 text-[10px] text-[var(--muted)] hover:text-white">Close</button>
    </div>
  );
}

function Topbar({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { now, setPaletteOpen, setFocusMode, insights, toast } = useLive();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? PAGE_META['/'];
  const title = t(meta.titleKey, meta.title);
  const [bellOpen, setBellOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const unread = insights.filter((i) => !i.dismissed).length;

  useEffect(() => {
    document.title = `${title} · Ophylla Ventures OS`;
  }, [title]);

  return (
    <header className="app-topbar sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-[var(--line)] bg-[#05090d]/80 px-4 backdrop-blur-xl md:px-6">
      <button className="btn btn-ghost btn-icon" onClick={onMenu} aria-label={menuOpen ? t('top.menu', 'Collapse navigation') : t('top.menu', 'Open navigation')} aria-expanded={menuOpen}><Menu size={17} /></button>
      <div className="flex min-w-0 items-center gap-2 text-[11px]">
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--dim)] sm:inline">Ophylla</span>
        <ChevronRight size={11} className="hidden text-[var(--dim)] sm:inline" />
        <span className="truncate text-[11.5px] font-medium text-[#dbe5ee]">{title}</span>
        <span className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/[.025] px-2 py-0.5 md:inline-flex">
          <span className="live-dot" />
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--muted)]">{t('top.live', 'Live')}</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="search-trigger hidden w-[200px] justify-between md:flex xl:w-[250px]"
          aria-label={t('top.search', 'Search platform')}
        >
          <span className="flex items-center gap-2"><Search size={13} className="text-[var(--dim)]" /> {t('top.search', 'Search platform')}</span>
          <span className="kbd">⌘K</span>
        </button>
        <button onClick={() => setPaletteOpen(true)} className="btn btn-ghost btn-icon search-icon-btn topbar-search-mobile md:hidden" aria-label={t('top.search', 'Search')}><Search size={16} /></button>

        <div className="relative">
          <button
            onClick={() => { setLangOpen((v) => !v); setBellOpen(false); }}
            className="btn btn-ghost h-8 gap-1 px-2 topbar-pref relative"
            aria-label={t('top.language', 'Language')}
            title={t('top.language', 'Language')}
            aria-expanded={langOpen}
          >
            <Globe2 size={15} />
            <span className="hidden font-mono text-[8px] tracking-wide text-[var(--muted)] sm:inline">{LOCALES.find((l) => l.id === locale)?.short}</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="pref-popover absolute right-0 top-[40px] z-50 w-[182px] overflow-hidden rounded-xl border border-[var(--line-2)] bg-[#080e14]/98 p-1.5 shadow-2xl backdrop-blur-xl">
                <div className="eyebrow px-2 pb-1.5 pt-1">{t('top.language', 'Language')}</div>
                {LOCALES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setLocale(item.id as Locale); setLangOpen(false); }}
                    className={cn('flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] transition-colors', locale === item.id ? 'bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-white/[.045] hover:text-white')}
                  >
                    <span>{item.native}</span>
                    <span className="font-mono text-[8px] text-[var(--dim)]">{item.short}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon topbar-pref"
          aria-label={theme === 'dark' ? t('top.themeLight', 'Switch to light theme') : t('top.themeDark', 'Switch to dark theme')}
          title={theme === 'dark' ? t('top.themeLight', 'Switch to light theme') : t('top.themeDark', 'Switch to dark theme')}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="mx-1 hidden flex-col items-end leading-none xl:flex">
          <span className="mono-num text-[11px] text-[#dbe5ee]">{hkTime(now, true)} <span className="text-[8px] text-[var(--dim)]">HKT</span></span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-[var(--dim)]">{hkDate(now)}</span>
        </div>

        <button
          className="btn btn-ghost btn-icon topbar-focus hidden sm:inline-flex"
          onClick={() => { setFocusMode(true); toast('Focus mode on', 'Sidebar and chrome hidden. Press Esc or use the exit control to return.', 'info'); }}
          aria-label={t('top.focus', 'Focus mode')}
          title={t('top.focus', 'Focus mode')}
        >
          <Maximize2 size={14} />
        </button>

        <div className="relative">
          <button
            className="btn btn-ghost btn-icon relative"
            onClick={() => { setBellOpen((v) => !v); setLangOpen(false); }}
            aria-label={t('top.alerts', 'Executive alerts')}
            title={t('top.alerts', 'Executive alerts')}
          >
            <Bell size={15} />
            {unread > 0 && <span className="absolute right-[6px] top-[5px] h-1.5 w-1.5 rounded-full bg-[var(--rose)] ring-2 ring-[var(--bg)]" />}
          </button>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
              <div className="relative">
                <NotificationPopover onClose={() => setBellOpen(false)} />
              </div>
            </>
          )}
        </div>

        <div className="ml-0.5 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#2b4b44] to-[#10231f] font-display text-[10px] text-[#a7f3d4] ring-1 ring-[rgba(62,224,161,.25)]">TL</div>
      </div>
    </header>
  );
}

interface PaletteItem {
  label: string;
  hint?: string;
  icon: ReactNode;
  group: string;
  run: () => void;
}

function CommandPalette() {
  const { paletteOpen, setPaletteOpen, runScan, setFocusMode, toast } = useLive();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paletteOpen) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [paletteOpen]);

  const items = useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = [
      ...NAV.flatMap((s) => s.items.map((i) => ({
        label: t(i.labelKey, i.label), hint: t(s.sectionKey, s.label), icon: <i.icon size={14} />, group: 'Navigate',
        run: () => navigate(i.to),
      }))),
      {
        label: t('common.runScan', 'Run city scan'), hint: 'AI operations', icon: <Zap size={14} />, group: 'Actions',
        run: () => { navigate('/'); runScan(); },
      },
      {
        label: 'Anchor trust snapshot', hint: 'Trust ledger', icon: <Link2 size={14} />, group: 'Actions',
        run: () => { navigate('/trust?anchor=1'); },
      },
      {
        label: 'Enter focus mode', hint: 'Presentation', icon: <Maximize2 size={14} />, group: 'Actions',
        run: () => setFocusMode(true),
      },
      {
        label: 'Download board pack', hint: 'Executive', icon: <FileText size={14} />, group: 'Actions',
        run: () => toast('Board pack generated', 'October executive pack queued for secure download.', 'success'),
      },
    ];
    const q = query.trim().toLowerCase();
    return q ? nav.filter((i) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(q)) : nav;
  }, [query, navigate, runScan, setFocusMode, toast, t]);

  useEffect(() => {
    if (index >= items.length) setIndex(Math.max(0, items.length - 1));
  }, [items.length, index]);

  if (!paletteOpen) return null;

  const exec = (item?: PaletteItem) => {
    if (!item) return;
    setPaletteOpen(false);
    setTimeout(() => item.run(), 60);
  };

  const grouped = items.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="overlay flex items-start justify-center pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && setPaletteOpen(false)}>
      <div className="w-[min(620px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[var(--line-2)] bg-[#080e14]/98 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Command size={15} className="text-[var(--dim)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(items.length - 1, i + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)); }
              if (e.key === 'Enter') { e.preventDefault(); exec(items[index]); }
            }}
            placeholder={t('top.search', 'Search assets, modules, actions…')}
            className="h-[52px] flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[var(--dim)]"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="max-h-[380px] overflow-y-auto px-2 py-2">
          {items.length === 0 && <div className="px-3 py-8 text-center text-[11px] text-[var(--dim)]">No results for “{query}”.</div>}
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group} className="mb-1">
              <div className="eyebrow px-3 pb-1 pt-2">{group}</div>
              {list.map((item) => {
                const globalIndex = items.indexOf(item);
                return (
                  <button
                    key={`${item.group}-${item.label}`}
                    onMouseEnter={() => setIndex(globalIndex)}
                    onClick={() => exec(item)}
                    className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors', globalIndex === index ? 'bg-white/[.06]' : 'hover:bg-white/[.03]')}
                  >
                    <span className={cn('grid h-6 w-6 place-items-center rounded-md border', globalIndex === index ? 'border-[rgba(62,224,161,.3)] bg-[rgba(62,224,161,.1)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--muted)]')}>{item.icon}</span>
                    <span className="flex-1 text-[12px] text-[#dbe5ee]">{item.label}</span>
                    <span className="font-mono text-[8.5px] uppercase tracking-wider text-[var(--dim)]">{item.hint}</span>
                    {globalIndex === index && <ArrowRight size={12} className="text-[var(--accent)]" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2 text-[9px] text-[var(--dim)]">
          <span className="flex items-center gap-3">
            <span><span className="kbd mr-1">↑</span><span className="kbd mr-1">↓</span> navigate</span>
            <span><span className="kbd mr-1">↵</span> open</span>
          </span>
          <span className="font-mono uppercase tracking-wider">Ophylla Ventures OS</span>
        </div>
      </div>
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useLive();
  const tone = {
    success: { color: 'var(--accent)', icon: <CheckCircle2 size={14} /> },
    info: { color: 'var(--cyan)', icon: <Info size={14} /> },
    warning: { color: 'var(--amber)', icon: <AlertTriangle size={14} /> },
    error: { color: 'var(--rose)', icon: <AlertTriangle size={14} /> },
  };
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(330px,calc(100vw-32px))] flex-col gap-2">
      {toasts.map((t) => {
        const conf = tone[t.tone];
        return (
          <div key={t.id} className="pointer-events-auto slide-up flex items-start gap-2.5 rounded-xl border border-[var(--line-2)] bg-[#080e14]/97 p-3 shadow-2xl backdrop-blur-xl">
            <span className="mt-0.5" style={{ color: conf.color }}>{conf.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-white">{t.title}</div>
              {t.message && <div className="mt-0.5 text-[10px] leading-snug text-[var(--muted)]">{t.message}</div>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-[var(--dim)] hover:text-white" aria-label="Dismiss"><X size={12} /></button>
          </div>
        );
      })}
    </div>
  );
}

function FocusExit() {
  const { focusMode, setFocusMode } = useLive();
  if (!focusMode) return null;
  return (
    <button
      onClick={() => setFocusMode(false)}
      className="fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-lg border border-[var(--line-2)] bg-[#070d12]/90 px-3 py-2 text-[10.5px] text-[var(--muted)] shadow-xl backdrop-blur transition-colors hover:text-white no-print"
    >
      <Minimize2 size={13} /> Exit focus mode <span className="kbd">ESC</span>
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { focusMode, setFocusMode, now, sensors } = useLive();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!focusMode) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocusMode(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusMode, setFocusMode]);

  return (
    <div className={cn('app-bg relative min-h-screen', focusMode && 'focus-mode')}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={cn('app-main ml-0 flex min-h-screen flex-col transition-[margin] duration-300 lg:ml-[72px]', menuOpen && 'lg:ml-[252px]')}>
        <Topbar onMenu={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />
        <main className="relative z-10 flex-1 px-4 pb-6 pt-6 md:px-6 lg:px-8">{children}</main>
        <footer className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-[var(--line)] px-4 py-3 font-mono text-[8.5px] uppercase tracking-[0.1em] text-[var(--dim)] md:px-6 lg:px-8">
          <span>{COMPANY.name} · {COMPANY.location}</span>
          <span className="hidden items-center gap-4 md:flex">
            <span className="flex items-center gap-1.5"><CircleDot size={8} className="text-[var(--accent)]" /> Twin sync 2s</span>
            <span>{sensors} sensors</span>
            <span>Ledger height 18,212</span>
            <span>{hkDate(now)} {hkTime(now)} HKT</span>
          </span>
          <span className="normal-case tracking-normal">Illustrative demo · not actual client data</span>
        </footer>
      </div>
      <CommandPalette />
      <Toasts />
      <FocusExit />
    </div>
  );
}
