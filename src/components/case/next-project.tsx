import Link from 'next/link';
import type { NumberedProject } from '@/content/types';

/** The ruled link to the next case in display order (the last one leads back to the first). */
export function NextProject({ project }: { project: NumberedProject }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y border-rule py-7"
    >
      <span className="font-mono text-label text-text-3">Next project</span>{' '}
      <b className="inline-flex gap-3.5 text-next font-medium">
        {project.title}
        <span
          aria-hidden="true"
          className="transition-transform duration-medium group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5"
        >
          →
        </span>
      </b>
    </Link>
  );
}
