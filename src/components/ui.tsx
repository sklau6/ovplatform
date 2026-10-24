import {
  createContext, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function Panel({
  title, eyebrow, action, children, className, bodyClassName, dense,
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  dense?: boolean;
}) {
  return (
    <section className={cn('panel', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-[18px]">
          <div className="min-w-0">
            {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
            {title && <h2 className="panel-title truncate">{title}</h2>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn(dense ? 'p-3' : 'px-5 pb-5 pt-4', bodyClassName)}>{children}</div>
    </section>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'green' | 'cyan' | 'amber' | 'rose' | 'violet'; className?: string }) {
  return <span className={cn('badge', `badge-${tone}`, className)}>{children}</span>;
}

export function LiveTag({ label = 'Live' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--accent)]">
      <span className="live-dot" /> {label}
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'ghost' && 'btn-ghost',
        variant === 'outline' && 'btn-outline',
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        size === 'icon' && 'btn-icon',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} className={cn('btn btn-icon btn-sm', className)} {...props}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange, className }: {
  options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div className={cn('tabs', className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          className={cn('tab', value === opt.value && 'active')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ options, value, onChange, className }: {
  options: Array<{ value: T; label: string; count?: number }>; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div className={cn('flex gap-1 border-b border-[var(--line)]', className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative -mb-px flex h-9 items-center gap-1 px-3 text-[12px] transition-colors',
            value === opt.value ? 'text-white' : 'text-[var(--muted)] hover:text-[#cfdae4]',
          )}
        >
          {opt.label}
          {opt.count !== undefined && <span className="font-mono text-[9px] text-[var(--dim)]">{opt.count}</span>}
          {value === opt.value && <span className="absolute inset-x-2 -bottom-px h-[1.5px] rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(62,224,161,.7)]" />}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, color = 'var(--accent)', height = 4, className }: { value: number; color?: string; height?: number; className?: string }) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-white/[.06]', className)} style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color, boxShadow: `0 0 10px ${color}55` }}
      />
    </div>
  );
}

export function KpiCard({ label, value, unit, delta, deltaTone = 'green', spark, footer, icon, className }: {
  label: string; value: string; unit?: string; delta?: string; deltaTone?: 'green' | 'rose' | 'amber' | 'muted';
  spark?: ReactNode; footer?: ReactNode; icon?: ReactNode; className?: string;
}) {
  const tone = { green: 'text-[var(--accent)]', rose: 'text-[var(--rose)]', amber: 'text-[var(--amber)]', muted: 'text-[var(--muted)]' }[deltaTone];
  return (
    <div className={cn('panel panel-hover group relative overflow-hidden p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[var(--dim)] transition-colors group-hover:text-[var(--accent)]">{icon}</span>}
          <span className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">{label}</span>
        </div>
        {delta && (
          <span className={cn('font-mono text-[10px] tabular-nums', tone)}>
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="num text-[27px] leading-none text-white">{value}</span>
          {unit && <span className="text-[10.5px] text-[var(--dim)]">{unit}</span>}
        </div>
        {spark && <div className="h-8 w-20 shrink-0 opacity-80">{spark}</div>}
      </div>
      {footer && <div className="mt-3 border-t border-[var(--line)] pt-2 text-[10px] text-[var(--dim)]">{footer}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="num text-[18px]" style={{ color: tone || 'var(--text)' }}>{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-[var(--dim)]">{sub}</div>}
    </div>
  );
}

export function Delta({ value, suffix, invert }: { value: number; suffix?: string; invert?: boolean }) {
  const positive = invert ? value <= 0 : value >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 font-mono text-[10.5px] tabular-nums', positive ? 'text-[var(--accent)]' : 'text-[var(--rose)]')}>
      <ArrowUpRight size={11} className={value < 0 ? 'rotate-90' : ''} />
      {Math.abs(value).toFixed(1)}{suffix ?? '%'}
    </span>
  );
}

export function Modal({ open, onClose, title, eyebrow, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title?: ReactNode; eyebrow?: ReactNode; children: ReactNode;
  footer?: ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  const width = { sm: 420, md: 640, lg: 860 }[size];
  return createPortal(
    <div className="overlay flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel slide-up w-full" style={{ maxWidth: width }}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <div>
            {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
            {title && <h2 className="font-display text-[16px] font-medium text-white">{title}</h2>}
          </div>
          <button onClick={onClose} aria-label="Close" className="btn btn-ghost btn-icon btn-sm -mr-1 -mt-1">
            <X size={15} />
          </button>
        </div>
        <div className="max-h-[64vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-[var(--line)] px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function SectionHeader({ eyebrow, title, description, action, className }: {
  eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow eyebrow-accent mb-2">{eyebrow}</div>}
        <h1 className="display text-[28px] text-white md:text-[31px]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-[var(--muted)]">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon && <div className="text-[var(--dim)]">{icon}</div>}
      <div className="text-[12px] text-[#c3d0dc]">{title}</div>
      {description && <div className="max-w-xs text-[11px] text-[var(--dim)]">{description}</div>}
    </div>
  );
}

export function StepBar({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={cn('flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[8.5px]',
              i < active ? 'bg-[var(--accent)] text-black' : i === active ? 'border border-[var(--accent)] text-[var(--accent)]' : 'border border-[var(--line)] text-[var(--dim)]')}
          >
            {i < active ? '✓' : i + 1}
          </div>
          <span className={cn('hidden text-[10px] xl:inline', i === active ? 'text-[#dbe5ee]' : 'text-[var(--dim)]')}>{s}</span>
          {i < steps.length - 1 && <div className={cn('mx-1 h-px w-4', i < active ? 'bg-[var(--accent)]/60' : 'bg-[var(--line)]')} />}
        </div>
      ))}
    </div>
  );
}

export function NumberStepper({ value, onChange, min = 0, max = 100, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <button className="btn btn-icon btn-sm" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease"><Minus size={12} /></button>
      <span className="mono-num w-12 text-center text-[12px] text-white">{value}{suffix}</span>
      <button className="btn btn-icon btn-sm" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase"><Plus size={12} /></button>
    </div>
  );
}

export function InfoTip({ children }: { children: ReactNode }) {
  return <span className="cursor-help text-[var(--dim)]" title={String(children)}>ⓘ</span>;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-md border border-[var(--line-2)] bg-[#0b1219] px-2 py-1 text-[10px] text-[#cfdae4] shadow-xl group-hover/tt:block">
        {label}
      </span>
    </span>
  );
}

const ScrollCtx = createContext<HTMLDivElement | null>(null);
export function ScrollArea({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={cn('scroll-area', className)}>
      <ScrollCtx.Provider value={ref.current}>{children}</ScrollCtx.Provider>
    </div>
  );
}

export function useScrollTop(dep: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [dep]);
}

export function useUniqueId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, '')}`;
}
