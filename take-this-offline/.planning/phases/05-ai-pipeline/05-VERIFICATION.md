---
phase: 05-ai-pipeline
verified: 2026-03-15T00:07:30Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 5: AI Pipeline Verification Report

**Phase Goal:** The app generates a new, non-duplicate word every day automatically with no manual intervention
**Verified:** 2026-03-15T00:07:30Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | `buildPrompt` returns a string containing provided headlines and the list of excluded titles | VERIFIED | `pipeline.ts:31-50` — headlinesSection embeds headlines; exclusionSection lists titles. 3 passing unit tests confirm. |
| 2  | `fetchHNSignals` returns an array of story title strings (possibly empty, never throws) | VERIFIED | `pipeline.ts:57-67` — catch block returns `[]` on any error. 3 passing unit tests confirm. |
| 3  | `checkDuplicate` returns true when cosine distance RPC returns a matching row below threshold | VERIFIED | `pipeline.ts:74-84` — `Array.isArray(data) && data.length > 0`. Unit test confirms true case. |
| 4  | `checkDuplicate` returns false when RPC returns empty results or an error | VERIFIED | `pipeline.ts:82-83` — `if (error || !data) return false`. 2 unit tests confirm false/error cases. |
| 5  | `match_similar_words` SQL function exists and uses cosine distance with threshold | VERIFIED | `supabase/migrations/20260315000000_add_match_similar_words.sql` — `(embedding <=> query_embedding) < similarity_threshold`, 1024-dim vector param. |
| 6  | GET /api/cron/generate-word returns 401 when Authorization header is missing or wrong | VERIFIED | `route.ts:17-19` — `if (authHeader !== 'Bearer ${process.env.CRON_SECRET}')` returns 401. |
| 7  | Calling the route when today's word already exists returns `{ skipped: true }` without calling Claude or VoyageAI | VERIFIED | `route.ts:28-36` — idempotency check on `daily_date` at step 2, before any AI SDK calls (Claude at step 6, Voyage at step 7). |
| 8  | A successful run inserts exactly one word row with the correct `daily_date` | VERIFIED | `route.ts:90-99` — inserts with `daily_date: today` using service-role client. Returns `{ inserted: true, title, date }`. |
| 9  | A duplicate-embedding word is skipped with `{ skipped: true, reason: '...' }` | VERIFIED | `route.ts:81-87` — `checkDuplicate` result gates insert; returns `{ skipped: true, reason: 'too similar to an existing word...' }`. |
| 10 | `vercel.json` crons array includes generate-word at schedule `0 2 * * *` | VERIFIED | `vercel.json:6` — `{ "path": "/api/cron/generate-word", "schedule": "0 2 * * *" }`. 3 total cron entries. |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/pipeline.ts` | Three exported helpers + 2 constants | VERIFIED | Exports: `buildPrompt`, `fetchHNSignals`, `checkDuplicate`, `DEDUP_THRESHOLD` (0.15), `WORD_CONTENT_SCHEMA`. 85 lines, substantive. |
| `tests/pipeline/pipeline.test.ts` | 9 unit tests covering all helpers | VERIFIED | 9 real assertions in 3 describe blocks. `npx vitest run tests/pipeline/` exits 0 — 9/9 passing. |
| `supabase/migrations/20260315000000_add_match_similar_words.sql` | Postgres RPC using cosine distance | VERIFIED | Contains `match_similar_words`, `<=>` operator, `< similarity_threshold` WHERE clause, 1024-dim `extensions.vector`. |
| `src/app/api/cron/generate-word/route.ts` | Full daily word generation cron handler | VERIFIED | 104 lines. Exports `GET` and `dynamic = 'force-dynamic'`. Full 10-step pipeline implemented. |
| `vercel.json` | Updated cron schedule including generate-word | VERIFIED | 3 cron entries. `generate-word` at `0 2 * * *`. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/pipeline.ts checkDuplicate` | `supabase match_similar_words RPC` | `supabase.rpc('match_similar_words', {...})` | WIRED | `pipeline.ts:78` — exact call with `query_embedding` and `similarity_threshold` params. |
| `src/app/api/cron/generate-word/route.ts` | `src/lib/pipeline.ts` | named imports | WIRED | `route.ts:6-11` imports `buildPrompt`, `fetchHNSignals`, `checkDuplicate`, `WORD_CONTENT_SCHEMA`. All four are used within the function body. |
| `src/app/api/cron/generate-word/route.ts` | Anthropic structured outputs | `output_config.format` | WIRED | `route.ts:55-60` — `output_config: { format: { type: 'json_schema', schema: WORD_CONTENT_SCHEMA } }`. |
| `src/app/api/cron/generate-word/route.ts` | `voyage.embed` | `VoyageAIClient` | WIRED | `route.ts:71-78` — `voyage.embed({ input: [embedText], model: 'voyage-3.5', inputType: 'document' })`. Result used to derive `embedding`. |
| `vercel.json crons` | `/api/cron/generate-word` | Vercel Cron scheduler | WIRED | `vercel.json:6` — path and schedule entry present. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PIPE-01 | 05-01, 05-02 | System generates a new word daily from trending news/HN signals via Claude | SATISFIED | `fetchHNSignals` fetches HN headlines; `buildPrompt` incorporates them; Anthropic SDK with `output_config` structured outputs generates word content; vercel.json schedule `0 2 * * *` automates daily execution. |
| PIPE-02 | 05-01, 05-02 | System deduplicates new words against existing words using vector embeddings (pgvector, cosine similarity) | SATISFIED | `checkDuplicate` calls `match_similar_words` RPC using `<=>` cosine distance operator with 0.15 threshold; duplicate words are skipped before insert; VoyageAI embeds with same format as seed script ensuring comparable vectors. |

No orphaned requirements found — REQUIREMENTS.md lines 123-124 confirm both PIPE-01 and PIPE-02 are mapped to Phase 5.

---

### Anti-Patterns Found

None detected.

- No TODO/FIXME/PLACEHOLDER comments in phase 05 files
- No stub return patterns (`return null`, `return {}`, empty handlers)
- The one `return []` in `pipeline.ts:65` is inside a `catch` block in `fetchHNSignals` — the documented safe error-path fallback, not a stub
- No console.log-only implementations

---

### Human Verification Required

#### 1. End-to-end cron execution

**Test:** Trigger the route manually with a valid `Authorization: Bearer <CRON_SECRET>` header against the deployed app (or local dev server with env vars set).
**Expected:** Returns `{ inserted: true, title: "<word>", date: "<today>" }` and a new row appears in the `words` table with a non-null `embedding` column.
**Why human:** Requires live Anthropic API key, VoyageAI API key, and Supabase connection with the `match_similar_words` migration applied. Cannot verify end-to-end AI calls programmatically.

#### 2. SQL migration applied to production

**Test:** Connect to the production Supabase instance and run `SELECT proname FROM pg_proc WHERE proname = 'match_similar_words';`.
**Expected:** Returns one row — the function exists in the database.
**Why human:** The SUMMARY confirms the Supabase CLI was not linked locally during execution. The migration file is ready but must be confirmed applied (`supabase db push` or CI deployment). Cannot verify remote database state programmatically.

#### 3. Deduplication behavior in production

**Test:** Trigger the cron twice in rapid succession on the same day.
**Expected:** Second call returns `{ skipped: true, reason: 'word already exists for today' }` without calling Claude or VoyageAI (idempotency guard).
**Why human:** Requires live environment to confirm the `daily_date` idempotency check fires correctly against the real database.

---

### Commit Verification

All four phase 05 commits confirmed present in git history:

| Hash | Type | Description |
|------|------|-------------|
| `c049a2d` | test | Add failing tests and SQL migration for pipeline helpers (RED phase) |
| `baf52a5` | feat | Implement pipeline helper library — all 9 tests GREEN |
| `6fcd02a` | feat | Create generate-word cron route |
| `e90daed` | feat | Add generate-word cron schedule to vercel.json |

---

### Gaps Summary

No gaps. All automated checks passed:

- All 10 observable truths verified
- All 5 required artifacts exist, are substantive, and are wired
- All 5 key links confirmed connected
- Both requirement IDs (PIPE-01, PIPE-02) fully satisfied
- 9/9 unit tests pass (`npx vitest run tests/pipeline/` exits 0)
- No anti-patterns detected in phase 05 files
- 4 pre-existing failing stubs in `tests/seed/` are documented in both SUMMARY files as out-of-scope placeholders from Plan 01 (PIPE-03 scope) — not regressions from this phase

The phase goal is achieved: the codebase contains a fully automated daily word generation pipeline that fires at 02:00 UTC, calls Claude with HN-sourced context, embeds via VoyageAI, performs pgvector cosine-distance deduplication, and inserts idempotently. No manual intervention is required at runtime.

---

_Verified: 2026-03-15T00:07:30Z_
_Verifier: Claude (gsd-verifier)_
