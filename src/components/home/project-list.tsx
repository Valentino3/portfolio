import Image from 'next/image';
import Link from 'next/link';
import type { NumberedProject } from '@/content/types';

type ProjectListProps = {
  projects: NumberedProject[];
  /** The row the project viewer is showing. With no viewer (or no parent that tracks it), none. */
  activeIndex?: number;
  /** Reports which row the pointer entered or the keyboard focused, for a parent that drives a viewer. */
  onActivate?: (index: number, via: 'hover' | 'focus') => void;
};

/**
 * Without a viewer a row is a plain list item: ink title, visible arrow, thumbnail.
 * Under `viewer:` it is dimmed until `data-active` (set by the parent that drives
 * the viewer) brings in the ink title, the arrow and a bar in the left margin.
 */
const ROW = [
  'group/row relative grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-baseline border-b border-rule pt-3.5 pb-3.75',
  'before:absolute before:top-3.5 before:bottom-3.75 before:-left-3.5 before:hidden before:w-0.5 before:scale-y-0 before:bg-ink',
  'before:transition-transform before:duration-medium viewer:before:block viewer:data-active:before:scale-y-100',
  'forced-colors:before:bg-[CanvasText]',
].join(' ');
// The title is the only link. Its ::after covers the whole row, thumbnail included.
const TITLE = [
  'text-base font-medium text-ink transition-colors after:absolute after:inset-0 after:z-1',
  'viewer:text-text-2 viewer:group-data-active/row:text-ink viewer:focus-visible:text-ink',
].join(' ');
const ARROW = [
  'ml-2 inline-block text-text-3 transition duration-medium',
  'viewer:-translate-x-2 viewer:text-inherit viewer:opacity-0',
  'viewer:group-data-active/row:translate-x-0 viewer:group-data-active/row:opacity-100',
].join(' ');

/**
 * "Selected work". Server-safe on purpose: with no callbacks it ships no
 * script, and a client parent can pass them in. The title is the row's only
 * link and its ::after stretches over the whole row, thumbnail included, so
 * clicking anywhere opens the case.
 *
 * Under the `viewer` variant the thumbnails are hidden and the active row is
 * marked by `data-active`; otherwise every row shows its own 16:10 image.
 */
export function ProjectList({ projects, activeIndex, onActivate }: ProjectListProps) {
  return (
    <section id="work" aria-labelledby="work-h" className="col-span-full viewer:col-span-6 viewer:col-start-1">
      <h2 id="work-h" className="sr">
        Selected work
      </h2>
      <ol className="mt-list-top border-t border-rule">
        {projects.map((p, i) => {
          // Spoken, not typeset: a screen reader would say "plus" for "Design + build".
          const spoken = `${p.role.replace(' + ', ' and ')}. ${p.stack.join(', ')}.`;
          return (
            <li
              key={p.slug}
              data-active={i === activeIndex ? '' : undefined}
              onMouseEnter={onActivate && (() => onActivate(i, 'hover'))}
              className={ROW}
            >
              <span className="font-mono text-meta text-text-3" aria-hidden="true">
                {p.number}
              </span>
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  href={`/work/${p.slug}`}
                  aria-describedby={`desc-${p.slug} meta-${p.slug}`}
                  onFocus={onActivate && (() => onActivate(i, 'focus'))}
                  className={TITLE}
                >
                  {p.title}
                  <span aria-hidden="true" className={ARROW}>
                    →
                  </span>
                </Link>
                <span className="rounded-full border border-rule-strong px-2 py-px font-mono text-chip text-text-3">
                  {p.context}
                </span>
              </span>
              <span className="pl-4 text-right font-mono text-meta whitespace-nowrap text-text-3">{p.years}</span>
              <p id={`desc-${p.slug}`} className="col-span-2 col-start-2 mt-1 text-ui-sm text-text-3">
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
                <figcaption
                  aria-hidden="true"
                  className="mt-2.5 flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-label text-text-3"
                >
                  <span>{p.role}</span>
                  <span>{p.stack.join(' · ')}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
