import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VenueSite } from '@/components/VenueSite';
import { getVenue } from '@/venues';
import { venueMetadata } from '@/lib/seo';

/** "/" serves the default venue: Beam House, or whichever slug VENUE names at build time. */
export function generateMetadata(): Metadata {
  const v = getVenue();
  return v ? venueMetadata(v, '/') : {};
}

export default function Home() {
  const v = getVenue();
  if (!v) notFound();
  return <VenueSite venue={v} />;
}
