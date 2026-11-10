import type { CaseStudy } from '../case-types';
import type { Slug } from '../types';
import { analyzer } from './analyzer';
import { bakeryConcept } from './bakery-concept';
import { conosur } from './conosur';
import { dsp2 } from './dsp2';
import { stockTienda } from './stock-tienda';

/** One case per slug; the type makes a missing one a compile error. */
const CASES: Record<Slug, CaseStudy> = {
  'stock-tienda': stockTienda,
  conosur,
  dsp2,
  analyzer,
  'bakery-concept': bakeryConcept,
};

export function getCase(slug: Slug): CaseStudy {
  return CASES[slug];
}
