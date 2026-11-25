'use client';

import { useState } from 'react';
import { useSite } from '../SiteContext';
import { Dialog, CloseButton } from '../Dialog';
import { store } from '@/lib/store';
import { useHydrated } from '@/lib/hooks';

const SUN = 'M12 4V2M12 22v-2M4.9 4.9L3.5 3.5M20.5 20.5l-1.4-1.4M2 12H4M20 12h2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z';
const MOON = 'M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4A5.5 5.5 0 0 1 13.4 3.1C13 3 12.5 3 12 3z';
const AUTO = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 2v14a7 7 0 0 1 0-14z';
const ORDER = ['auto', 'light', 'dark'] as const;
type Theme = (typeof ORDER)[number];
const LABEL: Record<Theme, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' };

/** Shared with the no-flash script in app/layout.tsx. */
export const THEME_KEY = 'theme';

export function Header() {
  const { venue, currency, setCurrency } = useSite();
  const hydrated = useHydrated();
  const [chosen, setTheme] = useState<Theme | null>(null);
  const saved = hydrated ? store.get(THEME_KEY) : null;
  const theme: Theme = chosen ?? (saved === 'light' || saved === 'dark' ? saved : 'auto');
  const [menu, setMenu] = useState(false);

  const cycle = () => {
    const t = ORDER[(ORDER.indexOf(theme) + 1) % 3];
    setTheme(t);
    const root = document.documentElement;
    if (t === 'auto') {
      root.removeAttribute('data-theme');
      store.del(THEME_KEY);
    } else {
      root.dataset.theme = t;
      store.set(THEME_KEY, t);
    }
  };
  const next = ORDER[(ORDER.indexOf(theme) + 1) % 3];

  return (
    <>
      <header className="top">
        <div className="wrap">
          <a className="brand" href="#top">
            {venue.name}
            <small>{venue.tagline}</small>
          </a>
          <nav aria-label="Sections">
            <ul>
              {venue.nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} data-nav={n.href.slice(1)}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="tools">
            {venue.currencies.length > 1 && (
              <>
                <label className="sr-only" htmlFor="cur">
                  Currency
                </label>
                <select id="cur" value={currency.code} onChange={(e) => setCurrency(e.target.value)}>
                  {venue.currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button className="theme" type="button" onClick={cycle} aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[next]}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={theme === 'light' ? SUN : theme === 'dark' ? MOON : AUTO} />
              </svg>
              <span>{LABEL[theme]}</span>
            </button>
            <a className="btn sm cta" href="#book">
              Check dates
            </a>
            <button className="btn sm ghost icon menu-btn" type="button" aria-label="Open menu" aria-haspopup="dialog" onClick={() => setMenu(true)}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <Dialog open={menu} onClose={() => setMenu(false)} label="Menu">
        <div className="sheet menu">
          <div className="sheet-head">
            <b className="serif" style={{ fontSize: '1.3rem' }}>
              {venue.name}
            </b>
            <CloseButton onClick={() => setMenu(false)} label="Close menu" />
          </div>
          <ul>
            {venue.menu.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setMenu(false)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <button className="theme" type="button" onClick={cycle}>
            Theme: {LABEL[theme]} (tap for {LABEL[next]})
          </button>
        </div>
      </Dialog>
    </>
  );
}
