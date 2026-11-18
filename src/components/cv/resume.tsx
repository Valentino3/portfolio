import type { ReactNode } from 'react';
import { studies, workHistory } from '@/content/experience';
import { OPEN_SOURCE_INTRO, prSummary, PULL_REQUESTS } from '@/content/open-source';
import { AVAILABILITY, languagesLine, LEDE, LOCATION, ROLE_TITLE, SECONDARY_SCHOOL } from '@/content/profile';
import { publishedProjects } from '@/content/projects';
import { STACK } from '@/content/stack';
import { EMAIL, GITHUB, LINKEDIN, NAME, SITE_URL } from '@/lib/site';

/** A URL as it reads on paper: no scheme, no "www.", no trailing slash. */
export const printedUrl = (url: string): string => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/* Under 640px an address may break anywhere, so a long one never widens the page (reflow at 320px, 200% text). */
const LINK = 'underline-offset-3 hover:underline focus-visible:underline max-sm:[overflow-wrap:anywhere]';

/* On a phone the contact links, the pull request numbers and their printed addresses are one short line
   high: padding grows them to 44px. Only under 640px, so the A4 sheet, which prints wider, keeps its
   layout and its single page. */
const TAP = 'max-sm:inline-block max-sm:py-3.5';

/* Links inside running lines (the site address, the project titles) can't grow without opening gaps in
   the text: on a touch screen an invisible 44px area around each one takes the tap instead. */
const HIT = 'relative touch-target';

/** Dates and pull request numbers, set like the home's dates: the sans, quieter, in tabular figures. */
const DATA = 'shrink-0 text-text-3 tabular-nums max-sm:shrink';

/**
 * One section: its heading in the narrow left column, its entries in the wide right one, a
 * hairline across the sheet above both. Under 640px the heading sits above the entries.
 */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={id}
      className="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 border-t border-rule pt-2 max-sm:grid-cols-1 max-sm:gap-y-1.5"
    >
      <h2 id={id} className="font-medium text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The title line of an entry: who or what on the left, the date (or number) at the far right. */
function TitleLine({ children, data }: { children: ReactNode; data?: ReactNode }) {
  return (
    <p className="flex items-baseline justify-between gap-x-4 max-sm:flex-wrap">
      <span>{children}</span>
      {data}
    </p>
  );
}

/** Space between the entries of a list. */
const ENTRIES = 'space-y-1.5';

/**
 * The CV, built from the same content as the home: the hero lede, the experience, the projects,
 * open source and stack. One A4 sheet: on screen a centered page, in print the page itself.
 * Every link prints its own address, so the paper copy needs no clicking.
 */
export function Resume() {
  return (
    <article
      data-cv-sheet=""
      className="mx-auto w-full max-w-sheet border border-rule bg-paper px-5 py-6 text-small leading-cv text-text-2 sm:px-sheet-x sm:py-sheet-y print:border-0"
    >
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <hgroup className="flex flex-wrap items-baseline gap-x-3 text-cv-name font-medium">
            <h1 className="text-ink">{NAME}</h1>
            <p className="text-text-3">{ROLE_TITLE}</p>
          </hgroup>
          <a href={SITE_URL} className={`text-ink ${LINK} ${HIT}`}>
            {printedUrl(SITE_URL)}
          </a>
        </div>
        <p className="mt-1.5">
          {LOCATION} · {AVAILABILITY}
        </p>
        <ul aria-label="Contact" className="flex flex-wrap gap-x-5 gap-y-1.5 text-ink max-sm:gap-y-0">
          {[`mailto:${EMAIL}`, GITHUB, LINKEDIN].map((href) => (
            <li key={href}>
              <a href={href} className={`${LINK} ${TAP}`}>
                {href.startsWith('mailto:') ? EMAIL : printedUrl(href)}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-[88ch]">{LEDE}</p>
      </header>

      <Section id="cv-experience" title="Experience">
        <ul className={ENTRIES}>
          {workHistory().map(({ when, role, org, summary }) => (
            <li key={role}>
              <TitleLine data={<span className={DATA}>{when}</span>}>
                <b className="font-medium text-ink">{role}</b>, {org}
              </TitleLine>
              <p>{summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="cv-work" title="Selected work">
        <ul className={ENTRIES}>
          {publishedProjects().map(({ slug, title, context, years, description, role }) => (
            <li key={slug}>
              <TitleLine data={<span className={DATA}>{years}</span>}>
                {/* Absolute, so the link still works from the PDF; nothing is printed beside it, there is no room. */}
                <b className="font-medium text-ink">
                  <a href={`${SITE_URL}/work/${slug}`} className={`${LINK} ${HIT}`}>
                    {title}
                  </a>
                </b>
                , {context} · {role}
              </TitleLine>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="cv-oss" title="Open source">
        <div>
          <p>{OPEN_SOURCE_INTRO}</p>
          {/* Spaced like the other lists, which also keeps the two number links 24px apart (the addresses below, too). */}
          <ul className={`mt-1 ${ENTRIES}`}>
            {PULL_REQUESTS.map((pr) => (
              <li key={pr.href}>
                <TitleLine
                  data={
                    <a href={pr.href} className={`${DATA} ${LINK} ${TAP}`}>
                      {`#${pr.number}`}
                    </a>
                  }
                >
                  <b className="font-medium text-ink">{pr.project}</b>
                  {prSummary(pr)}
                </TitleLine>
              </li>
            ))}
          </ul>
          {/* On paper a number resolves to nothing: one line under the list prints both addresses. */}
          {/* Stacked on a phone, each one is a 44px target; print keeps one line. */}
          <p className="mt-1 flex flex-wrap gap-x-6 text-text-3">
            {PULL_REQUESTS.map((pr) => (
              <a key={pr.href} href={pr.href} className={`${LINK} ${TAP}`}>
                {printedUrl(pr.href)}
              </a>
            ))}
          </p>
        </div>
      </Section>

      <Section id="cv-stack" title="Stack">
        <ul>
          {STACK.map(({ group, items }) => (
            <li key={group}>
              <b className="mr-1.5 font-medium text-ink">{group}</b> {items}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="cv-education" title="Education">
        <ul className={ENTRIES}>
          {studies().map(({ when, org, summary }) => (
            <li key={org}>
              <TitleLine data={<span className={DATA}>{when}</span>}>
                <b className="font-medium text-ink">{org}</b>
              </TitleLine>
              <p>{summary}</p>
            </li>
          ))}
          <li className="text-text-3">
            {SECONDARY_SCHOOL.school}, {SECONDARY_SCHOOL.degree}
          </li>
        </ul>
      </Section>

      <Section id="cv-languages" title="Languages">
        <p>{languagesLine()}</p>
      </Section>
    </article>
  );
}
