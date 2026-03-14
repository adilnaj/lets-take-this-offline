---
phase: 03-activities-and-gamification
plan: 01
subsystem: gamification-data-layer
tags: [database, typescript, supabase, rls, gamification]
dependency_graph:
  requires: []
  provides: [gamification-schema, database-types, activities-helpers]
  affects: [03-02, 03-03, 03-04, 03-05, 03-06]
tech_stack:
  added: []
  patterns:
    - Supabase RLS with authenticated-only policies (same pattern as initial schema)
    - Server-side helper functions using createClient() from @/lib/supabase/server
    - TypeScript hand-authored types matching SQL schema exactly
key_files:
  created:
    - supabase/migrations/20260314000000_gamification_schema.sql
    - src/lib/activities.ts
  modified:
    - src/lib/types/database.types.ts
decisions:
  - UNIQUE constraint on user_activity(user_id, word_id, activity_type, completed_date) is the idempotency backstop for points — DB enforces it atomically
  - computeStreak accepts SupabaseClient as param (not createClient internally) for route handler reuse
  - getDisstractors accepts SupabaseClient as param to avoid creating redundant server clients in route handlers
  - deriveMasteryLevel thresholds: 0=seen, 1-3=learning, 4+=mastered (matches 4 activities per word per day)
  - Streak calculation uses UTC dates consistently with rest of schema (timezone-aware streaks deferred to v2)
metrics:
  duration: "2 minutes"
  completed_date: "2026-03-14"
  tasks_completed: 2
  files_changed: 3
---

# Phase 3 Plan 1: Gamification Schema and Activities Helpers Summary

**One-liner:** Four-table Supabase gamification schema with RLS and TypeScript types, plus server-side read helpers for home page pre-fetch.

## What Was Built

### Task 1: Gamification Schema Migration

Created `supabase/migrations/20260314000000_gamification_schema.sql` with four tables:

- `user_activity` — one row per (user, word, activity_type, day); UNIQUE constraint prevents double-awarding points; index on (user_id, completed_date)
- `user_stats` — one row per user with total_points, streak_count, last_active_date running totals
- `user_favorites` — composite primary key (user_id, word_id); index on user_id
- `word_mastery` — mastery_level check constraint ('seen'|'learning'|'mastered'); index on user_id

All four tables have RLS enabled with a single `for all to authenticated` policy restricting access to the row owner via `auth.uid() = user_id`.

### Task 2: TypeScript Types and Activities Helpers

Extended `src/lib/types/database.types.ts` with Row/Insert/Update shapes for all four new tables, following the exact same pattern as the existing `words` table.

Created `src/lib/activities.ts` exporting:

- `POINTS` — `{ flashcard: 10, fill_blank: 10, sentence: 10, context_match: 10, all_complete_bonus: 20 }`
- `deriveMasteryLevel(count)` — pure function, no DB; 0=seen, 1-3=learning, 4+=mastered
- `generateFillBlank(word)` — pure function; case-insensitive first-occurrence replacement with `___________`
- `getCompletionsToday(userId, wordId)` — queries user_activity for today's activity_type values
- `getUserStats(userId)` — queries user_stats, returns null if no row
- `getDisstractors(word, supabase)` — same-category definitions from different words; takes SupabaseClient param
- `computeStreak(userId, supabase)` — consecutive active days ending today or yesterday; takes SupabaseClient param

## Verification Results

- `npx tsc --noEmit` — no errors in database.types.ts or activities.ts (pre-existing stub errors in tests/profile/*.spec.ts are unrelated Playwright test.todo type issues from plan 02, logged to deferred items)
- `npx vitest run tests/activities/ tests/gamification/` — 53 todo stubs pass trivially
- Migration file exists at correct path
- All 7 required exports confirmed present in activities.ts

## Deviations from Plan

None — plan executed exactly as written.

## Deferred Items

Pre-existing TypeScript errors in `tests/profile/favorites.spec.ts` and `tests/profile/history.spec.ts`: Playwright's `TestType` does not expose a `.todo` method at the type level, but the test stubs use `test.todo(...)`. These existed before this plan and are out of scope. They will need fixing when plan 02 test stubs are fleshed out.

## Self-Check: PASSED

All created files exist on disk. Both task commits verified in git log.
