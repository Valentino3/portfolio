import { existsSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { printedUrl, Resume } from '@/components/cv/resume';
import { EXPERIENCE, studies, workHistory } from '@/content/experience';
import { prSummary, PULL_REQUESTS } from '@/content/open-source';
import { AVAILABILITY, languagesLine, LEDE, LOCATION, ROLE_TITLE } from '@/content/profile';
import { publishedProjects } from '@/content/projects';
import { STACK } from '@/content/stack';
import { CV_URL, EMAIL, GITHUB, HEADLINE, LINKEDIN, NAME, SITE_URL } from '@/lib/site';
import { findForbiddenTerms } from '../support/forbidden-terms';
import { PHONE_LIKE } from '../support/phone';

const html = renderToStaticMarkup(<Resume />);
/** The CV's text as read: tags dropped, entities the renderer escapes put back, spaces collapsed. */
const text = html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#x27;/g, "'")
  .replace(/\s+/g, ' ');

test('the shared experience keeps the home’s five entries, split into work and studies for the CV', () => {
  expect(EXPERIENCE.map((e) => e.when)).toEqual([
    'Jun 2022 – now',
    'Jul 2025 – now',
    '2020 – 2022',
    'Jul 2019 – Feb 2020',
    '2018',
  ]);
  expect(workHistory().map((e) => e.org)).toEqual([
    'Reset Digital',
    'alongside Reset Digital',
    'ReplaceIT',
    'Forensic Informatics (internship)',
  ]);
  expect(studies().map((e) => e.org)).toEqual(['UTN (Universidad Tecnológica Nacional)']);
});

test('a pull request reads the way the home always wrote it', () => {
  expect(PULL_REQUESTS.map(prSummary)).toEqual([
    ' (Go): moved the ResetDigital bid adapter to standard OpenRTB',
    ': the ResetDigital bid adapter forwards extended user IDs (EIDs)',
  ]);
});

test('profile copy: the languages line, and the CV headline opens the home’s', () => {
  expect(languagesLine()).toBe('Spanish (native), English (professional, spoken and written)');
  expect(HEADLINE.startsWith(ROLE_TITLE)).toBe(true);
});

test('a URL prints without its scheme or www', () => {
  expect(printedUrl(GITHUB)).toBe('github.com/Valentino3');
  expect(printedUrl(LINKEDIN)).toBe('linkedin.com/in/valentino-rota-005011209');
  expect(printedUrl('https://example.test/')).toBe('example.test');
});

test('the CV opens with the name, the headline, where, and how to reach the owner', () => {
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).toMatch(new RegExp(`<h1[^>]*>${NAME}</h1><p[^>]*>${ROLE_TITLE}</p>`));
  expect(text).toContain(`${LOCATION} · ${AVAILABILITY}`);
  expect(text).toContain(
    'Mar del Plata, Argentina · Design engineering and full-stack roles · remote (UTC−3) or on-site in Buenos Aires (relocating)',
  );
  for (const [href, label] of [
    [`mailto:${EMAIL}`, EMAIL],
    [GITHUB, 'github.com/Valentino3'],
    [LINKEDIN, 'linkedin.com/in/valentino-rota-005011209'],
  ])
    expect(html).toMatch(new RegExp(`href="${href}" class="underline-offset-3 hover:underline focus-visible:underline[^"]*">${label}</a>`));
  expect(text).toContain(LEDE);
});

test('sections in order, each with the shared content', () => {
  expect([...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1])).toEqual([
    'Experience',
    'Selected work',
    'Open source',
    'Stack',
    'Education',
    'Languages',
  ]);
  for (const { role, org, summary } of workHistory()) for (const t of [role, org, summary]) expect(text).toContain(t);
  for (const { title, context, years, description, role } of publishedProjects())
    for (const t of [title, context, years, description, role]) expect(text).toContain(t);
  for (const pr of PULL_REQUESTS) {
    expect(html).toContain(`${pr.project}</b>${prSummary(pr)}`);
    expect(html).toContain(`href="${pr.href}"`);
    // On paper the number resolves to nothing, so the address prints too.
    expect(text).toContain(printedUrl(pr.href));
  }
  for (const { group, items } of STACK) expect(text).toContain(`${group} ${items}`);
  expect(text).toContain('UTN (Universidad Tecnológica Nacional)');
  expect(text).toContain('Technical school, Personal and Professional Computer Technician');
  expect(text).toContain(languagesLine());
});

test('dates are set like the home’s: the sans, in tabular figures, never the mono face', () => {
  expect(html).not.toContain('font-mono');
  const dates = [...html.matchAll(/<span class="[^"]*tabular-nums[^"]*">(.*?)<\/span>/g)].map((m) => m[1]);
  expect(dates).toEqual([
    ...workHistory().map((e) => e.when),
    ...publishedProjects().map((p) => p.years),
    ...studies().map((e) => e.when),
  ]);
});

test('no phone number, and no unpublished term', () => {
  expect(text).not.toMatch(PHONE_LIKE);
  expect(findForbiddenTerms(html)).toEqual([]);
});

test('the phone pattern catches the usual ways of writing one, and none of the CV’s numbers', () => {
  for (const phone of ['+54 9 223 555-0100', '(223) 555-0100', '2235550100', '+1 415.555.0100'])
    expect(phone).toMatch(PHONE_LIKE);
  for (const fine of ['linkedin.com/in/valentino-rota-005011209', '#14975', 'Jul 2019 – Feb 2020', '2020 – 2022'])
    expect(fine).not.toMatch(PHONE_LIKE);
});

test('the CV link points at a PDF that is in public/, one page long', () => {
  expect(CV_URL).toBe('/valentino-rota-resume.pdf');
  const file = `public${CV_URL}`;
  expect(existsSync(file)).toBe(true);
  const pdf = readFileSync(file).toString('latin1');
  expect(pdf.startsWith('%PDF-')).toBe(true);
  expect(pdf.match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(1);
});

test('each selected project title links to its case study by an absolute URL, so it works from the PDF', () => {
  for (const { slug } of publishedProjects())
    expect(html).toContain(`<a href="${SITE_URL}/work/${slug}"`);
});

test('on a phone the contact links, PR numbers and PR addresses get a 44px hit area; print is untouched', () => {
  const tapped = html.match(/class="[^"]*max-sm:py-3\.5[^"]*"/g) ?? [];
  expect(tapped).toHaveLength(3 + 2 * PULL_REQUESTS.length);
  expect(tapped.join(' ')).not.toContain('print:');
});

test('the site address and the project titles take a tap through an invisible 44px area', () => {
  const hit = html.match(/class="[^"]*relative touch-target[^"]*"/g) ?? [];
  expect(hit).toHaveLength(1 + publishedProjects().length);
});
