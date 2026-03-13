import { describe, it, expect } from 'vitest'

describe('PIPE-03: Seed script idempotency', () => {
  it('re-running the seed script skips existing words by slug', async () => {
    // TODO: implement — run seed against test DB, count rows, run again, assert row count unchanged
    expect(false).toBe(true) // stub: replace with real assertions
  })
})
