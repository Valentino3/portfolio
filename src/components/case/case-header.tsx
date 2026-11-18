import type { ReactNode } from 'react';
import { InPageLink } from '@/components/site/in-page-link';
import type { ProjectSummary } from '@/content/types';

/**
 * The top of a case: the way back to the home list, then the title and the dek. The ch unit is the
 * width of a zero, wider than the average letter of Geist, so 46ch holds lines of about 70
 * characters, not 46.
 */
export function CaseHeader({ project, dek }: { project: ProjectSummary; dek: string }) {
  return (
    <>
      <InPageLink
        href="/#work"
        className="group mt-back-top inline-flex gap-2 py-1.5 text-ui-sm text-text-3 hover:text-ink focus-visible:text-ink pointer-coarse:py-2.75"
      >
        <span
          aria-hidden="true"
          className="transition-transform duration-pop ease-spring-pop group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
        >
          ←
        </span>{' '}
        All work
      </InPageLink>
      <div className="mt-3 max-w-[57.5rem]">
        <h1 className="mb-4.5 text-display font-medium">{project.title}</h1>
        <p className="max-w-[46ch] text-dek text-text-2">{dek}</p>
      </div>
    </>
  );
}

/**
 * The facts of a case as two short paragraphs under the dek, with no labels: whose work it was
 * and when (from the project summary), who did what for whom, then what it is built with and
 * where to see it. Links in them are underlined. The first paragraph carries the role, which a
 * hiring manager looks for, so it is set in the body color; the stack and the sources stay quiet.
 * 50ch holds lines of about 70 characters (a zero is wider than the average letter).
 */
export function CaseMeta({ project, meta }: { project: ProjectSummary; meta: [ReactNode, ReactNode] }) {
  return (
    <div
      data-case-meta=""
      className="mt-5 max-w-[50ch] space-y-1.5 text-ui text-text-3 [&_a]:text-text-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-ink"
    >
      <p className="text-text-2">
        <span className="tabular-nums">
          {project.context}, {project.years}.
        </span>{' '}
        {meta[0]}
      </p>
      <p>{meta[1]}</p>
    </div>
  );
}
