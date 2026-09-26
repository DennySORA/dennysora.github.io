import type { ViewData } from '../../app/page.tsx';
import { Icon } from '../../components/Icon.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { dictionaries, type Locale } from '../../i18n/index.ts';

type PrivacyView = Extract<ViewData, { kind: 'privacy' }>;

export function Privacy({
  view,
  locale,
}: {
  view: PrivacyView;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  const comments = {
    unconfigured: t.privacyCommentsUnconfigured,
    'github-native': t.privacyCommentsNative,
    giscus: t.privacyCommentsGiscus,
  }[view.commentsMode];
  return (
    <div className="container profile-layout privacy">
      <PageHead eyebrow={t.privacy} title={t.privacyTitle}>
        <p className="page-intro">{t.privacyIntro}</p>
      </PageHead>
      <div className="plain-text">
        <p>{t.privacyStatic}</p>
        <p>{t.privacySearch}</p>
        <p>{t.privacyLinks}</p>
        <h2>{t.commentsTitle}</h2>
        <p>{comments}</p>
        <p>{t.privacyPublic}</p>
        <p>
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            {t.githubPrivacy}
            <Icon name="external" size={15} />
            <span className="sr-only">（{t.newTab}）</span>
          </a>
        </p>
      </div>
    </div>
  );
}
