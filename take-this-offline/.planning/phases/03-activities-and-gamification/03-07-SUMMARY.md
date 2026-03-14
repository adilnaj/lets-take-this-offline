---
phase: 03-activities-and-gamification
plan: 07
subsystem: ui
tags: [react, nextjs, server-components, client-components, favorites, gamification, profile]

requires:
  - phase: 03-04
    provides: [favorites-api, /api/favorites POST endpoint]
  - phase: 03-06
    provides: [PracticeSection, home-page-auth-prefetch, SiteHeader without user prop]

provides:
  - FavoriteButton client component with optimistic toggle for word pages
  - Updated SiteHeader with conditional Profile nav link for logged-in users
  - /profile page showing stats, favorites list, and activity history with mastery badges
  - Word permalink page updated with auth check and FavoriteButton
affects: [04-push-notifications, 05-ai-pipeline]

tech-stack:
  added: []
  patterns:
    - Server component fetches auth + data, passes to client FavoriteButton as initialFavorited prop
    - Optimistic toggle with revert-on-error pattern in FavoriteButton
    - Supabase join result cast via `as unknown as Shape` to satisfy TypeScript strict checking

key-files:
  created:
    - src/components/favorite-button.tsx
    - src/app/profile/page.tsx
  modified:
    - src/components/site-header.tsx
    - src/app/word/[slug]/page.tsx
    - src/app/page.tsx
    - tests/profile/favorites.spec.ts
    - tests/profile/history.spec.ts

key-decisions:
  - "SiteHeader user prop is optional (user?: User | null) — existing callers without prop still work at type level"
  - "FavoriteButton placed above WordCard in word page with flex justify-between layout"
  - "Supabase join returns array type in generated types but is actually a single object — cast via unknown to correct shape"
  - "Profile page key for mastery list uses slug+index to handle potential duplicates from DB"

patterns-established:
  - "Supabase join cast pattern: (row.words as unknown as WordShape) for many-to-one joins"
  - "FavoriteButton: optimistic state toggle with revert on fetch error"

requirements-completed: [GAME-04, GAME-05, GAME-06]

duration: 5min
completed: 2026-03-14
---

# Phase 3 Plan 7: Profile Page and Favorites Summary

**Profile page with stats/favorites/mastery history, FavoriteButton with optimistic toggle, and SiteHeader Profile link — completing the GAME-04/05/06 user-facing surfaces.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-14T20:30:00Z
- **Completed:** 2026-03-14T20:35:00Z
- **Tasks:** 2 (+ checkpoint awaiting human verification)
- **Files modified:** 7

## Accomplishments

- FavoriteButton renders Heart icon (filled red when favorited), calls POST /api/favorites, reverts on error
- SiteHeader updated with optional `user` prop — shows "Profile" text link when user is logged in
- /profile page redirects anonymous users to /auth/sign-in, shows total_points + streak_count + favorites list + mastery history
- Word permalink page fetches auth + favorites status server-side, renders FavoriteButton for logged-in users
- Playwright test stubs updated with clearer todo descriptions

## Task Commits

1. **Task 1: FavoriteButton, updated SiteHeader, and word page integration** - `094fb86` (feat)
2. **Task 2: /profile page** - `745bbf1` (feat)

## Files Created/Modified

- `src/components/favorite-button.tsx` - Client component with optimistic Heart toggle, calls /api/favorites
- `src/app/profile/page.tsx` - Server page: redirects anon, shows stats/favorites/mastery with mastery-colored badges
- `src/components/site-header.tsx` - Updated with optional user prop, conditional Profile nav link
- `src/app/word/[slug]/page.tsx` - Added auth fetch, favorites check, FavoriteButton render
- `src/app/page.tsx` - Updated both SiteHeader calls to pass user prop
- `tests/profile/favorites.spec.ts` - Clearer todo descriptions for GAME-04 scenarios
- `tests/profile/history.spec.ts` - Clearer todo descriptions for GAME-05 scenarios

## Decisions Made

- SiteHeader `user` prop is optional so all existing call sites (that don't pass it) remain type-safe without breaking.
- Supabase join results (user_favorites -> words, word_mastery -> words) typed via `as unknown as Shape` since the generated types return array but the join is many-to-one.
- FavoriteButton placed in an action bar above WordCard in the word page layout.
- Profile page mastery list key uses `${w.slug}-mastery-${idx}` to handle any edge-case duplicates.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript cast for Supabase join result**
- **Found during:** Task 2 (/profile page)
- **Issue:** `fav.words as { ... }` and `row.words as { ... }` caused TS2352 — generated types infer array for join columns but the actual shape is a single object or null
- **Fix:** Changed to `as unknown as Shape` as specified in the plan's note
- **Files modified:** src/app/profile/page.tsx
- **Verification:** `npx tsc --noEmit` shows no application errors
- **Committed in:** 745bbf1 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - TypeScript cast per plan note)
**Impact on plan:** Minimal — the fix was explicitly anticipated in the plan's implementation note.

## Issues Encountered

Pre-existing Playwright `.todo` TypeScript errors in `tests/profile/favorites.spec.ts` and `tests/profile/history.spec.ts` — these are a Playwright version incompatibility documented in 03-01-SUMMARY.md and 03-06-SUMMARY.md as out of scope. Application TypeScript compiles clean.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 all 7 plans complete: activities, gamification, profile, favorites, mastery all implemented
- Checkpoint 3 (human verification) awaiting approval of full interactive flow
- Phase 4 (push notifications) can begin after checkpoint approval

---
*Phase: 03-activities-and-gamification*
*Completed: 2026-03-14*
