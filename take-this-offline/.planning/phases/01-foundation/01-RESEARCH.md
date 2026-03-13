# Phase 1: Foundation - Research

**Researched:** 2026-03-13
**Domain:** Next.js 15 App Router + Supabase Auth + pgvector + Vercel deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Seed data content**
- All ~100 seed words must have full production-ready editorial content: definition, executive summary, where/how used, usage examples, and a "Heard in the Wild" citation with source link
- No placeholder or stub data — seed words are real day-1 content visible to users

**Seed data generation**
- All ~100 words are AI-generated using Claude in a single seed script run
- The seed script calls Claude once per word to produce the full editorial content
- Claude assigns a category from a fixed predefined list (e.g. Strategy, Tech, Finance, HR, Operations) — not free-form tags

**Seed script behavior**
- Idempotent and re-runnable: script checks for existing words by slug/title and skips them
- Safe to run in CI or if interrupted mid-seed — no duplicate inserts

**Word dating**
- Each seed word is assigned a unique past calendar date (spread across the last ~100 days)
- Archive and daily word routing work immediately without special handling

**Vector embeddings**
- Embeddings are generated during seeding — seed script calls an embedding model per word and stores vectors
- No Phase 5 backfill needed; seed words are fully integrated when the AI pipeline runs

### Claude's Discretion
- Auth UI layout (dedicated pages vs. modal, sign-in/sign-up routes)
- Post-auth redirect behavior
- Project folder structure and route conventions
- Supabase schema naming, RLS policy approach
- Exact fixed category list values
- Embedding model choice (text-embedding-3-small or Supabase built-in)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up and sign in with email and password | Supabase `signUpWithPassword` + `signInWithPassword`, email confirm flow, route handler at `/auth/confirm` |
| AUTH-02 | User can sign in with Google OAuth | `signInWithOAuth({ provider: 'google' })`, Google Cloud console setup, callback handler at `/auth/callback` |
| AUTH-03 | User can sign in with Apple OAuth | `signInWithOAuth({ provider: 'apple' })`, Apple Developer account, 6-month secret key rotation caveat |
| AUTH-04 | User session persists across browser refresh | `@supabase/ssr` middleware with `getClaims()` refreshes tokens on every request; cookie-based sessions |
| PIPE-03 | System seeds the database with ~100 curated words before pipeline is live | TypeScript seed script using Claude API + Voyage AI embeddings + Supabase upsert; idempotent by slug |
</phase_requirements>

---

## Summary

Phase 1 establishes the full project foundation: Next.js 15 App Router scaffold, Supabase database schema with pgvector enabled, Supabase Auth (email/password + Google + Apple OAuth), and a production seed script that populates ~100 words with full editorial content and vector embeddings. The tech stack is fully locked — the research confirms all choices are well-supported by current (2025-2026) documentation and ecosystem tooling.

The most important architectural decision this phase makes for all subsequent phases is the database schema. The `words` table must include all fields for Phase 2 content display, a `daily_date` column (unique, used for archive routing), a `category` column (enum-like, used for Phase 2 filtering), and a `vector(1024)` embedding column for Phase 5 deduplication. Getting this schema right here avoids migrations later.

The trickiest implementation item is Apple OAuth: it requires Apple Developer account setup, a Services ID, and a .p8 signing key that must be rotated every 6 months. This is a manual external dependency that needs to be scheduled as a maintenance reminder, not just code.

**Primary recommendation:** Use `npx create-next-app -e with-supabase` as the scaffold base (Supabase's official Next.js 15 + Tailwind + TypeScript + SSR auth template), then build the schema, seed script, and auth UI on top of it.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 15.x | App Router, SSR, routing | Locked by project |
| `typescript` | 5.x | Type safety | Locked by project |
| `tailwindcss` | 3.x / 4.x | Styling | Locked by project |
| `@supabase/supabase-js` | latest (2.x) | Supabase client | Official JS client |
| `@supabase/ssr` | latest | Cookie-based SSR auth for Next.js | Replaces deprecated auth-helpers-nextjs |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `voyageai` | 0.2.x | Vector embeddings for seed script | Seed script only — Anthropic's recommended embedding provider |
| `@anthropic-ai/sdk` | latest | Claude API calls for content generation | Seed script content generation |
| `slugify` | latest | Generate URL-safe slugs from word titles | Seed script + any word insert |
| `supabase` CLI | latest | Local dev, migrations, type generation | Dev environment |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `voyageai` (voyage-3.5) | OpenAI `text-embedding-3-small` | OpenAI requires separate account/billing; Voyage is Anthropic's recommended provider, voyage-3.5 has 1024 dimensions vs 1536 for text-embedding-3-small (smaller = cheaper storage) |
| `voyageai` (voyage-3.5) | Supabase built-in embeddings | Supabase built-in uses `pg_net` + external model calls; more complex setup for seed script context |
| Dedicated auth pages | Modal overlay auth | Dedicated pages are simpler for SSR session redirect flows and deep-linking to auth |

**Installation:**
```bash
# Scaffold (includes @supabase/supabase-js, @supabase/ssr, tailwind, typescript)
npx create-next-app -e with-supabase

# Additional for seed script
npm install voyageai @anthropic-ai/sdk slugify

# Dev tooling
npm install --save-dev supabase
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect (→ /word/today or landing)
│   ├── auth/
│   │   ├── sign-in/page.tsx    # Email + OAuth sign-in
│   │   ├── sign-up/page.tsx    # Email sign-up
│   │   ├── callback/route.ts   # OAuth + magic link code exchange
│   │   └── confirm/route.ts    # Email confirmation token exchange
│   └── (protected)/            # Route group requiring auth (Phase 3+)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient()
│   │   ├── server.ts           # createServerClient() for Server Components
│   │   └── middleware.ts       # createServerClient() for middleware
│   └── types/
│       └── database.types.ts   # Supabase-generated DB types
├── middleware.ts                # Token refresh proxy (top-level, next to app/)
supabase/
├── migrations/
│   └── 20260313000000_initial_schema.sql
└── seed/
    └── seed.ts                 # Word seeding script
```

### Pattern 1: Dual Supabase Client Setup

**What:** Two distinct Supabase client constructors — one for browser (Client Components), one for server (Server Components, Route Handlers, Server Actions).

**When to use:** Always. Never use the browser client in server code.

**Example:**
```typescript
// src/lib/supabase/client.ts — Client Components only
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

// src/lib/supabase/server.ts — Server Components, Route Handlers, Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component — middleware handles refresh */ }
        },
      },
    }
  )
}
```
Source: https://supabase.com/docs/guides/auth/server-side/nextjs

### Pattern 2: Middleware Token Refresh

**What:** Next.js middleware intercepts every request to call `supabase.auth.getClaims()`, which validates the JWT and refreshes the session cookie if expired.

**When to use:** Always — required for SSR auth to work. Without this, Server Components see stale/expired sessions.

**Example:**
```typescript
// middleware.ts (project root, not inside src/)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: use getClaims(), not getSession() — validates JWT signature
  await supabase.auth.getClaims()

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```
Source: https://supabase.com/docs/guides/auth/server-side/nextjs

### Pattern 3: OAuth Callback Route Handler

**What:** A route handler at `/auth/callback` exchanges the authorization `code` returned by the OAuth provider for a Supabase session. Required for both Google and Apple OAuth, and for magic links.

**Example:**
```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_error`)
}
```
Source: https://supabase.com/docs/guides/auth/social-login/auth-google

### Pattern 4: Idempotent Seed Script with Embeddings

**What:** A TypeScript script (run via `npx ts-node` or `tsx`) that generates word content with Claude, generates embeddings with Voyage AI, and upserts into Supabase. Skips existing words by slug.

**Example:**
```typescript
// supabase/seed/seed.ts
import Anthropic from '@anthropic-ai/sdk'
import { VoyageAIClient } from 'voyageai'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS for seed
)

async function seedWord(title: string, dailyDate: string) {
  // Check idempotency
  const slug = slugify(title, { lower: true, strict: true })
  const { data: existing } = await supabase
    .from('words')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    console.log(`Skipping "${title}" — already exists`)
    return
  }

  // Generate editorial content
  const content = await anthropic.messages.create({ /* ... */ })

  // Generate embedding from combined text
  const embeddingText = `${title}: ${definition} ${executiveSummary}`
  const embeddingResult = await voyage.embed({
    input: [embeddingText],
    model: 'voyage-3.5',
    inputType: 'document',
  })
  const embedding = embeddingResult.data[0].embedding

  // Upsert
  await supabase.from('words').insert({
    title, slug, daily_date: dailyDate,
    embedding, /* ...other fields */
  })
  console.log(`Seeded "${title}"`)
}
```

### Anti-Patterns to Avoid

- **Using `getSession()` in middleware or server code:** `getSession()` does not revalidate JWT signatures. Use `getClaims()` instead for any server-side session validation.
- **Using the service role key in client-side code:** Service role bypasses all RLS. It must only appear in server-side seed scripts and secure server routes.
- **Creating Supabase schema via the Dashboard UI only:** Dashboard changes don't generate migration files. Always write SQL migrations to `supabase/migrations/` for reproducibility.
- **Storing embeddings with wrong vector dimensions:** `voyage-3.5` produces 1024-dimensional vectors. Your `vector(1024)` column declaration must match. Mismatched dimensions silently fail or error at insert.
- **Running seed script with anon key:** RLS will block inserts. Seed scripts must use the service role key.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookie management | Custom token storage/refresh | `@supabase/ssr` middleware | Handles refresh timing, cookie scoping, proxy pattern correctly |
| OAuth flow | Custom OAuth redirect/callback | Supabase `signInWithOAuth()` + callback route | Provider-specific token exchange, PKCE, nonce handling |
| Password hashing | bcrypt wrapper | Supabase Auth | bcrypt, rate limiting, breach detection built in |
| Vector similarity search | Custom cosine similarity | pgvector `<->` operator + HNSW index | Performance, correctness at scale |
| DB type safety | Manual TypeScript interfaces | `supabase gen types typescript` | Auto-generated from actual schema, stays in sync |
| Slug generation | Custom regex | `slugify` package | Edge cases: unicode, special chars, collisions |

**Key insight:** Supabase Auth handles the entire auth lifecycle including token refresh, provider integration, and session persistence. Any custom auth layer adds complexity without security benefit.

---

## Common Pitfalls

### Pitfall 1: Apple OAuth 6-Month Key Rotation

**What goes wrong:** Apple OAuth stops working completely when the client_secret JWT expires (generated from the .p8 key, max 6 months).
**Why it happens:** Apple's OAuth flow requires a signed JWT secret (not a static key). It must be regenerated from the .p8 signing file every ≤6 months.
**How to avoid:** Set a calendar reminder at deployment. Store the .p8 file securely (not in the repo). Document the rotation procedure in the project README.
**Warning signs:** Apple sign-in returns auth error after several months of working correctly.

### Pitfall 2: Server Components Writing Cookies

**What goes wrong:** Session updates inside Server Components silently fail — the response headers can't be modified by Server Components.
**Why it happens:** Next.js Server Components are read-only for response headers by design.
**How to avoid:** The middleware proxy pattern (Pattern 2 above) handles all cookie writes. Server Components only need to call `supabase.auth.getClaims()` to read the session — never to set it.
**Warning signs:** User appears logged out in Server Components despite middleware showing a valid session.

### Pitfall 3: Apple Only Provides User Name on First Sign-In

**What goes wrong:** After the user's first Apple sign-in, Apple never sends the user's name again. If you don't capture it on the first callback, it's gone.
**Why it happens:** Apple's privacy design — name is part of the initial consent screen, not the token.
**How to avoid:** In the `/auth/callback` route handler, after `exchangeCodeForSession`, call `supabase.auth.updateUser({ data: { full_name: name } })` on first login using the name from the Apple response.
**Warning signs:** Users who sign in with Apple have no display name after first session.

### Pitfall 4: Seed Script Embedding Dimension Mismatch

**What goes wrong:** Insert fails or data is silently truncated if the `vector()` column size doesn't match the embedding model output.
**Why it happens:** `voyage-3.5` outputs 1024 dimensions by default. `text-embedding-3-small` (OpenAI) outputs 1536. These are incompatible column types.
**How to avoid:** Choose the embedding model before writing the migration. Use `vector(1024)` for voyage-3.5.
**Warning signs:** Error on seed insert: "expected 1024 dimensions, got 1536" (or vice versa).

### Pitfall 5: RLS Blocking Seed Script

**What goes wrong:** Seed inserts return permission denied errors.
**Why it happens:** The `words` table has RLS enabled; the anon key used to create the Supabase client in the seed script is not allowed to insert.
**How to avoid:** Seed scripts must use `SUPABASE_SERVICE_ROLE_KEY` (server-side env variable, never `NEXT_PUBLIC_`). Keep this key out of the repo.
**Warning signs:** `{ error: { code: '42501', message: 'new row violates row-level security policy' } }`

### Pitfall 6: `daily_date` Uniqueness and Timezone

**What goes wrong:** Two words assigned the same `daily_date` cause the "today's word" query to return multiple rows (or non-deterministically pick one).
**Why it happens:** Seed script generates dates without uniqueness checks, or stores date+time instead of date-only.
**How to avoid:** Use a `DATE` column type (not `TIMESTAMP`), add a `UNIQUE` constraint on `daily_date`. Generate seed dates as `YYYY-MM-DD` strings spaced one day apart.
**Warning signs:** `/word/today` returns 0 or 2+ rows.

---

## Code Examples

Verified patterns from official sources:

### Enable pgvector and Create Words Table

```sql
-- supabase/migrations/20260313000000_initial_schema.sql

-- Enable pgvector
create extension if not exists vector with schema extensions;

-- Category enum
create type word_category as enum (
  'Strategy', 'Tech', 'Finance', 'HR', 'Operations', 'Marketing', 'Legal', 'Other'
);

-- Words table
create table public.words (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  daily_date  date not null unique,
  category    word_category not null,
  definition  text not null,
  exec_summary  text not null,
  where_used    text not null,
  usage_examples  jsonb not null default '[]',
  heard_in_wild   text,
  heard_source_url  text,
  embedding   extensions.vector(1024),
  created_at  timestamptz not null default now()
);

-- HNSW index for fast cosine similarity search (used in Phase 5 deduplication)
create index words_embedding_idx
  on public.words
  using hnsw (embedding extensions.vector_cosine_ops);

-- RLS
alter table public.words enable row level security;

-- Public read — words are visible to everyone (anon + authenticated)
create policy "Words are publicly readable"
  on public.words for select
  to anon, authenticated
  using (true);

-- No public insert/update/delete — only service role (seed script) can write
```
Source: https://supabase.com/docs/guides/database/extensions/pgvector, https://supabase.com/docs/guides/database/postgres/row-level-security

### OAuth Sign-In (Google + Apple)

```typescript
// Works identically for 'google' and 'apple'
const supabase = createClient() // browser client

await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'apple'
  options: {
    redirectTo: `${location.origin}/auth/callback?next=/`,
  },
})
```
Source: https://supabase.com/docs/guides/auth/social-login/auth-google

### Email/Password Auth

```typescript
// Sign Up
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${origin}/auth/confirm` },
})

// Sign In
const { error } = await supabase.auth.signInWithPassword({ email, password })
```
Source: https://supabase.com/docs/guides/auth/server-side/nextjs

### Generate TypeScript Types from Schema

```bash
# Run after schema migration to keep types in sync
npx supabase gen types typescript --project-id <ref> > src/lib/types/database.types.ts
```

### Voyage AI Embedding (TypeScript)

```typescript
import { VoyageAIClient } from 'voyageai'

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })

const result = await voyage.embed({
  input: ['synergy: The combined effect of two entities working together...'],
  model: 'voyage-3.5',
  inputType: 'document',
})

const embedding: number[] = result.data[0].embedding // length: 1024
```
Source: https://docs.voyageai.com/docs/embeddings, npm package `voyageai@0.2.x`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | ~2024 | auth-helpers deprecated; ssr package is the current standard |
| `getSession()` for server validation | `getClaims()` for server validation | 2024-2025 | `getSession()` doesn't validate JWT on server; `getClaims()` does |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env var | 2025 | Supabase renamed to "publishable key" for clarity; anon key still works but publishable is the new name |
| OpenAI for embeddings with Anthropic stack | Voyage AI | Ongoing | Anthropic officially recommends Voyage AI; no Anthropic native embedding model exists |
| `create-next-app` then manual Supabase add | `npx create-next-app -e with-supabase` | 2024 | Official template ships with correct SSR auth setup pre-wired |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated, do not use in new projects
- `supabase.auth.getSession()` in middleware: Insecure for server-side — use `getClaims()` instead

---

## Open Questions

1. **Embedding model: Voyage AI vs OpenAI**
   - What we know: Anthropic officially recommends Voyage AI (voyage-3.5, 1024 dims). OpenAI text-embedding-3-small also works (1536 dims). Both require separate API accounts and billing.
   - What's unclear: The project's Claude's Discretion section mentions "text-embedding-3-small or Supabase built-in" — but Supabase built-in embedding requires Supabase Edge Functions and is more complex for a seed script. OpenAI is valid but adds an extra vendor.
   - Recommendation: Use Voyage AI (`voyage-3.5`, 1024 dims) — aligned with Anthropic's recommendation, lower storage cost than 1536-dim OpenAI, simple npm package. Requires `VOYAGE_API_KEY` env variable in seed script context.

2. **Apple OAuth: Apple Developer account availability**
   - What we know: Requires Apple Developer Program membership ($99/year), a Services ID, and a generated .p8 key.
   - What's unclear: Whether the developer has an Apple Developer account ready.
   - Recommendation: Flag as an external prerequisite. If account is not available, AUTH-03 is blocked by external setup, not code. Apple OAuth can be wired up but not tested without the credentials.

3. **Category enum finalization**
   - What we know: Claude assigns category during seeding from a fixed list. Categories must align with Phase 2 archive filter UI.
   - What's unclear: The exact list of category values (flagged as Claude's Discretion).
   - Recommendation: Define the enum values in the migration. Suggested set: `Strategy`, `Tech`, `Finance`, `HR`, `Operations`, `Marketing`, `Legal`, `Other`. These cover common business jargon domains and are easy to filter in Phase 2.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected yet — Wave 0 must set up |
| Recommended framework | Playwright (E2E auth flows) + Vitest (unit for seed script utilities) |
| Config file | `playwright.config.ts` + `vitest.config.ts` (to be created in Wave 0) |
| Quick run command | `npx vitest run` (unit) |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Email sign-up creates account; email sign-in returns session | E2E | `npx playwright test tests/auth/email.spec.ts` | Wave 0 |
| AUTH-01 | Sign-up with duplicate email returns error | E2E | `npx playwright test tests/auth/email.spec.ts` | Wave 0 |
| AUTH-02 | Google OAuth redirects to /auth/callback, session established | E2E (manual OAuth) | Manual — OAuth redirect can't be fully automated without Google test account | Manual-only |
| AUTH-03 | Apple OAuth redirects to /auth/callback, session established | E2E (manual OAuth) | Manual — Apple OAuth requires device/account | Manual-only |
| AUTH-04 | Session cookie present after sign-in; page refresh returns authenticated state | E2E | `npx playwright test tests/auth/session.spec.ts` | Wave 0 |
| PIPE-03 | Seed script inserts ~100 words; re-run skips existing | Integration | `npx tsx supabase/seed/seed.ts --dry-run && npx vitest run tests/seed/seed.test.ts` | Wave 0 |
| PIPE-03 | Each word has non-null embedding of length 1024 | Integration | `npx vitest run tests/seed/embeddings.test.ts` | Wave 0 |
| PIPE-03 | All words have unique `daily_date` and `slug` | Integration | `npx vitest run tests/seed/uniqueness.test.ts` | Wave 0 |

**Note on OAuth tests:** Google and Apple OAuth cannot be fully automated in CI without test OAuth credentials and browser automation that bypasses provider consent screens. These must be manually verified during phase verification.

### Sampling Rate

- **Per task commit:** `npx vitest run` (unit/integration tests for the task's scope)
- **Per wave merge:** `npx vitest run && npx playwright test tests/auth/email.spec.ts tests/auth/session.spec.ts`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/auth/email.spec.ts` — covers AUTH-01 (sign-up, sign-in, duplicate email error)
- [ ] `tests/auth/session.spec.ts` — covers AUTH-04 (session persistence after refresh)
- [ ] `tests/seed/seed.test.ts` — covers PIPE-03 (idempotency)
- [ ] `tests/seed/embeddings.test.ts` — covers PIPE-03 (embedding length 1024, non-null)
- [ ] `tests/seed/uniqueness.test.ts` — covers PIPE-03 (unique daily_date, slug)
- [ ] `playwright.config.ts` — Playwright configuration targeting local dev server
- [ ] `vitest.config.ts` — Vitest configuration for integration/unit tests
- [ ] Framework install: `npm install --save-dev playwright vitest @playwright/test @vitest/coverage-v8 tsx`

---

## Sources

### Primary (HIGH confidence)

- https://supabase.com/docs/guides/auth/server-side/nextjs — SSR auth setup, dual client pattern, middleware proxy, `getClaims()` requirement
- https://supabase.com/docs/guides/auth/social-login/auth-google — Google OAuth configuration steps and callback handler
- https://supabase.com/docs/guides/auth/social-login/auth-apple — Apple OAuth requirements, 6-month key rotation, first-login name caveat
- https://supabase.com/docs/guides/database/extensions/pgvector — pgvector extension, vector column creation, HNSW index
- https://supabase.com/docs/guides/database/postgres/row-level-security — RLS policies, public read pattern, owner-only pattern
- https://platform.claude.com/docs/claude/docs/embeddings — Anthropic's embedding recommendation (Voyage AI), model table with dimensions

### Secondary (MEDIUM confidence)

- https://supabase.com/docs/guides/auth/quickstarts/nextjs — Official scaffold using `create-next-app -e with-supabase`; env variable naming (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- https://www.npmjs.com/package/voyageai — voyageai npm package, version 0.2.x, TypeScript support confirmed
- https://github.com/voyage-ai/typescript-sdk — Voyage AI TypeScript SDK details

### Tertiary (LOW confidence)

- https://noqta.tn/en/tutorials/supabase-nextjs-realtime-app-guide-2026 — Referenced for pattern verification only; primary source is official docs

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all libraries confirmed via official Supabase and Anthropic documentation
- Architecture: HIGH — dual client pattern and middleware proxy are from official Supabase SSR guide
- Pitfalls: HIGH for Apple OAuth rotation and RLS (official docs); MEDIUM for cookie write pattern (confirmed by middleware docs behavior)
- Embedding model choice: MEDIUM — Voyage AI is Anthropic's documented recommendation; OpenAI also viable but adds vendor

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable stack; `@supabase/ssr` API is settling but unlikely to break in 30 days)
