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
  | 'globe';
const paths: Record<IconName, string> = {
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
