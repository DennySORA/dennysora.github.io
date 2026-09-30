import type { CSSProperties } from 'react';

export type IconName =
  | 'arrow'
  | 'arrow-left'
  | 'arrow-down'
  | 'external'
  | 'search'
  | 'menu'
  | 'close'
  | 'github'
  | 'rss'
  | 'mail'
  | 'copy'
  | 'check'
  | 'alert'
  | 'info'
  | 'retry'
  | 'link'
  | 'globe'
  | 'files'
  | 'branch'
  | 'book'
  | 'package'
  | 'newspaper'
  | 'markdown'
  | 'folder'
  | 'chevron-down'
  | 'chevron-right'
  | 'hash'
  | 'shield'
  | 'capsule';
const paths: Record<IconName, string> = {
  capsule: 'm9 4-5 5a6 6 0 0 0 8.5 8.5l5-5A6 6 0 0 0 9 4ZM7 7l8.5 8.5',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  'arrow-left': 'M20 12H5m6-6-6 6 6 6',
  'arrow-down': 'M12 4v15m-6-6 6 6 6-6',
  external:
    'M14 4h6v6M20 4 9 15M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM16 16l4 4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M6 18 18 6',
  github:
    'M9 19c-5 1-5-2-7-2m15 5v-4a3 3 0 0 0-1-2c3-.4 6-1.4 6-6a5 5 0 0 0-1.5-3.5 5 5 0 0 0-.1-3.5S19 2.6 16 4a13 13 0 0 0-7 0C6 2.6 4.6 3 4.6 3a5 5 0 0 0-.1 3.5A5 5 0 0 0 3 10c0 4.6 3 5.6 6 6a3 3 0 0 0-1 2v4',
  rss: 'M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14M6 19h.01',
  mail: 'M4 6h16v12H4zm0 0 8 7 8-7',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  check: 'm5 12 4.5 4.5L19 7',
  alert: 'M12 4 2.8 19.5h18.4zM12 10v4m0 3v.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v5m0-8v.01',
  retry: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  globe:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  files:
    'M9 3h6.5L20 7.5V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM15 3v5h5M5 7v13a1 1 0 0 0 1 1h9',
  branch:
    'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9',
  book: 'M3 5h5.5A3.5 3.5 0 0 1 12 8.5V20a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-5.5A3.5 3.5 0 0 0 12 8.5V20a2.5 2.5 0 0 1 2.5-2.5H21z',
  package:
    'M21 16V8l-9-5-9 5v8l9 5zM3.3 7.3 12 12l8.7-4.7M12 21.5V12M7.5 5.5l9 5',
  newspaper:
    'M4 21h15a2 2 0 0 0 2-2V4H7v15a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-8h4M10 8h7M10 12h7M10 16h4',
  markdown: 'M3 6h18v12H3zM6.5 15V9l2.5 3 2.5-3v6M16.5 9v6m-2-2 2 2 2-2',
  folder:
    'M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-right': 'm9 6 6 6-6 6',
  hash: 'M5 9h14M5 15h14M10 4 8 20M16 4l-2 16',
  shield: 'M12 3 4.5 6v6c0 4.6 3.2 7.8 7.5 9 4.3-1.2 7.5-4.4 7.5-9V6z',
};

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
