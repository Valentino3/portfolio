import type { ReactNode } from 'react';
import { HEADLINE, NAME } from '@/lib/site';

/**
 * The headline and lede, and the 12-column grid they share with the project
 * list. Children are grid items of that grid (a fragment keeps them direct
 * children): on a wide screen with a fine pointer the text and the list take
 * columns 1-6 and the project viewer takes 7-12; everywhere else they stack.
 */
export function Hero({ children }: { children: ReactNode }) {
  return (
    <div className="grid-12 mt-hero-top items-start">
      <div className="col-span-full viewer:col-span-6 viewer:col-start-1">
        <h1 className="text-intro font-medium">
          <span className="sr">{NAME}, </span>
          {HEADLINE}
        </h1>
        <p className="mt-4 max-w-[46ch] text-lead text-text-2">
          Five years building production web apps. I care about typography, layout and interaction, and I build the
          systems behind them too: data-heavy interfaces, design systems, auth and APIs. Lead UI Developer at Reset
          Digital, promoted over time.
        </p>
      </div>
      {children}
    </div>
  );
}
