import Image from 'next/image';
import type { Media } from '@/content/types';
import { FigureFrame } from './figure-frame';
import { ZoomLink } from './zoom-dialog';

/**
 * A picture with its caption. `sizes` says how wide the picture is laid out, so the browser asks
 * for a copy that fits (see GALLERY_SIZES for the gallery slots). `priority` is for the one
 * likely to be the first thing painted: it skips the lazy loader. `zoom` wraps it in a link to
 * the large image, which the page's ZoomProvider opens in a dialog.
 */
export function Figure({
  image,
  caption,
  note,
  wide,
  sizes,
  priority,
  zoom,
}: {
  image: Media;
  caption: string;
  note?: string;
  wide?: boolean;
  sizes: string;
  priority?: boolean;
  zoom?: boolean;
}) {
  const picture = (
    <Image
      src={image.src}
      width={image.width}
      height={image.height}
      sizes={sizes}
      loading={priority ? 'eager' : undefined}
      fetchPriority={priority ? 'high' : undefined}
      alt={image.alt}
      className="block h-auto w-full"
    />
  );
  return (
    <FigureFrame caption={caption} note={note} className={wide ? 'col-span-full' : undefined}>
      {zoom ? (
        <ZoomLink image={image} caption={caption}>
          {picture}
        </ZoomLink>
      ) : (
        picture
      )}
    </FigureFrame>
  );
}
