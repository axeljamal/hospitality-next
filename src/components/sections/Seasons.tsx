'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useHydrated } from '@/lib/hooks';
import { useSite } from '../SiteContext';
import { Carousel } from '../Carousel';

export function Seasons() {
  const { venue } = useSite();
  const items = venue.seasons.items;
  // Opens on the visitor's current season once hydrated, so the static HTML is the same for everyone.
  const hydrated = useHydrated();
  const [picked, setSea] = useState<number | null>(null);
  const nowIdx = hydrated ? Math.max(0, items.findIndex((s) => s.months.includes(new Date().getMonth()))) : 0;
  const sea = picked ?? nowIdx;
  const focus = useRef(false);

  useEffect(() => {
    if (focus.current) {
      document.getElementById(`seaTab${sea}`)?.focus();
      focus.current = false;
    }
  }, [sea]);

  const onKey = (e: KeyboardEvent) => {
    const n = items.length;
    const map: Record<string, number> = { ArrowRight: (sea + 1) % n, ArrowLeft: (sea - 1 + n) % n, Home: 0, End: n - 1 };
    if (e.key in map) {
      e.preventDefault();
      focus.current = true;
      setSea(map[e.key]);
    }
  };

  const s = items[sea];
  return (
    <section id="seasons" className="band" aria-labelledby="seaH">
      <div className="wrap">
        <p className="eyebrow">{venue.seasons.eyebrow}</p>
        <h2 id="seaH">{venue.seasons.title}</h2>
        <div className="tabs" role="tablist" aria-label="Seasons" onKeyDown={onKey}>
          {items.map((x, i) => (
            <button key={x.name} role="tab" type="button" id={`seaTab${i}`} aria-selected={i === sea} aria-controls="seasonBody" tabIndex={i === sea ? 0 : -1} onClick={() => setSea(i)}>
              {x.name}
            </button>
          ))}
        </div>
        <div className="season" id="seasonBody" role="tabpanel" aria-labelledby={`seaTab${sea}`}>
          <Carousel key={s.name} slides={s.photos} label={`${s.name} photos`} mini />
          <div>
            <h3>{s.title}</h3>
            <p style={{ marginTop: 12 }}>{s.text}</p>
            <div className="chips">
              {s.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <a className="btn" href="#book" style={{ marginTop: 16 }}>
              See {s.name.toLowerCase()} dates
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
