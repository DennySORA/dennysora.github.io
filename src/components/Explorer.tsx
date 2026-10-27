import {
  articleFolder,
  articlePath,
  blogFolders,
  populatedBlogFolders,
} from '../lib/blog-tree.ts';
import {
  createContext,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { dictionaries, type Locale } from '../i18n/index.ts';
import { routePath, type RouteDescriptor } from '../lib/route-manifest.ts';
import { noteCopy } from '../lib/notes-copy.ts';
import { type NoteTreeFolder } from '../lib/note-tree.ts';
import {
  projectCategories,
  projectCategoryCopy,
  projectEdition,
  projectPageIds,
  projectPagePath,
  projectPages,
  projectsCopy,
} from '../lib/project-pages.ts';
import { areaState, type WorkspaceFiles } from '../lib/workspace.ts';
import { papersUrl } from '../lib/site.ts';
import { Icon, type IconName } from './Icon.tsx';

type Kind = 'markdown' | 'folder' | 'external';
const kindIcons: Record<Kind, IconName> = {
  markdown: 'markdown',
  folder: 'folder-open',
  external: 'newspaper',
};

/**
 * How deep a row sits: 1 for the entries under ~/dennysora. Each folder gives
 * its children the next level, which the stylesheet turns into neo-tree's
 * indent of two cells per level, however deep the tree goes.
 */
const TreeLevel = createContext(1);

type TreeLinkProps = {
  href: string;
  kind: Kind;
  /** Short name in the page's language, short enough to show in full. */
  name: string;
  /** Full title or description, offered as a tooltip and read after the name. */
  note?: string | undefined;
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
      title={note}
      data-kind={kind}
      data-expanded={kind === 'folder' ? String(expanded) : undefined}
    >
      <span className="tree-expander" aria-hidden="true" />
      {kind === 'folder' ? (
        // Both icons ship; CSS shows the one matching the folder's state.
        <>
          <Icon
            name="folder-open"
            size={16}
            className="tree-icon tree-icon-open"
          />
          <Icon
            name="folder"
            size={16}
            className="tree-icon tree-icon-closed"
          />
        </>
      ) : (
        <Icon name={kindIcons[kind]} size={16} className="tree-icon" />
      )}
      <span className="tree-name">{name}</span>
      {note ? <span className="sr-only"> — {note}</span> : null}
      {kind === 'external' ? <Icon name="arrow-up-right" size={12} /> : null}
    </a>
  );
}

/**
 * Disclosure and navigation are separate controls; hiding keeps child state.
 * Folders start closed except those on the path to the current page, and each
 * navigation applies that default again.
 */
function TreeFolder({
  locale,
  currentPath,
  children,
  ...link
}: Omit<TreeLinkProps, 'kind' | 'expanded'> & {
  locale: Locale;
  /** The current page's path; a folder whose link starts it is open. */
  currentPath: string;
  children: ReactNode;
}) {
  const onPath = currentPath.startsWith(link.href);
  const [state, setState] = useState({ path: currentPath, expanded: onPath });
  if (state.path !== currentPath)
    setState({ path: currentPath, expanded: onPath });
  const expanded = state.path === currentPath ? state.expanded : onPath;
  const childrenId = useId();
  const childLevel = useContext(TreeLevel) + 1;
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
          onClick={() =>
            setState((folder) => ({ ...folder, expanded: !folder.expanded }))
          }
        >
          <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={12} />
        </button>
        <TreeLink {...link} kind="folder" expanded={expanded} />
      </div>
      <ul
        id={childrenId}
        className="tree-children"
        style={{ '--tree-level': childLevel } as CSSProperties}
        data-collapsed={expanded ? undefined : ''}
      >
        <TreeLevel value={childLevel}>{children}</TreeLevel>
      </ul>
    </>
  );
}

/** One folder of the note tree with its subfolders and notes. */
function NoteFolderNode({
  folder,
  locale,
  route,
  currentPath,
  onNavigate,
  current = route.kind === 'note-folder' && route.folder === folder.id
    ? 'page'
    : undefined,
}: {
  folder: NoteTreeFolder;
  locale: Locale;
  route: RouteDescriptor;
  currentPath: string;
  onNavigate?: (() => void) | undefined;
  /** An area's top folder marks the whole area, as the other areas do. */
  current?: 'page' | 'true' | undefined;
}) {
  return (
    <li>
      <TreeFolder
        currentPath={currentPath}
        locale={locale}
        href={folder.href}
        name={folder.title}
        note={folder.intro}
        current={current}
        onNavigate={onNavigate}
      >
        {folder.folders.map((inner) => (
          <NoteFolderNode
            key={inner.id}
            folder={inner}
            locale={locale}
            route={route}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
        {folder.notes.map((note) => (
          <li key={note.id}>
            <TreeLink
              href={note.href}
              kind="markdown"
              name={note.name}
              note={note.title}
              current={
                'noteId' in route && route.noteId === note.id
                  ? 'page'
                  : undefined
              }
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </TreeFolder>
    </li>
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
  const currentPath = routePath(route);
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
            name={t.navAbout}
            current={areaState(route, 'home')}
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <TreeFolder
            currentPath={currentPath}
            locale={locale}
            href={`/${locale}/projects/`}
            name={projectsCopy[locale].title}
            current={areaState(route, 'projects')}
            onNavigate={onNavigate}
          >
            {projectCategories.map((category) => (
              <li key={category}>
                <TreeFolder
                  currentPath={currentPath}
                  locale={locale}
                  href={`/${locale}/projects/${category}/`}
                  name={projectCategoryCopy[locale][category].title}
                  note={projectCategoryCopy[locale][category].intro}
                  current={page(
                    route.kind === 'project-category' &&
                      route.category === category,
                  )}
                  onNavigate={onNavigate}
                >
                  {projectPageIds
                    .filter((id) => projectPages[id].category === category)
                    .map((id) => (
                      <li key={id}>
                        <TreeLink
                          href={projectPagePath(id, locale)}
                          kind="markdown"
                          name={id}
                          note={
                            projectPages[id].title[projectEdition(id, locale)]
                          }
                          current={page(
                            route.kind === 'project' && route.projectId === id,
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
        <li>
          <TreeFolder
            currentPath={currentPath}
            locale={locale}
            href={`/${locale}/thoughts/`}
            name={t.navThoughts}
            current={areaState(route, 'thoughts')}
            onNavigate={onNavigate}
          >
            {files.thoughts.map((thought) => (
              <li key={thought.slug}>
                <TreeLink
                  href={routePath({
                    kind: 'thought',
                    locale,
                    slug: thought.slug,
                  })}
                  kind="markdown"
                  name={thought.title}
                  current={page(
                    route.kind === 'thought' && route.slug === thought.slug,
                  )}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </TreeFolder>
        </li>
        {files.posts.length > 0 ? (
          <li>
            <TreeFolder
              currentPath={currentPath}
              locale={locale}
              href={`/${locale}/blog/`}
              name={t.navLibrary}
              current={areaState(route, 'library')}
              onNavigate={onNavigate}
            >
              {populatedBlogFolders(files.posts).map((folder) => (
                <li key={folder}>
                  <TreeFolder
                    currentPath={currentPath}
                    locale={locale}
                    href={`/${locale}/blog/${folder}/`}
                    name={blogFolders[folder].title[locale]}
                    current={page(
                      route.kind === 'blog-folder' && route.folder === folder,
                    )}
                    onNavigate={onNavigate}
                  >
                    {files.posts
                      .filter((post) => articleFolder(post.slug) === folder)
                      .map((post) => (
                        <li key={post.slug}>
                          <TreeLink
                            href={articlePath(post.slug, locale)}
                            kind="markdown"
                            name={post.title}
                            current={page(
                              route.kind === 'article' &&
                                route.slug === post.slug,
                            )}
                            onNavigate={onNavigate}
                          />
                        </li>
                      ))}
                  </TreeFolder>
                </li>
              ))}
              {files.posts
                .filter((post) => !articleFolder(post.slug))
                .map((post) => (
                  <li key={post.slug}>
                    <TreeLink
                      href={articlePath(post.slug, locale)}
                      kind="markdown"
                      name={post.title}
                      current={page(
                        route.kind === 'article' && route.slug === post.slug,
                      )}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
            </TreeFolder>
          </li>
        ) : null}
        <li>
          <TreeFolder
            currentPath={currentPath}
            locale={locale}
            href={`/${locale}/note/`}
            name={noteCopy[locale].notes}
            current={areaState(route, 'notes')}
            onNavigate={onNavigate}
          >
            {files.notes.map((folder) => (
              <NoteFolderNode
                key={folder.id}
                folder={folder}
                locale={locale}
                route={route}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))}
          </TreeFolder>
        </li>
        <li>
          <TreeLink
            href={papersUrl}
            kind="external"
            name={t.navPapers}
            note={t.newTab}
            onNavigate={onNavigate}
          />
        </li>
      </ul>
    </div>
  );
}
