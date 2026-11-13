import { ExternalLink } from '@/components/site/external-link';
import { SectionHead } from './section-head';

const PRS = [
  {
    href: 'https://github.com/prebid/prebid-server/pull/4475',
    project: 'Prebid Server',
    summary: ' (Go): moved the ResetDigital bid adapter to standard OpenRTB',
    number: '#4475',
  },
  {
    href: 'https://github.com/prebid/Prebid.js/pull/14975',
    project: 'Prebid.js',
    summary: ': the ResetDigital bid adapter forwards extended user IDs (EIDs)',
    number: '#14975',
  },
];

export function OpenSource() {
  return (
    <section aria-labelledby="oss-h" className="mt-section scroll-mt-6">
      <SectionHead id="oss-h" title="Open source" />
      <p className="mt-4 mb-1 max-w-[64ch] text-text-2">
        Prebid is widely used open-source software for running online ad auctions. These changes are now part of it.
      </p>
      <ul>
        {PRS.map(({ href, project, summary, number }) => (
          <li key={href} className="border-b border-rule">
            <ExternalLink
              href={href}
              className="group/pr grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 text-text-2 max-sm:grid-cols-1"
            >
              <span>
                <b className="font-medium text-ink underline-offset-3 group-hover/pr:underline group-focus-visible/pr:underline">
                  {project}
                </b>
                {summary}
              </span>
              <span className="text-ui-sm whitespace-nowrap text-ok tabular-nums">
                Merged, {number}{' '}
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
