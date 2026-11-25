'use client';

import { useState, type FormEvent } from 'react';
import { useSite } from '../SiteContext';
import { answerFromNotes } from '@/lib/notes';

export function Guide() {
  const { venue, engine, money } = useSite();
  const g = venue.guide;
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<{ q: string; a: string } | null>(null);

  const ask = (question: string) => {
    const t = question.trim();
    if (!t) return;
    setAnswer({ q: t, a: answerFromNotes(venue, t, engine, money) });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
    setQ('');
  };

  return (
    <section id="guide" className="band" aria-labelledby="guideH">
      <div className="wrap">
        <div className="grid g2">
          <div>
            <p className="eyebrow">{g.eyebrow}</p>
            <h2 id="guideH">{g.title}</h2>
            <p className="lede">{g.lede}</p>
            <form className="ask" onSubmit={submit} role="search" aria-label="Search the house notes">
              <div className="field">
                <label className="sr-only" htmlFor="askIn">
                  Your question
                </label>
                <input type="search" id="askIn" placeholder={g.placeholder} autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <button className="btn" type="submit">
                Ask
              </button>
            </form>
            <div className="chips">
              {g.notes.slice(0, 7).map((n) => (
                <button key={n.topic} type="button" className="chip" onClick={() => ask(n.topic)}>
                  {n.topic}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {answer && (
                <div className="ans">
                  <p className="small muted" style={{ marginBottom: 6 }}>
                    You asked: {answer.q}
                  </p>
                  {answer.a}
                </div>
              )}
            </div>
            <p className="small muted" style={{ marginTop: 14 }}>
              {g.note}
            </p>
          </div>
          <div className="card">
            <p className="eyebrow">Your arrival, step by step</p>
            <div className="faq">
              {g.arrival.map((s, i) => (
                <details key={s.title} open={i === 0}>
                  <summary>{s.title}</summary>
                  <p>{s.text}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
