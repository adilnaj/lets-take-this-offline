import { getArchive, searchArchive, WORD_CATEGORIES } from '@/lib/words'
import type { WordCategory } from '@/lib/words'
import { SiteHeader } from '@/components/site-header'
import { ArchiveList } from '@/components/archive-list'
import { ArchiveFilters } from '@/components/archive-filters'
import { ArchivePagination } from '@/components/archive-pagination'

const PAGE_SIZE = 20

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; from?: string; to?: string; page?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const keyword = searchParams.q ?? ''
  const category = searchParams.category as WordCategory | undefined
  const dateFrom = searchParams.from ?? ''
  const dateTo = searchParams.to ?? ''

  const hasFilters = keyword || category || dateFrom || dateTo

  const { words, total } = hasFilters
    ? await searchArchive({ keyword, category, dateFrom, dateTo, page, pageSize: PAGE_SIZE })
    : await getArchive(page, PAGE_SIZE)

  return (
    <main>
      <SiteHeader />
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Word Archive</h1>
        <ArchiveFilters
          categories={WORD_CATEGORIES}
          currentKeyword={keyword}
          currentCategory={category ?? ''}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
        />
        <ArchiveList words={words} />
        <ArchivePagination page={page} total={total} pageSize={PAGE_SIZE} />
      </div>
    </main>
  )
}
