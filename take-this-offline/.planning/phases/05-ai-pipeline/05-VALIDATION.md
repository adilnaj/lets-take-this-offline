---
phase: 5
slug: ai-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (exists, `@/` alias configured, `environment: node`) |
| **Quick run command** | `npx vitest run tests/pipeline/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/pipeline/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 0 | PIPE-01, PIPE-02 | unit | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 1 | PIPE-01 | unit | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 1 | PIPE-01 | unit | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-02-03 | 02 | 1 | PIPE-01 | unit | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 1 | PIPE-02 | unit | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-03-02 | 03 | 1 | PIPE-02 | unit | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-04-01 | 04 | 2 | PIPE-01, PIPE-02 | integration (mock) | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |
| 5-04-02 | 04 | 2 | PIPE-01, PIPE-02 | integration (mock) | `npx vitest run tests/pipeline/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/pipeline/pipeline.test.ts` — stubs for PIPE-01 + PIPE-02 (idempotency, buildPrompt, dedup logic, auth guard)
- [ ] No new framework or config changes needed — existing `vitest.config.ts` already covers `tests/**/*.test.ts`

*Existing infrastructure covers vitest setup; only the test file needs to be created.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cron fires at 02:00 UTC and inserts a new word | PIPE-01 | Requires live Vercel deployment, Claude API, and VoyageAI API keys | Trigger cron via Vercel dashboard or `curl -H "Authorization: Bearer $CRON_SECRET" https://<project>.vercel.app/api/cron/generate-word`; confirm new row in `words` table |
| Second invocation same day returns `{ skipped: true }` | PIPE-01 | Requires live deployment | Run cron twice same day; verify DB has only one row for `daily_date` |
| Duplicate word is rejected by semantic dedup | PIPE-02 | Requires live VoyageAI + Supabase | Insert a word manually, then run cron with a prompt known to generate a semantically similar word; verify `skipped` response |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
