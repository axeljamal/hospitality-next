'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Currency, Venue } from '@/venues/types';
import { createBookingEngine, demoBookedNights, formatMoney, type BookingEngine } from '@/lib/booking';
import { startOfDay } from '@/lib/dates';
import { store } from '@/lib/store';
import { useHydrated, usePrefersReducedMotion } from '@/lib/hooks';

interface Selection {
  a: Date | null;
  b: Date | null;
}

interface SiteState {
  venue: Venue;
  /** Null until the page has mounted: dates depend on the visitor's clock, not the build machine's. */
  engine: BookingEngine | null;
  currency: Currency;
  setCurrency: (code: string) => void;
  money: (v: number) => string;
  reduced: boolean;
  sel: Selection;
  setSel: (s: Selection) => void;
  /** Month shown in the calendar (first of month). */
  view: Date | null;
  setView: (d: Date) => void;
  status: { msg: string; err: boolean };
  setStatus: (msg: string, err?: boolean) => void;
  extras: Set<string>;
  toggleExtra: (id: string, on: boolean) => void;
  /** Put a stay in the calendar, say so, and scroll to it. */
  loadStay: (a: Date, b: Date, msg: string, toastMsg?: string) => void;
  toast: (msg: string) => void;
  toastMsg: string;
  toastOn: boolean;
}

const Ctx = createContext<SiteState | null>(null);

export function useSite(): SiteState {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSite must be used inside <SiteProvider>');
  return c;
}

export function scrollToId(id: string, reduced: boolean) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

export function SiteProvider({ venue, children }: { venue: Venue; children: ReactNode }) {
  // Client-only values: today's date (and so the demo availability), saved currency, motion preference.
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const engine = useMemo<BookingEngine | null>(() => {
    if (!hydrated) return null;
    const today = startOfDay();
    return createBookingEngine(venue.pricing, demoBookedNights(today), today);
  }, [hydrated, venue.pricing]);
  const [chosenCur, setCurCode] = useState<string | null>(null);
  const savedCur = hydrated ? store.get(`${venue.slug}-cur`) : null;
  const curCode = chosenCur ?? savedCur ?? venue.currencies[0].code;
  const [sel, setSel] = useState<Selection>({ a: null, b: null });
  const [viewState, setView] = useState<Date | null>(null);
  const view = useMemo(() => viewState ?? (engine ? new Date(engine.today.getFullYear(), engine.today.getMonth(), 1) : null), [viewState, engine]);
  const [status, setStatusState] = useState({ msg: 'Tap your arrival date, then your departure date. Arrow keys move between days.', err: false });
  const [extras, setExtras] = useState<Set<string>>(() => new Set(venue.extras.filter((x) => x.default).map((x) => x.id)));
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const currency = venue.currencies.find((c) => c.code === curCode) ?? venue.currencies[0];

  const setCurrency = useCallback(
    (code: string) => {
      setCurCode(code);
      store.set(`${venue.slug}-cur`, code);
    },
    [venue.slug],
  );
  const money = useCallback((v: number) => formatMoney(v, currency), [currency]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 3200);
  }, []);

  const setStatus = useCallback((msg: string, err = false) => setStatusState({ msg, err }), []);

  const toggleExtra = useCallback((id: string, on: boolean) => {
    setExtras((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const loadStay = useCallback(
    (a: Date, b: Date, msg: string, toastText?: string) => {
      setSel({ a, b });
      setView(new Date(a.getFullYear(), a.getMonth(), 1));
      setStatus(msg);
      requestAnimationFrame(() => scrollToId('book', reduced));
      if (toastText) toast(toastText);
    },
    [reduced, setStatus, toast],
  );

  const value = useMemo<SiteState>(
    () => ({ venue, engine, currency, setCurrency, money, reduced, sel, setSel, view, setView, status, setStatus, extras, toggleExtra, loadStay, toast, toastMsg, toastOn }),
    [venue, engine, currency, setCurrency, money, reduced, sel, view, status, setStatus, extras, toggleExtra, loadStay, toast, toastMsg, toastOn],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function Toast() {
  const { toastMsg, toastOn } = useSite();
  return (
    <div className={`toast${toastOn ? ' on' : ''}`} role="status" aria-live="polite">
      {toastMsg}
    </div>
  );
}
