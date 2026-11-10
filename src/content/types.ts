export type Slug = 'stock-tienda' | 'conosur' | 'dsp2' | 'analyzer' | 'bakery-concept';

export type Media = { src: string; width: number; height: number; alt: string };

export type ProjectSummary = {
  slug: Slug;
  title: string;
  context: 'Own product' | 'Client work' | 'Reset Digital' | 'Personal concept';
  years: string;
  description: string;
  role: string;
  kind: string;
  stack: string[];
  image: Media;
  published: boolean;
};

/** A published project with its position in the list, "01".."05". */
export type NumberedProject = ProjectSummary & { number: string };
