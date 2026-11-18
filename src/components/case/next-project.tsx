import Link from 'next/link';
import type { ProjectSummary } from '@/content/types';

/**
 * The link to the next case in display order (the last one leads back to the first): one line,
 * "Next: Title →", as large as before and as wide as the page, between two hairlines. The arrow
 * is Geist's, like every arrow on the site (the display face's subset has none).
 */
export function NextProject({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/work/${project.slug}`} className="group mt-12 block border-y border-rule py-7 text-next">
      <span className="font-normal text-text-3">Next:</span> {project.title}{' '}
      <span
        aria-hidden="true"
        className="inline-block font-sans transition-transform duration-pop ease-spring-pop group-hover:translate-x-2 group-focus-visible:translate-x-2"
      >
        →
      </span>
    </Link>
  );
}
