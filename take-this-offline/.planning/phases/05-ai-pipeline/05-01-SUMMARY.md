---
phase: 05-ai-pipeline
plan: 01
subsystem: pipeline
tags: [tdd, pipeline, vitest, pgvector, supabase-rpc]
dependency_graph:
  requires: []
  provides: [src/lib/pipeline.ts, supabase/migrations/20260315000000_add_match_similar_words.sql]
  affects: [src/app/api/cron/generate-word/route.ts]
tech_stack:
  added: []
  patterns:
    - Injectable fetch parameter for testability (fetchHNSignals)
    - Supabase RPC mock pattern for unit testing (checkDuplicate)
    - Cosine distance dedup via match_similar_words Postgres RPC
key_files:
  created:
    - tests/pipeline/pipeline.test.ts
    - supabase/migrations/20260315000000_add_match_similar_words.sql
    - src/lib/pipeline.ts
  modified: []
decisions:
  - DEDUP_THRESHOLD set to 0.15 (cosine distance, not similarity) per research recommendation
  - fetchHNSignals accepts optional fetch param for testability — global fetch used in production
  - checkDuplicate returns false (allow insert) on RPC error — safe default, avoids blocking on DB issues
metrics:
  duration: 2 min
  completed: 2026-03-15
  tasks_completed: 2
  files_changed: 3
---

# Phase 5 Plan 01: Pipeline Helper Library Summary

**One-liner:** Three injectable pure helpers (buildPrompt, fetchHNSignals, checkDuplicate) plus cosine-distance SQL RPC, backed by 9 passing Vitest unit tests using TDD RED-GREEN pattern.

## What Was Built

The plan established the testable foundation for the daily word generation pipeline:

1. **`tests/pipeline/pipeline.test.ts`** — 9 unit tests covering all three helper functions with mocked dependencies. Covers: prompt construction with/without headlines and exclusion lists, HN fetch happy path and error paths, duplicate detection true/false/error cases.

2. **`supabase/migrations/20260315000000_add_match_similar_words.sql`** — Postgres RPC function using pgvector's `<=>` cosine distance operator. Returns rows where distance < threshold, ordered by ascending distance, limited to 1 (nearest neighbor check only).

3. **`src/lib/pipeline.ts`** — Five exports: `buildPrompt`, `fetchHNSignals`, `checkDuplicate`, `DEDUP_THRESHOLD` (0.15), and `WORD_CONTENT_SCHEMA` (JSON schema constant for Anthropic structured outputs). Each function is designed for testability via dependency injection.

## TDD Flow

- **RED:** Tests written first against non-existent `@/lib/pipeline` — all 9 failed with "Cannot find package" error
- **GREEN:** `src/lib/pipeline.ts` written to exact spec — all 9 pass

## Deviations from Plan

None — plan executed exactly as written.

## Pre-existing Issues (Out of Scope)

4 tests in `tests/seed/` have been failing since Phase 1 Plan 1 with `expect(false).toBe(true)` placeholder assertions. These stubs predate this plan and are not caused by any changes here. Logged for future resolution.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| c049a2d | test | Add failing tests and SQL migration for pipeline helpers (RED) |
| baf52a5 | feat | Implement pipeline helper library — all 9 tests GREEN |

## Self-Check: PASSED

- tests/pipeline/pipeline.test.ts: FOUND
- supabase/migrations/20260315000000_add_match_similar_words.sql: FOUND
- src/lib/pipeline.ts: FOUND
- Commit c049a2d: FOUND
- Commit baf52a5: FOUND
