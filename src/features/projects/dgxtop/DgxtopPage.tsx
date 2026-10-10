import type { ReactNode } from 'react';
import { MdHeading } from '../../../components/Buffer.tsx';
import { Icon, type IconName } from '../../../components/Icon.tsx';
import { ScrollRegion } from '../../../components/ScrollRegion.tsx';
import { dictionaries } from '../../../i18n/index.ts';
import {
  projectPages,
  projectShotUrl,
  type ProjectEdition,
} from '../../../lib/project-pages.ts';
import {
  dgxtopCopy,
  sectionIds,
  type DgxtopCopy,
  type SectionId,
  type ShotFile,
} from './copy.tsx';
import {
  ActionDiagram,
  ArbitrationDiagram,
  ArchitectureDiagram,
  CratesDiagram,
  HistoryDiagram,
  OverloadDiagram,
  RuntimeDiagram,
} from './diagrams.tsx';

const page = projectPages.dgxtop;

const sectionIcons: Record<SectionId, IconName> = {
  why: 'book',
  screens: 'image',
  architecture: 'network',
  isolation: 'shield',
  arbitration: 'branch',
  history: 'clock',
  actions: 'keyboard',
  budget: 'server',
  boundaries: 'package',
  tradeoffs: 'list',
  links: 'link',
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

function DataTable({
  label,
  table: { caption, head, rows },
  numeric = [],
}: {
  label: string;
  table: DgxtopCopy['why']['table'];
  numeric?: number[];
}) {
  return (
    <ScrollRegion className="table-scroll" label={label}>
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th
                key={cell}
                scope="col"
                className={numeric.includes(index) ? 'num' : undefined}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={numeric.includes(index) ? 'num' : undefined}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

/** The dgxtop design page: screenshots first, then each part of the architecture. */
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

        <Section id="why" title={t.sections.why}>
          <p>{t.why.intro}</p>
          <DataTable label={t.sections.why} table={t.why.table} />
          <p>{t.why.outro}</p>
        </Section>

        <Section id="screens" title={t.sections.screens}>
          <p>{t.screens.intro}</p>
          <div className="project-gallery">
            {(
              [
                'workstation-overview.webp',
                'dgx-spark-gpu.webp',
                'workstation-gpu.webp',
                'dgx-spark-history.webp',
                'workstation-history.webp',
                'dgx-spark-settings.webp',
              ] as const
            ).map((file) => shot(file))}
          </div>
        </Section>

        <Section id="architecture" title={t.sections.architecture}>
          <p>{t.architecture.intro}</p>
          <ArchitectureDiagram t={t.architecture.diagram} />
          <DataTable
            label={t.sections.architecture}
            table={t.architecture.table}
          />
          <p>{t.architecture.outro}</p>
        </Section>

        <Section id="isolation" title={t.sections.isolation}>
          <RuntimeDiagram t={t.isolation.diagram} />
          {t.isolation.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Section>

        <Section id="arbitration" title={t.sections.arbitration}>
          <p>{t.arbitration.intro}</p>
          <ArbitrationDiagram t={t.arbitration.diagram} />
          <DataTable
            label={t.sections.arbitration}
            table={t.arbitration.table}
          />
          <p>{t.arbitration.outro}</p>
        </Section>

        <Section id="history" title={t.sections.history}>
          <HistoryDiagram t={t.history.diagram} />
          {t.history.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Section>

        <Section id="actions" title={t.sections.actions}>
          <ActionDiagram t={t.actions.diagram} />
          {t.actions.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Section>

        <Section id="budget" title={t.sections.budget}>
          <p>{t.budget.intro}</p>
          <DataTable
            label={t.sections.budget}
            table={t.budget.table}
            numeric={[1]}
          />
          <OverloadDiagram t={t.budget.diagram} />
          <p>{t.budget.overload}</p>
        </Section>

        <Section id="boundaries" title={t.sections.boundaries}>
          <CratesDiagram t={t.boundaries.diagram} />
          {t.boundaries.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Section>

        <Section id="tradeoffs" title={t.sections.tradeoffs}>
          <ul>
            {t.tradeoffs.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section id="links" title={t.sections.links}>
          <ul className="project-links">
            {t.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>
                  {link.label}
                  <Icon name="arrow-up-right" size={14} />
                  <span className="sr-only">
                    （{dictionaries[locale].newTab}）
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
