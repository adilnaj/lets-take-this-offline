import { describe, it, expect } from 'vitest'

describe('PIPE-03: Seed script idempotency', () => {
  it.skip('re-running the seed script skips existing words by slug', async () => {
    // Skipped: requires live Supabase test DB. Re-running seed against test DB and asserting row count is unchanged is an integration test deferred post-v1.
  })
})
