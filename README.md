# hospitality-next

A reusable Next.js template for small hospitality websites (guest houses, cottages, small hotels), built by
Marea Dvīpa. It started as a component rebuild of the hand-built **Beam House** guest site
(`marea-dvipa/clients/beam-house/index.html`): same look, copy and behaviour, now driven by one typed content file
per venue.

- Next.js 16 (App Router, TypeScript, `src/`), Tailwind CSS 4 (the original stylesheet is carried over in
  `src/app/globals.css`), `next/font` (Fraunces, Inter, DM Mono), `next/image`.
- Static export (`output: 'export'`) to `out/`, served by Cloudflare Workers static assets (`wrangler.jsonc`).
- Open Graph and Twitter tags from `generateMetadata`, schema.org JSON-LD (lodging + reviews + FAQ) built from the
  content file.
- Vitest for the pricing and booking logic and for content validation.

## Commands

```sh
npm install          # once
npm run dev          # http://localhost:3103 (dev server)
npm test             # Vitest: pricing, booking rules, walk planner, content validation
npm run typecheck    # tsc --noEmit
npm run build        # static export to out/
npm run preview      # serve out/ at http://localhost:3103 (downloads `serve` via npx on first use)
# no-download alternative: cd out && python3 -m http.server 3103
```

Deploying is not set up to run automatically. When it is time: `npm run build && npx wrangler deploy`
(wrangler is not a dependency, to keep the install small).

## How it is organised

```
src/
  venues/
    types.ts          the Venue type: every field a venue file must provide, documented
    beam-house.ts     Beam House content: copy, photos, pricing, rooms and stories, walk routes, FAQ…
    index.ts          registry of venues + which one "/" serves
    venues.test.ts    validates every registered venue
  lib/
    booking.ts        pricing engine: nightly rate, minimum stay, gap nights, discounts, quote, date finders
    walk.ts           "your stay, walked before you book": route building and suggested dates
    validate.ts       content validation (photo refs, room/story refs, ranges, seasons cover 12 months…)
    seo.ts            Open Graph metadata and JSON-LD
    notes.ts          guest-guide answers from the house notes
    dates.ts, geo.ts, store.ts
  components/
    VenueSite.tsx     the page: one component per section, in the original order
    SiteContext.tsx   shared client state: currency, calendar selection, extras, toast
    Carousel.tsx, Dialog.tsx, Photo.tsx
    sections/         Header, Hero, QuickBook, Perks, House (tour + walk planner), Film, Gallery, Seasons,
                      Offers (+ gift voucher), Booking (calendar, quote, extras, hold dialog), Guide, Local,
                      Reviews, Follow, Footer (+ accessibility statement, privacy choices), TabBar
  app/
    page.tsx          "/" = the default venue
    [venue]/page.tsx  "/<slug>/" = any registered venue (all pre-rendered)
public/venues/<slug>/ photos and media for each venue
```

## Adding a venue

1. Copy `src/venues/beam-house.ts` to `src/venues/<slug>.ts` and rename the export. TypeScript will flag any
   missing field; the comments in `types.ts` explain each one.
2. Put its photos in `public/venues/<slug>/img/` (JPEG, at most 1800 px on the long side, metadata stripped, under
   1 MB each) and list them in `photos` with their width and height. Everything else refers to photos by key.
3. Register it in `src/venues/index.ts`.
4. Run `npm test`. The validation test checks every photo exists, every room/story/walk reference resolves, the
   seasons cover all twelve months, prices are sane and so on.
5. Preview it at `/<slug>/`. To make it the site's home page, build with `VENUE=<slug> npm run build`.

Each venue normally ships as its own deployment (its own domain), with `VENUE` set at build time.

Things a venue can switch off by leaving them out: the film (omit `film.src`), the currency picker (list one
currency). Things that are Beam-House-shaped and would need a small code change for a very different venue:
the five-tab phone bar (fixed sections), the section order in `VenueSite.tsx`, and the colour tokens in
`globals.css` (one palette for now; a per-venue theme is a natural next step).

## Placeholders (owner to supply)

These are kept as clearly marked placeholders in `src/venues/beam-house.ts` and listed in its `ownerTodo` array.
None has been invented:

- Town and county: `[Town]`, `[County]` in the schema.org address.
- Live domain: `siteUrl` is `https://thebeamhouse.example` (reserved, never resolves); contact email
  `hello@thebeamhouse.example`.
- Phone / WhatsApp: `+44 7000 000000`.
- Instagram: handle `@thebeamhouse` and the link goes to instagram.com's home page.
- Payments: Stripe for the hold-dates deposit and gift vouchers. `integrations.payments` is `null`; both flows stop
  at a demo confirmation that says no card is taken.
- Mailing tool for the newsletter and returning-guests club (`integrations.mailing` is `null`; demo confirmation).
- Analytics: `integrations.analytics` is `null`. The privacy-choices banner records consent and exposes a hook
  (`applyConsent` in `Footer.tsx`) where a provider would load only after opt-in.
- Availability: the calendar uses a deterministic demo pattern (`demoBookedNights`), as the original did. Replace
  it with the venue's iCal or channel-manager feed.
- Map links point at the Google Maps home page; "Today" weather and tide figures are sample values.
- The house notes include the Wi-Fi password from the original; confirm it should be public.
- The story-compass origin (`geo`) is the approximate point from the original site.

## Carried over from the original

All eleven sections (top, house, film, gallery, seasons, offers, book, guide, local, reviews, follow) with the
original copy; the hero slideshow with pause and dots and the rotating live line; quick date check; the
direct-booking perks strip; the interactive tour (floor plan as tabs, zoom to each numbered story, compass and
distance to where each object came from, found-story progress saved on the device, the guided auto-walk, swipe
between rooms, and the bonus thirty-first story); "your stay, walked before you book" (party, dog, pace and purpose
build a route, then the first free dates that fit load into the calendar); the house film with generated room-name
captions; gallery carousel with full-size viewer; seasons tabs with carousels; offers that find and load matching
dates; gift voucher flow; the live calendar with gap-night deals, minimum stays, keyboard navigation (arrows, Home/End,
Page Up/Down), price summary, extras, platform comparison and the hold-dates dialog; the guest guide search and
arrival steps; local places, map, returning-guests club; reviews; Instagram grid and newsletter; footer with copy
buttons, reply-time line, privacy choices and the accessibility statement dialog; light/dark/auto theme;
GBP/EUR/USD; Open Graph tags; schema.org data.

Small changes from the original, on purpose:

- The tub walk's last stop said "Checkout is at eleven"; it now says 10:30 like the rest of the site.
- The sitting-room stove tip said to "ask the house"; it now points to the guest-guide search, since the assistant
  is not in the template.
- The guide's question box answers from the house notes on the page instead of opening the assistant.
- The original page had no CSS for the film block or the consent banner; both now have styles.
- Calendar weeks are real grid rows (the original put every day in one row).

## Left out (later add-ons)

- **Ask the house** (the AI guest assistant). It depended on the claude.ai artifact runtime (`window.claude.use
  ('sample')`) with tool calls into the calendar. To add it here it needs a small server endpoint (e.g. a Worker
  calling the Claude API with the house notes, room stories and the `booking.ts` functions as tools), a privacy
  note, and the floating "Ask the house" button and chat sheet back in the UI.
- **Owner view** (`owner.html`: the case for direct booking, acquisition engine, dashboard behind a demo code
  gate). It is a separate sales page, not part of the guest site.
- The `window.claude.hot` live-reload state keeping (artifact-only).
- Photos the original folder had but never used (`dining`, `lamp`, `lounge`, `through`, `tv`) were not copied.

## Accessibility

Targets WCAG 2.2 AA, as the original did: skip link, landmarks, one h1 and headings in order, alt text on every
photo, visible focus, 44 px targets. Keyboard: carousels (focus the photo strip, then arrows, Home, End; buttons and
dots), tabs for rooms and seasons (arrows, Home, End, roving focus), the calendar grid (arrows, Home/End, Page
Up/Down, Enter/Space), native modal dialogs (focus trapped, Escape closes, focus returns to the opener). Reduced
motion: animations and smooth scrolling off, the hero slideshow and rotating line start paused (the visitor can still
press play), the guided walk slows down. Form errors are announced and focus moves to the field.
