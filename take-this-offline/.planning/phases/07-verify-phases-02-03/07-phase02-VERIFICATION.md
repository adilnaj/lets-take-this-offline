# Phase 02 Verification: Daily Word Experience

**Verified:** 2026-03-15
**Method:** Code inspection (no app execution)
**Phase Goal:** Users can read today's word with full editorial content, browse and search the archive, and share word pages with rich social previews
**Overall Status:** VERIFIED

---

## Requirements

### CONT-01: Today's word page with header, executive summary, where/how used, usage examples
**Status:** PASS
**Evidence:**
- `src/app/page.tsx:28` — calls `getTodaysWord()` and passes result as `word` prop to `<WordCard word={word} />`
- `src/components/word-card.tsx:35` — renders `word.title` in `<h1>` (header)
- `src/components/word-card.tsx:47` — renders `word.exec_summary` under "Executive Summary" `<section>`
- `src/components/word-card.tsx:55` — renders `word.where_used` under "Where It's Used" `<section>`
- `src/components/word-card.tsx:63-69` — renders `word.usage_examples` (cast as `string[]`) as `<ul>` list under "Usage Examples" `<section>`

---

### CONT-02: "Heard in the Wild" section with paraphrased citation and source link
**Status:** PASS
**Evidence:**
- `src/components/heard-in-wild.tsx:23-25` — renders `citation` as `<blockquote className="italic">` when non-null
- `src/components/heard-in-wild.tsx:27-35` — renders `sourceUrl` as `<a href={sourceUrl} target="_blank">` with domain label when non-null
- `src/components/word-card.tsx:3` — imports `HeardInTheWild`
- `src/components/word-card.tsx:73-76` — renders `<HeardInTheWild citation={word.heard_in_wild} sourceUrl={word.heard_source_url} />` inside the WordCard

---

### CONT-03: Browse the word archive (paginated list of all past words)
**Status:** PASS
**Evidence:**
- `src/app/archive/page.tsx:29` — calls `getArchive(page, PAGE_SIZE)` when no filters are active; `getArchive` queries `words` filtered by `daily_date <= today`, ordered newest-first, with range pagination
- `src/lib/words.ts:45-68` — `getArchive` returns `{ words, total }` using Supabase count:exact + range
- `src/app/archive/page.tsx:43` — renders `<ArchiveList words={words} />`; `archive-list.tsx` maps each word to a `<Link href="/word/{word.slug}">` row
- `src/app/archive/page.tsx:44` — renders `<ArchivePagination page={page} total={total} pageSize={PAGE_SIZE} />`; pagination shows Previous/Next buttons when `totalPages > 1`

---

### CONT-04: Search the archive by keyword
**Status:** PASS
**Evidence:**
- `src/app/archive/page.tsx:17` — reads `searchParams.q ?? ''` as `keyword`
- `src/app/archive/page.tsx:25-28` — `hasFilters` branch calls `searchArchive({ keyword, ... })` when keyword is non-empty
- `src/lib/words.ts:93-96` — `searchArchive` applies `.or('title.ilike.%keyword%,definition.ilike.%keyword%,exec_summary.ilike.%keyword%')` on the Supabase query
- `src/components/archive-filters.tsx:28-35` — renders `<Input placeholder="Search words..." />` with debounced `onChange` that sets the `q` URL param

---

### CONT-05: Filter the archive by category and date
**Status:** PASS
**Evidence:**
- `src/app/archive/page.tsx:18-20` — reads `searchParams.category`, `searchParams.from`, and `searchParams.to`
- `src/app/archive/page.tsx:25-28` — all three are included in `hasFilters` check and passed to `searchArchive({ category, dateFrom, dateTo, ... })`
- `src/lib/words.ts:98-109` — `searchArchive` applies `.eq('category', category)`, `.gte('daily_date', dateFrom)`, `.lte('daily_date', dateTo)` conditionally
- `src/components/archive-filters.tsx:36-47` — renders category `<Badge>` chips (clicking toggles the `category` URL param)
- `src/components/archive-filters.tsx:48-53` — renders two `<Input type="date">` controls for `from` and `to` date range

---

### PLAT-03: Dark mode — system preference default, manual toggle
**Status:** PASS
**Evidence:**
- `src/components/providers.tsx:7-16` — `ThemeProvider` from `next-themes` is rendered with `attribute="class"`, `defaultTheme="system"`, and `enableSystem` — system preference is the default and actively followed
- `src/components/theme-toggle.tsx:8-18` — `ThemeToggle` reads `theme` via `useTheme()` and calls `setTheme(theme === 'dark' ? 'light' : 'dark')` on click — provides light/dark manual toggle
- `src/components/site-header.tsx:4` — imports and renders `<ThemeToggle />` in the sticky header visible on all pages
- Note: `theme-switcher.tsx` also exists with a three-way Light/Dark/System dropdown (`setTheme(e)`) but is not currently imported into the site header — `ThemeToggle` is the active toggle.

---

### PLAT-04: Word pages are server-rendered with proper meta tags for SEO
**Status:** PASS
**Evidence:**
- `src/app/word/[slug]/page.tsx:12-26` — exports `generateMetadata({ params })` which awaits `params`, fetches word via `getWordBySlug(slug)`, and returns `{ title: '${word.title} | Let's Take This Offline', description: word.exec_summary, openGraph: { title, description, images }, twitter: { card } }` — fully dynamic from word data
- `src/app/page.tsx:10-23` — exports `generateMetadata()` for the home page returning `{ title: '${word.title} | Let's Take This Offline', description: word.exec_summary, openGraph, twitter }` — also dynamic
- Both pages use `export const dynamic = 'force-dynamic'` ensuring server rendering, not static prerender

---

### PLAT-05: Each word page has a dynamic OG image generated via Vercel OG
**Status:** PASS
**Evidence:**
- `src/app/api/og/[slug]/route.tsx:1` — imports `ImageResponse` from `next/og`
- `src/app/api/og/[slug]/route.tsx:5` — `export const runtime = 'edge'` is present (Phase 6 fix confirmed)
- `src/app/api/og/[slug]/route.tsx:18-60` — `GET` handler returns `new ImageResponse(...)` with branded layout (title, exec_summary, category, date) at 1200x630
- `src/app/word/[slug]/page.tsx:19-21` — `generateMetadata` includes `openGraph: { images: ['/api/og/${word.slug}'] }` wiring the OG route
- `src/app/page.tsx:17-19` — home page `generateMetadata` also includes `openGraph: { images: ['/api/og/${word.slug}'] }`

---

## Gap Summary

All Phase 02 requirements satisfied.

---

## E2E Trace: Archive → Past Word

**Archive query:**
- `src/app/archive/page.tsx:29` — calls `getArchive(page, PAGE_SIZE)` (or `searchArchive` with filters)
- `src/lib/words.ts:45-68` — queries Supabase `words` table filtered by `daily_date <= today`, returns full `WordRow` objects including `slug`

**Link generation:**
- `src/components/archive-list.tsx:24-26` — each word row renders `<Link href="/word/${word.slug}">` using Next.js Link component

**Word data fetch on /word/[slug]:**
- `src/app/word/[slug]/page.tsx:29-31` — awaits `params` Promise (Next.js 15 pattern), calls `getWordBySlug(slug)`, calls `notFound()` if null
- `src/lib/words.ts:29-38` — `getWordBySlug` queries `words` table by slug using `.maybeSingle()`

**SiteHeader user prop:**
- `src/app/archive/page.tsx:22-23` — calls `supabase.auth.getUser()` and passes `user` to `<SiteHeader user={user} />` (line 33) — Phase 6 fix confirmed present
- `src/app/word/[slug]/page.tsx:34` — calls `supabase.auth.getUser()` and passes `user` to `<SiteHeader user={user} />` (line 55) — consistent auth state in navigation

**Verdict:** Pass — full end-to-end path from archive list to past word page is wired correctly, and SiteHeader receives authenticated user on both /archive and /word/[slug].
