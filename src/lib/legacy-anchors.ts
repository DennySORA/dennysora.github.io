// Published profile anchors are stable across translation and content edits.
export const headingAliases: Readonly<Record<string, string>> =
  Object.fromEntries(
    (
      [
        ['skills-h', '技能', 'Skills', 'スキル'],
        ['exp-h', '經歷', 'Experience', '経歴'],
        ['edu-h', '學歷', 'Education', '学歴'],
        ['depth-h', '技術深度', 'Technical Depth', '技術的深さ'],
        [
          'beyond-h',
          '工程之外',
          'Beyond Engineering',
          'エンジニアリングの外側',
        ],
        [
          'proj-h',
          '開源專案',
          'Open-Source Projects',
          'オープンソースプロジェクト',
        ],
        ['comm-h', '社群', 'Community', 'コミュニティ'],
        ['notes-h', '技術筆記', 'Tech Note', '技術ノート'],
        [
          'prin-h',
          '工程原則',
          'Engineering Principles',
          'エンジニアリング原則',
        ],
        ['how-h', '工作方式', 'How I Work', '仕事の進め方'],
        ['prod-h', '生產實績', 'Production Evidence', '本番実績'],
        ['rnd-h', '重點研究與開發', 'Selected R&D', '研究・開発トピック'],
      ] as const
    ).flatMap(([id, ...titles]) => titles.map((title) => [title, id])),
  );

export const legacyDestinations: Record<string, string> = {
  'skills-h': '/zh-hant/about/#skills-h',
  'exp-h': '/zh-hant/about/#exp-h',
  'edu-h': '/zh-hant/about/#edu-h',
  'depth-h': '/zh-hant/about/#depth-h',
  'beyond-h': '/zh-hant/about/#beyond-h',
  'proj-h': '/zh-hant/projects/',
  'comm-h': '/zh-hant/about/#comm-h',
  'notes-h': '/zh-hant/blog/',
  'prod-h': '/zh-hant/blog/production-systems/#prod-h',
  'rnd-h': '/zh-hant/blog/trilingual-model-research/#rnd-h',
  'prin-h': '/zh-hant/blog/engineering-principles/#prin-h',
  'how-h': '/zh-hant/blog/engineering-principles/#how-h',
};
