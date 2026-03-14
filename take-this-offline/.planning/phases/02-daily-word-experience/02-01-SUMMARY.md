---
phase: 02-daily-word-experience
plan: "01"
subsystem: data, ui
tags: [supabase, next-themes, dark-mode, typescript, word-data]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase client (createClient), database schema (words table), TypeScript types (database.types.ts)
provides:
  - Typed Supabase query functions for word data (getTodaysWord, getWordBySlug, getArchive, searchArchive)
  - Providers component wrapping next-themes ThemeProvider for app-wide dark mode
  - ThemeToggle component (Sun/Moon icon button)
  - Root layout updated to use Providers component with suppressHydrationWarning
affects:
  - 02-02 (today's word page uses getTodaysWord)
  - 02-03 (archive page uses getArchive and searchArchive)
  - all Phase 2 pages (ThemeToggle available for nav/header use)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side Supabase queries: always call createClient() inside async function body, never at module scope"
    - "Paginated queries use separate count query with { count: 'exact', head: true } to avoid fetching all rows"
    - "Dark mode via next-themes: Providers client component wraps app, layout uses suppressHydrationWarning"

key-files:
  created:
    - src/lib/words.ts
    - src/components/providers.tsx
    - src/components/theme-toggle.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Providers component extracts ThemeProvider into a dedicated client component — layout stays a server component"
  - "searchArchive uses Supabase .or() with ilike across title, definition, exec_summary for keyword search"
  - "Separate count queries (head: true) used for pagination totals — avoids fetching full result sets"

patterns-established:
  - "Word query pattern: import from @/lib/words — pages never import directly from database.types.ts"
  - "Theme pattern: <Providers> in layout.tsx; ThemeToggle placed wherever toggle UI is needed"

requirements-completed: [PLAT-03]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 2 Plan 01: Data Layer and Dark Mode Summary

**Supabase word query functions (getTodaysWord, getWordBySlug, getArchive, searchArchive) and next-themes dark mode system wired into root layout via a dedicated Providers client component**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-14T17:29:03Z
- **Completed:** 2026-03-14T17:34:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Four typed async query functions for the words table, ready for use by all Phase 2 content pages
- Providers component and ThemeToggle component for dark mode system
- Root layout updated to use Providers (replacing inline ThemeProvider) with suppressHydrationWarning already in place
- TypeScript passes with no errors across all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase query functions for word data** - `bb9aeec` (feat)
2. **Task 2: Add dark mode — ThemeProvider, toggle, and root layout wiring** - `bd98460` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/lib/words.ts` - Four exported async Supabase query functions plus WordRow, WordCategory, WORD_CATEGORIES exports
- `src/components/providers.tsx` - Client component wrapping next-themes ThemeProvider
- `src/components/theme-toggle.tsx` - Sun/Moon toggle button using useTheme hook and lucide-react icons
- `src/app/layout.tsx` - Replaced inline ThemeProvider with <Providers>; suppressHydrationWarning was already present

## Decisions Made
- Providers component pattern chosen over inline ThemeProvider to keep layout.tsx as a server component
- count queries use `{ count: 'exact', head: true }` on a separate query rather than relying on PostgREST count headers alongside data — explicit and predictable
- keyword search uses `.or()` across three columns (title, definition, exec_summary) with ilike — no full-text search dependency needed at this stage

## Deviations from Plan

None — plan executed exactly as written. Both `next-themes` and `lucide-react` were already installed; `tailwind.config.ts` already had `darkMode: ["class"]`; `globals.css` already had `.dark` CSS variable overrides; layout already had `suppressHydrationWarning`. No installs or config changes were needed.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `src/lib/words.ts` exports all four functions needed by Plans 02 and 03 (today's word page and archive)
- ThemeToggle is ready to be placed in the nav/header component built in Plan 02
- No blockers for Phase 2 Plans 02 and 03

---
*Phase: 02-daily-word-experience*
*Completed: 2026-03-14*
