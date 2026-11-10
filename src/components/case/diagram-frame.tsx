'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/** Whether the element is wider inside than out, kept in sync as it resizes. False until measured. */
function useHorizontalOverflow(ref: RefObject<HTMLElement | null>): boolean {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setOverflows(element.scrollWidth > element.clientWidth + 1));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return overflows;
}

/**
 * The panel a diagram is drawn in, announced as one image with a descriptive label. On a narrow
 * screen the drawing keeps a minimum width and scrolls sideways; only then does the panel join
 * the tab order (so a keyboard can scroll it) and the "Swipe" hint above it show. On a wide
 * screen it may reach 26% past the text column, like the prototype.
 */
export function DiagramFrame({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const overflows = useHorizontalOverflow(ref);
  return (
    <>
      <p
        aria-hidden="true"
        hidden={!overflows}
        className="mt-4.5 -mb-2 font-mono text-label leading-(--text-prose--line-height) text-text-3"
      >
        Swipe to see the whole diagram →
      </p>
      <div
        ref={ref}
        role="img"
        aria-label={label}
        tabIndex={overflows ? 0 : undefined}
        className="diagram mt-4.5 overflow-x-auto rounded-panel border border-rule bg-surface p-5.5 lg:-mr-[26%]"
      >
        {children}
      </div>
    </>
  );
}
