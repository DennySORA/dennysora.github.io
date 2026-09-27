import type { ReactNode } from 'react';
import { MdHeading } from './Buffer.tsx';

/** A page title as the head of a markdown buffer: a comment, then `# title`. */
export function PageHead({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`page-head ${className}`.trim()}>
      <p className="ln eyebrow">
        <span className="md-mark" aria-hidden="true">
          {'// '}
        </span>
        {eyebrow}
      </p>
      <MdHeading level={1}>{title}</MdHeading>
      {children}
    </header>
  );
}
