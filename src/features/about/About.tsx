import { useEffect } from 'react';
import type {
  AboutProfile,
  ProjectCardData,
  ViewData,
} from '../../app/page.tsx';
import { CopyButton } from '../../components/CopyButton.tsx';
import { Icon } from '../../components/Icon.tsx';
import { ProjectTeaser } from '../../components/ProjectCard.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';
import { pageIds } from '../../lib/page-ids.ts';

type AboutView = Extract<ViewData, { kind: 'about' }>;
type PostLinks = AboutView['posts'];

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

export function About({ view, locale }: { view: AboutView; locale: Locale }) {
  useRevealHashTarget();
  const { profile, projects, posts } = view;
  const t = dictionaries[locale];
  const featured = profile.featuredProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is ProjectCardData => Boolean(project));
  return (
    <div className="container profile-layout about">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <p className="eyebrow">{t.aboutEyebrow}</p>
          <h1 id="about-title">
            {profile.displayName}
            <span className="hero-name" lang="zh-Hant">
              {profile.publicName}
            </span>
          </h1>
          <p className="hero-statement">{profile.introduction.role}</p>
          <p className="hero-bio">{profile.introduction.shortBio}</p>
          <div className="action-row">
            <a className="button button-primary" href={`/${locale}/projects/`}>
              {t.viewMyProjects}
              <Icon name="arrow" size={18} />
            </a>
            <a className="button button-quiet" href={`#${pageIds.contact}`}>
              {t.getInTouch}
            </a>
          </div>
          <p className="hero-meta">
            <span>{profile.introduction.status}</span>
            <a href={profile.contact.github}>
              GitHub
              <Icon name="external" size={15} />
              <span className="sr-only">（{t.newTab}）</span>
            </a>
          </p>
        </div>
        <aside className="focus-note" aria-label={t.aboutOverview}>
          <p className="focus-note-heading">{profile.focusNote.heading}</p>
          {profile.focusNote.items.map((item) => (
            <div className="focus-note-item" key={item.id}>
              <p className="focus-note-title entity-kind">{item.title}</p>
              <p>{item.text}</p>
            </div>
          ))}
        </aside>
      </section>

      <Competencies
        profile={profile}
        projects={projects}
        posts={posts}
        locale={locale}
      />

      <section className="section" aria-labelledby="works-title">
        <div className="section-intro">
          <h2 id="works-title">{t.worksTitle}</h2>
          <a className="text-action" href={`/${locale}/projects/`}>
            {t.allProjects}
            <Icon name="arrow" size={18} />
          </a>
        </div>
        <div className="work-pair">
          {featured.map((project) => (
            <ProjectTeaser key={project.id} project={project} locale={locale} />
          ))}
        </div>
      </section>

      <Experience profile={profile} locale={locale} />

      <section
        className="section personal-grid"
        aria-label={`${t.exploringTitle} · ${t.beyondTitle}`}
      >
        <div id="exploring">
          <h2>{t.exploringTitle}</h2>
          <p>{profile.currentFocus.question}</p>
          <ul className="focus-list">
            {profile.currentFocus.items.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="fine">
            {t.exploringUpdated(profile.currentFocus.updatedAt)}
          </p>
          <div className="stacked-actions">
            {posts[profile.currentFocus.postId] ? (
              <a
                className="text-action"
                href={`/${locale}/blog/${posts[profile.currentFocus.postId]?.slug}/`}
              >
                {t.readResearch}
                <Icon name="arrow" size={18} />
              </a>
            ) : null}
            <a className="text-action" href={`/${locale}/papers/`}>
              {t.seePapers}
              <Icon name="arrow" size={18} />
            </a>
          </div>
        </div>
        <div id="beyond">
          <span id="beyond-h" className="anchor-alias" aria-hidden="true" />
          <h2>{t.beyondTitle}</h2>
          <p>{profile.personal.intro}</p>
          <dl className="interest-list">
            {profile.personal.interests.map((interest) => (
              <div key={interest.id}>
                <dt>{interest.title}</dt>
                <dd>{interest.text}</dd>
              </div>
            ))}
          </dl>
          <div id="education" className="education">
            <span id="edu-h" className="anchor-alias" aria-hidden="true" />
            <h3>{t.educationTitle}</h3>
            <ul>
              {profile.education.map((item) => (
                <li key={item.id}>
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

      <FullRecord profile={profile} locale={locale} />

      <section
        className="contact-row"
        id={pageIds.contact}
        aria-labelledby="contact-title"
      >
        <div>
          <h2 id="contact-title">{t.contactTitle}</h2>
          <p>{t.contactText}</p>
        </div>
        <div className="action-row">
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
    <section className="section" aria-labelledby="competencies-title">
      <div className="section-intro">
        <h2 id="competencies-title">{t.competenciesTitle}</h2>
        <p>{t.competenciesIntro}</p>
      </div>
      <div className="capabilities">
        {profile.competencies.map((competency) => (
          <article className="capability" key={competency.id}>
            <ul className="level-labels">
              {competency.levels.map((level) => (
                <li key={level} className="label">
                  {levelLabel[level]}
                </li>
              ))}
            </ul>
            <h3>{competency.title}</h3>
            <p>{competency.description}</p>
            <ul className="capability-examples" aria-label={t.examples}>
              {competency.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
            <ul className="capability-evidence">
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
            <p className="capability-tools">
              <span className="capability-tools-label">{t.tools}</span>
              {competency.tools.join(' · ')}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

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
      className="section"
      id={pageIds.experience}
      aria-labelledby="experience-title"
    >
      <span id="exp-h" className="anchor-alias" aria-hidden="true" />
      <div className="section-intro">
        <h2 id="experience-title">{t.experienceTitle}</h2>
        <p>{t.experienceIntro}</p>
      </div>
      {profile.experience.map((entry) => {
        const count = entry.details.reduce(
          (sum, group) => sum + group.items.length,
          0,
        );
        return (
          <article className="timeline-entry" key={entry.id}>
            <p className="timeline-date">
              <time dateTime={entry.startDate}>
                {yearMonth(entry.startDate)}
              </time>
              {' — '}
              {entry.endDate ? (
                <time dateTime={entry.endDate}>{yearMonth(entry.endDate)}</time>
              ) : entry.current ? (
                t.present
              ) : null}
            </p>
            <div className="timeline-body">
              {entry.kind === 'education' ? (
                <p className="label">{t.educationStatus}</p>
              ) : null}
              <h3>{entry.role}</h3>
              <p className="timeline-org">{entry.organization}</p>
              <p>{entry.summary}</p>
              {entry.highlights.length ? (
                <ul className="timeline-highlights">
                  {entry.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {count ? (
                <details className="timeline-details">
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
            </div>
          </article>
        );
      })}
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
      className="section record"
      id="record"
      aria-labelledby="record-title"
    >
      <div className="section-intro">
        <h2 id="record-title">{t.recordTitle}</h2>
        <p>{t.recordIntro}</p>
      </div>
      <details className="record-group" id="skills-h">
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
      <details className="record-group" id="depth-h">
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
      <details className="record-group" id="open-source">
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
      <details className="record-group" id="comm-h">
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
      <details className="record-group" id="writing">
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
