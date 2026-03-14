---
phase: 02-daily-word-experience
plan: 03
subsystem: ui
tags: [nextjs, react, supabase, tailwindcss, shadcn]

requires:
  - phase: 02-daily-word-experience plan 01
    provides: getArchive, searchArchive, WORD_CATEGORIES, WordRow, WordCategory from src/lib/words.ts
  - phase: 01-foundation
    provides: Supabase client, auth middleware, shadcn UI components

provides:
  - /archive route with paginated word list (src/app/archive/page.tsx)
  - ArchiveList component rendering word links to /word/[slug] (src/components/archive-list.tsx)
  - ArchiveFilters component with debounced keyword search, category chips, date range (src/components/archive-filters.tsx)
  - ArchivePagination component with URL-driven page navigation (src/components/archive-pagination.tsx)

affects: [03-notifications, 04-ai-pipeline]

tech-stack:
  added: []
  patterns:
    - URL searchParams as single source of truth for filter state (shareable, server-rendered)
    - Client components update URL via useRouter().push(); server component reads searchParams
    - Debounced input with useRef<ReturnType<typeof setTimeout> | undefined> for keyword search

key-files:
  created:
    - src/app/archive/page.tsx
    - src/components/archive-list.tsx
    - src/components/archive-filters.tsx
    - src/components/archive-pagination.tsx
  modified: []

key-decisions:
  - "URL searchParams as filter state: all filters in URL so results are shareable and server-rendered without client state"
  - "hasFilters branch: calls searchArchive when any filter active, getArchive for plain pagination — avoids unnecessary query complexity"
  - "useRef initial value must be explicit (undefined) — React 18+ types require argument to useRef"

patterns-established:
  - "Filter state in URL: client components push to URL, server page reads searchParams — consistent with Next.js App Router SSR model"
  - "Debounce pattern: useRef<ReturnType<typeof setTimeout> | undefined>(undefined) with clearTimeout on each event"

requirements-completed: [CONT-03, CONT-04, CONT-05]

duration: 2min
completed: 2026-03-14
---

# Phase 02 Plan 03: Archive Route Summary

**URL-searchParams-driven /archive page with ArchiveList, ArchiveFilters (debounced keyword, category chips, date range), and ArchivePagination — all server-rendered and shareable**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T17:35:35Z
- **Completed:** 2026-03-14T17:37:04Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- /archive route reads URL searchParams (q, category, from, to, page) and delegates to searchArchive or getArchive
- ArchiveList renders a divided list of word items as Next.js Links to /word/[slug] with category badge and formatted date; shows empty state when no words
- ArchiveFilters provides debounced keyword search (300ms), toggleable category chips, and date range inputs — all reset page to 1 on change
- ArchivePagination preserves existing searchParams when navigating pages; hides when totalPages <= 1

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ArchiveList and ArchivePagination components** - `2fb1edc` (feat)
2. **Task 2: Build ArchiveFilters and the /archive page** - `00f7ef2` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `src/app/archive/page.tsx` - Async server component; reads searchParams, calls getArchive or searchArchive, composes all archive components
- `src/components/archive-list.tsx` - Server component; renders word list with Links to /word/[slug], empty state
- `src/components/archive-filters.tsx` - Client component; debounced keyword, category chip toggle, date range inputs
- `src/components/archive-pagination.tsx` - Client component; Prev/Next buttons updating page URL param

## Decisions Made

- URL searchParams as single source of truth for all filter state — enables SSR, shareability, and browser back/forward
- `hasFilters` branch: if any filter is active, call `searchArchive`; otherwise call `getArchive` — clean separation of filtered vs plain pagination queries
- `useRef` must be typed with `| undefined` and initialized to `undefined` — required by React 18+ type definitions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useRef initialization for React 18+ compatibility**
- **Found during:** Task 2 (ArchiveFilters component)
- **Issue:** `useRef<ReturnType<typeof setTimeout>>()` causes TS2554 — React 18+ `useRef` overloads require an explicit initial value argument
- **Fix:** Changed to `useRef<ReturnType<typeof setTimeout> | undefined>(undefined)`
- **Files modified:** src/components/archive-filters.tsx
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `00f7ef2` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type/bug fix)
**Impact on plan:** Single one-line fix required for TypeScript compatibility. No scope creep.

## Issues Encountered

None beyond the useRef type fix documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /archive discovery surface complete — users can browse, search, and filter all past words
- All filter state in URL means archive links are shareable and bookmarkable
- Phase 03 (notifications) can proceed independently

## Self-Check: PASSED

- src/app/archive/page.tsx: FOUND
- src/components/archive-list.tsx: FOUND
- src/components/archive-filters.tsx: FOUND
- src/components/archive-pagination.tsx: FOUND
- Commit 2fb1edc: FOUND
- Commit 00f7ef2: FOUND
