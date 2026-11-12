import type { ReactNode } from 'react';

/**
 * `sizes` for a figure in a gallery inside the text column (7 of 12 columns, about 660px at most):
 * a `wide` one takes the whole row, any other half of it, and a `third` one a third (in a
 * three-column gallery). Below 1024px the column is the screen.
 */
export const GALLERY_SIZES = {
  wide: '(min-width: 1024px) 660px, 100vw',
  half: '(min-width: 1024px) 330px, 100vw',
  third: '(min-width: 1024px) 220px, (min-width: 640px) 33vw, 100vw',
} as const;

/**
 * Figures in two columns (a `wide` one takes the whole row), or three for a set that is read
 * side by side. On a phone everything stacks.
 */
export function Gallery({ columns = 2, children }: { columns?: 2 | 3; children: ReactNode }) {
  const grid = columns === 3 ? 'grid-cols-3 gap-4' : 'grid-cols-2 gap-5';
  return <div className={`mt-4.5 grid ${grid} max-sm:grid-cols-1`}>{children}</div>;
}
