import { Fragment, type ReactNode } from 'react';

export type DecisionLabel = 'Instead of' | 'Why' | 'Result' | 'Context' | 'Before publishing';

/** The stack of decision cards in a section. */
export function DecisionCards({ children }: { children: ReactNode }) {
  return <div className="mt-4.5 grid gap-3.5">{children}</div>;
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
            <dt className="pt-0.75 font-mono text-label text-text-3 max-sm:not-first:mt-2">{label}</dt>
            <dd className="text-text-2">{value}</dd>
          </Fragment>
        ))}
      </dl>
      {figure && <div className="mt-4">{figure}</div>}
    </article>
  );
}
