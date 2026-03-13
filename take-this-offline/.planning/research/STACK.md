# Technology Stack

**Project:** Let's Take This Offline — Daily Vocabulary PWA
**Researched:** 2026-03-12
**Overall confidence:** HIGH (primary sources: official Next.js docs updated 2026-02-27, Tailwind v4 release blog, Vercel OG docs, Vercel Cron docs; supplemented by training knowledge for packages not reachable via fetch)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.2 (latest stable) | Full-stack React framework | App Router gives RSC, streaming, Server Actions, and built-in manifest/OG support. PRD-mandated. Turbopack is now stable in this release. |
| React | 19 (bundled with Next.js 15) | UI layer | Required by Next.js 15. `useActionState` replaces the old `useFormState`. |
| TypeScript | 5.x | Type safety | Required for maintainability at this complexity level. Next.js ships TS config out of the box. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.0 (stable, released Jan 22 2025) | Utility-first CSS | v4 is production-ready with 3.78x faster full builds, 182x faster incremental rebuilds. PRD-mandated. |

**Tailwind v4 breaking changes from v3:**
- No `tailwind.config.js` — all design tokens go in a `@theme` block in CSS
- Single `@import "tailwindcss"` replaces old `@tailwind base/components/utilities` directives
- Dark mode via `@media (prefers-color-scheme: dark)` or `data-theme` attribute — not `darkMode: 'class'` config

**Do NOT use:** Tailwind v3. v4 is current stable and is what `create-next-app` installs by default.

### Database and Auth

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase | Managed service | PostgreSQL database + auth platform | PRD-mandated. Email/password, Google OAuth, Apple OAuth out of the box with RLS at the DB layer. |
| `@supabase/supabase-js` | ^2.x | Supabase JS client | Core SDK for DB queries, auth state, realtime. |
| `@supabase/ssr` | ^0.5.x | Cookie-based auth for Next.js SSR | Required for App Router. Handles cookies across Server Components, Route Handlers, and Middleware. Replaces deprecated `@supabase/auth-helpers-nextjs`. |
| pgvector | Built into Supabase | Vector similarity search for deduplication | Enable via `CREATE EXTENSION vector`. Stores word embeddings as `vector(1024)`. HNSW index for sub-millisecond lookup. |

**Do NOT use:** `@supabase/auth-helpers-nextjs` — officially deprecated.

**pgvector deduplication pattern:**
```sql
SELECT word, 1 - (embedding <=> $new_embedding) AS similarity
FROM words
ORDER BY embedding <=> $new_embedding
LIMIT 1;
-- Reject if similarity > 0.92
-- Index: CREATE INDEX ON words USING hnsw (embedding vector_cosine_ops)
```

### AI and Content Pipeline

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@anthropic-ai/sdk` | ^0.36.x | Claude API client | PRD specifies `claude-sonnet-4-6` for word generation and real-time sentence feedback. |
| Model: `claude-sonnet-4-6` | N/A | Word generation + sentence feedback | Sonnet balances quality and latency; <5s real-time feedback target achievable. |

**Embedding model for deduplication:** Use Voyage AI `voyage-3-lite` (1024 dimensions) or Anthropic's embeddings endpoint. Pick one and don't mix dimensions.

**Pipeline:** Vercel Cron (nightly) → fetch trending signals → prompt Claude → generate embedding → deduplicate via pgvector → insert with `status: 'pending'` → auto-promote to `status: 'published'`. Never blocks a page load.

### PWA — Service Worker

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Manual `public/sw.js` | Native browser API | Offline caching + push notification handling | Official Next.js recommendation as of Feb 2026 docs. Hand-authored ~60 lines of vanilla JS handles Let's Take This Offline's narrow offline scope cleanly. |
| `app/manifest.ts` | Next.js built-in | Web app manifest | Native App Router file convention. No library needed. |

**Caching strategy:**
- `_next/static/*` — Cache-first, long TTL
- `/` and `/word/*` — Network-first with cache fallback
- `/api/*` — Network-only

**Do NOT use:** `next-pwa` (no commits since 2022, no App Router support), `@ducanh2912/next-pwa` (deprecated, transferred to Serwist), Serwist (Turbopack-incompatible for v1).

**iOS gotcha:** Web Push only works on iOS for installed PWAs (iOS 16.4+). Gate the notification permission prompt behind `window.navigator.standalone` check. Email digest is the primary iOS notification channel.

### Push Notifications

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `web-push` | ^3.6.x | Server-side VAPID push delivery | Used in Next.js official PWA docs. Handles VAPID auth, payload encryption, delivery to all browser push endpoints. |

**VAPID setup:** `npx web-push generate-vapid-keys` → store in `.env` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client-safe) and `VAPID_PRIVATE_KEY` (server-only).

**Subscription storage:** Store `PushSubscription` JSON blob in `push_subscriptions` Supabase table with a `notification_time_utc` column (user's preferred local time pre-converted to UTC at subscription time).

**Do NOT use:** Firebase Cloud Messaging — adds Google vendor dependency for a feature Web Push + VAPID handles natively.

### Email

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `resend` | ^3.x | Transactional email API | PRD-mandated. Best DX in the Next.js ecosystem, generous free tier (3,000 emails/month), native React Email integration. |
| `@react-email/components` | ^0.0.x | Email template components | Build HTML emails as React components with live browser preview. Pairs natively with Resend. |

### OG Images

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next/og` (built-in) | Bundled with Next.js App Router | Dynamic per-word social card images | No separate install. `import { ImageResponse } from 'next/og'` renders JSX to 1200×630 PNG, cached at Vercel CDN edge. |

**CSS constraints:** Only flexbox (`display: flex`) and absolute positioning work in OG templates. No CSS Grid. Bundle limit 500KB including fonts. Set `Cache-Control: public, max-age=86400, s-maxage=2592000`.

**Do NOT install:** `@vercel/og` separately — identical to `next/og`, already bundled.

### Animations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `motion` | ^11.x | Flashcard flip, activity transitions, streak animations | Framer Motion rebranded as `motion` package (late 2024). Same API, cleaner tree-shaking. Import from `motion/react`. |

**Import pattern:** `import { motion, AnimatePresence } from 'motion/react'`

**Do NOT use:** `framer-motion` as primary package going forward. The canonical package is now `motion`.

**Recommended uses:** Flashcard flip (`rotateY` + `AnimatePresence`), fill-in-blank wrong answer (shake keyframes), streak counter number increment, badge award entrance. Avoid page transition animations — they slow perceived navigation in a content-first app.

### Drag-and-Drop (Context Match activity)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@dnd-kit/core` | ^6.x | Drag-and-drop primitives | Pointer-events based (not HTML5 drag API) — works correctly on mobile touch and desktop. Full keyboard accessibility out of the box. |
| `@dnd-kit/sortable` | ^8.x | Sortable list preset | For Context Match item reordering/matching. |
| `@dnd-kit/utilities` | ^3.x | CSS transform helpers | `CSS.Transform.toString()` for applying drag transforms. |

**Do NOT use:** `react-beautiful-dnd` (abandoned, no React 18+ support), `react-dnd` (worse mobile touch, heavier bundle).

### Scheduling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel Cron Jobs | Platform feature | Daily word generation, push dispatch, email digest | Zero-infrastructure. Triggers HTTP GET to Route Handler on schedule. |

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/generate-word", "schedule": "0 2 * * *" },
    { "path": "/api/cron/push-dispatch", "schedule": "* * * * *" },
    { "path": "/api/cron/email-digest",  "schedule": "0 6 * * *" }
  ]
}
```

**Vercel tier note:** Minute-level cron frequency requires Vercel Pro. On Free tier, simplify to a fixed UTC time for v1 push notifications; add timezone-aware dispatch in v2 on Pro.

### Validation & State

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | ^3.x | Server-side schema validation | Used in Next.js official auth documentation. Works with `useActionState` for auth forms, sentence submissions, and notification preferences. |

**State management:** React `useState`/`useReducer` + Context is sufficient for all v1 features. No Zustand, Jotai, Redux, or React Query needed — App Router RSC + Server Actions handle server state.

### Development Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Turbopack | Bundled with Next.js 15 | Dev server bundler | Stable since Next.js 15. 57.6% faster compile, 30% lower memory vs webpack. Enable with `next dev --turbopack`. |
| ESLint | 9.x | Linting | Ships with `create-next-app`. `next/core-web-vitals` ruleset catches performance anti-patterns. |
| Prettier | ^3.x | Code formatting | Add `prettier-plugin-tailwindcss` for automatic class sorting. |

---

## Installation

```bash
# Initialize project
npx create-next-app@latest lets-take-this-offline --typescript --tailwind --app --turbopack

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Anthropic AI
npm install @anthropic-ai/sdk

# Push notifications
npm install web-push
npm install -D @types/web-push

# Email
npm install resend @react-email/components

# Animations
npm install motion

# Drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Validation
npm install zod

# Dev tooling
npm install -D prettier prettier-plugin-tailwindcss
```

**No separate installs needed for:** OG images (`next/og` bundled), web manifest (`app/manifest.ts`), Vercel Cron (`vercel.json`), Turbopack (bundled).

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-only; cron jobs bypass RLS

ANTHROPIC_API_KEY=

NEXT_PUBLIC_VAPID_PUBLIC_KEY=       # Safe to expose to client
VAPID_PRIVATE_KEY=                  # Server-only

RESEND_API_KEY=
CRON_SECRET=                        # Shared secret to authenticate cron route calls
NEWS_API_KEY=                       # Optional: trending signal source
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Next.js 15.2 as current stable | HIGH | Official blog post verified |
| Next.js PWA approach (manual SW + `web-push`) | HIGH | Official PWA guide fetched; updated 2026-02-27 |
| Tailwind CSS v4.0 stability | HIGH | Official Tailwind blog fetched; released Jan 22 2025 |
| `next/og` bundled in App Router | HIGH | Official Vercel OG docs verified |
| Vercel Cron Jobs (UTC-only, `vercel.json`) | HIGH | Official Vercel Cron docs verified |
| `next-pwa` abandonment | HIGH | Not referenced in current Next.js docs |
| `@supabase/ssr` package name | MEDIUM | Verify against current changelog |
| `@anthropic-ai/sdk` version | MEDIUM | Verify with `npm info @anthropic-ai/sdk version` |
| `motion` package rename | MEDIUM | Training knowledge; occurred Oct 2024 |
| Minute-level cron on Vercel Pro only | MEDIUM | Verify against current Vercel pricing |

---

## Sources

- Next.js PWA Guide (official, 2026-02-27): https://nextjs.org/docs/app/guides/progressive-web-apps
- Next.js 15.2 Blog Post: https://nextjs.org/blog/next-15-2
- Vercel OG Image Generation (official): https://vercel.com/docs/og-image-generation
- Vercel Cron Jobs (official): https://vercel.com/docs/cron-jobs
- Tailwind CSS v4.0 Release: https://tailwindcss.com/blog/tailwindcss-v4
