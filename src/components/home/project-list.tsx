import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, Ref } from 'react';
import type { ProjectSummary, ThumbnailCrop } from '@/content/types';

type ProjectListProps = {
  projects: ProjectSummary[];
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
 * A row is title, context and years on one line and the description under it. Under `viewer:`
 * the thumbnail is hidden and the active row (`data-active`, set by the parent that drives the
 * viewer) is marked by one bar in the left margin. Until a parent has placed the shared bar (and
 * without script) the active row draws a bar of its own, so there is never more than one.
 * Under `side-thumb:` (1024px up, no viewer) the thumbnail takes a third column beside the text,
 * across both lines; the second line takes any height the picture adds. The years get a fixed
 * column there, so every row's thumbnail lines up whatever its dates.
 */
const ROW = [
  'relative grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-rule py-4 side-thumb:py-3 viewer:py-3',
  'side-thumb:grid-cols-[minmax(0,1fr)_6.5rem_15rem] side-thumb:grid-rows-[auto_auto_1fr] side-thumb:gap-x-8',
].join(' ');
const OWN_BAR = [
  'before:absolute before:top-3 before:bottom-3 before:-left-3.5 before:hidden before:w-0.5 before:bg-ink',
  'viewer:data-active:before:block forced-colors:before:bg-[CanvasText]',
].join(' ');
// The title is the only link. Its ::after covers the whole row, thumbnail included.
const TITLE = 'text-card leading-snug font-medium text-ink after:absolute after:inset-0 after:z-1';
// Context and years: a step under the title in size, read in the body color, not the faintest one.
const META = 'text-ui text-text-2';
const THUMB = 'size-full object-cover object-top';
// Under 640px a crop zooms into one region; the transform sits on the image, the box clips it.
const CROP = 'max-sm:origin-(--crop-origin) max-sm:scale-(--crop-zoom)';

/** The crop as the two custom properties CROP reads. */
const cropStyle = ({ x, y, zoom }: ThumbnailCrop) =>
  ({ '--crop-origin': `${x}% ${y}%`, '--crop-zoom': zoom }) as CSSProperties;

/**
 * The thumbnail spans the screen's width, or a 15rem column beside the text from 1024px. A cropped one is drawn up to twice as wide on a phone, so
 * it asks for a sharper file there (capped at 2x: past that the file costs more than the text gains).
 */
const thumbSizes = (crop?: ThumbnailCrop) =>
  `${crop ? `(max-width: 639px) ${Math.round(Math.min(crop.zoom, 2) * 100)}vw, ` : ''}(min-width: 1024px) 240px, 100vw`;
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
                  </Link>
                  <span className={META}>{p.context}</span>
                </span>
                <span className={`text-right whitespace-nowrap tabular-nums ${META}`}>{p.years}</span>
                <p id={`desc-${p.slug}`} className="col-span-full mt-1 max-w-[62ch] text-base text-text-2 side-thumb:col-span-2">
                  {p.description}
                </p>
                <span id={`meta-${p.slug}`} className="sr">
                  {spoken}
                </span>
                {/* The role closes the row's text, above the picture on a phone and beside it from
                    1024px. As a caption under the picture it sat as near the next row as its own. */}
                <p aria-hidden="true" className="col-span-full mt-2 text-ui-sm text-text-3 side-thumb:col-span-2 viewer:hidden">
                  {p.role}
                </p>
                <figure className="col-span-full mt-3.5 viewer:hidden side-thumb:col-span-1 side-thumb:col-start-3 side-thumb:row-span-3 side-thumb:row-start-1 side-thumb:mt-1 side-thumb:self-start">
                  <div className="aspect-16/10 overflow-hidden rounded-base bg-tint ring-1 ring-rule">
                    <Image
                      src={p.image.src}
                      width={p.image.width}
                      height={p.image.height}
                      sizes={thumbSizes(p.crop)}
                      // The first thumbnail is what a phone paints first, so it must not wait for the lazy
                      // loader. Where the viewer hides it the browser still fetches it (about 30 KB).
                      loading={i === 0 ? 'eager' : undefined}
                      fetchPriority={i === 0 ? 'high' : undefined}
                      alt=""
                      style={p.crop && cropStyle(p.crop)}
                      className={p.crop ? `${THUMB} ${CROP}` : THUMB}
                    />
                  </div>
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
