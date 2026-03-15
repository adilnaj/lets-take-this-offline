---
plan: 04-06
phase: 04-notifications-and-pwa
status: complete
completed: "2026-03-14"
requirements:
  - NOTF-01
  - NOTF-02
  - NOTF-03
---

# Plan 04-06: Notification Settings UI — Summary

## What Was Built

User-facing notification controls in `/profile`: push toggle with hour picker and email digest toggle.

## Key Files

### Created
- `src/components/notification-settings.tsx` — `'use client'` component. Push toggle: requests `Notification.permission`, subscribes via `navigator.serviceWorker.ready.pushManager.subscribe`, POSTs to `/api/push/subscribe`. Unsubscribe flow calls `pushManager.getSubscription()`, `sub.unsubscribe()`, then DELETE `/api/push/unsubscribe`. Hour picker re-upserts subscription with new hour. Email toggle: POST/DELETE `/api/email/subscribe|unsubscribe`. Permission-denied state shows amber error message. Toggle UI uses custom `<button role="switch">` — no added dependencies.

### Modified
- `src/app/profile/page.tsx` — Added `push_subscriptions` and `email_digest_prefs` server-side queries. Imported and rendered `<NotificationSettings>` as last section below Activity History, passing initial state from DB.

## Commits
- `991e7d6`: feat(04-06): add NotificationSettings client component with push and email toggles
- `b316142`: feat(04-06): add Notifications section to profile page with server-side state fetch

## Decisions
- Base64url encoding for VAPID keys uses `arrayBufferToBase64Url` helper (replaces `+` → `-`, `/` → `_`, strips `=`)
- Hour picker re-calls subscribe API on change when push is enabled — upserts row to update `notify_hour`
- Toggle is a simple styled `<button role="switch">` to avoid adding UI lib dependencies
