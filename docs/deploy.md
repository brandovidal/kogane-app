# Despliegue y configuración de kogane-app

kogane-app es un **Worker de Cloudflare** (Astro SSR con `@astrojs/cloudflare`), privado con **Cloudflare Access**. No se conecta a la base: llama a kogane-api (`/v1/*`) desde el servidor con `x-api-key`, así la clave nunca llega al navegador (D23, D53).

Cada push a `main` lo despliega **Cloudflare Workers Builds**, conectado al repo de GitHub (igual que Railway con kogane-api). GitHub Actions (`.github/workflows/test.yml`) solo corre los tests en cada push y pull request.

```
push a main → Workers Builds: pnpm install → pnpm test && pnpm build → pnpm exec wrangler deploy
```

`astro.config.mjs` usa el adaptador de Cloudflare cuando Workers Builds define `WORKERS_CI=1` (o con `ASTRO_ADAPTER=cloudflare` en local); si no, el de Node.

## Entornos

| Entorno | Cómo corre | API |
|---|---|---|
| local | `pnpm dev` (adaptador Node) | `http://localhost:5560` (kogane-api local) |
| producción | Worker `kogane-app` en Cloudflare | `https://kogane-api.up.railway.app` (kogane-api en Railway) |

**En local:** `cp .env.example .env.dev` con la misma `API_KEY` de `kogane-api/.env.dev`, kogane-api con `pnpm dev` y kogane-app con `pnpm dev` (`astro dev --mode dev`, lee `.env.dev`). Para ver los datos de producción desde local: `.env` con `API_URL=https://kogane-api.up.railway.app` y la `API_KEY` de producción, y `pnpm build && pnpm preview` (`localhost:3000`; `astro preview` no lee archivos `.env`, por eso el script usa `node --env-file=.env`). Cuidado: lo que edites ahí cambia producción. El navegador llama a `/api/v1/…` y el servidor de Astro (`src/pages/api/[...path].ts`) agrega `x-api-key` y reenvía a `API_URL`; la clave nunca llega al navegador (D56). Tipos del cliente: `pnpm api:types` con kogane-api corriendo (regenera `src/shared/api/schema.d.ts`, versionado).

**Si una página sale sin estilos en local:** reinicia `pnpm dev`. `astro dev` no le da el CSS global a una página **agregada** con el servidor corriendo (le pasa a cualquier página nueva después de un `git pull`), y correr `astro check` o `astro build` con el servidor activo deja desactualizada su caché de Vite. Si reiniciar no alcanza, borra `node_modules/.vite`.

Para probar el build de producción en local: `ASTRO_ADAPTER=cloudflare pnpm build && pnpm exec wrangler deploy --dry-run`.

## 1. Cloudflare (Workers Builds)

Workers & Pages → `kogane-app` → **Configuración → Compilación**:

| Campo | Valor |
|---|---|
| Comando de compilación | `pnpm test && pnpm build` |
| Comando de implementación | `pnpm exec wrangler deploy` (usa el `wrangler` del lockfile en vez de bajar otro con `npx`) |
| Directorio raíz | `/` |
| Variables de compilación | `PNPM_VERSION` = `12.4.2` |

- **Node:** lo toma de `.node-version` (22). Sin ese archivo, Workers Builds usa Node 24.
- **pnpm:** sin `PNPM_VERSION`, usa una versión vieja (9.x) y el install falla con `ERR_PNPM_UNSUPPORTED_ENGINE` (el proyecto pide pnpm ≥ 10).
- **Build scripts:** pnpm 12 falla el install si un paquete tiene scripts sin decidir; están en `allowBuilds` de `pnpm-workspace.yaml`.

**Secretos del Worker** (en tiempo de ejecución; siguen en cada deploy): **Configuración → Variables y secretos → Agregar**, tipo *Secreto*:
- `API_URL` → `https://kogane-api.up.railway.app` (la `PUBLIC_URL` de kogane-api).
- `API_KEY` → la misma `API_KEY` de Railway.

(Las "variables de compilación" solo existen durante el build; `API_URL` y `API_KEY` van como secretos del Worker.)

## 2. Login con Cloudflare Access (D53)

1. Workers & Pages → `kogane-app` → **Settings → Domains & Routes** → activar **Cloudflare Access** en `workers.dev` (un clic; también protege las URLs de preview).
2. En la política, **Include → Emails →** tu correo. Método de ingreso: **One-time PIN** (código al correo).
3. Verificar: abrir la URL en una ventana privada → pide el correo y el código; otro correo no entra.

Cloudflare Zero Trust es gratis hasta 50 usuarios; no hace falta un dominio propio.

## 3. GitHub

Nada que configurar: el workflow de tests no usa secretos. No hace falta `CLOUDFLARE_API_TOKEN` en GitHub.

## 4. Verificación

- La URL `https://kogane-app.<cuenta>.workers.dev` pide login (Access).
- Tras el login la app carga. Mientras P7 no esté hecho, sigue mostrando datos del mock; desde P7 los lee de kogane-api.

## 5. Volver atrás

Workers & Pages → `kogane-app` → **Deployments** → la versión anterior → **Rollback**.
