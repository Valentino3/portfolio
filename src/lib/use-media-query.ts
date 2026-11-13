import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether a media query matches, kept in sync as it changes. The server and
 * the hydration pass see `false`, so the markup never mismatches; the real
 * value arrives right after hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
