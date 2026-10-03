import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';
import { papersUrl } from '../../lib/site.ts';

/** The former Research page served two intents, so it offers both destinations. */
export function ResearchBridge({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  return (
    <div className="container profile-layout bridge">
      <PageHead
        eyebrow={t.researchBridgeEyebrow}
        title={t.researchBridgeTitle}
        icon="branch"
      >
        <p className="page-intro">{t.researchBridgeText}</p>
      </PageHead>
      <div className="action-row">
        <a
          className="button button-primary"
          href={`/${locale}/blog/?type=research-note`}
        >
          <Icon name="pen" size={18} />
          {t.researchBridgeNotes}
        </a>
        <a className="button button-quiet resource-link" href={papersUrl}>
          <Icon name="newspaper" size={18} />
          {t.researchBridgePapers}
          <Icon name="arrow-up-right" size={14} />
          <span className="sr-only">（{t.newTab}）</span>
        </a>
      </div>
    </div>
  );
}
