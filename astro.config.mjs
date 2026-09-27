// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Workers Builds (the Cloudflare deploy, D55) sets WORKERS_CI=1; ASTRO_ADAPTER=cloudflare forces it locally
// (e.g. `ASTRO_ADAPTER=cloudflare pnpm build && pnpm exec wrangler deploy --dry-run`)
const isProduction = process.env.WORKERS_CI === '1' || process.env.ASTRO_ADAPTER === 'cloudflare';

const adapter = isProduction
  ? (await import('@astrojs/cloudflare')).default()
  : node({ mode: 'standalone' });

// https://astro.build/config
export default defineConfig({
  output: 'static',
  server: { port: 4000 },
  integrations: [react()],
  redirects: { '/estados-de-cuenta': '/reconocimiento' },
  adapter,
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
