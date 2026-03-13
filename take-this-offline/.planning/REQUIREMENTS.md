# Requirements: Let's Take This Offline

**Defined:** 2026-03-12
**Core Value:** Users can open Let's Take This Offline for two minutes each day and walk away actually understanding (and able to use) a piece of business or tech jargon they've been nodding along to in meetings.

## v1 Requirements

### Content

- [ ] **CONT-01**: User can view today's word page with header, executive summary, where/how used, and usage examples
- [ ] **CONT-02**: User can view "Heard in the Wild" section with paraphrased citation and source link
- [ ] **CONT-03**: User can browse the word archive (paginated list of all past words)
- [ ] **CONT-04**: User can search the archive by keyword
- [ ] **CONT-05**: User can filter the archive by category and date

### Activities

- [ ] **ACTV-01**: User can flip a flashcard to reveal/hide the definition
- [ ] **ACTV-02**: User can complete a fill-in-the-blank activity for the day's word
- [ ] **ACTV-03**: User can submit a sentence using the day's word and receive AI feedback (login required, rate-limited)
- [ ] **ACTV-04**: User can complete a context match activity
- [ ] **ACTV-05**: User sees a "completed today" state after finishing all activities

### Auth

- [ ] **AUTH-01**: User can sign up and sign in with email and password
- [ ] **AUTH-02**: User can sign in with Google OAuth
- [ ] **AUTH-03**: User can sign in with Apple OAuth
- [ ] **AUTH-04**: User session persists across browser refresh

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
- [ ] **PIPE-03**: System seeds the database with ~100 curated words before pipeline is live

### Platform

- [ ] **PLAT-01**: App is installable as a PWA with home screen icon
- [ ] **PLAT-02**: Today's word is available offline via service worker cache
- [ ] **PLAT-03**: App supports dark mode (system preference default, manual toggle)
- [ ] **PLAT-04**: Word pages are server-rendered with proper meta tags for SEO
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

*(Populated during roadmap creation)*

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | — | Pending |
| CONT-02 | — | Pending |
| CONT-03 | — | Pending |
| CONT-04 | — | Pending |
| CONT-05 | — | Pending |
| ACTV-01 | — | Pending |
| ACTV-02 | — | Pending |
| ACTV-03 | — | Pending |
| ACTV-04 | — | Pending |
| ACTV-05 | — | Pending |
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| GAME-01 | — | Pending |
| GAME-02 | — | Pending |
| GAME-03 | — | Pending |
| GAME-04 | — | Pending |
| GAME-05 | — | Pending |
| GAME-06 | — | Pending |
| NOTF-01 | — | Pending |
| NOTF-02 | — | Pending |
| NOTF-03 | — | Pending |
| PIPE-01 | — | Pending |
| PIPE-02 | — | Pending |
| PIPE-03 | — | Pending |
| PLAT-01 | — | Pending |
| PLAT-02 | — | Pending |
| PLAT-03 | — | Pending |
| PLAT-04 | — | Pending |
| PLAT-05 | — | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 0 (roadmap not yet created)
- Unmapped: 31 ⚠️

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after initial definition*
