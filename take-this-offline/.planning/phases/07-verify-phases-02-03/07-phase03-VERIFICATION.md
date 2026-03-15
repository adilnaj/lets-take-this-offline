# Phase 03 Verification: Activities and Gamification

**Verified:** 2026-03-15
**Method:** Code inspection (no app execution)
**Phase Goal:** Users can complete four interactive memorization activities per word and see their engagement reflected in points, streaks, badges, favorites, and mastery ratings
**Overall Status:** HAS GAPS

---

## Requirements

### ACTV-01: Flashcard flip interaction
**Status:** PASS
**Evidence:**
- `src/components/activities/flashcard-activity.tsx`: `useState(false)` manages `flipped` state. `handleFlip()` (line 18) toggles `setFlipped(prev => !prev)`. Front face (lines 48–57) renders `{word.title}` with definition hidden. Back face (lines 60–67) renders `{word.definition}` via `[transform:rotateY(180deg)]` CSS. Completion fires `onComplete()` on first flip via `completedOnce` ref guard. Keyboard accessible via `onKeyDown` Enter/Space.
**Gap:** None

---

### ACTV-02: Fill-in-the-blank activity
**Status:** PASS
**Evidence:**
- `src/components/activities/fill-blank-activity.tsx`: `generateFillBlank()` function (line 10) replaces the word title with `___________` in the definition using a case-insensitive regex. `<Input>` field (line 57) and `<form onSubmit={handleSubmit}>` (line 56) present. `handleSubmit` (line 28) compares `inputValue.trim().toLowerCase()` against `word.title.toLowerCase()`, calls `onComplete()` on match, shows "Not quite — try again" on mismatch. Disabled after correct answer.
**Gap:** None

---

### ACTV-03: Sentence activity with AI feedback (login required, rate-limited)
**Status:** GAP
**Evidence:**
- `src/components/activities/sentence-activity.tsx`: Auth guard present — when `!user` (line 72), shows sign-in link instead of textarea. For authenticated users, renders `<textarea>` and Submit button. POSTs to `/api/sentence-feedback`.
- `src/app/api/sentence-feedback/route.ts`: Auth check via `supabase.auth.getUser()` (line 9–11) — returns 401 if no user. Calls `anthropic.messages.create()` (line 20) with `FEEDBACK_MODEL = 'claude-haiku-4-5-20251001'`. Returns `{ feedback }` text.
**Gap:** The requirement specifies "rate-limited" as a criterion. No rate limiting is implemented in `src/app/api/sentence-feedback/route.ts` — there is no per-user call count check, no daily limit, no token bucket, and no DB row tracking submission frequency. Auth-gated but not rate-limited. Severity: **minor** (AI feedback works and is auth-gated; rate limiting is a quality/cost protection layer, not a core UX blocker — but the requirement explicitly names it).

---

### ACTV-04: Context match activity
**Status:** PASS
**Evidence:**
- `src/components/activities/context-match-activity.tsx`: Accepts `distractors: string[]` prop. `useMemo` (line 24) builds `options` array as `[word.definition, ...distractors]` and shuffles with Fisher-Yates. `handleSelect` (line 36) checks `options[index] === word.definition` and calls `onComplete()` on correct pick. Incorrect selections shown in red. Multiple choice buttons rendered (lines 68–79).
- `src/app/word/[slug]/page.tsx` (line 50): `getDisstractors(word, supabase)` called via `Promise.all`, result passed as `distractors` prop to `PracticeSection`, which passes it to `ContextMatchActivity`.
- `src/lib/activities.ts` (line 65): `getDisstractors()` queries `words` table filtered by same `category`, excludes current word, returns up to 3 definitions.
**Gap:** None

---

### ACTV-05: "Completed today" state after finishing all activities
**Status:** PASS
**Evidence:**
- `src/components/practice-section.tsx`: `allCompleted` computed at line 37–38 as `completions.size >= 4 && ALL_ACTIVITY_TYPES.every(t => completions.has(t))`. `<CompletionBanner>` rendered conditionally when `allCompleted` is true (line 98–104). Completions are initialised from server-fetched `initialCompletions` (line 31–33) — completed activities from DB persist across page refresh.
- `src/components/completion-banner.tsx`: Exists, renders when `allCompleted` prop is true. Shows "Today's word: mastered!" message, points and streak count.
- Re-triggering gating: `handleComplete` (line 48–50) returns early if `completions.has(activityType)`, preventing double-calls. For logged-in users, server-side `initialCompletions` pre-populates the Set so completed activities start disabled.
**Gap:** None

---

### GAME-01: User earns points for each activity completed
**Status:** PASS
**Evidence:**
- `src/lib/activities.ts` (line 5–11): `POINTS` constant defines 10 points per activity type (`flashcard`, `fill_blank`, `sentence`, `context_match`).
- `src/app/api/activity/complete/route.ts` (line 31): `pointsAwarded = isNewCompletion ? POINTS[activityType] : 0` — points awarded only on first completion. Upserts `user_stats` (line 51–57) with `newTotal` accumulating points.
- Migration `20260314000000_gamification_schema.sql` (line 14–20): `user_stats` table has `total_points integer not null default 0` column.
**Gap:** None

---

### GAME-02: User earns a daily badge after completing all activities
**Status:** PASS
**Evidence:**
- `src/app/api/activity/complete/route.ts` (line 43): `bonusAwarded = isNewCompletion && allComplete && completedTypes.size === 4 ? POINTS.all_complete_bonus : 0` — 20-point bonus fires when all 4 activities are newly complete, idempotent (requires `isNewCompletion=true`).
- `src/components/completion-banner.tsx` (line 24): `<Badge variant="secondary">Daily Badge</Badge>` rendered in the completion banner, displayed when `allCompleted` is true.
**Gap:** None

---

### GAME-03: User can view their current streak counter
**Status:** PASS
**Evidence:**
- `src/components/streak-counter.tsx`: Exists. Renders `<Flame>` icon and `{streakCount} day streak` when `streakCount > 0`, otherwise shows encouragement text.
- `src/components/practice-section.tsx` (line 95): `{user && <StreakCounter streakCount={stats?.streak_count ?? 0} />}` — StreakCounter rendered for logged-in users only, receiving live streak from `stats` state updated after each API response.
- `src/lib/activities.ts` (line 80–108): `computeStreak(userId, supabase)` exists. Fetches all `completed_date` values, deduplicates, checks that most recent is today or yesterday, then counts consecutive days.
**Gap:** None

---

### GAME-04: User can save words to favorites (login required)
**Status:** PASS
**Evidence:**
- Migration `20260314000000_gamification_schema.sql` (line 22–29): `user_favorites` table exists with `(user_id, word_id)` primary key and RLS policy `user_favorites_own`.
- `src/components/favorite-button.tsx`: Exists. Toggles `favorited` state via `handleToggle()`. POSTs to `/api/favorites` with `{ wordId }`. No explicit auth check in component — relies on API returning error for unauthenticated users (optimistic update reverts on failure).
- `src/app/api/favorites/route.ts`: POST handler. Auth check via `supabase.auth.getUser()` (line 6–7) — returns 401 if not logged in. Toggles `user_favorites` row (insert or delete).
- `src/app/word/[slug]/page.tsx` (line 59–61): `{user && (<FavoriteButton wordId={word.id} initialFavorited={initialFavorited} />)}` — FavoriteButton rendered only for logged-in users. `initialFavorited` pre-fetched from DB (lines 37–44).
**Gap:** None. All four criteria (DB schema, component, API, render gated on user) are present.

---

### GAME-05: User can view activity history across past words (login required)
**Status:** PASS
**Evidence:**
- `src/app/profile/page.tsx` (line 1): Exists as a server component.
- Auth gate (line 13–14): `if (!user) redirect('/auth/sign-in')` — profile is fully protected.
- Activity History fetch (line 32–37): Queries `word_mastery` table (ordered by `updated_at` DESC, last 30) joined with `words(id, title, slug, category)`. This records per-word engagement history derived from activity completions.
- JSX render (lines 103–130): "Activity History" section renders a `<ul>` of past words with links to `/word/${w.slug}`. Empty state shows "Complete activities to build your history."

**Note on data model:** GAME-05 specifies "activity history across past words." The profile page uses `word_mastery` (not `user_activity`) as the history source — this shows one row per word with the mastery level and last update time, not a per-activity log. This provides history of which words were practiced but not individual activity timestamps. Acceptable per code evidence.
**Gap:** None

---

### GAME-06: User can see a mastery rating (mastered / learning / seen) per word (login required)
**Status:** PASS
**Evidence:**
- Migration `20260314000000_gamification_schema.sql` (line 32–41): `word_mastery` table exists with `mastery_level text not null default 'seen' check (mastery_level in ('seen','learning','mastered'))` and `activity_count` column.
- `src/lib/activities.ts` (line 17–21): `deriveMasteryLevel(activityCount)` computes: 0 = 'seen', 1–3 = 'learning', 4+ = 'mastered'. Called in `activity/complete/route.ts` on each completion to update `word_mastery`.
- `src/app/profile/page.tsx` (lines 112–128): Mastery rating visibly rendered in JSX — `<Badge>` component shows `{row.mastery_level}` text with colour-coded variants (green for mastered, yellow for learning, outline for seen).
- Auth gate: Page redirects unauthenticated users (line 14).
**Gap:** None. Schema, computation, and UI render all present.

---

## Gap Summary

| Requirement | Gap Description | Severity |
|-------------|-----------------|----------|
| ACTV-03 | No rate limiting on `/api/sentence-feedback` — requirement explicitly states "rate-limited" but the route handler has no per-user call limit, daily cap, or DB-tracked submission count | minor |

---

## E2E Trace: Archive → Past Word → Practice

**Path traced:** Logged-in user navigates from archive page to a past word (`/word/[slug]`) and completes activities.

**Past word page (`/word/[slug]`):**
`src/app/word/[slug]/page.tsx` — PracticeSection IS present on `/word/[slug]` pages (lines 64–72). This is the Phase 6 fix: past word pages received full interactive practice, not completed-state only. The CONTEXT.md note ("PracticeSection may be excluded from /word/[slug]") describes the original Phase 3 decision; Phase 6 reversed this by adding PracticeSection to the slug page.

**Activity completion API (`/api/activity/complete`):**
Accepts `{ wordId, activityType }` — `wordId` is the UUID of the word (not slug). The word's UUID is fetched by `getWordBySlug(slug)` on the page, then passed as `word.id` to PracticeSection which uses it in API calls. Slug-based navigation → UUID-based API call chain is intact.

**Points and streak update:**
`src/app/api/activity/complete/route.ts`: On each completion, upserts `user_activity`, awards points via `POINTS[activityType]`, calls `computeStreak(user.id, supabase)`, upserts `user_stats`, and upserts `word_mastery`. Response includes `{ new_total, streak }` which `PracticeSection` uses to update displayed stats client-side.

**SiteHeader user prop on `/word/[slug]`:**
`src/app/word/[slug]/page.tsx` (line 34): `supabase.auth.getUser()` called. Line 55: `<SiteHeader user={user} />` — user prop passed. This is the Phase 6 fix confirmed. Logged-in users see "Profile" link in the header on slug pages.

**Verdict:** Pass. The full chain from archive navigation to slug page to activity completion to stats update is present in code. PracticeSection appears on both today's word page and past word pages (Phase 6 made them symmetric).

---

## Overall Assessment

**10 of 11 requirements: PASS**
**1 requirement: GAP (ACTV-03 — missing rate limiting)**

Phase 03 status: **HAS GAPS**

The gap is minor: the sentence activity is auth-gated and AI-connected, but lacks the rate-limiting layer the requirement specifies. This is a cost-protection and abuse-prevention mechanism. All user-visible gamification features (GAME-04 favorites, GAME-05 activity history, GAME-06 mastery ratings) are fully implemented with DB schema, API, and rendered UI.
