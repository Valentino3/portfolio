import type { Fact } from '@/content/case-types';

/** The four facts under the dek: 4 columns, then 2, then 1. Links in a value are underlined. */
export function Facts({ facts }: { facts: Fact[] }) {
  return (
    <dl className="grid-12 mt-case-block gap-y-5.5 border-t border-rule pt-4.5 text-ui-sm text-text-2 [&_a]:underline [&_a]:underline-offset-3">
      {facts.map(({ label, value }) => (
        <div key={label} className="col-span-3 max-lg:col-span-6 max-sm:col-span-full">
          <dt className="mb-1.5 font-mono text-label text-text-3">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
