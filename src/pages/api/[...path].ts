import type { APIRoute } from 'astro'
import { API_KEY, API_URL } from 'astro:env/server'

import { buildProxyRequest, notFoundResponse, toProxyResponse } from '@/shared/api/proxy'

export const prerender = false

// /api/v1/* → kogane-api with the x-api-key header (D56)
export const ALL: APIRoute = async ({ params, request }) => {
  const upstream = buildProxyRequest(params.path ?? '', request, { apiUrl: API_URL, apiKey: API_KEY })
  if (!upstream) return notFoundResponse()
  return toProxyResponse(await fetch(upstream))
}
