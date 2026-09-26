// Server side of the /api proxy (D56): the browser calls /api/v1/..., Astro adds the API key and forwards to
// kogane-api. Only the REST API for kogane-app goes through: not /docs, not the Telegram webhook.
const ALLOWED_PATH = /^v1\/(?!telegram\b)[\w\-/]+$/

// What the browser may send along; everything else (Access headers, host) stays in Astro
const FORWARDED_HEADERS = ['accept', 'content-type']

// Only the cookies of the sign-in (P23): the session and the state of a Google sign-in. Others (Cloudflare Access…) stay
const FORWARDED_COOKIES = ['kogane_session', 'kogane_oauth']

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

  const cookies = (request.headers.get('cookie') ?? '')
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => FORWARDED_COOKIES.some((name) => cookie.startsWith(`${name}=`)))
  if (cookies.length) headers.set('cookie', cookies.join('; '))

  const hasBody = !['GET', 'HEAD'].includes(request.method)
  return new Request(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // A redirect (the return from Google) goes back to the browser as is: the Set-Cookie is in that answer
    redirect: 'manual',
    // needed to stream a request body (multipart uploads of Mensajes)
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit)
}

// Upstream headers the browser needs: the type, the file name of the downloads (Excel / PDF, D39) and where a redirect goes
const RETURNED_HEADERS = ['content-type', 'content-disposition', 'location']

// The answer goes back as is (status and body), with only those headers and the cookies of the sign-in
export function toProxyResponse(response: Response): Response {
  const headers = new Headers()
  for (const name of RETURNED_HEADERS) {
    const value = response.headers.get(name)
    if (value) headers.set(name, value)
  }
  for (const cookie of response.headers.getSetCookie()) {
    if (FORWARDED_COOKIES.some((name) => cookie.startsWith(`${name}=`))) headers.append('set-cookie', cookie)
  }
  return new Response(response.body, { status: response.status, headers })
}

export const notFoundResponse = () =>
  Response.json({ success: false, code: 'NOT_FOUND', message: 'Not found' }, { status: 404 })

export const apiUnavailableResponse = () =>
  Response.json(
    { success: false, code: 'API_UNAVAILABLE', message: 'La API no está disponible. Intenta de nuevo en unos momentos.' },
    { status: 503, headers: { 'cache-control': 'no-store', 'retry-after': '5' } },
  )
