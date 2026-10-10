import { EndOfBuffer, MdHeading } from '../../components/Buffer.tsx';
import { Collection } from '../../components/Collection.tsx';
import { htmlLang, type Locale } from '../../i18n/index.ts';
import {
  projectCategories,
  projectCategoryCopy,
  projectEdition,
  projectEditionsLabel,
  projectPageIds,
  projectPagePath,
  projectPages,
  projectsCopy,
  type ProjectCategory,
} from '../../lib/project-pages.ts';

const art = '/assets/illustrations/collection-tools-v1.webp';

function pagesIn(category: ProjectCategory) {
  return projectPageIds.filter((id) => projectPages[id].category === category);
}

/** The projects directory, or one of its category folders, as folder previews. */
export function Projects({
  locale,
  category,
}: {
  locale: Locale;
  category?: ProjectCategory;
}) {
  const t = projectsCopy[locale];
  const folders = category ? [category] : projectCategories;
  const heading = category ? projectCategoryCopy[locale][category] : t;
  return (
    <div className="container profile-layout notes-directory">
      <MdHeading level={1} icon={category ? 'package' : 'folder-open'}>
        {heading.title}
      </MdHeading>
      <p className="ln page-intro">{heading.intro}</p>
      <ul className="ln collections">
        {folders.map((folder) => {
          const ids = pagesIn(folder);
          return (
            <Collection
              key={folder}
              art={art}
              href={`/${locale}/projects/${folder}/`}
              title={projectCategoryCopy[locale][folder].title}
              count={t.count(ids.length)}
              intro={projectCategoryCopy[locale][folder].intro}
              files={ids.map((id) => {
                const edition = projectEdition(id, locale);
                return {
                  href: projectPagePath(id, locale),
                  name: `${id}.md`,
                  title: projectPages[id].title[edition],
                  lang: htmlLang[edition],
                };
              })}
              available={ids
                .map((id) => projectEditionsLabel(id, locale))
                .join(' / ')}
            />
          );
        })}
      </ul>
      <EndOfBuffer />
    </div>
  );
}
