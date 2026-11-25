import type { Venue } from '@/venues/types';
import type { BookingEngine } from './booking';
import { addDays, fmtLong } from './dates';

/**
 * Answer a guest question from the house notes (keyword match), with two live cases from the calendar:
 * "is a weekend free" and "how much". This is the offline guide; the AI "Ask the house" assistant is a later add-on.
 */
export function answerFromNotes(venue: Venue, q: string, engine: BookingEngine | null, money: (v: number) => string): string {
  const l = q.toLowerCase();
  const base = venue.currencies[0].symbol;
  if (engine && /weekend/.test(l) && /(free|avail|book|next)/.test(l)) {
    const w = engine.nextFreeWeekend();
    if (w) {
      const r = engine.quoteRange(w, addDays(w, 2));
      return `The next free weekend is ${fmtLong(w)} to ${fmtLong(addDays(w, 2))}, ${money(r.sum)} all-in for two nights. Pick it in the booking calendar and press Hold these dates.`;
    }
  }
  if (/(price|cost|how much|rate|cheap)/.test(l)) {
    const pr = venue.pricing;
    const wk = Math.round((pr.weekendMultiplier - 1) * 100);
    const gap = Math.round((1 - pr.gapNight.multiplier) * 100);
    const long = pr.discounts.find((d) => d.kind === 'long');
    return `Nightly rates run from ${base}${pr.base.low} in winter to ${base}${pr.base.high} in high summer, weekends about ${wk}% more, and gap nights ${gap}% less.${long ? ` Stays of ${long.minNights}+ nights get ${long.pct}% off.` : ''} Everything is all-in. Pick dates in the booking calendar to see the exact total.`;
  }
  const hits = venue.guide.notes.filter((e) => e.keywords.some((k) => l.includes(k)) || l.includes(e.topic));
  if (hits.length) return hits[0].answer + (hits.length > 1 ? `\n\nAlso in the notes: ${hits.slice(1).map((h) => h.topic).join(', ')}.` : '');
  return `That one is not in the house notes yet, so it goes straight to the owners. They usually reply within ${venue.contact.replyDuringStay.replace(/^about /, '')} via the app or WhatsApp.`;
}
