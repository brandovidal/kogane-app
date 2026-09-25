// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Workers Builds (the Cloudflare deploy, D55) sets WORKERS_CI=1; ASTRO_ADAPTER=cloudflare forces it locally
// (e.g. `ASTRO_ADAPTER=cloudflare pnpm build && pnpm exec wrangler deploy --dry-run`)
const isProduction = process.env.WORKERS_CI === '1' || process.env.ASTRO_ADAPTER === 'cloudflare';

// Use node adapter for local dev, cloudflare for production
const adapter = isProduction
  ? (await import('@astrojs/cloudflare')).default()
  : node({ mode: 'standalone' });

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],
  // Estados de cuenta joined Reconocimiento / Importación (D104)
  redirects: { '/estados-de-cuenta': '/reconocimiento' },
  adapter,

  // Server only (D56): the /api proxy adds the key; it never reaches the browser. Locally from .env, on Cloudflare
  // from the Worker secrets (docs/deploy.md)
  env: {
    schema: {
      API_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:5560' }),
      API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  }
});
