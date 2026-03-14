# Phase 3: Activities and Gamification - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can complete four interactive memorization activities per word (Flashcard Flip, Fill-in-the-Blank, Use It in a Sentence, Context Match) and see their engagement reflected in points, streaks, badges, favorites, and mastery ratings. Content display (WordCard) is already built in Phase 2. This phase adds the interactive practice layer and gamification data surface.

</domain>

<decisions>
## Implementation Decisions

### Activity placement
- Activities render in a "Practice Today" section directly below the WordCard on the home page (/)
- Section is immediately visible on page load — no trigger button required
- Activities only appear on today's home page, not on past word permalink pages (/word/[slug])
- Past word pages show completed state only (checkmarks) if the user practiced that day

### Activity sequencing
- All 4 activity cards are available at once — user picks any order
- Activities are redoable (user can re-flip, re-answer) but points are only awarded once per day
- Completed activities show a checkmark state while remaining interactive

### Anonymous vs. logged-in access
- Flashcard Flip, Fill-in-the-Blank, Context Match: free for all users (no login required)
- Use It in a Sentence: login required — inline login prompt inside the card (not a redirect), with a Sign in link
- Points, streaks, favorites, and mastery tracking only apply to logged-in users

### AI sentence feedback
- Feedback appears inline, directly below the textarea after submission
- 2-3 sentences in length
- Tone: witty, tongue-in-cheek, memorable — like a clever colleague who actually enjoyed reading your sentence
- Feedback confirms correct usage or gently corrects it, with personality
- Loading state shown while AI responds (<5s target)

### Completed-today state
- After all 4 activities are completed, a celebratory banner replaces/tops the practice section
- Banner shows: today's badge earned, total points awarded, updated streak count
- Individual activity cards remain visible with checkmark states (can still interact, no extra points)

### Streak counter
- Displayed on the home page, above or near the Practice section — visible at the moment of action
- Only shown for logged-in users
- Shows current streak count with a flame icon

### Favorites and activity history
- Dedicated /profile page for logged-in users: streak, total points, favorites list, activity history, mastery ratings
- Favorite icon appears on word pages for logged-in users (save/unsave)
- /profile linked from site header for logged-in users
- Mastery ratings: mastered / learning / seen per word, derived from activity completion history

### Claude's Discretion
- Exact point values per activity (e.g., 10 pts per activity, bonus for all 4)
- Animation/transition details for the celebratory banner
- Flashcard flip animation style
- Context Match question generation approach (distractors, format)
- Fill-in-the-Blank blank selection logic (which word to blank)
- Loading skeleton design for activities section
- Profile page layout details

</decisions>

<specifics>
## Specific Ideas

- AI sentence feedback should feel fun and memorable — not generic "Good job!" responses. Think witty, slightly tongue-in-cheek, with personality. Example tone: "Boardroom-ready. You dropped 'synergy' like a pro in a Q3 all-hands. Nailed it."
- The 2-minute skimmability constraint applies to activities too — each activity should be completable quickly, not feel like homework

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card`, `CardContent` (src/components/ui/card.tsx): WordCard already uses these — activity cards should follow the same pattern for visual consistency
- `Button` (src/components/ui/button.tsx): Available for Submit, Sign in, flip triggers
- `Badge` (src/components/ui/badge.tsx): Used for category labels — can reuse for streak badge display
- `Input`, `Label`, `Checkbox` (src/components/ui/): Available for Fill-in-the-Blank and Context Match inputs
- `WordRow` type (src/lib/words.ts): Word data shape for activity content generation

### Established Patterns
- Section-based layout with `<section className="space-y-1">` headings: established in word-card.tsx — activities section should follow same rhythm
- Supabase server client: `createClient()` from `@/lib/supabase/server` — use for server-side activity state reads
- Auth pattern: existing auth pages at /auth/sign-in and /auth/sign-up — Sign in links in activity cards point here
- `export const dynamic = 'force-dynamic'` required on auth-dependent pages (established in Phase 1)

### Integration Points
- Home page (`src/app/page.tsx`): Activities section renders below the existing WordCard — needs to accept user session prop or check auth client-side
- Supabase DB: Phase 3 needs new tables — user_activity (activity completions per word per user), user_stats (streak, points), user_favorites, word_mastery — these migrations are part of this phase
- `/profile` route: new page at `src/app/profile/page.tsx`
- Site header (`src/components/site-header.tsx`): Add /profile link for logged-in users

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-activities-and-gamification*
*Context gathered: 2026-03-14*
