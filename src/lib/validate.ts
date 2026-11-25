import type { PhotoRef, Venue } from '@/venues/types';

/**
 * Structural checks a venue file must pass before it ships. Returns human-readable problems; empty means valid.
 * TypeScript catches the shape; this catches the references and ranges it cannot.
 */
export function validateVenue(v: Venue): string[] {
  const errors: string[] = [];
  const err = (m: string) => errors.push(`${v.slug}: ${m}`);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug)) err(`slug "${v.slug}" must be kebab-case`);
  for (const [field, value] of Object.entries({ name: v.name, description: v.description, lang: v.lang })) {
    if (!value.trim()) err(`${field} is empty`);
  }
  try {
    new URL(v.siteUrl);
  } catch {
    err(`siteUrl "${v.siteUrl}" is not a valid URL`);
  }

  // Photos
  for (const [k, f] of Object.entries(v.photos)) {
    if (!f.src.startsWith('/')) err(`photo "${k}" src must start with /`);
    if (!(f.width > 0 && f.height > 0)) err(`photo "${k}" needs a width and height`);
  }
  const checkRef = (where: string, r: PhotoRef) => {
    if (!v.photos[r.photo]) err(`${where}: unknown photo "${r.photo}"`);
    if (!r.alt.trim()) err(`${where}: photo "${r.photo}" has no alt text`);
  };
  const checkKey = (where: string, k: string) => {
    if (!v.photos[k]) err(`${where}: unknown photo "${k}"`);
  };
  checkKey('ogPhoto', v.ogPhoto);
  checkKey('film.poster', v.film.poster);
  v.schema.photos.forEach((k) => checkKey('schema.photos', k));
  v.hero.slides.forEach((r, i) => checkRef(`hero.slides[${i}]`, r));
  v.gallery.photos.forEach((r, i) => checkRef(`gallery.photos[${i}]`, r));
  v.seasons.items.forEach((s) => s.photos.forEach((r, i) => checkRef(`seasons.${s.name}[${i}]`, r)));
  v.follow.instagram.posts.forEach((r, i) => checkRef(`instagram.posts[${i}]`, r));
  checkRef('local.map', v.local.map.photo);
  if (v.hero.slides.length === 0) err('hero needs at least one slide');

  // Currencies
  if (v.currencies.length === 0) err('at least one currency is required');
  else if (v.currencies[0].rate !== 1) err('the first currency is the base and must have rate 1');
  if (new Set(v.currencies.map((c) => c.code)).size !== v.currencies.length) err('duplicate currency codes');

  // Pricing
  const pr = v.pricing;
  if (!(pr.base.low > 0 && pr.base.low <= pr.base.mid && pr.base.mid <= pr.base.high)) err('pricing.base must satisfy 0 < low <= mid <= high');
  if (pr.bandByMonth.length !== 12) err('pricing.bandByMonth needs 12 entries');
  if (pr.minNights.default < 1) err('pricing.minNights.default must be at least 1');
  for (const [m, n] of Object.entries(pr.minNights.byArrivalMonth)) {
    if (+m < 0 || +m > 11 || !n || n < 1) err(`pricing.minNights.byArrivalMonth[${m}] is invalid`);
  }
  for (const d of pr.discounts) if (!(d.pct > 0 && d.pct < 100)) err(`discount "${d.id}" pct must be between 0 and 100`);
  if (!(pr.gapNight.multiplier > 0 && pr.gapNight.multiplier <= 1)) err('gapNight.multiplier must be in (0, 1]');
  if (!(pr.depositPct >= 0 && pr.depositPct <= 100)) err('depositPct must be 0 to 100');
  if (pr.otaMarkup < 1) err('otaMarkup below 1 would show the platforms as cheaper');
  pr.peaks.forEach((pk) => {
    if (pk.month < 0 || pk.month > 11 || pk.fromDay < 1 || pk.fromDay > 31) err(`peak "${pk.label}" has an invalid date`);
  });

  // Extras and guest options
  const extraIds = new Set(v.extras.map((x) => x.id));
  if (extraIds.size !== v.extras.length) err('duplicate extra ids');
  v.extras.forEach((x) => x.price < 0 && err(`extra "${x.id}" has a negative price`));
  v.guestOptions.forEach((g) => g.addsExtra && !extraIds.has(g.addsExtra) && err(`guest option "${g.value}" adds unknown extra "${g.addsExtra}"`));

  // Tour
  const rooms = v.tour.rooms;
  const roomIds = new Set(rooms.map((r) => r.id));
  if (roomIds.size !== rooms.length) err('duplicate room ids');
  const floorIds = new Set(v.tour.floors.map((f) => f.id));
  for (const r of rooms) {
    checkRef(`room "${r.id}"`, r.photo);
    if (!floorIds.has(r.floor)) err(`room "${r.id}" is on unknown floor "${r.floor}"`);
    if (r.stories.length === 0) err(`room "${r.id}" has no stories`);
    r.stories.forEach((s, i) => {
      if (s.x < 0 || s.x > 100 || s.y < 0 || s.y > 100) err(`room "${r.id}" story ${i} is off the photo`);
      if (s.from && (Math.abs(s.from.lat) > 90 || Math.abs(s.from.lon) > 180)) err(`room "${r.id}" story ${i} has bad coordinates`);
    });
  }

  // Walk
  const w = v.walk;
  const stepOk = (where: string, room: string, story: number) => {
    const r = rooms.find((x) => x.id === room);
    if (!r) err(`${where}: unknown room "${room}"`);
    else if (!r.stories[story]) err(`${where}: room "${room}" has no story ${story}`);
  };
  w.purposes.forEach((p) => p.steps.forEach((s, i) => stepOk(`walk.${p.id}[${i}]`, s.room, s.story)));
  w.overrides.forEach((o, i) => {
    stepOk(`walk.overrides[${i}]`, o.step.room, o.step.story);
    w.purposes.forEach((p) => o.index >= p.steps.length && err(`walk.overrides[${i}] index ${o.index} is past the end of "${p.id}"`));
  });
  if (!w.who.some((x) => x.id === w.defaults.who)) err('walk.defaults.who is not an option');
  if (!w.pace.some((x) => x.id === w.defaults.pace)) err('walk.defaults.pace is not an option');
  if (!w.purposes.some((x) => x.id === w.defaults.purpose)) err('walk.defaults.purpose is not an option');
  w.pace.forEach((p) => p.nights < 1 && err(`walk pace "${p.id}" needs at least one night`));

  // Seasons: every month covered exactly once
  const months = v.seasons.items.flatMap((s) => s.months);
  for (let m = 0; m < 12; m++) if (months.filter((x) => x === m).length !== 1) err(`month ${m} must belong to exactly one season`);

  // Offers
  const offerIds = new Set(v.offers.items.map((o) => o.id));
  if (offerIds.size !== v.offers.items.length) err('duplicate offer ids');
  v.offers.items.forEach((o) => o.find.nights < 1 && err(`offer "${o.id}" needs at least one night`));
  const vo = v.offers.voucher;
  if (!(vo.min > 0 && vo.min <= vo.max)) err('voucher min/max invalid');
  vo.amounts.forEach((a) => (a < vo.min || a > vo.max) && err(`voucher amount ${a} is outside min/max`));

  // Film
  v.film.cues.forEach(([a, b], i) => b <= a && err(`film cue ${i} ends before it starts`));

  // Reviews
  v.reviews.items.forEach((r, i) => {
    if (r.rating < 1 || r.rating > 5) err(`review ${i} rating must be 1 to 5`);
    if (Number.isNaN(Date.parse(r.date))) err(`review ${i} date is invalid`);
  });

  // Contact
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contact.email)) err('contact.email is not an email address');

  // Schema
  if (!/^\d{2}:\d{2}$/.test(v.schema.checkinTime) || !/^\d{2}:\d{2}$/.test(v.schema.checkoutTime)) err('schema check-in/out must be HH:MM');
  if (v.schema.maxGuests < 1) err('schema.maxGuests must be at least 1');

  return errors;
}

/** Strings still waiting for the owner: anything in [square brackets]. */
export function findPlaceholders(v: Venue): string[] {
  const out = new Set<string>();
  const walk = (x: unknown) => {
    if (typeof x === 'string') x.match(/\[[A-Z][^\]]*\]/g)?.forEach((m) => out.add(m));
    else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') Object.values(x).forEach(walk);
  };
  walk(v);
  return [...out];
}
