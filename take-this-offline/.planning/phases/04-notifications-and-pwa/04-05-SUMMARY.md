---
plan: 04-05
phase: 04-notifications-and-pwa
status: complete
completed: "2026-03-14"
requirements:
  - PLAT-01
  - PLAT-02
---

# Plan 04-05: Service Worker & PWA Install — Summary

## What Was Built

Offline support via service worker and PWA install button.

## Key Files

### Created
- `public/sw.js` — Service worker: cache-first for `/` and `/word/*` pages, network-first for all other routes. Also handles `push` and `notificationclick` events for web push notification display.
- `src/components/pwa-register.tsx` — Null-rendering client component that registers `/sw.js` on mount via `navigator.serviceWorker.register`.
- `src/hooks/use-pwa-install.ts` — `usePWAInstall()` hook that captures `beforeinstallprompt` and `appinstalled` events, returns `{ canInstall, install }`.

### Modified
- `src/components/site-header.tsx` — Added `'use client'` directive and conditional install button using `usePWAInstall()` hook with `Download` icon from lucide-react.
- `src/components/providers.tsx` — Added `<PwaRegister />` as first child inside `ThemeProvider`.

## Commits
- `1cf2f42`: feat(04-05): add service worker and PWA registration component
- `113ab3a`: feat(04-05): add PWA install hook, wire into SiteHeader and Providers

## Decisions
- Added `'use client'` to `site-header.tsx` — safe as it has no server-only imports; all callers pass `user` as a serializable prop.
- Single service worker handles both offline caching AND push notification display, avoiding the need for a separate SW registration in Plan 04-06.
- Cache name `ltto-v1` — old caches are purged on SW activation.

## Verification
- `npx tsc --noEmit` exits 0
- `PwaRegister` confirmed in `providers.tsx`
- `usePWAInstall` confirmed in `site-header.tsx`
- `notificationclick` handler confirmed in `sw.js`
