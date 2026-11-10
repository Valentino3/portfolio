'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Scrolls to the header and moves focus there.
 *
 * It must go through next/link, not a native "#top" anchor. A native hash
 * click leaves `history.state` null, and the App Router's popstate handler
 * ignores entries without its own state: anchor click, then a soft navigation
 * to another route, then Back would leave the old route rendered under the
 * restored URL. Next scrolls to the hash but does not focus a `tabIndex={-1}`
 * target, so the click handler does, without scrolling again. Without JS this
 * is a plain `href="#top"`, and the browser does both itself.
 */
export function BackToTopLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="#top"
      className={className}
      onClick={() => document.getElementById('top')?.focus({ preventScroll: true })}
    >
      {children}
    </Link>
  );
}
