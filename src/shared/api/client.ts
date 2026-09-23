import createClient from 'openapi-fetch'

import type { components, paths } from './schema'

// Typed client of kogane-api through the Astro proxy (D56). Types: `pnpm api:types` with kogane-api running.
export const api = createClient<paths>({ baseUrl: '/api' })

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
