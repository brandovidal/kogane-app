// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Cloudflare Pages sets CF_PAGES; the GitHub deploy workflow (wrangler, Workers) sets ASTRO_ADAPTER=cloudflare
const isProduction =
  (process.env.NODE_ENV === 'production' && process.env.CF_PAGES) || process.env.ASTRO_ADAPTER === 'cloudflare';

// Use node adapter for local dev, cloudflare for production
const adapter = isProduction
  ? (await import('@astrojs/cloudflare')).default()
  : node({ mode: 'standalone' });

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],
  adapter,

  vite: {
    plugins: [tailwindcss()],
  }
});
