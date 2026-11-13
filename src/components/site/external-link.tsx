import type { ComponentPropsWithoutRef } from 'react';

type ExternalLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'target' | 'rel'> & {
  href: string;
};

/**
 * A link that opens in a new tab. The tab change is part of the accessible
 * name (hidden visually), and rel keeps the new page away from window.opener.
 */
export function ExternalLink({ children, ...props }: ExternalLinkProps) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr"> (opens in a new tab)</span>
    </a>
  );
}
