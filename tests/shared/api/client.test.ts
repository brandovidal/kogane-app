import { describe, expect, it } from 'vitest'

import { ApiError, unwrap } from '@/shared/api/client'

describe('unwrap', () => {
  it('should return the data of the success envelope', async () => {
    const call = Promise.resolve({
      data: { data: [{ id: 'd1' }] },
      response: new Response(null, { status: 200 }),
    })

    await expect(unwrap(call)).resolves.toEqual([{ id: 'd1' }])
  })

  it('should accept an answer without content (204 of a delete)', async () => {
    const call = Promise.resolve({ response: new Response(null, { status: 204 }) })

    await expect(unwrap(call)).resolves.toBeUndefined()
  })

  it('should throw ApiError with the code and message of kogane-api', async () => {
    const call = Promise.resolve({
      error: { code: 'DEBT_PAYMENT_EXCEEDS_BALANCE', message: 'The payment is greater than the balance', details: { balance: 250 } },
      response: new Response(null, { status: 422 }),
    })

    const error = await unwrap(call).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 422, code: 'DEBT_PAYMENT_EXCEEDS_BALANCE', details: { balance: 250 } })
  })

  it('should explain an answer without envelope (e.g. the API is down)', async () => {
    const call = Promise.resolve({ response: new Response(null, { status: 502, statusText: 'Bad Gateway' }) })

    await expect(unwrap(call)).rejects.toMatchObject({ status: 502, code: 'UNKNOWN_ERROR', message: 'Bad Gateway' })
  })
})
