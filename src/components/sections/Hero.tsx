'use client';

import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext';
import { Photo } from '../Photo';
import { addDays, fmtShort } from '@/lib/dates';

const ICO_PAUSE = <path d="M7 5h4v14H7zM13 5h4v14h-4z" />;
const ICO_PLAY = <path d="M8 5v14l11-7z" />;

export function Hero() {
  const { venue, engine, reduced } = useSite();
  const h = venue.hero;
  const n = h.slides.length;
  const [i, setI] = useState(0);
  // null = follow the system: play unless reduced motion is on. The button lets the visitor choose either way.
  const [choice, setChoice] = useState<boolean | null>(null);
  const [msgI, setMsgI] = useState(0);

  // Slideshow: stops for reduced motion, a hidden tab, or the pause button.
  const playing = choice ?? !reduced;
  useEffect(() => {
    if (!playing || n < 2) return;
    let t: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(t);
      if (!document.hidden) t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    };
    start();
    document.addEventListener('visibilitychange', start);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', start);
    };
  }, [playing, n]);

  const weekend = engine?.nextFreeWeekend();
  const msgs = engine ? [...(weekend ? [`Next free weekend: ${fmtShort(weekend)} – ${fmtShort(addDays(weekend, 2))}`] : []), ...h.liveMessages] : ['Checking the calendar…'];
  useEffect(() => {
    if (reduced || msgs.length < 2) return;
    const t = setInterval(() => setMsgI((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, [reduced, msgs.length]);

  return (
    <section className="hero" id="top" aria-labelledby="h1">
      <div className="slides">
        {h.slides.map((s, j) => (
          <Photo key={j} venue={venue} refd={s} fill sizes="100vw" priority={j === 0} className={j === i ? 'on' : ''} aria-hidden={j !== i} />
        ))}
      </div>
      <div className="wrap">
        <p className="live">
          <i aria-hidden="true" /> <span>{msgs[msgI % msgs.length]}</span>
        </p>
        <h1 id="h1">
          {h.titleBefore}
          <em>{h.titleEm}</em>
          {h.titleAfter}
        </h1>
        <p className="sub">{h.sub}</p>
        <div className="actions">
          <a className="btn" href="#book">
            {h.primaryCta}
          </a>
          <a className="btn ghost" href="#house">
            {h.secondaryCta}
          </a>
        </div>
        <dl className="stats">
          {h.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <b>{s.value}</b>
                <span>{s.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {n > 1 && (
        <div className="hero-ctl" role="group" aria-label="Hero slideshow">
          <button type="button" aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setChoice(!playing)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? ICO_PAUSE : ICO_PLAY}
            </svg>
          </button>
          {h.slides.map((_, j) => (
            <button key={j} type="button" className="dot" aria-label={`Photo ${j + 1} of ${n}`} aria-current={j === i} onClick={() => setI(j)}>
              <i />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
