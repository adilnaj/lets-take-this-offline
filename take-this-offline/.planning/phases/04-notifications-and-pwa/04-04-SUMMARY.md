---
plan: 04-04
phase: 04-notifications-and-pwa
status: complete
completed: "2026-03-14"
requirements:
  - NOTF-02
  - NOTF-03
---

# Plan 04-04: Email Digest API — Summary

## What Was Built

Email digest infrastructure: subscribe/unsubscribe routes, branded HTML email template, daily cron handler via Resend, and vercel.json with both cron schedules.

## Key Files

### Created
- `src/lib/email/digest-template.ts` — Pure `renderDigestEmail(word, appUrl)` function returning `{ subject, html }`. Branded HTML email with word title, definition, exec_summary quick-take block, and CTA button.
- `src/app/api/email/subscribe/route.ts` — POST: upserts `email_digest_prefs` with `enabled=true` for authenticated user.
- `src/app/api/email/unsubscribe/route.ts` — DELETE: sets `enabled=false` for authenticated user's prefs row.
- `src/app/api/cron/email-digest/route.ts` — GET secured by `CRON_SECRET`. Queries opted-in users, fetches their email via `supabase.auth.admin.getUserById`, sends branded HTML email via Resend. Continues on per-user send failure.

### Modified
- `vercel.json` — Added both cron entries: push-dispatch (`0 * * * *`, hourly) and email-digest (`0 8 * * *`, daily 08:00 UTC).

## Commits
- `c2635d7`: feat(04-04): add email digest template and subscribe/unsubscribe routes
- `43fbcb6`: feat(04-04): add email-digest cron handler and vercel.json with both cron schedules

## Decisions
- `vercel.json` is solely owned by this plan — Plan 04-03 does not touch it, avoiding concurrent write conflicts.
- Resend batch send is sequential per user (not batched) — simpler, sufficient at expected scale.
- **Note:** Vercel Pro required for multiple crons and hourly frequency (Hobby plan allows one cron/day max).

## User Setup Required
- `RESEND_API_KEY` — Resend Dashboard → API Keys
- `RESEND_FROM_EMAIL` — verified domain address (e.g. `noreply@yourdomain.com`)
- `CRON_SECRET` — shared with push-dispatch
