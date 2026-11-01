import type { FanLab } from './FanLab.tsx';

type FanLabModule = { FanLab: typeof FanLab };
let pending: Promise<FanLabModule> | null = null;

/** The measured archive loads only on this note, not every note page. */
export function loadFanLabModule(): Promise<FanLabModule> {
  if (!pending) {
    const promise = import('./FanLab.tsx').then((module) => {
      void Object.assign(promise, { status: 'fulfilled', value: module });
      return module;
    });
    pending = promise;
  }
  return pending;
}
