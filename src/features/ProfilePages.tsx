import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { Icon } from '../components/Icon.tsx';
import {
  PostCard,
  ProjectCard,
  Prose,
  SectionHeading,
  Toc,
} from '../components/Content.tsx';
import { PageHeader, Contact } from '../components/PageParts.tsx';
import { Search } from './Search.tsx';
export function ProjectDetail({ data }: { data: PageData }) {
  const { locale, project, posts } = data;
  const t = dictionaries[locale];
  if (!project) return null;
  return (
    <>
      <PageHeader
        eyebrow="PROJECT / CASE NOTES"
        title={project.title}
        description={project.summary[locale]}
      />
      <div className="project-detail">
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <h2>{t.context}</h2>
        <p>{project.summary[locale]}</p>
        <h2>{t.evidence}</h2>
        <p>{t.projectEvidence}</p>
        <div className="hero-actions">
          <a className="button primary" href={project.url}>
            {t.sourceCode}
            <Icon name="external" size={16} />
          </a>
          <a className="text-link" href={project.source}>
            {t.source}
            <Icon name="external" size={15} />
          </a>
        </div>
        <SectionHeading number="↳" title={t.related} />
        <div className="blog-grid">
          {posts
            .filter((post) =>
              post.topics.includes(
                project.kind === 'production' ? 'systems' : 'engineering',
              ),
            )
            .map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
        </div>
      </div>
    </>
  );
}
export function Blog({ data }: { data: PageData }) {
  const { locale, posts } = data;
  const t = dictionaries[locale];

  return (
    <>
      <PageHeader
        eyebrow="THE WRITING DESK"
        title={t.blog}
        description={t.blogIntro}
      />
      <Search posts={posts} locale={locale} />
    </>
  );
}
export function Projects({ data }: { data: PageData }) {
  const { locale, projects } = data;
  const t = dictionaries[locale];

  return (
    <>
      <PageHeader
        eyebrow="SELECTED WORK"
        title={t.projects}
        description={t.projectIntro}
      />
      <div className="project-grid all-projects">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} locale={locale} />
        ))}
      </div>
      <Contact locale={locale} />
    </>
  );
}
export function About({ data }: { data: PageData }) {
  const { locale, profile } = data;
  const t = dictionaries[locale];
  if (!profile) return null;
  return (
    <>
      <PageHeader
        eyebrow="ABOUT / DENNYSORA"
        title={t.intro}
        description={t.aboutIntro}
      />
      <div className="about-intro">
        <img src="/assets/avatar.png" alt="DennySORA" width="84" height="84" />
        <div>
          <h2>
            DennySORA <span lang="zh-Hant">李汶道</span>
          </h2>
          <p>{t.role}</p>
          <p className="muted">{t.location}</p>
        </div>
      </div>
      <div className="reading-layout">
        <div>
          <p className="provenance-label">{t.profileSource}</p>
          <Prose html={profile.html} locale={locale} />
        </div>
        <Toc headings={profile.headings} locale={locale} />
      </div>
      <Contact locale={locale} />
    </>
  );
}
export function Privacy({ data }: { data: PageData }) {
  const { locale } = data;
  const t = dictionaries[locale];

  return (
    <>
      <PageHeader
        eyebrow="PRIVACY / COMMENTS"
        title={t.privacy}
        description={t.privacyIntro}
      />
      <div className="prose privacy-prose">
        <p>{t.privacyBody}</p>
        <p>
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            GitHub Privacy Statement ↗
          </a>
        </p>
      </div>
    </>
  );
}
export function NotFound({ data }: { data: PageData }) {
  const { locale } = data;
  const t = dictionaries[locale];

  return (
    <div className="empty-state error-page">
      <span className="error-code">404</span>
      <h1>{t.notFound}</h1>
      <p>{t.notFoundText}</p>
      <a className="button primary" href={`/${locale}/`}>
        {t.returnHome}
        <Icon name="arrow" />
      </a>
    </div>
  );
}
