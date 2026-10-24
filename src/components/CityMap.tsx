import { useEffect, useMemo, useRef, useState } from 'react';
import { ASSETS, DISTRICTS, districtById } from '../lib/data';
import { cn, mulberry32 } from '../lib/utils';
import { Maximize2, Minus, Plus } from 'lucide-react';

export interface MapLayers {
  assets: boolean;
  choropleth: boolean;
  sensors: boolean;
  transit: boolean;
  flood: boolean;
  labels: boolean;
}

export const DEFAULT_MAP_LAYERS: MapLayers = {
  assets: true, choropleth: true, sensors: true, transit: true, flood: false, labels: true,
};

interface CityMapProps {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  layers?: MapLayers;
  metric?: 'energy' | 'occupancy' | 'carbon';
  className?: string;
  compact?: boolean;
  showControls?: boolean;
}

const LAND = 'M0,0 H1400 V720 L1360,736 L1240,700 L1150,742 L1040,700 L960,726 L860,688 L760,706 L690,670 L600,696 L520,660 L440,678 L360,652 L260,670 L160,642 L80,662 L0,628 Z';
const COAST = 'M0,628 L80,662 L160,642 L260,670 L360,652 L440,678 L520,660 L600,696 L690,670 L760,706 L860,688 L960,726 L1040,700 L1150,742 L1240,700 L1360,736 L1400,720';

const ROADS = [
  'M40,300 H1200',
  'M60,470 H1330',
  'M430,100 V615',
  'M790,70 V640',
  'M1120,140 V610',
  'M200,120 C300,200 380,265 470,300',
  'M100,635 C330,605 610,655 900,635 S1260,660 1390,615',
  'M900,250 C980,330 1060,380 1160,420',
  'M180,520 C300,500 380,480 500,470',
];
const SECONDARY_ROADS = [
  'M560,210 C620,280 690,300 790,300',
  'M930,520 C1010,470 1080,450 1160,460',
  'M330,240 C360,300 380,340 380,400',
  'M1050,140 C1060,220 1080,300 1120,360',
  'M700,470 C740,500 800,520 860,520',
  'M1200,250 C1240,300 1280,320 1330,330',
  'M300,560 C340,570 400,560 450,555',
];

const STATUS_COLOR: Record<string, string> = {
  operational: '#3ee0a1',
  commissioning: '#45c4f5',
  construction: '#f5b748',
};

function mixHex(a: string, b: string, t: number) {
  const pa = a.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const pb = b.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const p = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${p.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function heatColor(value: number, min = 60, max = 115) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  if (t < 0.5) return mixHex('3ee0a1', 'f5b748', t * 2);
  return mixHex('f5b748', 'fb7185', (t - 0.5) * 2);
}

export function CityMap({
  selectedId = null, onSelect, layers = DEFAULT_MAP_LAYERS, metric = 'energy', className, compact = false, showControls = true,
}: CityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const blocks = useMemo(() => {
    const rand = mulberry32(8841);
    const list: Array<{ x: number; y: number; w: number; h: number; o: number; c: number }> = [];
    for (let y = 40; y < 690; y += 29) {
      for (let x = 26; x < 1380; x += 29) {
        if (rand() < 0.24) continue;
        if (x > 800 && x < 930 && y > 320 && y < 490) continue;
        list.push({
          x: x + rand() * 3,
          y: y + rand() * 3,
          w: 16 + rand() * 8,
          h: 12 + rand() * 8,
          o: 0.28 + rand() * 0.5,
          c: rand(),
        });
      }
    }
    return list;
  }, []);

  const sensors = useMemo(() => {
    const rand = mulberry32(4412);
    const points = Array.from({ length: compact ? 26 : 52 }, () => ({
      x: 100 + rand() * 1180,
      y: 100 + rand() * 500,
    }));
    return points;
  }, [compact]);

  const districtMetric = (id: string) => {
    const d = DISTRICTS.find((x) => x.id === id)!;
    if (metric === 'occupancy') {
      return id === 'NM' ? 54 : id === 'CH' ? 92.6 : id === 'KT' ? 87.2 : id === 'KE' ? 90.1 : id === 'WK' ? 88.4 : 91.8;
    }
    if (metric === 'carbon') return d.carbon;
    return d.energyIntensity;
  };

  const metricRange: [number, number] = metric === 'carbon' ? [18, 48] : metric === 'occupancy' ? [50, 96] : [65, 110];

  const zoomTo = (next: number, cx = 700, cy = 450) => {
    setView((v) => {
      const k = Math.min(4, Math.max(1, next));
      const scale = k / v.k;
      const x = cx - (cx - v.x) * scale;
      const y = cy - (cy - v.y) * scale;
      return { x, y, k };
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || compact) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * 1400;
      const cy = ((e.clientY - rect.top) / rect.height) * 900;
      zoomTo(view.k * (e.deltaY < 0 ? 1.15 : 0.87), cx, cy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [compact, view.k]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (compact) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 1400;
    const my = ((e.clientY - rect.top) / rect.height) * 900;
    if (hover && (Math.abs(mx - hover.x) > 8 || Math.abs(my - hover.y) > 8)) {
      // Keep tooltip anchored while the pointer stays on the marker.
    }
    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      if (drag.current.moved) {
        setView((v) => ({ ...v, x: drag.current!.vx + (dx / rect.width) * 1400, y: drag.current!.vy + (dy / rect.height) * 900 }));
      }
    }
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const reset = () => setView({ x: 0, y: 0, k: 1 });
  const dim = compact ? 0.85 : 1;

  return (
    <div ref={containerRef} className={cn('relative h-full w-full overflow-hidden rounded-[15px] map-shell', className)}>
      <svg
        viewBox="0 0 1400 900"
        className="h-full w-full touch-none select-none"
        style={{ cursor: dragging ? 'grabbing' : compact ? 'default' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => { endDrag(); setHover(null); }}
      >
        <defs>
          <linearGradient id="map-water" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#07161f" />
            <stop offset="60%" stopColor="#051018" />
            <stop offset="100%" stopColor="#030a0f" />
          </linearGradient>
          <linearGradient id="map-land" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#0b151c" />
            <stop offset="100%" stopColor="#081016" />
          </linearGradient>
          <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3ee0a1" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#3ee0a1" stopOpacity="0" />
          </radialGradient>
          <pattern id="map-hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#45c4f5" strokeWidth="1" opacity="0.45" />
          </pattern>
          <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" fill="none" stroke="rgba(120,200,210,.045)" strokeWidth="1" />
          </pattern>
          <filter id="glow-soft" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="map-land-clip"><path d={LAND} /></clipPath>
        </defs>

        <rect width="1400" height="900" fill="#04090e" />
        <rect width="1400" height="900" fill="url(#map-water)" />
        {/* water texture */}
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1={80 + (i % 3) * 90} x2={1390} y1={770 + i * 9} y2={770 + i * 9} stroke="rgba(90,170,190,.06)" strokeWidth="1" />
        ))}
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} opacity={dim}>
          <path d={LAND} fill="url(#map-land)" stroke="rgba(80,180,190,.24)" strokeWidth="1.4" />
          <path d={LAND} fill="url(#map-grid)" />
          <g clipPath="url(#map-land-clip)">
            {layers.choropleth && DISTRICTS.map((d) => (
              <path
                key={d.id}
                d={d.polygon}
                fill={heatColor(districtMetric(d.id), metricRange[0], metricRange[1])}
                fillOpacity={0.11}
                stroke={heatColor(districtMetric(d.id), metricRange[0], metricRange[1])}
                strokeOpacity={0.32}
                strokeWidth={1}
                strokeDasharray="3 4"
              />
            ))}
            <g opacity={0.9}>
              {blocks.map((b, i) => (
                <rect
                  key={i}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={1.4}
                  fill={b.c > 0.965 ? '#1d4048' : b.c > 0.86 ? '#142a32' : '#0f1e26'}
                  opacity={b.o}
                />
              ))}
            </g>
            {/* Park */}
            <path d="M812,330 L906,320 L945,405 L900,480 L820,460 L780,385 Z" fill="#0c2a25" opacity="0.85" stroke="rgba(62,224,161,.18)" />
            <path d="M812,330 L906,320 L945,405 L900,480 L820,460 L780,385 Z" fill="url(#map-grid)" />
            {/* roads */}
            <g fill="none" strokeLinecap="round">
              {ROADS.map((d, i) => (
                <g key={i}>
                  <path d={d} stroke="#03080c" strokeWidth={compact ? 13 : 16} opacity="0.9" />
                  <path d={d} stroke="rgba(150,210,220,.09)" strokeWidth={compact ? 0.6 : 1.1} />
                </g>
              ))}
              {!compact && SECONDARY_ROADS.map((d, i) => (
                <path key={i} d={d} stroke="#050d12" strokeWidth={5} strokeDasharray="1 0" opacity="0.75" />
              ))}
            </g>
          </g>

          {/* Flood zones */}
          {layers.flood && (
            <g clipPath="url(#map-land-clip)">
              <path d="M0,628 L80,662 L160,642 L260,670 L360,652 L440,678 L520,660 L600,696 L500,760 L0,800 Z" fill="url(#map-hatch)" opacity="0.5" />
              <path d="M600,696 L690,670 L760,706 L860,688 L960,726 L1040,700 L1150,742 L1000,840 L700,830 Z" fill="url(#map-hatch)" opacity="0.38" />
              <path d="M1150,742 L1240,700 L1360,736 L1400,720 V900 H1100 Z" fill="url(#map-hatch)" opacity="0.42" />
              <path d="M0,628 L80,662 L160,642 L260,670 L360,652 L440,678 L520,660 L600,696 L500,760 L0,800 Z" fill="none" stroke="rgba(69,196,245,.5)" strokeWidth="1.2" strokeDasharray="4 5" />
            </g>
          )}

          {/* Transit */}
          {layers.transit && !compact && (
            <g fill="none">
              <path d="M260,515 C420,455 560,470 700,420 S930,330 1070,300 S1210,250 1300,190" stroke="#45c4f5" strokeWidth="2.4" opacity="0.5" strokeDasharray="9 5" />
              <path d="M420,600 C520,540 610,500 700,470 S900,420 1010,450" stroke="#a78bfa" strokeWidth="1.8" opacity="0.4" strokeDasharray="7 6" />
              {[
                [340, 490], [520, 466], [700, 420], [860, 360], [1010, 315], [1160, 265],
                [520, 552], [700, 470], [860, 430], [1010, 450],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="4.2" fill="#071018" stroke={i < 6 ? '#45c4f5' : '#a78bfa'} strokeWidth="1.6" />
                  <circle cx={x} cy={y} r="1.4" fill={i < 6 ? '#45c4f5' : '#a78bfa'} />
                </g>
              ))}
            </g>
          )}

          {/* Sensor network */}
          {layers.sensors && (
            <g>
              {sensors.slice(0, compact ? 12 : 30).map((p, i) => {
                const target = sensors[(i + 3) % sensors.length];
                if (Math.hypot(target.x - p.x, target.y - p.y) > 190) return null;
                return <line key={`l${i}`} x1={p.x} y1={p.y} x2={target.x} y2={target.y} stroke="rgba(69,196,245,.12)" strokeWidth="0.8" />;
              })}
              {sensors.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={i % 7 === 0 ? 3 : 2} fill="#45c4f5" opacity={0.55} />
                  {i % 7 === 0 && <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="rgba(69,196,245,.22)" strokeWidth="0.9" />}
                </g>
              ))}
            </g>
          )}

          {/* Assets */}
          {layers.assets && ASSETS.map((asset) => {
            const d = districtById(asset.district)!;
            const isSelected = selectedId === asset.id;
            const r = compact ? 4 : 3.7 + Math.sqrt(asset.gfa / 1000) * 0.18;
            const color = STATUS_COLOR[asset.status];
            return (
              <g
                key={asset.id}
                className="map-asset"
                onPointerEnter={(e) => {
                  if (compact) return;
                  const rect = containerRef.current!.getBoundingClientRect();
                  setHover({ id: asset.id, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onPointerLeave={() => setHover(null)}
                onClick={(e) => { e.stopPropagation(); if (!drag.current?.moved) onSelect?.(asset.id); }}
              >
                {isSelected && (
                  <>
                    <circle cx={asset.x} cy={asset.y} r={r + 12} fill="none" stroke="#3ee0a1" strokeWidth="1" opacity="0.85">
                      <animate attributeName="r" values={`${r + 6};${r + 16};${r + 6}`} dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.15;0.8" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={asset.x} cy={asset.y} r={r + 6} fill="#3ee0a1" opacity="0.08" />
                  </>
                )}
                <circle cx={asset.x} cy={asset.y} r={r + 3.2} fill={color} opacity="0.12" />
                <circle cx={asset.x} cy={asset.y} r={r} fill="#061016" stroke={color} strokeWidth={isSelected ? 2.2 : 1.4} />
                <circle cx={asset.x} cy={asset.y} r={Math.max(1.4, r - 2.6)} fill={color} opacity={asset.status === 'construction' ? 0.5 : 0.95} />
                {!compact && isSelected && (
                  <g>
                    <line x1={asset.x} y1={asset.y - r - 4} x2={asset.x} y2={asset.y - r - 14} stroke="#3ee0a1" strokeWidth="1" />
                    <text x={asset.x} y={asset.y - r - 19} textAnchor="middle" fill="#d9fff0" fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight="500">{asset.name}</text>
                    <text x={asset.x} y={asset.y - r - 7} textAnchor="middle" fill="rgba(62,224,161,.85)" fontSize="7.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5">{asset.district} · {asset.energy} kWh/m²</text>
                  </g>
                )}
                {compact && isSelected && <circle cx={asset.x} cy={asset.y} r={r + 9} fill="none" stroke="#3ee0a1" strokeWidth="1" />}
              </g>
            );
          })}

          {/* District labels */}
          {layers.labels && DISTRICTS.map((d) => (
            <g key={d.id} opacity={0.85}>
              <text
                x={d.labelX} y={d.labelY} textAnchor="middle"
                fill={selectedId && ASSETS.find((a) => a.id === selectedId)?.district === d.id ? '#eafff6' : 'rgba(190,215,224,.5)'}
                fontSize={compact ? 15 : 12.5}
                fontFamily="JetBrains Mono, monospace"
                letterSpacing={compact ? 3 : 2.4}
                style={{ pointerEvents: 'none' }}
              >
                {compact ? d.short : d.short.toUpperCase()}
              </text>
              {!compact && (
                <text x={d.labelX} y={d.labelY + 15} textAnchor="middle" fill="rgba(140,170,180,.35)" fontSize="8.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1" style={{ pointerEvents: 'none' }}>
                  {d.assets} assets · {d.energyIntensity} kWh/m²
                </text>
              )}
            </g>
          ))}

          {/* Selected focus glow */}
          {selectedId && (() => {
            const a = ASSETS.find((x) => x.id === selectedId);
            if (!a) return null;
            return <circle cx={a.x} cy={a.y} r="60" fill="url(#map-glow)" style={{ pointerEvents: 'none' }} />;
          })()}

          {/* Compass + scale */}
          {!compact && (
            <g opacity="0.5" style={{ pointerEvents: 'none' }}>
              <text x="1320" y="120" textAnchor="middle" fill="rgba(200,225,230,.6)" fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="2">N</text>
              <path d="M1320,128 L1320,168 M1320,128 L1314,140 M1320,128 L1326,140" stroke="rgba(200,225,230,.55)" strokeWidth="1" fill="none" />
              <line x1="1180" y1="850" x2="1280" y2="850" stroke="rgba(200,225,230,.4)" strokeWidth="1" />
              <line x1="1180" y1="845" x2="1180" y2="855" stroke="rgba(200,225,230,.4)" strokeWidth="1" />
              <line x1="1280" y1="845" x2="1280" y2="855" stroke="rgba(200,225,230,.4)" strokeWidth="1" />
              <text x="1230" y="842" textAnchor="middle" fill="rgba(200,225,230,.45)" fontSize="8" fontFamily="JetBrains Mono, monospace">2 km</text>
            </g>
          )}
        </g>

        {/* Water labels */}
        <text x="720" y="838" textAnchor="middle" fill="rgba(90,160,180,.28)" fontSize="12" fontFamily="JetBrains Mono, monospace" letterSpacing="6" style={{ pointerEvents: 'none' }}>VICTORIA HARBOUR</text>
      </svg>

      {hover && !compact && (() => {
        const asset = ASSETS.find((a) => a.id === hover.id)!;
        const d = districtById(asset.district)!;
        return (
          <div
            className="pointer-events-none absolute z-20 w-[210px] rounded-lg border border-[var(--line-2)] bg-[#070d12]/95 p-3 shadow-2xl backdrop-blur"
            style={{ left: Math.min(hover.x + 14, (containerRef.current?.clientWidth ?? 400) - 224), top: Math.max(10, hover.y - 20) }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[8.5px] uppercase tracking-wider text-[var(--dim)]">{asset.id} · {d.short}</span>
              <span className="font-mono text-[8.5px]" style={{ color: STATUS_COLOR[asset.status] }}>● {asset.status}</span>
            </div>
            <div className="mt-1 text-[11.5px] font-medium leading-snug text-white">{asset.name}</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-[var(--line)] pt-2">
              <div><div className="text-[8.5px] text-[var(--dim)]">Energy</div><div className="font-mono text-[10px] text-[#dbe5ee]">{asset.energy} kWh/m²</div></div>
              <div><div className="text-[8.5px] text-[var(--dim)]">Occupancy</div><div className="font-mono text-[10px] text-[#dbe5ee]">{asset.occupancy}%</div></div>
              <div><div className="text-[8.5px] text-[var(--dim)]">GFA</div><div className="font-mono text-[10px] text-[#dbe5ee]">{(asset.gfa / 1000).toFixed(0)}k ft²</div></div>
              <div><div className="text-[8.5px] text-[var(--dim)]">Sensors</div><div className="font-mono text-[10px] text-[#dbe5ee]">{asset.sensors}</div></div>
            </div>
            <div className="mt-2 text-[9px] text-[var(--accent)]">Open in digital twin →</div>
          </div>
        );
      })()}

      {showControls && !compact && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[#070d12]/85 p-1 backdrop-blur">
          <button onClick={() => zoomTo(view.k * 1.3)} aria-label="Zoom in" className="btn btn-ghost btn-icon btn-sm"><Plus size={13} /></button>
          <span className="w-9 text-center font-mono text-[9px] text-[var(--dim)]">{view.k.toFixed(1)}×</span>
          <button onClick={() => zoomTo(view.k * 0.77)} aria-label="Zoom out" className="btn btn-ghost btn-icon btn-sm"><Minus size={13} /></button>
          <div className="mx-0.5 h-4 w-px bg-[var(--line)]" />
          <button onClick={reset} aria-label="Reset view" className="btn btn-ghost btn-icon btn-sm"><Maximize2 size={12} /></button>
        </div>
      )}

      {!compact && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-[var(--line)] bg-[#070d12]/80 px-2 py-1 font-mono text-[8.5px] text-[var(--dim)] backdrop-blur">
          22.31°N 114.17°E · WGS84 · 1:2000
        </div>
      )}
    </div>
  );
}
