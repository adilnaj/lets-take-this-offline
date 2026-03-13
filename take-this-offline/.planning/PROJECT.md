# Let's Take This Offline

## What This Is

Let's Take This Offline is a daily vocabulary Progressive Web App for business and technology professionals. Each day, a single buzzword or phrase is surfaced — sourced automatically via AI from trending news and tech blogs — and presented with a definition, executive-style context, real-world examples, and interactive memorization activities. Content is publicly accessible; optional accounts unlock streaks, favorites, and daily notifications.

## Core Value

Users can open Let's Take This Offline for two minutes each day and walk away actually understanding (and able to use) a piece of business or tech jargon they've been nodding along to in meetings.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Daily word page with full editorial content (header, executive summary, where/how used, examples, Heard in the Wild)
- [ ] Interactive memorization activities: Flashcard Flip, Fill-in-the-Blank, Use It in a Sentence, Context Match
- [ ] Streak & gamification system (points per activity, daily badge, streak counter)
- [ ] Word archive: browsable, searchable, filterable by keyword/category/date
- [ ] Optional user accounts (email/password, Google OAuth, Apple OAuth)
- [ ] Favorites, activity tracking, and mastery ratings for logged-in users
- [ ] AI word generation pipeline with trending signal sources (news APIs, Hacker News)
- [ ] Vector embedding-based deduplication to prevent near-duplicate words
- [ ] Seed database with ~100 curated words to bootstrap before pipeline is live
- [ ] Web push notifications at user-configurable local time (timezone stored)
- [ ] Daily email digest notifications via Resend
- [ ] Dynamic OG images per word via Vercel OG
- [ ] PWA: installable, offline support for today's word via service worker
- [ ] Dark mode (system preference default, manual toggle)
- [ ] SEO: server-rendered word pages with proper meta tags

### Out of Scope

- Social features (leaderboards, profile sharing, friend comparisons) — deferred to v2
- User-submitted word suggestions — deferred to v2
- Native iOS/Android apps — PWA sufficient for v1
- Spaced repetition system — deferred to v2
- Monetization / premium tier — deferred to v2
- Multi-language support — deferred to v2
- Full admin content management UI — basic queue-review acceptable, full CMS deferred
- Podcast / audio pronunciation — deferred to v2
- Admin word-queue review UI — fully automated pipeline in v1, admin tooling in v2

## Context

- **PRD version:** 1.0 (2026-03-12) — highly detailed, covers data models, routes, and stack
- **Sequencing decision:** UI-first approach — build the full front-end experience with seed word data, then layer the AI pipeline in later
- **Open questions resolved:**
  - Deduplication: semantic similarity via vector embeddings (not string matching)
  - "Heard in the Wild": cite the source topic with a link (adds credibility)
  - Rate limiting: per-user daily allowance for "Use it in a Sentence" (login already required)
  - Notifications: store user timezone, fire push at their configured local time
  - OG images: dynamic per-word via `@vercel/og`
- **Target users:** Business professionals (primary), tech professionals (secondary), early-career (tertiary)
- **Key UX constraint:** Content must be skimmable in 2 minutes; single scroll page, no tabs

## Constraints

- **Tech Stack**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Supabase (auth + DB), Anthropic Claude API (`claude-sonnet-4-6`), Vercel — PRD-specified, do not deviate without strong reason
- **AI dependencies**: Sentence feedback requires AI call (<5s target); word pipeline is pre-generated and never blocks page load
- **Performance**: LCP < 2.5s on 4G mobile; PWA must pass Lighthouse PWA audit
- **Accessibility**: WCAG 2.1 AA minimum; all interactive elements keyboard-accessible
- **Content moderation**: "Use it in a Sentence" requires login to prevent abuse; rate-limited per user per day

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| UI-first sequencing | Ship real user value fast with seed data; de-risk AI pipeline separately | — Pending |
| Fully automated AI pipeline in v1 (no admin review UI) | Simpler launch; admin tooling in v2 | — Pending |
| Vector embeddings for deduplication | Catches semantic duplicates that string matching misses | — Pending |
| Cite "Heard in the Wild" sources | Adds credibility; paraphrase avoids copyright | — Pending |
| User timezone stored for notifications | 8 AM UTC = 3 AM Eastern — must be local time for good UX | — Pending |
| Dynamic OG images via Vercel OG | Word pages need rich social previews; minimal extra work on Vercel | — Pending |

## Current Milestone: v1.0 Initial Build

**Goal:** Ship the full Let's Take This Offline v1.0 — daily word experience, interactive activities, gamification, accounts, notifications, AI pipeline, and PWA.

**Target features:**
- Daily word page with full editorial content
- Interactive memorization activities (Flashcard Flip, Fill-in-the-Blank, Use It in a Sentence, Context Match)
- Streak & gamification system
- Word archive (browsable, searchable, filterable)
- Optional user accounts (email/password, Google OAuth, Apple OAuth)
- Favorites, activity tracking, mastery ratings
- AI word generation pipeline + vector deduplication
- Seed database (~100 curated words)
- Web push + email digest notifications
- Dynamic OG images, PWA, dark mode, SEO

---
*Last updated: 2026-03-12 after v1.0 milestone started*
