# Phase 5: AI Pipeline - Research

**Researched:** 2026-03-14
**Domain:** Vercel Cron Jobs, Anthropic Claude API, VoyageAI embeddings, pgvector semantic deduplication, Hacker News Algolia API
**Confidence:** HIGH

---

## Summary

Phase 5 closes the loop on daily content generation. A Vercel cron job fires once per day, fetches trending signals from the Hacker News Algolia API (no API key required), prompts Claude to choose and expand a business/tech jargon term, generates a VoyageAI voyage-3.5 embedding (1024-dim, matching the existing schema column), performs cosine-distance deduplication against all existing words via a Postgres RPC function, and inserts the word only if it passes the similarity threshold. The job's idempotency is guaranteed by the `daily_date UNIQUE` constraint already in the schema.

The entire stack is already in place: `@anthropic-ai/sdk ^0.78.0` and `voyageai ^0.2.1` are installed, the `embedding extensions.vector(1024)` column and its HNSW index exist, and the `CRON_SECRET` pattern is already used by the two Phase 4 cron routes. Phase 5 adds one new cron route (`/api/cron/generate-word`) and one new Postgres RPC function (`match_similar_words`). No new dependencies are required.

One important upgrade is available: Anthropic's structured outputs feature (now GA, not just beta, for Claude Sonnet 4.6 and other current models) can replace the fragile `JSON.parse(text)` pattern used in the seed script, guaranteeing the word content shape without try/catch around JSON.parse.

**Primary recommendation:** Use a single `/api/cron/generate-word` route on a `0 2 * * *` schedule (daily at 02:00 UTC), following the exact same CRON_SECRET guard pattern as the existing Phase 4 cron routes.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PIPE-01 | System generates a new word daily from trending news/Hacker News signals via Claude | Hacker News Algolia API (no auth required) provides last-24h top stories; Claude generates structured word content; Vercel daily cron triggers at 02:00 UTC |
| PIPE-02 | System deduplicates new words against existing words using vector embeddings (pgvector, cosine similarity) | voyage-3.5 generates 1024-dim embedding; Postgres `match_similar_words` RPC using `<=>` cosine distance operator against HNSW index; threshold ~0.15 (cosine distance, not similarity) |
</phase_requirements>

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | ^0.78.0 | Word content generation (structured JSON output) | Already used in sentence-feedback route; seed script |
| `voyageai` | ^0.2.1 | 1024-dim embeddings for dedup | Already used in seed script; matches `vector(1024)` column |
| Vercel Cron | built-in | Daily trigger at 02:00 UTC | Already used for Phase 4 push-dispatch and email-digest crons |
| Supabase service role client | `@supabase/supabase-js` | Write words table (bypasses RLS) | Established pattern from seed script and Phase 4 crons |
| HN Algolia API | no package (native fetch) | Trending signal source | Free, no auth, no rate limit issues for 1 req/day |

### No New Dependencies Required

All packages needed for Phase 5 are already in `package.json`. The only additions are:
- A new route file: `src/app/api/cron/generate-word/route.ts`
- A new Supabase migration: `supabase/migrations/YYYYMMDDHHMMSS_add_match_similar_words.sql`
- An update to `vercel.json` crons array

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HN Algolia API | Reddit API, NewsAPI | HN Algolia is free with no auth; Reddit/News require API keys and rate limits |
| voyage-3.5 (existing) | voyage-4-large (newer) | voyage-3.5 is still current and matches the existing `vector(1024)` DB column; switching would require a schema migration to `vector(2048)` and re-embedding all ~100 seed words |
| JSON.parse pattern (seed) | Anthropic structured outputs | Structured outputs (`output_config.format`) are now GA on claude-opus-4-5 and all claude-4-6 models; they eliminate parse errors with zero extra cost |

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/api/cron/
├── push-dispatch/route.ts       # Phase 4 — hourly push
├── email-digest/route.ts        # Phase 4 — daily 08:00 UTC
└── generate-word/route.ts       # Phase 5 — daily 02:00 UTC (NEW)

supabase/migrations/
├── 20260313000000_initial_schema.sql
├── 20260314000000_gamification_schema.sql
├── 20260314000001_notifications_schema.sql
└── YYYYMMDDHHMMSS_add_match_similar_words.sql   # Phase 5 (NEW)

src/lib/
└── pipeline.ts                  # Optional: extracted helpers (generateWordContent, fetchHNSignals, checkDuplicate)
```

### Pattern 1: Vercel Cron Route with CRON_SECRET Guard

**What:** GET route handler that validates `Authorization: Bearer $CRON_SECRET` before doing any work.
**When to use:** All Vercel cron routes in this project.

```typescript
// Source: existing src/app/api/cron/push-dispatch/route.ts (Phase 4)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... pipeline logic ...
}
```

### Pattern 2: Idempotency via daily_date UNIQUE Constraint

**What:** Before generating anything, check whether a word already exists for today's date. If yes, return early with a 200 and `{ skipped: true }`.
**When to use:** Any time the cron might be invoked more than once (manual re-run, Vercel retry, developer testing).

```typescript
// Idempotency guard — runs BEFORE any API calls to Claude or VoyageAI
const today = new Date().toISOString().split('T')[0]  // 'YYYY-MM-DD'
const { data: existing } = await supabase
  .from('words')
  .select('id')
  .eq('daily_date', today)
  .maybeSingle()

if (existing) {
  return NextResponse.json({ skipped: true, reason: 'word already exists for today' })
}
```

Note: Even without this guard, a second INSERT with the same `daily_date` would fail at the DB level due to the UNIQUE constraint. The guard just avoids wasteful Claude/VoyageAI API calls.

### Pattern 3: HN Algolia Trending Signals

**What:** Fetch the top 10 stories from the last 24 hours to provide context to Claude for choosing a relevant jargon term.
**When to use:** As the first step in the generate-word pipeline.

```typescript
// Source: HN Algolia API — no API key required
// https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=...
const since = Math.floor((Date.now() - 86_400_000) / 1000)  // 24h ago in Unix seconds
const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${since},points>10&hitsPerPage=10`
const res = await fetch(url)
const { hits } = await res.json() as { hits: Array<{ title: string }> }
const headlines = hits.map((h) => h.title).join('\n')
```

### Pattern 4: Anthropic Structured Output for Word Content

**What:** Use `output_config.format` with a JSON schema to guarantee Claude returns the exact word content shape, eliminating `JSON.parse` fragility.
**When to use:** All Claude calls that must return structured data.

```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
// Works with claude-opus-4-5, claude-sonnet-4-6, and other current models
const response = await anthropic.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
  output_config: {
    format: {
      type: 'json_schema',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          definition: { type: 'string' },
          exec_summary: { type: 'string' },
          where_used: { type: 'string' },
          usage_examples: { type: 'array', items: { type: 'string' } },
          heard_in_wild: { type: ['string', 'null'] },
          heard_source_url: { type: ['string', 'null'] },
          category: { type: 'string', enum: ['Strategy','Tech','Finance','HR','Operations','Marketing','Legal','Other'] }
        },
        required: ['title','definition','exec_summary','where_used','usage_examples','heard_in_wild','heard_source_url','category'],
        additionalProperties: false
      }
    }
  }
})
// textBlock.text is guaranteed valid JSON matching the schema above
```

### Pattern 5: pgvector Cosine Similarity RPC for Deduplication

**What:** A Postgres function that returns the minimum cosine distance between a new candidate embedding and all existing word embeddings. If the minimum distance is below the threshold (meaning: too similar), reject the word.
**When to use:** After generating an embedding for the candidate word, before inserting.

**CRITICAL:** The `<=>` operator is **cosine distance**, not cosine similarity. Distance 0 = identical, distance 1 = orthogonal, distance 2 = opposite. For deduplication, reject if `min_distance < threshold`. A threshold of **0.15** (distance) is a reasonable starting point — words with cosine distance < 0.15 are semantically very close.

```sql
-- Source: Supabase semantic search docs (https://supabase.com/docs/guides/ai/semantic-search)
-- Migration: supabase/migrations/YYYYMMDDHHMMSS_add_match_similar_words.sql
create or replace function match_similar_words(
  query_embedding extensions.vector(1024),
  similarity_threshold float  -- cosine DISTANCE threshold (0 = identical, lower = more similar)
)
returns table(id uuid, title text, distance float)
language sql
as $$
  select id, title, (embedding <=> query_embedding) as distance
  from public.words
  where embedding is not null
    and (embedding <=> query_embedding) < similarity_threshold
  order by distance asc
  limit 1;
$$;
```

```typescript
// JavaScript RPC call
const { data: duplicates } = await supabase.rpc('match_similar_words', {
  query_embedding: `[${embedding.join(',')}]`,  // pgvector string format matches seed script
  similarity_threshold: 0.15
})

if (duplicates && duplicates.length > 0) {
  return NextResponse.json({
    skipped: true,
    reason: `too similar to existing word: "${duplicates[0].title}" (distance: ${duplicates[0].distance.toFixed(3)})`
  })
}
```

### Pattern 6: VoyageAI Embedding — Consistent Text Format

**What:** Use the same text format as the seed script for embed input: `title: definition execSummary`. Using a consistent format ensures cosine similarity is comparable across seed words and pipeline-generated words.
**When to use:** Any time an embedding is generated for a word.

```typescript
// Source: supabase/seed/seed.ts line 81 — "same pattern Phase 5 will use"
const embedText = `${title}: ${definition} ${exec_summary}`
const result = await voyage.embed({
  input: [embedText],
  model: 'voyage-3.5',         // 1024 dimensions — matches vector(1024) column
  inputType: 'document',
})
const embedding = result.data![0].embedding as number[]
```

### Anti-Patterns to Avoid

- **Calling Claude/VoyageAI before the idempotency check:** Always check `daily_date` existence first. API calls are expensive and slow; skip them when today's word already exists.
- **Using cosine similarity (1 - distance) for the threshold filter instead of cosine distance:** pgvector's `<=>` returns distance (0 = same). The Supabase SQL WHERE clause must be `<=>  < threshold` (not `>`). Using the wrong direction silently rejects all words or accepts all duplicates.
- **Parsing Claude output with JSON.parse without structured outputs:** The seed script's `JSON.parse(text)` pattern works but can fail if Claude adds prose. Use `output_config.format` for guaranteed schema compliance.
- **Generating embeddings for the candidate word before generating word content:** You need `title + definition + exec_summary` to form the embed text, so content must be generated first.
- **Not storing the slug before the dedup check:** The slug uniqueness constraint is a second guard. Check slug existence in the idempotency check alongside `daily_date`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cosine similarity at scale | Custom in-memory vector comparison | pgvector HNSW index + `<=>` operator | HNSW index already exists; Postgres handles this in microseconds even at 1M+ rows |
| JSON schema validation of Claude output | Manual field checking with if-statements | `output_config.format` structured outputs | Guaranteed schema compliance at token generation level; no post-parse validation needed |
| Trending signal discovery | Scraping HN HTML | HN Algolia REST API | Free, no auth, stable JSON, handles pagination |
| Rate limiting the cron | Manual sleep/retry logic | Vercel single daily cron + DB idempotency check | Cron fires once/day; idempotency check catches any manual re-runs |
| Dedup by string matching | `ilike` title comparison | pgvector cosine distance | String matching misses synonyms ("ROI" vs "Return on Investment"), abbreviations, and paraphrases |

**Key insight:** Every deduplication edge case (synonyms, abbreviations, paraphrases, near-duplicate definitions) is caught by vector similarity in a way that string matching cannot replicate. The HNSW index is already built — use it.

---

## Common Pitfalls

### Pitfall 1: Cosine Distance vs. Cosine Similarity Direction

**What goes wrong:** Developer writes `WHERE (embedding <=> query) > threshold` (expecting similarity semantics), which rejects similar words instead of accepting them. Or writes `1 - (embedding <=> query) > threshold` correctly conceptually but with a threshold value tuned for similarity (0.8) when distance is being compared.
**Why it happens:** pgvector's `<=>` returns cosine **distance** (0 = identical, not 1 = identical). The Supabase docs note this explicitly: "Cosine distance is a safe default."
**How to avoid:** Always write `(embedding <=> query) < distance_threshold` for "reject if too similar." Use distance threshold ~0.10–0.20 (not similarity threshold 0.80–0.90).
**Warning signs:** Cron never rejects any word even when obvious near-duplicates exist.

### Pitfall 2: Hobby vs. Pro Plan Cron Constraints

**What goes wrong:** A daily cron works on Hobby. Any attempt to add a second cron for retries or hourly scheduling breaks deployment with: "Hobby accounts are limited to daily cron jobs."
**Why it happens:** Hobby plan enforces once-per-day minimum interval. The project already has two crons (`push-dispatch` hourly, `email-digest` daily) — this means the project **must already be on Pro** for the push-dispatch cron to function.
**How to avoid:** Confirm the project is on Vercel Pro before Phase 5 adds a third cron. (The Phase 4 hourly push-dispatch cron would have already failed on Hobby — this is a pre-existing concern.)
**Warning signs:** Deployment fails with Hobby cron limit error.

### Pitfall 3: pgvector String Format for Embeddings

**What goes wrong:** Passing a JavaScript `number[]` array directly to Supabase's `rpc()` or `insert()` instead of the pgvector string format `'[1,2,3,...]'`.
**Why it happens:** pgvector expects a string like `'[0.1, -0.2, ...]'` when passed through PostgREST/Supabase JS client.
**How to avoid:** Use `\`[${embedding.join(',')}]\`` — exactly as the seed script does on line 122.
**Warning signs:** Supabase insert/RPC returns a type mismatch error on the embedding column.

### Pitfall 4: HN Algolia API Returning No Results

**What goes wrong:** At 02:00 UTC, the 24h window might return few or no stories (e.g., slow news day, weekend). The pipeline must handle an empty `hits` array gracefully and still generate a word (using a fallback prompt without HN context).
**Why it happens:** HN traffic patterns vary; `points>10` filter can occasionally return zero results for a narrow time window.
**How to avoid:** If `hits.length === 0`, fall back to a generic prompt: "Generate a trending business or tech jargon term from 2025-2026 that a professional might encounter in meetings."
**Warning signs:** Pipeline throws on `.map()` of empty array or Claude receives an empty headline list.

### Pitfall 5: `daily_date` Must Be the Next Unclaimed Date, Not "Today"

**What goes wrong:** At 02:00 UTC, "today" in UTC is the correct target date. But if the cron runs late (Vercel timing precision for Hobby is ±59 minutes), the route should still use the UTC date at the moment it fires — not a hardcoded "+1 day" offset.
**Why it happens:** Developers sometimes assume cron runs "tomorrow's word" and compute `today + 1`. The cron should compute `new Date().toISOString().split('T')[0]` at runtime — whatever today's UTC date actually is.
**How to avoid:** Always use `new Date().toISOString().split('T')[0]` for `daily_date` assignment, consistent with all other routes in this project.

### Pitfall 6: Claude Choosing a Word Already in the Archive by Title

**What goes wrong:** Vector dedup catches semantic duplicates, but Claude might generate a word with exactly the same `title` as an existing word (e.g., "ROI" is already seeded). String-level slug dedup prevents the DB insert, but the API call to Claude and VoyageAI still ran wasted.
**Why it happens:** Claude doesn't know what words are already in the database.
**How to avoid:** Pass Claude a list of existing word titles (or slugs) in the prompt: "Do not choose any of the following already-covered terms: [comma-separated list]." Fetch the titles first from Supabase.

---

## Code Examples

### Full Pipeline Flow (Pseudocode)

```typescript
// Source: pattern derived from existing seed script + Phase 4 cron routes
export async function GET(req: NextRequest) {
  // 1. Authenticate
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Idempotency: skip if today's word already exists
  const today = new Date().toISOString().split('T')[0]
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: existing } = await supabase.from('words').select('id').eq('daily_date', today).maybeSingle()
  if (existing) return NextResponse.json({ skipped: true })

  // 3. Fetch existing word titles to prevent title-level duplicates
  const { data: existingWords } = await supabase.from('words').select('title')
  const existingTitles = (existingWords ?? []).map((w) => w.title)

  // 4. Fetch HN trending signals (last 24h)
  const since = Math.floor((Date.now() - 86_400_000) / 1000)
  const hnRes = await fetch(`https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${since},points>10&hitsPerPage=10`)
  const { hits } = await hnRes.json()
  const headlines = hits.length > 0
    ? hits.map((h: { title: string }) => h.title).join('\n')
    : 'No trending stories available — use recent business/tech trends.'

  // 5. Generate word content via Claude (structured output)
  const anthropic = new Anthropic()
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(headlines, existingTitles) }],
    output_config: { format: { type: 'json_schema', schema: WORD_CONTENT_SCHEMA } }
  })
  const wordContent = JSON.parse((response.content[0] as { text: string }).text)

  // 6. Generate embedding
  const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! })
  const embedText = `${wordContent.title}: ${wordContent.definition} ${wordContent.exec_summary}`
  const embedResult = await voyage.embed({ input: [embedText], model: 'voyage-3.5', inputType: 'document' })
  const embedding = embedResult.data![0].embedding as number[]

  // 7. Semantic dedup check
  const { data: duplicates } = await supabase.rpc('match_similar_words', {
    query_embedding: `[${embedding.join(',')}]`,
    similarity_threshold: 0.15
  })
  if (duplicates && duplicates.length > 0) {
    return NextResponse.json({ skipped: true, reason: `duplicate: ${duplicates[0].title}` })
  }

  // 8. Insert word
  const slug = slugify(wordContent.title, { lower: true, strict: true })
  const { error } = await supabase.from('words').insert({
    ...wordContent,
    slug,
    daily_date: today,
    embedding: `[${embedding.join(',')}]`
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: true, title: wordContent.title, date: today })
}
```

### vercel.json Cron Addition

```json
{
  "framework": "nextjs",
  "crons": [
    { "path": "/api/cron/push-dispatch",   "schedule": "0 * * * *"   },
    { "path": "/api/cron/email-digest",    "schedule": "0 8 * * *"   },
    { "path": "/api/cron/generate-word",   "schedule": "0 2 * * *"   }
  ]
}
```

Rationale for `0 2 * * *`: generates the word at 02:00 UTC, before the 08:00 UTC email digest cron that references today's word, and before most users' local morning time zones.

### Postgres RPC Migration

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_match_similar_words.sql
create or replace function match_similar_words(
  query_embedding extensions.vector(1024),
  similarity_threshold float
)
returns table(id uuid, title text, distance float)
language sql
as $$
  select id, title, (embedding <=> query_embedding) as distance
  from public.words
  where embedding is not null
    and (embedding <=> query_embedding) < similarity_threshold
  order by distance asc
  limit 1;
$$;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `JSON.parse(claudeResponse)` with try/catch | `output_config.format` structured outputs (GA) | Nov 2025 | Eliminates JSON parse errors entirely; schema enforced at token generation level |
| `output_format` parameter (beta) | `output_config.format` (GA) | Nov 2025 | Old parameter still works during transition; new structure is recommended |
| voyage-3 (1024-dim) | voyage-3.5 (1024-dim default) | May 2025 | voyage-3.5 is the latest in the 3.x series; 1024-dim default unchanged — no schema migration needed |
| voyage-4-large (2048-dim, newer) | NOT recommended for this project | — | Would require migrating existing 1024-dim embeddings and changing schema column — unnecessary disruption |

**Deprecated/outdated:**
- `output_format` (bare parameter): Works during transition, but `output_config: { format: ... }` is the documented path going forward.
- `anthropic-beta: structured-outputs-2025-11-13` header: No longer needed; structured outputs are GA.

---

## Open Questions

1. **Cosine distance threshold tuning**
   - What we know: 0.15 is a reasonable starting point for "very similar" words with voyage-3.5 1024-dim embeddings
   - What's unclear: The exact threshold where business jargon synonyms ("ROI" vs "return on investment") fall vs. distinct terms
   - Recommendation: Start with 0.15. The planner should document the threshold as a named constant (`DEDUP_THRESHOLD = 0.15`) so it can be tuned without hunting through the code.

2. **What happens when Claude chooses a good word but it's too similar to an existing seed word?**
   - What we know: The cron returns `{ skipped: true }` and no word is inserted for that day
   - What's unclear: Whether the cron should retry with a different topic, or just accept that today has no new word
   - Recommendation: For v1, accept the skip and log it. A gap in `daily_date` sequence is preferable to inserting a near-duplicate. The seed corpus is ~100 words; collisions should be rare.

3. **Vercel Pro plan confirmation**
   - What we know: The Phase 4 hourly push-dispatch cron (`0 * * * *`) already requires Pro (Hobby allows once-per-day minimum). Phase 5 adds a third daily cron.
   - What's unclear: Whether the developer has confirmed/upgraded the Vercel plan (flagged as a blocker in STATE.md).
   - Recommendation: Phase 5 plan should include a pre-flight check: verify Vercel plan tier before deploying the new cron.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (exists, `@/` alias configured, `environment: node`) |
| Quick run command | `npx vitest run tests/pipeline/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PIPE-01 | `buildPrompt(headlines, existingTitles)` returns prompt containing headlines and existing titles | unit | `npx vitest run tests/pipeline/pipeline.test.ts` | Wave 0 |
| PIPE-01 | HN fetch returns array of story titles (or empty array fallback) | unit | `npx vitest run tests/pipeline/pipeline.test.ts` | Wave 0 |
| PIPE-02 | Cosine distance check rejects embeddings below threshold | unit | `npx vitest run tests/pipeline/pipeline.test.ts` | Wave 0 |
| PIPE-01 + PIPE-02 | Full cron route: returns `{ skipped: true }` when word for today exists (idempotency) | integration (mock Supabase) | `npx vitest run tests/pipeline/pipeline.test.ts` | Wave 0 |
| PIPE-01 | Cron route returns 401 for missing/wrong CRON_SECRET | unit | `npx vitest run tests/pipeline/pipeline.test.ts` | Wave 0 |

Note: The cron route itself integrates three external services (Claude, VoyageAI, Supabase). Full end-to-end integration tests would require live API keys and are classified as manual-only smoke tests. Unit tests should mock all three clients and test the logic branches (idempotency, dedup reject, successful insert path).

### Sampling Rate

- **Per task commit:** `npx vitest run tests/pipeline/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/pipeline/pipeline.test.ts` — covers PIPE-01 + PIPE-02 unit tests (idempotency, buildPrompt, dedup logic)
- [ ] No new framework or config changes needed — existing vitest.config.ts already covers `tests/**/*.test.ts`

---

## Sources

### Primary (HIGH confidence)

- Existing codebase (`src/app/api/cron/push-dispatch/route.ts`) — CRON_SECRET guard pattern, Supabase service role client instantiation
- Existing codebase (`supabase/seed/seed.ts`) — VoyageAI embed call, pgvector string format `[${embedding.join(',')}]`, embed text format `title: definition exec_summary`, Anthropic message creation pattern
- Existing codebase (`supabase/migrations/20260313000000_initial_schema.sql`) — `extensions.vector(1024)` column, HNSW index `vector_cosine_ops`, service role write pattern
- `vercel.json` in project root — existing cron array format confirmed
- Official Vercel docs (https://vercel.com/docs/cron-jobs/usage-and-pricing) — Hobby: once/day max; Pro: once/minute; 100 crons/project; timezone always UTC
- Official Anthropic docs (https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — `output_config.format` GA, supported on claude-opus-4-5, claude-sonnet-4-6, claude-opus-4-6, etc.
- Official Supabase docs (https://supabase.com/docs/guides/ai/semantic-search) — `<=>` is cosine distance; RPC function pattern with `< threshold` WHERE clause
- VoyageAI docs (https://docs.voyageai.com/docs/embeddings) — voyage-3.5 is latest 3.x series; 1024-dim is default; `inputType: 'document'`; `voyageai` npm package

### Secondary (MEDIUM confidence)

- HN Algolia API URL format (`https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>TIMESTAMP,points>N`) — confirmed via cotera.co guide and Algolia GitHub; no auth required
- Vercel CRON_SECRET header: `Authorization: Bearer $CRON_SECRET` — confirmed via Vercel docs and codingcat.dev

### Tertiary (LOW confidence)

- Cosine distance threshold of 0.15 for voyage-3.5 business jargon — derived from general pgvector documentation guidance; not empirically validated for this specific corpus and model combination

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all libraries already in package.json; patterns established by seed script and Phase 4 crons
- Architecture: HIGH — route structure is identical to existing cron routes; RPC function pattern verified in official Supabase docs
- Pitfalls: HIGH (cosine distance direction, pgvector string format, idempotency) / MEDIUM (threshold tuning)
- HN Algolia API: MEDIUM — URL format verified via documentation; free/no-auth confirmed; response shape assumed standard Algolia hits format

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable APIs; Anthropic structured outputs GA; VoyageAI voyage-3.5 active)
