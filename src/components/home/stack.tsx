import { STACK } from '@/content/stack';
import { SectionHead } from './section-head';

/**
 * What I work with: four run-in groups. Two per row from 640px, while the section has the page's
 * width; one per row from 1024px, where it shares a row with Open source and has half of it. The
 * page places it (`className`) and sets the space above it.
 */
export function Stack({ className = '' }: { className?: string }) {
  return (
    <section aria-labelledby="stack-h" className={className}>
      <SectionHead id="stack-h" title="Stack" />
      <ul className="mt-4 grid grid-cols-2 gap-x-(--spacing-grid-gap) gap-y-1.5 text-base text-text-2 max-sm:grid-cols-1 lg:grid-cols-1">
        {STACK.map(({ group, items }) => (
          <li key={group}>
            <b className="mr-1.5 font-medium text-ink">{group}</b> {items}
          </li>
        ))}
      </ul>
    </section>
  );
}
