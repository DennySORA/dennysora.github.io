import type { ReactNode } from 'react';
import type { DgxtopCopy } from './copy.tsx';

// The architecture figure is real, translated text: nodes and arrows drawn
// with token classes only (docs/DESIGN.md §9, project diagrams). Its caption
// names it and says what to read in it.

type Path = 'data' | 'control';

function Figure({
  id,
  title,
  text,
  children,
}: {
  id: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <figure className="dg" aria-labelledby={`${id}-title`}>
      <figcaption>
        <b id={`${id}-title`}>{title}</b>
        <span>{text}</span>
      </figcaption>
      <div className="dg-body">{children}</div>
    </figure>
  );
}

function Node({
  title,
  text,
  children,
  className = '',
}: {
  title: string;
  text?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`dg-node ${className}`.trim()}>
      <span className="dg-node-title">{title}</span>
      {text ? <span className="dg-node-text">{text}</span> : null}
      {children}
    </div>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="dg-chips">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Flow({
  path,
  label,
  children,
}: {
  path: Path;
  label?: string;
  children: ReactNode[];
}) {
  return (
    <div className="dg-path" data-path={path}>
      {label ? <p className="dg-path-label">{label}</p> : null}
      <ol className="dg-flow">
        {children.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ol>
    </div>
  );
}

const adapterHosts = [
  'procfs',
  'hwmon',
  'thermal',
  'powercap',
  'NVML',
  'network',
  'filesystem',
] as const;

export function ArchitectureDiagram({
  t,
}: {
  t: DgxtopCopy['architecture']['diagram'];
}) {
  return (
    <Figure id="dg-architecture" title={t.title} text={t.text}>
      <Flow path="data" label={t.data}>
        {t.dataNodes.map(([title, text], index) =>
          index === 1 ? (
            <Node key={title} title={title} text={t.adapters}>
              <Chips items={adapterHosts} />
            </Node>
          ) : (
            <Node key={`${title}-${index}`} title={title} text={text} />
          ),
        )}
      </Flow>
      <Flow path="data" label={t.history}>
        {t.historyNodes.map(([title, text], index) => (
          <Node key={`${title}-${index}`} title={title} text={text} />
        ))}
      </Flow>
      <Flow path="control" label={t.control}>
        {t.controlNodes.map(([title, text], index) => (
          <Node key={`${title}-${index}`} title={title} text={text} />
        ))}
      </Flow>
    </Figure>
  );
}
