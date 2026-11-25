'use client';

import { useMemo, useRef, useState } from 'react';
import { useSite } from '../SiteContext';

const ts = (t: number) => {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(3).padStart(6, '0');
  return `${String(m).padStart(2, '0')}:${s}`;
};

/** Short silent house film with room-name captions built from the content file. Hidden if the venue has no film. */
export function Film() {
  const { venue } = useSite();
  const f = venue.film;
  const v = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // Captions are built from the content file's cues as a data: URL, so there is no separate .vtt to keep in sync.
  const vtt = useMemo(() => {
    const text = `WEBVTT\n\n${f.cues.map(([a, b, c]) => `${ts(a)} --> ${ts(b)}\n${c}`).join('\n\n')}\n`;
    return `data:text/vtt;charset=utf-8,${encodeURIComponent(text)}`;
  }, [f.cues]);

  if (!f.src) return null;
  const poster = venue.photos[f.poster]?.src;

  return (
    <section id="film" aria-labelledby="filmH">
      <div className="wrap">
        <p className="eyebrow">{f.eyebrow}</p>
        <h2 id="filmH">{f.title}</h2>
        <p className="lede">{f.lede}</p>
        <div className="film">
          <video
            ref={v}
            poster={poster}
            preload="metadata"
            playsInline
            controls
            loop
            muted
            aria-label={f.label}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          >
            <source src={f.src} type="video/mp4" onError={() => setFailed(true)} />
            <track kind="captions" srcLang="en" label="Room names" src={vtt} default />
          </video>
          {!playing && !failed && (
            <button
              className="film-play"
              type="button"
              aria-label="Play the house film"
              onClick={() =>
                v.current
                  ?.play()
                  .then(() => v.current?.focus())
                  .catch(() => {})
              }
            >
              <span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
          {failed && (
            <div className="film-fallback">
              <p>The film is still rendering. The photos show every room meanwhile.</p>
            </div>
          )}
        </div>
        <p className="film-notes muted" aria-label="Rooms shown, in order">
          {f.cues.map(([, , c]) => (
            <span key={c}>{c}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
