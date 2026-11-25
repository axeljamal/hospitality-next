import { beamHouse } from './beam-house';
import type { Venue } from './types';

/** Every venue this build knows about. Add a venue: create src/venues/<slug>.ts and list it here. */
export const venues: Record<string, Venue> = {
  [beamHouse.slug]: beamHouse,
};

/** The venue served at "/". Set VENUE=<slug> at build time to change it. */
export const defaultVenueSlug = process.env.VENUE && venues[process.env.VENUE] ? process.env.VENUE : beamHouse.slug;

export function getVenue(slug: string = defaultVenueSlug): Venue | undefined {
  return venues[slug];
}

export type { Venue } from './types';
