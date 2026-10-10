import { dictionaries, localeNames, type Locale } from '../i18n/index.ts';

// Projects are folders of project pages. A page exists only in the languages
// it was written in; folders list every page and link its nearest edition.

export const projectCategories = ['tools'] as const;
export type ProjectCategory = (typeof projectCategories)[number];
export const projectPageIds = ['dgxtop'] as const;
export type ProjectPageId = (typeof projectPageIds)[number];

/** A product screenshot shipped from assets/projects/<page>/, never filtered. */
export type ProjectShot = {
  file: string;
  width: number;
  height: number;
};

export const projectPages = {
  dgxtop: {
    category: 'tools',
    editions: ['zh-hant', 'en'],
    tagIds: ['architecture', 'rust', 'gpu', 'system-monitoring'],
    repository: 'https://github.com/DennySORA/dgxtop',
    updatedAt: '2026-10-11',
    title: {
      'zh-hant': 'dgxtop：設計一個不顯示假 0 的 GPU 終端監控工具',
      en: 'dgxtop: designing a GPU terminal monitor that never shows a fake zero',
    },
    description: {
      'zh-hant':
        '給 NVIDIA DGX Spark 與 GPU Linux 主機的 Rust 終端監控工具。六個元件、兩條路徑、單一寫入者：隔離的 adapter host、可解釋的來源仲裁、精確歷史與受保護的程序終止，以及每個取捨背後的理由。',
      en: 'A Rust terminal monitor for NVIDIA DGX Spark and GPU Linux hosts. Six components, two paths and one writer: isolated adapter hosts, explainable source arbitration, exact history and protected process termination, with the reasons behind each trade-off.',
    },
    shots: [
      { file: 'dgx-spark-overview.webp', width: 1909, height: 961 },
      { file: 'workstation-overview.webp', width: 1906, height: 966 },
      { file: 'dgx-spark-gpu.webp', width: 1922, height: 960 },
      { file: 'workstation-gpu.webp', width: 1906, height: 976 },
      { file: 'dgx-spark-history.webp', width: 1906, height: 956 },
      { file: 'workstation-history.webp', width: 1907, height: 971 },
      { file: 'dgx-spark-settings.webp', width: 1916, height: 957 },
    ],
  },
} as const satisfies Record<
  ProjectPageId,
  {
    category: ProjectCategory;
    editions: readonly Locale[];
    tagIds: readonly string[];
    repository: string;
    updatedAt: string;
    title: Partial<Record<Locale, string>>;
    description: Partial<Record<Locale, string>>;
    shots: readonly ProjectShot[];
  }
>;

export type ProjectEdition =
  (typeof projectPages)[ProjectPageId]['editions'][number];

export function hasProjectEdition(
  id: ProjectPageId,
  locale: Locale,
): locale is ProjectEdition {
  return (projectPages[id].editions as readonly Locale[]).includes(locale);
}

/** The edition a reader of `locale` is sent to: theirs, else English, else the first. */
export function projectEdition(
  id: ProjectPageId,
  locale: Locale,
): ProjectEdition {
  const { editions } = projectPages[id];
  if (hasProjectEdition(id, locale)) return locale;
  return hasProjectEdition(id, 'en') ? 'en' : editions[0];
}

export function projectPagePath(id: ProjectPageId, locale: Locale): string {
  const edition = projectEdition(id, locale);
  return `/${edition}/projects/${projectPages[id].category}/${id}/`;
}

export function projectShotUrl(id: ProjectPageId, shot: ProjectShot): string {
  return `/assets/projects/${id}/${shot.file}`;
}

export const projectsCopy: Record<
  Locale,
  {
    title: string;
    intro: string;
    count: (n: number) => string;
  }
> = {
  'zh-hant': {
    title: '專案',
    intro:
      '我開發與維護的開源專案。每個專案一頁：它解決的問題、架構與設計取捨，以及目前驗證到哪裡。',
    count: (n) => `${n} 個專案`,
  },
  en: {
    title: 'Projects',
    intro:
      'Open-source projects I build and maintain. Each has one page: the problem it solves, its architecture and design trade-offs, and how far it has been verified.',
    count: (n) => (n === 1 ? '1 project' : `${n} projects`),
  },
  ja: {
    title: 'プロジェクト',
    intro:
      '自分で開発・保守しているオープンソースのプロジェクト。それぞれ 1 ページで、解決する問題、アーキテクチャと設計上のトレードオフ、どこまで検証できているかをまとめています。',
    count: (n) => `${n} 件のプロジェクト`,
  },
};

/** The editions a page has, and, when the reader's language is not one, that it is missing. */
export function projectEditionsLabel(
  id: ProjectPageId,
  locale: Locale,
): string {
  const names = projectPages[id].editions.map(
    (edition) => localeNames[edition],
  );
  return hasProjectEdition(id, locale)
    ? names.join(' · ')
    : `${names.join(' · ')} · ${dictionaries[locale].unavailableTranslation}`;
}

export const projectCategoryCopy: Record<
  Locale,
  Record<ProjectCategory, { title: string; intro: string }>
> = {
  'zh-hant': {
    tools: {
      title: '工具',
      intro: '開發與維運用的工具。每個工具附上架構、設計取捨與驗證狀態。',
    },
  },
  en: {
    tools: {
      title: 'Tools',
      intro:
        'Tools for development and operations, each with its architecture, design trade-offs and verification status.',
    },
  },
  ja: {
    tools: {
      title: 'ツール',
      intro:
        '開発と運用のためのツール。それぞれのアーキテクチャ、設計上のトレードオフ、検証の状況をまとめています。',
    },
  },
};
