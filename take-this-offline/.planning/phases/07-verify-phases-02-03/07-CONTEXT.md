# Phase 7: Verify Phases 02 and 03 - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce VERIFICATION.md documents for Phase 02 (daily-word-experience) and Phase 03 (activities-and-gamification) confirming whether all assigned requirements are satisfied after Phase 6 fixes. No new features are built. Output is two audit documents plus a gap report if any requirements are unmet.

</domain>

<decisions>
## Implementation Decisions

### Handling unimplemented requirements
- All requirements should be inspected by reading the actual codebase — nothing assumed based on REQUIREMENTS.md status
- GAME-04 (favorites), GAME-05 (activity history), GAME-06 (mastery rating) may be partially built — verifier must check code and determine actual state
- CONT-01 through CONT-05 and PLAT-03/04 should also be verified by code inspection, not assumed complete
- Partial implementation counts as a **gap** — a requirement is only satisfied if ALL acceptance criteria are met
- "Partially built" is classified the same as "not built" for verification purposes

### Verification depth
- Code inspection only — no need to run the app; if the code exists and the logic is correct, it passes
- For UI requirements: both data fetch AND render must be verified (e.g., if a field is queried but not displayed in JSX, it's a gap)
- Auth gating is part of the requirement — requirements marked "login required" must have the corresponding auth guard verified in code

### E2E flow verification
- The Archive → Past Word → Practice flow is verified via code trace, not Playwright tests or manual browser testing
- Trace path: archive query → link generation to /word/[slug] → word data fetch on past word page → what renders on /word/[slug]
- Per Phase 3 decision: activities (PracticeSection) are **excluded** from /word/[slug] — verify this is correct (past word pages show completed-state only, not interactive activities)
- Auth state in navigation: verify that SiteHeader receives user prop on both /archive and /word/[slug] pages (Phase 6 fix) — code path must exist

### Verification output structure
- Two separate files: one for Phase 02, one for Phase 03
- Both files live in .planning/phases/07-verify-phases-02-03/
- Suggested names: 07-phase02-VERIFICATION.md and 07-phase03-VERIFICATION.md
- Gaps documented per-requirement with evidence of what's missing

### Outcome expectations
- Gaps found = acceptable outcome for this phase — VERIFICATION.md documents what's missing
- Gap closure follows standard GSD flow: /gsd:plan-phase 7 --gaps creates fix plans
- Do NOT block phase 7 completion pending all requirements passing — the audit result (pass or gaps) is the deliverable

### Claude's Discretion
- Exact VERIFICATION.md format and structure (beyond the two-file/phase-7-dir decisions above)
- How to weight evidence strength when multiple signals exist
- Order in which requirements are checked within each phase

</decisions>

<specifics>
## Specific Ideas

- The Phase 6 archive fix (getUser() called in archive page, user passed to SiteHeader) is a key integration point — the E2E trace should confirm this code path is present
- Partial counts as failed: don't give credit for half-built features (e.g., favorites DB table exists but no UI = gap)

</specifics>

<code_context>
## Existing Code Insights

### Integration Points
- Phase 02 verification should inspect: src/app/page.tsx (today's word), src/app/archive/page.tsx, src/app/word/[slug]/page.tsx, src/lib/words.ts
- Phase 03 verification should inspect: src/app/profile/page.tsx (if it exists), src/components/PracticeSection (activities), src/lib/activities.ts, src/app/api/activities/, Supabase migrations for user_activity/user_stats/user_favorites/word_mastery tables
- SiteHeader auth check: src/components/site-header.tsx — verify user prop flows from both archive and word pages

### Key Phase 6 Fix to Verify
- Archive page (src/app/archive/page.tsx): must call createClient() + auth.getUser() and pass user to SiteHeader

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-verify-phases-02-03*
*Context gathered: 2026-03-15*
