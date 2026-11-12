import type { ReactNode } from 'react';
import { HEADLINE, NAME } from '@/lib/site';

/**
 * The headline, the lede and the 12-column grid they share with the project list. Children are
 * grid items of that grid (a fragment keeps them direct children). On a wide screen with a fine
 * pointer it is two rows of two: headline and lede, then the list and the project viewer, each
 * pair on the same top edge. Everywhere else the four stack.
 */
export function Hero({ children }: { children: ReactNode }) {
  return (
    <div className="grid-12 mt-hero-top">
      <h1 className="col-span-full text-intro font-medium viewer:col-span-6 viewer:self-baseline">
        <span className="sr">{NAME}, </span>
        {HEADLINE}
      </h1>
      <p className="col-span-full mt-4 max-w-[46ch] text-lead text-text-2 viewer:col-span-6 viewer:col-start-7 viewer:mt-0 viewer:self-baseline">
        Five years building production web apps. I care about typography, layout and interaction, and I build the
        systems behind them too: data-heavy interfaces, design systems, auth and APIs. Lead UI Developer at Reset
        Digital, promoted over time.
      </p>
      {children}
    </div>
  );
}
