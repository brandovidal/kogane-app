// Server side of the /api proxy (D56): the browser calls /api/v1/..., Astro adds the API key and forwards to
// kogane-api. Only the REST API for kogane-app goes through: not /docs, not the Telegram webhook.
const ALLOWED_PATH = /^v1\/(?!telegram\b)[\w\-/]+$/

// What the browser may send along; everything else (cookies, Access headers, host) stays in Astro
const FORWARDED_HEADERS = ['accept', 'content-type']

export interface ProxyConfig {
  apiUrl: string
  apiKey: string
}

export function buildProxyRequest(path: string, request: Request, { apiUrl, apiKey }: ProxyConfig): Request | null {
  if (!ALLOWED_PATH.test(path) || path.includes('..')) return null

  const target = new URL(`/${path}${new URL(request.url).search}`, apiUrl)
  const headers = new Headers({ 'x-api-key': apiKey })
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method)
  return new Request(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // needed to stream a request body (multipart uploads of Mensajes)
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit)
}

// The answer goes back as is (status and JSON envelope), without the upstream headers
export function toProxyResponse(response: Response): Response {
  const headers = new Headers()
  const contentType = response.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  return new Response(response.body, { status: response.status, headers })
}

export const notFoundResponse = () =>
  Response.json({ success: false, code: 'NOT_FOUND', message: 'Not found' }, { status: 404 })
