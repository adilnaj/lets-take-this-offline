---
phase: 02-daily-word-experience
plan: "02"
subsystem: ui
tags: [next.js, react, tailwind, shadcn, ssr, og-meta, server-components]

# Dependency graph
requires:
  - phase: 02-daily-word-experience
    plan: "01"
    provides: getTodaysWord(), getWordBySlug(), WordRow type, ThemeToggle component
provides:
  - WordCard component — full editorial layout for a word (category, title, date, definition, exec_summary, where_used, usage_examples, heard_in_wild)
  - HeardInTheWild component — citation blockquote with source link, null-safe
  - SiteHeader component — sticky header with app name link and ThemeToggle
  - Home page (/) — SSR, loads today's word, emits OG meta tags
  - Permalink page (/word/[slug]) — SSR, loads any past word by slug, emits OG meta tags
affects: [03-archive-search, 05-og-images]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component pages that call async data functions at render time
    - generateMetadata exported from each page route for per-page OG tags
    - metadataBase in root layout resolves relative OG image paths

key-files:
  created:
    - src/components/site-header.tsx
    - src/components/heard-in-wild.tsx
    - src/components/word-card.tsx
    - src/app/word/[slug]/page.tsx
  modified:
    - src/app/page.tsx
    - src/app/layout.tsx
    - .env.local.example

key-decisions:
  - "params in Next.js App Router dynamic pages is a Promise in Next 15 — must be awaited before accessing slug"
  - "formatDate uses Date.UTC to avoid local timezone shifting YYYY-MM-DD date strings"
  - "HeardInTheWild renders nothing when both citation and sourceUrl are null — empty state handled at component level"

patterns-established:
  - "WordCard: receives full WordRow prop and handles all display logic internally"
  - "Page routes: export generateMetadata + default async function, both call same data function"
  - "OG image path pattern: /api/og/[slug] referenced in openGraph.images from page metadata"

requirements-completed: [CONT-01, CONT-02, PLAT-04]

# Metrics
duration: 2min
completed: "2026-03-14"
---

# Phase 02 Plan 02: Daily Word Experience — Pages Summary

**Server-rendered home page and word permalink with full editorial WordCard layout and per-page OG meta tags wired to /api/og/[slug]**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T17:32:02Z
- **Completed:** 2026-03-14T17:33:59Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- WordCard renders all 8 content sections (category badge, title, date, definition, exec summary, where used, usage examples, heard in the wild)
- Home page (/) fetches today's word server-side and renders WordCard with empty-state fallback
- Word permalink (/word/[slug]) fetches any word by slug, calls notFound() for missing words
- Both pages export generateMetadata with og:title, og:description, og:image (referencing /api/og/[slug]), and twitter:card
- SiteHeader is sticky with backdrop blur; HeardInTheWild is null-safe

## Task Commits

Each task was committed atomically:

1. **Task 1: Build WordCard, HeardInTheWild, and SiteHeader components** - `1d0745b` (feat)
2. **Task 2: Build today's word home page and word permalink with SSR meta tags** - `ea3357a` (feat)

## Files Created/Modified

- `src/components/site-header.tsx` - Sticky header with app name link and ThemeToggle
- `src/components/heard-in-wild.tsx` - Citation blockquote with source link, renders nothing when null
- `src/components/word-card.tsx` - Full 8-section editorial layout for a word
- `src/app/page.tsx` - Home page: SSR, getTodaysWord(), generateMetadata with OG tags
- `src/app/word/[slug]/page.tsx` - Permalink page: SSR, getWordBySlug(), notFound() for missing words
- `src/app/layout.tsx` - Updated metadataBase to use NEXT_PUBLIC_APP_URL, updated title/description
- `.env.local.example` - Added NEXT_PUBLIC_APP_URL entry

## Decisions Made

- **params is a Promise in Next.js 15** — App Router dynamic page params must be awaited (`const { slug } = await params`). Used `Promise<{ slug: string }>` type annotation.
- **Date formatting uses Date.UTC** — YYYY-MM-DD strings must be parsed as UTC to prevent timezone shifts (e.g., "March 12" rendering as "March 11" in UTC-offset timezones).
- **HeardInTheWild handles nulls at the component level** — component returns null if both citation and sourceUrl are null, keeping WordCard clean.

## Deviations from Plan

None — plan executed exactly as written, with one minor adaptation: `params` typed as `Promise<{ slug: string }>` per Next.js 15 App Router convention (plan showed the sync pattern which triggers a TypeScript warning in Next 15).

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required beyond what was already in .env.local.example.

## Next Phase Readiness

- Home page and permalink are production-ready with SSR content and OG meta tags
- WordCard component is reusable for archive view in Phase 03
- /api/og/[slug] OG image endpoint needs to be built (Phase 05) — pages already reference it
- NEXT_PUBLIC_APP_URL must be set in Vercel environment variables for OG image URLs to resolve correctly

---
*Phase: 02-daily-word-experience*
*Completed: 2026-03-14*
