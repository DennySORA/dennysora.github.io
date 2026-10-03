import { useEffect, useRef } from 'react';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { enhanceNetworkNote } from './network-note-tools.ts';

/** Repository-reviewed static content, enhanced only by our bounded local tools. */
export function NetworkNote({ html }: { html: string }) {
  const root = useRef<HTMLElement>(null);
  useEffect(
    () => (root.current ? enhanceNetworkNote(root.current) : undefined),
    [html],
  );
  return (
    <div className="network-note buffer">
      <article
        ref={root}
        lang="zh-Hant"
        aria-labelledby="network-title"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EndOfBuffer />
    </div>
  );
}
