export type Slug = 'stock-tienda' | 'conosur' | 'dsp2' | 'analyzer' | 'bakery-concept';

export type Media = { src: string; width: number; height: number; alt: string };

/**
 * Where a phone's thumbnail zooms in (under 640px a whole dashboard shrunk to the screen's width is
 * gray noise): the picture grows by `zoom` around the point `x`% across and `y`% down, which stays
 * put. The region shown starts at x·(1 − 1/zoom)% from the left and y·(1 − 1/zoom)% from the top,
 * and is 1/zoom of the picture wide and tall. Wider screens always show the whole screenshot.
 */
export type ThumbnailCrop = { x: number; y: number; zoom: number };

export type ProjectSummary = {
  slug: Slug;
  title: string;
  context: 'Own product' | 'Client work' | 'Reset Digital' | 'Personal concept';
  years: string;
  description: string;
  role: string;
  stack: string[];
  image: Media;
  /** One legible region of `image` for the phone thumbnail. Without it, the whole screenshot. */
  crop?: ThumbnailCrop;
  published: boolean;
};
