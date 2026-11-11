'use client';

import { useEffect, useState } from 'react';
import type { CaseSection } from '@/content/case-types';
import { InPageLink } from '@/components/site/in-page-link';

/** The band of the viewport (30% to 40% from the top) a section has to cross to become current. */
const BAND = '-30% 0px -60% 0px';

/**
 * The sticky index beside the body, from 1024px up. The last section inside the band is marked
 * `aria-current="location"`; with none in it (above the first section, say), none is.
 */
export function Toc({ sections }: { sections: Pick<CaseSection, 'id' | 'title'>[] }) {
  const [current, setCurrent] = useState<string>();

  useEffect(() => {
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) inBand.add(target.id);
          else inBand.delete(target.id);
        }
        setCurrent(sections.filter(({ id }) => inBand.has(id)).pop()?.id);
      },
      { rootMargin: BAND },
    );
    for (const { id } of sections) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-8 col-span-2 self-start text-small max-lg:hidden">
      <p className="mb-2 font-mono text-label text-text-3">On this page</p>
      <ol className="border-l border-rule">
        {sections.map(({ id, title }) => (
          <li key={id}>
            <InPageLink
              href={`#${id}`}
              aria-current={id === current ? 'location' : undefined}
              className="-ml-px block border-l border-transparent py-1.5 pl-3.5 text-text-3 transition-colors hover:text-ink aria-[current=location]:border-ink aria-[current=location]:text-ink"
            >
              {title}
            </InPageLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
