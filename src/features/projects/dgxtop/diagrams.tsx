import type { ReactNode } from 'react';
import { Icon } from '../../../components/Icon.tsx';
import { ScrollRegion } from '../../../components/ScrollRegion.tsx';
import type { DgxtopCopy } from './copy.tsx';

// Diagrams are figures of real, translated text: nodes and arrows drawn with
// token classes only (docs/DESIGN.md §9, project diagrams). Each figure is one
// buffer line; its caption names it and says what to read in it.

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
      <Flow path="control" label={t.control}>
        {t.controlNodes.map(([title, text], index) => (
          <Node key={`${title}-${index}`} title={title} text={text} />
        ))}
      </Flow>
    </Figure>
  );
}

export function RuntimeDiagram({
  t,
}: {
  t: DgxtopCopy['isolation']['diagram'];
}) {
  return (
    <Figure id="dg-runtime" title={t.title} text={t.text}>
      <div className="dg-columns">
        <section className="dg-panel" aria-label={t.parent}>
          <p className="dg-panel-title">{t.parent}</p>
          <ul className="dg-threads">
            {t.threads.map((thread) => (
              <li key={thread}>{thread}</li>
            ))}
          </ul>
        </section>
        <section className="dg-panel" aria-label={t.hosts}>
          <p className="dg-panel-title">{t.hosts}</p>
          <ul className="dg-hosts">
            {adapterHosts.map((host) => {
              const late = host === 'NVML';
              return (
                <li key={host} data-late={late ? '' : undefined}>
                  <span>{host}</span>
                  <span className="dg-host-state">
                    <Icon name={late ? 'clock' : 'check'} size={13} />
                    {late ? t.late : t.fresh}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <p className="dg-pipe">↔ {t.pipe}</p>
      <Flow path="control" label={t.lifecycle}>
        {t.states.map((state) => (
          <Node key={state} title={state} />
        ))}
      </Flow>
      <p className="dg-note">{t.quarantine}</p>
    </Figure>
  );
}

export function ArbitrationDiagram({
  t,
}: {
  t: DgxtopCopy['arbitration']['diagram'];
}) {
  return (
    <Figure id="dg-arbitration" title={t.title} text={t.text}>
      <div className="dg-columns">
        {t.inputs.map(([source, value]) => (
          <Node key={source} title={source}>
            <span className="dg-node-value">{value}</span>
          </Node>
        ))}
      </div>
      <ol className="dg-steps">
        {t.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="dg-path">
        <p className="dg-path-label">{t.outcomes}</p>
        <ul className="dg-outcomes">
          <li data-chosen="">{t.selected}</li>
          <li data-conflict="">{t.conflict}</li>
          {t.missing.map((state) => (
            <li key={state}>{state}</li>
          ))}
          <li>
            <s>55 °C</s> · {t.average}
          </li>
        </ul>
      </div>
      <div className="dg-path">
        <p className="dg-path-label">{t.axes}</p>
        <Chips items={t.axisNames} />
      </div>
    </Figure>
  );
}

/**
 * Three minute buckets on one axis. One interval crosses the first minute
 * boundary (the bridge); the source is silent across the second (the gap).
 */
const buckets = [
  { from: 24, to: 252 },
  { from: 252, to: 480 },
  { from: 480, to: 708 },
] as const;
const intervals = [
  { from: 70, to: 140, bridge: false },
  { from: 140, to: 210, bridge: false },
  { from: 210, to: 290, bridge: true },
  { from: 290, to: 360, bridge: false },
  { from: 360, to: 430, bridge: false },
  { from: 610, to: 680, bridge: false },
] as const;
const samples = [70, 140, 210, 290, 360, 430, 610, 680] as const;
const silence = { from: 446, to: 594 } as const;
const axisY = 136;

export function HistoryDiagram({ t }: { t: DgxtopCopy['history']['diagram'] }) {
  return (
    <Figure id="dg-history" title={t.title} text={t.text}>
      <ScrollRegion className="dg-scroll" labelledBy="dg-history-title">
        <svg
          className="dg-svg"
          viewBox="0 44 732 188"
          role="img"
          aria-labelledby="dg-history-svg-title"
        >
          <title id="dg-history-svg-title">{`${t.title}. ${t.text}`}</title>
          <defs>
            <pattern
              id="dg-hatch"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line className="dg-svg-hatch" x1="0" y1="0" x2="0" y2="8" />
            </pattern>
          </defs>
          {buckets.map((bucket, index) => (
            <g key={bucket.from}>
              <rect
                className="dg-svg-bucket"
                x={bucket.from + 2}
                y="56"
                width={bucket.to - bucket.from - 4}
                height="132"
                rx="4"
              />
              <text
                className="dg-svg-strong"
                x={(bucket.from + bucket.to) / 2}
                y="80"
                textAnchor="middle"
              >
                {t.buckets[index]}
              </text>
            </g>
          ))}
          <rect
            x={silence.from}
            y={axisY - 22}
            width={silence.to - silence.from}
            height="44"
            fill="url(#dg-hatch)"
          />
          <rect
            className="dg-svg-gap"
            x={silence.from}
            y={axisY - 22}
            width={silence.to - silence.from}
            height="44"
            fill="none"
          />
          <text
            x={(silence.from + silence.to) / 2}
            y={axisY + 42}
            textAnchor="middle"
          >
            {t.gap}
          </text>
          {intervals.map((interval) => (
            <line
              key={interval.from}
              className={interval.bridge ? 'dg-svg-bridge' : 'dg-svg-interval'}
              x1={interval.from}
              y1={axisY}
              x2={interval.to}
              y2={axisY}
            />
          ))}
          {samples.map((x) => (
            <circle key={x} className="dg-svg-sample" cx={x} cy={axisY} r="6" />
          ))}
          <text
            className="dg-svg-strong"
            x={(intervals[2].from + intervals[2].to) / 2}
            y={axisY - 18}
            textAnchor="middle"
          >
            {t.bridge}
          </text>
          <path
            className="dg-svg-bracket"
            d={`M${intervals[3].from} ${axisY + 18}v8H${intervals[3].to}v-8`}
          />
          <text
            x={(intervals[3].from + intervals[3].to) / 2}
            y={axisY + 44}
            textAnchor="middle"
          >
            {t.delta}
          </text>
          <text className="dg-svg-muted" x="24" y="218">
            {t.legend}
          </text>
        </svg>
      </ScrollRegion>
    </Figure>
  );
}

export function ActionDiagram({ t }: { t: DgxtopCopy['actions']['diagram'] }) {
  const [sent, exited, running] = t.outcomes;
  return (
    <Figure id="dg-actions" title={t.title} text={t.text}>
      <Flow path="control">
        {t.steps.map(([title, text]) => (
          <Node key={title} title={title} text={text} />
        ))}
      </Flow>
      <div className="dg-path" data-path="control">
        <p className="dg-path-label">{sent}</p>
        <ul className="dg-outcomes">
          <li data-chosen="">{exited}</li>
          <li>{running}</li>
        </ul>
      </div>
      {t.notes.map((note) => (
        <p key={note} className="dg-note">
          {note}
        </p>
      ))}
    </Figure>
  );
}

export function OverloadDiagram({ t }: { t: DgxtopCopy['budget']['diagram'] }) {
  return (
    <Figure id="dg-overload" title={t.title} text={t.text}>
      <Flow path="control">
        {t.states.map(([title, text]) => (
          <Node key={title} title={title} text={text} />
        ))}
      </Flow>
    </Figure>
  );
}

export function CratesDiagram({
  t,
}: {
  t: DgxtopCopy['boundaries']['diagram'];
}) {
  return (
    <Figure id="dg-crates" title={t.title} text={t.text}>
      <Node title={t.root[0]} text={t.root[1]} />
      <ul className="dg-crates">
        {t.crates.map(([name, role]) => (
          <li key={name}>
            <Node title={name} text={role}>
              <span className="dg-depends">{t.depends}</span>
            </Node>
          </li>
        ))}
      </ul>
      <Node className="dg-core" title={t.core[0]} text={t.core[1]} />
      <p className="dg-note">{t.check}</p>
    </Figure>
  );
}
