---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E auth flows) + Vitest (unit/integration for seed script) |
| **Config file** | `playwright.config.ts` + `vitest.config.ts` — Wave 0 creates these |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test tests/auth/email.spec.ts tests/auth/session.spec.ts` |
| **Estimated runtime** | ~30 seconds (unit) + ~60 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx playwright test tests/auth/email.spec.ts tests/auth/session.spec.ts`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| AUTH-01-email-signup | TBD | TBD | AUTH-01 | E2E | `npx playwright test tests/auth/email.spec.ts` | ❌ W0 | ⬜ pending |
| AUTH-01-email-signin | TBD | TBD | AUTH-01 | E2E | `npx playwright test tests/auth/email.spec.ts` | ❌ W0 | ⬜ pending |
| AUTH-01-duplicate-email | TBD | TBD | AUTH-01 | E2E | `npx playwright test tests/auth/email.spec.ts` | ❌ W0 | ⬜ pending |
| AUTH-02-google-oauth | TBD | TBD | AUTH-02 | Manual | — see manual table | — | ⬜ pending |
| AUTH-03-apple-oauth | TBD | TBD | AUTH-03 | Manual | — see manual table | — | ⬜ pending |
| AUTH-04-session | TBD | TBD | AUTH-04 | E2E | `npx playwright test tests/auth/session.spec.ts` | ❌ W0 | ⬜ pending |
| PIPE-03-seed-idempotent | TBD | TBD | PIPE-03 | Integration | `npx vitest run tests/seed/seed.test.ts` | ❌ W0 | ⬜ pending |
| PIPE-03-embeddings | TBD | TBD | PIPE-03 | Integration | `npx vitest run tests/seed/embeddings.test.ts` | ❌ W0 | ⬜ pending |
| PIPE-03-uniqueness | TBD | TBD | PIPE-03 | Integration | `npx vitest run tests/seed/uniqueness.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth/email.spec.ts` — stubs for AUTH-01 (sign-up, sign-in, duplicate email error)
- [ ] `tests/auth/session.spec.ts` — stubs for AUTH-04 (session persistence after refresh)
- [ ] `tests/seed/seed.test.ts` — stubs for PIPE-03 (idempotency: re-run skips existing)
- [ ] `tests/seed/embeddings.test.ts` — stubs for PIPE-03 (embedding length 1024, non-null)
- [ ] `tests/seed/uniqueness.test.ts` — stubs for PIPE-03 (unique daily_date, slug)
- [ ] `playwright.config.ts` — Playwright configuration targeting local dev server
- [ ] `vitest.config.ts` — Vitest configuration for integration/unit tests
- [ ] Framework install: `npm install --save-dev playwright vitest @playwright/test @vitest/coverage-v8 tsx`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth sign-in redirects to /auth/callback and establishes session | AUTH-02 | OAuth redirect cannot be fully automated without Google test account bypassing consent screen | 1. Click "Sign in with Google" 2. Complete OAuth flow 3. Verify redirect to app 4. Verify session in Supabase dashboard |
| Apple OAuth sign-in redirects to /auth/callback and establishes session | AUTH-03 | Requires Apple Developer account + device; consent screen cannot be bypassed in CI | 1. Click "Sign in with Apple" 2. Complete OAuth flow on Apple device 3. Verify redirect to app 4. Verify session in Supabase dashboard |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
