# Let's Take This Offline

## What This Is

Let's Take This Offline is a daily vocabulary Progressive Web App for business and technology professionals. Each day, a new buzzword or phrase is surfaced automatically via AI (Hacker News signals → Claude structured output → VoyageAI semantic dedup → Vercel Cron) and presented with a definition, executive-style context, real-world examples, and four interactive memorization activities. Content is publicly accessible; optional accounts unlock streaks, points, badges, favorites, mastery ratings, and daily notifications. The app is installable as a PWA with offline support for today's word.

## Core Value

Users can open Let's Take This Offline for two minutes each day and walk away actually understanding (and able to use) a piece of business or tech jargon they've been nodding along to in meetings.

## Requirements

### Validated

- ✓ Daily word page with full editorial content (header, exec summary, where/how used, examples, Heard in the Wild) — v1.0
- ✓ Interactive memorization activities: Flashcard Flip, Fill-in-the-Blank, Use It in a Sentence (AI feedback), Context Match — v1.0
- ✓ Streak & gamification system (points per activity, daily badge, streak counter) — v1.0
- ✓ Word archive: browsable, searchable, filterable by keyword/category/date — v1.0
- ✓ Optional user accounts (email/password, Google OAuth) — v1.0
- ✓ Favorites, activity tracking, and mastery ratings for logged-in users — v1.0
- ✓ AI word generation pipeline with Hacker News signals via Claude — v1.0
- ✓ Vector embedding-based deduplication to prevent near-duplicate words — v1.0
- ✓ Seed database with ~100 curated words to bootstrap before pipeline is live — v1.0
- ✓ Daily email digest notifications via Resend — v1.0
- ✓ Dynamic OG images per word via Vercel OG (edge runtime) — v1.0
- ✓ PWA: installable, offline support for today's word via service worker — v1.0
- ✓ Dark mode (system preference default, manual toggle) — v1.0
- ✓ SEO: server-rendered word pages with proper meta tags — v1.0
- ✓ Web push notifications at user-configurable time (VAPID, timezone stored) — v1.0 *(timezone dispatch gap: stored but not applied in cron — v2 fix)*

### Active

*(None for v2.0 yet — run `/gsd:new-milestone` to define)*

### Deferred from v1.0

- Apple OAuth (AUTH-03) — code wired, Apple Developer account not configured. Carry to v2.0.
- Push notification timezone dispatch — `notify_hour` stored with timezone but dispatch cron uses UTC matching. Fix in v2.0.
- `sentence_feedback_calls` table missing from `database.types.ts` — maintenance gap. Fix in v2.0.

### Out of Scope

- Social features (leaderboards, profile sharing, friend comparisons) — deferred to v2
- User-submitted word suggestions — deferred to v2
- Native iOS/Android apps — PWA sufficient for v1
- Spaced repetition system — deferred to v2
- Monetization / premium tier — deferred to v2
- Multi-language support — deferred to v2
- Full admin content management UI — automated pipeline covers v1; admin tooling in v2
- Podcast / audio pronunciation — deferred to v2
- Admin word-queue review UI — fully automated pipeline in v1

## Context

- **Shipped:** v1.0 MVP — 2026-03-16 (4 days, 8 phases, 34 plans, 134 commits, 227 files, ~5,051 TypeScript LOC)
- **Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase (auth + pgvector), Anthropic Claude (`claude-opus-4-5` for pipeline, `claude-haiku-4-5-20251001` for sentence feedback), VoyageAI (`voyage-3.5` for 1024-dim embeddings), Vercel (hosting + cron), Resend (email)
- **Sequencing decision:** UI-first approach — built full frontend with seed data before activating AI pipeline. Validated: reduced risk and let activities be tested with known content.
- **Open questions resolved:**
  - Deduplication: semantic similarity via pgvector cosine distance (threshold 0.15) — catches near-duplicates string matching misses
  - "Heard in the Wild": paraphrased citation with source link — adds credibility
  - Rate limiting: 10 sentence-feedback calls/user/day, tracked in `sentence_feedback_calls` table
  - Notifications: VAPID web push + Resend email; timezone stored at subscribe time (dispatch UTC gap noted)
  - OG images: dynamic per-word via `next/og` with Edge runtime — required `export const runtime = 'edge'`
- **Target users:** Business professionals (primary), tech professionals (secondary), early-career (tertiary)
- **Key UX constraint:** Content must be skimmable in 2 minutes; single scroll page, no tabs

## Constraints

- **Tech Stack**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Supabase, Anthropic Claude, Vercel — do not deviate without strong reason
- **AI dependencies**: Sentence feedback requires AI call (<5s target); word pipeline is pre-generated and never blocks page load
- **Performance**: LCP < 2.5s on 4G mobile; PWA must pass Lighthouse PWA audit
- **Accessibility**: WCAG 2.1 AA minimum; all interactive elements keyboard-accessible
- **Content moderation**: "Use it in a Sentence" requires login to prevent abuse; rate-limited 10/user/day
- **Vercel Pro required** for hourly cron (push dispatch) — Hobby plan allows only 1 cron/day

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| UI-first sequencing | Ship real user value fast with seed data; de-risk AI pipeline separately | ✓ Good — activities tested with known content before pipeline activated |
| Fully automated AI pipeline in v1 (no admin review UI) | Simpler launch; admin tooling in v2 | ✓ Good — zero manual intervention required at runtime |
| Vector embeddings for deduplication | Catches semantic duplicates that string matching misses | ✓ Good — 0.15 cosine distance threshold works well with voyage-3.5 |
| Cite "Heard in the Wild" sources | Adds credibility; paraphrase avoids copyright | ✓ Good |
| User timezone stored for notifications | 8 AM UTC = 3 AM Eastern — must be local time for good UX | ⚠️ Revisit — timezone stored correctly but push-dispatch cron ignores it; non-UTC users receive at wrong time |
| Dynamic OG images via Vercel OG | Word pages need rich social previews; minimal extra work on Vercel | ✓ Good — edge runtime required (`export const runtime = 'edge'`) |
| Dedicated auth pages (not modals) | SSR redirect flows and deep-linking work reliably | ✓ Good |
| Supabase SSR cookie bridge in middleware | Session refresh on every request without client round-trip | ✓ Good — consistent pattern across all 8 phases |
| Wave 0 test stubs → `it.skip` (not `expect(false)`) | CI exits 0; stubs document intent without failing | ✓ Good — fixed in Phase 08 |
| Audit-then-close-gaps cycle | Identify integration issues before archiving | ✓ Good — caught OG runtime bug, PracticeSection gap, timezone issue |

---
*Last updated: 2026-03-16 after v1.0 milestone*
