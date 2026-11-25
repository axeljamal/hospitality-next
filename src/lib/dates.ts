/** Local-calendar date helpers. Every Date here is midnight local time; keys are YYYY-MM-DD. */

export const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function safeParseKey(k: string | null | undefined): Date | null {
  return k && /^\d{4}-\d{2}-\d{2}$/.test(k) ? parseKey(k) : null;
}

export function addDays(d: Date, n: number): Date {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t;
}

export function startOfDay(d: Date = new Date()): Date {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

/** Whole nights between two midnights, safe across clock changes. */
export const nightsBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5);

export const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const fmtLong = (d: Date, lang = 'en-GB') => d.toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtShort = (d: Date, lang = 'en-GB') => d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 31 -> "thirty-first", 40 -> "fortieth". Up to 99. */
export function ordinalWord(n: number): string {
  if (n <= 20) return ORDINALS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u ? `${TENS[t]}-${ORDINALS[u]}` : TENS[t].replace(/y$/, 'ieth');
}

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const numberWord = (n: number) => NUMBERS[n] ?? String(n);
