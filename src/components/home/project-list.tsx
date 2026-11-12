import Image from 'next/image';
import Link from 'next/link';
import type { Ref } from 'react';
import type { NumberedProject } from '@/content/types';

type ProjectListProps = {
  projects: NumberedProject[];
  /** The row the project viewer is showing. With no viewer (or no parent that tracks it), none. */
  activeIndex?: number;
  /** Reports which row the pointer entered or the keyboard focused, for a parent that drives a viewer. */
  onActivate?: (index: number, via: 'hover' | 'focus') => void;
  /** The pointer left the whole list (not just a row). */
  onListLeave?: () => void;
  /** A row's link lost focus. */
  onBlur?: () => void;
  /** The list element, for a parent that measures its rows. */
  listRef?: Ref<HTMLOListElement>;
  /** The one bar that marks the active row, for a parent that moves it. */
  indicatorRef?: Ref<HTMLSpanElement>;
  /** The parent has placed the shared bar: rows stop drawing their own. */
  indicatorReady?: boolean;
};

/**
 * A row is title, kind and years on one line and the description under it. Under `viewer:` the
 * thumbnail is hidden and the active row (`data-active`, set by the parent that drives the
 * viewer) shows its arrow. Until a parent has placed the shared bar (and without script) the
 * active row draws a bar of its own in the left margin, so there is never more than one.
 */
const ROW =
  'group/row relative grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-rule py-4 viewer:py-3.5';
const OWN_BAR = [
  'before:absolute before:top-3.5 before:bottom-3.5 before:-left-3.5 before:hidden before:w-0.5 before:bg-ink',
  'viewer:data-active:before:block forced-colors:before:bg-[CanvasText]',
].join(' ');
// The title is the only link. Its ::after covers the whole row, thumbnail included.
const TITLE = 'text-base font-medium text-ink after:absolute after:inset-0 after:z-1';
// A small thing that answers the pointer: it may overshoot.
const ARROW = [
  'ml-1.5 inline-block text-text-3 transition-[translate,opacity] duration-pop ease-spring-pop',
  'viewer:-translate-x-2 viewer:text-ink viewer:opacity-0',
  'viewer:group-data-active/row:translate-x-0 viewer:group-data-active/row:opacity-100',
].join(' ');
const BAR = [
  'pointer-events-none absolute top-0 -left-3.5 hidden h-px w-0.5 origin-top bg-ink will-change-transform',
  'forced-colors:bg-[CanvasText]',
].join(' ');

/**
 * "Selected work". Server-safe on purpose: with no callbacks it ships no script, and a client
 * parent can pass them in. The title is the row's only link and its ::after stretches over the
 * whole row, thumbnail included, so clicking anywhere opens the case.
 */
export function ProjectList({
  projects,
  activeIndex,
  onActivate,
  onListLeave,
  onBlur,
  listRef,
  indicatorRef,
  indicatorReady,
}: ProjectListProps) {
  return (
    // tabIndex -1: an in-page link moves focus here (see InPageLink), without an outline.
    <section
      id="work"
      aria-labelledby="work-h"
      tabIndex={-1}
      className="col-span-full focus:outline-none viewer:col-span-6 viewer:col-start-1"
    >
      <h2 id="work-h" className="sr">
        Selected work
      </h2>
      <div className="relative mt-list-top">
        <ol ref={listRef} onMouseLeave={onListLeave} className="border-t border-rule">
          {projects.map((p, i) => {
            // Spoken, not typeset: a screen reader would say "plus" for "Design + build".
            const spoken = `${p.role.replace(' + ', ' and ')}. ${p.stack.join(', ')}.`;
            return (
              <li
                key={p.slug}
                data-active={i === activeIndex ? '' : undefined}
                onMouseEnter={onActivate && (() => onActivate(i, 'hover'))}
                className={indicatorReady ? ROW : `${ROW} ${OWN_BAR}`}
              >
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  <Link
                    href={`/work/${p.slug}`}
                    aria-describedby={`desc-${p.slug} meta-${p.slug}`}
                    onFocus={onActivate && (() => onActivate(i, 'focus'))}
                    onBlur={onBlur}
                    className={TITLE}
                  >
                    {p.title}
                    <span aria-hidden="true" className={ARROW}>
                      →
                    </span>
                  </Link>
                  <span className="text-ui-sm text-text-3">{p.context}</span>
                </span>
                <span className="text-right text-ui-sm whitespace-nowrap text-text-3 tabular-nums">{p.years}</span>
                <p id={`desc-${p.slug}`} className="col-span-full mt-1 max-w-[62ch] text-ui-sm text-text-2">
                  {p.description}
                </p>
                <span id={`meta-${p.slug}`} className="sr">
                  {spoken}
                </span>
                <figure className="col-span-full mt-3.5 viewer:hidden">
                  <div className="aspect-16/10 overflow-hidden rounded-base bg-tint ring-1 ring-rule">
                    <Image
                      src={p.image.src}
                      width={p.image.width}
                      height={p.image.height}
                      sizes="100vw"
                      // The first thumbnail is what a phone paints first, so it must not wait for the lazy
                      // loader. Where the viewer hides it the browser still fetches it (about 30 KB).
                      loading={i === 0 ? 'eager' : undefined}
                      fetchPriority={i === 0 ? 'high' : undefined}
                      alt=""
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <figcaption aria-hidden="true" className="mt-2 text-small text-text-3">
                    {p.role}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ol>
        <span
          ref={indicatorRef}
          data-indicator=""
          aria-hidden="true"
          className={indicatorReady ? `${BAR} viewer:block` : BAR}
        />
      </div>
    </section>
  );
}
