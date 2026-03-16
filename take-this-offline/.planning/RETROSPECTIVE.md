# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-16
**Phases:** 8 | **Plans:** 34 | **Timeline:** 4 days (2026-03-12 → 2026-03-16)

### What Was Built
- Full daily vocabulary PWA with AI-generated word content, editorial layout, archive, and SEO
- Auth system (email/password + Google OAuth) with Supabase SSR cookie bridge
- Four interactive memorization activities with full gamification stack (points, streaks, badges, mastery, favorites)
- Automated AI pipeline: HN signals → Claude structured output → VoyageAI dedup → Vercel Cron
- Push notifications (VAPID), email digest (Resend), PWA install, service worker offline cache
- Audit-and-close cycle: audited v1.0, found 3 integration bugs, added 3 gap-closure phases (6-7-8)

### What Worked
- UI-first sequencing with seed data let activities and gamification be built and tested before the pipeline was active
- Wave-based plan execution (research → stub → implement → verify) kept each plan independently verifiable
- Supabase SSR cookie bridge pattern was established early in Phase 1 and reused identically across all auth-gated routes
- Gap-closure phases (6-8) after the initial audit were highly targeted — each plan had exactly 1-3 file changes

### What Was Inefficient
- Phases 02 and 03 were executed without VERIFICATION.md, requiring Phase 07 to retroactively verify — adding one full phase of verification work
- ROADMAP.md progress table for Phases 2 and 4 was not kept up to date (showed "In Progress" after completion)
- sentence_feedback_calls table (Phase 07 migration) was not added to database.types.ts — left as an untyped .from() call
- Push notification timezone handling stored correctly but was never applied in dispatch cron — discovered only at integration check

### Patterns Established
- Every phase produces a VERIFICATION.md before moving to the next phase (Phase 07 retroactive verification was painful)
- Wave 0 test stubs should use `it.skip` with rationale comments from the start — not `expect(false).toBe(true)` that fail CI
- Integration gap between planning and implementation: "store timezone" appeared in requirements and schema but was never connected in the cron dispatch — integration checkers catch this
- Auth-gated API routes: consistent pattern of `supabase.auth.getUser()` + 401 on null user established in Phase 3 and reused in Phase 4 and 7

### Key Lessons
1. **Verify as you go, not retroactively.** Phases 02 and 03 missing VERIFICATION.md added a full phase (07) of audit work. The cost of writing VERIFICATION.md at phase completion is low; the cost of retroactive verification is high.
2. **Integration checkers surface schema-to-code gaps.** The push timezone issue was in the codebase the whole time — stored correctly, never used. Static code review missed it; cross-phase integration check caught it.
3. **Gap-closure phases are worth planning properly.** Phases 6-8 were small (3 plans each) but had the highest signal-to-effort ratio of the milestone — they turned a `gaps_found` audit into `tech_debt`.

### Cost Observations
- Model mix: Sonnet for most execution; Opus for planning and verification agents
- Sessions: ~15 estimated across 4 days
- Notable: The audit-then-close-gaps cycle doubled the effective phase count (5 → 8) but produced a clean v1.0 with all requirements verifiably satisfied

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 8 | 34 | First milestone; audit cycle added 3 gap-closure phases post-initial-build |

### Cumulative Quality

| Milestone | Tests | Vitest Exit | VERIFICATION.md Coverage |
|-----------|-------|-------------|--------------------------|
| v1.0 | 16 passing, 4 skipped, 43 todo | 0 | 8/8 phases verified |

### Top Lessons (Verified Across Milestones)

1. Verify each phase before starting the next — retroactive verification is expensive.
2. Integration checkers reveal schema/code divergence that phase-level verification misses.
