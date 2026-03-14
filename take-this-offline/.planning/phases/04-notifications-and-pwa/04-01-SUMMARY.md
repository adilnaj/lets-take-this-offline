---
phase: 04-notifications-and-pwa
plan: "01"
subsystem: notifications-schema
tags: [database, migrations, typescript, push-notifications, email-digest]
dependency_graph:
  requires: []
  provides: [push_subscriptions table DDL, email_digest_prefs table DDL, notification TypeScript types]
  affects: [04-02-push-api, 04-03-email-api, 04-04-profile-ui]
tech_stack:
  added: []
  patterns: [RLS per-user policies, hand-authored TypeScript types matching migration columns]
key_files:
  created:
    - supabase/migrations/20260314000001_notifications_schema.sql
  modified:
    - src/lib/types/database.types.ts
key_decisions:
  - "Notification types appended before words table in database.types.ts for alpha-sorted consistency"
  - "push_subscriptions uses UNIQUE(user_id, endpoint) to prevent duplicate device subscriptions"
  - "email_digest_prefs uses user_id as PRIMARY KEY (not uuid id) since it is a 1:1 user preference row"
metrics:
  duration: "3 min"
  completed_date: "2026-03-14"
  tasks_completed: 2
  files_changed: 2
---

# Phase 4 Plan 1: Notifications Schema Summary

**One-liner:** Push and email notification tables with RLS and hand-authored TypeScript types for wave 2 API plans.

## What Was Built

Two Supabase tables backing the Phase 4 notification system:

1. **push_subscriptions** — Stores one row per browser/device Web Push subscription per user. Columns: `id`, `user_id`, `endpoint`, `auth` (base64url), `p256dh` (base64url), `timezone`, `notify_hour` (0-23), `created_at`. Unique constraint on `(user_id, endpoint)` prevents duplicate subscriptions for the same device.

2. **email_digest_prefs** — One row per user opt-in preference. Uses `user_id` as primary key for upsert-friendly access. Columns: `user_id`, `enabled`, `updated_at`.

Both tables have RLS enabled with `FOR ALL` policies restricting reads and writes to the owning user via `auth.uid() = user_id`.

TypeScript types in `database.types.ts` were hand-authored to exactly match migration columns, following the Row/Insert/Update/Relationships pattern used by existing tables.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write notifications schema migration | c6fa8c6 | supabase/migrations/20260314000001_notifications_schema.sql |
| 2 | Extend database.types.ts with notification table types | b19d7ef | src/lib/types/database.types.ts |

## Verification

- `grep "push_subscriptions" supabase/migrations/20260314000001_notifications_schema.sql` — passes
- `grep "email_digest_prefs" supabase/migrations/20260314000001_notifications_schema.sql` — passes
- `grep "push_subscriptions" src/lib/types/database.types.ts` — passes
- `grep "email_digest_prefs" src/lib/types/database.types.ts` — passes
- `npx tsc --noEmit` — exits 0, no errors

## Deviations from Plan

None — plan executed exactly as written.

## Notes

Migration must be applied to the remote Supabase project via `npx supabase db push` before Phase 4 API plans execute. Local dev environment was not running during this plan's execution.

## Self-Check: PASSED
