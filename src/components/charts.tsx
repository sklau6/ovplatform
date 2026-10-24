import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    obs.observe(el);
    setWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);
  return { ref, width };
}

export function Sparkline({ data, width = 120, height = 36, color = '#3ee0a1', fill = true, strokeWidth = 1.4 }: {
  data: number[]; width?: number; height?: number; color?: string; fill?: boolean; strokeWidth?: number;
}) {
  const id = useId().replace(/:/g, '');
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 3;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sg-${id})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface ChartSeries {
  name: string;
  color: string;
  data: number[];
  dashed?: boolean;
  fill?: boolean;
}

function smoothPath(points: Array<[number, number]>) {
  if (points.length < 2) return '';
  const line = (a: [number, number], b: [number, number]) => `L${b[0].toFixed(2)},${b[1].toFixed(2)}`;
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const t = 0.16;
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
  // eslint-disable-next-line no-unreachable
  void line;
}

export function AreaChart({
  series, height = 230, labels, yFormat = (n: number) => `${Math.round(n)}`, xTicks = 6, className,
  showLegend = false, yDomain, suffix = '', loading = false,
}: {
  series: ChartSeries[];
  height?: number;
  labels?: string[];
  yFormat?: (n: number) => string;
  xTicks?: number;
  className?: string;
  showLegend?: boolean;
  yDomain?: [number, number];
  suffix?: string;
  loading?: boolean;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, '');
  const pad = { l: 40, r: 12, t: 14, b: 24 };
  const w = Math.max(220, width);
  const innerW = w - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const all = series.flatMap((s) => s.data);
  const minRaw = yDomain ? yDomain[0] : Math.min(...all);
  const maxRaw = yDomain ? yDomain[1] : Math.max(...all);
  const range = maxRaw - minRaw || 1;
  const min = yDomain ? minRaw : minRaw - range * 0.12;
  const max = yDomain ? maxRaw : maxRaw + range * 0.14;
  const n = Math.max(...series.map((s) => s.data.length));
  const xAt = (i: number) => pad.l + (i / Math.max(1, n - 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH - ((v - min) / (max - min)) * innerH;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => min + ((max - min) / ticks) * i);
  const xLabelEvery = Math.max(1, Math.floor(n / xTicks));

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = (x - pad.l) / innerW;
    const idx = Math.round(ratio * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, idx)));
  };

  return (
    <div className={cn('relative', className)} ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg width={w} height={height} className="block overflow-visible">
        <defs>
          {series.map((s, si) => (
            <linearGradient key={s.name} id={`ac-${id}-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.26" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        <g className="chart-grid">
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={yAt(t)} y2={yAt(t)} strokeDasharray={i === 0 ? '0' : '2 4'} />
            </g>
          ))}
        </g>
        {yTicks.map((t, i) => (
          <text key={i} x={pad.l - 9} y={yAt(t) + 3} textAnchor="end" className="chart-label">{yFormat(t)}</text>
        ))}
        {labels && labels.map((label, i) => (
          i % xLabelEvery === 0 || i === n - 1 ? (
            <text key={i} x={xAt(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="chart-label">{label}</text>
          ) : null
        ))}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => [xAt(i), yAt(v)] as [number, number]);
          const line = smoothPath(pts);
          return (
            <g key={s.name}>
              {s.fill !== false && !s.dashed && (
                <path d={`${line} L${xAt(s.data.length - 1)},${pad.t + innerH} L${xAt(0)},${pad.t + innerH} Z`} fill={`url(#ac-${id}-${si})`} />
              )}
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth={s.dashed ? 1.2 : 1.7}
                strokeDasharray={s.dashed ? '3 4' : undefined}
                strokeLinecap="round"
                opacity={s.dashed ? 0.6 : 1}
                style={{ filter: !s.dashed ? `drop-shadow(0 0 6px ${s.color}44)` : undefined }}
              />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + innerH} stroke="rgba(255,255,255,.18)" strokeDasharray="2 3" />
            {series.map((s) => (
              s.data[hover] !== undefined ? (
                <g key={s.name}>
                  <circle cx={xAt(hover)} cy={yAt(s.data[hover])} r="4" fill="#070c11" stroke={s.color} strokeWidth="1.6" />
                </g>
              ) : null
            ))}
          </g>
        )}
        {loading && <rect x={pad.l} y={pad.t} width={innerW} height={innerH} fill="rgba(5,8,11,.55)" />}
      </svg>
      {hover !== null && (
        <div
          className="chart-tip"
          style={{
            left: Math.min(Math.max(xAt(hover) + 14, 10), w - 160),
            top: pad.t + 4,
          }}
        >
          {labels?.[hover] && <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--dim)]">{labels[hover]}</div>}
          {series.map((s) => (
            s.data[hover] !== undefined ? (
              <div key={s.name} className="flex items-center justify-between gap-4 py-0.5">
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                  <i className="legend-dot" style={{ background: s.color }} />{s.name}
                </span>
                <span className="font-mono text-[10.5px] text-white">{yFormat(s.data[hover])}{suffix}</span>
              </div>
            ) : null
          ))}
        </div>
      )}
      {showLegend && (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
              <i className="legend-dot" style={{ background: s.color }} />{s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({ segments, size = 132, thickness = 9, center, className, track = 'rgba(255,255,255,.055)' }: {
  segments: Array<{ label: string; value: number; color: string }>; size?: number; thickness?: number;
  center?: ReactNode; className?: string; track?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={thickness} />
        {segments.map((seg) => {
          const len = (seg.value / total) * c;
          const el = (
            <circle
              key={seg.label}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={seg.color} strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${seg.color}55)` }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>}
    </div>
  );
}

export function MiniBars({ data, color = '#45c4f5', height = 44, labels, highlight }: {
  data: number[]; color?: string; height?: number; labels?: string[]; highlight?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="group relative flex-1 rounded-[2px] transition-all hover:opacity-100"
          style={{
            height: `${Math.max(6, (v / max) * 100)}%`,
            background: highlight === i ? 'var(--accent)' : color,
            opacity: highlight === i ? 1 : 0.55,
          }}
        >
          {labels?.[i] && (
            <span className="pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-mono text-[8px] text-white group-hover:block">
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Gauge({ value, size = 112, color = '#3ee0a1', label, suffix = '%' }: { value: number; size?: number; color?: string; label?: string; suffix?: string }) {
  const thickness = 8;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={`${(value / 100) * c} ${c}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 7px ${color}55)`, transition: 'stroke-dasharray .8s ease' }}
        />
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const r1 = r - thickness / 2 - 5;
          const r2 = r1 - 3;
          return (
            <line
              key={i}
              x1={size / 2 + Math.cos(rad) * r1} y1={size / 2 + Math.sin(rad) * r1}
              x2={size / 2 + Math.cos(rad) * r2} y2={size / 2 + Math.sin(rad) * r2}
              stroke={i / 20 <= value / 100 ? color : 'rgba(255,255,255,.09)'}
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[22px] text-white">{value.toFixed(1)}{suffix}</span>
        {label && <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--dim)]">{label}</span>}
      </div>
    </div>
  );
}

export function Heatmap({ matrix, xLabels, yLabels, onSelect }: {
  matrix: number[][]; xLabels: string[]; yLabels: string[]; onSelect?: (x: number, y: number) => void;
}) {
  const color = (v: number) => {
    if (v <= 0.08) return 'rgba(62,224,161,.1)';
    if (v <= 0.24) return 'rgba(62,224,161,.35)';
    if (v <= 0.45) return 'rgba(245,183,72,.5)';
    if (v <= 0.7) return 'rgba(251,146,100,.65)';
    return 'rgba(251,113,133,.85)';
  };
  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-right">
          {yLabels.map((l) => <span key={l} className="font-mono text-[8.5px] leading-[26px] text-[var(--dim)]">{l}</span>)}
        </div>
        <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
          {matrix.map((row, ri) => row.map((v, ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => onSelect?.(ci, ri)}
              title={`${yLabels[ri]} · ${xLabels[ci]}`}
              className="group relative h-[26px] rounded-[3px] border border-white/[.03] transition-transform hover:scale-[1.06]"
              style={{ background: color(v) }}
            >
              <span className="absolute inset-0 hidden items-center justify-center font-mono text-[8px] text-white/80 group-hover:flex">{Math.round(v * 100)}</span>
            </button>
          )))}
        </div>
      </div>
      <div className="mt-1.5 grid gap-1 pl-8" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
        {xLabels.map((l) => <span key={l} className="text-center font-mono text-[8.5px] text-[var(--dim)]">{l}</span>)}
      </div>
    </div>
  );
}

export function ProgressRing({ value, size = 92, label, color = '#3ee0a1' }: { value: number; size?: number; label?: string; color?: string }) {
  const thickness = 7;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={`${(value / 100) * c} ${c}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[18px] text-white">{value.toFixed(1)}<span className="text-[9px] text-[var(--dim)]">%</span></span>
        {label && <span className="mt-0.5 font-mono text-[6.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{label}</span>}
      </div>
    </div>
  );
}
