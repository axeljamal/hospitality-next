import type { Currency, OfferFinder, Pricing } from '@/venues/types';
import { addDays, dateKey, nightsBetween } from './dates';

/**
 * Demo availability: a deterministic scatter of booked nights from `today`, the same pattern the hand-built
 * site used. Replace with the venue's iCal / channel-manager feed in production.
 */
export function demoBookedNights(today: Date, horizon = 540): Set<string> {
  const booked = new Set<string>();
  for (let i = 0; i < horizon; i++) {
    const t = addDays(today, i);
    const r = (i * 7919) % 23;
    if ((r < 6 && t.getDay() >= 5) || r === 11 || (i > 12 && i < 16)) booked.add(dateKey(t));
  }
  return booked;
}

export interface StayQuote {
  nights: number;
  /** Nights before any stay discount. */
  base: number;
  /** Nights after the stay discount, rounded. */
  sum: number;
  pct: number;
  label: string;
  discountId: string | null;
}

export interface FullQuote extends StayQuote {
  extras: number;
  total: number;
  /** Estimated cost of the same dates on a platform (nights x markup, plus the same extras). */
  ota: number;
  saving: number;
  deposit: number;
}

export function formatMoney(value: number, currency: Currency): string {
  return currency.symbol + Math.round(value * currency.rate).toLocaleString('en-GB');
}

export type BookingEngine = ReturnType<typeof createBookingEngine>;

export function createBookingEngine(pricing: Pricing, booked: Set<string>, today: Date) {
  const isBooked = (d: Date) => booked.has(dateKey(d));
  const isGap = (d: Date) => !isBooked(d) && isBooked(addDays(d, -1)) && isBooked(addDays(d, 1));

  /** All-in nightly rate for the night starting on `d`, rounded to whole units. */
  function rate(d: Date): number {
    const m = d.getMonth();
    let r = pricing.base[pricing.bandByMonth[m]];
    if (pricing.weekendDays.includes(d.getDay())) r *= pricing.weekendMultiplier;
    for (const pk of pricing.peaks) if (m === pk.month && d.getDate() >= pk.fromDay) r *= pk.multiplier;
    if (isGap(d)) r *= pricing.gapNight.multiplier;
    return Math.round(r);
  }

  const minNights = (arrival: Date) => pricing.minNights.byArrivalMonth[arrival.getMonth()] ?? pricing.minNights.default;

  /** True when every night from a (inclusive) to b (exclusive) is free. */
  function rangeClear(a: Date, b: Date): boolean {
    for (let t = new Date(a); t < b; t = addDays(t, 1)) if (isBooked(t)) return false;
    return true;
  }

  const allowsStay = (a: Date, nights: number) =>
    nights >= minNights(a) || (nights === 1 && pricing.gapNight.bookableAlone && isGap(a));

  /** The single best stay discount for these nights (discounts never stack). */
  function stayDiscount(a: Date, b: Date): { id: string; label: string; pct: number } | null {
    const n = nightsBetween(a, b);
    let best: { id: string; label: string; pct: number } | null = null;
    for (const disc of pricing.discounts) {
      if (n < disc.minNights) continue;
      if (disc.kind === 'midweek') {
        let ok = true;
        for (let t = new Date(a); t < b; t = addDays(t, 1)) {
          if (!disc.weekdays.includes(t.getDay()) || !disc.months.includes(t.getMonth())) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      }
      if (!best || disc.pct > best.pct) best = { id: disc.id, label: disc.label, pct: disc.pct };
    }
    return best;
  }

  function quoteRange(a: Date, b: Date): StayQuote {
    let nights = 0;
    let base = 0;
    for (let t = new Date(a); t < b; t = addDays(t, 1)) {
      nights++;
      base += rate(t);
    }
    const disc = stayDiscount(a, b);
    const pct = disc?.pct ?? 0;
    return { nights, base, sum: Math.round(base * (1 - pct / 100)), pct, label: disc?.label ?? '', discountId: disc?.id ?? null };
  }

  function quote(a: Date, b: Date, extrasTotal: number): FullQuote {
    const r = quoteRange(a, b);
    const total = r.sum + extrasTotal;
    const ota = Math.round(r.sum * pricing.otaMarkup) + extrasTotal;
    return { ...r, extras: extrasTotal, total, ota, saving: ota - total, deposit: (total * pricing.depositPct) / 100 };
  }

  /** First stay of `nights` nights whose arrival matches `pred` and whose nights are all free. */
  function firstStay(nights: number, pred: (arrival: Date) => boolean, searchDays = 400): [Date, Date] | null {
    for (let i = 0; i < searchDays; i++) {
      const a = addDays(today, i);
      if (!pred(a)) continue;
      const b = addDays(a, nights);
      if (!rangeClear(a, b)) continue;
      return [a, b];
    }
    return null;
  }

  function findOffer(f: OfferFinder): [Date, Date] | null {
    if (f.gapNight) return firstStay(1, isGap);
    return firstStay(f.nights, (a) => (f.arrivalDay === undefined || a.getDay() === f.arrivalDay) && (!f.months || f.months.includes(a.getMonth())));
  }

  function nextFreeWeekend(): Date | null {
    const first = pricing.weekendDays[0] ?? 5;
    const r = firstStay(2, (a) => a.getDay() === first, 540);
    return r ? r[0] : null;
  }

  type Check =
    | { ok: false; reason: 'past' | 'order' | 'booked' | 'crosses' | 'min'; minNights?: number }
    | { ok: true; nights: number };

  /** Validate an arrival/departure pair the way the quick-book form and calendar do. */
  function checkStay(a: Date, b: Date): Check {
    if (a < today) return { ok: false, reason: 'past' };
    if (b <= a) return { ok: false, reason: 'order' };
    const n = nightsBetween(a, b);
    if (!allowsStay(a, n)) return { ok: false, reason: 'min', minNights: minNights(a) };
    if (isBooked(a)) return { ok: false, reason: 'booked' };
    if (!rangeClear(a, b)) return { ok: false, reason: 'crosses' };
    return { ok: true, nights: n };
  }

  return { today, isBooked, isGap, rate, minNights, rangeClear, allowsStay, stayDiscount, quoteRange, quote, firstStay, findOffer, nextFreeWeekend, checkStay };
}
