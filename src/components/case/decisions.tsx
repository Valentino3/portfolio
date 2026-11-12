import type { ReactNode } from 'react';

/**
 * A decision is a title and prose: the alternative and the reasoning are written into the
 * sentences, and what came of it is set apart in ink (`Result`). No box: a hairline above each
 * title and space separate them.
 */
export function Decisions({ children }: { children: ReactNode }) {
  return <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-7">{children}</div>;
}

export function Decision({ title, children, figure }: { title: string; children: ReactNode; figure?: ReactNode }) {
  return (
    <article className="border-t border-rule pt-5 [&>p]:mb-2 [&>p:last-of-type]:mb-0">
      <h3 className="mb-1.5 text-card font-medium">{title}</h3>
      {children}
      {figure && <div className="mt-5">{figure}</div>}
    </article>
  );
}

/** What a decision led to: a paragraph, or the end of one (`inline`), in ink and a step heavier. */
export function Result({ children, inline }: { children: ReactNode; inline?: boolean }) {
  const Tag = inline ? 'span' : 'p';
  return <Tag className="font-book text-ink">{children}</Tag>;
}
