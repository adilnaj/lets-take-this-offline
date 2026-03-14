# Requirements: Let's Take This Offline

**Defined:** 2026-03-12
**Core Value:** Users can open Let's Take This Offline for two minutes each day and walk away actually understanding (and able to use) a piece of business or tech jargon they've been nodding along to in meetings.

## v1 Requirements

### Content

- [x] **CONT-01**: User can view today's word page with header, executive summary, where/how used, and usage examples
- [x] **CONT-02**: User can view "Heard in the Wild" section with paraphrased citation and source link
- [x] **CONT-03**: User can browse the word archive (paginated list of all past words)
- [x] **CONT-04**: User can search the archive by keyword
- [x] **CONT-05**: User can filter the archive by category and date

### Activities

- [ ] **ACTV-01**: User can flip a flashcard to reveal/hide the definition
- [ ] **ACTV-02**: User can complete a fill-in-the-blank activity for the day's word
- [ ] **ACTV-03**: User can submit a sentence using the day's word and receive AI feedback (login required, rate-limited)
- [ ] **ACTV-04**: User can complete a context match activity
- [ ] **ACTV-05**: User sees a "completed today" state after finishing all activities

### Auth

- [x] **AUTH-01**: User can sign up and sign in with email and password
- [x] **AUTH-02**: User can sign in with Google OAuth
- [x] **AUTH-03**: User can sign in with Apple OAuth
- [x] **AUTH-04**: User session persists across browser refresh

### Gamification

- [ ] **GAME-01**: User earns points for each activity completed
- [ ] **GAME-02**: User earns a daily badge after completing all activities
- [ ] **GAME-03**: User can view their current streak counter
- [ ] **GAME-04**: User can save words to favorites (login required)
- [ ] **GAME-05**: User can view activity history across past words (login required)
- [ ] **GAME-06**: User can see a mastery rating (mastered / learning / seen) per word (login required)

### Notifications

- [ ] **NOTF-01**: User can subscribe to web push notifications at a configurable local time (timezone stored)
- [ ] **NOTF-02**: User can subscribe to daily email digest via Resend
- [ ] **NOTF-03**: User can unsubscribe from any notification channel

### AI Pipeline

- [ ] **PIPE-01**: System generates a new word daily from trending news/Hacker News signals via Claude
- [ ] **PIPE-02**: System deduplicates new words against existing words using vector embeddings (pgvector, cosine similarity)
- [x] **PIPE-03**: System seeds the database with ~100 curated words before pipeline is live

### Platform

- [ ] **PLAT-01**: App is installable as a PWA with home screen icon
- [ ] **PLAT-02**: Today's word is available offline via service worker cache
- [x] **PLAT-03**: App supports dark mode (system preference default, manual toggle)
- [x] **PLAT-04**: Word pages are server-rendered with proper meta tags for SEO
- [ ] **PLAT-05**: Each word page has a dynamic OG image generated via Vercel OG

## v2 Requirements

### Social

- Social features (leaderboards, profile sharing, friend comparisons)
- User-submitted word suggestions

### Advanced Learning

- Spaced repetition system (SRS)
- Full admin content management UI
- Admin word-queue review UI

### Platform

- Native iOS/Android apps (PWA sufficient for v1)
- Podcast / audio pronunciation
- Multi-language support

### Monetization

- Premium tier / monetization

## Out of Scope

| Feature | Reason |
|---------|--------|
| Leaderboards | Professional audience; social anxiety risk; anti-feature per research |
| User-submitted words | Moderation cost; AI pipeline is higher quality |
| Native apps | PWA install sufficient for one-visit-per-day pattern |
| SRS engine | Requires large word depth to be effective; lightweight mastery rating is sufficient for v1 |
| Full admin CMS | Fully automated pipeline in v1; admin tooling in v2 |
| Audio pronunciation | Deferred to v2 |
| Multi-language | Deferred to v2 |
| Monetization | Deferred to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-03 | Phase 2 | Complete |
| CONT-04 | Phase 2 | Complete |
| CONT-05 | Phase 2 | Complete |
| ACTV-01 | Phase 3 | Pending |
| ACTV-02 | Phase 3 | Pending |
| ACTV-03 | Phase 3 | Pending |
| ACTV-04 | Phase 3 | Pending |
| ACTV-05 | Phase 3 | Pending |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| GAME-01 | Phase 3 | Pending |
| GAME-02 | Phase 3 | Pending |
| GAME-03 | Phase 3 | Pending |
| GAME-04 | Phase 3 | Pending |
| GAME-05 | Phase 3 | Pending |
| GAME-06 | Phase 3 | Pending |
| NOTF-01 | Phase 4 | Pending |
| NOTF-02 | Phase 4 | Pending |
| NOTF-03 | Phase 4 | Pending |
| PIPE-01 | Phase 5 | Pending |
| PIPE-02 | Phase 5 | Pending |
| PIPE-03 | Phase 1 | Complete |
| PLAT-01 | Phase 4 | Pending |
| PLAT-02 | Phase 4 | Pending |
| PLAT-03 | Phase 2 | Complete |
| PLAT-04 | Phase 2 | Complete |
| PLAT-05 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 — traceability populated after roadmap creation*
