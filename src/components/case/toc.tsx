'use client';

import { useEffect, useRef, useState } from 'react';
import type { CaseSection } from '@/content/case-types';
import { InPageLink } from '@/components/site/in-page-link';
import { createSpring, type Spring } from '@/lib/spring';

/** The band of the viewport (30% to 40% from the top) a section has to cross to become current. */
const BAND = '-30% 0px -60% 0px';
/** Critically damped: the marker answers the scroll, it has nothing to bounce off. */
const MARKER_SPRING = { response: 0.32, damping: 1 };

/**
 * The sticky index beside the body, from 1024px up: a list of section names on a hairline rail,
 * with no label (the nav's accessible name says what it is). The last section inside the band is
 * marked `aria-current="location"`; with none in it (above the first section, say), none is.
 *
 * One ink marker on the rail shows the current entry. It slides between entries on a spring
 * that is retargeted when the scroll changes direction; it appears in place, without travelling,
 * when there was no current entry before.
 */
export function Toc({ sections }: { sections: Pick<CaseSection, 'id' | 'title'>[] }) {
  const [current, setCurrent] = useState<string>();
  const list = useRef<HTMLOListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const spring = useRef<Spring>(null);
  const shown = useRef(false);

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

  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const bound = createSpring([0, 0], MARKER_SPRING, ([y, height]) => {
      element.style.transform = `translateY(${y}px) scaleY(${Math.max(0, height)})`;
    });
    spring.current = bound;
    return () => bound.stop();
  }, []);

  useEffect(() => {
    const element = marker.current;
    const rail = list.current;
    const index = sections.findIndex(({ id }) => id === current);
    const item = rail?.children[index] as HTMLElement | undefined;
    if (!element || !rail) return;
    if (!item) {
      element.style.opacity = '0';
      shown.current = false;
      return;
    }
    const target = () => [item.offsetTop, item.offsetHeight];
    if (shown.current) spring.current?.to(target());
    else spring.current?.jump(target());
    element.style.opacity = '1';
    shown.current = true;
    // A reflow (a resize, a font that arrives) moves the entry: the marker follows, unanimated. The
    // observer also reports once when it starts; that one is skipped, or it would cut the slide short.
    let started = false;
    const observer = new ResizeObserver(() => {
      if (started) spring.current?.jump(target());
      started = true;
    });
    observer.observe(rail);
    return () => observer.disconnect();
  }, [current, sections]);

  return (
    <nav aria-label="On this page" className="sticky top-8 col-span-2 self-start text-small max-lg:hidden">
      <div className="relative border-l border-rule">
        <ol ref={list}>
          {sections.map(({ id, title }) => (
            <li key={id}>
              <InPageLink
                href={`#${id}`}
                aria-current={id === current ? 'location' : undefined}
                className="block py-1.5 pl-3.5 text-text-3 transition-colors hover:text-ink aria-[current=location]:text-ink"
              >
                {title}
              </InPageLink>
            </li>
          ))}
        </ol>
        <span
          ref={marker}
          data-toc-marker=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 -left-px h-px w-px origin-top bg-ink opacity-0 transition-opacity duration-fast forced-colors:bg-[CanvasText]"
        />
      </div>
    </nav>
  );
}
