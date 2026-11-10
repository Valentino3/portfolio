'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type SectionLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'onClick'> & { id: string };

/**
 * A link to a section of the case, for both indexes.
 *
 * It goes through next/link, never a native "#id" anchor: a native jump leaves a history entry
 * the App Router ignores on Back (see BackToTopLink). Next scrolls to the section but leaves
 * focus on the link, so the click handler moves it to the section (a `tabIndex={-1}` target),
 * as a native jump would: Tab continues inside the section and a screen reader lands on it.
 * Without script it is a plain "#id" anchor and the browser does both itself.
 */
export function SectionLink({ id, ...props }: SectionLinkProps) {
  return (
    <Link {...props} href={`#${id}`} onClick={() => document.getElementById(id)?.focus({ preventScroll: true })} />
  );
}
