import type { ReactNode } from 'react';

/** The ruled mono label that opens a home section: a title and, optionally, a note on the right. */
export function SectionHead({ id, title, note }: { id?: string; title: string; note?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3.5">
      <h2 id={id} className="font-mono text-label font-normal text-text-3">
        {title}
      </h2>
      {note && <p className="font-mono text-label text-text-3">{note}</p>}
    </div>
  );
}
