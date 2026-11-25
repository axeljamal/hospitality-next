'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useSite } from '../SiteContext';
import { Dialog, CloseButton } from '../Dialog';
import { EMAIL_RE, initials } from '@/lib/store';
import { addDays, dateKey, fmtLong, fmtShort, nightsBetween, parseKey, sameMonth } from '@/lib/dates';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Booking() {
  const { venue } = useSite();
  const b = venue.booking;
  return (
    <section id="book" aria-labelledby="bookH">
      <div className="wrap">
        <p className="eyebrow">{b.eyebrow}</p>
        <h2 id="bookH">{b.title}</h2>
        <p className="lede">{b.lede}</p>
        <div className="cal-wrap">
          <div className="card">
            <Calendar />
            <p className="tiny muted">{b.syncNote}</p>
          </div>
          <div className="stack">
            <Quote />
            <div className="card">
              <p className="eyebrow">Add to your stay</p>
              <Extras />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Calendar() {
  const { venue, engine, money, sel, setSel, view, setView, status, setStatus } = useSite();
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const wantFocus = useRef(false);
  const grid = useRef<HTMLDivElement>(null);

  // Keep the roving focus on the arrival day when a stay is loaded from elsewhere (state adjusted during render).
  const [prevA, setPrevA] = useState(sel.a);
  if (sel.a !== prevA) {
    setPrevA(sel.a);
    if (sel.a) setFocusKey(dateKey(sel.a));
  }

  useEffect(() => {
    if (wantFocus.current && focusKey) {
      (grid.current?.querySelector(`[data-k="${focusKey}"]`) as HTMLElement | null)?.focus();
      wantFocus.current = false;
    }
  });

  if (!engine || !view) {
    return (
      <>
        <div className="cal-head">
          <b>Loading the calendar…</b>
        </div>
        <p className="cal-status" id="calStatus" tabIndex={-1}>
          The live calendar needs JavaScript. You can also book by phone or email, below.
        </p>
      </>
    );
  }

  const T0 = engine.today;
  const firstMonth = new Date(T0.getFullYear(), T0.getMonth(), 1);
  const maxView = new Date(T0.getFullYear(), T0.getMonth() + venue.pricing.calendarMonths, 1);
  const y = view.getFullYear();
  const m = view.getMonth();
  const fk = focusKey && sameMonth(parseKey(focusKey), view) ? focusKey : dateKey(new Date(y, m, 1));

  const moveMonth = (n: number) => {
    const v = new Date(y, m + n, 1);
    if (v < firstMonth || v > maxView) return;
    setView(v);
  };

  function pick(k: string) {
    if (!engine) return;
    const d = parseKey(k);
    if (d < T0 || engine.isBooked(d)) {
      setStatus(engine.isBooked(d) ? `${fmtLong(d)} is already booked.` : 'That date has passed.', true);
      return;
    }
    setFocusKey(k);
    const { a, b } = sel;
    if (!a || b) {
      setSel({ a: d, b: null });
      setStatus(
        `Arriving ${fmtLong(d)}. ${
          engine.isGap(d) ? 'This is a gap-night deal: tap it again to book the single night at 20% off, or pick a departure.' : `Now pick your departure date (minimum ${engine.minNights(d)} nights).`
        }`,
      );
    } else if (d > a) {
      const n = nightsBetween(a, d);
      if (!engine.rangeClear(a, d)) {
        setSel({ a: d, b: null });
        setStatus(`Those dates cross a booking. Arrival moved to ${fmtLong(d)}. Pick a departure date.`, true);
      } else if (!engine.allowsStay(a, n)) {
        setStatus(`Minimum stay from ${fmtShort(a)} is ${engine.minNights(a)} nights. Pick a later departure.`, true);
      } else {
        setSel({ a, b: d });
        setStatus(`${n} nights, ${fmtShort(a)} to ${fmtShort(d)}. Your price is on the right.`);
      }
    } else if (d < a) {
      setSel({ a: d, b: null });
      setStatus(`Arrival moved to ${fmtLong(d)}. Now pick your departure date.`);
    } else if (engine.isGap(d)) {
      setSel({ a, b: addDays(d, 1) });
      setStatus(`Gap-night deal: ${fmtLong(d)}, one night at 20% off. Your price is on the right.`);
    } else {
      setSel({ a: null, b: null });
      setStatus('Selection cleared. Tap your arrival date.');
    }
  }

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let d = parseKey(fk);
    const dow = (d.getDay() + 6) % 7;
    if (e.key in map) d = addDays(d, map[e.key]);
    else if (e.key === 'Home') d = addDays(d, -dow);
    else if (e.key === 'End') d = addDays(d, 6 - dow);
    else if (e.key === 'PageUp') d = new Date(d.getFullYear(), d.getMonth() - 1, Math.min(d.getDate(), 28));
    else if (e.key === 'PageDown') d = new Date(d.getFullYear(), d.getMonth() + 1, Math.min(d.getDate(), 28));
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      wantFocus.current = true;
      pick(fk);
      return;
    } else return;
    e.preventDefault();
    const hi = new Date(maxView.getFullYear(), maxView.getMonth() + 1, 0);
    if (d < firstMonth || d > hi) return;
    wantFocus.current = true;
    setFocusKey(dateKey(d));
    if (!sameMonth(d, view)) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // Build weeks, Monday first.
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1))];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const title = view.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className="cal-head">
        <button className="btn ghost sm icon" type="button" aria-label="Previous month" disabled={view <= firstMonth} onClick={() => moveMonth(-1)}>
          ‹
        </button>
        <b id="calTitle" aria-live="polite">
          {title}
        </b>
        <button className="btn ghost sm icon" type="button" aria-label="Next month" disabled={view >= maxView} onClick={() => moveMonth(1)}>
          ›
        </button>
      </div>
      <div className="cal" role="grid" aria-labelledby="calTitle" ref={grid} onKeyDown={onKey}>
        <div role="row">
          {DAY_NAMES.map((n) => (
            <div className="h" role="columnheader" key={n}>
              <abbr title={n}>{n[0]}</abbr>
            </div>
          ))}
        </div>
        {weeks.map((wk, wi) => (
          <div role="row" key={wi}>
            {wk.map((dt, di) => {
              if (!dt) return <div role="gridcell" aria-hidden="true" key={di} />;
              const k = dateKey(dt);
              const past = dt < T0;
              const booked = engine.isBooked(dt);
              const isA = !!sel.a && k === dateKey(sel.a);
              const isB = !!sel.b && k === dateKey(sel.b);
              const inside = !!sel.a && !!sel.b && dt > sel.a && dt < sel.b;
              const gap = !booked && !past && engine.isGap(dt);
              const cls = ['d', past && 'off', booked && !past && 'booked', inside && 'in', (isA || isB) && 'edge', gap && 'gap'].filter(Boolean).join(' ');
              const price = money(engine.rate(dt));
              const label =
                fmtLong(dt) +
                (past ? ', past' : booked ? ', booked' : `, ${price} per night${gap ? ', gap-night deal' : ''}`) +
                (isA ? ', arrival' : isB ? ', departure' : inside ? ', in your stay' : '');
              return (
                <div role="gridcell" key={k} aria-selected={isA || isB || inside}>
                  <button type="button" className={cls} data-k={k} aria-label={label} aria-disabled={past || booked} tabIndex={k === fk ? 0 : -1} onClick={() => pick(k)} onFocus={() => setFocusKey(k)}>
                    {dt.getDate()}
                    <small aria-hidden="true">{booked || past ? '' : price}</small>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="cal-legend">
        <span>
          <i style={{ background: 'var(--card)' }} />
          Free
        </span>
        <span>
          <i style={{ background: 'var(--bg2)' }} />
          Booked
        </span>
        <span>
          <i style={{ background: 'var(--accent)' }} />
          Your stay
        </span>
        <span>
          <span className="mono" style={{ color: 'var(--accent)' }}>
            deal
          </span>{' '}
          = gap night, 20% off, bookable on its own
        </span>
      </p>
      <p className={`cal-status${status.err ? ' err' : ''}`} id="calStatus" tabIndex={-1} aria-live="polite">
        {status.msg}
      </p>
    </>
  );
}

function Quote() {
  const { venue, engine, money, sel, extras } = useSite();
  const [hold, setHold] = useState(false);
  const pr = venue.pricing;

  if (!engine || !sel.a || !sel.b) {
    const summerMin = Math.max(...Object.values(pr.minNights.byArrivalMonth).map((n) => n ?? 0), pr.minNights.default);
    return (
      <div className="card quote" aria-live="polite">
        <p className="eyebrow">Your stay</p>
        <h3>Select arrival and departure</h3>
        <p className="muted small" style={{ marginTop: 8 }}>
          Minimum {pr.minNights.default} nights{summerMin > pr.minNights.default ? ` (${summerMin} in summer)` : ''}. The price shown is the total. Nothing is added later.
        </p>
      </div>
    );
  }
  const extrasTotal = venue.extras.filter((x) => extras.has(x.id)).reduce((s, x) => s + x.price, 0);
  const q = engine.quote(sel.a, sel.b, extrasTotal);
  return (
    <div className="card quote" aria-live="polite">
      <p className="eyebrow">Your stay</p>
      <h3>
        {fmtShort(sel.a)} to {fmtShort(sel.b)} · {q.nights} night{q.nights > 1 ? 's' : ''}
      </h3>
      <div style={{ marginTop: 12 }} className="num">
        <div className="row">
          <span>Nights, incl. linen, cleaning, heating, Wi-Fi</span>
          <b>{money(q.sum)}</b>
        </div>
        {q.pct > 0 && (
          <div className="row">
            <span>{q.label}</span>
            <b>−{q.pct}% applied</b>
          </div>
        )}
        <div className="row">
          <span>Extras</span>
          <b>{money(q.extras)}</b>
        </div>
        <div className="row tot">
          <span>Total, all-in</span>
          <span>{money(q.total)}</span>
        </div>
      </div>
      <div className="save">
        Same dates on Airbnb ≈ <s>{money(q.ota)}</s>. <b>You keep {money(q.saving)}</b> by booking direct, and so do the owners.
      </div>
      <button className="btn accent" type="button" style={{ width: '100%', marginTop: 14 }} onClick={() => setHold(true)}>
        Hold these dates
      </button>
      <p className="tiny muted" style={{ marginTop: 8 }}>
        Free cancellation to 14 days before. Pay {pr.depositPct}% now ({money(q.deposit)}), the rest 4 weeks out.
      </p>
      <HoldDialog open={hold} onClose={() => setHold(false)} a={sel.a} b={sel.b} nights={q.nights} total={q.total} deposit={q.deposit} />
    </div>
  );
}

function HoldDialog({ open, onClose, a, b, nights, total, deposit }: { open: boolean; onClose: () => void; a: Date; b: Date; nights: number; total: number; deposit: number }) {
  const { venue, money, toast } = useSite();
  const [err, setErr] = useState('');
  const [bad, setBad] = useState<string | null>(null);
  const [done, setDone] = useState<null | { name: string; email: string; ref: string }>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDone(null);
      setErr('');
      setBad(null);
    }
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const fail = (field: string, m: string) => {
      setErr(m);
      setBad(field);
      (f.elements.namedItem(field) as HTMLElement | null)?.focus();
    };
    setBad(null);
    if (!name) return fail('name', 'Please tell us your name.');
    if (!EMAIL_RE.test(email)) return fail('email', 'That email address does not look right.');
    if (!fd.get('agree')) return fail('agree', 'Please agree to the cancellation terms to continue.');
    const ref = `${initials(venue.name)}-${dateKey(a).replace(/-/g, '').slice(2)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setDone({ name, email, ref });
    toast(`Dates held · ${ref}`);
  };

  return (
    <Dialog open={open} onClose={onClose} labelledBy="holdH">
      {!done ? (
        <form className="sheet" noValidate onSubmit={submit}>
          <div className="sheet-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>
                Hold these dates
              </p>
              <h3 id="holdH">Your stay</h3>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          <p className="small muted">
            {fmtShort(a)} to {fmtShort(b)} · {nights} nights · {money(total)} all-in · {money(deposit)} deposit now
          </p>
          <div className="stack" style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="hName">Name</label>
              <input id="hName" name="name" autoComplete="name" required aria-invalid={bad === 'name' || undefined} />
            </div>
            <div className="field">
              <label htmlFor="hEmail">Email</label>
              <input id="hEmail" name="email" type="email" autoComplete="email" required aria-invalid={bad === 'email' || undefined} />
            </div>
            <div className="field">
              <label htmlFor="hPhone">Mobile (for the door code, optional)</label>
              <input id="hPhone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="hMsg">Anything we should know? (optional)</label>
              <textarea id="hMsg" name="msg" placeholder="Arrival time, allergies, a birthday…" />
            </div>
            <label className="small check">
              <input type="checkbox" name="agree" /> {venue.booking.cancellation}
            </label>
            <p className="err" role="alert">
              {err}
            </p>
            <button className="btn accent" type="submit">
              Hold for 15 minutes and continue to payment
            </button>
            <p className="tiny muted">Demo: the payment step connects to {venue.integrations.payments?.provider ?? 'Stripe'} in production. No card is taken here.</p>
          </div>
        </form>
      ) : (
        <div className="sheet">
          <div className="sheet-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>
                Dates held
              </p>
              <h3 id="holdH">See you at {venue.name.replace(/^The /, 'the ')}.</h3>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <p>
              Thanks, <b>{done.name}</b>. {fmtShort(a)} to {fmtShort(b)} ({nights} nights) is held for 15 minutes under reference <span className="mono">{done.ref}</span>.
            </p>
            <p>
              Total {money(total)} all-in. Deposit due now: {money(deposit)}. A confirmation goes to <b>{done.email}</b>.
            </p>
            <p className="tiny muted">Demo: in production the payment step opens Stripe and the calendar is blocked on every channel.</p>
          </div>
          <button className="btn" type="button" style={{ marginTop: 16 }} onClick={onClose} autoFocus>
            Done
          </button>
        </div>
      )}
    </Dialog>
  );
}

function Extras() {
  const { venue, money, extras, toggleExtra } = useSite();
  return (
    <div>
      {venue.extras.map((x) => (
        <label className="xtra" htmlFor={`x-${x.id}`} key={x.id}>
          <span className="ico" aria-hidden="true">
            {x.icon}
          </span>
          <span>
            <b>{x.name}</b>
            <small>
              {x.detail} · {x.price ? money(x.price) : 'included'}
            </small>
          </span>
          <input type="checkbox" id={`x-${x.id}`} checked={extras.has(x.id)} onChange={(e) => toggleExtra(x.id, e.target.checked)} />
        </label>
      ))}
    </div>
  );
}
