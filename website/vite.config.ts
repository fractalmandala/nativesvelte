import { resolve } from 'node:path';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { galleryUiStyles } from './src/lib/gallery-ui-css.js';
import { playDev } from './src/lib/play-dev.js';

const configuredBase = process.env.PUBLIC_SITE_BASE || '';
const base = configuredBase === '/' || !configuredBase ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`;
const kitBase = configuredBase === '/' || !configuredBase ? '' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  plugins: [
    galleryUiStyles(),
    tailwindcss(),
    playDev(base),
    sveltekit({
      files: {
        assets: 'public',
      },
      adapter: adapter({
        pages: process.env.SITE_OUT_DIR || 'dist',
        assets: process.env.SITE_OUT_DIR || 'dist',
        fallback: '404.html',
        precompress: false,
        strict: false,
      }),
      paths: {
        base: kitBase,
        relative: false,
      },
      prerender: {
        handleHttpError: 'warn',
        handleMissingId: 'ignore',
        handleUnseenRoutes: 'ignore',
        entries: ['*'],
      },
    }),
  ],
  resolve: {
    alias: {
      $lib: resolve(import.meta.dirname, './src/lib'),
      $components: resolve(import.meta.dirname, './src/components'),
      $layouts: resolve(import.meta.dirname, './src/layouts'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
