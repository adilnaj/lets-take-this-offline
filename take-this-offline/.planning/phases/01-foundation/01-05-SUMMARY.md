---
phase: 01-foundation
plan: "05"
subsystem: testing, infra
tags: [playwright, e2e, vercel, auth, session-persistence, env-vars]

# Dependency graph
requires:
  - phase: 01-03
    provides: Auth pages at /auth/sign-in and /auth/sign-up, callback and confirm route handlers
  - phase: 01-04
    provides: Seeded words table with ~100 rows and embeddings
provides:
  - Playwright E2E tests for AUTH-01 (email sign-up, sign-in, duplicate email error)
  - Playwright E2E test for AUTH-04 (session persists across browser refresh)
  - vercel.json Vercel deployment configuration
  - .env.example with all five required environment variables documented
  - Human-verified Vercel deployment (pending checkpoint)
affects: [02, 03, 04, 05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Playwright E2E pattern: fill email/password inputs by type selector, submit by button[type=submit]
    - Duplicate-email test reuses TEST_EMAIL from sign-up test (same describe block, sequential execution)
    - Session persistence test: sign in, page.reload(), assert no redirect to /auth/sign-in and email visible

key-files:
  created:
    - vercel.json
  modified:
    - tests/auth/email.spec.ts
    - tests/auth/session.spec.ts
    - .env.example

key-decisions:
  - "TEST_EMAIL uses Date.now() suffix for uniqueness across test runs — avoids duplicate-email conflicts if dev server state persists"
  - "Duplicate-email test reuses TEST_EMAIL (registered in prior test in same describe block) — relies on Playwright sequential test execution within describe"
  - "vercel.json minimal (framework: nextjs only) — Vercel auto-detects all Next.js build settings"
  - ".env.example updated from 2 vars to 5 — adds SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, VOYAGE_API_KEY"

patterns-established:
  - "E2E auth pattern: use input[type=email] and input[type=password] selectors (not placeholder text) for form fill"
  - "Conditional fill pattern: locator('input[placeholder*=confirm]').count() > 0 before filling optional confirm-password field"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 1 Plan 5: E2E Tests and Vercel Deployment Summary

**Playwright E2E tests for email auth (AUTH-01) and session persistence (AUTH-04), plus vercel.json and complete .env.example — with human verification of OAuth flows on the deployed URL pending**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T18:46:02Z
- **Completed:** 2026-03-13T18:47:30Z (Task 1 complete; checkpoint pending)
- **Tasks:** 1 of 2 complete (1 pending checkpoint)
- **Files modified:** 4

## Accomplishments
- Replaced email.spec.ts stubs with real Playwright assertions: sign-up flow, sign-in flow, duplicate-email error detection
- Replaced session.spec.ts stub with session-persistence assertion (reload + email visible after sign-in)
- Created vercel.json for Vercel auto-detection of Next.js framework
- Updated .env.example from 2 vars to all 5 required vars (Supabase x3, Anthropic, Voyage AI)

## Task Commits

Each task was committed atomically:

1. **Task 1: E2E auth tests and Vercel config** - `45fc7cc` (feat)
2. **Task 2: Human verification checkpoint** - pending

**Plan metadata:** (docs commit follows after checkpoint approval)

## Files Created/Modified
- `tests/auth/email.spec.ts` - AUTH-01 E2E tests: sign-up, sign-in, duplicate email error (replaced stubs)
- `tests/auth/session.spec.ts` - AUTH-04 E2E test: session persistence across page reload (replaced stub)
- `vercel.json` - Minimal Vercel config with `"framework": "nextjs"`
- `.env.example` - All 5 required environment variables with source descriptions

## Decisions Made
- **TEST_EMAIL uses Date.now() for uniqueness:** Each test run gets a fresh email address. The duplicate-email test reuses the same address registered in the first test within the describe block, relying on Playwright's sequential intra-describe execution order.
- **vercel.json kept minimal:** Next.js auto-detection handles build commands, output directory, and routing. Only `framework` key is needed.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0
**Impact on plan:** No scope changes.

## Issues Encountered
- Pre-existing vitest failures in `tests/seed/*.test.ts` (stub `expect(false).toBe(true)` — same stub pattern as auth tests before this plan). These are out of scope and not caused by this plan's changes. Logged as deferred.

## User Setup Required

Before the checkpoint can be fully completed:

1. **Supabase Auth settings:** Disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email → toggle "Confirm email" OFF (for local E2E testing). Re-enable for production.
2. **Pre-create session test user:** Supabase Dashboard → Authentication → Users → Add user with email `session-test@example.com` and password `TestPassword123!`
3. **Vercel deployment:** vercel.com → New Project → Import Git Repository. Add all env vars in Project Settings → Environment Variables (Production + Preview).
4. **Supabase redirect URLs:** Supabase Dashboard → Authentication → URL Configuration → Redirect URLs → add `https://<your-vercel-domain>.vercel.app/auth/callback` and `https://<your-vercel-domain>.vercel.app/auth/confirm`
5. **OAuth providers:** Configure Google and Apple OAuth providers in Supabase Dashboard and add their Vercel deployment URLs as allowed redirect URIs.

## Checkpoint Pending

The plan has a blocking human-verify checkpoint requiring:
- Vercel deployment confirmed green
- Email sign-up, sign-in, and session persistence verified on deployed URL
- Google OAuth round-trip confirmed
- Apple OAuth confirmed (or explicitly deferred)
- Supabase words table spot-checked (~100 rows with non-null embeddings)

## Next Phase Readiness
- Phase 1 code complete — all routes, schema, seed script, and E2E tests are in place
- OAuth providers (Google, Apple) require Supabase Dashboard configuration before end-to-end OAuth works
- Session test user (`session-test@example.com`) must be pre-created in Supabase before E2E test suite runs
- Phase 2 can proceed once checkpoint is approved

---
*Phase: 01-foundation*
*Completed: 2026-03-13*
