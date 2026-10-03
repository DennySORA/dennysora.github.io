import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon.tsx';

// Pages render as an open markdown buffer: numbered lines in the gutter,
// visible heading markers and vim's `~` rows after the last line. Markers,
// icons and line numbers are decoration; headings keep their plain names.

export function MdHeading({
  level,
  id,
  icon,
  children,
  className = '',
}: {
  level: 1 | 2 | 3;
  id?: string;
  /** A section icon after the marker, as rendered Markdown in Neovim shows it. */
  icon?: IconName;
  children: ReactNode;
  className?: string;
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={`ln md-heading ${className}`.trim()}>
      <span className="md-mark" aria-hidden="true">
        {'#'.repeat(level)}{' '}
      </span>
      {icon ? <Icon name={icon} size={level === 1 ? 26 : 20} /> : null}
      <span className="md-heading-text">{children}</span>
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
