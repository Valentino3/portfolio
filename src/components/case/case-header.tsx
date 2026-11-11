import Link from 'next/link';
import { kicker } from '@/content/projects';
import type { NumberedProject } from '@/content/types';

/**
 * The top of a case: the way back to the home list, then the kicker (number · context ·
 * years), the title and the dek. Everything but the dek comes from the project summary.
 */
export function CaseHeader({ project, dek }: { project: NumberedProject; dek: string }) {
  return (
    <>
      <Link
        href="/#work"
        className="group mt-back-top inline-flex gap-2 py-1.5 font-mono text-meta text-text-3 hover:text-ink focus-visible:text-ink pointer-coarse:py-2.75"
      >
        <span aria-hidden="true" className="transition-transform duration-medium group-hover:-translate-x-0.75">←</span> All work
      </Link>
      <div className="mt-4 max-w-[57.5rem]">
        <span data-kicker="" className="font-mono text-meta text-text-3">
          {kicker(project)}
        </span>
        <h1 className="mt-2.5 mb-4.5 text-display font-medium">{project.title}</h1>
        <p className="max-w-[54ch] text-dek text-text-2">{dek}</p>
      </div>
    </>
  );
}
