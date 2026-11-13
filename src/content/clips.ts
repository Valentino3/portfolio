/**
 * Every screen recording on the site and the size it was encoded at. The video and its poster
 * share it: `/media/{name}.webm` and `/media/{name}-poster.webp` (the poster is a smaller copy at
 * the same proportions).
 */
export const CLIPS = {
  'stock-counter': { width: 1952, height: 1226 },
  'conosur-releases': { width: 2304, height: 1720 },
  'bakery-scroll': { width: 2560, height: 1600 },
  'dsp2-weights': { width: 1764, height: 2013 },
} as const;

export type ClipName = keyof typeof CLIPS;

/**
 * A clip whose width is less than this many times its height (near square, or portrait) would be
 * far taller than the screen at the column's full width, so it is shown narrower.
 */
export const NARROW_BELOW = 1.2;

export function isNarrowClip(name: ClipName): boolean {
  const { width, height } = CLIPS[name];
  return width / height < NARROW_BELOW;
}
