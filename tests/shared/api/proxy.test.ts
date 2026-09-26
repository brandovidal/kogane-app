import { describe, expect, it } from 'vitest'

import { buildProxyRequest, toProxyResponse } from '@/shared/api/proxy'

const config = { apiUrl: 'https://kogane-api.up.railway.app', apiKey: 'secret-key' }

describe('/api proxy', () => {
  it('should forward to kogane-api with the API key and the query string', () => {
    const request = new Request('https://kogane-app.dev/api/v1/debts?personId=p1', {
      headers: {
        accept: 'application/json',
        cookie: 'CF_Authorization=abc; kogane_session=tok; other=1',
        'x-api-key': 'from-browser',
        'x-admin-key': 'from-browser',
      },
    })

    const upstream = buildProxyRequest('v1/debts', request, config)

    expect(upstream?.url).toBe('https://kogane-api.up.railway.app/v1/debts?personId=p1')
    expect(upstream?.method).toBe('GET')
    expect(upstream?.headers.get('x-api-key')).toBe('secret-key')
    expect(upstream?.headers.get('accept')).toBe('application/json')
    // Only the cookie of the session goes along (P23); Access cookies and whatever else the browser sends stay in Astro
    expect(upstream?.headers.get('cookie')).toBe('kogane_session=tok')
    expect(upstream?.headers.get('x-admin-key')).toBeNull() // the backdoor is not for the web
    expect(upstream?.redirect).toBe('manual')
  })

  it('should forward the body and content type of writes', async () => {
    const request = new Request('https://kogane-app.dev/api/v1/debts/d1/payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: 150 }),
    })

    const upstream = buildProxyRequest('v1/debts/d1/payments', request, config)

    expect(upstream?.method).toBe('POST')
    expect(upstream?.headers.get('content-type')).toBe('application/json')
    await expect(upstream?.json()).resolves.toEqual({ amount: 150 })
  })

  it.each(['docs-json', 'v1/telegram/webhook', 'v2/health', 'v1/../docs', ''])('should refuse "%s"', (path) => {
    expect(buildProxyRequest(path, new Request('https://kogane-app.dev/api/x'), config)).toBeNull()
  })

  it('should give back the status and JSON of kogane-api without its other headers', async () => {
    const upstream = Response.json(
      { success: false, code: 'DEBT_NOT_FOUND' },
      { status: 404, headers: { 'set-cookie': 'x=1', 'x-powered-by': 'Express' } },
    )

    const response = toProxyResponse(upstream)

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('set-cookie')).toBeNull()
    await expect(response.json()).resolves.toEqual({ success: false, code: 'DEBT_NOT_FOUND' })
  })

  it('should hand the browser the session cookie and the redirect of a sign-in, and no other cookie', () => {
    const upstream = new Response(null, { status: 302, headers: { location: 'https://kogane-app.dev/' } })
    upstream.headers.append('set-cookie', 'kogane_session=abc; Path=/; HttpOnly')
    upstream.headers.append('set-cookie', 'kogane_oauth=; Path=/; Max-Age=0')
    upstream.headers.append('set-cookie', 'tracking=1')

    const response = toProxyResponse(upstream)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://kogane-app.dev/')
    expect(response.headers.getSetCookie()).toEqual(['kogane_session=abc; Path=/; HttpOnly', 'kogane_oauth=; Path=/; Max-Age=0'])
  })

  it('should keep the file name of a download (Excel / PDF)', async () => {
    const upstream = new Response(new Uint8Array([37, 80, 68, 70]), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="deudas-todas-2026-09-23.pdf"',
      },
    })

    const response = toProxyResponse(upstream)

    expect(response.headers.get('content-disposition')).toBe('attachment; filename="deudas-todas-2026-09-23.pdf"')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([37, 80, 68, 70]))
  })
})
