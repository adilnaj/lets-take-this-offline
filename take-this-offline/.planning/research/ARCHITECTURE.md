# Architecture Patterns

**Project:** Let's Take This Offline
**Domain:** Daily vocabulary PWA with AI content pipeline
**Researched:** 2026-03-12
**Confidence:** HIGH (verified against official Next.js 16.1.6 docs, Vercel Cron docs, Next.js PWA guide)

---

## Recommended Architecture

Let's Take This Offline is a **content-delivery app with an async AI backend**. The architecture separates cleanly into four layers that can be built independently:

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE / CDN                       │
│   Static word pages (ISR) · OG images · Service Worker     │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP
┌────────────────────────▼────────────────────────────────────┐
│                  NEXT.JS APP (Vercel)                       │
│                                                             │
│  app/                                                       │
│  ├── (public)/              ← SSG/ISR word pages            │
│  │   ├── page.tsx           ← today's word (ISR 24h)        │
│  │   ├── [date]/page.tsx    ← archive pages (static)        │
│  │   └── archive/page.tsx   ← word list (SSR)               │
│  ├── (auth)/                ← login, signup                 │
│  ├── (dashboard)/           ← streaks, favorites            │
│  ├── api/                                                   │
│  │   ├── cron/                                              │
│  │   │   ├── generate/route.ts   ← daily AI pipeline        │
│  │   │   └── notify/route.ts     ← hourly push dispatcher   │
│  │   ├── push/                                              │
│  │   │   ├── subscribe/route.ts                             │
│  │   │   └── unsubscribe/route.ts                           │
│  │   ├── og/[slug]/route.tsx     ← Vercel OG image gen      │
│  │   └── activity/                                          │
│  │       └── feedback/route.ts   ← AI sentence feedback     │
│  ├── actions/               ← Server Actions                │
│  │   ├── streak.ts                                          │
│  │   ├── activity.ts                                        │
│  │   └── favorites.ts                                       │
│  └── manifest.ts            ← PWA manifest (built-in)       │
│                                                             │
│  public/                                                    │
│  └── sw.js                  ← Service Worker                │
└────────────────────────┬────────────────────────────────────┘
                         │  Supabase JS (server-side)
┌────────────────────────▼────────────────────────────────────┐
│                  SUPABASE (Postgres + Auth)                 │
│                                                             │
│  Tables:                                                    │
│  ├── words              ← content + pgvector embedding      │
│  ├── user_activity      ← per-user activity completions     │
│  ├── user_streaks       ← streak counters per user          │
│  ├── user_favorites     ← word favorites per user           │
│  └── push_subscriptions ← VAPID endpoint + keys per user   │
│                                                             │
│  Extensions: pgvector                                       │
│  RLS: on all user_ tables; public read on words             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│             EXTERNAL SERVICES                               │
│  Anthropic Claude API  ← word generation + sentence review  │
│  Resend               ← daily email digest                  │
│  Hacker News / News   ← trending signal sources             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Public word pages** (`app/(public)`) | ISR-rendered word content, SEO meta, OG tags | Supabase server-side (anon key, no auth required) |
| **Dashboard pages** (`app/(dashboard)`) | Streaks, favorites, activity history for authenticated users | Supabase server-side (auth session), Server Actions |
| **Cron: `/api/cron/generate`** | Daily AI pipeline — fetches signals, calls Claude, checks dedup, inserts word | Anthropic API, News APIs, Supabase admin client (service role) |
| **Cron: `/api/cron/notify`** | Hourly push dispatcher — finds users whose local time matches notify hour, sends pushes | Supabase admin client (reads push_subscriptions + words), `web-push` |
| **Push API routes** (`/api/push/*`) | Store and remove VAPID push subscriptions for authenticated users | Supabase (anon key + auth session) |
| **Server Actions** (`app/actions/`) | Mutation boundary for streaks, activities, favorites — runs on server, called from client components | Supabase server client (respects RLS) |
| **Service Worker** (`public/sw.js`) | Handles `push` events (show notification), caches today's word for offline, handles `notificationclick` | Browser Push API, Cache API |
| **OG route** (`/api/og/[slug]`) | Generates dynamic open graph images per word at request time | Supabase (reads word by slug, cached via Next.js Data Cache) |
| **AI feedback route** (`/api/activity/feedback`) | Accepts user sentence, calls Claude, returns pass/fail feedback; rate-limited per user per day | Anthropic API, Supabase (auth session for rate-limit check) |
| **Supabase RLS policies** | Row-level data isolation — users can only read/write their own rows | Applied transparently at the database layer |
| **pgvector column on `words`** | Semantic similarity queries before inserting new words | Queried exclusively by the cron generate pipeline |

---

## Data Flow

### 1. Daily AI Word Pipeline (Vercel Cron → Supabase)

```
vercel.json schedule: "0 6 * * *" (6 AM UTC daily)
  → GET /api/cron/generate
      ├── Verify Authorization: Bearer $CRON_SECRET
      ├── Fetch trending signals (Hacker News API, News API)
      ├── POST Anthropic Claude (claude-sonnet-4-6)
      │     prompt: structured system prompt → word, definition,
      │             context, examples, source citation
      ├── Generate embedding vector for word + definition text
      ├── Call Supabase RPC: match_words(embedding, threshold=0.92)
      │     → similarity match found: discard, retry with new signal
      │     → no match: proceed to insert
      ├── INSERT words { word, definition, context, examples,
      │                  heard_in_wild, source_url, date, embedding }
      │     using admin client (service role — bypasses RLS)
      └── Return 200 { success: true, word: "synergy" }
```

### 2. Page Load — Today's Word (User → CDN → Supabase)

```
User visits /
  → Next.js ISR page (export const revalidate = 86400)
      ├── Server Component: SELECT * FROM words
      │   WHERE date = CURRENT_DATE LIMIT 1
      ├── Renders HTML + RSC payload at server
      ├── CDN caches rendered output for 24 hours
      └── Client hydrates → Service Worker caches response

Subsequent visits same day (any user):
  → CDN cache HIT → no Supabase query, instant load

Offline visit after prior load:
  → Service Worker cache HIT → today's word loads with no network
```

### 3. Push Notification Dispatch (Vercel Cron → Users)

```
vercel.json schedule: "0 * * * *" (every hour, UTC)
  → GET /api/cron/notify
      ├── Verify CRON_SECRET
      ├── Compute current UTC hour (0–23)
      ├── Query push_subscriptions WHERE
      │     (timezone_utc_offset + notify_hour_local) % 24
      │     = current_utc_hour
      ├── Fetch today's word
      ├── For each matching subscription:
      │     webpush.sendNotification(subscription, {
      │       title: "Today's word: {word}",
      │       body: first sentence of definition,
      │       url: "/"
      │     })
      └── Return 200 { dispatched: N }
```

### 4. Activity Recording + Streak Update (Client → Server Action → Supabase)

```
User completes an activity
  → Client Component calls Server Action: recordActivity(wordId, type)
      ├── INSERT user_activity
      │   { user_id, word_id, activity_type, completed_at }
      │   ON CONFLICT DO NOTHING (idempotent)
      ├── Count activities completed today → compute points
      │   → IF points ≥ 5: upsert user_streaks
      └── Return { streakCount, pointsEarned, allDone: bool }
```

### 5. Deduplication via pgvector (Cron Pipeline Internal)

```
New word candidate generated by Claude:
  1. Concatenate: "{word}: {definition}"
  2. Generate embedding → float[1536]
  3. Supabase RPC: match_words(embedding, similarity_threshold=0.92)
  4. IF similarity > 0.92 → near-duplicate → discard, retry (max 3x)
  5. IF similarity ≤ 0.92 → safe → INSERT with embedding stored
```

---

## Patterns to Follow

### Pattern 1: Three Supabase Client Instantiation Patterns

```typescript
// lib/supabase/server.ts — Server Components, Route Handlers, Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: ... } }
  )
}

// lib/supabase/admin.ts — ONLY for cron endpoints (never expose to browser)
export const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NOT prefixed NEXT_PUBLIC_
)

// lib/supabase/client.ts — Client Components only
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
```

### Pattern 2: Secured Vercel Cron Route Handler

```typescript
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // pipeline logic
}
```

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/generate", "schedule": "0 6 * * *" },
    { "path": "/api/cron/notify",   "schedule": "0 * * * *" }
  ]
}
```

**Note:** Vercel Pro plan required for the hourly notify cron. Hobby plan allows only one cron per day.

### Pattern 3: ISR for Word Pages

```typescript
// app/page.tsx — today's word
export const revalidate = 86400

// app/[date]/page.tsx — archive pages
export async function generateStaticParams() { ... }

// Inside cron/generate after INSERT:
import { revalidatePath } from 'next/cache'
revalidatePath('/')
revalidatePath('/archive')
```

### Pattern 4: Streak Upsert — Idempotent, Database-Owned

```sql
INSERT INTO user_streaks (user_id, last_activity_date, current_streak, longest_streak)
VALUES ($1, CURRENT_DATE, 1, 1)
ON CONFLICT (user_id) DO UPDATE SET
  current_streak = CASE
    WHEN user_streaks.last_activity_date = CURRENT_DATE
      THEN user_streaks.current_streak          -- already done today, no-op
    WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day'
      THEN user_streaks.current_streak + 1      -- consecutive day
    ELSE 1                                       -- streak broken, reset
  END,
  longest_streak = GREATEST(user_streaks.longest_streak, ...),
  last_activity_date = CURRENT_DATE,
  updated_at = now();
```

### Pattern 5: pgvector Deduplication Setup

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE words ADD COLUMN embedding vector(1536);
CREATE INDEX words_embedding_idx
  ON words USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_words(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.92,
  match_count int DEFAULT 5
)
RETURNS TABLE (id uuid, word text, similarity float) AS $$
  SELECT id, word, 1 - (embedding <=> query_embedding) AS similarity
  FROM words
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE SQL STABLE;
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Consequence | Prevention |
|---|---|---|
| Blocking page load with AI calls | LCP >5s, unusable when Anthropic is slow | All AI generation pre-generated in cron pipeline |
| Service role key exposed to client | RLS bypassed; any user reads/writes any row | `SUPABASE_SERVICE_ROLE_KEY` never in `NEXT_PUBLIC_` prefix |
| Storing push subscriptions in module memory | Lost on every serverless cold start | Always persist to `push_subscriptions` table immediately |
| Non-idempotent cron operations | Double-inserts on Vercel's occasional duplicate invocations | `ON CONFLICT DO NOTHING` everywhere; unique constraints |
| Client-side streak computation | Timezone bugs, race conditions, permanent corruption | Streaks computed exclusively in DB via upsert |
| One cron for both generation + notifications | Can't run generation daily AND notifications hourly | Two separate cron endpoints with independent schedules |

---

## Supabase RLS Policy Structure

```sql
-- words: public read, service role only for writes
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "words_public_read" ON words FOR SELECT USING (true);

-- user_activity, user_streaks, user_favorites, push_subscriptions
-- Owner-only pattern on all user tables:
CREATE POLICY "owner_only" ON user_activity
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- (repeat for each user_ table)
```

---

## Suggested Build Order

Matches the project's UI-first decision — ship real UX with seed data, then layer in AI pipeline:

```
Phase 1: Foundation
  ├── Supabase project + full schema + RLS policies
  ├── Next.js 15 App Router + TypeScript + Tailwind scaffold
  └── Supabase Auth (email/password + Google + Apple OAuth)

Phase 2: Core UI (seed data)
  ├── Today's word page (ISR) + archive + OG images
  ├── PWA manifest + service worker + dark mode
  └── ~100 seed words inserted

Phase 3: Activities + Gamification (parallel-able with Phase 4)
  ├── Flashcard, Fill-in-Blank, Context Match, Use-it-in-a-Sentence
  └── Server Actions: recordActivity + streak upsert

Phase 4: Push + Email Notifications (parallel-able with Phase 3)
  ├── Service worker push handler + subscription routes
  └── Hourly notify cron + Resend email digest

Phase 5: AI Pipeline
  ├── pgvector + ivfflat index + match_words RPC
  ├── Signal fetchers + Claude generation + embedding dedup
  └── Daily generate cron (secured, idempotent)

Phase 6: SEO + Polish
  ├── Meta tags, JSON-LD, sitemap.xml, robots.txt
  └── Lighthouse PWA audit pass
```

---

## Sources

| Source | Confidence |
|--------|------------|
| Next.js 16.1.6 PWA guide (official docs) | HIGH |
| Next.js 16.1.6 Route Handlers (official docs) | HIGH |
| Next.js 16.1.6 Caching guide (official docs) | HIGH |
| Vercel Cron Jobs docs (official) | HIGH |
| Supabase `@supabase/ssr` two-client pattern | MEDIUM — verify against current changelog |
| pgvector ivfflat threshold (0.92) | MEDIUM — tune empirically |
