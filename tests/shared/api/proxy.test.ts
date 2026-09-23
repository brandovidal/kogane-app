import { describe, expect, it } from 'vitest'

import { buildProxyRequest, toProxyResponse } from '@/shared/api/proxy'

const config = { apiUrl: 'https://kogane-api.up.railway.app', apiKey: 'secret-key' }

describe('/api proxy', () => {
  it('should forward to kogane-api with the API key and the query string', () => {
    const request = new Request('https://kogane-app.dev/api/v1/debts?personId=p1', {
      headers: { accept: 'application/json', cookie: 'CF_Authorization=abc', 'x-api-key': 'from-browser' },
    })

    const upstream = buildProxyRequest('v1/debts', request, config)

    expect(upstream?.url).toBe('https://kogane-api.up.railway.app/v1/debts?personId=p1')
    expect(upstream?.method).toBe('GET')
    expect(upstream?.headers.get('x-api-key')).toBe('secret-key')
    expect(upstream?.headers.get('accept')).toBe('application/json')
    // Access cookies and whatever the browser sends stay in Astro
    expect(upstream?.headers.get('cookie')).toBeNull()
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
})
