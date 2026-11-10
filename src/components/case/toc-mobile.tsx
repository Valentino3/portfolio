import type { CaseSection } from '@/content/case-types';
import { SectionLink } from './section-link';

/** Below 1024px the index is a closed disclosure at the top of the body. */
export function TocMobile({ sections }: { sections: Pick<CaseSection, 'id' | 'title'>[] }) {
  return (
    <details className="mb-10 rounded-panel border border-rule px-4 py-3 text-ui leading-(--text-prose--line-height) lg:hidden">
      <summary className="cursor-pointer py-1.5 font-mono text-meta text-text-2">On this page</summary>
      <ol className="mt-2 mb-1 list-decimal pl-5">
        {sections.map(({ id, title }) => (
          <li key={id}>
            <SectionLink id={id} className="inline-block py-1.5 underline underline-offset-3">
              {title}
            </SectionLink>
          </li>
        ))}
      </ol>
    </details>
  );
}
