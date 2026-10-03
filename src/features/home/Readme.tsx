import type {
  AboutProfile,
  ProjectCardData,
  ViewData,
} from '../../app/page.tsx';
import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon, type IconName } from '../../components/Icon.tsx';
import { linkIcon } from '../../components/link-icon.ts';
import {
  dictionaries,
  formatCompactDate,
  type Locale,
} from '../../i18n/index.ts';
import { noteCopy } from '../../lib/notes-copy.ts';
import { pageIds } from '../../lib/page-ids.ts';
import { papersUrl } from '../../lib/site.ts';

type HomeView = Extract<ViewData, { kind: 'home' }>;
type PostLinks = HomeView['posts'];

const yearMonth = (value: string) => value.replace('-', '.');

const competencyIcons: Record<string, IconName> = {
  backend: 'server',
  cloud: 'cloud',
  ai: 'sparkles',
};

/** The profile as the workspace README: front matter, logo, then the résumé. */
export function Readme({ view, locale }: { view: HomeView; locale: Locale }) {
  const { profile, projects, posts, recent } = view;
  const t = dictionaries[locale];
  return (
    <div className="buffer readme">
      <section className="readme-hero" aria-labelledby="readme-title">
        <div className="readme-intro">
          <span id="beyond-h" className="anchor-alias" aria-hidden="true" />
          <span id="comm-h" className="anchor-alias" aria-hidden="true" />
          <p className="ln md-fence" aria-hidden="true">
            ---
          </p>
          <dl className="front-matter">
            <div className="ln">
              <dt lang="en">name</dt>
              <dd lang="zh-Hant">{profile.publicName}</dd>
            </div>
            <div className="ln">
              <dt lang="en">alias</dt>
              <dd>{profile.displayName}</dd>
            </div>
            <div className="ln">
              <dt lang="en">role</dt>
              <dd>{profile.introduction.role}</dd>
            </div>
            <div className="ln">
              <dt lang="en">status</dt>
              <dd>{profile.introduction.status}</dd>
            </div>
            <div className="ln">
              <dt lang="en">github</dt>
              <dd>
                <a href={profile.contact.github}>
                  {profile.contact.github.replace('https://', '')}
                  <Icon name="arrow-up-right" size={14} />
                  <span className="sr-only">（{t.newTab}）</span>
                </a>
              </dd>
            </div>
            <div className="ln">
              <dt lang="en">email</dt>
              <dd>
                <a href={`mailto:${profile.contact.email}`}>
                  {profile.contact.email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="ln md-fence" aria-hidden="true">
            ---
          </p>
          <MdHeading level={1} id="readme-title">
            {profile.displayName}
          </MdHeading>
          <p className="ln readme-bio">{profile.introduction.shortBio}</p>
          {/* A start-screen menu: each entry is a real link; the hint is its path or real key. */}
          <ul className="dashboard">
            <li className="ln">
              <a className="dash-item" href={`/${locale}/blog/`}>
                <Icon name="pen" size={18} />
                <span className="dash-label">{t.readBlog}</span>
                <span className="dash-hint" aria-hidden="true">
                  ~/blog
                </span>
              </a>
            </li>
            <li className="ln">
              <a className="dash-item" href={`/${locale}/note/`}>
                <Icon name="notebook" size={18} />
                <span className="dash-label">{noteCopy[locale].notes}</span>
                <span className="dash-hint" aria-hidden="true">
                  ~/note
                </span>
              </a>
            </li>
            <li className="ln">
              <a className="dash-item" href={`/${locale}/search/#search`}>
                <Icon name="search" size={18} />
                <span className="dash-label">{t.searchSite}</span>
                <span className="dash-hint" aria-hidden="true">
                  <kbd>/</kbd>
                </span>
              </a>
            </li>
            <li className="ln">
              <a className="dash-item" href={papersUrl}>
                <Icon name="newspaper" size={18} />
                <span className="dash-label">
                  {t.navPapers}
                  <Icon name="arrow-up-right" size={14} />
                  <span className="sr-only">（{t.newTab}）</span>
                </span>
                <span className="dash-hint" aria-hidden="true">
                  paper.dennysora.me
                </span>
              </a>
            </li>
          </ul>
        </div>
        <figure className="readme-logo">
          <div className="float-title" aria-hidden="true">
            <Icon name="image" size={14} />
            <span>logo-hero.webp</span>
            <span className="float-meta">346×392</span>
          </div>
          <img
            src="/assets/logo-hero.webp"
            srcSet="/assets/logo-hero.webp 1x, /assets/logo-hero@2x.webp 2x"
            width={346}
            height={392}
            alt={t.logoAlt}
            decoding="async"
            fetchPriority="high"
          />
        </figure>
      </section>

      <Competencies
        profile={profile}
        projects={projects}
        posts={posts}
        locale={locale}
      />

      <Experience profile={profile} locale={locale} />

      {recent.length ? (
        <section className="md-section" aria-labelledby="recent-title">
          <MdHeading level={2} id="recent-title" icon="pen">
            {t.recentTitle}
          </MdHeading>
          <ul className="file-list">
            {recent.map((post) => (
              <li className="ln" key={post.id}>
                <a href={`/${locale}/blog/${post.slug}/`}>
                  <Icon name="markdown" size={16} />
                  <span className="file-list-name">{post.slug}.md</span>
                  <span className="file-list-title">{post.title}</span>
                  <time dateTime={post.publishedAt}>
                    {formatCompactDate(post.publishedAt)}
                  </time>
                </a>
              </li>
            ))}
          </ul>
          <p className="ln">
            <a className="text-action" href={`/${locale}/blog/`}>
              {t.allArticles}
              <Icon name="arrow" size={18} />
            </a>
          </p>
        </section>
      ) : null}

      <EndOfBuffer />
    </div>
  );
}

function Competencies({
  profile,
  projects,
  posts,
  locale,
}: {
  profile: AboutProfile;
  projects: ProjectCardData[];
  posts: PostLinks;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const levelLabel = {
    production: t.levelProduction,
    practice: t.levelPractice,
    learning: t.levelLearning,
  };
  return (
    <section className="md-section" aria-labelledby="competencies-title">
      <span id="skills-h" className="anchor-alias" aria-hidden="true" />
      <span id="depth-h" className="anchor-alias" aria-hidden="true" />
      <span id="proj-h" className="anchor-alias" aria-hidden="true" />
      <MdHeading level={2} id="competencies-title" icon="briefcase">
        {t.competenciesTitle}
      </MdHeading>
      <p className="ln md-lead">{t.competenciesIntro}</p>
      <div className="capabilities">
        {profile.competencies.map((competency) => (
          <article className="capability" key={competency.id}>
            <h3 className="ln capability-title">
              <Icon
                name={competencyIcons[competency.id] ?? 'package'}
                size={18}
              />
              <span className="capability-name">{competency.title}</span>
              <span className="level-labels">
                {competency.levels.map((level) => (
                  <span key={level} className="label">
                    {levelLabel[level]}
                  </span>
                ))}
              </span>
            </h3>
            <p className="ln">{competency.description}</p>
            <ul className="capability-examples" aria-label={t.examples}>
              {competency.examples.map((example) => (
                <li className="ln" key={example}>
                  {example}
                </li>
              ))}
            </ul>
            <p className="ln capability-tools">
              <span className="capability-tools-label">{t.tools}</span>
              {competency.tools.join(' · ')}
            </p>
            <ul className="ln capability-evidence">
              {competency.evidence.map((evidence) => {
                if (evidence.kind === 'section')
                  return (
                    <li key="experience">
                      <a href={`#${pageIds.experience}`}>
                        <Icon name="arrow-down" size={16} />
                        {t.seeExperience}
                      </a>
                    </li>
                  );
                if (evidence.kind === 'post') {
                  const post = posts[evidence.id];
                  return post ? (
                    <li key={evidence.id}>
                      <a href={`/${locale}/blog/${post.slug}/`}>
                        <Icon name="markdown" size={16} />
                        {t.readPost}：{post.title}
                      </a>
                    </li>
                  ) : null;
                }
                const project = projects.find(
                  (item) => item.id === evidence.id,
                );
                return project ? (
                  <li key={evidence.id}>
                    <a className="resource-link" href={project.repository}>
                      <Icon name={linkIcon(project.repository)} size={16} />
                      {t.projectSource}：{project.title}
                      <Icon name="arrow-up-right" size={14} />
                      <span className="sr-only">（{t.newTab}）</span>
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Work history drawn as `git log --graph`: newest first, one commit per role. */
function Experience({
  profile,
  locale,
}: {
  profile: AboutProfile;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <section
      className="md-section"
      id={pageIds.experience}
      aria-labelledby="experience-title"
    >
      <span id="exp-h" className="anchor-alias" aria-hidden="true" />
      <span id="edu-h" className="anchor-alias" aria-hidden="true" />
      <MdHeading level={2} id="experience-title" icon="branch">
        {t.experienceTitle}
      </MdHeading>
      <p className="ln md-lead">{t.experienceIntro}</p>
      <ol className="git-log">
        {profile.experience.map((entry) => {
          const count = entry.details.reduce(
            (sum, group) => sum + group.items.length,
            0,
          );
          return (
            <li
              className="timeline-entry"
              key={entry.id}
              data-current={entry.current ? 'true' : undefined}
              data-kind={entry.kind}
            >
              <p className="ln timeline-date">
                {entry.current ? (
                  <span className="git-head" aria-hidden="true">
                    HEAD
                  </span>
                ) : null}
                <time dateTime={entry.startDate}>
                  {yearMonth(entry.startDate)}
                </time>
                {' — '}
                {entry.endDate ? (
                  <time dateTime={entry.endDate}>
                    {yearMonth(entry.endDate)}
                  </time>
                ) : entry.current ? (
                  t.present
                ) : null}
                {entry.kind === 'education' ? (
                  <span className="label">{t.educationStatus}</span>
                ) : null}
              </p>
              <h3 className="ln timeline-role">
                <Icon
                  name={entry.kind === 'education' ? 'graduation' : 'briefcase'}
                  size={18}
                />
                <span>
                  {entry.role}
                  <span className="timeline-org">
                    <span aria-hidden="true"> @ </span>
                    <span className="sr-only">，</span>
                    {entry.organization}
                  </span>
                </span>
              </h3>
              <p className="ln">{entry.summary}</p>
              {entry.highlights.length ? (
                <ul className="timeline-highlights">
                  {entry.highlights.map((item) => (
                    <li className="ln" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {count ? (
                <details className="ln timeline-details fold">
                  <summary>
                    <span className="fold-mark" aria-hidden="true" />
                    {t.showAllWork(count)}
                  </summary>
                  {entry.details.map((group) => (
                    <div className="timeline-group" key={group.title}>
                      <h4>{group.title}</h4>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {entry.links.map((link) => (
                    <a
                      className="text-action resource-link"
                      key={link.url}
                      href={link.url}
                    >
                      <Icon name={linkIcon(link.url)} size={16} />
                      {link.label}
                      <Icon name="arrow-up-right" size={14} />
                      <span className="sr-only">（{t.newTab}）</span>
                    </a>
                  ))}
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
