import { describe, it, expect } from 'vitest'

describe('PIPE-03: Seed word uniqueness', () => {
  it.skip('all seeded words have unique daily_date values', async () => {
    // Skipped: requires live Supabase test DB. Uniqueness is enforced by DB UNIQUE constraint — integration test deferred post-v1.
  })

  it.skip('all seeded words have unique slug values', async () => {
    // Skipped: requires live Supabase test DB. Uniqueness is enforced by DB UNIQUE constraint — integration test deferred post-v1.
  })
})
