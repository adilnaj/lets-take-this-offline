# Roadmap: Let's Take This Offline

## Overview

Build the full v1.0 daily vocabulary PWA using a UI-first sequence: stand up the project scaffold and seed database first, then deliver the core content experience, then layer in interactive activities and gamification, then add re-engagement mechanics (notifications and PWA install), and finally activate the AI pipeline that will generate words automatically going forward. Each phase delivers a coherent, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffold, database schema, seed data, and user auth (completed 2026-03-13)
- [ ] **Phase 2: Daily Word Experience** - Core content pages, archive, SEO, OG images, and dark mode
- [ ] **Phase 3: Activities and Gamification** - Interactive memorization loop with points, streaks, favorites, and mastery
- [ ] **Phase 4: Notifications and PWA** - Web push, email digest, offline support, and home screen install
- [ ] **Phase 5: AI Pipeline** - Automated daily word generation with vector deduplication

## Phase Details

### Phase 1: Foundation
**Goal**: The project is deployable, the database is live with seed content, and users can create accounts and authenticate
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, PIPE-03
**Success Criteria** (what must be TRUE):
  1. A user can sign up and sign in with email and password
  2. A user can sign in with Google OAuth and Apple OAuth
  3. A user's session persists across browser refreshes without re-login
  4. The database contains approximately 100 curated seed words accessible to the application
  5. The app deploys to Vercel with CI passing and environment variables configured
**Plans**: 5 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 15 project, install all dependencies, set up Supabase client utilities, middleware, and Wave 0 test stubs
- [x] 01-02-PLAN.md — Write and apply initial database schema migration (pgvector, words table, RLS), generate TypeScript types
- [ ] 01-03-PLAN.md — Build auth UI pages (sign-in, sign-up) and route handlers (OAuth callback, email confirm)
- [ ] 01-04-PLAN.md — Build and run idempotent seed script: Claude content generation + Voyage AI embeddings for ~100 words
- [ ] 01-05-PLAN.md — Implement passing E2E auth tests, Vercel deployment config, human verification checkpoint

### Phase 2: Daily Word Experience
**Goal**: Users can read today's word with full editorial content, browse and search the archive, and share word pages with rich social previews
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, PLAT-03, PLAT-04, PLAT-05
**Success Criteria** (what must be TRUE):
  1. A user can open the app and read today's word with header, executive summary, usage context, examples, and a "Heard in the Wild" citation with source link
  2. A user can browse the paginated word archive and navigate to any past word
  3. A user can search the archive by keyword and filter by category and date
  4. Each word page is server-rendered with correct meta tags visible to search engine crawlers
  5. Sharing a word URL on Slack or LinkedIn renders a dynamic OG image with the word and brand — not a generic homepage preview
  6. Dark mode activates automatically from system preference and can be toggled manually
**Plans**: TBD

### Phase 3: Activities and Gamification
**Goal**: Users can complete four interactive memorization activities per word and see their engagement reflected in points, streaks, badges, favorites, and mastery ratings
**Depends on**: Phase 1
**Requirements**: ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06
**Success Criteria** (what must be TRUE):
  1. A user can flip the flashcard, complete fill-in-the-blank, submit a sentence for AI feedback (login required), and complete the context match activity for today's word
  2. After finishing all four activities, the user sees a "completed today" state and cannot re-trigger activities
  3. A logged-in user can see points awarded per activity and a daily badge displayed after completing all activities
  4. A logged-in user can see their current streak counter and it increments correctly on consecutive daily completions
  5. A logged-in user can save and unsave words to favorites and view their activity history across past words with mastery ratings (mastered / learning / seen) per word
**Plans**: TBD

### Phase 4: Notifications and PWA
**Goal**: Users can subscribe to reminders that bring them back daily and install the app to their home screen with offline support for today's word
**Depends on**: Phase 1
**Requirements**: NOTF-01, NOTF-02, NOTF-03, PLAT-01, PLAT-02
**Success Criteria** (what must be TRUE):
  1. A user can subscribe to web push notifications at a configurable local time and receive a push at that hour each day
  2. A user can subscribe to the daily email digest via Resend and receive an email each morning
  3. A user can unsubscribe from either notification channel and stop receiving messages
  4. A user on a supported mobile browser can install the app to their home screen via the PWA install prompt
  5. After visiting once, a user can load today's word page with no network connection
**Plans**: TBD

### Phase 5: AI Pipeline
**Goal**: The app generates a new, non-duplicate word every day automatically with no manual intervention
**Depends on**: Phase 1
**Requirements**: PIPE-01, PIPE-02
**Success Criteria** (what must be TRUE):
  1. A new word is inserted into the database each day via a secured Vercel Cron job that fetches trending signals and calls Claude
  2. Words that are semantically too similar to existing words (cosine similarity above threshold) are rejected before insertion, preventing near-duplicate content from appearing
  3. The cron job is idempotent — running it twice in one day does not insert duplicate words
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

Note: Phases 2 and 3 both depend on Phase 1 only and can be sequenced in either order, but Phase 2 delivers visible content that makes Phase 3 testable in context.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete   | 2026-03-13 |
| 2. Daily Word Experience | 0/TBD | Not started | - |
| 3. Activities and Gamification | 0/TBD | Not started | - |
| 4. Notifications and PWA | 0/TBD | Not started | - |
| 5. AI Pipeline | 0/TBD | Not started | - |

---
*Roadmap created: 2026-03-12 for milestone v1.0*
*Granularity: coarse (5 phases)*
*Coverage: 31/31 v1 requirements mapped*
