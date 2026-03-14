# Phase 4: Notifications and PWA - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can subscribe to daily reminders (web push + email digest) and install the app to their home screen with offline support for today's word. Auth, activities, and gamification are complete. This phase adds re-engagement mechanics and PWA platform capabilities.

</domain>

<decisions>
## Implementation Decisions

### Notification settings UX
- Notification settings live in /profile — a new "Notifications" section added below existing profile content
- Push: on/off toggle + hour-only time picker (e.g., 8 AM, 9 AM)
- Email: on/off toggle (no separate time picker — email fires at a consistent morning time)
- Browser push permission prompt fires immediately when the user clicks the push toggle (not on save)
- If push permission is denied: toggle resets to off, show inline message: "Push blocked in browser settings. You can still use email notifications." — no modal

### Push opt-in trigger
- Push opt-in only happens on /profile — no auto-prompts, banners, or post-activity nudges
- No proactive prompting outside of settings — respects user intent, avoids browser permission fatigue
- Push notification content: title = today's word, body = first few words of the definition, tap opens the word page

### Email digest content
- Daily email includes: word, definition, executive summary, and a "See examples →" CTA linking to the word page
- Visual style: clean branded HTML (dark/light agnostic, app name in header, unsubscribe link in footer)
- From: "Let's Take This Offline" — Subject: "Today's word: [Word]"
- Sent via Resend

### PWA install experience
- Custom install button shown in SiteHeader (and/or /profile) when `beforeinstallprompt` fires
- Button disappears after install — no auto-popups or repeated prompts
- Manifest: `display: standalone`, app name: "Let's Take This Offline", short_name: "Let's Take This Offline"
- Offline experience: service worker caches today's word page on first visit — full word content available offline, activities disabled (require API)
- No dedicated offline-only UI needed — the cached page renders naturally

### Claude's Discretion
- Service worker caching strategy (cache-first vs. stale-while-revalidate for word pages)
- Icon set sizes and splash screen assets
- Exact push subscription storage schema (endpoint, keys) in Supabase
- Cron job implementation for push dispatch and email send (Vercel Cron)
- Resend email template HTML structure and styling details
- Time picker component choice (native `<select>` vs. shadcn component)

</decisions>

<specifics>
## Specific Ideas

- The 2-minute skimmability constraint applies to the email too — word + definition + exec summary is enough to get real value without opening the app
- Install button in header should be subtle — not a banner, just an icon or small text link that appears only when the browser makes it available
- Vercel Pro plan required for hourly cron (push dispatch); confirm tier before executing this phase (noted blocker)
- iOS push only works for installed PWAs (iOS 16.4+) — email digest is the primary iOS notification channel; push is bonus for Android/desktop

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SiteHeader` (src/components/site-header.tsx): Already renders conditionally for logged-in users — install button can be added here with a client-side `beforeinstallprompt` check
- `Providers` (src/components/providers.tsx): Client component wrapping the app — PWA install event listener can be managed here or in a dedicated hook
- `Button` (src/components/ui/button.tsx): Available for install button, toggle controls
- `/profile` page (src/app/profile/page.tsx): Already exists with streak, favorites, and activity history — add Notifications section here
- `createClient()` from `@/lib/supabase/server`: Existing server-side Supabase client pattern for reading/writing notification preferences

### Established Patterns
- layout.tsx has no web-app-manifest or viewport meta yet — these need to be added in Phase 4
- No `public/` directory exists yet — needs to be created for manifest.json, icons, and service worker
- `export const dynamic = 'force-dynamic'` required on auth-dependent pages (established in Phase 1)
- Supabase server client: `createClient()` from `@/lib/supabase/server` for server components; client variant for client components
- API routes use `NextResponse.json()` — push subscription endpoint follows this pattern

### Integration Points
- `/profile` route: Add Notifications section below existing profile content
- `src/app/layout.tsx`: Add `<link rel="manifest">` and viewport/theme-color meta tags
- New Supabase table(s): push subscriptions (endpoint, auth/p256dh keys, user_id, timezone, hour) and email digest preferences
- Vercel Cron: `/api/cron/push-dispatch` and `/api/cron/email-digest` — secured with CRON_SECRET header
- Service worker: `public/sw.js` — registered from a client component on app load

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-notifications-and-pwa*
*Context gathered: 2026-03-14*
