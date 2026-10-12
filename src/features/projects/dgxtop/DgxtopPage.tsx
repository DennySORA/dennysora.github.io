import type { ReactNode } from 'react';
import { MdHeading } from '../../../components/Buffer.tsx';
import { Icon, type IconName } from '../../../components/Icon.tsx';
import { ScrollRegion } from '../../../components/ScrollRegion.tsx';
import { dictionaries } from '../../../i18n/index.ts';
import {
  projectDiagramFile,
  projectDiagramUrl,
  projectPages,
  projectShotUrl,
  type ProjectEdition,
} from '../../../lib/project-pages.ts';
import {
  dgxtopCopy,
  installCommand,
  sectionIds,
  techDiagrams,
  techSectionIds,
  type DgxtopCopy,
  type DiagramName,
  type Point,
  type SectionId,
  type ShotFile,
} from './copy.tsx';
import { ArchitectureDiagram } from './diagrams.tsx';

const page = projectPages.dgxtop;

const sectionIcons: Record<SectionId, IconName> = {
  install: 'prompt',
  features: 'sparkles',
  screens: 'image',
  capabilities: 'cpu',
  architecture: 'network',
  'data-path': 'arrow',
  isolation: 'server',
  sources: 'branch',
  history: 'clock',
  'process-history': 'list',
  'gpu-memory': 'tag',
  actions: 'shield',
  limits: 'retry',
  storage: 'files',
  code: 'package',
};

function Section({
  id,
  title,
  children,
}: {
  id: SectionId;
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <MdHeading level={2} id={id} icon={sectionIcons[id]}>
        {title}
      </MdHeading>
      {children}
    </>
  );
}

/** A screenshot as an image-preview float: real file name and pixel size. */
function Shot({
  file,
  alt,
  caption,
  openLabel,
  eager = false,
}: {
  file: ShotFile;
  alt: string;
  caption: string;
  openLabel: string;
  /** The first screenshot is in view on load, so it is not deferred. */
  eager?: boolean;
}) {
  const shot = page.shots.find((item) => item.file === file);
  if (!shot) throw new Error(`Unknown dgxtop screenshot: ${file}`);
  const url = projectShotUrl('dgxtop', shot);
  return (
    <figure className="project-shot">
      <div className="project-shot-frame">
        <div className="float-title">
          <Icon name="image" size={14} />
          <span>{shot.file}</span>
          <span className="float-meta">
            {shot.width}×{shot.height}
          </span>
        </div>
        <a href={url} title={openLabel}>
          <img
            src={url}
            width={shot.width}
            height={shot.height}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
          />
        </a>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * A GPT-generated diagram in the same image-preview float as a screenshot,
 * labelled as generated. Each edition loads the image drawn in its language.
 */
function Diagram({
  name,
  locale,
  t,
}: {
  name: DiagramName;
  locale: ProjectEdition;
  t: DgxtopCopy;
}) {
  const diagram = page.diagrams.find((item) => item.name === name);
  if (!diagram) throw new Error(`Unknown dgxtop diagram: ${name}`);
  const url = projectDiagramUrl('dgxtop', diagram, locale);
  return (
    <figure className="project-diagram">
      <div className="project-shot-frame">
        <div className="float-title">
          <Icon name="image" size={14} />
          <span>{projectDiagramFile(diagram, locale)}</span>
          <span className="float-meta">
            {`${t.generated.title} · ${diagram.width} × ${diagram.height}`}
          </span>
        </div>
        <a href={url} title={t.openImage}>
          <img
            src={url}
            width={diagram.width}
            height={diagram.height}
            alt={t.generated.alt + t.diagrams[name].alt}
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
      <figcaption>{t.diagrams[name].caption}</figcaption>
    </figure>
  );
}

function DataTable({
  label,
  table: { head, rows },
}: {
  label: string;
  table: DgxtopCopy['architecture']['components'];
}) {
  return (
    <ScrollRegion className="table-scroll" label={label}>
      <table>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

/** Features and capabilities: a bold name, its text and an optional list. */
function Points({ points }: { points: Point[] }) {
  return (
    <ul className="project-points">
      {points.map((point) => (
        <li key={point.title}>
          <strong>{point.title}</strong> {point.text}
          {point.list ? (
            <ul>
              {point.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** The dgxtop page: what it does, how to install it and how it is built. */
export function DgxtopPage({ locale }: { locale: ProjectEdition }) {
  const t = dgxtopCopy[locale];
  const shot = (file: ShotFile, eager = false) => (
    <Shot
      key={file}
      file={file}
      alt={t.shots[file].alt}
      caption={t.shots[file].caption}
      openLabel={t.openImage}
      eager={eager}
    />
  );
  return (
    <>
      <p className="ln project-lead">{t.lead}</p>
      <p className="ln md-fence" aria-hidden="true">
        ---
      </p>
      <dl className="front-matter">
        <div className="ln">
          <dt lang="en">repository</dt>
          <dd>
            <a href={page.repository}>
              {page.repository.replace('https://', '')}
              <Icon name="arrow-up-right" size={14} />
              <span className="sr-only">（{dictionaries[locale].newTab}）</span>
            </a>
          </dd>
        </div>
        <div className="ln">
          <dt lang="en">stack</dt>
          <dd>{t.facts.stack}</dd>
        </div>
        <div className="ln">
          <dt lang="en">platforms</dt>
          <dd>{t.facts.platforms}</dd>
        </div>
        <div className="ln">
          <dt lang="en">license</dt>
          <dd>Apache-2.0</dd>
        </div>
        <div className="ln">
          <dt lang="en">status</dt>
          <dd>{t.facts.status}</dd>
        </div>
        <div className="ln">
          <dt lang="en">updated</dt>
          <dd>
            <time dateTime={page.updatedAt}>{page.updatedAt}</time>
          </dd>
        </div>
      </dl>
      <p className="ln md-fence" aria-hidden="true">
        ---
      </p>
      <nav className="ln project-sections" aria-label={t.sectionsLabel}>
        <ol>
          {sectionIds.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>
                <Icon name="hash" size={13} />
                {t.sections[id]}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="prose project-body">
        {shot('dgx-spark-overview.webp', true)}

        <Section id="install" title={t.sections.install}>
          <div className="code-block project-install">
            <div className="code-toolbar">
              <span className="code-label" data-entity="file">
                bash
              </span>
            </div>
            <pre>
              <code className="language-bash">{installCommand}</code>
            </pre>
          </div>
          <p>{t.install.platforms}</p>
          <p>{t.install.installer}</p>
          <p>
            {t.install.source}{' '}
            <a href={page.repository}>
              {page.repository.replace('https://', '')}
              <Icon name="arrow-up-right" size={14} />
              <span className="sr-only">（{dictionaries[locale].newTab}）</span>
            </a>
          </p>
        </Section>

        <Section id="features" title={t.sections.features}>
          <p>{t.features.intro}</p>
          <Points points={t.features.points} />
        </Section>

        <Section id="screens" title={t.sections.screens}>
          <p>{t.screens.intro}</p>
          <div className="project-gallery">
            {(
              [
                'workstation-overview.webp',
                'dgx-spark-gpu.webp',
                'workstation-gpu.webp',
                'workstation-overview-history.webp',
                'workstation-process-history.webp',
                'workstation-process-run.webp',
              ] as const
            ).map((file) => shot(file))}
          </div>
        </Section>

        <Section id="capabilities" title={t.sections.capabilities}>
          <Points points={t.capabilities} />
        </Section>

        <Section id="architecture" title={t.sections.architecture}>
          <p>{t.architecture.intro}</p>
          <Diagram name="architecture" locale={locale} t={t} />
          <ArchitectureDiagram t={t.architecture.diagram} />
          <DataTable
            label={t.sections.architecture}
            table={t.architecture.components}
          />
          <p>{t.architecture.next}</p>
        </Section>

        {techSectionIds.map((id) => {
          const section = t.tech[id];
          return (
            <Section key={id} id={id} title={t.sections[id]}>
              <p>{section.intro}</p>
              <Diagram name={techDiagrams[id]} locale={locale} t={t} />
              <Points points={section.points} />
              {section.table ? (
                <DataTable label={t.sections[id]} table={section.table} />
              ) : null}
            </Section>
          );
        })}
      </div>
    </>
  );
}
