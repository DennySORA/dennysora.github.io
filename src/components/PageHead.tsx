import type { ReactNode } from 'react';
import { MdHeading } from './Buffer.tsx';
import type { IconName } from './Icon.tsx';

/** A page title as the head of a markdown buffer: a comment, then `# title`. */
export function PageHead({
  eyebrow,
  title,
  icon,
  art,
  children,
  className = '',
}: {
  eyebrow: string;
  title: string;
  icon?: IconName;
  /** A recorded feature illustration (data/illustration-assets.json). */
  art?: { src: string; width: number; height: number };
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`page-head${art ? ' has-art' : ''} ${className}`.trim()}>
      <div className="page-head-text">
        <p className="ln eyebrow">
          <span className="md-mark" aria-hidden="true">
            {'// '}
          </span>
          {eyebrow}
        </p>
        {icon ? (
          <MdHeading level={1} icon={icon}>
            {title}
          </MdHeading>
        ) : (
          <MdHeading level={1}>{title}</MdHeading>
        )}
        {children}
      </div>
      {art ? (
        <img
          className="page-art"
          src={art.src}
          width={art.width}
          height={art.height}
          alt=""
          decoding="async"
        />
      ) : null}
    </header>
  );
}
