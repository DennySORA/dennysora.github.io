import { useId, useState, type ReactNode } from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import type { RouteDescriptor } from '../lib/route-manifest.ts';
import {
  networkCopy,
  networkNoteIds,
  networkNotes,
} from '../lib/network-notes.ts';
import {
  medicalCategories,
  medicalCategoryCopy,
  medicalNoteIds,
  medicalNotes,
  medicalNotePath,
} from '../lib/medical-notes.ts';
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

type TreeLinkProps = {
  href: string;
  kind: Kind;
  name: string;
  /** Plain-language meaning of the file name, shown or announced beside it. */
  note: { text: string; visible: boolean };
  current?: 'page' | 'true' | undefined;
  onNavigate?: (() => void) | undefined;
  expanded?: boolean;
};

function TreeLink({
  href,
  kind,
  name,
  note,
  current,
  onNavigate,
  expanded = true,
}: TreeLinkProps) {
  return (
    <a
      className="tree-link"
      href={href}
      aria-current={current}
      onClick={onNavigate}
      title={note.visible ? undefined : note.text}
      data-kind={kind}
    >
      <span className="tree-expander" aria-hidden="true" />
      <Icon
        name={kind === 'folder' && !expanded ? 'folder' : kindIcons[kind]}
        size={16}
        className="tree-icon"
      />
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

/** Disclosure and navigation are separate controls; hiding keeps child state. */
function TreeFolder({
  locale,
  children,
  ...link
}: Omit<TreeLinkProps, 'kind' | 'expanded'> & {
  locale: Locale;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const childrenId = useId();
  const t = dictionaries[locale];
  const label = `${expanded ? t.folderCollapse : t.folderExpand}: ${link.name}`;
  return (
    <>
      <div className="tree-folder-row">
        <button
          className="tree-folder-toggle requires-js"
          type="button"
          aria-expanded={expanded}
          aria-controls={childrenId}
          aria-label={label}
          title={label}
          onClick={() => setExpanded((open) => !open)}
        >
          <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={12} />
        </button>
        <TreeLink {...link} kind="folder" expanded={expanded} />
      </div>
      <ul id={childrenId} className="tree-children" hidden={!expanded}>
        {children}
      </ul>
    </>
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
          <TreeFolder
            locale={locale}
            href={`/${locale}/blog/`}
            name="blog"
            note={{ text: t.navLibrary, visible: true }}
            current={areaState(route, 'library')}
            onNavigate={onNavigate}
          >
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
          </TreeFolder>
        </li>
        <li>
          <TreeFolder
            locale={locale}
            href={`/${locale}/note/`}
            name="note"
            note={{ text: noteCopy[locale].notes, visible: true }}
            current={areaState(route, 'notes')}
            onNavigate={onNavigate}
          >
            <li>
              <TreeFolder
                locale={locale}
                href={`/${locale}/note/network/`}
                name={networkCopy[locale].title}
                note={{ text: networkCopy[locale].title, visible: false }}
                current={page(route.kind === 'network')}
                onNavigate={onNavigate}
              >
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
              </TreeFolder>
            </li>
            <li>
              <TreeFolder
                locale={locale}
                href={`/${locale}/note/medical/`}
                name={noteCopy[locale].medical}
                note={{ text: noteCopy[locale].medical, visible: false }}
                current={page(route.kind === 'medical')}
                onNavigate={onNavigate}
              >
                {medicalCategories.map((category) => (
                  <li key={category}>
                    <TreeFolder
                      locale={locale}
                      href={`/${locale}/note/medical/${category}/`}
                      name={medicalCategoryCopy[locale][category].title}
                      note={{
                        text: medicalCategoryCopy[locale][category].intro,
                        visible: false,
                      }}
                      current={page(
                        route.kind === 'medical-category' &&
                          route.category === category,
                      )}
                      onNavigate={onNavigate}
                    >
                      {medicalNoteIds
                        .filter((id) => medicalNotes[id].category === category)
                        .map((id) => (
                          <li key={id}>
                            <TreeLink
                              href={medicalNotePath(id)}
                              kind="markdown"
                              name={`${id}.md`}
                              note={{
                                text: medicalNotes[id].title[locale],
                                visible: false,
                              }}
                              current={page(
                                route.kind === 'medical-note' &&
                                  route.noteId === id,
                              )}
                              onNavigate={onNavigate}
                            />
                          </li>
                        ))}
                    </TreeFolder>
                  </li>
                ))}
              </TreeFolder>
            </li>
          </TreeFolder>
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
