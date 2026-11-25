'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSite } from '../SiteContext';
import { Dialog, CloseButton } from '../Dialog';
import { EMAIL_RE, initials } from '@/lib/store';
import { fmtShort } from '@/lib/dates';

export function Offers() {
  const { venue, engine, money, loadStay, toast } = useSite();
  const o = venue.offers;

  const apply = (id: string) => {
    const offer = o.items.find((x) => x.id === id);
    if (!offer || !engine) return;
    const r = engine.findOffer(offer.find);
    if (!r) return toast('No matching free dates in the next year.');
    const q = engine.quoteRange(r[0], r[1]);
    loadStay(
      r[0],
      r[1],
      `${q.nights} night${q.nights > 1 ? 's' : ''} from ${fmtShort(r[0])}, loaded from the offer${q.pct ? ` with ${q.pct}% off` : ''}. Change the dates if you like.`,
      `Dates loaded: ${fmtShort(r[0])} to ${fmtShort(r[1])}`,
    );
  };

  return (
    <section id="offers" aria-labelledby="offersH" style={{ background: 'var(--accent-soft)' }}>
      <div className="wrap">
        <p className="eyebrow">{o.eyebrow}</p>
        <h2 id="offersH">{o.title}</h2>
        <p className="lede">{o.lede}</p>
        <div className="offers">
          {o.items.map((x) => (
            <article className="card offer" key={x.id}>
              <p className="eyebrow">{x.when}</p>
              <h3>{x.title}</h3>
              <p className="small muted">{x.text}</p>
              <p className="price">
                <b>from {money(Math.round(venue.pricing.base.low * x.from.nights * (1 - x.from.discountPct / 100)))}</b>
                <span>{x.unit}, all-in</span>
              </p>
              <button className="btn ghost sm" type="button" onClick={() => apply(x.id)} disabled={!engine}>
                {x.cta}
              </button>
            </article>
          ))}
        </div>
        <Voucher />
      </div>
    </section>
  );
}

function Voucher() {
  const { venue, engine, toast } = useSite();
  const vo = venue.offers.voucher;
  const base = venue.currencies[0].symbol;
  const [choice, setChoice] = useState<string>(String(vo.defaultAmount));
  const [other, setOther] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<null | { code: string; to: string; from: string; email: string; msg: string; until: string }>(null);
  const [dErr, setDErr] = useState('');
  const [bad, setBad] = useState<string | null>(null);
  const otherRef = useRef<HTMLInputElement>(null);
  const amount = choice === 'other' ? Number(other) || 0 : Number(choice);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!(amount >= vo.min && amount <= vo.max)) {
      setErr(`Choose an amount between ${base}${vo.min} and ${base}${vo.max.toLocaleString('en-GB')}.`);
      setChoice('other');
      setTimeout(() => otherRef.current?.focus(), 0);
      return;
    }
    setDone(null);
    setDErr('');
    setOpen(true);
  };

  const details = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const to = String(fd.get('to') || '').trim();
    const from = String(fd.get('from') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const msg = String(fd.get('msg') || '').trim();
    const fail = (field: string, m: string) => {
      setDErr(m);
      setBad(field);
      (e.currentTarget.elements.namedItem(field) as HTMLElement | null)?.focus();
    };
    setBad(null);
    if (!to) return fail('to', 'Tell us who the voucher is for.');
    if (!from) return fail('from', 'Tell us who it is from.');
    if (!EMAIL_RE.test(email)) return fail('email', 'That email address does not look right.');
    const code = `${initials(venue.name)}V-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const t = engine?.today ?? new Date();
    const until = new Date(t.getFullYear(), t.getMonth() + vo.validMonths, t.getDate()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    setDone({ code, to, from, email, msg, until });
    toast(`Voucher ${code} ready`);
  };

  return (
    <div className="card voucher">
      <div>
        <p className="eyebrow">Gift voucher</p>
        <h3>{vo.title}</h3>
        <p className="small muted" style={{ marginTop: 8 }}>
          {vo.text}
        </p>
      </div>
      <form className="vform" noValidate onSubmit={submit}>
        <fieldset className="amounts">
          <legend className="lbl">Amount</legend>
          {[...vo.amounts.map(String), 'other'].map((a) => (
            <label key={a} className={`amt${choice === a ? ' on' : ''}`}>
              <input type="radio" name="amt" value={a} checked={choice === a} onChange={() => setChoice(a)} />
              {a === 'other' ? 'Other' : `${base}${a}`}
            </label>
          ))}
          <label className="sr-only" htmlFor="vOther">
            Other amount in {venue.currencies[0].code}
          </label>
          <input
            ref={otherRef}
            className="other"
            id="vOther"
            type="number"
            inputMode="numeric"
            min={vo.min}
            max={vo.max}
            step={5}
            placeholder={`${base} other`}
            hidden={choice !== 'other'}
            value={other}
            onChange={(e) => setOther(e.target.value)}
          />
        </fieldset>
        <p className="err" role="alert">
          {err}
        </p>
        <button className="btn accent" type="submit">
          Buy a voucher
        </button>
      </form>

      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="vH">
        {!done ? (
          <form className="sheet" noValidate onSubmit={details}>
            <div className="sheet-head">
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>
                  Gift voucher
                </p>
                <h3 id="vH">Who is it for?</h3>
              </div>
              <CloseButton onClick={() => setOpen(false)} />
            </div>
            <p className="small muted">
              A {base}
              {amount.toLocaleString('en-GB')} voucher, valid {vo.validMonths} months, for any direct stay or extra.
            </p>
            <div className="stack" style={{ marginTop: 16 }}>
              <div className="field">
                <label htmlFor="vTo">Their name</label>
                <input id="vTo" name="to" required aria-invalid={bad === 'to' || undefined} />
              </div>
              <div className="field">
                <label htmlFor="vFrom">From</label>
                <input id="vFrom" name="from" required autoComplete="name" aria-invalid={bad === 'from' || undefined} />
              </div>
              <div className="field">
                <label htmlFor="vMsg">Message on the card (optional, 200 characters)</label>
                <textarea id="vMsg" name="msg" maxLength={200} />
              </div>
              <div className="field">
                <label htmlFor="vEmail">Send the voucher to</label>
                <input id="vEmail" name="email" type="email" required autoComplete="email" placeholder="their email, or yours to print" aria-invalid={bad === 'email' || undefined} />
              </div>
              <p className="err" role="alert">
                {dErr}
              </p>
              <button className="btn accent" type="submit">
                Continue to payment
              </button>
              <p className="tiny muted">Demo: payment connects to {venue.integrations.payments?.provider ?? 'Stripe'} in production. No card is taken here.</p>
            </div>
          </form>
        ) : (
          <div className="sheet">
            <div className="sheet-head">
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>
                  Gift voucher
                </p>
                <h3 id="vH">On its way.</h3>
              </div>
              <CloseButton onClick={() => setOpen(false)} />
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <p>
                A{' '}
                <b>
                  {base}
                  {amount.toLocaleString('en-GB')}
                </b>{' '}
                voucher for <b>{done.to}</b>, from {done.from}, will be emailed to <b>{done.email}</b> once payment clears.
              </p>
              <p>
                Voucher code <span className="mono">{done.code}</span>. Valid until {done.until}. Redeem it in the &ldquo;Hold these dates&rdquo; step or by replying to the voucher email.
              </p>
              {done.msg && <p className="small muted">Card message: &ldquo;{done.msg}&rdquo;</p>}
              <p className="tiny muted">Demo: in production the payment step opens Stripe and the voucher is issued automatically.</p>
            </div>
            <button className="btn" type="button" style={{ marginTop: 16 }} onClick={() => setOpen(false)} autoFocus>
              Done
            </button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
