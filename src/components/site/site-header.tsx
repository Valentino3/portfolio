import { LocalTime } from './local-time';
import { SiteLink } from './site-link';

type Variant = 'home' | 'case';

/** Home links to its own sections; a case study links back to the home ones. */
const NAV: Record<Variant, { label: string; href: string }[]> = {
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
};

// Touch targets grow on coarse pointers; the 6px rhythm is for mouse users.
const TARGET = 'py-1.5 pointer-coarse:py-2.75';

/**
 * Rendered by each page, not by the layout: only the page knows its variant.
 * The `id="top"` + `tabIndex={-1}` pair is what "Back to top" lands on, so
 * focus moves with the scroll.
 */
export function SiteHeader({ variant }: { variant: Variant }) {
  return (
    <header
      id="top"
      tabIndex={-1}
      className="flex flex-wrap items-center gap-x-7 gap-y-2 pt-header-top focus:outline-none"
    >
      <SiteLink href="/" className={`${TARGET} font-semibold`}>
        Valentino Rota
      </SiteLink>
      <nav aria-label="Primary" className="flex flex-wrap gap-x-5.5 text-text-3">
        {NAV[variant].map(({ label, href }) => (
          <SiteLink key={label} href={href} className={`link-u ${TARGET}`}>
            {label}
          </SiteLink>
        ))}
      </nav>
      <div className="ml-auto flex flex-wrap items-center gap-x-5.5 gap-y-1 font-mono text-small text-text-3 max-sm:ml-0 max-sm:w-full max-sm:justify-between">
        <span>
          Mar del Plata, Argentina
          {variant === 'home' && (
            <>
              {' · '}
              <span>
                local time <LocalTime />
              </span>
            </>
          )}
        </span>
        <span className="inline-flex items-center gap-2 text-ink">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-available animate-availability" />
          Open to roles in Buenos Aires or remote
        </span>
      </div>
    </header>
  );
}
