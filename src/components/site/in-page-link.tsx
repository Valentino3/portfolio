'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type InPageLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'onNavigate'> & {
  /** A fragment of this page ("#contact") or of another route ("/#work"). */
  href: `#${string}` | `/${string}#${string}`;
};

/** The id `href` points at when it is a fragment of the page at `pathname`; null for another route. */
export function inPageTarget(href: string, pathname: string): string | null {
  const hash = href.indexOf('#');
  if (hash === -1) return null;
  const path = href.slice(0, hash);
  if (path !== '' && path !== pathname) return null;
  return decodeURIComponent(href.slice(hash + 1)) || null;
}

/**
 * The one link to a fragment: a section of this page ("#contact", "#top") or of the home ("/#work").
 *
 * It goes through next/link, never a native anchor: a native jump leaves a history entry the App
 * Router ignores on Back, so a later soft navigation and Back would leave the old route rendered
 * under the restored URL. Next scrolls to the fragment but leaves focus on the link, so the next
 * Tab would start over from the link, up the page. Once Next has taken the click (`onNavigate`; it
 * leaves a modified or middle click, a new tab or window, to the browser), focus moves to the
 * target, a `tabIndex={-1}` element, without scrolling again: Tab continues from there and a screen
 * reader lands on it, as with a native jump. A fragment of another route only scrolls on arrival.
 * Without script it is a plain anchor, and the browser does both itself.
 */
export function InPageLink({ href, ...props }: InPageLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onNavigate={() => {
        const id = inPageTarget(href, window.location.pathname);
        if (id) document.getElementById(id)?.focus({ preventScroll: true });
      }}
    />
  );
}
