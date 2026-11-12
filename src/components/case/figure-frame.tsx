import type { ReactNode } from 'react';

/**
 * What a figure and a clip share: the rounded, ringed picture area and the mono caption under it
 * (a caption is data, the one place the mono face is used for text). `note` says where the
 * picture comes from when that is not already said; `action` is a control that belongs to the
 * picture (the Play/Pause of a clip) and sits at the end of the caption row, never over the
 * picture. `className` places the figure in its context. In forced-colors mode the ring is
 * replaced by a real border, which that mode keeps.
 */
export function FigureFrame({
  caption,
  note,
  action,
  className,
  children,
}: {
  caption: string;
  note?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-image bg-tint ring-1 ring-rule forced-colors:border forced-colors:border-[CanvasText]">
        {children}
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <figcaption className="min-w-0 grow justify-between gap-x-4 font-mono text-caption text-text-3 sm:flex">
          <span>{caption}</span>
          {note && (
            <>
              {' '}
              <span>
                <span className="sm:hidden">(</span>
                {note}
                <span className="sm:hidden">)</span>
              </span>
            </>
          )}
        </figcaption>
        {action}
      </div>
    </figure>
  );
}
