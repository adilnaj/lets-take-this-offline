---
phase: 3
slug: activities-and-gamification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| **Config file** | `vitest.config.ts` (unit: `tests/**/*.test.ts`), `playwright.config.ts` (E2E: `tests/**/*.spec.ts`) |
| **Quick run command** | `npx vitest run tests/activities/ tests/gamification/` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30 seconds (unit) + ~60 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/activities/ tests/gamification/`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | ACTV-01 | unit | `npx vitest run tests/activities/flashcard.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 0 | ACTV-02 | unit | `npx vitest run tests/activities/fill-blank.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 0 | ACTV-03 | unit | `npx vitest run tests/activities/sentence-feedback.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 0 | ACTV-04 | unit | `npx vitest run tests/activities/context-match.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 0 | ACTV-05 | unit | `npx vitest run tests/activities/completion-banner.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 0 | GAME-01 | unit | `npx vitest run tests/gamification/points.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 0 | GAME-02 | unit | `npx vitest run tests/gamification/badge.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 0 | GAME-03 | unit | `npx vitest run tests/gamification/streak.test.ts` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 0 | GAME-04 | E2E | `npx playwright test tests/profile/favorites.spec.ts` | ❌ W0 | ⬜ pending |
| 3-03-02 | 03 | 0 | GAME-05 | E2E | `npx playwright test tests/profile/history.spec.ts` | ❌ W0 | ⬜ pending |
| 3-03-03 | 03 | 0 | GAME-06 | unit | `npx vitest run tests/gamification/mastery.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/activities/flashcard.test.ts` — stubs for ACTV-01
- [ ] `tests/activities/fill-blank.test.ts` — stubs for ACTV-02
- [ ] `tests/activities/sentence-feedback.test.ts` — stubs for ACTV-03
- [ ] `tests/activities/context-match.test.ts` — stubs for ACTV-04
- [ ] `tests/activities/completion-banner.test.ts` — stubs for ACTV-05
- [ ] `tests/gamification/points.test.ts` — stubs for GAME-01
- [ ] `tests/gamification/badge.test.ts` — stubs for GAME-02
- [ ] `tests/gamification/streak.test.ts` — stubs for GAME-03
- [ ] `tests/profile/favorites.spec.ts` — Playwright stubs for GAME-04
- [ ] `tests/profile/history.spec.ts` — Playwright stubs for GAME-05
- [ ] `tests/gamification/mastery.test.ts` — stubs for GAME-06

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AI sentence feedback tone (witty, tongue-in-cheek) | ACTV-03 | Subjective quality — cannot be automated | Submit a sentence; verify response is 2-3 sentences, witty in tone |
| Inline login prompt inside sentence card (no redirect) | ACTV-03 | UI/UX behavior — logged-out user sees prompt inside card | Load page logged out; verify sentence card shows inline login prompt |
| Celebratory banner appears after all 4 complete | ACTV-05 | Full integration test across DB + UI | Complete all 4 activities logged in; verify banner shows badge + points + streak |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
