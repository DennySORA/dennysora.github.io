import { useEffect } from 'react';
import type {
  AboutProfile,
  ProjectCardData,
  ViewData,
} from '../../app/page.tsx';
import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { CopyButton } from '../../components/CopyButton.tsx';
import { Icon } from '../../components/Icon.tsx';
import { ProjectTeaser } from '../../components/ProjectCard.tsx';
import {
  dictionaries,
  formatCompactDate,
  type Locale,
} from '../../i18n/index.ts';
import { pageIds } from '../../lib/page-ids.ts';

type HomeView = Extract<ViewData, { kind: 'home' }>;
type PostLinks = HomeView['posts'];

const yearMonth = (value: string) => value.replace('-', '.');

/** Opens a collapsed record when an old or shared link points into it. */
function useRevealHashTarget() {
  useEffect(() => {
    function reveal() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      const details = target?.closest('details');
      if (target && details && !details.open) {
        details.open = true;
        target.scrollIntoView();
      }
    }
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
}

/** The profile as the workspace README: front matter, logo, then the résumé. */
export function Readme({ view, locale }: { view: HomeView; locale: Locale }) {
  useRevealHashTarget();
  const { profile, projects, posts, recent } = view;
  const t = dictionaries[locale];
  const featured = profile.featuredProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is ProjectCardData => Boolean(project));
  return (
    <div className="buffer readme">
      <section className="readme-hero" aria-labelledby="readme-title">
        <div className="readme-intro">
          <p className="ln md-fence" aria-hidden="true">
            ---
          </p>
          <dl className="front-matter">
            <div className="ln">
              <dt lang="en">name</dt>
              <dd>{profile.displayName}</dd>
            </div>
            <div className="ln">
              <dt lang="en">alias</dt>
              <dd lang="zh-Hant">{profile.publicName}</dd>
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
                  <Icon name="external" size={14} />
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
          <div className="ln action-row">
            <a className="button button-primary" href={`/${locale}/blog/`}>
              {t.readBlog}
              <Icon name="arrow" size={18} />
            </a>
            <a className="button button-quiet" href={`/${locale}/projects/`}>
              {t.viewMyProjects}
            </a>
            <a className="button button-quiet" href={`#${pageIds.contact}`}>
              {t.getInTouch}
            </a>
          </div>
        </div>
        <figure className="readme-logo">
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

      <div className="md-comments">
        <p className="ln md-comment">
          <span className="md-mark" aria-hidden="true">
            {'// '}
          </span>
          {profile.focusNote.heading}
        </p>
        <ul aria-label={profile.focusNote.heading}>
          {profile.focusNote.items.map((item) => (
            <li className="ln md-comment" key={item.id}>
              <span className="md-mark" aria-hidden="true">
                {'// '}
              </span>
              <strong className="focus-note-title">{item.title}</strong>
              <span aria-hidden="true"> — </span>
              <span className="sr-only">：</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      <Competencies
        profile={profile}
        projects={projects}
        posts={posts}
        locale={locale}
      />

      <section className="md-section" aria-labelledby="works-title">
        <MdHeading level={2} id="works-title">
          {t.worksTitle}
        </MdHeading>
        <div className="ln work-pair">
          {featured.map((project) => (
            <ProjectTeaser key={project.id} project={project} locale={locale} />
          ))}
        </div>
        <p className="ln">
          <a className="text-action" href={`/${locale}/projects/`}>
            {t.allProjects}
            <Icon name="arrow" size={18} />
          </a>
        </p>
      </section>

      <Experience profile={profile} locale={locale} />

      <section
        className="md-section personal-grid"
        aria-label={`${t.exploringTitle} · ${t.beyondTitle}`}
      >
        <div id="exploring">
          <MdHeading level={2}>{t.exploringTitle}</MdHeading>
          <p className="ln">{profile.currentFocus.question}</p>
          <ul className="focus-list">
            {profile.currentFocus.items.map((item) => (
              <li className="ln" key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="ln fine">
            {t.exploringUpdated(profile.currentFocus.updatedAt)}
          </p>
          {posts[profile.currentFocus.postId] ? (
            <p className="ln">
              <a
                className="text-action"
                href={`/${locale}/blog/${posts[profile.currentFocus.postId]?.slug}/`}
              >
                {t.readResearch}
                <Icon name="arrow" size={18} />
              </a>
            </p>
          ) : null}
        </div>
        <div id="beyond">
          <span id="beyond-h" className="anchor-alias" aria-hidden="true" />
          <MdHeading level={2}>{t.beyondTitle}</MdHeading>
          <p className="ln">{profile.personal.intro}</p>
          <dl className="interest-list">
            {profile.personal.interests.map((interest) => (
              <div className="ln" key={interest.id}>
                <dt>{interest.title}</dt>
                <dd>{interest.text}</dd>
              </div>
            ))}
          </dl>
          <div id="education" className="education">
            <span id="edu-h" className="anchor-alias" aria-hidden="true" />
            <MdHeading level={3}>{t.educationTitle}</MdHeading>
            <ul>
              {profile.education.map((item) => (
                <li className="ln" key={item.id}>
                  <span>{item.institution}</span>
                  <span className="fine">
                    {item.period} · {item.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {recent.length ? (
        <section className="md-section" aria-labelledby="recent-title">
          <MdHeading level={2} id="recent-title">
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

      <FullRecord profile={profile} locale={locale} />

      <section
        className="md-section contact-row"
        id={pageIds.contact}
        aria-labelledby="contact-title"
      >
        <MdHeading level={2} id="contact-title">
          {t.contactTitle}
        </MdHeading>
        <p className="ln">{t.contactText}</p>
        <div className="ln action-row">
          <a
            className="button button-primary"
            href={`mailto:${profile.contact.email}`}
          >
            <Icon name="mail" size={18} />
            {profile.contact.email}
          </a>
          <CopyButton
            value={profile.contact.email}
            label={t.copyEmail}
            success={t.emailCopied}
            failure={t.copyEmailFailed}
          />
          <a
            className="text-action resource-link"
            href={profile.contact.github}
          >
            GitHub
            <Icon name="external" size={18} />
            <span className="sr-only">（{t.newTab}）</span>
          </a>
        </div>
      </section>
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
      <MdHeading level={2} id="competencies-title">
        {t.competenciesTitle}
      </MdHeading>
      <p className="ln md-lead">{t.competenciesIntro}</p>
      <div className="capabilities">
        {profile.competencies.map((competency) => (
          <article className="capability" key={competency.id}>
            <h3 className="ln capability-title">
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
                        {t.seeExperience}
                        <Icon name="arrow-down" size={16} />
                      </a>
                    </li>
                  );
                if (evidence.kind === 'post') {
                  const post = posts[evidence.id];
                  return post ? (
                    <li key={evidence.id}>
                      <a href={`/${locale}/blog/${post.slug}/`}>
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
                      {t.projectSource}：{project.title}
                      <Icon name="external" size={16} />
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

/** Work history drawn as a commit graph: newest first, one node per role. */
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
      <MdHeading level={2} id="experience-title">
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
                {entry.role}
                <span className="timeline-org">
                  <span aria-hidden="true"> @ </span>
                  <span className="sr-only">，</span>
                  {entry.organization}
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
                <details className="ln timeline-details">
                  <summary>{t.showAllWork(count)}</summary>
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
                      {link.label}
                      <Icon name="external" size={16} />
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

function FullRecord({
  profile,
  locale,
}: {
  profile: AboutProfile;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const { record } = profile;
  return (
    <section
      className="md-section record"
      id="record"
      aria-labelledby="record-title"
    >
      <MdHeading level={2} id="record-title">
        {t.recordTitle}
      </MdHeading>
      <p className="ln md-lead">{t.recordIntro}</p>
      <details className="ln record-group" id="skills-h">
        <summary>{t.recordSkills}</summary>
        <div className="record-grid">
          {record.skills.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul className="record-items">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
      <details className="ln record-group" id="depth-h">
        <summary>{t.recordDepth}</summary>
        <div className="record-grid">
          {record.depth.map((area) => (
            <div key={area.title}>
              <h3>{area.title}</h3>
              <dl className="record-depth">
                {area.groups.map((group, index) => (
                  <div key={group.label ?? index}>
                    {group.label ? <dt>{group.label}</dt> : null}
                    <dd>{group.items.join(locale === 'en' ? ', ' : '、')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </details>
      <details className="ln record-group" id="open-source">
        <summary>{t.recordOpenSource}</summary>
        <ul className="record-list">
          {record.openSource.map((repository) => (
            <li key={repository.name}>
              <a href={repository.url}>
                {repository.name}
                <Icon name="external" size={15} />
                <span className="sr-only">（{t.newTab}）</span>
              </a>
              {repository.language ? (
                <span className="fine"> · {repository.language}</span>
              ) : null}
              <p>{repository.description}</p>
            </li>
          ))}
        </ul>
      </details>
      <details className="ln record-group" id="comm-h">
        <summary>{t.recordCommunity}</summary>
        <ul className="record-list">
          {record.community.map((group) => (
            <li key={group.title}>
              <h3>{group.title}</h3>
              <ul className="record-items">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a href={group.link.url}>
                {group.link.label}
                <Icon name="external" size={15} />
                <span className="sr-only">（{t.newTab}）</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
      <details className="ln record-group" id="writing">
        <summary>{t.recordWriting}</summary>
        <ul className="record-list">
          {record.writing.map((item) => (
            <li key={item.url}>
              <a href={item.url}>
                {item.title}
                <Icon name="external" size={15} />
                <span className="sr-only">（{t.newTab}）</span>
              </a>
              <span className="fine"> · {item.host}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
