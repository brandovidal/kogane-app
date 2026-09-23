# Despliegue y configuración de kogane-app

kogane-app es un **Worker de Cloudflare** (Astro SSR con `@astrojs/cloudflare`), privado con **Cloudflare Access**. No se conecta a la base: llama a kogane-api (`/v1/*`) desde el servidor con `x-api-key`, así la clave nunca llega al navegador (D23, D53).

Cada push a `main` despliega con GitHub Actions (`.github/workflows/deploy.yml`):

```
pnpm install → pnpm test → astro build (ASTRO_ADAPTER=cloudflare) → wrangler deploy
```

## Entornos

| Entorno | Cómo corre | API |
|---|---|---|
| local | `pnpm dev` (adaptador Node) | `http://localhost:5560` (kogane-api local) |
| producción | Worker `kogane-app` en Cloudflare | `https://….up.railway.app` (kogane-api en Railway) |

Para probar el build de producción en local: `NODE_ENV=production ASTRO_ADAPTER=cloudflare pnpm build && pnpm exec wrangler deploy --dry-run`.

## 1. Cloudflare

1. **API token** (My Profile → API Tokens → plantilla "Edit Cloudflare Workers") → secreto `CLOUDFLARE_API_TOKEN` en GitHub; el **Account ID** (panel de Workers) → `CLOUDFLARE_ACCOUNT_ID`.
2. Primer deploy: el workflow crea el Worker `kogane-app` (nombre en `wrangler.jsonc`) y, si falta, el KV `SESSION` que agrega el adaptador de Astro.
3. **Secretos del Worker** (una sola vez; siguen en cada deploy), desde tu máquina con `pnpm exec wrangler login`:
   - `pnpm exec wrangler secret put API_URL` → `https://kogane-api.up.railway.app` (la `PUBLIC_URL` de kogane-api).
   - `pnpm exec wrangler secret put API_KEY` → la misma `API_KEY` de Railway.

## 2. Login con Cloudflare Access (D53)

1. Workers & Pages → `kogane-app` → **Settings → Domains & Routes** → activar **Cloudflare Access** en `workers.dev` (un clic; también protege las URLs de preview).
2. En la política, **Include → Emails →** tu correo. Método de ingreso: **One-time PIN** (código al correo).
3. Verificar: abrir la URL en una ventana privada → pide el correo y el código; otro correo no entra.

Cloudflare Zero Trust es gratis hasta 50 usuarios; no hace falta un dominio propio.

## 3. GitHub

**Settings → Environments → `production`** con los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.

## 4. Verificación

- La URL `https://kogane-app.<cuenta>.workers.dev` pide login (Access).
- Tras el login la app carga. Mientras P7 no esté hecho, sigue mostrando datos del mock; desde P7 los lee de kogane-api.

## 5. Volver atrás

Workers & Pages → `kogane-app` → **Deployments** → la versión anterior → **Rollback**.
