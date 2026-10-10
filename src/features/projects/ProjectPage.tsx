import type { JSX } from 'react';
import { EndOfBuffer } from '../../components/Buffer.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { TagLinks } from '../../components/TagLink.tsx';
import { dictionaries } from '../../i18n/index.ts';
import {
  projectPages,
  type ProjectEdition,
  type ProjectPageId,
} from '../../lib/project-pages.ts';
import { dgxtopCopy } from './dgxtop/copy.tsx';
import { DgxtopPage } from './dgxtop/DgxtopPage.tsx';

export type ProjectView = {
  projectId: ProjectPageId;
  tags: { id: string; label: string; aliases: string[] }[];
};

const bodies = {
  dgxtop: { eyebrow: (locale) => dgxtopCopy[locale].eyebrow, Body: DgxtopPage },
} satisfies Record<
  ProjectPageId,
  {
    eyebrow: (locale: ProjectEdition) => string;
    Body: (props: { locale: ProjectEdition }) => JSX.Element;
  }
>;

/** A project page: title and subject tags, then the page's own body. */
export function ProjectPage({
  view,
  locale,
}: {
  view: ProjectView;
  locale: ProjectEdition;
}) {
  const { eyebrow, Body } = bodies[view.projectId];
  return (
    <div className="buffer project-page">
      <PageHead
        eyebrow={eyebrow(locale)}
        title={projectPages[view.projectId].title[locale]}
        icon="server"
      >
        <TagLinks
          tagIds={view.tags.map((tag) => tag.id)}
          labels={new Map(view.tags.map((tag) => [tag.id, tag.label]))}
          aliases={Object.fromEntries(
            view.tags.map((tag) => [tag.id, tag.aliases]),
          )}
          locale={locale}
          label={dictionaries[locale].tags}
          siteSearch
        />
      </PageHead>
      <Body locale={locale} />
      <EndOfBuffer />
    </div>
  );
}
