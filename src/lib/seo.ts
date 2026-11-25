import type { Metadata } from 'next';
import type { Venue } from '@/venues/types';

const abs = (v: Venue, path: string) => new URL(path, v.siteUrl).toString();

export function venueMetadata(v: Venue, path = '/'): Metadata {
  const og = v.photos[v.ogPhoto];
  return {
    metadataBase: new URL(v.siteUrl),
    title: v.name,
    description: v.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: v.name,
      description: v.description,
      siteName: v.name,
      locale: v.lang.replace('-', '_'),
      url: path,
      images: og ? [{ url: og.src, width: og.width, height: og.height, alt: v.hero.slides[0]?.alt ?? v.name }] : [],
    },
    twitter: { card: 'summary_large_image', title: v.name, description: v.description, images: og ? [og.src] : [] },
  };
}

/** schema.org graph: the lodging itself (with rating and reviews) and the FAQ. */
export function venueJsonLd(v: Venue) {
  const s = v.schema;
  const id = abs(v, '/#venue');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': s.type,
        '@id': id,
        name: v.name,
        url: abs(v, '/'),
        description: v.description,
        image: s.photos.map((k) => abs(v, v.photos[k].src)),
        ...(s.bedrooms !== undefined && { numberOfBedrooms: s.bedrooms }),
        ...(s.bathrooms !== undefined && { numberOfBathroomsTotal: s.bathrooms }),
        occupancy: { '@type': 'QuantitativeValue', maxValue: s.maxGuests },
        ...(s.petsAllowed !== undefined && { petsAllowed: s.petsAllowed }),
        checkinTime: s.checkinTime,
        checkoutTime: s.checkoutTime,
        amenityFeature: s.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
        address: { '@type': 'PostalAddress', streetAddress: s.address.street, addressLocality: s.address.locality, addressRegion: s.address.region, addressCountry: s.address.country },
        email: v.contact.email,
        telephone: v.contact.phone,
        priceRange: s.priceRange,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: String(v.reviews.rating), reviewCount: String(v.reviews.count), bestRating: '5' },
        review: v.reviews.items.map((r) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          datePublished: r.date,
          reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5' },
          reviewBody: r.text,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: v.guide.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can never close the tag. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
