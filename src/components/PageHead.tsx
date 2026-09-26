import type { ReactNode } from 'react';

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
    <header className={`page-head ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </header>
  );
}
