import type { ViewData } from '../../app/page.tsx';
import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
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
        <p className="ln page-intro">{t.privacyIntro}</p>
      </PageHead>
      <div className="plain-text">
        <p className="ln">{t.privacyStatic}</p>
        <p className="ln">{t.privacySearch}</p>
        <p className="ln">{t.privacyLinks}</p>
        <MdHeading level={2}>{t.commentsTitle}</MdHeading>
        <p className="ln">{comments}</p>
        <p className="ln">{t.privacyPublic}</p>
        <p className="ln">
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            {t.githubPrivacy}
            <Icon name="external" size={15} />
            <span className="sr-only">（{t.newTab}）</span>
          </a>
        </p>
      </div>
      <EndOfBuffer />
    </div>
  );
}
