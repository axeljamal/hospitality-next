import type { Venue } from '@/venues/types';

const ICONS = {
  star: <path d="M12 2l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6L12 14.7l-5 2.7 1.1-5.6L4 7.9l5.6-.7z" />,
  card: (
    <>
      <path d="M20 12.5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
      <path d="M4 10h16M9 15h3" />
      <path d="M16 19l2 2 4-4" />
    </>
  ),
  repeat: (
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
};

export function Perks({ venue }: { venue: Venue }) {
  return (
    <div className="perks wrap">
      <div className="card" role="region" aria-label="Why book direct">
        {venue.perks.map((p) => (
          <div className="perk" key={p.title}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              {ICONS[p.icon]}
            </svg>
            <div>
              <b>{p.title}</b>
              <span>{p.text}</span>
            </div>
          </div>
        ))}
        <a className="btn accent" href="#book">
          Book direct
        </a>
      </div>
    </div>
  );
}
