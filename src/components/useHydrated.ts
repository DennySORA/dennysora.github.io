import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * False for the prerendered HTML and the hydration pass, true afterwards, so
 * URL-dependent UI never makes the first client render differ from the server.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
