import createClient from 'openapi-fetch'

import { loginUrl } from '../lib/auth-redirect'
import type { components, paths } from './schema'

// Typed client of kogane-api through the Astro proxy (D56). Types: `pnpm api:types` with kogane-api running.
function recoveryPageUrl() {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/servicio-no-disponible')) return
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  window.location.replace(`/servicio-no-disponible?returnTo=${encodeURIComponent(returnTo)}`)
}

// React islands render once on Astro's server. Never fetch their relative /api URL there; after hydration the browser
// loads the real API. A controlled 503 (or network error) sends the user to a static recovery page.
export const apiFetch: typeof fetch = async (input, init) => {
  if (typeof window === 'undefined') {
    return Response.json(
      { success: false, code: 'API_UNAVAILABLE', message: 'La API se consulta desde el navegador.' },
      { status: 503 },
    )
  }

  try {
    const response = await fetch(input, init)
    // No session (or it expired): sign in, and come back to this page (P23)
    if (response.status === 401 && !window.location.pathname.startsWith('/entrar')) {
      const body = (await response.clone().json().catch(() => null)) as { code?: string } | null
      if (body?.code === 'SESSION_REQUIRED') {
        window.location.replace(loginUrl(`${window.location.pathname}${window.location.search}`))
        return response
      }
    }
    if (response.status === 503) {
      const body = (await response.clone().json().catch(() => null)) as { code?: string } | null
      if (body?.code === 'API_UNAVAILABLE') recoveryPageUrl()
    }
    return response
  } catch {
    recoveryPageUrl()
    throw new Error('No se pudo conectar con Kogane. Se abrirá la página de recuperación.')
  }
}

export const api = createClient<paths>({ baseUrl: '/api', fetch: apiFetch })

export type Schemas = components['schemas']

// Error envelope of kogane-api (AppException): code like DEBT_PAYMENT_EXCEEDS_BALANCE and a message
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type ApiResult = { data?: unknown; error?: unknown; response: Response }

// The `data` inside the envelope of ResponseInterceptor (undefined for deletes)
// Only the success branch of openapi-fetch has `data` (the error one has `data?: never`)
type Payload<R> = R extends { data: infer D } ? (D extends { data: infer X } ? X : undefined) : never

// Every response comes wrapped by ResponseInterceptor: returns its data or throws ApiError
export async function unwrap<R extends ApiResult>(call: Promise<R>): Promise<Payload<R>> {
  const { data, error, response } = await call
  // 204 (deletes) has no envelope
  if (response.ok) return (data as { data?: unknown } | undefined)?.data as Payload<R>

  const body = (error ?? {}) as { code?: string; message?: string; details?: unknown }
  throw new ApiError(response.status, body.code ?? 'UNKNOWN_ERROR', body.message ?? response.statusText, body.details)
}
