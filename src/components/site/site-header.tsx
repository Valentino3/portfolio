import Link from 'next/link';
import { AVAILABILITY } from '@/content/profile';
import { CV_PAGE } from '@/lib/site';
import { InPageLink } from './in-page-link';

type Variant = 'home' | 'case' | 'cv' | 'other';

/**
 * Home links to its own sections; a case study links back to the home ones, except Contact, its
 * own block at the end. Any other page (the CV, the 404) has no sections: all three go to the home.
 */
const SECTIONS: Record<Exclude<Variant, 'cv'>, { label: string; href: `#${string}` | `/#${string}` }[]> = {
  home: [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  case: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '#contact' },
  ],
  other: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],
};

// Touch targets grow on coarse pointers; the 6px rhythm is for mouse users.
const TARGET = 'touch-target relative py-1.5 pointer-coarse:py-2.75';

/**
 * Rendered by each page, not by the layout: only the page knows its variant.
 * The `id="top"` + `tabIndex={-1}` pair is what "Back to top" lands on, so
 * focus moves with the scroll. The section links come first, in page order, then the CV, a
 * page of its own: on /cv it is the current page, in ink like the name. The strip is the
 * availability line, roles and where in one sentence; the location is in the footer. On a phone
 * the gaps tighten, and tighten again under 360px, so the name and the four links keep one line.
 */
export function SiteHeader({ variant }: { variant: Variant }) {
  const onCv = variant === 'cv';
  return (
    <header
      id="top"
      tabIndex={-1}
      className="flex flex-wrap items-baseline gap-x-7 gap-y-1 pt-header-top text-ui-sm focus:outline-none max-sm:gap-x-6 max-xs:gap-x-3"
    >
      <Link href="/" className={`${TARGET} font-semibold`}>
        Valentino Rota
      </Link>
      <nav aria-label="Primary" className="flex flex-wrap gap-x-5.5 text-text-3 max-sm:gap-x-4.5 max-xs:gap-x-2.75">
        {SECTIONS[onCv ? 'other' : variant].map(({ label, href }) => (
          <InPageLink key={label} href={href} className={`link-u ${TARGET}`}>
            {label}
          </InPageLink>
        ))}
        <Link
          href={CV_PAGE}
          aria-current={onCv ? 'page' : undefined}
          className={`link-u ${TARGET}${onCv ? ' text-ink' : ''}`}
        >
          CV
        </Link>
      </nav>
      <p className="ml-auto flex items-baseline gap-2 text-balance text-ink max-sm:ml-0 max-sm:w-full">
        {/* A status marker, still: it says "available" by its color and place, not by moving. */}
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-available" />
        {AVAILABILITY}
      </p>
    </header>
  );
}
