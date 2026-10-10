/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the one documented exception below */
import type { ReactNode } from 'react';

/**
 * A labelled region that scrolls on its own axis, never the page. It takes
 * keyboard focus because its content has none: without it, a keyboard user
 * could not scroll a wide table or chart (axe: scrollable-region-focusable).
 * The Markdown renderer emits the same pattern for article tables.
 */
export function ScrollRegion({
  className,
  label,
  labelledBy,
  children,
}: {
  className: string;
  label?: string | undefined;
  labelledBy?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      role="region"
      aria-label={label}
      aria-labelledby={labelledBy}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
