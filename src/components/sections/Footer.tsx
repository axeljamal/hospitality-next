'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../SiteContext';
import { Dialog, CloseButton } from '../Dialog';
import { store } from '@/lib/store';
import { useHydrated } from '@/lib/hooks';

type Consent = { analytics: boolean; marketing: boolean; at?: string };

export function Footer() {
  const { venue, toast } = useSite();
  const [a11y, setA11y] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [more, setMore] = useState(false);
  const key = `${venue.slug}-consent`;
  const hydrated = useHydrated();
  const saved = useMemo<Consent | null>(() => {
    if (!hydrated) return null;
    try {
      const v = JSON.parse(store.get(key) || 'null');
      return v && typeof v === 'object' ? v : null;
    } catch {
      return null;
    }
  }, [hydrated, key]);
  const [edited, setC] = useState<Consent | null>(null);
  const c = edited ?? saved ?? { analytics: false, marketing: false };

  // First visit: show the choices shortly after load. Returning visitors: apply what they chose.
  useEffect(() => {
    if (!hydrated) return;
    if (saved) {
      applyConsent(saved);
      return;
    }
    const t = setTimeout(() => setConsentOpen(true), 900);
    return () => clearTimeout(t);
  }, [hydrated, saved]);

  const save = (next: Consent) => {
    const v = { ...next, at: new Date().toISOString() };
    store.set(key, JSON.stringify(v));
    setC(v);
    applyConsent(v);
    setConsentOpen(false);
    toast(v.analytics || v.marketing ? 'Privacy choices saved' : 'Essentials only. Nothing is tracked.');
  };

  const copy = (text: string) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(`Copied: ${text}`), () => toast('Select the text and copy it with your keyboard.'));
    else toast('Select the text and copy it with your keyboard.');
  };

  const ac = venue.accessibility;
  return (
    <>
      <footer className="site-foot">
        <div className="wrap grid g3">
          <div>
            <p className="brandline">{venue.name}</p>
            <p>{venue.footer.credit}</p>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <p className="contact">
              <code>{venue.contact.email}</code>
              <button className="btn ghost sm" type="button" onClick={() => copy(venue.contact.email)} aria-label={`Copy email address ${venue.contact.email}`}>
                Copy
              </button>
            </p>
            <p className="contact">
              <code>{venue.contact.phone}</code>
              <span className="tiny">{venue.contact.phoneNote}</span>
              <button className="btn ghost sm" type="button" onClick={() => copy(venue.contact.phone)} aria-label={`Copy phone number ${venue.contact.phone}`}>
                Copy
              </button>
            </p>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <p>{venue.footer.cancellation}</p>
            <p>{venue.contact.replyTime}</p>
            <p className="foot-btns">
              <button
                className="btn ghost sm"
                type="button"
                onClick={() => {
                  setMore(true);
                  setConsentOpen(true);
                }}
              >
                Privacy choices
              </button>
              <button className="btn ghost sm" type="button" onClick={() => setA11y(true)} aria-haspopup="dialog">
                Accessibility statement
              </button>
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={a11y} onClose={() => setA11y(false)} labelledBy="a11yH">
        <div className="sheet">
          <div className="sheet-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>
                Accessibility statement · {ac.date}
              </p>
              <h3 id="a11yH">{ac.title}</h3>
            </div>
            <CloseButton onClick={() => setA11y(false)} />
          </div>
          <div className="stack" style={{ gap: 12 }}>
            <p>{ac.intro}</p>
            <ul className="plain">
              {ac.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p>
              <b>Known limits.</b> {ac.limits}
            </p>
            <p>{ac.contact}</p>
          </div>
        </div>
      </Dialog>

      {consentOpen && (
        <div className="consent" role="region" aria-label="Cookie and privacy choices">
          <div>
            <b>Cookies and privacy</b>
            <p className="small muted" style={{ marginTop: 4 }}>
              {venue.consent.intro}
            </p>
          </div>
          <details className="consent-more" open={more} onToggle={(e) => setMore(e.currentTarget.open)}>
            <summary>Choose what to allow</summary>
            <label>
              <input type="checkbox" checked disabled /> <span><b>Essential</b>, always on. Theme, currency, your dates while you book.</span>
            </label>
            <label>
              <input type="checkbox" checked={c.analytics} onChange={(e) => setC({ ...c, analytics: e.target.checked })} /> <span><b>Analytics.</b> {venue.consent.analytics}</span>
            </label>
            <label>
              <input type="checkbox" checked={c.marketing} onChange={(e) => setC({ ...c, marketing: e.target.checked })} /> <span><b>Marketing.</b> {venue.consent.marketing}</span>
            </label>
          </details>
          <div className="consent-btns">
            <button className="btn sm" type="button" onClick={() => save({ analytics: true, marketing: true })}>
              Allow all
            </button>
            <button className="btn ghost sm" type="button" onClick={() => save({ analytics: false, marketing: false })}>
              Essentials only
            </button>
            {more && (
              <button className="btn ghost sm" type="button" onClick={() => save(c)}>
                Save my choices
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook for the live domain: load analytics only when `c.analytics` is true and any retargeting pixel only when
 * `c.marketing` is true. No provider is configured yet (venue.integrations.analytics is null), so nothing loads.
 */
function applyConsent(c: Consent) {
  (window as unknown as { __consent?: Consent }).__consent = c;
}
