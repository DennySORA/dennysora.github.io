import type { ViewData } from '../../app/page.tsx';
import {
  ArticleListItem,
  taxonomyMaps,
} from '../../components/ArticleListItem.tsx';
import { Icon } from '../../components/Icon.tsx';
import { ProjectTeaser } from '../../components/ProjectCard.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';

type HomeView = Extract<ViewData, { kind: 'home' }>;

export function Home({ view, locale }: { view: HomeView; locale: Locale }) {
  const t = dictionaries[locale];
  const maps = taxonomyMaps(view.taxonomy);
  return (
    <div className="container profile-layout home">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="eyebrow">{t.homeEyebrow}</p>
        <h1 id="home-title">{t.homeTitle}</h1>
        <p className="hero-bio">{t.homeIntro}</p>
        <div className="action-row">
          <a className="button button-primary" href={`/${locale}/blog/`}>
            {t.readLibrary}
            <Icon name="arrow" size={18} />
          </a>
          <a className="button button-quiet" href={`/${locale}/projects/`}>
            {t.viewProjects}
          </a>
        </div>
      </section>

      {view.featured ? (
        <section className="section" aria-labelledby="featured-title">
          <div className="section-intro">
            <h2 id="featured-title">{t.featuredTitle}</h2>
          </div>
          <div className="article-list featured-article">
            <ArticleListItem
              post={view.featured}
              locale={locale}
              maps={maps}
              headingLevel={3}
            />
          </div>
        </section>
      ) : null}

      {view.latest.length ? (
        <section className="section" aria-labelledby="latest-title">
          <div className="section-intro">
            <h2 id="latest-title">{t.latestTitle}</h2>
            <a className="text-action" href={`/${locale}/blog/`}>
              {t.allArticles}
              <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="article-list">
            {view.latest.map((post) => (
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

      <section className="section" aria-labelledby="work-title">
        <div className="section-intro">
          <h2 id="work-title">{t.selectedWork}</h2>
          <a className="text-action" href={`/${locale}/projects/`}>
            {t.allProjects}
            <Icon name="arrow" size={18} />
          </a>
        </div>
        <div className="work-pair">
          {view.projects.map((project) => (
            <ProjectTeaser key={project.id} project={project} locale={locale} />
          ))}
        </div>
      </section>

      <section
        className="section home-about"
        aria-labelledby="about-short-title"
      >
        <img
          src="/assets/avatar.png"
          alt=""
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
        />
        <div>
          <h2 id="about-short-title">{t.aboutShortTitle}</h2>
          <p>{t.aboutShortText}</p>
          <a className="text-action" href={`/${locale}/about/`}>
            {t.readAbout}
            <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>

      <aside className="quiet-note" aria-labelledby="papers-note-title">
        <div>
          <h2 id="papers-note-title">{t.navPapers}</h2>
          <p>{t.papersQuietText}</p>
        </div>
        <a className="text-action" href={`/${locale}/papers/`}>
          {t.papersQuietLink}
          <Icon name="arrow" size={18} />
        </a>
      </aside>
    </div>
  );
}
