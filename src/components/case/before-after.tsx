import type { Media } from '@/content/types';
import { type Crop, Figure, cropSizes } from './figure';

type Side = { image: Media; caption: string };

/**
 * The same screen before and after a change, at the same crop: side by side from 640px up, one
 * above the other on a phone. Each picture has its own caption (which says which one it is) and
 * opens on its own in the zoom. `crop` (see Figure) is for a wide table that would be unreadable
 * on a phone at the screen's width; both pictures get the same one, so they still compare.
 */
export function BeforeAfter({ before, after, crop }: { before: Side; after: Side; crop?: Crop }) {
  const sizes = `(min-width: 1024px) 330px, (min-width: 640px) 50vw, ${crop ? cropSizes(crop) : '100vw'}`;
  return (
    <div className="mt-5 grid grid-cols-2 gap-5 max-sm:grid-cols-1" data-before-after="">
      {[before, after].map(({ image, caption }) => (
        <Figure key={image.src} image={image} caption={caption} sizes={sizes} crop={crop} zoom />
      ))}
    </div>
  );
}
