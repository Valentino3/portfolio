import Link from 'next/link';
import { InPageLink } from './in-page-link';

type Variant = 'home' | 'case' | 'other';

/**
 * Home links to its own sections; a case study links back to the home ones, except Contact, its
 * own block at the end. Any other page (the 404) has no sections: all three go to the home.
 */
const NAV: Record<Variant, { label: string; href: `#${string}` | `/#${string}` }[]> = {
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
const TARGET = 'py-1.5 pointer-coarse:py-2.75';

/**
 * Rendered by each page, not by the layout: only the page knows its variant.
 * The `id="top"` + `tabIndex={-1}` pair is what "Back to top" lands on, so
 * focus moves with the scroll. On a phone the strip is the availability line
 * alone; the location moves to the footer.
 */
export function SiteHeader({ variant }: { variant: Variant }) {
  return (
    <header
      id="top"
      tabIndex={-1}
      className="flex flex-wrap items-baseline gap-x-7 gap-y-1 pt-header-top text-ui-sm focus:outline-none"
    >
      <Link href="/" className={`${TARGET} font-semibold`}>
        Valentino Rota
      </Link>
      <nav aria-label="Primary" className="flex flex-wrap gap-x-5.5 text-text-3">
        {NAV[variant].map(({ label, href }) => (
          <InPageLink key={label} href={href} className={`link-u ${TARGET}`}>
            {label}
          </InPageLink>
        ))}
      </nav>
      <p className="ml-auto flex flex-wrap items-baseline gap-x-5.5 max-sm:ml-0 max-sm:w-full">
        <span className="text-text-3 max-sm:hidden">Mar del Plata, Argentina</span>
        <span className="inline-flex items-baseline gap-2 text-ink">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-available animate-availability" />
          Open to roles in Buenos Aires or remote
        </span>
      </p>
    </header>
  );
}
