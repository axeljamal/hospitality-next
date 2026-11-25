'use client';

import { useRef, useState } from 'react';
import { useSite } from '../SiteContext';
import { Carousel, type CarouselHandle } from '../Carousel';
import { Dialog } from '../Dialog';
import { Photo } from '../Photo';

export function Gallery() {
  const { venue } = useSite();
  const g = venue.gallery;
  const n = g.photos.length;
  const car = useRef<CarouselHandle>(null);
  const [lb, setLb] = useState<number | null>(null);
  const shown = lb ?? 0;
  const step = (d: number) => setLb((i) => ((i ?? 0) + d + n) % n);

  return (
    <section id="gallery" aria-labelledby="galH">
      <div className="wrap">
        <p className="eyebrow">{g.eyebrow}</p>
        <h2 id="galH">{g.title}</h2>
        <p className="lede">{g.lede}</p>
        <Carousel ref={car} slides={g.photos} label="House photos" onZoom={(i) => setLb(i)} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button className="btn ghost" type="button" onClick={() => setLb(car.current?.index ?? 0)}>
            View all {n} photos
          </button>
        </div>
      </div>

      <Dialog
        open={lb !== null}
        onClose={() => {
          car.current?.go(shown);
          setLb(null);
        }}
        label="Photo viewer"
      >
        <div
          className="lb-box"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              step(-1);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              step(1);
            }
          }}
        >
          <Photo venue={venue} refd={g.photos[shown]} sizes="96vw" />
          <div className="lb-cap">
            <span>{g.photos[shown].caption}</span>
            <span className="mono tiny" aria-live="polite">
              {shown + 1} / {n}
            </span>
          </div>
          <div className="lb-ctl">
            <button className="btn sm" type="button" aria-label="Previous photo" onClick={() => step(-1)}>
              ‹ Prev
            </button>
            <button className="btn sm" type="button" onClick={(e) => (e.currentTarget.closest('dialog') as HTMLDialogElement | null)?.close()}>
              Close
            </button>
            <button className="btn sm" type="button" aria-label="Next photo" onClick={() => step(1)}>
              Next ›
            </button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
