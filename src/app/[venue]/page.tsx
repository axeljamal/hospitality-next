import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VenueSite } from '@/components/VenueSite';
import { getVenue, venues } from '@/venues';
import { venueMetadata } from '@/lib/seo';

/** "/<slug>/" previews any registered venue, e.g. /beam-house/. Every venue is pre-rendered at build time. */
type Props = { params: Promise<{ venue: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(venues).map((venue) => ({ venue }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venue } = await params;
  const v = getVenue(venue);
  return v ? venueMetadata(v, `/${v.slug}/`) : {};
}

export default async function VenuePage({ params }: Props) {
  const { venue } = await params;
  const v = getVenue(venue);
  if (!v) notFound();
  return <VenueSite venue={v} />;
}
