import type { ViewData } from '../../app/page.tsx';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import {
  ProjectActions,
  categoryLabel,
} from '../../components/ProjectCard.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';

type ProjectsView = Extract<ViewData, { kind: 'projects' }>;

export function Projects({
  view,
  locale,
}: {
  view: ProjectsView;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <div className="container profile-layout projects">
      <PageHead eyebrow={t.projectsEyebrow} title={t.projectsTitle}>
        <p className="ln page-intro">{t.projectsIntro}</p>
      </PageHead>
      <div className="project-list">
        {view.projects.map((project, index) => {
          const relatedId = project.relatedPostIds[0];
          return (
            <article
              key={project.id}
              id={`project-${project.id}`}
              className={`ln project-row${index === 0 ? ' featured' : ''}`}
              aria-labelledby={`project-${project.id}-title`}
            >
              <div className="project-row-side">
                <h2
                  className="project-title"
                  id={`project-${project.id}-title`}
                >
                  <Icon name="package" size={20} />
                  {project.title}
                </h2>
                <p className="project-owner entity-kind">{project.owner}</p>
                <p className="label">
                  {categoryLabel(project.category, locale)}
                </p>
                <p className="tech-list">
                  <span className="sr-only">{t.projectTechnologies}：</span>
                  {project.technologies.join(' · ')}
                </p>
              </div>
              <div className="project-row-body">
                <h3>{project.headline}</h3>
                <p>{project.summary}</p>
                <dl className="project-points">
                  {project.points.map((point) => (
                    <div key={point.title}>
                      <dt>{point.title}</dt>
                      <dd>{point.text}</dd>
                    </div>
                  ))}
                </dl>
                <p className="fine">
                  {t.projectRole}：{project.role}
                </p>
                <ProjectActions
                  project={project}
                  locale={locale}
                  related={relatedId ? view.posts[relatedId] : undefined}
                  primary={index === 0}
                />
              </div>
            </article>
          );
        })}
      </div>
      <p className="ln fine projects-note">{t.projectsNote}</p>
      <EndOfBuffer />
    </div>
  );
}
