import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { INSIGHTS } from './data';
import type { Insight } from './types';
import { clamp, hkTime } from './utils';

type ToastTone = 'success' | 'info' | 'warning' | 'error';
interface Toast { id: number; title: string; message?: string; tone: ToastTone }
type ScanState = 'idle' | 'scanning' | 'complete';

interface LiveState {
  now: Date;
  energy: number;
  occupancy: number;
  grid: number;
  sensors: number;
  insights: Insight[];
  scan: ScanState;
  scanStep: string;
  toasts: Toast[];
  focusMode: boolean;
  paletteOpen: boolean;
  runScan: () => void;
  dismissInsight: (id: string) => void;
  toast: (title: string, message?: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
  setFocusMode: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
}

const LiveContext = createContext<LiveState | null>(null);

const SCAN_STEPS = [
  'Ingesting 1,284 sensor streams…',
  'Evaluating portfolio against 2026 pathway…',
  'Cross-checking ledger attestations…',
  'Ranking executive actions…',
];

export function LiveProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [energy, setEnergy] = useState(84.2);
  const [occupancy, setOccupancy] = useState(91.8);
  const [grid, setGrid] = useState(68.4);
  const [sensors, setSensors] = useState(1284);
  const [insights, setInsights] = useState<Insight[]>(INSIGHTS);
  const [scan, setScan] = useState<ScanState>('idle');
  const [scanStep, setScanStep] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    const tick = window.setInterval(() => {
      setEnergy((v) => Number(clamp(v + (Math.random() - 0.52) * 0.22, 81.4, 86.8).toFixed(2)));
      setOccupancy((v) => Number(clamp(v + (Math.random() - 0.5) * 0.35, 89.6, 93.4).toFixed(1)));
      setGrid((v) => Number(clamp(v + (Math.random() - 0.5) * 0.9, 64.2, 72.6).toFixed(1)));
      setSensors((v) => (Math.random() > 0.82 ? clamp(v + (Math.random() > 0.5 ? 1 : -1), 1279, 1287) : v));
    }, 2600);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(tick);
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((title: string, message?: string, tone: ToastTone = 'success') => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, title, message, tone }]);
    const timer = window.setTimeout(() => dismissToast(id), 5200);
    timers.current.push(timer);
  }, [dismissToast]);

  const dismissInsight = useCallback((id: string) => {
    setInsights((list) => list.map((i) => (i.id === id ? { ...i, dismissed: true } : i)));
  }, []);

  const runScan = useCallback(() => {
    if (scan === 'scanning') return;
    setScan('scanning');
    setScanStep(SCAN_STEPS[0]);
    SCAN_STEPS.forEach((step, idx) => {
      if (idx === 0) return;
      const timer = window.setTimeout(() => setScanStep(step), 620 * idx);
      timers.current.push(timer);
    });
    const done = window.setTimeout(() => {
      setScan('complete');
      const finding: Insight = {
        id: 'I-SCAN',
        severity: 'opportunity',
        title: 'Peak-shaving across 3 waterfront assets can cut October demand charges by 12.4%',
        detail: 'GridSense identified a coincident peak at 14:20–15:40 HKT across Marina Central, Harbourview and Central Market. Staggering chiller recovery and shifting 640 kWh of flexible load avoids the next tariff tranche.',
        impact: 'HK$2.1M annualised', confidence: 89,
        source: 'Live city scan · GridSense v4.0 · trust ledger verified', action: 'Approve dispatch plan',
      };
      setInsights((list) => [finding, ...list.filter((i) => i.id !== 'I-SCAN')]);
      toast('City scan complete', '4,218 signals evaluated · 1 new executive action surfaced', 'success');
      setScan('complete');
    }, 620 * SCAN_STEPS.length + 300);
    timers.current.push(done);
  }, [scan, toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const value = useMemo<LiveState>(() => ({
    now, energy, occupancy, grid, sensors, insights, scan, scanStep, toasts, focusMode, paletteOpen,
    runScan, dismissInsight, toast, dismissToast, setFocusMode, setPaletteOpen,
  }), [now, energy, occupancy, grid, sensors, insights, scan, scanStep, toasts, focusMode, paletteOpen, runScan, dismissInsight, toast, dismissToast]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used inside LiveProvider');
  return ctx;
}

export function useHkClock() {
  const { now } = useLive();
  return { time: hkTime(now, true), date: hkTime(now) };
}
