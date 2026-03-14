---
phase: 02-daily-word-experience
plan: "04"
subsystem: api
tags: [next/og, edge-runtime, og-image, social-sharing, image-response]

# Dependency graph
requires:
  - phase: 02-daily-word-experience
    provides: getWordBySlug() from @/lib/words returning WordRow with title, category, exec_summary, daily_date
provides:
  - Dynamic OG image PNG via GET /api/og/[slug] using ImageResponse on Edge runtime
  - 1200x630 branded card with word title, category, exec_summary excerpt, and date on dark purple gradient
  - 404 response for unknown slugs
affects: [social-sharing, link-preview, word-page-metadata]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Edge runtime route handler: export const runtime = 'edge' for next/og compatibility"
    - "Inline style objects required for all JSX inside ImageResponse (no Tailwind, no CSS vars)"
    - "display: flex required on every element in ImageResponse layout (flex-only engine)"
    - "Append T00:00:00 to DATE strings before Date constructor to avoid UTC offset day shift"

key-files:
  created:
    - src/app/api/og/[slug]/route.tsx
  modified: []

key-decisions:
  - "next/og bundled in App Router — no separate install needed; export const runtime = 'edge' required"
  - "Truncate exec_summary to 120 chars to prevent overflow in fixed 1200x630 canvas"
  - "Brand name uses &apos; HTML entity in JSX for the apostrophe in Let's Take This Offline"

patterns-established:
  - "OG image route pattern: edge runtime + ImageResponse + getWordBySlug + inline styles only"

requirements-completed: [PLAT-05]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 2 Plan 04: Dynamic OG Image Route Summary

**Edge runtime /api/og/[slug] route returning a 1200x630 branded PNG for each word using next/og ImageResponse with dark purple gradient, word title at 72px, category, exec_summary excerpt, and date**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-14T17:39:17Z
- **Completed:** 2026-03-14T17:44:00Z
- **Tasks:** 1 auto task + 1 checkpoint
- **Files modified:** 1

## Accomplishments
- Dynamic OG image route at /api/og/[slug] on Edge runtime
- Returns 1200x630 PNG via ImageResponse for valid word slugs
- Returns HTTP 404 for unknown slugs
- Word page generateMetadata already wired to /api/og/{slug} — no additional changes needed
- TypeScript compilation passes with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Build the dynamic OG image route** - `6d34905` (feat)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified
- `src/app/api/og/[slug]/route.tsx` - Edge runtime GET handler returning ImageResponse PNG with word data; 404 for unknown slugs

## Decisions Made
- Used `export const runtime = 'edge'` — next/og requires Edge runtime, not Node.js
- All JSX styles use inline style objects — Tailwind classes are not supported inside ImageResponse
- `display: 'flex'` on every element — next/og uses a flex-only layout engine
- Appended `'T00:00:00'` to daily_date string before Date constructor to avoid UTC offset shifting dates
- Truncated exec_summary at 120 characters to prevent canvas overflow

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — TypeScript compilation passed on first attempt. The plan's implementation notes were comprehensive and correct.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- OG image route ready; word pages at /word/[slug] already wire openGraph.images to /api/og/{slug} via generateMetadata
- Sharing any word URL on Slack, LinkedIn, or opengraph.xyz will render the dynamic branded card
- Phase 02 complete after this checkpoint is approved — ready to proceed to Phase 03

---
*Phase: 02-daily-word-experience*
*Completed: 2026-03-14*
