import type { ProjectCardData } from '../app/page.tsx';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { Icon } from './Icon.tsx';

export function categoryLabel(
  category: ProjectCardData['category'],
  locale: Locale,
) {
  const t = dictionaries[locale];
  return category === 'work'
    ? t.categoryWork
    : category === 'experiment'
      ? t.categoryExperiment
      : t.categoryOpenSource;
}

/** Every action is a named link; the card itself is never a click target. */
export function ProjectActions({
  project,
  locale,
  related,
  primary = false,
}: {
  project: ProjectCardData;
  locale: Locale;
  related?: { slug: string; title: string } | undefined;
  primary?: boolean;
}) {
  const t = dictionaries[locale];
  return (
    <div className="action-row">
      <a
        className={`button ${primary ? 'button-primary' : 'button-quiet'} resource-link`}
        href={project.repository}
      >
        {t.sourceOnGitHub}
        <Icon name="external" size={18} />
        <span className="sr-only">（{t.newTab}）</span>
      </a>
      {project.hasCaseStudy ? (
        <a className="text-action" href={`/${locale}/projects/${project.id}/`}>
          {t.readCaseStudy}
          <Icon name="arrow" size={18} />
        </a>
      ) : null}
      {project.demo ? (
        <a className="text-action" href={project.demo}>
          {t.tryDemo}
          <Icon name="external" size={18} />
        </a>
      ) : null}
      {related ? (
        <a className="text-action" href={`/${locale}/blog/${related.slug}/`}>
          {t.relatedWriting}
          <Icon name="arrow" size={18} />
        </a>
      ) : null}
    </div>
  );
}

/** Compact card used on Home and About. */
export function ProjectTeaser({
  project,
  locale,
}: {
  project: ProjectCardData;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <article className="project-teaser">
      <p className="fine entity-kind">
        {categoryLabel(project.category, locale)} · {project.domain}
      </p>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="action-row">
        <a className="text-action resource-link" href={project.repository}>
          {t.sourceOnGitHub}
          <Icon name="external" size={18} />
          <span className="sr-only">（{t.newTab}）</span>
        </a>
        <a
          className="text-action"
          href={`/${locale}/projects/#project-${project.id}`}
        >
          {t.aboutProject}
          <Icon name="arrow" size={18} />
        </a>
      </div>
    </article>
  );
}
