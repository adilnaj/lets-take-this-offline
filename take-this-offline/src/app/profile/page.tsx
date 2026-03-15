import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { NotificationSettings } from '@/components/notification-settings'
import { Flame } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  // Fetch stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('total_points, streak_count')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch favorites (join words)
  const { data: favorites } = await supabase
    .from('user_favorites')
    .select('word_id, words(id, title, slug, daily_date, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch mastery history (last 30)
  const { data: mastery } = await supabase
    .from('word_mastery')
    .select('mastery_level, activity_count, updated_at, words(id, title, slug, category)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30)

  // Fetch push subscription state
  const { data: pushSub } = await supabase
    .from('push_subscriptions')
    .select('notify_hour, endpoint')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch email digest pref
  const { data: emailPref } = await supabase
    .from('email_digest_prefs')
    .select('enabled')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <main>
      <SiteHeader user={user} />
      <div className="container max-w-2xl mx-auto py-12 px-4 space-y-10">

        {/* Header */}
        <section>
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </section>

        {/* Stats */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Stats</h2>
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold">{stats?.total_points ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-3xl font-bold text-orange-500">
                <Flame className="h-6 w-6" />
                {stats?.streak_count ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </section>

        {/* Favorites */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Favorites</h2>
          {!favorites || favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No favorites yet. Save a word from any word page.</p>
          ) : (
            <ul className="space-y-2">
              {favorites.map(fav => {
                const w = fav.words as unknown as { title: string; slug: string; daily_date: string; category: string } | null
                if (!w) return null
                return (
                  <li key={fav.word_id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <Link href={`/word/${w.slug}`} className="font-medium hover:underline">{w.title}</Link>
                    <span className="text-xs text-muted-foreground">{w.daily_date}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Activity History */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Activity History</h2>
          {!mastery || mastery.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete activities to build your history.</p>
          ) : (
            <ul className="space-y-2">
              {mastery.map((row, idx) => {
                const w = row.words as unknown as { title: string; slug: string; category: string } | null
                if (!w) return null
                const masteryVariant =
                  row.mastery_level === 'mastered' ? 'default' :
                  row.mastery_level === 'learning' ? 'secondary' : 'outline'
                return (
                  <li key={`${w.slug}-mastery-${idx}`} className="flex items-center justify-between py-2 border-b last:border-0">
                    <Link href={`/word/${w.slug}`} className="font-medium hover:underline">{w.title}</Link>
                    <Badge variant={masteryVariant} className={
                      row.mastery_level === 'mastered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      row.mastery_level === 'learning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      ''
                    }>
                      {row.mastery_level}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Notifications */}
        <NotificationSettings
          initialPushEnabled={!!pushSub}
          initialPushHour={pushSub?.notify_hour ?? 8}
          initialEmailEnabled={emailPref?.enabled ?? false}
          userEmail={user.email ?? ''}
        />

      </div>
    </main>
  )
}
