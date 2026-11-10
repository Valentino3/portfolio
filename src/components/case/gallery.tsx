import type { ReactNode } from 'react';

/**
 * `sizes` for a figure in a gallery inside the text column (7 of 12 columns, about 660px at most):
 * a `wide` one takes the whole row, any other half of it. Below 1024px the column is the screen.
 */
export const GALLERY_SIZES = {
  wide: '(min-width: 1024px) 660px, 100vw',
  half: '(min-width: 1024px) 330px, 100vw',
} as const;

/** Figures in two columns; a `wide` one takes the whole row, and on a phone everything stacks. */
export function Gallery({ children }: { children: ReactNode }) {
  return <div className="mt-4.5 grid grid-cols-2 gap-5 max-sm:grid-cols-1">{children}</div>;
}
