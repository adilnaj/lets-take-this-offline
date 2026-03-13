---
phase: 01-foundation
plan: "03"
subsystem: auth
tags: [nextjs, supabase, oauth, google, apple, email-confirmation, tailwind, ssr-auth]

# Dependency graph
requires:
  - phase: 01-01
    provides: Supabase SSR browser and server clients (createClient in client.ts and server.ts)
provides:
  - Sign-in page at /auth/sign-in with email/password and Google + Apple OAuth
  - Sign-up page at /auth/sign-up with email/password and email confirmation flow
  - OAuth callback handler at /auth/callback (exchangeCodeForSession)
  - Email confirmation handler at /auth/confirm (verifyOtp)
  - Root page at / with session-aware server component (Phase 2 placeholder)
affects: [02, 03, 04, 05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Client Component auth forms using createBrowserClient via createClient()
    - OAuth redirect with ?next= parameter for post-auth destination
    - Email confirmation via emailRedirectTo pointing to /auth/confirm
    - Route handlers use NextResponse.redirect (not next/navigation redirect) for HTTP redirects

key-files:
  created:
    - src/app/auth/sign-in/page.tsx
    - src/app/auth/callback/route.ts
  modified:
    - src/app/auth/sign-up/page.tsx
    - src/app/auth/confirm/route.ts
    - src/app/page.tsx

key-decisions:
  - "Dedicated pages (not modals) for sign-in and sign-up — SSR redirect flows and deep-linking work reliably with distinct routes"
  - "Route handlers use NextResponse.redirect with absolute URL (origin + path) — Next.js route handlers need absolute URLs unlike Server Components"
  - "sign-up page shows confirmation message on success instead of redirecting — user must verify email before session is active"

patterns-established:
  - "Auth form pattern: 'use client' + useState for form state + createClient() browser client + useRouter for post-auth redirect"
  - "OAuth pattern: signInWithOAuth with redirectTo pointing to /auth/callback?next=/ — single callback handler for all OAuth providers"
  - "Route handler error pattern: always redirect to /auth/sign-in?error=<code> on failure, never show blank or error pages"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 1 Plan 3: Authentication UI Summary

**Four auth routes with Tailwind-styled email/password forms, Google + Apple OAuth buttons, and server-side code exchange handlers for OAuth and email confirmation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T18:39:02Z
- **Completed:** 2026-03-13T18:40:47Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Sign-in page with email/password form, Google + Apple OAuth buttons, and inline error display
- Sign-up page with confirm-password validation, email confirmation success state, and duplicate-email error handling
- OAuth callback route handler that exchanges the authorization code for a session and redirects to ?next destination
- Email confirmation route handler that verifies OTP token and redirects to / on success
- Root page replaced with session-aware server component (shows user email when signed in; Phase 2 replaces with word-of-day)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build sign-in and sign-up pages with email/password and OAuth buttons** - `040860e` (feat)
2. **Task 2: Build OAuth callback and email confirmation route handlers** - `02174c2` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/auth/sign-in/page.tsx` - Client Component: email/password form, Google + Apple OAuth buttons, error handling
- `src/app/auth/sign-up/page.tsx` - Client Component: registration form with confirm-password, email confirmation success state
- `src/app/auth/callback/route.ts` - Route handler: exchanges OAuth code for session, redirects to ?next destination
- `src/app/auth/confirm/route.ts` - Route handler: verifies email OTP token, redirects to / or sign-in on error
- `src/app/page.tsx` - Server Component: reads session via getUser(), renders signed-in state or welcome message

## Decisions Made
- **Dedicated pages not modals:** Per plan research recommendation — dedicated routes at /auth/sign-in and /auth/sign-up make SSR redirects and deep-linking reliable.
- **NextResponse.redirect with absolute URL in route handlers:** Route handlers cannot use `redirect()` from next/navigation with relative paths — they require absolute URLs built from `origin`.
- **Sign-up shows confirmation message, not redirect:** After signUp(), the user must click the email link before a session exists. Redirecting to / would show an unauthenticated state.

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

The existing `/auth/confirm/route.ts` from the Next.js template used `redirect()` from next/navigation with a `?next=` parameter. The plan spec uses `NextResponse.redirect` with an explicit `origin` prefix and redirects to sign-in on error (not to /auth/error). Updated to match plan spec exactly — this is implementation replacement, not a deviation.

---

**Total deviations:** 0
**Impact on plan:** No scope changes.

## Issues Encountered
- Template's `/auth/sign-up/page.tsx` delegated to a `<SignUpForm>` component; replaced with self-contained Client Component per plan spec.
- Template's `/auth/confirm/route.ts` used a different error redirect pattern (`/auth/error`); updated to match plan spec (`/auth/sign-in?error=confirmation_failed`).

## User Setup Required
Google OAuth and Apple OAuth require external dashboard configuration before the buttons will work in production. See plan frontmatter `user_setup` for:
- Google: Create OAuth 2.0 credentials in Google Cloud Console, enable Google provider in Supabase Dashboard
- Apple: Create App ID + Services ID + .p8 signing key in Apple Developer Portal, enable Apple provider in Supabase Dashboard

No environment variables are required beyond those already in .env.local (Supabase URL and publishable key are sufficient for the code to compile and run; OAuth just won't redirect correctly until providers are configured).

## Next Phase Readiness
- All four AUTH-01 through AUTH-04 auth routes are implemented and TypeScript-clean
- OAuth providers need Supabase Dashboard configuration before end-to-end OAuth flows work
- Wave 0 test stubs in tests/auth/email.spec.ts are still failing as expected (not-yet-implemented assertions) — Plan 05 implements full E2E tests
- Root page ready for Phase 2 to replace with word-of-day content

---
*Phase: 01-foundation*
*Completed: 2026-03-13*
