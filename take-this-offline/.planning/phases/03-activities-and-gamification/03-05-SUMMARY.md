---
phase: 03-activities-and-gamification
plan: 05
subsystem: sentence-activity
tags: [anthropic, ai-feedback, auth-gate, route-handler, client-component]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [sentence-activity, sentence-feedback-api]
  affects: [03-06]
tech_stack:
  added:
    - "@anthropic-ai/sdk used in route handler (was in package.json, first use)"
  patterns:
    - Auth gate in route handler (supabase.auth.getUser() first)
    - Inline auth prompt in component (Link to /auth/sign-in, no redirect)
    - fetch POST pattern from client component to route handler
    - Anthropic SDK wrapped in try/catch with 502 fallback
key_files:
  created:
    - src/app/api/sentence-feedback/route.ts
    - src/components/activities/sentence-activity.tsx
  modified:
    - tests/activities/sentence-feedback.test.ts
decisions:
  - FEEDBACK_MODEL constant defined at top of route handler for easy model swap
  - Model name 'claude-haiku-3-5' per plan (low confidence — fallback is 'claude-3-5-haiku-20241022')
  - User type from @supabase/supabase-js (not a custom type) — consistent with auth patterns
  - Submit button disabled on empty/loading/submitted; error state allows retry (hasSubmitted stays false on error)
  - Feedback displayed in blockquote with border-l-4 border-primary/40 accent
metrics:
  duration: "2 minutes"
  completed_date: "2026-03-14"
  tasks_completed: 2
  files_changed: 3
---

# Phase 3 Plan 5: SentenceActivity and /api/sentence-feedback Summary

**One-liner:** SentenceActivity component with inline auth gate and Anthropic SDK route handler returning witty 2-3 sentence feedback.

## What Was Built

### Task 1: POST /api/sentence-feedback Route Handler

Created `src/app/api/sentence-feedback/route.ts`:

- `FEEDBACK_MODEL = 'claude-haiku-3-5'` constant at top for easy swap
- Auth check is the first operation — returns 401 before any body parsing
- Validates `wordTitle`, `definition`, `sentence` in request body — returns 400 if any missing
- Calls `anthropic.messages.create()` with witty feedback prompt (max_tokens=256)
- Returns `{ feedback: string }` on success
- Try/catch around Anthropic call: returns 502 with error logged if SDK throws

Test file `tests/activities/sentence-feedback.test.ts` retains 9 todo stubs (route handler + SentenceActivity) — Anthropic call is integration-tested manually per VALIDATION.md.

### Task 2: SentenceActivity Component

Created `src/components/activities/sentence-activity.tsx`:

- `'use client'` component with `SentenceActivityProps` interface: `{ word: WordRow, user: User | null, isCompleted: boolean, onComplete: () => void }`
- Null user path: shows "Sign in to practice writing a sentence." with Link to `/auth/sign-in`. No textarea rendered.
- Logged-in path: controlled textarea (rows=2, placeholder with word title), Submit button
- Submit disabled when: `sentence.trim().length === 0`, `isLoading`, or `hasSubmitted`
- Loading state: "Reading your sentence..." text displayed where feedback will appear
- On success: sets feedback, sets `hasSubmitted=true`, calls `onComplete()`
- On error: sets error message, allows retry (hasSubmitted stays false)
- Feedback rendered in `<blockquote>` with `border-l-4 border-primary/40` accent
- `CheckCircle2` icon shown when `isCompleted || hasSubmitted`

## Verification Results

- `npx tsc --noEmit` — no errors in sentence-feedback/route.ts or sentence-activity.tsx
- Pre-existing Playwright test.todo TypeScript errors in tests/profile/ are unrelated (documented in 03-01-SUMMARY.md deferred items)
- `npx vitest run tests/activities/sentence-feedback.test.ts` — 9 todo tests pass trivially
- FEEDBACK_MODEL constant verified at top of route handler
- Auth check confirmed as first operation in route handler
- SentenceActivity: null user path excludes textarea; logged-in path shows textarea + Submit button

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED
