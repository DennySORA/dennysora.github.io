import type { ViewData } from '../../app/page.tsx';
import {
  ArticleListItem,
  taxonomyMaps,
} from '../../components/ArticleListItem.tsx';
import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import {
  ProjectActions,
  categoryLabel,
} from '../../components/ProjectCard.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';

type ProjectView = Extract<ViewData, { kind: 'project' }>;

/** A factual overview; a case study appears here only once one is published. */
export function ProjectOverview({
  view,
  locale,
}: {
  view: ProjectView;
  locale: Locale;
}) {
  const { project, related } = view;
  const t = dictionaries[locale];
  const maps = taxonomyMaps(view.taxonomy);
  return (
    <div className="container profile-layout project-overview">
      <a className="backlink" href={`/${locale}/projects/`}>
        <Icon name="arrow-left" size={18} />
        {t.backToProjects}
      </a>
      <PageHead
        eyebrow={`${categoryLabel(project.category, locale)} · ${project.domain}`}
        title={project.title}
      >
        <p className="page-intro">{project.headline}</p>
      </PageHead>
      <div className="overview-body">
        <p>{project.summary}</p>
        <dl className="project-points">
          {project.points.map((point) => (
            <div key={point.title}>
              <dt>{point.title}</dt>
              <dd>{point.text}</dd>
            </div>
          ))}
          <div>
            <dt>{t.projectRole}</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>{t.projectRepository}</dt>
            <dd>{project.owner}</dd>
          </div>
          <div>
            <dt>{t.projectTechnologies}</dt>
            <dd>{project.technologies.join(' · ')}</dd>
          </div>
        </dl>
        <ProjectActions project={project} locale={locale} primary />
        {project.hasCaseStudy ? null : (
          <p className="notice" data-status="info">
            <Icon name="info" size={18} />
            {t.projectOverviewNote}
          </p>
        )}
      </div>
      {related.length ? (
        <section className="section" aria-labelledby="project-related-title">
          <h2 id="project-related-title">{t.relatedWriting}</h2>
          <div className="article-list">
            {related.map((post) => (
              <ArticleListItem
                key={post.id}
                post={post}
                locale={locale}
                maps={maps}
                headingLevel={3}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
