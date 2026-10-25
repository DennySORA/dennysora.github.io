import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import { loadPosts } from './src/lib/content.server.ts';
import { articleDemoPublication } from './src/lib/article-demo-publication.ts';

const demos = articleDemoPublication(loadPosts());
export default defineConfig({
  define: {
    __PRIVACY_DEMOS__: demos.privacy,
    __TRANSLATION_DEMOS__: demos.translation,
  },
  plugins: [tailwindcss(), reactRouter()],
  server: { host: '127.0.0.1' },
  build: { sourcemap: false },
});
