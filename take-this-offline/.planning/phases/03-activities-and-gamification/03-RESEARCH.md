# Phase 3: Activities and Gamification - Research

**Researched:** 2026-03-14
**Domain:** Interactive learning activities, gamification data layer, AI feedback, Supabase RLS, Next.js App Router client/server composition
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Activity placement:**
- Activities render in a "Practice Today" section directly below the WordCard on the home page (/)
- Section is immediately visible on page load — no trigger button required
- Activities only appear on today's home page, not on past word permalink pages (/word/[slug])
- Past word pages show completed state only (checkmarks) if the user practiced that day

**Activity sequencing:**
- All 4 activity cards are available at once — user picks any order
- Activities are redoable but points are only awarded once per day
- Completed activities show a checkmark state while remaining interactive

**Anonymous vs. logged-in access:**
- Flashcard Flip, Fill-in-the-Blank, Context Match: free for all users (no login required)
- Use It in a Sentence: login required — inline login prompt inside the card (not a redirect)
- Points, streaks, favorites, and mastery tracking only apply to logged-in users

**AI sentence feedback:**
- Feedback appears inline, directly below the textarea after submission
- 2-3 sentences in length
- Tone: witty, tongue-in-cheek, memorable
- Loading state shown while AI responds (<5s target)

**Completed-today state:**
- After all 4 activities are completed, a celebratory banner replaces/tops the practice section
- Banner shows: today's badge earned, total points awarded, updated streak count
- Individual activity cards remain visible with checkmark states

**Streak counter:**
- Displayed on the home page, above or near the Practice section
- Only shown for logged-in users
- Shows current streak count with a flame icon

**Favorites and activity history:**
- Dedicated /profile page: streak, total points, favorites list, activity history, mastery ratings
- Favorite icon on word pages for logged-in users
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACTV-01 | User can flip a flashcard to reveal/hide the definition | CSS 3D transform flip pattern; React useState for flip state; no DB needed |
| ACTV-02 | User can complete a fill-in-the-blank activity for the day's word | Client component with controlled input; answer matching logic; Supabase mutation for completion |
| ACTV-03 | User can submit a sentence using the day's word and receive AI feedback (login required, rate-limited) | Anthropic SDK (`@anthropic-ai/sdk` already installed); Next.js Route Handler POST; Supabase rate-limit check before calling Claude |
| ACTV-04 | User can complete a context match activity | Client component radio/button group; word data fields used as distractors; completion recorded to Supabase |
| ACTV-05 | User sees a "completed today" state after finishing all activities | Server reads user_activity for today; celebratory banner component; client optimistic state update |
| GAME-01 | User earns points for each activity completed | user_stats table (points column); upsert on activity completion; idempotent via unique constraint on user_activity |
| GAME-02 | User earns a daily badge after completing all activities | Derived: all 4 activities completed for word on date → badge; badge_type enum in user_stats or separate badges table |
| GAME-03 | User can view their current streak counter | streak_count in user_stats; server-side streak calculation on each completion; home page reads it for display |
| GAME-04 | User can save words to favorites (login required) | user_favorites table; toggle favorite via Route Handler; optimistic UI update in client component |
| GAME-05 | User can view activity history across past words (login required) | /profile page queries user_activity joined to words; paginated list |
| GAME-06 | User can see a mastery rating (mastered / learning / seen) per word (login required) | word_mastery table or derived view; mastery level derived from activity count per word |
</phase_requirements>

---

## Summary

Phase 3 builds an interactive practice layer on top of the existing WordCard and introduces a gamification data layer. The four activities (Flashcard Flip, Fill-in-the-Blank, Use It in a Sentence, Context Match) are client components rendered below the WordCard on the home page. Three activities work without login; one requires auth and calls the Anthropic Claude API already installed in the project.

The gamification layer requires four new Supabase tables: `user_activity` (idempotent completion records), `user_stats` (running totals), `user_favorites`, and `word_mastery` (derived mastery level). Row Level Security must ensure users can only read/write their own rows. A new `/profile` route displays history and mastery.

The central engineering challenge is the **server/client composition boundary**: the home page is a server component that reads today's word and the user's completion state, but the activity cards need client-side interactivity. The correct pattern is to keep the home page server component and pass pre-fetched data down into `'use client'` activity components — the same pattern the project already uses for `WordCard` plus `archive-filters.tsx`.

**Primary recommendation:** Use Supabase server client to pre-fetch completion state on the server, pass it as props to client activity components, and use Next.js Route Handlers (`app/api/`) for all mutations (activity completion, favorites toggle, sentence feedback). Keep Anthropic SDK calls exclusively in Route Handlers — never in client components.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | ^0.78.0 | AI sentence feedback via Claude | Already in package.json; project standard |
| `@supabase/ssr` + `@supabase/supabase-js` | latest | DB reads, RLS, auth session | Established in Phase 1 |
| `next` (App Router) | latest | Server components, Route Handlers, dynamic pages | Project foundation |
| `lucide-react` | ^0.511.0 | Icons (Flame for streak, Star/Heart for favorites, CheckCircle) | Already installed; used in shadcn/ui components |
| `tailwindcss-animate` | ^1.0.7 | CSS transition utilities for flashcard flip, banner animation | Already installed |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@radix-ui/react-checkbox` | ^1.3.1 | Context Match answer selection | Available; shadcn Checkbox already exists |
| `@radix-ui/react-label` | ^2.1.6 | Accessible form labels for Fill-in-the-Blank | Available |
| `class-variance-authority` | ^0.7.1 | Variant-based styling for activity card states | Already used by shadcn/ui components |

### No New Installs Required

All required libraries are already present. Phase 3 requires **zero new npm dependencies**.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Anthropic SDK in Route Handler | OpenAI / Vercel AI SDK | Anthropic SDK already installed and project already uses Claude for pipeline; no reason to change |
| Supabase for rate limiting | Upstash Redis | Supabase `user_activity` table serves as a natural rate-limit source — if an activity is already completed today, skip the Claude call; no external dependency needed |
| CSS 3D flip (tailwind-animate) | Framer Motion | tailwind-animate already installed; Framer Motion adds 30KB+ bundle cost; flip can be achieved with `transform-style: preserve-3d` CSS utilities |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Server component — fetch word + user completion state
│   ├── profile/
│   │   └── page.tsx                  # Server component — profile page (force-dynamic)
│   └── api/
│       ├── activity/
│       │   └── complete/route.ts     # POST — record activity completion, award points
│       ├── sentence-feedback/
│       │   └── route.ts              # POST — rate-check + Claude call + return feedback
│       └── favorites/
│           └── route.ts              # POST — toggle favorite
├── components/
│   ├── practice-section.tsx          # 'use client' — orchestrates 4 activity cards + celebratory banner
│   ├── activities/
│   │   ├── flashcard-activity.tsx    # 'use client' — flip state, CSS 3D transform
│   │   ├── fill-blank-activity.tsx   # 'use client' — controlled input, submit
│   │   ├── sentence-activity.tsx     # 'use client' — textarea, auth gate, inline feedback
│   │   └── context-match-activity.tsx # 'use client' — radio options, submit
│   ├── completion-banner.tsx         # 'use client' — celebratory state after all 4 done
│   ├── streak-counter.tsx            # 'use client' — flame icon + count (or server component)
│   └── favorite-button.tsx           # 'use client' — optimistic toggle
└── lib/
    ├── activities.ts                 # Server-side read helpers (getCompletionsToday, getUserStats)
    └── types/
        └── database.types.ts         # Will need regeneration after Phase 3 migration
```

### Pattern 1: Server Pre-fetch + Client Interactivity

**What:** Home page server component fetches `(word, userSession, todayCompletions, userStats)` and passes them as props to `PracticeSection` (`'use client'`). Client component manages optimistic UI state for completions.

**When to use:** Any time a page needs both server-rendered initial state (for performance/SEO) AND client interactivity (for activity UX). This is the established Next.js App Router pattern.

**Example:**
```typescript
// src/app/page.tsx (server component)
import { createClient } from '@/lib/supabase/server'
import { getTodaysWord } from '@/lib/words'
import { getCompletionsToday, getUserStats } from '@/lib/activities'
import { PracticeSection } from '@/components/practice-section'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const word = await getTodaysWord()

  const completions = user ? await getCompletionsToday(user.id, word!.id) : []
  const stats = user ? await getUserStats(user.id) : null

  return (
    <main>
      <SiteHeader user={user} />
      <div className="container max-w-2xl mx-auto py-12 px-4 space-y-8">
        <WordCard word={word!} />
        <PracticeSection
          word={word!}
          user={user}
          initialCompletions={completions}
          initialStats={stats}
        />
      </div>
    </main>
  )
}
```

### Pattern 2: Route Handler for Mutations

**What:** All writes (activity completion, favorites toggle, AI feedback) go through Next.js Route Handlers at `app/api/`. Client components `fetch()` these endpoints. Route Handlers use the Supabase server client to validate session before writing.

**When to use:** All data mutations — never write to Supabase from client components directly.

**Example:**
```typescript
// src/app/api/activity/complete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wordId, activityType } = await req.json()

  // Idempotent insert — UNIQUE(user_id, word_id, activity_type, completed_date) prevents double-points
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('user_activity').upsert(
    { user_id: user.id, word_id: wordId, activity_type: activityType, completed_date: today },
    { onConflict: 'user_id,word_id,activity_type,completed_date', ignoreDuplicates: true }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award points only if this is first completion today
  // ... update user_stats ...

  return NextResponse.json({ ok: true })
}
```

### Pattern 3: Flashcard CSS 3D Flip

**What:** Pure CSS 3D flip using Tailwind + custom utility classes. `useState(flipped)` toggles the CSS class. No library needed.

**When to use:** Flashcard Flip activity (ACTV-01). tailwind-animate is already installed; add `[transform-style:preserve-3d]` and `[backface-visibility:hidden]` as arbitrary Tailwind values.

**Example:**
```typescript
// src/components/activities/flashcard-activity.tsx
'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function FlashcardActivity({ word, onComplete }: FlashcardActivityProps) {
  const [flipped, setFlipped] = useState(false)

  function handleFlip() {
    setFlipped(true)
    onComplete() // awards points on first flip
  }

  return (
    <div
      className="relative h-48 cursor-pointer [perspective:1000px]"
      onClick={handleFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="h-full flex items-center justify-center">
            <p className="text-xl font-bold">{word.title}</p>
          </Card>
        </div>
        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="h-full flex items-center justify-center p-4">
            <p className="text-center">{word.definition}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### Pattern 4: Anthropic SDK in Route Handler (AI Sentence Feedback)

**What:** POST Route Handler at `/api/sentence-feedback` validates session, checks rate limit via user_activity table, calls Anthropic SDK, streams or awaits response, returns feedback string.

**Rate-limiting approach:** Before calling Claude, check if the user has already submitted a sentence for this word today. If `user_activity` row exists for `(user_id, word_id, 'sentence', today)`, return cached or skip API call. This uses the DB as a natural idempotency gate — no Redis needed.

**Example:**
```typescript
// src/app/api/sentence-feedback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wordId, wordTitle, definition, sentence } = await req.json()

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Word: "${wordTitle}" — Definition: "${definition}"
User's sentence: "${sentence}"

Give 2-3 sentences of feedback. Be witty, tongue-in-cheek, like a clever colleague who actually enjoyed reading their sentence. Confirm correct usage or gently correct it with personality. No generic "Good job!" openers.`,
    }],
  })

  const feedback = (message.content[0] as { text: string }).text
  return NextResponse.json({ feedback })
}
```

### Pattern 5: Optimistic UI for Activity Completion

**What:** Client component immediately marks activity as complete in local state, then fires `fetch('/api/activity/complete', ...)` in background. If the fetch fails, revert state.

**When to use:** All four activity completion flows — keeps the UX snappy and the 2-minute skimmability constraint satisfied.

### Anti-Patterns to Avoid

- **Writing to Supabase directly from a client component:** Exposes service role key risk, bypasses RLS validation in Route Handler logic. Always use Route Handlers for mutations.
- **Calling Anthropic SDK from a client component:** API key would be exposed in the browser bundle. The SDK call MUST be in a Route Handler.
- **Using `getSession()` instead of `getUser()` for auth validation:** `getSession()` trusts the JWT without server-side validation. The project already established `getUser()` as the correct pattern in Phase 1.
- **Generating activity content (fill-blank, context-match) in a Route Handler on each request:** Content generation from the word data is deterministic and should happen server-side at page render time, passed as props to client components.
- **Making the home page a client component to handle activity state:** Home page must remain a server component for SSR performance. Pass initial state as props; client components handle local state mutations.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Idempotent "one point per day" enforcement | Custom dedup logic in Route Handler | UNIQUE constraint on `user_activity(user_id, word_id, activity_type, completed_date)` + `upsert ignoreDuplicates` | Database enforces it atomically; no race conditions |
| Rate-limiting AI calls | Custom Redis/token-bucket | Check `user_activity` for existing sentence row before calling Claude | DB already has the data; no extra infrastructure |
| CSS flip animation | Framer Motion or custom JS | CSS `[perspective]` + `[transform-style:preserve-3d]` + Tailwind `transition-transform` | tailwind-animate already installed; 0 bundle cost |
| Streak calculation | Custom date-range logic | Streak computed on each activity completion: query consecutive `completed_date` entries in `user_activity` grouped by day | A simple SQL function or RPC keeps it in the DB |
| Mastery rating | Separate ML scoring | Derived rule: 0 activities = "seen", 1-3 = "learning", 4 (all complete) = "mastered" | Simple and deterministic; no scoring model needed |
| Auth gate UI in activity card | Custom auth modal | Inline Sign in link pointing to `/auth/sign-in` (established route) | Matches pattern established in Phase 1; no extra modal state |

**Key insight:** The gamification data model is the main engineering work. The UI components are straightforward React state — the complexity is in the DB schema, RLS policies, and idempotency constraints.

---

## Common Pitfalls

### Pitfall 1: Missing `force-dynamic` on Auth-Dependent Pages

**What goes wrong:** Next.js pre-renders pages at build time; pages that call `supabase.auth.getUser()` without `export const dynamic = 'force-dynamic'` throw "cookies() was called in a static context" errors at runtime.

**Why it happens:** Next.js App Router static optimization is aggressive. Pages that don't read dynamic data are prerendered.

**How to avoid:** Add `export const dynamic = 'force-dynamic'` to `src/app/page.tsx` (already present), `src/app/profile/page.tsx`, and `src/app/word/[slug]/page.tsx` when adding auth reads.

**Warning signs:** Build succeeds but runtime throws cookie-related errors; Vercel deployment works differently than local.

### Pitfall 2: Double-Awarding Points on Re-render or Fast Clicks

**What goes wrong:** User clicks rapidly or component re-renders trigger duplicate POST to `/api/activity/complete`; user earns points twice.

**Why it happens:** Optimistic UI fires a network request; React strict mode double-invokes effects in dev.

**How to avoid:** UNIQUE constraint on `user_activity(user_id, word_id, activity_type, completed_date)` is the backstop. Additionally, disable the submit button immediately on first click in the client component until the fetch resolves.

**Warning signs:** Points increase by more than expected; duplicate rows in user_activity.

### Pitfall 3: Anthropic SDK Timeout on Vercel Hobby Plan

**What goes wrong:** Claude responses can take 3-8 seconds; Vercel Hobby plan has a 10s function timeout. Under load, the sentence feedback Route Handler times out.

**Why it happens:** Vercel Hobby plan limits Serverless Function execution to 10 seconds. `max_tokens: 256` and a tight prompt keep it well under 5s in practice — but the limit exists.

**How to avoid:** Keep the prompt short, `max_tokens` at 256 or lower, and model at `claude-haiku-3-5` (fastest) or `claude-sonnet-4-5` for balance. Display a loading spinner with a message like "Reading your sentence..." to set expectations.

**Warning signs:** 504 errors from Vercel on sentence submissions; timeout logs in Vercel function console.

### Pitfall 4: RLS Policies Blocking Reads for Anon Users

**What goes wrong:** Activities section fails to load on home page for logged-out users because new gamification tables have RLS enabled but no anon read policy.

**Why it happens:** Tables with RLS enabled default to denying all access. The `words` table has an explicit `anon` read policy — new tables need equivalent policies.

**How to avoid:** For tables that anonymous users never need to read (user_activity, user_stats, user_favorites, word_mastery), add only authenticated-role policies. The home page handles the anon case by passing `null` completion state and skipping DB queries when `user` is null.

**Warning signs:** Console shows Supabase 403 errors; activity completion state shows as blank for all users.

### Pitfall 5: Streak Calculation Off-by-One on Timezone

**What goes wrong:** A user completes an activity at 11:58pm their local time. The server calculates "today" as UTC, which may already be the next day — breaking the streak.

**Why it happens:** The project uses UTC dates throughout (`daily_date` is DATE in UTC). Activity completion dates stored as UTC can differ from user's local date.

**How to avoid:** Store `completed_date` as UTC DATE (consistent with rest of schema). Accept that the streak is UTC-based for v1. Phase 3 does not need to solve timezone-aware streaks — that's complexity deferred to v2 (the CONTEXT.md notes user timezone is stored at subscription time in Phase 4).

**Warning signs:** Users report streak breaking unexpectedly around midnight.

### Pitfall 6: Context Match Distractors Being Too Obvious

**What goes wrong:** Context Match activity is trivially easy because the wrong answers are from completely different domains.

**Why it happens:** Naive distractor selection pulls random words without semantic relation.

**How to avoid:** Generate distractors from the same category as the word of the day — use a DB query: `SELECT definition FROM words WHERE category = $1 AND id != $2 ORDER BY RANDOM() LIMIT 3`. This stays entirely in the existing schema with no new infrastructure.

---

## Code Examples

### New Supabase Tables (Migration)

```sql
-- user_activity: one row per (user, word, activity_type, day)
-- UNIQUE constraint is the idempotency guarantee for points
create table public.user_activity (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  word_id          uuid        not null references public.words(id) on delete cascade,
  activity_type    text        not null check (activity_type in ('flashcard','fill_blank','sentence','context_match')),
  completed_date   date        not null default current_date,
  created_at       timestamptz not null default now(),
  unique (user_id, word_id, activity_type, completed_date)
);

-- user_stats: one row per user, running totals
create table public.user_stats (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  total_points     integer     not null default 0,
  streak_count     integer     not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

-- user_favorites: one row per (user, word)
create table public.user_favorites (
  user_id   uuid  not null references auth.users(id) on delete cascade,
  word_id   uuid  not null references public.words(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

-- word_mastery: derived mastery level per (user, word)
-- mastery_level: 'seen' | 'learning' | 'mastered'
create table public.word_mastery (
  user_id        uuid  not null references auth.users(id) on delete cascade,
  word_id        uuid  not null references public.words(id) on delete cascade,
  mastery_level  text  not null default 'seen'
                       check (mastery_level in ('seen','learning','mastered')),
  activity_count integer not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (user_id, word_id)
);
```

### RLS Policies for New Tables

```sql
-- user_activity: users read/write their own rows only
alter table public.user_activity enable row level security;
create policy "user_activity_own" on public.user_activity
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_stats: users read/write their own row only
alter table public.user_stats enable row level security;
create policy "user_stats_own" on public.user_stats
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_favorites: users read/write their own favorites
alter table public.user_favorites enable row level security;
create policy "user_favorites_own" on public.user_favorites
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- word_mastery: users read their own mastery
alter table public.word_mastery enable row level security;
create policy "word_mastery_own" on public.word_mastery
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Mastery Level Derivation (Route Handler logic)

```typescript
// Called after each activity completion to update mastery
function deriveMasteryLevel(activityCount: number): 'seen' | 'learning' | 'mastered' {
  if (activityCount >= 4) return 'mastered'
  if (activityCount >= 1) return 'learning'
  return 'seen'
}
```

### Streak Calculation (SQL or server-side)

```typescript
// Compute current streak: consecutive days with at least one activity
async function computeStreak(userId: string, supabase: SupabaseClient): Promise<number> {
  // Get distinct completed_dates for this user, newest first
  const { data } = await supabase
    .from('user_activity')
    .select('completed_date')
    .eq('user_id', userId)
    .order('completed_date', { ascending: false })

  if (!data || data.length === 0) return 0

  // Deduplicate dates and count consecutive days back from most recent
  const dates = [...new Set(data.map(r => r.completed_date))].sort().reverse()
  const today = new Date().toISOString().split('T')[0]

  // Streak only counts if user was active today or yesterday
  if (dates[0] !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dates[0] !== yesterday) return 0
  }

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}
```

### Point Values (Claude's Discretion)

Recommended: 10 points per activity, 20-point bonus for completing all 4 = 60 points max per day. Simple, easy to communicate, motivating without being meaninglessly large.

```typescript
const POINTS = {
  flashcard: 10,
  fill_blank: 10,
  sentence: 10,
  context_match: 10,
  all_complete_bonus: 20,
} as const
```

### Context Match Distractor Query

```typescript
// Fetch 3 wrong-answer definitions from same category, different word
async function getDisstractors(word: WordRow, supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from('words')
    .select('definition')
    .eq('category', word.category)
    .neq('id', word.id)
    .limit(3)
  return (data ?? []).map(r => r.definition)
}
```

### Fill-in-the-Blank: Blank Selection Logic

Blank the word title itself from the definition string (case-insensitive first occurrence). If the title is multi-word (e.g., "North Star Metric"), blank only the first occurrence. This is deterministic, reproducible, and always gives the correct answer as the word title.

```typescript
function generateFillBlank(word: WordRow): { text: string; answer: string } {
  const blank = '___________'
  const text = word.definition.replace(new RegExp(word.title, 'i'), blank)
  return { text, answer: word.title }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion for card flip | CSS 3D transforms with Tailwind arbitrary values | ~2023 | Eliminates ~30KB bundle; no new install |
| Redux/Zustand for activity state | React useState + server pre-fetch | Next.js App Router (2023) | Server component passes initial state; client state is local and ephemeral |
| Separate points microservice | Supabase RPC / upsert in Route Handler | Supabase matured (2022-2024) | Single DB handles gamification state; no extra service |
| `getSession()` for auth checks | `getUser()` for server-side validation | Supabase SSR v0.1+ | `getSession()` trusts JWT without server validation; `getUser()` hits auth server (established in Phase 1) |

**Deprecated/outdated:**
- Supabase `createServerComponentClient` / `createRouteHandlerClient`: Replaced by `createServerClient` from `@supabase/ssr` (already established in this project).
- `pages/api/` route handlers: Project uses App Router `app/api/` convention throughout.

---

## Open Questions

1. **Anthropic model choice for sentence feedback**
   - What we know: `@anthropic-ai/sdk ^0.78.0` is installed; `claude-opus-4-5` is used elsewhere in the project codebase per STATE.md
   - What's unclear: Whether Haiku (faster/cheaper) or Sonnet/Opus is the right tradeoff for a 2-3 sentence witty response
   - Recommendation: Default to `claude-haiku-3-5` in the Route Handler (fastest, cheapest, well under 5s). Planner can make this a config constant so it's easily changed.

2. **Profile page: server component or client component?**
   - What we know: Profile reads auth-protected data; needs `force-dynamic`; activity history could be long
   - What's unclear: Whether infinite scroll vs. pagination is needed for activity history
   - Recommendation: Server component with simple pagination (same `getArchive` pattern). Activity history defaults to last 30 entries.

3. **Streak display: show "0" or hide the streak counter when streak is 0?**
   - What we know: CONTEXT.md says "Only shown for logged-in users"; doesn't specify 0-streak behavior
   - What's unclear: Whether showing "0" is demotivating vs. transparent
   - Recommendation: Claude's Discretion — show counter only when streak > 0; otherwise show a subtle "Start your streak!" prompt.

---

## Validation Architecture

nyquist_validation is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| Config file | `vitest.config.ts` (unit: `tests/**/*.test.ts`), `playwright.config.ts` (E2E: `tests/**/*.spec.ts`) |
| Quick run command | `npx vitest run tests/activities/` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACTV-01 | Flashcard flip toggles definition visibility | unit | `npx vitest run tests/activities/flashcard.test.ts` | Wave 0 |
| ACTV-02 | Fill-in-the-blank correct/incorrect answer handling | unit | `npx vitest run tests/activities/fill-blank.test.ts` | Wave 0 |
| ACTV-03 | Sentence feedback route returns AI response; rejects unauthenticated | unit | `npx vitest run tests/activities/sentence-feedback.test.ts` | Wave 0 |
| ACTV-04 | Context match returns correct/incorrect states | unit | `npx vitest run tests/activities/context-match.test.ts` | Wave 0 |
| ACTV-05 | All-complete state triggers banner | unit | `npx vitest run tests/activities/completion-banner.test.ts` | Wave 0 |
| GAME-01 | Points awarded once per activity per day (idempotent) | unit | `npx vitest run tests/gamification/points.test.ts` | Wave 0 |
| GAME-02 | Daily badge awarded after all 4 activities | unit | `npx vitest run tests/gamification/badge.test.ts` | Wave 0 |
| GAME-03 | Streak counter increments and resets correctly | unit | `npx vitest run tests/gamification/streak.test.ts` | Wave 0 |
| GAME-04 | Favorite toggle saves and removes word | E2E | `npx playwright test tests/profile/favorites.spec.ts` | Wave 0 |
| GAME-05 | Activity history appears on /profile | E2E | `npx playwright test tests/profile/history.spec.ts` | Wave 0 |
| GAME-06 | Mastery rating updates after activity completion | unit | `npx vitest run tests/gamification/mastery.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/activities/ tests/gamification/`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/activities/flashcard.test.ts` — covers ACTV-01
- [ ] `tests/activities/fill-blank.test.ts` — covers ACTV-02
- [ ] `tests/activities/sentence-feedback.test.ts` — covers ACTV-03
- [ ] `tests/activities/context-match.test.ts` — covers ACTV-04
- [ ] `tests/activities/completion-banner.test.ts` — covers ACTV-05
- [ ] `tests/gamification/points.test.ts` — covers GAME-01
- [ ] `tests/gamification/badge.test.ts` — covers GAME-02
- [ ] `tests/gamification/streak.test.ts` — covers GAME-03
- [ ] `tests/profile/favorites.spec.ts` — covers GAME-04 (Playwright)
- [ ] `tests/profile/history.spec.ts` — covers GAME-05 (Playwright)
- [ ] `tests/gamification/mastery.test.ts` — covers GAME-06

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/words.ts`, `src/components/word-card.tsx`, `src/app/page.tsx` — patterns verified from actual project files
- `supabase/migrations/20260313000000_initial_schema.sql` — existing schema, RLS patterns, table conventions
- `package.json` — confirmed `@anthropic-ai/sdk ^0.78.0` installed; `lucide-react`, `tailwindcss-animate`, all shadcn/ui Radix primitives present; Vitest and Playwright already configured
- `vitest.config.ts` + `playwright.config.ts` — test infrastructure confirmed; test paths verified

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` accumulated decisions — Next.js 15 App Router params-as-Promise, `getUser()` for auth validation, `force-dynamic` requirement, Supabase upsert patterns — all verified against actual code in the repository
- `.planning/phases/03-activities-and-gamification/03-CONTEXT.md` — user decisions verified as locked constraints

### Tertiary (LOW confidence)

- Anthropic model naming (`claude-haiku-3-5`, `claude-opus-4-5`) — based on training knowledge as of August 2025; verify against current Anthropic docs before using in Route Handler. The SDK call structure is HIGH confidence from package version; model name strings are LOW confidence.
- Vercel Hobby plan 10-second function timeout — training knowledge; verify at Vercel docs before launch.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed from package.json; zero new installs needed
- Architecture: HIGH — patterns derived directly from existing codebase files and established project conventions
- Database schema: HIGH — follows exact conventions from existing migration (UUIDs, RLS, snake_case, `auth.users` references)
- Pitfalls: MEDIUM-HIGH — RLS/timezone/timeout pitfalls drawn from established project patterns and known Next.js/Supabase behaviors
- Anthropic model names: LOW — verify current model IDs against Anthropic docs

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack; Anthropic model names should be re-verified before use)
