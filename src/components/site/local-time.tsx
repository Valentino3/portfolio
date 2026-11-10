'use client';

import { useEffect, useState } from 'react';
import { formatLocalTime } from '@/lib/clock';

const REPAINT_MS = 30_000;

/**
 * Buenos Aires time. The server cannot know the visitor's "now" at request
 * time (the page is static), so it renders a placeholder and the clock starts
 * after hydration. That also avoids a server/client text mismatch.
 */
export function LocalTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = setInterval(tick, REPAINT_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <time dateTime={now?.toISOString()} className="tabular-nums">
      {now ? formatLocalTime(now) : '--:--'}
    </time>
  );
}
