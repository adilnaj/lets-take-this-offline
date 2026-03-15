---
phase: 06-fix-critical-bugs
plan: 01
subsystem: api
tags: [next-og, edge-runtime, anthropic, claude-haiku]

# Dependency graph
requires:
  - phase: 02-daily-word-experience
    provides: OG image route (next/og ImageResponse)
  - phase: 03-activities-and-gamification
    provides: sentence-feedback route (Anthropic AI call)
provides:
  - Edge runtime declaration on OG image route for Vercel compatibility
  - Valid Anthropic model ID in sentence-feedback route
affects: [sharing-preview, sentence-feedback-activity]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "export const runtime = 'edge' required on routes using next/og ImageResponse"
    - "FEEDBACK_MODEL constant pattern for easy model version swaps"

key-files:
  created: []
  modified:
    - src/app/api/og/[slug]/route.tsx
    - src/app/api/sentence-feedback/route.ts

key-decisions:
  - "export const runtime = 'edge' placed between imports and GET export — required for next/og ImageResponse on Vercel Edge network"
  - "FEEDBACK_MODEL corrected to claude-haiku-4-5-20251001 (was invalid 'claude-haiku-3-5')"

patterns-established:
  - "Edge runtime declaration: always include export const runtime = 'edge' in routes using next/og"

requirements-completed: [PLAT-05, ACTV-03]

# Metrics
duration: 1min
completed: 2026-03-15
---

# Phase 06 Plan 01: Fix Critical Bugs Summary

**Edge runtime added to OG image route and Anthropic model ID corrected from invalid 'claude-haiku-3-5' to 'claude-haiku-4-5-20251001'**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-15T17:19:23Z
- **Completed:** 2026-03-15T17:20:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `export const runtime = 'edge'` to OG image route — fixes ImageResponse failures on Vercel production
- Corrected `FEEDBACK_MODEL` constant to `claude-haiku-4-5-20251001` — fixes model-not-found errors on every sentence-feedback call
- TypeScript compilation passes with no new errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Edge runtime export to OG image route** - `a3f1112` (feat)
2. **Task 2: Fix invalid Anthropic model ID in sentence-feedback route** - `4fa7ed7` (fix)

## Files Created/Modified
- `src/app/api/og/[slug]/route.tsx` - Added `export const runtime = 'edge'` between imports and GET export
- `src/app/api/sentence-feedback/route.ts` - Changed FEEDBACK_MODEL from `'claude-haiku-3-5'` to `'claude-haiku-4-5-20251001'`

## Decisions Made
- `export const runtime = 'edge'` placed between the imports block and the GET export, following the pattern documented in STATE.md: "next/og bundled in App Router — export const runtime = 'edge' required for ImageResponse"
- FEEDBACK_MODEL corrected to `claude-haiku-4-5-20251001` — the prior value `claude-haiku-3-5` was never a valid Anthropic API identifier

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- OG image sharing now works on Vercel Edge — word URLs render correctly on Slack/LinkedIn/X
- Sentence-feedback activity no longer returns 502 errors due to model-not-found
- Ready for Phase 06 Plan 02 (next bug fix plan in the phase)

---
*Phase: 06-fix-critical-bugs*
*Completed: 2026-03-15*
