import { articlePath } from '../../lib/blog-tree.ts';
import type { AboutProfile, ViewData } from '../../app/page.tsx';
import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Icon, type IconName } from '../../components/Icon.tsx';
import { linkIcon } from '../../components/link-icon.ts';
import {
  dictionaries,
  formatCompactDate,
  formatYearMonthDuration,
  type Locale,
} from '../../i18n/index.ts';
import { pageIds } from '../../lib/page-ids.ts';

type HomeView = Extract<ViewData, { kind: 'home' }>;

const yearMonth = (value: string) => value.replace('-', '.');

const competencyIcons: Record<string, IconName> = {
  backend: 'server',
  cloud: 'cloud',
  'secure-network': 'shield',
  'model-training': 'branch',
  'gpu-inference': 'cpu',
  cryptography: 'book',
};

// Official wordmarks stay local and unchanged; provenance lives in brand-assets.json.
const employerLogos: Record<string, string> = {
  'trend-micro': '/assets/employer-trend-micro.svg',
  kkstream: '/assets/employer-kkstream.jpg',
};

/** The profile as the workspace README: front matter, logo, then the résumé. */
export function Readme({ view, locale }: { view: HomeView; locale: Locale }) {
  const { profile, recent } = view;
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

      <section
        className="md-section community-recommendation"
        id="community-title"
        aria-label={t.communityTitle}
      >
        <p className="ln md-lead">{t.communityInvitation}</p>
        <p className="ln community-action">
          <a
            className="text-action community-link"
            href="https://www.facebook.com/groups/915613384421068"
            rel="noopener noreferrer"
          >
            <span className="community-link-name">
              <Icon name="network" size={24} />
              <span lang="zh-Hant">硬核 AI 交流社</span>
            </span>
            <span className="community-link-platform">
              <span> · Facebook</span>
              <Icon name="arrow-up-right" size={18} />
            </span>
            <span className="sr-only">（{t.newTab}）</span>
          </a>
        </p>
      </section>

      <Competencies profile={profile} locale={locale} />

      <Experience profile={profile} locale={locale} />

      {recent.length ? (
        <section className="md-section" aria-labelledby="recent-title">
          <MdHeading level={2} id="recent-title" icon="pen">
            {t.recentTitle}
          </MdHeading>
          <ul className="file-list">
            {recent.map((post) => (
              <li className="ln" key={post.id}>
                <a href={articlePath(post.slug, locale)}>
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
  locale,
}: {
  profile: AboutProfile;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <section className="md-section" aria-labelledby="competencies-title">
      <span id="skills-h" className="anchor-alias" aria-hidden="true" />
      <span id="depth-h" className="anchor-alias" aria-hidden="true" />
      <span id="proj-h" className="anchor-alias" aria-hidden="true" />
      <MdHeading level={2} id="competencies-title" icon="briefcase">
        {t.competenciesTitle}
      </MdHeading>
      <p className="ln md-lead">{t.competenciesIntro}</p>
      <div className="ln capabilities">
        {profile.competencies.map((competency) => {
          const source = competency.source;
          const sourceIndex = source
            ? competency.description.indexOf(source.label)
            : -1;
          return (
            <article
              className="capability"
              key={competency.id}
              data-skill={competency.id}
            >
              <h3 className="capability-title">
                <Icon
                  name={competencyIcons[competency.id] ?? 'package'}
                  size={18}
                />
                <span>{competency.title}</span>
              </h3>
              <p className="capability-description">
                {source && sourceIndex >= 0 ? (
                  <>
                    {competency.description.slice(0, sourceIndex)}
                    <a href={source.url}>
                      {source.label}
                      <Icon name="arrow-up-right" size={12} />
                      <span className="sr-only">（{t.newTab}）</span>
                    </a>
                    {competency.description.slice(
                      sourceIndex + source.label.length,
                    )}
                  </>
                ) : (
                  competency.description
                )}
              </p>
              <ul className="capability-tools" aria-label={t.tools}>
                {competency.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <p className="ln capability-note">{t.competenciesCaveat}</p>
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
          const employerLogo =
            entry.kind === 'work' ? employerLogos[entry.id] : undefined;
          const duration =
            entry.kind === 'work' && entry.endDate
              ? formatYearMonthDuration(entry.startDate, entry.endDate, locale)
              : null;
          const count = entry.details.reduce(
            (sum, group) => sum + group.items.length,
            0,
          );
          const links = entry.links.map((link) => (
            <p className={count ? undefined : 'ln'} key={link.url}>
              <a className="text-action resource-link" href={link.url}>
                <Icon name={linkIcon(link.url)} size={16} />
                {link.label}
                <Icon name="arrow-up-right" size={14} />
                <span className="sr-only">（{t.newTab}）</span>
              </a>
            </p>
          ));
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
                  {entry.dateLabel ?? yearMonth(entry.startDate)}
                </time>
                {entry.endDate || entry.current ? ' — ' : null}
                {entry.endDate ? (
                  <time dateTime={entry.endDate}>
                    {yearMonth(entry.endDate)}
                  </time>
                ) : entry.current ? (
                  t.present
                ) : null}
                {duration ? (
                  <span className="timeline-duration">{duration}</span>
                ) : null}
                {entry.kind === 'education' && entry.current ? (
                  <span className="label">{t.educationStatus}</span>
                ) : null}
              </p>
              {employerLogo ? (
                <p className="ln timeline-employer">
                  <img
                    className="timeline-employer-logo"
                    src={employerLogo}
                    alt=""
                    width={144}
                    height={32}
                    loading="lazy"
                    decoding="async"
                  />
                </p>
              ) : null}
              <h3 className="ln timeline-role">
                <Icon
                  name={entry.kind === 'work' ? 'briefcase' : 'graduation'}
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
                  {links}
                </details>
              ) : null}
              {!count ? links : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
