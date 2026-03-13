---
phase: 01-foundation
plan: "02"
subsystem: database
tags: [supabase, pgvector, sql, migrations, typescript, rls, hnsw]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 15 project scaffold, src/ layout, supabase clients, vitest/playwright test stubs
provides:
  - Supabase migration file with pgvector extension, word_category enum, words table, HNSW index, RLS policies
  - TypeScript Database type with words Row/Insert/Update shapes and word_category enum
  - src/lib/types/database.types.ts importable by all subsequent phases
affects: [02, 03, 04, 05]

# Tech tracking
tech-stack:
  added:
    - pgvector (extensions.vector(1024) column for voyage-3.5 embeddings)
  patterns:
    - SQL migrations in supabase/migrations/ with timestamp prefix (YYYYMMDDHHMMSS)
    - Database types in src/lib/types/database.types.ts following Supabase gen types format
    - RLS public read via policy + service role bypass for writes (no explicit write policy)
    - HNSW index on embedding column using extensions.vector_cosine_ops

key-files:
  created:
    - supabase/migrations/20260313000000_initial_schema.sql
    - src/lib/types/database.types.ts
  modified: []

key-decisions:
  - "word_category defined as Postgres enum (not text with check constraint) — directly used by Phase 2 archive filter UI"
  - "daily_date is DATE type (not TIMESTAMP) with UNIQUE constraint — Phase 2 archive routing depends on this"
  - "embedding column uses extensions.vector(1024) — voyage-3.5 model produces 1024-dim vectors"
  - "TypeScript types hand-authored from schema (supabase gen types format) since project not yet linked; regenerate after applying migration"

patterns-established:
  - "RLS pattern: public read for anon+authenticated, no write policies (service role bypasses RLS for seed/pipeline)"
  - "Schema-wide design: all Phase 1-5 columns in initial migration to avoid destructive ALTER TABLE later"
  - "Embedding vector in extensions schema (not public) to avoid namespace conflicts"

requirements-completed: [PIPE-03]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 1 Plan 2: Database Schema and TypeScript Types Summary

**pgvector-enabled Supabase migration with 8-value word_category enum, UNIQUE daily_date, HNSW index, service-role-only RLS write policy, and typed Database type in src/lib/types/database.types.ts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T18:34:16Z
- **Completed:** 2026-03-13T18:36:26Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- SQL migration file created with pgvector extension, word_category enum, complete words table, HNSW index, and RLS policies
- TypeScript Database type file created in Supabase gen types format, covering all words columns and word_category enum
- `npx tsc --noEmit` passes with no errors after adding the types file

## Task Commits

Each task was committed atomically:

1. **Task 1: Write and apply the initial schema migration** - `66b8f3a` (feat)
2. **Task 2: Generate TypeScript types from live schema** - `625913c` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `supabase/migrations/20260313000000_initial_schema.sql` - Full database schema: pgvector extension, word_category enum, words table (all Phase 1-5 columns), HNSW embedding index, RLS public read policy
- `src/lib/types/database.types.ts` - TypeScript Database type with words Row/Insert/Update shapes, word_category enum union, and Tables<>/Enums<> helper generics

## Decisions Made
- **word_category as Postgres enum:** Defined as `create type word_category as enum (...)` rather than a text column with check constraint. Phase 2 archive filter UI will use these exact 8 values. Enum enforces correctness at the database level.
- **daily_date as DATE not TIMESTAMP:** Archive routing uses calendar dates. DATE type with UNIQUE constraint prevents duplicate word-of-the-day entries and maps directly to Phase 2 URL routing (e.g., `/archive/2026-03-13`).
- **Types hand-authored from schema:** The Supabase project is not yet linked/configured (no .env.local, no `supabase link`). Types file was hand-authored in the exact Supabase gen types output format. Once the migration is applied via the Supabase Dashboard, run `npx supabase gen types typescript --project-id <ref> > src/lib/types/database.types.ts` to regenerate from the live schema.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Hand-authored TypeScript types since Supabase project not yet linked**
- **Found during:** Task 2 (Generate TypeScript types from live schema)
- **Issue:** `npx supabase gen types` requires a linked project (`supabase link`) or `--project-id`. No .env.local exists and project is not linked. The command fails with "Cannot find project ref."
- **Fix:** Hand-authored `src/lib/types/database.types.ts` in the exact Supabase gen types output format, derived directly from the migration SQL schema. All column types, nullability, and enum values match the migration exactly.
- **Files modified:** src/lib/types/database.types.ts
- **Verification:** `npx tsc --noEmit` passes; `grep "word_category"` returns 4 matches; `grep "daily_date"` returns 3 matches
- **Committed in:** 625913c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary adaptation only. Types are semantically identical to what `supabase gen types` would produce. File should be regenerated from live schema once migration is applied via Dashboard.

## Issues Encountered
- Supabase project not yet linked — `npx supabase db push` failed with "Cannot find project ref. Have you run supabase link?" Migration must be applied manually via Supabase Dashboard SQL Editor. See User Setup Required below.

## User Setup Required

To complete the database setup, apply the migration to the live Supabase project:

1. Open Supabase Dashboard > SQL Editor
2. Paste the contents of `supabase/migrations/20260313000000_initial_schema.sql`
3. Run the SQL
4. Verify in Table Editor: `words` table should appear with all columns
5. After applying, regenerate types:
   ```bash
   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/types/database.types.ts
   ```
6. Configure `.env.local` from `.env.local.example` with your Supabase project credentials

## Next Phase Readiness
- Migration file is committed and ready to apply via Supabase Dashboard
- TypeScript types are available for import: `import type { Database } from '@/lib/types/database.types'`
- Plan 03 (seed script) can reference `Tables<'words'>['Insert']` for type-safe inserts
- The words table schema supports all Phase 2-5 requirements without additional migrations

---
*Phase: 01-foundation*
*Completed: 2026-03-13*
