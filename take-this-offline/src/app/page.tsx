import { createClient } from '@/lib/supabase/server'
import { getTodaysWord } from '@/lib/words'
import { getCompletionsToday, getUserStats, getDisstractors } from '@/lib/activities'
import { WordCard } from '@/components/word-card'
import { SiteHeader } from '@/components/site-header'
import { PracticeSection } from '@/components/practice-section'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const word = await getTodaysWord()
  if (!word) return { title: "Let's Take This Offline" }
  return {
    title: `${word.title} | Let's Take This Offline`,
    description: word.exec_summary,
    openGraph: {
      title: word.title,
      description: word.exec_summary,
      images: [`/api/og/${word.slug}`],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const word = await getTodaysWord()

  if (!word) {
    return (
      <main>
        <SiteHeader />
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <p className="text-muted-foreground">No word scheduled for today. Check back tomorrow.</p>
        </div>
      </main>
    )
  }

  const completions = user ? await getCompletionsToday(user.id, word.id) : []
  const stats = user ? await getUserStats(user.id) : null
  const distractors = await getDisstractors(word, supabase)

  return (
    <main>
      <SiteHeader />
      <div className="container max-w-2xl mx-auto py-12 px-4 space-y-8">
        <WordCard word={word} />
        <PracticeSection
          word={word}
          user={user}
          initialCompletions={completions}
          initialStats={stats}
          distractors={distractors}
        />
      </div>
    </main>
  )
}
