import { dictionaries, type Locale } from '../i18n/index.ts';
import { Icon } from './Icon.tsx';
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-header">
      <p className="eyebrow">
        <span className="small-dash" />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
export function Contact({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  return (
    <section className="contact-block">
      <h2>{t.contact}</h2>
      <p>{t.contactText}</p>
      <a className="text-link" href="mailto:dennysora.main@gmail.com">
        {t.email}
        <Icon name="arrow" size={16} />
      </a>
    </section>
  );
}
