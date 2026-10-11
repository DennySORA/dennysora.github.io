import type { Locale } from '../i18n/index.ts';

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
    editions: ['zh-hant', 'en', 'ja'],
    tagIds: ['architecture', 'rust', 'gpu', 'system-monitoring'],
    repository: 'https://github.com/DennySORA/dgxtop',
    updatedAt: '2026-10-11',
    title: {
      'zh-hant': 'dgxtop：為 DGX Spark 打造的終端 GPU 監控工具',
      en: 'dgxtop: a terminal GPU monitor built for DGX Spark',
      ja: 'dgxtop：DGX Spark のために作ったターミナル GPU モニター',
    },
    description: {
      'zh-hant':
        '在一個終端畫面裡看每張 NVIDIA GPU、使用它的程序與整台機器，歷史紀錄重開後仍在。為 DGX Spark 打造，也能在任何裝有 NVIDIA GPU 的 Linux 主機上使用：功能、安裝與架構。',
      en: 'Every NVIDIA GPU, the processes using it and the whole machine on one terminal screen, with history that survives restarts. Built for DGX Spark, runs on any Linux machine with NVIDIA GPUs: features, install and architecture.',
      ja: 'NVIDIA GPU、それを使うプロセス、マシン全体を 1 つのターミナル画面に表示し、再起動しても履歴が残ります。DGX Spark のために作り、NVIDIA GPU を搭載したどの Linux マシンでも動きます：機能、インストール、アーキテクチャ。',
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

export function hasProjectEdition(id: ProjectPageId, locale: Locale): boolean {
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
