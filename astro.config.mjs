import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://sortedaud.app',
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
