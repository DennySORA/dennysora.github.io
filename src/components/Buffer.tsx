import type { ReactNode } from 'react';

// Pages render as an open markdown buffer: numbered lines in the gutter,
// visible heading markers and vim's `~` rows after the last line. Markers and
// line numbers are decoration; headings keep their plain accessible names.

export function MdHeading({
  level,
  id,
  children,
  className = '',
}: {
  level: 1 | 2 | 3;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={`ln md-heading ${className}`.trim()}>
      <span className="md-mark" aria-hidden="true">
        {'#'.repeat(level)}{' '}
      </span>
      {children}
    </Tag>
  );
}

/** Vim draws `~` on the rows after the end of the buffer. */
export function EndOfBuffer() {
  return (
    <div className="end-of-buffer" aria-hidden="true">
      <span>~</span>
      <span>~</span>
      <span>~</span>
    </div>
  );
}
