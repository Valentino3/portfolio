import { Fragment, type ReactNode } from 'react';

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

/*
 * The labelled cards below are what the cases not yet rewritten as prose still use (DSP2,
 * Analyzer, Bakery concept). Only their labels changed: out of the mono face.
 */
export type DecisionLabel = 'Instead of' | 'Why' | 'Result' | 'Context' | 'Before publishing';

/** The stack of decision cards in a section. */
export function DecisionCards({ children }: { children: ReactNode }) {
  return <div className="mt-4.5 grid grid-cols-[minmax(0,1fr)] gap-3.5">{children}</div>;
}

/**
 * One decision, told as "Instead of / Why / Result" (Context and Before publishing where a case
 * has them). A case passes only the rows it has: a missing one is left out, never invented.
 * An optional figure goes under the rows.
 */
export function DecisionCard({
  title,
  rows,
  figure,
}: {
  title: string;
  rows: [DecisionLabel, ReactNode][];
  figure?: ReactNode;
}) {
  return (
    <article className="rounded-panel border border-rule bg-surface px-5 py-4.5">
      <h3 className="mb-3 text-card font-medium">{title}</h3>
      <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-base max-sm:grid-cols-1 max-sm:gap-y-0.5">
        {rows.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="pt-0.75 text-small text-text-3 max-sm:not-first:mt-2">{label}</dt>
            <dd className="text-text-2">{value}</dd>
          </Fragment>
        ))}
      </dl>
      {figure && <div className="mt-4">{figure}</div>}
    </article>
  );
}
