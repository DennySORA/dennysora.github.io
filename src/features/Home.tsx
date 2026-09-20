import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { Icon } from '../components/Icon.tsx';
import {
  PostCard,
  ProjectCard,
  SectionHeading,
} from '../components/Content.tsx';
export function Home({ data }: { data: PageData }) {
  const { locale, posts, projects } = data;
  const t = dictionaries[locale];

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-dash" />
            {t.heroEyebrow}
          </p>
          <div className="hero-identity">
            <img
              src="/assets/avatar.png"
              alt="DennySORA"
              width="42"
              height="42"
            />
            <span>
              {t.hello} <strong>DennySORA</strong>
              <span className="identity-divider">/</span>
              <span lang="zh-Hant">李汶道</span>
            </span>
          </div>
          <h1>
            {t.heroLine1}
            <br />
            <span>{t.heroLine2}</span>
          </h1>
          <p className="hero-intro">{t.heroIntro}</p>
          <div className="hero-actions">
            <a className="button primary" href={`/${locale}/blog/`}>
              {t.heroAction}
              <Icon name="arrow" size={17} />
            </a>
            <a className="button quiet" href={`/${locale}/about/`}>
              {t.heroAbout}
              <Icon name="chevron" size={15} />
            </a>
          </div>
          <div className="hero-topics">
            {t.features.map((feature, i) => (
              <span key={feature}>
                <i className={`topic-dot dot-${i}`} />
                {feature}
              </span>
            ))}
          </div>
        </div>
        <aside className="profile-code">
          <div className="code-title">
            <span>
              <Icon name="code" size={15} />
              about.ts
            </span>
            <span>TypeScript</span>
          </div>
          <div className="code-lines" aria-label={t.role}>
            <div>
              <b>01</b>
              <span>
                <em>const</em> developer <em>=</em> {'{'}
              </span>
            </div>
            <div>
              <b>02</b>
              <span>
                {' '}
                name: <i>'DennySORA'</i>,
              </span>
            </div>
            <div>
              <b>03</b>
              <span>
                {' '}
                basedIn: <i>'Tokyo, JP'</i>,
              </span>
            </div>
            <div>
              <b>04</b>
              <span> focus: [</span>
            </div>
            <div>
              <b>05</b>
              <span>
                {' '}
                <i>'AI systems'</i>,
              </span>
            </div>
            <div>
              <b>06</b>
              <span>
                {' '}
                <i>'Cloud infrastructure'</i>,
              </span>
            </div>
            <div>
              <b>07</b>
              <span>
                {' '}
                <i>'Backend engineering'</i>
              </span>
            </div>
            <div>
              <b>08</b>
              <span> ],</span>
            </div>
            <div>
              <b>09</b>
              <span>
                {' '}
                mindset: <i>'stay curious'</i>
              </span>
            </div>
            <div>
              <b>10</b>
              <span>{'};'}</span>
            </div>
          </div>
          <div className="code-caption">
            <span>// {t.focus}</span>
            <p>{t.focusText}</p>
          </div>
        </aside>
      </section>
      <section className="home-section">
        <SectionHeading
          number="01"
          title={t.latest}
          href={`/${locale}/blog/`}
          label={t.allPosts}
        />
        <div className="featured-grid">
          {posts.slice(0, 3).map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              locale={locale}
              featured={i === 0}
            />
          ))}
        </div>
      </section>
      <section className="home-section">
        <SectionHeading
          number="02"
          title={t.selectedProjects}
          href={`/${locale}/projects/`}
          label={t.allProjects}
        />
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} />
          ))}
        </div>
      </section>
      <section className="research-banner">
        <div className="banner-icon">
          <Icon name="research" size={30} />
        </div>
        <div>
          <p className="eyebrow">RESEARCH LOG</p>
          <h2>{t.paperDigest}</h2>
          <p>{t.paperText}</p>
        </div>
        <a className="button secondary" href={`/${locale}/research/`}>
          {t.viewResearch}
          <Icon name="arrow" size={16} />
        </a>
      </section>
    </>
  );
}
