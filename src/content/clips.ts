/**
 * Every screen recording on the site and the size it was encoded at. The video and its poster
 * share it: `/media/{name}.webm` and `/media/{name}-poster.webp`.
 */
export const CLIPS = {
  'stock-counter': { width: 1952, height: 1226 },
  'conosur-releases': { width: 1280, height: 800 },
  'bakery-scroll': { width: 1280, height: 800 },
} as const;

export type ClipName = keyof typeof CLIPS;
