import { Icon } from './Icon.tsx';

/** A file inside a collection, titled in the language its page is written in. */
export type CollectionFile = {
  href: string;
  name: string;
  title: string;
  lang: string;
};

/** One collection as a folder preview: what it holds, and its files. */
export function Collection({
  art,
  href,
  title,
  count,
  intro,
  files,
  available,
}: {
  art: string;
  href: string;
  title: string;
  count: string;
  intro: string;
  files: CollectionFile[];
  available: string;
}) {
  return (
    <li className="collection">
      <img
        className="collection-art"
        src={art}
        width={88}
        height={88}
        alt=""
        decoding="async"
      />
      <div className="collection-body">
        <h2 className="collection-title">
          <a href={href}>
            <Icon name="folder-open" size={18} />
            <span>{title}</span>
          </a>
          <span className="collection-count">{count}</span>
        </h2>
        <p className="collection-intro">{intro}</p>
        <ul className="collection-files">
          {files.map((file) => (
            <li key={file.href}>
              <a href={file.href} hrefLang={file.lang}>
                <Icon name="markdown" size={16} />
                <span className="collection-file">{file.name}</span>
                <span className="collection-file-title" lang={file.lang}>
                  {file.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="collection-meta">
          <Icon name="globe" size={14} />
          {available}
        </p>
      </div>
    </li>
  );
}
