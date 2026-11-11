import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { CaseCta } from '@/components/case/case-cta';
import { Contact } from '@/components/home/contact';
import { ExperienceAbout } from '@/components/home/experience-about';
import { ProjectList } from '@/components/home/project-list';
import { InPageLink, inPageTarget } from '@/components/site/in-page-link';
import { publishedProjects } from '@/content/projects';

test('before the script runs, an in-page link is a plain anchor to its fragment', () => {
  expect(renderToStaticMarkup(<InPageLink href="#contact">Contact</InPageLink>)).toBe('<a href="#contact">Contact</a>');
  expect(renderToStaticMarkup(<InPageLink href="/#work">All work</InPageLink>)).toBe('<a href="/#work">All work</a>');
});

test('focus follows a fragment of the current page, not one of another route', () => {
  expect(inPageTarget('#contact', '/')).toBe('contact');
  expect(inPageTarget('#top', '/work/dsp2')).toBe('top');
  expect(inPageTarget('/#work', '/')).toBe('work');
  // From a case, "/#work" is a fragment of the home: it scrolls there on arrival, nothing to focus here.
  expect(inPageTarget('/#work', '/work/dsp2')).toBeNull();
  expect(inPageTarget('#', '/')).toBeNull();
  expect(inPageTarget('/work/dsp2', '/work/dsp2')).toBeNull();
});

test('every in-page target can take focus without joining the tab order', () => {
  const targets = [
    [renderToStaticMarkup(<ProjectList projects={publishedProjects()} />), 'work'],
    [renderToStaticMarkup(<ExperienceAbout />), 'about'],
    [renderToStaticMarkup(<Contact />), 'contact'],
    [renderToStaticMarkup(<CaseCta />), 'contact'],
  ];
  for (const [html, id] of targets) {
    const section = html.match(new RegExp(`<section id="${id}"[^>]*>`))?.[0];
    expect(section, id).toContain('tabindex="-1"');
    // Focused from script, so no outline: the scroll already shows where the reader is.
    expect(section, id).toContain('focus:outline-none');
  }
});
