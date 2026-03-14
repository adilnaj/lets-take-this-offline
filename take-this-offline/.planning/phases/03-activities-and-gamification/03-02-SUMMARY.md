---
phase: 03-activities-and-gamification
plan: 02
subsystem: testing
tags: [vitest, playwright, tdd, stubs, activities, gamification]

# Dependency graph
requires:
  - phase: 03-activities-and-gamification
    provides: Gamification schema migration (plan 03-01) — test stubs reference DB-backed behaviors
provides:
  - 9 Vitest unit test stub files for ACTV-01 through ACTV-05 and GAME-01 through GAME-06
  - 2 Playwright E2E spec stub files for GAME-04 and GAME-05
  - All 11 test files runnable without import errors (todo stubs only)
affects: [03-03-PLAN, 03-04-PLAN, 03-05-PLAN, 03-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nyquist validation: create all test stubs before any implementation begins"
    - "it.todo() for Vitest unit stubs; test.todo() for Playwright E2E stubs"
    - "Test stubs have no implementation imports — resolves after implementation plans"

key-files:
  created:
    - tests/activities/flashcard.test.ts
    - tests/activities/fill-blank.test.ts
    - tests/activities/sentence-feedback.test.ts
    - tests/activities/context-match.test.ts
    - tests/activities/completion-banner.test.ts
    - tests/gamification/points.test.ts
    - tests/gamification/badge.test.ts
    - tests/gamification/streak.test.ts
    - tests/gamification/mastery.test.ts
    - tests/profile/favorites.spec.ts
    - tests/profile/history.spec.ts
  modified: []

key-decisions:
  - "Test stubs use only it.todo() / test.todo() with no implementation imports — downstream implementation plans turn stubs green"
  - "Playwright stubs placed in tests/profile/ (not tests/e2e/) — keeps profile-related E2E specs co-located by domain"

patterns-established:
  - "Wave-0 stubs: all test files created before implementation to prevent 'file not found' errors in verify commands"
  - "Vitest stubs: describe block names the behavior; todo strings describe expected behavior precisely enough for implementation"

requirements-completed: [ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 3 Plan 02: Wave-0 Test Stubs Summary

**11 Vitest and Playwright todo-stub test files covering all activity and gamification requirements (ACTV-01 through ACTV-05, GAME-01 through GAME-06)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T20:17:59Z
- **Completed:** 2026-03-14T20:21:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Created 5 Vitest unit test stub files for all activity components (flashcard, fill-blank, sentence-feedback, context-match, completion-banner)
- Created 4 Vitest unit test stub files for all gamification logic (points, badge, streak, mastery)
- Created 2 Playwright E2E spec stub files for profile features (favorites, activity history)
- All 11 files run cleanly under `npx vitest run tests/activities/ tests/gamification/` — 53 todo tests, 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Activity unit test stubs (ACTV-01 through ACTV-05)** - `971120e` (test)
2. **Task 2: Gamification unit stubs and Playwright E2E stubs (GAME-01 through GAME-06)** - `6fc5848` (test)

## Files Created/Modified

- `tests/activities/flashcard.test.ts` - 5 todo stubs for FlashcardActivity (ACTV-01)
- `tests/activities/fill-blank.test.ts` - 8 todo stubs for generateFillBlank and FillBlankActivity (ACTV-02)
- `tests/activities/sentence-feedback.test.ts` - 9 todo stubs for POST /api/sentence-feedback and SentenceActivity (ACTV-03)
- `tests/activities/context-match.test.ts` - 6 todo stubs for ContextMatchActivity (ACTV-04)
- `tests/activities/completion-banner.test.ts` - 5 todo stubs for CompletionBanner (ACTV-05)
- `tests/gamification/points.test.ts` - 6 todo stubs for Points logic (GAME-01)
- `tests/gamification/badge.test.ts` - 3 todo stubs for Daily Badge (GAME-02)
- `tests/gamification/streak.test.ts` - 6 todo stubs for computeStreak (GAME-03)
- `tests/gamification/mastery.test.ts` - 5 todo stubs for deriveMasteryLevel (GAME-06)
- `tests/profile/favorites.spec.ts` - 5 Playwright todo stubs for Favorites (GAME-04)
- `tests/profile/history.spec.ts` - 4 Playwright todo stubs for Activity History (GAME-05)

## Decisions Made

- Test stubs use only `it.todo()` / `test.todo()` with no implementation imports — this prevents import resolution errors since implementation files do not exist yet. Downstream plans (03-05, 03-06) import from implementation files and turn these stubs green.
- Playwright stubs placed in `tests/profile/` rather than a generic `tests/e2e/` directory — keeps profile-related E2E specs co-located by domain feature.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 11 test stub files exist at expected paths and are referenced by downstream plan `<verify>` blocks
- Running `npx vitest run tests/activities/ tests/gamification/` exits cleanly with 53 todo tests
- Playwright stubs at `tests/profile/favorites.spec.ts` and `tests/profile/history.spec.ts` are ready for plan 03-06 to implement against
- No blockers for proceeding to plan 03-03 (activity components implementation)

---
*Phase: 03-activities-and-gamification*
*Completed: 2026-03-14*

## Self-Check: PASSED

- All 11 test files found at expected paths
- Commits 971120e and 6fc5848 verified in git log
