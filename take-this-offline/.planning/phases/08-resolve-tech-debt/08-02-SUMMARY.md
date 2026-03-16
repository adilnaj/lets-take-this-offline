---
phase: 08-resolve-tech-debt
plan: "02"
subsystem: types
tags: [typescript, supabase, rpc, database-types]
dependency_graph:
  requires: []
  provides: [match_similar_words-rpc-types]
  affects: [src/lib/pipeline.ts]
tech_stack:
  added: []
  patterns: [supabase-rpc-function-typing]
key_files:
  modified:
    - src/lib/types/database.types.ts
decisions:
  - "match_similar_words Args: query_embedding typed as string (Supabase serialises vector over wire), similarity_threshold as number"
  - "Returns typed as array of {id: string, title: string, distance: number} matching RETURNS TABLE SQL signature"
metrics:
  duration: "2 min"
  completed_date: "2026-03-15"
  tasks_completed: 1
  files_modified: 1
---

# Phase 08 Plan 02: Add match_similar_words RPC Type to database.types.ts Summary

**One-liner:** Typed the match_similar_words RPC in database.types.ts so supabase.rpc() calls in pipeline.ts have full TypeScript coverage with compile-time parameter name checking.

## What Was Built

The `Functions` block in `src/lib/types/database.types.ts` was updated from the `[_ in never]: never` placeholder to a fully typed `match_similar_words` entry matching the SQL function signature in `supabase/migrations/20260315000000_add_match_similar_words.sql`.

The function was added in Phase 5 but was never reflected in the hand-authored TypeScript types, leaving the `supabase.rpc('match_similar_words', {...})` call in `pipeline.ts` untyped — TypeScript would silently accept wrong parameter names (e.g. `queryEmbedding` instead of `query_embedding`). After this change, incorrect parameter names produce a compile error.

Type mapping applied:
- `query_embedding extensions.vector(1024)` → `string` (Supabase serialises vectors as strings over the wire)
- `similarity_threshold float` → `number`
- `returns table(id uuid, title text, distance float)` → `{ id: string; title: string; distance: number }[]`

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add match_similar_words to Functions section | a9f526f | src/lib/types/database.types.ts |

## Verification

- `grep "match_similar_words" src/lib/types/database.types.ts` returns the Functions entry
- The `[_ in never]: never` placeholder in Functions is gone
- `npx tsc --noEmit` exits 0 (no new type errors introduced)

## Decisions Made

- `query_embedding` typed as `string`: Supabase JS client serialises `vector` columns as strings over the REST/PostgREST wire protocol — consistent with the existing `embedding: string | null` column type in the `words` table row.
- `Returns` is an array type (`{ ... }[]`): the SQL function uses `RETURNS TABLE`, which always returns a set (0 or more rows) rather than a scalar.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- src/lib/types/database.types.ts: FOUND and updated
- Commit a9f526f: confirmed
- `npx tsc --noEmit`: exits 0
