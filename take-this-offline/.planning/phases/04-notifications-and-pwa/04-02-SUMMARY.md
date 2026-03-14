---
phase: 04-notifications-and-pwa
plan: "02"
subsystem: pwa
tags: [pwa, manifest, icons, next.js, viewport]

requires:
  - phase: 01-foundation
    provides: Next.js App Router layout.tsx and public/ directory structure

provides:
  - public/manifest.json with name, display standalone, theme_color, and icon references
  - 192x192 and 512x512 placeholder PNG icons in public/icons/
  - layout.tsx Viewport export with themeColor
  - layout.tsx metadata manifest link and appleWebApp fields

affects:
  - 04-03 (service worker and offline — depends on manifest being present)
  - 04-04 (install button — depends on beforeinstallprompt, which requires valid manifest + icon)

tech-stack:
  added: []
  patterns:
    - "Next.js 15 viewport export pattern: themeColor moved from metadata to Viewport export"
    - "PNG generation via Node.js built-in zlib deflate — no extra dependencies"

key-files:
  created:
    - public/manifest.json
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - scripts/gen-icons.mjs
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Viewport export used for themeColor (Next.js 15 pattern) — metadata.themeColor is deprecated"
  - "Placeholder PNG icons generated via raw zlib/PNG bytes in scripts/gen-icons.mjs — no canvas or sharp dependency needed"
  - "Icons are zinc-900 (#18181b) solid squares — user should replace with real brand assets before launch"

patterns-established:
  - "PWA manifest pattern: Next.js metadata.manifest field emits <link rel='manifest'> without manual head manipulation"
  - "Icon generation: scripts/gen-icons.mjs is the canonical icon regeneration script for this project"

requirements-completed: [PLAT-01, PLAT-02]

duration: 2min
completed: "2026-03-14"
---

# Phase 4 Plan 02: PWA Manifest and Icon Assets Summary

**PWA web app manifest with standalone display, theme-color viewport meta, and 192/512px placeholder PNG icons wired into Next.js App Router layout**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T21:16:29Z
- **Completed:** 2026-03-14T21:17:40Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created `public/manifest.json` meeting the minimum browser install eligibility criteria (name, display standalone, icons)
- Generated valid 192x192 and 512x512 PNG files using a Node.js zlib-based script — no additional npm dependencies
- Updated `layout.tsx` with Next.js 15 `Viewport` export for `themeColor` and `metadata.manifest` for the manifest link

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PWA manifest and icon assets** - `309ecef` (feat)
2. **Task 2: Wire manifest and PWA meta into layout.tsx** - `137aa5c` (feat)

## Files Created/Modified

- `public/manifest.json` - PWA web app manifest (name, display, theme_color, icons)
- `public/icons/icon-192.png` - 192x192 solid zinc-900 placeholder icon
- `public/icons/icon-512.png` - 512x512 solid zinc-900 placeholder icon
- `scripts/gen-icons.mjs` - Standalone Node.js icon generation script using zlib
- `src/app/layout.tsx` - Added Viewport export and manifest/appleWebApp/icons metadata fields

## Decisions Made

- Used `export const viewport: Viewport` for `themeColor` — this is the correct Next.js 14+ pattern; `metadata.themeColor` is deprecated and causes TypeScript warnings
- Generated PNGs with raw zlib/PNG byte encoding in a script rather than installing `canvas` or `sharp` — keeps dependencies lean
- Icons are solid zinc-900 squares as placeholders — note in summary that real brand assets should replace them before launch

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

**Note:** Replace `public/icons/icon-192.png` and `public/icons/icon-512.png` with real brand assets before launching to production. Run `node scripts/gen-icons.mjs` to regenerate placeholder icons if needed.

## Next Phase Readiness

- PWA manifest and icon assets are in place — browser install eligibility criteria satisfied
- Plan 03 (service worker / offline) and Plan 04 (install button / `beforeinstallprompt`) can proceed
- Real brand icons should be added before public launch

---
*Phase: 04-notifications-and-pwa*
*Completed: 2026-03-14*
