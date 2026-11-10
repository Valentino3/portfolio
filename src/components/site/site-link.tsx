import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type SiteLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: string };

/**
 * A link inside the site. Routes go through the Next router; a same-page
 * "#fragment" stays a native anchor. Next's router scrolls to a hash but does
 * not move focus to a `tabIndex={-1}` target (like the header) and does not
 * update the keyboard's starting point, which the native jump does.
 */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  return href.startsWith('#') ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}
