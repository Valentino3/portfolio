import Link from 'next/link';
import type { ProjectSummary } from '@/content/types';

/**
 * The link to the next case in display order (the last one leads back to the first): one line,
 * "Next: Title →", as large as before and as wide as the page, between two hairlines.
 */
export function NextProject({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/work/${project.slug}`} className="group mt-12 block border-y border-rule py-7 text-next font-medium">
      <span className="font-normal text-text-3">Next:</span> {project.title}{' '}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-pop ease-spring-pop group-hover:translate-x-2 group-focus-visible:translate-x-2"
      >
        →
      </span>
    </Link>
  );
}
