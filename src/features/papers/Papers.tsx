import type { ViewData } from '../../app/page.tsx';
import { Icon } from '../../components/Icon.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';
import { papersUrl } from '../../lib/site.ts';

type PapersView = Extract<ViewData, { kind: 'papers' }>;

export function Papers({ view, locale }: { view: PapersView; locale: Locale }) {
  const t = dictionaries[locale];
  const { research } = view;
  return (
    <div className="container profile-layout papers">
      <header className="paper-hero">
        <p className="eyebrow">{t.papersEyebrow}</p>
        <h1>{t.papersTitle}</h1>
        <p className="lead">{t.papersLead}</p>
        <p>{t.papersText}</p>
        <div className="action-row">
          <a className="button button-primary" href={papersUrl}>
            {t.openPapers}
            <Icon name="external" size={18} />
            <span className="sr-only">（{t.newTab}）</span>
          </a>
          <a
            className="text-action"
            href={`/${locale}/blog/?type=research-note`}
          >
            {t.readMyResearch}
            <Icon name="arrow" size={18} />
          </a>
        </div>
        <p className="fine">{t.papersFine}</p>
      </header>

      <div className="paper-detail">
        <section aria-labelledby="two-kinds-title">
          <h2 id="two-kinds-title">{t.twoKindsTitle}</h2>
          <h3>{t.digestHeading}</h3>
          <p>{t.digestText}</p>
          <h3>{t.mainHeading}</h3>
          <p>{t.mainText}</p>
        </section>
        <section aria-labelledby="sources-title">
          <h2 id="sources-title">{t.sourcesTitle}</h2>
          <h3>{t.generatedHeading}</h3>
          <p>{t.generatedText}</p>
          <h3>{t.snapshotHeading}</h3>
          <p>{t.snapshotText}</p>
        </section>
      </div>

      {research ? (
        <section className="section snapshot" aria-labelledby="snapshot-title">
          <div className="section-intro">
            <h2 id="snapshot-title">{t.snapshotTitle}</h2>
            <p>
              <time dateTime={research.generatedAt}>
                {t.snapshotDate(research.period)}
              </time>
              {' · '}
              {t.snapshotNotLive}
            </p>
          </div>
          <ol className="snapshot-list">
            {research.reports.map((report) => (
              <li key={report.id}>
                <p className="fine entity-kind">{t.generatedLabel}</p>
                <h3 lang={locale === 'zh-hant' ? 'zh-Hant' : 'en'}>
                  {locale === 'zh-hant' ? report.titleZh : report.title}
                </h3>
                <div className="action-row">
                  <a className="text-action" href={report.originalUrl}>
                    {t.originalPaper}
                    <Icon name="external" size={16} />
                    <span className="sr-only">（{t.newTab}）</span>
                  </a>
                  <a className="text-action" href={report.guideUrl}>
                    {t.readGuide}
                    <Icon name="external" size={16} />
                    <span className="sr-only">（{t.newTab}）</span>
                  </a>
                </div>
              </li>
            ))}
          </ol>
          <a className="fine source-link" href={research.sourceUrl}>
            {t.snapshotSource} · {research.sourceCommit.slice(0, 7)}
            <Icon name="external" size={14} />
          </a>
        </section>
      ) : null}

      <aside className="paper-banner" aria-labelledby="research-banner-title">
        <div>
          <h2 id="research-banner-title">{t.researchBannerTitle}</h2>
          <p>{t.researchBannerText}</p>
        </div>
        <a
          className="button button-quiet"
          href={`/${locale}/blog/trilingual-model-research/`}
        >
          {t.readResearch}
          <Icon name="arrow" size={18} />
        </a>
      </aside>
    </div>
  );
}
