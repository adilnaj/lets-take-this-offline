---
plan: 04-03
phase: 04-notifications-and-pwa
status: complete
completed: "2026-03-14"
requirements:
  - NOTF-01
  - NOTF-03
---

# Plan 04-03: Push Notification API — Summary

## What Was Built

Server-side push notification infrastructure: subscribe/unsubscribe routes and hourly cron dispatcher.

## Key Files

### Created
- `src/app/api/push/subscribe/route.ts` — POST handler: upserts push subscription (endpoint, auth, p256dh, timezone, notify_hour) for authenticated user. Validates notifyHour 0-23. Upserts on `user_id,endpoint` conflict.
- `src/app/api/push/unsubscribe/route.ts` — DELETE handler: removes push subscription by endpoint for authenticated user. Returns 404 if row not found.
- `src/app/api/cron/push-dispatch/route.ts` — GET handler secured by `CRON_SECRET` Bearer token. Queries `push_subscriptions` filtered by current UTC hour, sends web-push notification with today's word. Auto-deletes 410 (expired) subscriptions. Uses service-role Supabase client to bypass RLS.

## Commits
- `6aaa905`: feat(04-03): add push subscribe and unsubscribe API routes
- `6fca6af`: feat(04-03): add push-dispatch cron handler with VAPID and 410 cleanup

## Decisions
- web-push installed as runtime dep; @types/web-push as devDep
- `vercel.json` cron registration intentionally deferred to Plan 04-04 (sole owner) to avoid concurrent write conflicts in wave 2

## User Setup Required
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — generate with `node -e "const wp=require('web-push'); console.log(wp.generateVAPIDKeys())"`
- `VAPID_PRIVATE_KEY` — same command
- `VAPID_SUBJECT` — `mailto:admin@yourdomain.com` or deployment URL
- `CRON_SECRET` — `openssl rand -base64 32`
