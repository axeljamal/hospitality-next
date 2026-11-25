import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { venues, getVenue, defaultVenueSlug } from '.';
import { beamHouse } from './beam-house';
import { findPlaceholders, validateVenue } from '@/lib/validate';
import { venueJsonLd, venueMetadata, jsonLdString } from '@/lib/seo';
import { ordinalWord } from '@/lib/dates';

const PUBLIC = join(__dirname, '..', '..', 'public');

describe.each(Object.values(venues))('venue $slug', (v) => {
  it('passes content validation', () => {
    expect(validateVenue(v)).toEqual([]);
  });

  it('is registered under its own slug', () => {
    expect(venues[v.slug]).toBe(v);
  });

  it('has every photo file on disk, at most 1 MB each', () => {
    for (const [k, f] of Object.entries(v.photos)) {
      const p = join(PUBLIC, f.src);
      expect(existsSync(p), `${k}: ${f.src}`).toBe(true);
      expect(statSync(p).size, `${k} is too heavy`).toBeLessThan(1_000_000);
    }
  });

  it('has its film on disk when it declares one', () => {
    if (v.film.src) expect(existsSync(join(PUBLIC, v.film.src))).toBe(true);
  });

  it('builds JSON-LD with the lodging and the FAQ', () => {
    const ld = venueJsonLd(v);
    const [lodging, faq] = ld['@graph'] as Record<string, unknown>[];
    expect(lodging['@type']).toBe(v.schema.type);
    expect(lodging.name).toBe(v.name);
    expect((lodging.review as unknown[]).length).toBe(v.reviews.items.length);
    expect((faq.mainEntity as unknown[]).length).toBe(v.guide.faq.length);
    expect(jsonLdString(ld)).not.toContain('<');
  });

  it('builds Open Graph metadata with an absolute image', () => {
    const m = venueMetadata(v);
    expect(m.openGraph?.title).toBe(v.name);
    expect(m.metadataBase?.toString()).toBe(new URL(v.siteUrl).toString());
  });
});

describe('Beam House content', () => {
  it('is the default venue', () => {
    expect(defaultVenueSlug).toBe('beam-house');
    expect(getVenue()).toBe(beamHouse);
  });

  it('keeps the owner placeholders visible instead of inventing values', () => {
    expect(findPlaceholders(beamHouse)).toEqual(expect.arrayContaining(['[Town]', '[County]']));
    expect(beamHouse.contact.phone).toBe('+44 7000 000000');
    expect(beamHouse.contact.email.endsWith('.example')).toBe(true);
    expect(beamHouse.integrations).toEqual({ payments: null, mailing: null, analytics: null });
  });

  it('has 30 stories in ten rooms, so the bonus is the thirty-first', () => {
    const total = beamHouse.tour.rooms.reduce((a, r) => a + r.stories.length, 0);
    expect(beamHouse.tour.rooms).toHaveLength(10);
    expect(total).toBe(30);
    expect(ordinalWord(total + 1)).toBe('thirty-first');
  });
});

describe('validation catches broken content', () => {
  it('reports bad references and ranges', () => {
    const broken = structuredClone(beamHouse);
    broken.slug = 'Broken House';
    broken.hero.slides[0].photo = 'missing';
    broken.tour.rooms[0].stories[0].x = 140;
    broken.walk.purposes[0].steps[0].room = 'cellar';
    broken.pricing.base.low = 400;
    broken.pricing.bandByMonth = broken.pricing.bandByMonth.slice(0, 11);
    broken.guestOptions[3].addsExtra = 'pony';
    broken.seasons.items[0].months = [0];
    broken.contact.email = 'not-an-email';
    const errs = validateVenue(broken).join('\n');
    for (const needle of ['kebab-case', 'unknown photo "missing"', 'off the photo', 'unknown room "cellar"', 'low <= mid', '12 entries', 'unknown extra "pony"', 'month 11', 'not an email']) {
      expect(errs).toContain(needle);
    }
  });
});
