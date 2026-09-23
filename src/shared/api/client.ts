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

interface Envelope<T> {
  data: T
}

type ApiResult<T> = { data?: Envelope<T>; error?: unknown; response: Response }

// Every response comes wrapped by ResponseInterceptor: returns its data or throws ApiError
export async function unwrap<T>(call: Promise<ApiResult<T>>): Promise<T> {
  const { data, error, response } = await call
  if (response.ok && data) return data.data

  const body = (error ?? {}) as { code?: string; message?: string; details?: unknown }
  throw new ApiError(response.status, body.code ?? 'UNKNOWN_ERROR', body.message ?? response.statusText, body.details)
}
