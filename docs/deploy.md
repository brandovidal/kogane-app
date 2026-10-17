# Despliegue y configuración de kogane-app

kogane-app es un **Worker de Cloudflare** (Astro con `@astrojs/cloudflare`), privado con **Cloudflare Access**. Todas las páginas son **HTML estático** (`output: 'static'`, D102): cascarones con islas que piden los datos por `/api`, servidos como assets (gratis e ilimitados). Lo único que corre en el Worker es el proxy `/api/[...path]` (`prerender = false`). El detalle de una tarjeta es `/tarjetas?tarjeta=IO`; los enlaces viejos `/tarjetas/IO` ya no existen (Astro no permite redirigir una ruta dinámica a una con query). No se conecta a la base: llama a kogane-api (`/v1/*`) desde el servidor con `x-api-key`, así la clave nunca llega al navegador (D23, D53).

Cada push a `main` lo despliega **Cloudflare Workers Builds**, conectado al repo de GitHub (igual que Railway con kogane-api). GitHub Actions (`.github/workflows/test.yml`) solo corre los tests en cada push y pull request.

```
push a main → Workers Builds: pnpm install → pnpm test && pnpm build → pnpm exec wrangler deploy
```

`astro.config.mjs` usa el adaptador de Cloudflare cuando Workers Builds define `WORKERS_CI=1` (o con `ASTRO_ADAPTER=cloudflare` en local); si no, el de Node.

## Entornos

| Entorno | Cómo corre | API |
|---|---|---|
| local | `pnpm dev` (adaptador Node) | `http://localhost:5560` (kogane-api local) |
| dev | Worker `dev-kogane-app` (rama `dev`, `CLOUDFLARE_ENV=dev`) | `https://kogane-api-dev.up.railway.app` |
| qa | Worker `qa-kogane-app` (rama `qa`, `CLOUDFLARE_ENV=qa`) | `https://kogane-api-qa.up.railway.app` |
| producción | Worker `kogane-app` (rama `main`, sin `CLOUDFLARE_ENV`) | `https://kogane-api.up.railway.app` (kogane-api en Railway) |

Los entornos viven en `env` de `wrangler.jsonc`: cada uno define el nombre del Worker y su `API_URL`. Con `CLOUDFLARE_ENV` vacío el build usa la configuración de nivel superior (producción). Para comprobar a qué Worker y API apunta un build: `CLOUDFLARE_ENV=qa ASTRO_ADAPTER=cloudflare pnpm build` y mirar `name` y `API_URL` en `dist/server/wrangler.json`.

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
| Variables de compilación | `PNPM_VERSION` = la de `packageManager` (hoy `12.14.0`); `CLOUDFLARE_ENV` = `dev` o `qa` según el Worker (vacía en producción) |

- **Node:** lo toma de `.node-version` (`24.13.0`); `engines.node` pide `>=24.13.0`. Sin ese archivo, Workers Builds usa Node 24.
- **pnpm:** la versión se fija en `packageManager` de `package.json`. Sin `PNPM_VERSION`, Workers Builds usa una versión vieja (9.x) y el install falla con `ERR_PNPM_UNSUPPORTED_ENGINE`; mantén `PNPM_VERSION` igual a `packageManager`.
- **Wrangler:** `@cloudflare/vite-plugin` exige un `wrangler` compatible (hoy `^4.151.0`). El `wrangler` del `package.json` y el del lockfile deben cumplirlo; si el build falla con `does not satisfy the peer dependency`, sube `wrangler` y regenera el lockfile.
- **Build scripts:** pnpm 12 falla el install si un paquete tiene scripts sin decidir; están en `allowBuilds` de `pnpm-workspace.yaml`.

**Secretos del Worker** (en tiempo de ejecución; siguen en cada deploy): **Configuración → Variables y secretos → Agregar**, tipo *Secreto*:
- `API_URL` → `https://kogane-api.up.railway.app` (la `PUBLIC_URL` de kogane-api).
- `API_KEY` → la misma `API_KEY` de Railway.

(Las "variables de compilación" solo existen durante el build; `API_URL` y `API_KEY` van como secretos del Worker.)

### Workers de dev y qa

Cada entorno es un Worker distinto con su propio proyecto de Workers Builds, conectado al mismo repo:

| Worker | Rama de producción | Variable de compilación |
|---|---|---|
| `kogane-app` | `main` | (ninguna) |
| `dev-kogane-app` | `dev` | `CLOUDFLARE_ENV=dev` |
| `qa-kogane-app` | `qa` | `CLOUDFLARE_ENV=qa` |

- El nombre del Worker del proyecto debe coincidir con el `name` del entorno en `wrangler.jsonc`; si no, Workers Builds se queja del desajuste o despliega a otro Worker.
- Los secretos `API_URL` y `API_KEY` se cargan en cada Worker con los valores de su API (dev, qa o producción).
- Las ramas que no son la de producción de un proyecto usan el comando de vista previa (`npx wrangler preview`, Wrangler ≥ 4.135.0; el nombre de la vista previa es la rama) y generan una URL de vista previa sin reemplazar el despliegue. Sin `CLOUDFLARE_ENV`, esa vista previa usa la configuración de nivel superior, es decir, la API de producción: para vistas previas de ramas feature, usa el proyecto de dev.

## 2. Login

Desde P23 la web tiene login propio (`/entrar`: correo o celular + contraseña, o Google, solo con invitación); ver `kogane-api/docs/deploy.md` sección 5c para crear al dueño y al superadmin. La cookie de sesión la reenvía el proxy `/api`; no hay variables nuevas en el Worker. Cloudflare Access queda opcional (segunda capa).

### Cloudflare Access (D53, opcional)

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

Workers & Pages → el Worker del entorno (`kogane-app`, `dev-kogane-app` o `qa-kogane-app`) → **Deployments** → la versión anterior → **Rollback**.
