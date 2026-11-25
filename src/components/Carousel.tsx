'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState, type KeyboardEvent } from 'react';
import type { PhotoRef } from '@/venues/types';
import { useSite } from './SiteContext';
import { Photo } from './Photo';

export interface CarouselHandle {
  go: (n: number) => void;
  index: number;
}

/**
 * One photo per view: native scroll-snap for swipe, arrow buttons, dots and a counter.
 * Keyboard: focus the track, then Left/Right, Home/End.
 */
export const Carousel = forwardRef<CarouselHandle, { slides: PhotoRef[]; label: string; mini?: boolean; onZoom?: (i: number) => void }>(function Carousel(
  { slides, label, mini, onZoom },
  ref,
) {
  const { venue, reduced } = useSite();
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const raf = useRef(0);
  const n = slides.length;

  const go = useCallback(
    (to: number) => {
      const i = (to + n) % n;
      setIdx(i);
      const t = track.current;
      const el = t?.children[i] as HTMLElement | undefined;
      if (t && el) t.scrollTo({ left: el.offsetLeft - t.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    },
    [n, reduced],
  );
  useImperativeHandle(ref, () => ({ go, index: idx }), [go, idx]);

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const t = track.current;
      if (!t) return;
      const i = Math.round(t.scrollLeft / (t.clientWidth + 12));
      if (i >= 0 && i < n) setIdx(i);
    });
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: idx + 1, ArrowLeft: idx - 1, Home: 0, End: n - 1 };
    if (e.key in map) {
      e.preventDefault();
      go(map[e.key]);
    }
  };

  return (
    <div className={`car${mini ? ' mini' : ''}`} role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="car-track" ref={track} tabIndex={0} onScroll={onScroll} onKeyDown={onKey} aria-label={`${label}, use the arrow keys to move between photos`}>
        {slides.map((s, i) => (
          <figure className="car-slide" key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}${s.caption ? `: ${s.caption}` : ''}`}>
            <Photo venue={venue} refd={s} fill sizes="(max-width: 1120px) 100vw, 1100px" draggable={false} loading={i ? 'lazy' : undefined} />
            {onZoom && <button type="button" className="zoom" aria-label={`Open photo ${i + 1} full size`} onClick={() => onZoom(i)} tabIndex={i === idx ? 0 : -1} />}
            {s.caption && <figcaption aria-hidden="true">{s.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="car-ctl">
        <button type="button" className="btn ghost sm icon" aria-label="Previous photo" onClick={() => go(idx - 1)}>
          ‹
        </button>
        <div className="car-dots">
          {slides.map((_, i) => (
            <button key={i} type="button" aria-label={`Go to photo ${i + 1}`} aria-current={i === idx} onClick={() => go(i)}>
              <i />
            </button>
          ))}
        </div>
        <span className="car-count num" aria-live="polite">
          {idx + 1} / {n}
        </span>
        <button type="button" className="btn ghost sm icon" aria-label="Next photo" onClick={() => go(idx + 1)}>
          ›
        </button>
      </div>
    </div>
  );
});
