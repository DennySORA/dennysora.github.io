import { useEffect, useRef } from 'react';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { enhanceHardwareNote } from './hardware-note-tools.ts';

/** A reviewed static fragment; the local tools only recompute what it already shows. */
export function HardwareNote({ html }: { html: string }) {
  const root = useRef<HTMLElement>(null);
  useEffect(
    () => (root.current ? enhanceHardwareNote(root.current) : undefined),
    [html],
  );
  return (
    <div className="hardware-note buffer">
      <article
        ref={root}
        lang="zh-Hant"
        aria-labelledby="hardware-title"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
