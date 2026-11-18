import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Media } from '@/content/types';
import { FigureFrame } from './figure-frame';
import { ZoomLink } from './zoom-dialog';

/** A vertical strip of a picture, as shares of its width: where it starts and how wide it is. */
export type Crop = { x: number; width: number };

/** A box on a picture, as shares of its width and height: where it starts and how big it is. */
export type Mark = { x: number; y: number; width: number; height: number };

/** A share as a CSS percentage, rounded so 0.29 stays 29%. */
const percent = (share: number) => `${Math.round(share * 10000) / 100}%`;

/** `sizes` for a cropped picture on a phone: it is laid out 1/width times as wide as the screen. */
export function cropSizes(crop: Crop): string {
  return `${Math.ceil(100 / crop.width)}vw`;
}

/**
 * A picture with its caption. `sizes` says how wide the picture is laid out, so the browser asks
 * for a copy that fits (see GALLERY_SIZES for the gallery slots). `priority` is for the one
 * likely to be the first thing painted: it skips the lazy loader. `zoom` wraps it in a link to
 * the large image, which the page's ZoomProvider opens in a dialog.
 *
 * `crop` is for a wide screenshot whose text would be too small on a phone: below 640px the box
 * shows only a vertical strip of it (from `x` to `x + width`, as shares of the image's width), at
 * the full height and so at a larger scale. From 640px up, and in the zoom, it is whole.
 *
 * `zoomImage` is for a picture that is a close-up of a larger one: the figure shows the close-up
 * and the zoom opens the whole. `marks` draws a hairline box on the picture around what changed,
 * at shares of its size (not with `crop`, which moves the picture under the frame on a phone).
 */
export function Figure({
  image,
  caption,
  note,
  wide,
  sizes,
  priority,
  zoom,
  crop,
  zoomImage,
  marks,
}: {
  image: Media;
  caption: string;
  note?: string;
  wide?: boolean;
  sizes: string;
  priority?: boolean;
  zoom?: boolean;
  crop?: Crop;
  zoomImage?: Media;
  marks?: Mark[];
}) {
  const img = (
    <Image
      src={image.src}
      width={image.width}
      height={image.height}
      sizes={sizes}
      loading={priority ? 'eager' : undefined}
      fetchPriority={priority ? 'high' : undefined}
      alt={image.alt}
      className={
        crop
          ? 'block h-auto w-full max-sm:w-[calc(100%/var(--crop-width))] max-sm:max-w-none max-sm:translate-x-[calc(-100%*var(--crop-x))]'
          : 'block h-auto w-full'
      }
      style={crop ? ({ '--crop-x': crop.x, '--crop-width': crop.width } as CSSProperties) : undefined}
    />
  );
  const picture = marks?.length ? (
    <>
      {img}
      {marks.map((m) => (
        <span
          key={`${m.x}-${m.y}`}
          aria-hidden="true"
          data-mark=""
          className="pointer-events-none absolute rounded-[calc(var(--radius-base)*0.75)] ring-1 ring-ink forced-colors:border forced-colors:border-[CanvasText]"
          style={{
            left: percent(m.x),
            top: percent(m.y),
            width: percent(m.width),
            height: percent(m.height),
          }}
        />
      ))}
    </>
  ) : (
    img
  );
  return (
    <FigureFrame caption={caption} note={note} className={wide ? 'col-span-full' : undefined}>
      {zoom ? (
        <ZoomLink image={zoomImage ?? image} caption={caption}>
          {picture}
        </ZoomLink>
      ) : (
        picture
      )}
    </FigureFrame>
  );
}
