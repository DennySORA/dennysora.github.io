import type { FileKind } from '../lib/workspace.ts';
import type { IconName } from './Icon.tsx';

// The icon each kind of open page shows in the tabline, winbar and status line.
export const fileIcons: Record<FileKind, IconName> = {
  markdown: 'markdown',
  folder: 'folder-open',
  search: 'search',
  missing: 'circle-x',
};
