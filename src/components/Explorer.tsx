import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import {
  networkCopy,
  networkNoteIds,
  networkNotes,
} from '../lib/network-notes.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { papersUrl } from '../lib/site.ts';
import { areaState, type WorkspaceFiles } from '../lib/workspace.ts';
import { Icon, type IconName } from './Icon.tsx';

type Kind = 'markdown' | 'folder' | 'external';
const kindIcons: Record<Kind, IconName> = {
  markdown: 'markdown',
  folder: 'folder-open',
  external: 'newspaper',
};

function TreeLink({
  href,
  kind,
  name,
  note,
  current,
  onNavigate,
}: {
  href: string;
  kind: Kind;
  name: string;
  /** Plain-language meaning of the file name, shown or announced beside it. */
  note: { text: string; visible: boolean };
  current?: 'page' | 'true' | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <a
      className="tree-link"
      href={href}
      aria-current={current}
      onClick={onNavigate}
      title={note.visible ? undefined : note.text}
      data-kind={kind}
    >
      {kind === 'folder' ? (
        <Icon name="chevron-down" size={12} className="tree-expander" />
      ) : (
        <span className="tree-expander" aria-hidden="true" />
      )}
      <Icon name={kindIcons[kind]} size={16} className="tree-icon" />
      <span className="tree-name">{name}</span>{' '}
      {note.visible ? (
        <span className="tree-note">{note.text}</span>
      ) : (
        <span className="sr-only"> — {note.text}</span>
      )}
      {kind === 'external' ? <Icon name="arrow-up-right" size={12} /> : null}
    </a>
  );
}

/** The site as a neo-tree: every entry is a real page or an outside link. */
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
        <Icon name="folder-open" size={14} />
        ~/dennysora
      </p>
      <ul className="tree">
        <li>
          <TreeLink
            href={`/${locale}/`}
            kind="markdown"
            name="README.md"
            note={{ text: t.navAbout, visible: true }}
            current={areaState(route, 'home')}
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <TreeLink
            href={`/${locale}/blog/`}
            kind="folder"
            name="blog"
            note={{ text: t.navLibrary, visible: true }}
            current={areaState(route, 'library')}
            onNavigate={onNavigate}
          />
          <ul className="tree-children">
            {files.posts.length === 0 ? (
              <li className="tree-empty">{t.emptyFolder}</li>
            ) : null}
            {files.posts.map((post) => (
              <li key={post.slug}>
                <TreeLink
                  href={`/${locale}/blog/${post.slug}/`}
                  kind="markdown"
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
            kind="folder"
            name="note"
            note={{ text: noteCopy[locale].notes, visible: true }}
            current={areaState(route, 'notes')}
            onNavigate={onNavigate}
          />
          <ul className="tree-children">
            <li>
              <TreeLink
                href={`/${locale}/note/network/`}
                kind="folder"
                name={networkCopy[locale].title}
                note={{ text: networkCopy[locale].title, visible: false }}
                current={page(route.kind === 'network')}
                onNavigate={onNavigate}
              />
              <ul className="tree-children">
                {networkNoteIds.map((id) => (
                  <li key={id}>
                    <TreeLink
                      href={`/zh-hant/note/network/${id}/`}
                      kind="markdown"
                      name={`${id}.md`}
                      note={{ text: networkNotes[id].title, visible: false }}
                      current={page(
                        route.kind === 'network-note' && route.noteId === id,
                      )}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <TreeLink
                href={`/${locale}/note/medical/`}
                kind="folder"
                name={noteCopy[locale].medical}
                note={{ text: noteCopy[locale].medical, visible: false }}
                current={page(route.kind === 'medical')}
                onNavigate={onNavigate}
              />
              <ul className="tree-children">
                <li>
                  <TreeLink
                    href="/zh-hant/note/medical/analgesics/"
                    kind="markdown"
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
            href={papersUrl}
            kind="external"
            name="paper-daily"
            note={{ text: `${t.navPapers}（${t.newTab}）`, visible: false }}
            onNavigate={onNavigate}
          />
        </li>
      </ul>
    </div>
  );
}
