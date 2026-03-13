# Phase 1: Foundation - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the Next.js 15 / Supabase project scaffold, define the database schema, seed the database with ~100 curated words (full editorial content), and wire up Supabase Auth (email/password, Google OAuth, Apple OAuth). The app must be deployable to Vercel with CI passing. Content display, activities, and gamification are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Seed data content
- All ~100 seed words must have full production-ready editorial content: definition, executive summary, where/how used, usage examples, and a "Heard in the Wild" citation with source link
- No placeholder or stub data — seed words are real day-1 content visible to users

### Seed data generation
- All ~100 words are AI-generated using Claude in a single seed script run
- The seed script calls Claude once per word to produce the full editorial content
- Claude assigns a category from a fixed predefined list (e.g. Strategy, Tech, Finance, HR, Operations) — not free-form tags

### Seed script behavior
- Idempotent and re-runnable: script checks for existing words by slug/title and skips them
- Safe to run in CI or if interrupted mid-seed — no duplicate inserts

### Word dating
- Each seed word is assigned a unique past calendar date (spread across the last ~100 days)
- Archive and daily word routing work immediately without special handling

### Vector embeddings
- Embeddings are generated during seeding — seed script calls an embedding model per word and stores vectors
- No Phase 5 backfill needed; seed words are fully integrated when the AI pipeline runs

### Claude's Discretion
- Auth UI layout (dedicated pages vs. modal, sign-in/sign-up routes)
- Post-auth redirect behavior
- Project folder structure and route conventions
- Supabase schema naming, RLS policy approach
- Exact fixed category list values
- Embedding model choice (text-embedding-3-small or Supabase built-in)

</decisions>

<specifics>
## Specific Ideas

- Seed script should feel like a proper data migration — idempotent, logged, safe to re-run
- Categories must support Phase 2 archive filtering, so they need to be consistent/enum-like from day one

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the patterns all subsequent phases follow

### Integration Points
- Supabase Auth will be the auth provider for all subsequent phases
- Database schema defined here is the contract all subsequent phases build on
- Seed words' category field must align with Phase 2 archive filter UI

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-12*
