import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { HeardInTheWild } from '@/components/heard-in-wild'
import type { WordRow } from '@/lib/words'

interface WordCardProps {
  word: WordRow
}

function formatDate(dateStr: string): string {
  // dateStr is 'YYYY-MM-DD' — parse as UTC to avoid timezone shifts
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function WordCard({ word }: WordCardProps) {
  const examples = word.usage_examples as string[]

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Category badge */}
        <div>
          <Badge variant="secondary">{word.category}</Badge>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{word.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(word.daily_date)}</p>
        </div>

        {/* Definition */}
        <p className="text-foreground/80 leading-relaxed">{word.definition}</p>

        {/* Executive Summary */}
        <section className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Executive Summary
          </h2>
          <p className="leading-relaxed">{word.exec_summary}</p>
        </section>

        {/* Where It's Used */}
        <section className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Where It's Used
          </h2>
          <p className="leading-relaxed">{word.where_used}</p>
        </section>

        {/* Usage Examples */}
        <section className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Usage Examples
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {examples.map((ex) => (
              <li key={ex} className="leading-relaxed">
                {ex}
              </li>
            ))}
          </ul>
        </section>

        {/* Heard in the Wild */}
        <HeardInTheWild
          citation={word.heard_in_wild}
          sourceUrl={word.heard_source_url}
        />
      </CardContent>
    </Card>
  )
}
