'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSite } from '../SiteContext';
import { Photo } from '../Photo';
import { EMAIL_RE } from '@/lib/store';

export function Follow() {
  const { venue, toast } = useSite();
  const f = venue.follow;
  const [err, setErr] = useState('');
  const [bad, setBad] = useState(false);
  const [done, setDone] = useState<null | { name: string; email: string }>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const name = String(fd.get('name') || '').trim();
    setBad(false);
    if (!EMAIL_RE.test(email)) {
      setErr('Enter a valid email address.');
      setBad(true);
      (e.currentTarget.elements.namedItem('email') as HTMLElement | null)?.focus();
      return;
    }
    if (!fd.get('agree')) {
      setErr('Tick the box so we know you want the letters.');
      (e.currentTarget.elements.namedItem('agree') as HTMLElement | null)?.focus();
      return;
    }
    setErr('');
    setDone({ name, email });
    toast('Nearly there. Check your inbox.');
    setTimeout(() => doneRef.current?.focus(), 0);
  };

  return (
    <section id="follow" aria-labelledby="followH">
      <div className="wrap">
        <p className="eyebrow">{f.eyebrow}</p>
        <h2 id="followH">{f.title}</h2>
        <div className="follow">
          <div>
            <div className="ig-head">
              <p className="small">
                <b>{f.instagram.handle}</b> <span className="muted">on Instagram</span>
              </p>
              <a className="btn ghost sm" href={f.instagram.url} target="_blank" rel="noopener">
                Follow ↗<span className="sr-only"> (opens Instagram in a new tab)</span>
              </a>
            </div>
            <div className="ig">
              {f.instagram.posts.map((p) => (
                <a key={p.caption} href={f.instagram.url} target="_blank" rel="noopener" aria-label={`${p.caption}, opens Instagram in a new tab`}>
                  <Photo venue={venue} refd={p} fill sizes="(max-width: 480px) 50vw, 220px" loading="lazy" />
                  <span aria-hidden="true">{p.caption}</span>
                </a>
              ))}
            </div>
          </div>
          {done ? (
            <div className="card" tabIndex={-1} ref={doneRef}>
              <p className="eyebrow">Newsletter</p>
              <h3>Thanks{done.name ? `, ${done.name}` : ''}. One more step.</h3>
              <p className="small muted" style={{ marginTop: 8 }}>
                We have sent a confirmation to <b>{done.email}</b>. Tap the link in it and the first letter arrives with the next season.
              </p>
              <p className="tiny muted" style={{ marginTop: 12 }}>
                Demo: no email is sent from this preview.
              </p>
            </div>
          ) : (
            <form className="card" noValidate onSubmit={submit}>
              <p className="eyebrow">Newsletter</p>
              <h3>{f.newsletter.title}</h3>
              <p className="small muted" style={{ marginTop: 8 }}>
                {f.newsletter.text}
              </p>
              <div className="field" style={{ marginTop: 14 }}>
                <label htmlFor="nName">First name (optional)</label>
                <input id="nName" name="name" autoComplete="given-name" />
              </div>
              <div className="field" style={{ marginTop: 10 }}>
                <label htmlFor="nEmail">Email</label>
                <input id="nEmail" name="email" type="email" autoComplete="email" required aria-invalid={bad || undefined} />
              </div>
              <label className="small check" style={{ marginTop: 12 }}>
                <input type="checkbox" name="agree" /> Yes, email me the letters. Unsubscribe in one tap, any time.
              </label>
              <p className="err" role="alert">
                {err}
              </p>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>
                Sign me up
              </button>
              <p className="tiny muted" style={{ marginTop: 10 }}>
                {f.newsletter.note}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
