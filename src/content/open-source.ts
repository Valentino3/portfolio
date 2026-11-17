/** One merged pull request to an open-source project. */
export type PullRequest = {
  href: string;
  project: string;
  /** The project's language, when the project name does not already say it. */
  language?: string;
  change: string;
  number: number;
};

export const OPEN_SOURCE_INTRO =
  'Prebid is widely used open-source software for running online ad auctions. These changes are now part of it.';

export const PULL_REQUESTS: PullRequest[] = [
  {
    href: 'https://github.com/prebid/prebid-server/pull/4475',
    project: 'Prebid Server',
    language: 'Go',
    change: 'moved the ResetDigital bid adapter to standard OpenRTB',
    number: 4475,
  },
  {
    href: 'https://github.com/prebid/Prebid.js/pull/14975',
    project: 'Prebid.js',
    change: 'the ResetDigital bid adapter forwards extended user IDs (EIDs)',
    number: 14975,
  },
];

/** What follows the project name: " (Go): moved …", or ": the … adapter …" when there is no language. */
export const prSummary = ({ language, change }: PullRequest): string =>
  `${language ? ` (${language})` : ''}: ${change}`;
