'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSite } from '../SiteContext';
import { addDays, dateKey, fmtLong, fmtShort, parseKey } from '@/lib/dates';

export function QuickBook() {
  const { venue, engine, loadStay, toggleExtra, toast } = useSite();
  const [inV, setIn] = useState('');
  const [outV, setOut] = useState('');
  const [guests, setGuests] = useState(venue.guestOptions[0]?.value ?? '');
  const [err, setErr] = useState('');
  const [bad, setBad] = useState<'in' | 'out' | null>(null);
  const inRef = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLInputElement>(null);

  const minIn = engine ? dateKey(engine.today) : undefined;
  const minOut = engine ? dateKey(addDays(inV ? parseKey(inV) : engine.today, inV ? engine.minNights(parseKey(inV)) : 2)) : undefined;

  function fail(which: 'in' | 'out', msg: string) {
    setErr(msg);
    setBad(which);
    (which === 'in' ? inRef : outRef).current?.focus();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setBad(null);
    if (!engine) return;
    if (!inV) return fail('in', 'Choose an arrival date.');
    if (!outV) return fail('out', 'Choose a departure date.');
    const a = parseKey(inV);
    const b = parseKey(outV);
    const c = engine.checkStay(a, b);
    if (!c.ok) {
      switch (c.reason) {
        case 'past':
          return fail('in', 'Arrival must be today or later.');
        case 'order':
          return fail('out', 'Departure must be after arrival.');
        case 'min':
          return fail('out', `Minimum stay for those dates is ${c.minNights} nights.`);
        case 'booked':
          return fail('in', `${fmtLong(a)} is already booked. Try the calendar for the nearest free dates.`);
        case 'crosses':
          return fail('out', 'Those dates cross an existing booking. Shorten the stay or move it.');
      }
    }
    const opt = venue.guestOptions.find((g) => g.value === guests);
    if (opt?.addsExtra) toggleExtra(opt.addsExtra, true);
    loadStay(a, b, `${c.ok ? c.nights : ''} nights, ${fmtShort(a)} to ${fmtShort(b)}. Your price is on the right.`);
    setTimeout(() => {
      const st = document.getElementById('calStatus');
      st?.focus({ preventScroll: true });
    }, 0);
    toast('Live price ready');
  }

  return (
    <div className="qb wrap">
      <form className="card" noValidate aria-label="Quick date check" onSubmit={submit}>
        <div className="field">
          <label htmlFor="qin">Arrive</label>
          <input ref={inRef} type="date" id="qin" required min={minIn} value={inV} aria-invalid={bad === 'in' || undefined} aria-describedby="qbErr" onChange={(e) => setIn(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="qout">Leave</label>
          <input ref={outRef} type="date" id="qout" required min={minOut} value={outV} aria-invalid={bad === 'out' || undefined} aria-describedby="qbErr" onChange={(e) => setOut(e.target.value)} />
        </div>
        <div className="field guests">
          <label htmlFor="qg">Guests</label>
          <select id="qg" value={guests} onChange={(e) => setGuests(e.target.value)}>
            {venue.guestOptions.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn accent" type="submit">
          See live price
        </button>
        <p className="err" id="qbErr" role="alert">
          {err}
        </p>
      </form>
    </div>
  );
}
