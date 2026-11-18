import { ExternalLink } from '@/components/site/external-link';
import { OPEN_SOURCE_INTRO, prSummary, PULL_REQUESTS } from '@/content/open-source';
import { SectionHead } from './section-head';

/** The merged pull requests. The page places it (`className`) and sets the space above it. */
export function OpenSource({ className = '' }: { className?: string }) {
  return (
    <section aria-labelledby="oss-h" className={`scroll-mt-6 ${className}`}>
      <SectionHead id="oss-h" title="Open source" />
      <p className="mt-4 mb-1 max-w-[64ch] text-base text-text-2">{OPEN_SOURCE_INTRO}</p>
      <ul>
        {PULL_REQUESTS.map((pr) => (
          <li key={pr.href} className="border-b border-rule">
            <ExternalLink
              href={pr.href}
              className="group/pr grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 text-base text-text-2 max-sm:grid-cols-1"
            >
              <span>
                <b className="font-medium text-ink underline-offset-3 group-hover/pr:underline group-focus-visible/pr:underline">
                  {pr.project}
                </b>
                {prSummary(pr)}
              </span>
              <span className="text-ui whitespace-nowrap text-ok">
                Merged, <span className="figures">{`#${pr.number}`}</span>{' '}
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-pop ease-spring-pop group-hover/pr:translate-x-0.5 group-hover/pr:-translate-y-0.5 group-focus-visible/pr:translate-x-0.5 group-focus-visible/pr:-translate-y-0.5"
                >
                  ↗
                </span>
              </span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
