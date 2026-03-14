import { getWordBySlug } from '@/lib/words'
import { WordCard } from '@/components/word-card'
import { SiteHeader } from '@/components/site-header'
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
  return (
    <main>
      <SiteHeader />
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <WordCard word={word} />
      </div>
    </main>
  )
}
