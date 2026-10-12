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

/**
 * A GPT-generated technical diagram with its text drawn in, one image per
 * edition at assets/projects/<page>/diagrams/<name>-<edition>.webp.
 */
export type ProjectDiagram = {
  name: string;
  width: number;
  height: number;
};

export const projectPages = {
  dgxtop: {
    category: 'tools',
    editions: ['zh-hant', 'en', 'ja'],
    tagIds: ['architecture', 'rust', 'gpu', 'system-monitoring'],
    repository: 'https://github.com/DennySORA/dgxtop',
    updatedAt: '2026-10-12',
    title: {
      'zh-hant': 'dgxtop：Linux 與 DGX Spark 上的 NVIDIA GPU 終端監控工具',
      en: 'dgxtop: a terminal monitor for NVIDIA GPUs on Linux and DGX Spark',
      ja: 'dgxtop：Linux と DGX Spark の NVIDIA GPU 向けターミナルモニター',
    },
    description: {
      'zh-hant':
        '在一個終端畫面裡看每張 NVIDIA GPU、每個工作佔用多少記憶體與整台機器，並記錄每個 GPU 工作從開始到結束，包括它怎麼結束。功能、安裝，以及運作原理的技術深入解析。',
      en: 'Every NVIDIA GPU, each job’s share of its memory and the whole machine on one terminal screen, plus a record of every GPU job from start to end, including how it ended. Features, install and a technical deep dive into how it works.',
      ja: 'NVIDIA GPU、ジョブごとのメモリ使用量、マシン全体を 1 つのターミナル画面に表示し、すべての GPU ジョブを開始から終了まで、終わり方とともに記録します。機能、インストール、仕組みの技術解説。',
    },
    shots: [
      { file: 'dgx-spark-overview.webp', width: 1909, height: 969 },
      { file: 'workstation-overview.webp', width: 1918, height: 967 },
      { file: 'dgx-spark-gpu.webp', width: 1913, height: 962 },
      { file: 'workstation-gpu.webp', width: 1914, height: 963 },
      { file: 'workstation-overview-history.webp', width: 1913, height: 957 },
      { file: 'workstation-process-history.webp', width: 1910, height: 952 },
      { file: 'workstation-process-run.webp', width: 1919, height: 959 },
    ],
    diagrams: [
      { name: 'architecture', width: 1536, height: 1024 },
      { name: 'one-sample', width: 1536, height: 1024 },
      { name: 'isolation', width: 1536, height: 1024 },
      { name: 'source-arbitration', width: 1536, height: 1024 },
      { name: 'history-tiers', width: 1536, height: 1024 },
      { name: 'process-history', width: 1536, height: 1024 },
      { name: 'gpu-memory', width: 1536, height: 1024 },
      { name: 'safe-actions', width: 1536, height: 1024 },
      { name: 'budgets', width: 1536, height: 1024 },
      { name: 'storage', width: 1536, height: 1024 },
      { name: 'crates', width: 1536, height: 1024 },
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
    diagrams: readonly ProjectDiagram[];
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

/** The file of a diagram in one edition: its text is in that language. */
export function projectDiagramFile(
  diagram: ProjectDiagram,
  edition: Locale,
): string {
  return `${diagram.name}-${edition}.webp`;
}

export function projectDiagramUrl(
  id: ProjectPageId,
  diagram: ProjectDiagram,
  edition: Locale,
): string {
  return `/assets/projects/${id}/diagrams/${projectDiagramFile(diagram, edition)}`;
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
