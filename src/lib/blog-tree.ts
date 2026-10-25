import type { Locale } from '../i18n/index.ts';

/** Published article folders, independent of the topic/tag taxonomy. */
export const blogFolders = {
  network: {
    title: { 'zh-hant': '網路', en: 'Networking', ja: 'ネットワーク' },
    description: {
      'zh-hant': '理解網路協定、來源探索與資料傳輸的設計取捨。',
      en: 'Explore design trade-offs in network protocols, source discovery and data transfer.',
      ja: 'ネットワークプロトコル、ソース探索、データ転送の設計上の選択を理解する。',
    },
    slugs: ['p2p-downloader-architecture', 'p2p-privacy-boundaries'],
  },
  tools: {
    title: { 'zh-hant': '工具', en: 'Tools', ja: 'ツール' },
    description: {
      'zh-hant': '拆解日常工具的架構、資料流與設計取捨。',
      en: 'Explore the architecture, data flows and design trade-offs behind everyday tools.',
      ja: '日常的なツールのアーキテクチャ、データフロー、設計上の選択を読み解く。',
    },
    slugs: ['browser-translation-architecture'],
  },
  security: {
    title: { 'zh-hant': '資安', en: 'Security', ja: 'セキュリティ' },
    description: {
      'zh-hant': '從密碼、身分驗證與復原，理解日常數位安全的邊界。',
      en: 'Understand everyday digital security through passwords, authentication and recovery.',
      ja: 'パスワード・認証・復旧から、日常のデジタルセキュリティの境界を考える。',
    },
    slugs: ['password-manager-recommendations'],
  },
} as const;
export type BlogFolderId = keyof typeof blogFolders;
export const blogFolderIds = Object.keys(blogFolders) as BlogFolderId[];

export function articleFolder(slug: string): BlogFolderId | null {
  return (
    blogFolderIds.find((id) =>
      (blogFolders[id].slugs as readonly string[]).includes(slug),
    ) ?? null
  );
}

export function articlePath(slug: string, locale: Locale): string {
  const folder = articleFolder(slug);
  return `/${locale}/blog/${folder ? `${folder}/` : ''}${slug}/`;
}

export function populatedBlogFolders(posts: readonly { slug: string }[]) {
  return blogFolderIds.filter((id) =>
    posts.some((post) => articleFolder(post.slug) === id),
  );
}
