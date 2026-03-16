# Milestones

## v1.0 MVP (Shipped: 2026-03-16)

**Phases completed:** 8 phases, 34 plans
**Timeline:** 2026-03-12 → 2026-03-16 (4 days)
**Files:** 227 files, 32,548 insertions | ~5,051 TypeScript LOC
**Commits:** 134

**Key accomplishments:**
- Shipped full-stack daily vocabulary PWA: daily word with editorial content (exec summary, context, examples, "Heard in the Wild"), searchable/filterable archive, and server-rendered SEO pages with dynamic OG images
- Auth system with email/password + Google OAuth (Supabase SSR cookie bridge), session persistence, email confirmation flow
- Four interactive memorization activities (Flashcard, Fill-blank, Context Match, AI sentence feedback) with gamification: points, streak counter, daily badge, mastery ratings, favorites, activity history
- Automated daily word generation pipeline: Hacker News signals → Claude (structured output) → VoyageAI 1024-dim embeddings → pgvector cosine deduplication → idempotent insert at 02:00 UTC
- Push notifications (VAPID web push, configurable time), email digest (Resend), service worker offline cache, PWA installable to home screen
- Full audit-and-close cycle: initial audit found 3 integration bugs; Phases 6–8 closed all gaps (OG edge runtime, PracticeSection on word pages, rate limiting, documentation accuracy)

**Known gaps (accepted as tech debt):**
- AUTH-03: Apple OAuth deferred — code wired, Apple Developer account not configured post-v1
- NOTF-01: Push notification dispatch uses UTC hour matching; stored timezone not applied — non-UTC users receive push at wrong local time

---
