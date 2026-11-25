import { describe, expect, it } from 'vitest';
import { beamHouse } from '@/venues/beam-house';
import type { Pricing } from '@/venues/types';
import { createBookingEngine, demoBookedNights, formatMoney } from './booking';
import { addDays, dateKey, parseKey } from './dates';
import { buildRoute, stepText, stepWhen, walkDates } from './walk';
import { answerFromNotes } from './notes';

const D = parseKey;
const pricing = beamHouse.pricing;
const TODAY = D('2026-12-01');
const engineWith = (booked: string[] = [], p: Pricing = pricing, today = TODAY) => createBookingEngine(p, new Set(booked), today);

describe('nightly rate', () => {
  const e = engineWith();
  it('uses the season band', () => {
    expect(e.rate(D('2027-01-04'))).toBe(135); // Monday, low
    expect(e.rate(D('2027-04-05'))).toBe(175); // Monday, mid
    expect(e.rate(D('2027-07-05'))).toBe(245); // Monday, high
  });
  it('adds the weekend uplift on Friday and Saturday nights', () => {
    expect(e.rate(D('2027-01-08'))).toBe(159); // 135 x 1.18 = 159.3
    expect(e.rate(D('2027-01-09'))).toBe(159);
    expect(e.rate(D('2027-01-10'))).toBe(135); // Sunday is a weeknight
  });
  it('applies the Christmas peak from the 20th', () => {
    expect(e.rate(D('2026-12-19'))).toBe(159); // Saturday before the peak
    expect(e.rate(D('2026-12-24'))).toBe(203); // Thursday: 135 x 1.5 = 202.5
    expect(e.rate(D('2026-12-26'))).toBe(239); // Saturday: 135 x 1.18 x 1.5 = 238.95
  });
  it('discounts a gap night between two bookings by 20%', () => {
    const g = engineWith(['2027-01-05', '2027-01-07']);
    expect(g.isGap(D('2027-01-06'))).toBe(true);
    expect(g.rate(D('2027-01-06'))).toBe(108);
    expect(g.isGap(D('2027-01-08'))).toBe(false);
  });
});

describe('stay rules', () => {
  it('needs 3 nights for summer arrivals, 2 otherwise', () => {
    const e = engineWith();
    expect(e.minNights(D('2027-06-10'))).toBe(3);
    expect(e.minNights(D('2027-08-31'))).toBe(3);
    expect(e.minNights(D('2027-09-01'))).toBe(2);
    expect(e.minNights(D('2027-01-10'))).toBe(2);
  });
  it('allows a single night only on a gap night', () => {
    const e = engineWith(['2027-01-05', '2027-01-07']);
    expect(e.allowsStay(D('2027-01-06'), 1)).toBe(true);
    expect(e.allowsStay(D('2027-01-12'), 1)).toBe(false);
    expect(e.allowsStay(D('2027-01-12'), 2)).toBe(true);
  });
  it('validates a requested stay and says why it fails', () => {
    const e = engineWith(['2027-01-14']);
    expect(e.checkStay(D('2026-11-30'), D('2026-12-03'))).toEqual({ ok: false, reason: 'past' });
    expect(e.checkStay(D('2027-01-10'), D('2027-01-10'))).toEqual({ ok: false, reason: 'order' });
    expect(e.checkStay(D('2027-06-10'), D('2027-06-12'))).toEqual({ ok: false, reason: 'min', minNights: 3 });
    expect(e.checkStay(D('2027-01-14'), D('2027-01-16'))).toEqual({ ok: false, reason: 'booked' });
    expect(e.checkStay(D('2027-01-12'), D('2027-01-16'))).toEqual({ ok: false, reason: 'crosses' });
    expect(e.checkStay(D('2027-01-10'), D('2027-01-13'))).toEqual({ ok: true, nights: 3 });
  });
  it('treats the departure day as free to book by the next guest', () => {
    const e = engineWith(['2027-01-14']);
    expect(e.rangeClear(D('2027-01-12'), D('2027-01-14'))).toBe(true);
  });
});

describe('price summary', () => {
  it('applies the 25% fireside rate to four winter midweek nights', () => {
    const q = engineWith().quoteRange(D('2027-01-04'), D('2027-01-08'));
    expect(q).toMatchObject({ nights: 4, base: 540, pct: 25, sum: 405, discountId: 'midweek', label: 'Fireside midweek rate' });
  });
  it('does not give the midweek rate when a night falls on a Friday', () => {
    const q = engineWith().quoteRange(D('2027-01-05'), D('2027-01-09'));
    expect(q.pct).toBe(0);
    expect(q.base).toBe(135 * 3 + 159);
  });
  it('does not give the midweek rate outside the winter months', () => {
    expect(engineWith().quoteRange(D('2027-04-05'), D('2027-04-09')).pct).toBe(0);
  });
  it('applies 15% to stays of seven nights or more', () => {
    const q = engineWith().quoteRange(D('2027-07-03'), D('2027-07-10'));
    expect(q.base).toBe(289 * 2 + 245 * 5);
    expect(q).toMatchObject({ nights: 7, pct: 15, sum: Math.round(1803 * 0.85), discountId: 'long' });
  });
  it('never stacks discounts: the largest wins', () => {
    const p: Pricing = { ...pricing, weekendDays: [], discounts: pricing.discounts.map((d) => (d.kind === 'midweek' ? { ...d, weekdays: [0, 1, 2, 3, 4, 5, 6] } : d)) };
    const q = engineWith([], p).quoteRange(D('2027-01-04'), D('2027-01-11'));
    expect(q.pct).toBe(25);
    expect(q.sum).toBe(Math.round(135 * 7 * 0.75));
  });
  it('builds the full quote: extras, platform comparison, deposit', () => {
    const q = engineWith().quote(D('2027-01-04'), D('2027-01-08'), 45);
    expect(q.sum).toBe(405);
    expect(q.total).toBe(450);
    expect(q.ota).toBe(Math.round(405 * 1.15) + 45);
    expect(q.saving).toBe(q.ota - q.total);
    expect(q.deposit).toBeCloseTo(135);
  });
});

describe('finding dates', () => {
  it('finds the next fireside stay: a free Monday in winter, four nights clear', () => {
    const e = engineWith(['2026-12-07', '2026-12-16']);
    const offer = beamHouse.offers.items.find((o) => o.id === 'fireside')!;
    const r = e.findOffer(offer.find)!;
    expect(dateKey(r[0])).toBe('2026-12-21'); // 7th booked, 14th crosses the 16th
    expect(dateKey(r[1])).toBe('2026-12-25');
  });
  it('finds the next gap night', () => {
    const e = engineWith(['2026-12-09', '2026-12-11']);
    const r = e.findOffer({ nights: 1, gapNight: true })!;
    expect(dateKey(r[0])).toBe('2026-12-10');
  });
  it('finds the next free weekend', () => {
    const e = engineWith(['2026-12-05']);
    expect(dateKey(e.nextFreeWeekend()!)).toBe('2026-12-11');
  });
  it('generates the same demo availability for the same day', () => {
    const a = demoBookedNights(TODAY);
    expect([...a]).toEqual([...demoBookedNights(TODAY)]);
    for (const i of [13, 14, 15]) expect(a.has(dateKey(addDays(TODAY, i)))).toBe(true);
  });
});

describe('money', () => {
  it('formats in the chosen currency', () => {
    const [gbp, eur, usd] = beamHouse.currencies;
    expect(formatMoney(1234, gbp)).toBe('£1,234');
    expect(formatMoney(100, eur)).toBe('€117');
    expect(formatMoney(100, usd)).toBe('$131');
  });
});

describe('your stay, walked', () => {
  const w = beamHouse.walk;
  const base = { who: 'couple' as const, pace: 'balanced' as const, purpose: 'tub', dog: false };
  it('builds the purpose route and fills the tokens', () => {
    const r = buildRoute(w, base);
    expect(r.map((s) => s.room)).toEqual(['brass-bedroom', 'courtyard', 'kitchen', 'nook', 'sitting-room', 'bathroom']);
    expect(stepWhen(w, r[0], base)).toBe('Monday, 9pm');
    expect(stepText(w, r[1], base)).toContain('which suits the two of you anyway.');
    expect(stepWhen(w, r[2], { ...base, pace: 'slow' })).toBe('Sunday, 9am');
  });
  it('applies party and dog overrides', () => {
    expect(buildRoute(w, { ...base, who: 'family' })[5].room).toBe('attic-twin');
    expect(buildRoute(w, { ...base, who: 'friends' })[4].room).toBe('dining');
    // Celebrate already visits the dining room, so the friends override is skipped.
    expect(buildRoute(w, { ...base, who: 'friends', purpose: 'celebrate' })[4].room).toBe('bathroom');
    const dog = buildRoute(w, { ...base, dog: true });
    expect(dog[2]).toMatchObject({ room: 'courtyard', story: 1 });
    expect(stepText(w, dog[1], { ...base, dog: true })).toContain('The dog has the courtyard to itself.');
  });
  it('uses the party-specific text where there is one', () => {
    const c = { ...base, who: 'family' as const, purpose: 'fire' };
    expect(stepText(w, buildRoute(w, c)[2], c)).toContain('The children have the attic');
  });
  it('suggests winter Monday arrivals for a working week', () => {
    const e = engineWith();
    const r = walkDates(w, e, { ...base, purpose: 'work' })!;
    expect(r[0].getDay()).toBe(1);
    expect([10, 11, 0, 1, 2]).toContain(r[0].getMonth());
    expect(Math.round((r[1].getTime() - r[0].getTime()) / 864e5)).toBe(4);
  });
});

describe('guest guide answers', () => {
  const e = engineWith();
  const money = (v: number) => formatMoney(v, beamHouse.currencies[0]);
  it('answers from the house notes by keyword', () => {
    expect(answerFromNotes(beamHouse, 'How does the stove work?', e, money)).toMatch(/^Open the bottom vent/);
  });
  it('answers price questions from the pricing config', () => {
    expect(answerFromNotes(beamHouse, 'how much is it', e, money)).toContain('from £135 in winter to £245');
  });
  it('hands unknown questions to the owners', () => {
    expect(answerFromNotes(beamHouse, 'Is there a piano?', e, money)).toContain('goes straight to the owners');
  });
});
