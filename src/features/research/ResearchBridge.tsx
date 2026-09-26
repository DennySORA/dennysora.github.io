import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';

/** The former Research page served two intents, so it offers both destinations. */
export function ResearchBridge({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  return (
    <div className="container profile-layout bridge">
      <PageHead eyebrow={t.researchBridgeEyebrow} title={t.researchBridgeTitle}>
        <p className="page-intro">{t.researchBridgeText}</p>
      </PageHead>
      <div className="action-row">
        <a
          className="button button-primary"
          href={`/${locale}/blog/?type=research-note`}
        >
          {t.researchBridgeNotes}
          <Icon name="arrow" size={18} />
        </a>
        <a className="button button-quiet" href={`/${locale}/papers/`}>
          {t.researchBridgePapers}
          <Icon name="arrow" size={18} />
        </a>
      </div>
    </div>
  );
}
