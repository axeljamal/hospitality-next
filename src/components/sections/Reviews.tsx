import type { Venue } from '@/venues/types';

export function Reviews({ venue }: { venue: Venue }) {
  const r = venue.reviews;
  return (
    <section id="reviews" className="band" aria-labelledby="revH">
      <div className="wrap">
        <p className="eyebrow">{r.eyebrow}</p>
        <h2 id="revH">{r.title}</h2>
        <div className="grid g3" style={{ marginTop: 24 }}>
          {r.items.map((x) => (
            <figure className="card rev" key={x.author + x.date}>
              <span className="v">{x.badge}</span>
              <div className="stars" role="img" aria-label={`${x.rating} out of 5 stars`}>
                {'★'.repeat(x.rating)}
              </div>
              <blockquote style={{ margin: 0 }}>
                <p>&ldquo;{x.text}&rdquo;</p>
              </blockquote>
              <figcaption className="who">{[x.author, x.from, x.note].filter(Boolean).join(' · ')}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
