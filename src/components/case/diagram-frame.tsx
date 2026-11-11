'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

type Fit = 'unknown' | 'fits' | 'overflows';

/** Whether the element is wider inside than out, kept in sync as it resizes. 'unknown' until measured. */
function useHorizontalFit(ref: RefObject<HTMLElement | null>): Fit {
  const [fit, setFit] = useState<Fit>('unknown');
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setFit(element.scrollWidth > element.clientWidth + 1 ? 'overflows' : 'fits'),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return fit;
}

/**
 * The panel a diagram is drawn in, announced as one image with a descriptive label. On a narrow
 * screen the drawing keeps a minimum width and scrolls sideways, so a keyboard must be able to
 * reach it: the panel is in the tab order from the server on (before the script runs, and without
 * it), and leaves it once the script has measured that the drawing fits. The "Swipe" hint above it
 * shows only once an overflow is measured. On a wide screen the panel may reach 26% past the text
 * column, like the prototype.
 */
export function DiagramFrame({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const fit = useHorizontalFit(ref);
  return (
    <>
      <p
        aria-hidden="true"
        hidden={fit !== 'overflows'}
        className="mt-4.5 -mb-2 font-mono text-label leading-(--text-prose--line-height) text-text-3"
      >
        Swipe to see the whole diagram →
      </p>
      <div
        ref={ref}
        role="img"
        aria-label={label}
        tabIndex={fit === 'fits' ? undefined : 0}
        className="diagram mt-4.5 overflow-x-auto rounded-panel border border-rule bg-surface p-5.5 lg:-mr-[26%]"
      >
        {children}
      </div>
    </>
  );
}
