---
phase: 03-activities-and-gamification
plan: 06
subsystem: ui
tags: [react, nextjs, client-components, server-components, gamification, optimistic-ui]

requires:
  - phase: 03-01
    provides: [activities-helpers, getCompletionsToday, getUserStats, getDisstractors]
  - phase: 03-03
    provides: [flashcard-activity, fill-blank-activity, context-match-activity]
  - phase: 03-04
    provides: [activity-completion-api]
  - phase: 03-05
    provides: [sentence-activity]
provides:
  - PracticeSection client orchestrator wiring all 4 activity components
  - StreakCounter server component with flame icon
  - CompletionBanner client component for all-complete state
  - Home page updated with server-side auth pre-fetch and Practice Today section
affects: [03-07]

tech-stack:
  added: []
  patterns:
    - Server component pre-fetches auth + data, passes as props to client orchestrator
    - Optimistic state updates with revert-on-error for activity completions
    - Derived allCompleted state from Set of activity type strings
    - Anonymous user tracking (local Set only, no API call)

key-files:
  created:
    - src/components/practice-section.tsx
    - src/components/streak-counter.tsx
    - src/components/completion-banner.tsx
  modified:
    - src/app/page.tsx
    - tests/gamification/streak.test.ts

key-decisions:
  - "Home page remains a server component — createClient() and auth.getUser() called in page.tsx, not in PracticeSection"
  - "Anonymous users track completions locally via useState Set (no API call) — no 401 risk, no server state for anon"
  - "Optimistic update reverts on any non-ok response or network error — no stuck state possible"
  - "StreakCounter is a plain server component (no 'use client') — accepts streakCount prop, renders based on > 0 check"

patterns-established:
  - "Server-to-client prop drilling: server page fetches all data, passes to single 'use client' orchestrator"
  - "Optimistic UI: setCompletions optimistically, then fetch, revert on error"

requirements-completed: [ACTV-05, GAME-01, GAME-02, GAME-03]

duration: 2min
completed: 2026-03-14
---

# Phase 3 Plan 6: Home Page Integration Summary

**PracticeSection client orchestrator wiring all 4 activity cards with optimistic completion state, StreakCounter, CompletionBanner, and server-side auth pre-fetch in page.tsx.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T16:25:48Z
- **Completed:** 2026-03-14T16:27:48Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- PracticeSection 'use client' component orchestrates all 4 activities, manages optimistic Set state, calls /api/activity/complete per activity, and reverts on error
- StreakCounter shows flame + "{n} day streak" for streak > 0; encouragement text for 0
- CompletionBanner appears (above activity grid) when all 4 activities are in the completions Set
- page.tsx updated: createClient() + auth.getUser() + getCompletionsToday + getUserStats + getDisstractors all resolved server-side before rendering

## Task Commits

1. **Task 1: StreakCounter and CompletionBanner components** - `92ce454` (feat)
2. **Task 2: PracticeSection orchestrator and home page wiring** - `7ab35b3` (feat)

## Files Created/Modified

- `src/components/practice-section.tsx` - Client orchestrator for 4 activity cards with optimistic state
- `src/components/streak-counter.tsx` - Flame icon + streak count display (server component)
- `src/components/completion-banner.tsx` - Green card with CheckCircle2 + Daily Badge shown on all-complete
- `src/app/page.tsx` - Updated to pre-fetch auth, completions, stats, distractors server-side; renders PracticeSection below WordCard
- `tests/gamification/streak.test.ts` - Added one real assertion for streak display logic per plan spec

## Decisions Made

- Home page remains a server component: `createClient()` and `auth.getUser()` live in `page.tsx`, not inside `PracticeSection`. This keeps auth pre-fetching server-side and avoids making the home page a client component.
- Anonymous users are tracked with local Set state only — no API call, no 401 error. When user is null, `handleComplete` just calls `setCompletions` without fetching.
- StreakCounter implemented as a plain server-compatible component (no `'use client'` directive) since it only receives props and renders — it is passed streakCount from PracticeSection via props.
- `SiteHeader` left without `user` prop as noted in the plan — plan 07 will add user prop to SiteHeader.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in `tests/profile/favorites.spec.ts` and `tests/profile/history.spec.ts` (Playwright `.todo` type issue) — previously documented in 03-01-SUMMARY.md as deferred, confirmed still out of scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PracticeSection fully wired: all 4 activities visible on home page
- Completion banner triggers correctly when all 4 activities in completions Set
- Streak and points update from API response after each activity
- Plan 07 (SiteHeader / profile) can now add user prop to SiteHeader and implement profile UI

---
*Phase: 03-activities-and-gamification*
*Completed: 2026-03-14*

## Self-Check: PASSED

All created files exist on disk. Both task commits (92ce454, 7ab35b3) verified in git log.
