import type { Media } from '@/content/types';
import { type Crop, Figure, cropSizes } from './figure';

type Side = { image: Media; caption: string };

/**
 * The same screen before and after a change, at the same crop. `side` (the default) sets them
 * side by side from 640px up, one above the other on a phone: for pictures that read at half the
 * column, like charts. `stack` sets them one above the other at every width, each the column's
 * full width: for a wide table whose detail is the point. Each picture has its own caption (which
 * says which one it is) and opens on its own in the zoom. `crop` (see Figure) is for a table that
 * would be unreadable on a phone at the screen's width; both pictures get the same one, so they
 * still compare.
 */
export function BeforeAfter({
  before,
  after,
  crop,
  layout = 'side',
}: {
  before: Side;
  after: Side;
  crop?: Crop;
  layout?: 'side' | 'stack';
}) {
  const phone = crop ? cropSizes(crop) : '100vw';
  const sizes =
    layout === 'stack'
      ? `(min-width: 1024px) 660px, (min-width: 640px) 100vw, ${phone}`
      : `(min-width: 1024px) 330px, (min-width: 640px) 50vw, ${phone}`;
  const grid = layout === 'stack' ? 'grid-cols-1' : 'grid-cols-2 max-sm:grid-cols-1';
  return (
    <div className={`mt-5 grid gap-5 ${grid}`} data-before-after={layout}>
      {[before, after].map(({ image, caption }) => (
        <Figure key={image.src} image={image} caption={caption} sizes={sizes} crop={crop} zoom />
      ))}
    </div>
  );
}
