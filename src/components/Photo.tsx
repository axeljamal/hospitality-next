import Image, { type ImageProps } from 'next/image';
import type { PhotoRef, Venue } from '@/venues/types';

type Extra = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'fill'>;

/** A venue photo by key. `fill` sizes it to the positioned parent; otherwise it uses the file's own size. */
export function Photo({ venue, refd, fill, ...rest }: { venue: Venue; refd: PhotoRef; fill?: boolean } & Extra) {
  const f = venue.photos[refd.photo];
  if (!f) return null;
  return fill ? (
    <Image src={f.src} alt={refd.alt} fill {...rest} />
  ) : (
    <Image src={f.src} alt={refd.alt} width={f.width} height={f.height} {...rest} />
  );
}
