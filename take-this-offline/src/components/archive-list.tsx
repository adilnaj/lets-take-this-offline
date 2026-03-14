import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { WordRow } from '@/lib/words'

export function ArchiveList({ words }: { words: WordRow[] }) {
  if (words.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        No words found.
      </div>
    )
  }

  return (
    <ul className="divide-y border rounded-md">
      {words.map((word) => {
        const formattedDate = new Date(word.daily_date + 'T00:00:00').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        return (
          <li key={word.id}>
            <Link
              href={`/word/${word.slug}`}
              className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="font-bold">{word.title}</span>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{word.category}</Badge>
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
