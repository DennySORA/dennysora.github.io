import type { CSSProperties } from 'react';
export type IconName =
  | 'home'
  | 'user'
  | 'code'
  | 'file'
  | 'research'
  | 'search'
  | 'arrow'
  | 'external'
  | 'github'
  | 'menu'
  | 'close'
  | 'folder'
  | 'chevron'
  | 'rss'
  | 'globe'
  | 'mail';
const paths: Record<IconName, string> = {
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
  file: 'M14 2H5v20h14V7zm0 0v6h5M8 12h8m-8 4h6',
  research:
    'M9 3h6m-5 0v7L4 19a1.5 1.5 0 0 0 1.5 2h13a1.5 1.5 0 0 0 1.5-2l-6-9V3M7 15h10',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  external: 'M14 3h7v7m0-7L10 14m0-11H4v17h17v-7',
  github:
    'M9 19c-5 1-5-2-7-2m15 5v-4a3 3 0 0 0-1-2c3-.4 6-1.4 6-6a5 5 0 0 0-1.5-3.5 5 5 0 0 0-.1-3.5S19 2.6 16 4a13 13 0 0 0-7 0C6 2.6 4.6 3 4.6 3a5 5 0 0 0-.1 3.5A5 5 0 0 0 3 10c0 4.6 3 5.6 6 6a3 3 0 0 0-1 2v4',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  folder: 'M3 5h6l2 2h10v13H3z',
  chevron: 'm9 5 7 7-7 7',
  rss: 'M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19h.01',
  globe:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  mail: 'M3 5h18v14H3zm0 0 9 8 9-8',
};
export function Icon({
  name,
  size = 18,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
