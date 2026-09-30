import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { papersUrl } from '../lib/site.ts';
import { areaState, type WorkspaceFiles } from '../lib/workspace.ts';
import { Icon, type IconName } from './Icon.tsx';

function TreeLink({
  href,
  icon,
  name,
  note,
  current,
  external = false,
  onNavigate,
}: {
  href: string;
  icon: IconName;
  name: string;
  /** Plain-language meaning of the file name, shown or announced beside it. */
  note: { text: string; visible: boolean };
  current?: 'page' | 'true' | undefined;
  external?: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <a
      className="tree-link"
      href={href}
      aria-current={current}
      onClick={onNavigate}
      title={note.visible ? undefined : note.text}
      data-icon={icon}
    >
      <Icon name={icon} size={16} />
      <span className="tree-name">{name}</span>{' '}
      {note.visible ? (
        <span className="tree-note">{note.text}</span>
      ) : (
        <span className="sr-only"> — {note.text}</span>
      )}
      {external ? <Icon name="external" size={13} /> : null}
    </a>
  );
}

/** The site as a file tree: every entry is a real page or an outside link. */
export function Explorer({
  locale,
  route,
  files,
  onNavigate,
}: {
  locale: Locale;
  route: RouteDescriptor;
  files: WorkspaceFiles;
  onNavigate?: () => void;
}) {
  const t = dictionaries[locale];
  const page = (match: boolean) => (match ? ('page' as const) : undefined);
  return (
    <div className="explorer">
      <p className="explorer-root" aria-hidden="true">
        <Icon name="chevron-down" size={14} />
        DENNYSORA
      </p>
      <ul className="tree">
        <li>
          <TreeLink
            href={`/${locale}/`}
            icon="markdown"
            name="README.md"
            note={{ text: t.navAbout, visible: true }}
            current={areaState(route, 'home')}
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <TreeLink
            href={`/${locale}/blog/`}
            icon="chevron-down"
            name="blog"
            note={{ text: t.navLibrary, visible: true }}
            current={areaState(route, 'library')}
            onNavigate={onNavigate}
          />
          <ul className="tree-children">
            {files.posts.map((post) => (
              <li key={post.slug}>
                <TreeLink
                  href={`/${locale}/blog/${post.slug}/`}
                  icon="markdown"
                  name={`${post.slug}.md`}
                  note={{ text: post.title, visible: false }}
                  current={page(
                    route.kind === 'article' && route.slug === post.slug,
                  )}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </li>
        <li>
          <TreeLink
            href={`/${locale}/note/`}
            icon="chevron-down"
            name="note"
            note={{ text: noteCopy[locale].notes, visible: true }}
            current={areaState(route, 'notes')}
            onNavigate={onNavigate}
          />
          <ul className="tree-children">
            <li>
              <TreeLink
                href={`/${locale}/note/medical/`}
                icon="folder"
                name={noteCopy[locale].medical}
                note={{ text: noteCopy[locale].medical, visible: false }}
                current={page(route.kind === 'medical')}
                onNavigate={onNavigate}
              />
              <ul className="tree-children">
                <li>
                  <TreeLink
                    href="/zh-hant/note/medical/analgesics/"
                    icon="markdown"
                    name="analgesics.md"
                    note={{ text: noteCopy[locale].article, visible: false }}
                    current={page(route.kind === 'medical-note')}
                    onNavigate={onNavigate}
                  />
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <TreeLink
            href={`/${locale}/projects/`}
            icon="chevron-down"
            name="projects"
            note={{ text: t.navProjects, visible: true }}
            current={areaState(route, 'projects')}
            onNavigate={onNavigate}
          />
          <ul className="tree-children">
            {files.projects.map((project) => (
              <li key={project.id}>
                <TreeLink
                  href={`/${locale}/projects/#project-${project.id}`}
                  icon="package"
                  name={project.id}
                  note={{ text: project.title, visible: false }}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </li>
        <li>
          <TreeLink
            href={papersUrl}
            icon="newspaper"
            name="paper-daily"
            note={{ text: `${t.navPapers}（${t.newTab}）`, visible: false }}
            external
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <TreeLink
            href={`/${locale}/privacy/`}
            icon="shield"
            name="privacy.md"
            note={{ text: t.privacy, visible: true }}
            current={page(route.kind === 'privacy')}
            onNavigate={onNavigate}
          />
        </li>
      </ul>
    </div>
  );
}
