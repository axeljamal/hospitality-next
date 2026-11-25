/** localStorage that never throws (private windows, blocked storage, server render). */
export const store = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
  del(k: string) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "The Beam House" -> "BH": used for booking and voucher references. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => w && !/^(the|a|an|of|and)$/i.test(w))
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 3) || 'HX';
