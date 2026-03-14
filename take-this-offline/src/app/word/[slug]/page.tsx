import { getWordBySlug } from '@/lib/words'
import { WordCard } from '@/components/word-card'
import { SiteHeader } from '@/components/site-header'
import { FavoriteButton } from '@/components/favorite-button'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const word = await getWordBySlug(slug)
  if (!word) return { title: "Not Found | Let's Take This Offline" }
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

export default async function WordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const word = await getWordBySlug(slug)
  if (!word) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialFavorited = false
  if (user) {
    const { data: fav } = await supabase
      .from('user_favorites')
      .select('word_id')
      .eq('user_id', user.id)
      .eq('word_id', word.id)
      .maybeSingle()
    initialFavorited = !!fav
  }

  return (
    <main>
      <SiteHeader user={user} />
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1" />
          {user && (
            <FavoriteButton wordId={word.id} initialFavorited={initialFavorited} />
          )}
        </div>
        <WordCard word={word} />
      </div>
    </main>
  )
}
