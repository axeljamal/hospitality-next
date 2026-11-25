/**
 * The shape of one venue. Everything the guest site shows comes from a value of this type,
 * so adding a venue means adding one file in src/venues/ and registering it in src/venues/index.ts.
 *
 * Conventions
 * - Photos are declared once in `photos` (file, width, height) and referenced everywhere else by key.
 * - Text that still needs the owner is written in square brackets, e.g. "[Town]", and listed in `ownerTodo`.
 * - Weekdays are JavaScript numbers: 0 Sunday, 1 Monday ... 6 Saturday. Months are 0 January ... 11 December.
 */

export type PhotoKey = string;

export interface PhotoFile {
  /** Path under public/, starting with a slash. */
  src: string;
  width: number;
  height: number;
}

/** A use of a photo: which file, and the alt text for this particular use. */
export interface PhotoRef {
  photo: PhotoKey;
  alt: string;
  caption?: string;
}

export type CurrencyCode = string;

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  /** Multiply a price in the base currency by this rate. The base currency has rate 1. */
  rate: number;
  label: string;
}

export type SeasonBand = 'low' | 'mid' | 'high';

export interface Pricing {
  /** Nightly rate, all-in, in the base currency. */
  base: Record<SeasonBand, number>;
  /** Twelve entries, January first: which band each month falls in. */
  bandByMonth: SeasonBand[];
  /** Nights starting on these weekdays cost `weekendMultiplier` times as much. */
  weekendDays: number[];
  weekendMultiplier: number;
  /** Peak uplifts, e.g. Christmas: nights in `month` from `fromDay` on. */
  peaks: { month: number; fromDay: number; multiplier: number; label: string }[];
  /** A free night between two booked nights. */
  gapNight: { multiplier: number; bookableAlone: boolean };
  minNights: { default: number; byArrivalMonth: Partial<Record<number, number>> };
  /** Discounts on the nights total. Only the largest applies; they never stack. */
  discounts: StayDiscount[];
  /** "Same dates on Airbnb" estimate: nights total times this. */
  otaMarkup: number;
  depositPct: number;
  /** How far ahead the calendar opens, in months. */
  calendarMonths: number;
}

export type StayDiscount =
  | { id: string; label: string; pct: number; kind: 'long'; minNights: number }
  | {
      id: string;
      label: string;
      pct: number;
      kind: 'midweek';
      minNights: number;
      /** Every night must start on one of these weekdays... */
      weekdays: number[];
      /** ...and in one of these months. */
      months: number[];
    };

export interface Extra {
  id: string;
  icon: string;
  name: string;
  detail: string;
  price: number;
  /** Ticked by default. */
  default?: boolean;
}

export interface GuestOption {
  value: string;
  label: string;
  /** Picking this option in the quick-book form ticks this extra. */
  addsExtra?: string;
}

export interface OfferFinder {
  nights: number;
  /** Arrival weekday, if fixed. */
  arrivalDay?: number;
  /** Arrival month must be in this list. */
  months?: number[];
  /** Find a gap night instead. */
  gapNight?: boolean;
}

export interface Offer {
  id: string;
  when: string;
  title: string;
  text: string;
  /** "from" price = low base rate x nights x (1 - pct/100). */
  from: { nights: number; discountPct: number };
  unit: string;
  cta: string;
  find: OfferFinder;
}

export interface Story {
  /** Position on the photo, in percent. */
  x: number;
  y: number;
  title: string;
  text: string;
  /** Where the object came from; drives the compass and distance. */
  from: { place: string; lat: number; lon: number } | null;
  tip: string;
}

export interface Room {
  id: string;
  name: string;
  /** Short label on the floor plan. */
  plan: string;
  floor: string;
  photo: PhotoRef;
  intro: string;
  /** Full-width plan row, e.g. a long room seen end to end. */
  long?: boolean;
  /** Star on the plan. */
  highlight?: boolean;
  /** Entrance marker on the plan. */
  door?: boolean;
  stories: Story[];
}

export type WalkWho = 'couple' | 'family' | 'friends' | 'solo';
export type WalkPace = 'slow' | 'balanced' | 'full';

export interface WalkStep {
  room: string;
  story: number;
  /** Tokens: {day} first day, {next} second day, {who} the party ("the two of you"). */
  when: string;
  /** Replaces `when` for a given pace. */
  whenFor?: Partial<Record<WalkPace, string>>;
  text: string;
  /** Replaces `text` for a given party. */
  textFor?: Partial<Record<WalkWho, string>>;
  /** Appended when the guest brings a dog. */
  dogText?: string;
}

export interface WalkOverride {
  /** Applies when the party is this, or when there is a dog. */
  if: { who?: WalkWho; dog?: boolean };
  /** Replace the step at this position in the route. */
  index: number;
  step: WalkStep;
  /** Skip the override if the route already visits this story (or any story in the room). */
  unlessRouteHas?: { room: string; story?: number };
}

export interface WalkPurpose {
  id: string;
  label: string;
  /** Sentence used in summaries, e.g. "the hot tub and the sea". */
  phrase: string;
  steps: WalkStep[];
  /** Restrict the suggested dates for this purpose. */
  dates?: { months?: number[]; arrivalDays?: number[]; arrivalDaysByPace?: Partial<Record<WalkPace, number[]>> };
}

export interface Walk {
  eyebrow: string;
  title: string;
  who: { id: WalkWho; label: string; phrase: string }[];
  pace: { id: WalkPace; label: string; nights: number; days: [string, string]; arrivalDays: number[] }[];
  purposes: WalkPurpose[];
  overrides: WalkOverride[];
  defaults: { who: WalkWho; pace: WalkPace; purpose: string };
}

export interface Season {
  name: string;
  /** Months that open on this tab by default. */
  months: number[];
  photos: PhotoRef[];
  title: string;
  text: string;
  tags: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface NoteEntry {
  topic: string;
  keywords: string[];
  answer: string;
}

export interface LocalPlace {
  icon: string;
  name: string;
  detail: string;
  walk: string;
}

export interface Review {
  author: string;
  from?: string;
  note?: string;
  date: string;
  rating: number;
  text: string;
  badge: string;
}

export interface Venue {
  slug: string;
  name: string;
  tagline: string;
  lang: string;
  /** Canonical origin for absolute Open Graph URLs. */
  siteUrl: string;
  description: string;
  /** Things the owner still has to supply. Shown nowhere on the site; read by humans and the README. */
  ownerTodo: string[];

  photos: Record<PhotoKey, PhotoFile>;
  ogPhoto: PhotoKey;

  currencies: Currency[];
  pricing: Pricing;
  extras: Extra[];
  guestOptions: GuestOption[];

  nav: { href: string; label: string }[];
  menu: { href: string; label: string }[];

  hero: {
    titleBefore: string;
    titleEm: string;
    titleAfter: string;
    sub: string;
    primaryCta: string;
    secondaryCta: string;
    slides: PhotoRef[];
    stats: { label: string; value: string; detail: string }[];
    liveMessages: string[];
  };
  perks: { icon: 'star' | 'card' | 'repeat'; title: string; text: string }[];

  tour: {
    eyebrow: string;
    title: string;
    walkButton: string;
    floors: { id: string; label: string }[];
    rooms: Room[];
    bonus: { title: string; text: string };
  };
  walk: Walk;

  film: {
    eyebrow: string;
    title: string;
    lede: string;
    /** Omit to hide the section (e.g. the video is too big to ship yet). */
    src?: string;
    poster: PhotoKey;
    label: string;
    /** [start s, end s, caption] */
    cues: [number, number, string][];
  };

  gallery: { eyebrow: string; title: string; lede: string; photos: PhotoRef[] };
  seasons: { eyebrow: string; title: string; items: Season[] };

  offers: {
    eyebrow: string;
    title: string;
    lede: string;
    items: Offer[];
    voucher: { title: string; text: string; amounts: number[]; defaultAmount: number; min: number; max: number; validMonths: number };
  };

  booking: { eyebrow: string; title: string; lede: string; syncNote: string; cancellation: string };

  guide: {
    eyebrow: string;
    title: string;
    lede: string;
    placeholder: string;
    note: string;
    arrival: { title: string; text: string }[];
    notes: NoteEntry[];
    faq: FaqItem[];
  };

  local: {
    eyebrow: string;
    title: string;
    places: LocalPlace[];
    map: { photo: PhotoRef; eyebrow: string; title: string; text: string; url: string };
    today: { title: string; text: string; note: string };
    gettingAround: { text: string; url: string };
    club: { title: string; text: string };
  };

  reviews: { eyebrow: string; title: string; rating: number; count: number; items: Review[] };

  follow: {
    eyebrow: string;
    title: string;
    instagram: { handle: string; url: string; posts: PhotoRef[] };
    newsletter: { title: string; text: string; note: string };
  };

  contact: {
    email: string;
    phone: string;
    phoneNote: string;
    replyTime: string;
    /** Median reply time for messages during a stay, e.g. "about 6 minutes". */
    replyDuringStay: string;
  };

  footer: { credit: string; cancellation: string };

  accessibility: { date: string; title: string; intro: string; points: string[]; limits: string; contact: string };

  consent: { intro: string; analytics: string; marketing: string };

  /** schema.org data, built into JSON-LD. */
  schema: {
    type: 'VacationRental' | 'Hotel' | 'BedAndBreakfast' | 'LodgingBusiness';
    bedrooms?: number;
    bathrooms?: number;
    maxGuests: number;
    petsAllowed?: boolean;
    checkinTime: string;
    checkoutTime: string;
    amenities: string[];
    address: { street: string; locality: string; region: string; country: string };
    priceRange: string;
    photos: PhotoKey[];
  };

  /** For the compass on each story: where "here" is. */
  geo: { lat: number; lon: number };

  integrations: {
    /** null = not connected yet; the booking and voucher flows stop at a clearly marked demo step. */
    payments: { provider: string } | null;
    mailing: { provider: string } | null;
    analytics: { provider: string } | null;
  };
}
