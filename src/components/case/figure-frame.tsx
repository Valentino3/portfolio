import type { ReactNode } from 'react';

/**
 * What a figure and a clip share: the rounded, ringed picture area and the mono caption under it
 * (stacked on a phone). `className` places the figure in its context (a whole gallery row, the
 * space above it). In forced-colors mode the ring is replaced by a real border, which that mode
 * keeps.
 */
export function FigureFrame({
  caption,
  note,
  className,
  children,
}: {
  caption: string;
  note?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-image bg-tint ring-1 ring-rule forced-colors:border forced-colors:border-[CanvasText]">
        {children}
      </div>
      {/* Size only: the line height is the surrounding text's, as in the prototype (1.65 inside the prose). */}
      <figcaption className="mt-3 flex justify-between gap-4 font-mono text-(length:--text-label) text-text-3 max-sm:flex-col max-sm:gap-0.5">
        <span>{caption}</span>
        {note && <span>{note}</span>}
      </figcaption>
    </figure>
  );
}
