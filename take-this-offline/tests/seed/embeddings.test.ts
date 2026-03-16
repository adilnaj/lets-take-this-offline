import { describe, it, expect } from 'vitest'

describe('PIPE-03: Seed word embeddings', () => {
  it.skip('each seeded word has a non-null embedding of length 1024', async () => {
    // Skipped: requires live Supabase test DB. Asserting embedding dimensions requires querying the words table with a real connection deferred post-v1.
  })
})
