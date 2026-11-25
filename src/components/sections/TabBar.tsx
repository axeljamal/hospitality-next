'use client';

import { useEffect, useState } from 'react';

const TABS = [
  { sec: 'top', label: 'Home', icon: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { sec: 'house', label: 'House', icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M21 15l-5-5-8 8" /></> },
  { sec: 'book', label: 'Book', icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></> },
  { sec: 'guide', label: 'Guide', icon: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 17h0" /></> },
  { sec: 'local', label: 'Local', icon: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></> },
];

/** Which tab lights up for each section. */
const TAB_FOR: Record<string, string> = { top: 'top', house: 'house', film: 'house', gallery: 'house', seasons: 'house', offers: 'book', book: 'book', guide: 'guide', local: 'local', reviews: 'local', follow: 'local' };

/** Phone tab bar, plus section tracking for the desktop nav (aria-current on the link for the section in view). */
export function TabBar() {
  const [current, setCurrent] = useState('top');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const en of es) {
          if (!en.isIntersecting) continue;
          const id = en.target.id;
          setCurrent(id);
          document.querySelectorAll<HTMLAnchorElement>('.top nav a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.nav === id)));
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    Object.keys(TAB_FOR).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav className="tabbar" aria-label="Quick navigation">
      {TABS.map((t) => (
        <a key={t.sec} href={`#${t.sec}`} aria-current={TAB_FOR[current] === t.sec}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            {t.icon}
          </svg>
          {t.label}
        </a>
      ))}
    </nav>
  );
}
