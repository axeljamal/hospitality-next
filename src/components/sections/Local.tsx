'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSite } from '../SiteContext';
import { Photo } from '../Photo';
import { EMAIL_RE } from '@/lib/store';

export function Local() {
  const { venue, toast } = useSite();
  const l = venue.local;
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setMsg({ text: 'Enter a valid email address to join.', ok: false });
      input.current?.focus();
      return;
    }
    setMsg({ text: 'You are on the list. Welcome back soon.', ok: true });
    toast('Joined the returning guests club');
    setEmail('');
  };

  return (
    <section id="local" aria-labelledby="localH">
      <div className="wrap">
        <p className="eyebrow">{l.eyebrow}</p>
        <h2 id="localH">{l.title}</h2>
        <ul className="loc" style={{ listStyle: 'none', padding: 0 }}>
          {l.places.map((p) => (
            <li className="card" key={p.name}>
              <div className="e" aria-hidden="true">
                {p.icon}
              </div>
              <b>{p.name}</b>
              <p className="small muted" style={{ margin: '4px 0' }}>
                {p.detail}
              </p>
              <span className="mono tiny" style={{ color: 'var(--accent)' }}>
                {p.walk} walk
              </span>
            </li>
          ))}
        </ul>
        <div className="card where">
          <Photo venue={venue} refd={l.map.photo} sizes="300px" loading="lazy" />
          <div>
            <p className="eyebrow">{l.map.eyebrow}</p>
            <h3>{l.map.title}</h3>
            <p className="small muted" style={{ marginTop: 8 }}>
              {l.map.text}
            </p>
            <a className="btn ghost sm" href={l.map.url} target="_blank" rel="noopener" style={{ marginTop: 12 }}>
              Open in Maps ↗<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="grid g3" style={{ marginTop: 18 }}>
          <div className="card">
            <p className="eyebrow">Today</p>
            <b className="serif" style={{ fontSize: '1.5rem' }}>
              {l.today.title}
            </b>
            <p className="small muted" style={{ marginTop: 6 }}>
              {l.today.text}
            </p>
            <p className="tiny muted" style={{ marginTop: 6 }}>
              {l.today.note}
            </p>
          </div>
          <div className="card">
            <p className="eyebrow">Getting around</p>
            <p className="small">{l.gettingAround.text}</p>
            <a href={l.gettingAround.url} className="mono small" style={{ display: 'inline-block', marginTop: 8 }} target="_blank" rel="noopener">
              Open map ↗<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <form className="card" noValidate onSubmit={join}>
            <p className="eyebrow">{l.club.title}</p>
            <p className="small">{l.club.text}</p>
            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="clubEmail">Email</label>
              <input ref={input} type="email" id="clubEmail" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={(msg && !msg.ok) || undefined} />
            </div>
            <p className={msg?.ok ? 'err ok' : 'err'} role="alert">
              {msg?.text}
            </p>
            <button className="btn ghost sm" type="submit" style={{ marginTop: 10 }}>
              Join the club
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
