'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * False in the static HTML and during hydration, true straight after. Anything that depends on the visitor
 * (today's date, saved preferences) reads from here so the pre-rendered page and the first client render match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

const RM = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(RM);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => matchMedia(RM).matches,
    () => false,
  );
}
