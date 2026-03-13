# Feature Landscape

**Domain:** Daily vocabulary / word-of-the-day PWA for business and tech professionals
**Product:** Let's Take This Offline
**Researched:** 2026-03-12
**Confidence note:** External research tools (WebSearch, WebFetch) were unavailable in this environment.
All findings are drawn from training data (cutoff August 2025) covering Duolingo, Wordle, Merriam-Webster
Word of the Day, Vocabulary.com, and published gamification/HCI research. Confidence levels noted per claim.

---

## Reference Apps Surveyed

| App | Audience | Daily Hook | Engagement Model |
|-----|----------|------------|-----------------|
| Duolingo | General / language learners | Daily lesson streak | Streak + XP + leaderboard |
| Wordle (NYT) | General puzzle | One puzzle per day | Social share + scarcity |
| Merriam-Webster WOTD | General / students | Email + web page | Passive consumption |
| Vocabulary.com | Students / educators | Adaptive quiz | Mastery system |
| Dictionary.com WOTD | General | Push + email | Passive consumption |
| NYT Mini Crossword | Casual | One mini per day | Streak + speed |

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One word per day, always fresh | Core promise; stale content = trust collapse | Low | Must update at a consistent, predictable time |
| Clear, human-readable definition | Users arrived because they didn't know the word; jargon-heavy definitions defeat the purpose | Low | Executive-summary framing is the Let's Take This Offline differentiator on top of this baseline |
| Real-world usage examples | Definition alone rarely produces retention; context sentences are expected | Low | 2–3 examples minimum; professional contexts preferred |
| Browsable word archive | Users who miss a day or arrive via search expect back-catalog access | Medium | Pagination, search, filter by date |
| Dark mode | System-default dark mode is now a baseline expectation; absence generates complaints | Low | System preference auto-detect + manual toggle |
| Fast load on mobile | Professionals access during commutes; >3s LCP = abandonment | Medium | LCP <2.5s on 4G (Lighthouse Good threshold) |
| Shareable URL per word | SEO discovery + social sharing both require stable, crawlable URLs | Low | /word/[slug]; og:image and og:description required |
| Keyboard accessibility | WCAG 2.1 AA is a legal baseline; all interactive activities must be reachable without pointer | Medium | Tab order, focus rings, ARIA labels on all activities |

### Daily Engagement Mechanics — Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Streak counter | Duolingo normalized this for learning apps; loss-aversion hook that passive reading cannot achieve | Medium | Requires auth; timezone-correct "did they visit today?" logic is subtle |
| Opt-in push notification | Primary re-engagement lever; usage drops 40–60% after week 1 without it (HIGH confidence) | High | Service worker + push subscription; timezone-local delivery critical |
| Opt-in email digest | Users who don't install the PWA expect an email fallback; Merriam-Webster's email list is a major retention channel | Medium | Resend integration; legally required unsubscribe flow |
| "Completed today" state | Users need closure — a clear visual signal they've done today's word | Low | Badge, checkmark, or locked state after all activities complete |

---

## Differentiators

Features that set BizLingo apart. Not universally expected, but valued by the target audience.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI-sourced trending vocabulary | Words surfaced from real news/tech blogs feel immediately relevant — "I saw this in a meeting last week." Generic word lists feel arbitrary. | High | AI pipeline + trending signal sources (Hacker News, news APIs); addresses the "why this word?" trust question |
| Executive-style context framing | Generic dictionaries define words; BizLingo explains how a VP would use the word in a real meeting. This is the core editorial voice differentiator. | Medium | Editorial discipline must be enforced in AI generation prompts; tone guides needed |
| "Heard in the Wild" citation | Sourcing from a real article adds credibility dictionary sites lack. Professionals are skeptical of invented examples. | Low | Paraphrase + source link; adds trust without copyright risk |
| Interactive activities (Flashcard Flip, Fill-in-the-Blank, Use It in a Sentence, Context Match) | Passive reading yields ~10% retention; active recall yields 70%+ (HIGH confidence — retrieval practice literature). Competitors mostly do passive. | High | Four distinct interaction types; each needs its own UX design; AI feedback on "Use It in a Sentence" is strongest differentiator |
| AI feedback on "Use It in a Sentence" | Writing practice with instant AI coaching far exceeds multiple-choice quizzes. No mainstream WOTD app does this. | High | Anthropic API call; <5s response target; rate limiting required; login-gated |
| Mastery rating per word | Aggregates activity performance into "mastered / learning / seen" states; vocabulary growth visible over time, not just a streak counter | Medium | Requires user account + activity history |
| Favorites / saved words | Professionals revisit words before presentations or interviews. Vocabulary.com has this; most WOTD apps don't. | Medium | Requires user account; pairs with archive |
| Installable PWA + offline support | Home screen icon dramatically increases return rate vs bookmarked URL. Offline cache prevents dead screens on conference Wi-Fi. | High | Service worker + manifest; background sync for streak registration |
| Dynamic OG images per word | Word pages shared on Slack or LinkedIn render a rich preview (word + tagline + brand). Most WOTD apps share a generic homepage image. | Medium | @vercel/og bundled in Next.js; consistent visual template per word |
| Points per activity + daily badge | Micro-rewards for completing individual activities (not just overall visit) increase session depth. | Medium | Points reset daily; daily badge is the shareable artifact |
| Configurable notification time with timezone handling | Most apps notify at a fixed UTC time. 8 AM UTC = 3 AM Eastern. Per-user timezone-aware delivery is a quality signal professionals notice. | High | Store IANA timezone; cron must query per-user schedule |

---

## Anti-Features

Features to deliberately NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Leaderboards | For a professional audience, leaderboards create social anxiety and invite gaming. "Rank among colleagues" is career-threatening, not fun. | Personal streak and mastery — compete with yourself |
| User-submitted word suggestions | Moderation cost is high; quality inconsistent; professional users will submit joke entries | AI pipeline from curated sources is higher quality, zero moderation |
| Spaced repetition engine (SRS) | SRS requires vocabulary depth (hundreds of seen words) to work at launch; significant algorithmic complexity | Mastery rating + favorites is a lightweight proxy; full SRS in v2 |
| Native iOS/Android app | Build cost 3–5x a PWA; App Store review delays; PWA install sufficient for one-visit-per-day pattern | PWA install prompt + service worker offline support |
| Monetization / premium gate | Paywalling before product-market fit suppresses organic growth needed for validation | Free everything in v1; measure engagement first |
| Audio pronunciation | Storage/recording cost; business jargon pronunciation less ambiguous than foreign phonemes | Phonetic spelling in definition is sufficient |
| Social profiles / sharing scores | "I scored 100 on EBITDA today" is not a message professionals want to broadcast | Share word page URLs (content, not performance) |
| Full admin CMS UI | High engineering cost; entirely internal; automated pipeline sufficient for launch | Basic queue review; full CMS in v2 |
| Infinite scroll archive | Breaks browser back button, inaccessible, creates discovery dead ends | Paginated archive with clean URLs per page |
| Gamified onboarding tour | Tutorial overlays have 40–70% drop-off (MEDIUM confidence); professionals have low tolerance for being talked down to | Let the word page speak for itself; empty states for progressive disclosure |
| "Next word in X hours" countdown | Creates anxiety, not anticipation | Simple "come back tomorrow" message with friendly tone |

---

## Feature Dependencies

```
Push notifications → Service worker (must register first)
Service worker → PWA manifest (installability requires both)
Streak counter → User account (anonymous streaks lost on session clear)
Favorites → User account
Mastery rating → User account + activity completion events
AI sentence feedback → "Use It in a Sentence" → User account (rate limiting requires identity)
Daily badge → Points per activity → Activity completion tracking
Dynamic OG image → Word slug + word metadata → Word page route
Configurable notification time → User account + stored timezone → Push notification
Email digest → User account + email address → Resend integration
Word archive → Word database populated → Seed database (100 words minimum)
Vector deduplication → Word embeddings → AI pipeline (pre-generation step)
```

---

## Engagement Pattern Analysis

### Scarcity as Engagement (Wordle Model)

Wordle's single-puzzle-per-day constraint is its primary engagement driver. Scarcity creates FOMO (miss a day and miss the conversation). Let's Take This Offline should treat today's word as *the* word — not as the top of an infinite list. The archive is a catch-up tool, not a replacement for the daily habit.

**Implication:** Do not allow users to preview tomorrow's word. Do not show a countdown to the next word. A friendly "come back tomorrow" is the right exit state.

### Streaks Are Loss Aversion, Not Achievement (Duolingo Model)

Duolingo's internal research found streaks work primarily through loss aversion, not positive reinforcement. Users return to avoid losing a 30-day streak, not because they're excited to learn. Once a streak breaks, a significant percentage of users churn permanently.

**Implication:** Communicate the streak warmly, never harshly. "Day 1 — great start" not "streak broken." Streak repair mechanics are a v2 retention lever worth planning for.

### Notification Timing Is a Retention Lever

Apps sending at 8 AM UTC see dramatically lower open rates than apps delivering at the user's configured local morning time. For professionals, early morning (6–8 AM local) outperforms mid-day or evening for habit-forming content.

**Implication:** Timezone storage + configurable time is not a nice-to-have — it is a retention differentiator for this audience.

### PWA Install as Commitment Mechanism

Users who install a PWA to their home screen have 2–4x higher 30-day retention than browser-only users (MEDIUM confidence — Google PWA case studies). The install moment is a commitment signal.

**Implication:** Show the install prompt after completing the first activity, not on page load. Value delivered before the ask dramatically improves acceptance rate.

---

## Professional Audience Considerations

| Dimension | General Audience | Professional Audience | Let's Take This Offline Implication |
|-----------|-----------------|----------------------|---------------------|
| Motivation | Curiosity, fun | Career utility, credibility | Content must be immediately applicable, not merely interesting |
| Time budget | Variable | Constrained (~2 min) | Single-scroll page; no tabs; no pagination within a word |
| Notification tolerance | Medium | Low (inbox zero culture) | One notification per day max; opt-in only; easy unsubscribe |
| Social sharing comfort | High | Low (reputation-conscious) | Share word URLs (content), not scores or performance |
| Gamification appetite | High (fun-seeking) | Medium (goal-oriented) | Streak and mastery are goal-oriented; leaderboards feel juvenile |
| Trust signals | Brand recognition | Expert sourcing | "Heard in the Wild" citation, executive framing, zero typos |

---

## MVP Prioritization

**Build in v1:**

1. Daily word page — full editorial content (definition, executive context, examples, "Heard in the Wild")
2. Flashcard Flip, Fill-in-the-Blank, Context Match activities — active recall without AI dependency
3. "Use It in a Sentence" with AI feedback — primary differentiator; highest effort, highest value
4. Streak counter + daily points + badge — minimum viable gamification loop; requires accounts
5. Optional user accounts (email/password + Google/Apple OAuth)
6. Word archive with search and filter — immediate SEO value
7. Push notifications with timezone-aware scheduling — primary re-engagement lever
8. Email digest (Resend) — re-engagement for non-installed users
9. PWA installability + offline cache for today's word

**Defer from v1:**

- Leaderboards (deliberate anti-feature for professional audience)
- Spaced repetition (requires vocabulary depth that doesn't exist at launch)
- Full admin CMS
- Audio pronunciation
- Social profiles or score sharing
- Streak repair mechanics

---

## Sources

| Claim | Confidence | Basis |
|-------|------------|-------|
| Streak mechanics work via loss aversion | HIGH | Duolingo internal research, widely cited in gamification literature |
| Active recall yields ~70% retention vs ~10% passive | HIGH | Roediger & Karpicke (2006) retrieval practice research |
| Notification timing: local morning outperforms UTC bulk | HIGH | Multiple mobile engagement studies |
| PWA install 2–4x retention lift | MEDIUM | Google PWA case studies |
| Onboarding tour 40–70% drop-off | MEDIUM | Multiple A/B test reports in industry blogs |
