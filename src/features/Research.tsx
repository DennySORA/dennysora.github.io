import type { PageData } from '../app/page.tsx';
import { dictionaries } from '../i18n/index.ts';
import { Icon } from '../components/Icon.tsx';
import { PostCard, SectionHeading } from '../components/Content.tsx';
import { PageHeader } from '../components/PageParts.tsx';
export function Research({ data }: { data: PageData }) {
  const { locale, research, posts } = data;
  const t = dictionaries[locale];

  return (
    <>
      <PageHeader
        eyebrow="PAPERS / EXPERIMENTS / QUESTIONS"
        title={t.research}
        description={t.researchIntro}
      />
      <div className="research-intro">
        <Icon name="research" size={30} />
        <div>
          <h2>{t.paperDigest}</h2>
          <p>{t.paperText}</p>
          <a className="text-link" href="https://paper.dennysora.me/">
            {t.openDigest}
            <Icon name="external" size={15} />
          </a>
          <p>
            <a className="text-link" href="https://paper.dennysora.me/reports/">
              {t.periodicReports}
              <Icon name="external" size={15} />
            </a>
          </p>
        </div>
      </div>
      {research ? (
        <>
          <div className="snapshot-label">
            <span>
              {t.snapshot}{' '}
              <time dateTime={research.generatedAt}>{research.period}</time>
            </span>
            <span>{t.researchStale}</span>
          </div>
          <div className="research-list">
            {research.reports.map((report, i) => (
              <article key={report.id}>
                <span className="report-number">0{i + 1}</span>
                <div>
                  <div className="article-meta">
                    <span className="topic topic-ai">PAPER</span>
                    <span>{report.publishedAt.slice(0, 10)}</span>
                  </div>
                  <h2 lang={locale === 'zh-hant' ? 'zh-Hant' : 'en'}>
                    {locale === 'zh-hant' ? report.titleZh : report.title}
                  </h2>
                  <p className="generated-note">{t.generated}</p>
                  <div className="report-links">
                    <a href={report.originalUrl}>
                      {t.originalPaper}
                      <Icon name="external" size={13} />
                    </a>
                    <a href={report.guideUrl}>
                      {t.readGuide}
                      <Icon name="arrow" size={14} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <a className="source-link" href={research.sourceUrl}>
            {t.source} · {research.sourceCommit.slice(0, 7)}
            <Icon name="external" size={12} />
          </a>
        </>
      ) : (
        <div className="empty-state">
          <p>{t.researchEmpty}</p>
          <a href="https://paper.dennysora.me/">{t.openDigest}</a>
        </div>
      )}
      <section className="home-section">
        <SectionHeading number="↳" title={t.researchLabel} />
        <div className="blog-grid">
          {posts
            .filter((post) => post.topics.includes('ai'))
            .map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
        </div>
      </section>
    </>
  );
}
