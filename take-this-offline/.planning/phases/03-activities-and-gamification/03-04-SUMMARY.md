---
phase: 03-activities-and-gamification
plan: 04
subsystem: api
tags: [nextjs, supabase, route-handlers, gamification, points, favorites, tdd]

requires:
  - phase: 03-01
    provides: [activities-helpers, gamification-schema, POINTS constant, computeStreak, deriveMasteryLevel]

provides:
  - POST /api/activity/complete — idempotent completion recording with points, streak, mastery upsert
  - POST /api/favorites — toggle favorite status with insert/delete pattern

affects: [03-05, 03-07]

tech-stack:
  added: []
  patterns:
    - ignoreDuplicates upsert on UNIQUE constraint for idempotent point award
    - getUser() server-side auth validation in route handlers (not getSession())
    - Toggle pattern: select + conditional insert/delete for favorites

key-files:
  created:
    - src/app/api/activity/complete/route.ts
    - src/app/api/favorites/route.ts
  modified:
    - tests/gamification/points.test.ts
    - vitest.config.ts

key-decisions:
  - "vitest.config.ts updated with @/ path alias so tests can import from @/lib/activities"
  - "isNewCompletion derived from upsert count: ignoreDuplicates returns count=0 on duplicate, count=1 on insert"
  - "Bonus idempotency: bonusAwarded only fires when isNewCompletion && allComplete && completedTypes.size===4 — second call for same activity has isNewCompletion=false"

patterns-established:
  - "Route handler auth pattern: createClient() → auth.getUser() → 401 guard"
  - "Idempotent upsert: onConflict + ignoreDuplicates: true + count: exact to detect new vs duplicate row"

requirements-completed: [GAME-01, GAME-04]

duration: 4min
completed: 2026-03-14
---

# Phase 3 Plan 4: Activity Completion and Favorites Route Handlers Summary

**Two Next.js App Router route handlers: idempotent activity-completion with points/streak/mastery upsert, and toggle-favorites via insert/delete pattern.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T16:22:00Z
- **Completed:** 2026-03-14T16:23:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- POST /api/activity/complete records completions idempotently via UNIQUE constraint + ignoreDuplicates, awards activity points and all_complete_bonus, updates user_stats and word_mastery
- POST /api/favorites toggles word favorite status (insert if absent, delete if present), returns `{ favorited: boolean }`
- Updated points.test.ts with 3 green unit tests for POINTS constant and added @/ path alias to vitest.config.ts

## Task Commits

1. **Task 1: POST /api/activity/complete route handler** - `c7dfa9d` (feat)
2. **Task 2: POST /api/favorites toggle route handler** - `a336715` (feat)

## Files Created/Modified

- `src/app/api/activity/complete/route.ts` - Activity completion handler with idempotent points award, streak/mastery upsert
- `src/app/api/favorites/route.ts` - Favorites toggle handler returning `{ favorited: boolean }`
- `tests/gamification/points.test.ts` - 3 unit tests for POINTS constant (all green)
- `vitest.config.ts` - Added @/ path alias to resolve `@/lib/activities` imports in tests

## Decisions Made

- Added `@/` path alias to vitest.config.ts (Rule 3 auto-fix: tests importing `@/lib/activities` would fail without it since vitest runs outside Next.js bundler)
- `isNewCompletion` detection: `ignoreDuplicates: true` combined with `count: 'exact'` returns count=0 for duplicates, count=1 for new inserts
- Bonus idempotency handled entirely by `isNewCompletion` flag — if the same activity is submitted twice, the second call produces `isNewCompletion = false`, so no bonus is awarded twice regardless of `allComplete` state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @/ path alias to vitest.config.ts**
- **Found during:** Task 1 (TDD RED phase — running points.test.ts)
- **Issue:** Test imports `@/lib/activities` but vitest.config.ts had no path alias; vitest resolves outside Next.js bundler so alias must be explicit
- **Fix:** Added `resolve.alias` with `path.resolve(__dirname, './src')` to vitest.config.ts
- **Files modified:** vitest.config.ts
- **Verification:** `npx vitest run tests/gamification/points.test.ts` — 3 tests pass
- **Committed in:** c7dfa9d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for test execution — no scope creep.

## Issues Encountered

Pre-existing TypeScript errors in `tests/profile/favorites.spec.ts` and `tests/profile/history.spec.ts` (Playwright `.todo` type issue) — documented in 03-01-SUMMARY.md as deferred, confirmed still out of scope for this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/api/activity/complete` API contract established and ready for plan 05 (PracticeSection) to call
- `/api/favorites` API contract established and ready for plan 07 (FavoriteButton) to call
- Both routes validate session with `getUser()` (not `getSession()`) per established project pattern

---
*Phase: 03-activities-and-gamification*
*Completed: 2026-03-14*
