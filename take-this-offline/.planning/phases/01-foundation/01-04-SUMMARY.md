---
phase: 01-foundation
plan: "04"
subsystem: seed-data
tags: [supabase, seed, anthropic, voyageai, pgvector, embeddings, typescript]

# Dependency graph
requires:
  - phase: 01-02
    provides: Supabase words table schema with vector(1024) embedding column and word_category enum
provides:
  - supabase/seed/word-list.ts with 100 curated business/tech jargon terms
  - supabase/seed/seed.ts idempotent seed script (Claude content + Voyage AI embeddings)
  - Runnable script that populates the words table with production-ready day-1 content
affects: [02, 03, 04, 05]

# Tech tracking
tech-stack:
  added:
    - voyageai (voyage-3.5 model, 1024-dim embeddings for words table)
  patterns:
    - Idempotency by slug: select-before-insert prevents duplicate rows on re-run
    - Rate limiting: 1-second delay between Claude API calls to avoid rate limit errors
    - pgvector insert format: embedding passed as '[1,2,3,...]' string (not array) for Supabase
    - Category validation: Claude-returned category validated against enum; falls back to 'Other'
    - Date assignment: WORD_LIST.length dates spread backwards from today, one per word

key-files:
  created:
    - supabase/seed/word-list.ts
    - supabase/seed/seed.ts
  modified: []

key-decisions:
  - "Slug-based idempotency: check for existing slug before insert — re-running is safe, existing rows are skipped"
  - "Voyage AI embed text = title + definition + exec_summary — consistent with Phase 5 dedup query pattern"
  - "1-second rate limit between Claude calls — balances throughput vs. API rate limit risk for 100-word batch"
  - "Category validated post-parse: Claude may hallucinate invalid enum values; fallback to 'Other' prevents DB errors"

requirements-completed: [PIPE-03]

# Metrics
duration: 1min
completed: 2026-03-13
---

# Phase 1 Plan 4: Seed Script Summary

**Idempotent seed script using Claude (claude-opus-4-5) for full editorial content and Voyage AI (voyage-3.5) for 1024-dim embeddings, populating the words table with 100 curated business/tech jargon terms**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-13T18:43:05Z
- **Completed:** 2026-03-13T18:44:08Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- `supabase/seed/word-list.ts` created with exactly 100 business/tech jargon terms across 8 categories (Strategy 15, Tech 20, Finance 12, HR 10, Operations 12, Marketing 12, Legal 8, Other 11)
- `supabase/seed/seed.ts` created as idempotent script: calls Claude for content, Voyage AI for embeddings, upserts to Supabase via service role key
- `npx tsc --noEmit` passes cleanly with no type errors
- Word count verified: `WORD_LIST.length === 100`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create word list and seed script** - `0c72eb0` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `supabase/seed/word-list.ts` - 100 curated jargon terms, 8 categories, exported as `WORD_LIST: string[]`
- `supabase/seed/seed.ts` - Full seed script: Anthropic content generation, Voyage AI embedding, Supabase insert with idempotency guard

## Decisions Made
- **Slug-based idempotency:** Before inserting, the script queries `from('words').select('id').eq('slug', slug).maybeSingle()`. If a row exists, it logs `[SKIP]` and returns. This makes the script safe to re-run after partial failures or interruptions.
- **Voyage embed text format:** Title + definition + exec_summary concatenated as the embedding input. This matches the Phase 5 semantic dedup query pattern so similarity scores are comparable.
- **Category fallback to 'Other':** Claude may return a category string that doesn't match the enum exactly. The script validates against `VALID_CATEGORIES` array and defaults to `'Other'` to prevent Supabase enum constraint violations.

## Usage

To run the seed script (requires `.env.local` with valid credentials):

```bash
npx tsx supabase/seed/seed.ts
```

Approximate runtime: 2-3 minutes for 100 words (1-second delay between Claude calls).

The script is safe to re-run — existing words (matched by slug) are skipped.

## Deviations from Plan

None - plan executed exactly as written. All dependencies (`@anthropic-ai/sdk`, `voyageai`, `slugify`) were already present in `package.json` from earlier phases.

## User Setup Required

Before running the seed script, ensure `.env.local` contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (not the anon key — service role bypasses RLS for writes)
- `ANTHROPIC_API_KEY`
- `VOYAGE_API_KEY`

The database migration from Plan 02 must already be applied to the Supabase project.

## Self-Check: PASSED

- supabase/seed/word-list.ts: FOUND
- supabase/seed/seed.ts: FOUND
- .planning/phases/01-foundation/01-04-SUMMARY.md: FOUND (this file)
- Commit 0c72eb0 (Task 1): FOUND
- WORD_LIST.length === 100: VERIFIED

---
*Phase: 01-foundation*
*Completed: 2026-03-13*
