import type { CSSProperties } from 'react';

// One outline vocabulary (24-unit grid, 1.6 stroke, round caps) for every
// tab, tree row, action, entity type, status and heading. See docs/DESIGN.md §6.
const paths = {
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  'arrow-left': 'M20 12H5m6-6-6 6 6 6',
  'arrow-down': 'M12 4v15m-6-6 6 6 6-6',
  'arrow-up-right': 'M7 17 17 7M8.5 7H17v8.5',
  external:
    'M14 4h6v6M20 4 9 15M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM16 16l4 4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M6 18 18 6',
  sidebar: 'M4 5h16v14H4zM9.5 5v14M6.5 8.5h.01M6.5 11.5h.01',
  github:
    'M9 19c-5 1-5-2-7-2m15 5v-4a3 3 0 0 0-1-2c3-.4 6-1.4 6-6a5 5 0 0 0-1.5-3.5 5 5 0 0 0-.1-3.5S19 2.6 16 4a13 13 0 0 0-7 0C6 2.6 4.6 3 4.6 3a5 5 0 0 0-.1 3.5A5 5 0 0 0 3 10c0 4.6 3 5.6 6 6a3 3 0 0 0-1 2v4',
  rss: 'M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14M6 19h.01',
  mail: 'M4 6h16v12H4zm0 0 8 7 8-7',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  check: 'm5 12 4.5 4.5L19 7',
  alert: 'M12 4 2.8 19.5h18.4zM12 10v4m0 3v.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v5m0-8v.01',
  'circle-x':
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6',
  retry: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  globe:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  files:
    'M9 3h6.5L20 7.5V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM15 3v5h5M5 7v13a1 1 0 0 0 1 1h9',
  file: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5',
  'file-code':
    'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5M10.5 12l-2 2.5 2 2.5M13.5 12l2 2.5-2 2.5',
  markdown: 'M3 6h18v12H3zM6.5 15V9l2.5 3 2.5-3v6M16.5 9v6m-2-2 2 2 2-2',
  folder:
    'M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  'folder-open':
    'M3 18V6a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v2M3 18l2.6-7.2a1 1 0 0 1 .94-.66H21l-2.7 7.2a1 1 0 0 1-.94.66z',
  home: 'M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z',
  branch:
    'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9',
  commit: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 12h5.5M15.5 12H21',
  book: 'M3 5h5.5A3.5 3.5 0 0 1 12 8.5V20a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-5.5A3.5 3.5 0 0 0 12 8.5V20a2.5 2.5 0 0 1 2.5-2.5H21z',
  notebook:
    'M7 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7zM7 3v18M4.5 7H7M4.5 12H7M4.5 17H7M11 8h4.5M11 11.5h4.5',
  pen: 'M4 20l1.2-4.6L15.6 5a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8zM13.5 7l3.5 3.5',
  package:
    'M21 16V8l-9-5-9 5v8l9 5zM3.3 7.3 12 12l8.7-4.7M12 21.5V12M7.5 5.5l9 5',
  newspaper:
    'M4 21h15a2 2 0 0 0 2-2V4H7v15a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-8h4M10 8h7M10 12h7M10 16h4',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-right': 'm9 6 6 6-6 6',
  hash: 'M5 9h14M5 15h14M10 4 8 20M16 4l-2 16',
  tag: 'M4 4h7.5l8.5 8.5-7.5 7.5L4 11.5zM8.5 8.5h.01',
  list: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0',
  briefcase:
    'M4 8h16v11H4zM9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M4 13h16',
  graduation:
    'M2.5 9.5 12 5l9.5 4.5L12 14zM6.5 11.5V16c3 2.3 8 2.3 11 0v-4.5M21.5 9.5V15',
  'map-pin':
    'M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
  cloud: 'M7 19a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9.5a4.75 4.75 0 0 1-.25 9.5z',
  sparkles:
    'M10 3.5 11.6 8 16 9.6 11.6 11.2 10 15.7 8.4 11.2 4 9.6 8.4 8zM17.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z',
  network:
    'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM10.8 7.6l-4 8.6M13.2 7.6l4 8.6M8 18.5h8',
  shield: 'M12 3 4.5 6v6c0 4.6 3.2 7.8 7.5 9 4.3-1.2 7.5-4.4 7.5-9V6z',
  capsule: 'm9 4-5 5a6 6 0 0 0 8.5 8.5l5-5A6 6 0 0 0 9 4ZM7 7l8.5 8.5',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9.5 3.5V7M14.5 3.5V7M9.5 17v3.5M14.5 17v3.5M3.5 9.5H7M3.5 14.5H7M17 9.5h3.5M17 14.5h3.5',
  image: 'M4 5h16v14H4zM4 15.5l4.5-4.5 4 4 2.5-2.5L20 17.5M15.5 9.5h.01',
  prompt: 'M4 6.5 9.5 12 4 17.5M12 18h8',
  keyboard:
    'M3 6.5h18v11H3zM7 10h.01M10.5 10h.01M14 10h.01M17.5 10h.01M7.5 14h9',
} as const satisfies Record<string, string>;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
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
