import type { HardwareNote } from './HardwareNote.tsx';
import type { NetworkNote } from './NetworkNote.tsx';

type NotePageModule = {
  HardwareNote: typeof HardwareNote;
  NetworkNote: typeof NetworkNote;
};
let pending: Promise<NotePageModule> | null = null;

/** Keep note-only tools and their translations out of the home-page bundle. */
export function loadNotePageModule(): Promise<NotePageModule> {
  if (!pending) {
    const promise = Promise.all([
      import('./HardwareNote.tsx'),
      import('./NetworkNote.tsx'),
    ]).then(([hardware, network]) => {
      const module = { ...hardware, ...network };
      // Match the settled promise contract used by the project-page loader.
      void Object.assign(promise, { status: 'fulfilled', value: module });
      return module;
    });
    pending = promise;
  }
  return pending;
}
