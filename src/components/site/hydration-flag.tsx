'use client';

import { useEffect } from 'react';

/**
 * Marks `<html>` with `data-hydrated` once React has hydrated the page: from then on its links and
 * buttons run their script. Tests wait on it. It renders nothing and depends on no preference.
 */
export function HydrationFlag() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = '';
  }, []);
  return null;
}
