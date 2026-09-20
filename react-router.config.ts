import type { Config } from '@react-router/dev/config';
import { publishedPaths } from './src/lib/content.server.ts';

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: () => publishedPaths(),
  routeDiscovery: { mode: 'initial' },
} satisfies Config;
