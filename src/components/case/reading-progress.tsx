'use client';

import { useEffect, useRef } from 'react';
import { useMediaQuery } from '@/lib/use-media-query';

function Bar() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Straight to the style, not through React state: this runs on every scroll event.
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (bar.current) bar.current.style.transform = `scaleX(${scrollTop / Math.max(1, scrollHeight - clientHeight)})`;
    };
    update();
    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      document.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={bar}
      data-reading-progress=""
      aria-hidden="true"
      style={{ transform: 'scaleX(0)' }}
      className="fixed inset-x-0 top-0 z-10 h-0.5 origin-left bg-ink"
    />
  );
}

/**
 * A 2px bar along the top edge that grows with the scroll. It is only mounted when the visitor
 * has not asked for reduced motion; the server snapshot of that query is false, so the bar never
 * exists before hydration or without script.
 */
export function ReadingProgress() {
  return useMediaQuery('(prefers-reduced-motion: no-preference)') ? <Bar /> : null;
}
