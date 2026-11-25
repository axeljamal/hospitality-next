import type { Walk, WalkPace, WalkStep, WalkWho } from '@/venues/types';
import type { BookingEngine } from './booking';

export interface WalkChoice {
  who: WalkWho;
  pace: WalkPace;
  purpose: string;
  dog: boolean;
}

/** The route for a choice: the purpose's steps with any matching overrides applied, in order. */
export function buildRoute(walk: Walk, c: WalkChoice): WalkStep[] {
  const purpose = walk.purposes.find((p) => p.id === c.purpose) ?? walk.purposes[0];
  const route = purpose.steps.map((s) => ({ ...s }));
  for (const o of walk.overrides) {
    const matches = (o.if.who === undefined || o.if.who === c.who) && (o.if.dog === undefined || o.if.dog === c.dog);
    if (!matches) continue;
    if (o.unlessRouteHas) {
      const u = o.unlessRouteHas;
      if (route.some((s) => s.room === u.room && (u.story === undefined || s.story === u.story))) continue;
    }
    if (o.index < route.length) route[o.index] = { ...o.step };
  }
  return route;
}

function fill(text: string, walk: Walk, c: WalkChoice): string {
  const pace = walk.pace.find((p) => p.id === c.pace) ?? walk.pace[0];
  const who = walk.who.find((w) => w.id === c.who) ?? walk.who[0];
  return text.replaceAll('{day}', pace.days[0]).replaceAll('{next}', pace.days[1]).replaceAll('{who}', who.phrase);
}

export const stepWhen = (walk: Walk, s: WalkStep, c: WalkChoice) => fill(s.whenFor?.[c.pace] ?? s.when, walk, c);

export function stepText(walk: Walk, s: WalkStep, c: WalkChoice): string {
  const base = s.textFor?.[c.who] ?? s.text;
  return fill(base + (c.dog && s.dogText ? s.dogText : ''), walk, c);
}

/** The first free stay that fits the walk: nights from the pace, arrival day and months from the purpose. */
export function walkDates(walk: Walk, engine: BookingEngine, c: WalkChoice): [Date, Date] | null {
  const pace = walk.pace.find((p) => p.id === c.pace) ?? walk.pace[0];
  const purpose = walk.purposes.find((p) => p.id === c.purpose);
  const d = purpose?.dates;
  const days = d?.arrivalDaysByPace?.[c.pace] ?? d?.arrivalDays ?? pace.arrivalDays;
  return engine.firstStay(pace.nights, (a) => days.includes(a.getDay()) && (!d?.months || d.months.includes(a.getMonth())));
}
