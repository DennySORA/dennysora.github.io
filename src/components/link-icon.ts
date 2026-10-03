import type { IconName } from './Icon.tsx';

/** Repository links show the GitHub mark; any other destination a plain link. */
export function linkIcon(url: string): IconName {
  return new URL(url).hostname === 'github.com' ? 'github' : 'link';
}
