import { useEffect, useRef } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { topicNames } from '../lib/publication.ts';
import type { PostSummary } from '../lib/content.server.ts';
import type { Project } from '../lib/schema.ts';
import type { Heading } from '../lib/markdown.server.ts';
import { Icon } from './Icon.tsx';

export function SectionHeading({
  number,
  title,
  href,
  label,
}: {
  number: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <h2>
        <span className="section-number">{number}</span>
        {title}
      </h2>
      {href && (
        <a className="text-link" href={href}>
          {label}
          <Icon name="arrow" size={16} />
        </a>
      )}
    </div>
  );
}
export function PostCard({
  post,
  locale,
  featured = false,
}: {
  post: PostSummary;
  locale: Locale;
  featured?: boolean;
}) {
  const t = dictionaries[locale];
  const topic = post.topics[0] ?? 'engineering';
  return (
    <article className={`post-card ${featured ? 'featured-post' : ''}`}>
      {featured && (
        <div className="feature-diagram" aria-hidden="true">
          <div className="diagram-grid" />
          <span className="diagram-label">notes / engineering</span>
          <div className="diagram-node node-one">
            understand<span>01</span>
          </div>
          <div className="diagram-node node-two">
            build<span>02</span>
          </div>
          <div className="diagram-node node-three">
            measure<span>03</span>
          </div>
          <svg viewBox="0 0 420 180">
            <path d="M80 120H160V65H240V120H335" />
            <circle cx="80" cy="120" r="4" />
            <circle cx="335" cy="120" r="4" />
          </svg>
          <span className="diagram-footer">question → implement → refine</span>
        </div>
      )}
      <div className="post-card-content">
        <div className="article-meta">
          <span className={`topic topic-${topic}`}>
            {topicNames[topic][locale]}
          </span>
          <time dateTime={post.publishedAt}>
            {post.publishedAt.replaceAll('-', '.')}
          </time>
        </div>
        <h3>
          <a href={`/${locale}/blog/${post.slug}/`}>{post.title}</a>
        </h3>
        <p>{post.summary}</p>
        <div className="card-bottom">
          <span>
            {post.minutes} {t.minutes}
          </span>
          <a
            href={`/${locale}/blog/${post.slug}/`}
            className="article-arrow"
            aria-label={`${t.readArticle}：${post.title}`}
          >
            <Icon name="arrow" />
          </a>
        </div>
      </div>
    </article>
  );
}
export function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const t = dictionaries[locale];
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`project-icon project-${project.id}`}>
          <Icon
            name={
              project.id === 'dgxtop'
                ? 'code'
                : project.id === 'httpulse'
                  ? 'globe'
                  : 'folder'
            }
            size={22}
          />
        </span>
        <span className="project-kind">
          {project.kind === 'production' ? t.production : t.openSource}
        </span>
        <Icon name="external" size={14} />
      </div>
      <h3>
        <a href={`/${locale}/projects/${project.id}/`}>{project.title}</a>
      </h3>
      <p>{project.summary[locale]}</p>
      <div className="project-tags">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
export function Prose({ html, locale }: { html: string; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = dictionaries[locale];
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    for (const pre of ref.current?.querySelectorAll('pre') ?? []) {
      pre.tabIndex = 0;
      pre.setAttribute('role', 'region');
      pre.setAttribute('aria-label', t.copy);
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.type = 'button';
      button.textContent = t.copy;
      const code =
        pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
      let timer: ReturnType<typeof setTimeout> | undefined;
      const copy = () => {
        void navigator.clipboard?.writeText(code).then(
          () => {
            button.textContent = t.copied;
            timer = setTimeout(() => {
              button.textContent = t.copy;
            }, 1800);
          },
          () => {
            button.textContent = t.copyError;
          },
        );
        if (!navigator.clipboard) button.textContent = t.copyError;
      };
      button.addEventListener('click', copy);
      pre.prepend(button);
      cleanups.push(() => {
        clearTimeout(timer);
        button.removeEventListener('click', copy);
        button.remove();
      });
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [html, t]);
  return (
    <div
      ref={ref}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
export function Toc({
  headings,
  locale,
}: {
  headings: Heading[];
  locale: Locale;
}) {
  return (
    <aside className="toc">
      <details open>
        <summary>{dictionaries[locale].toc}</summary>
        <nav aria-label={dictionaries[locale].toc}>
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={h.level > 2 ? 'toc-child' : ''}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </details>
    </aside>
  );
}
