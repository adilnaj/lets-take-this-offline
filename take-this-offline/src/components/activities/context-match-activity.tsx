'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import type { WordRow } from '@/lib/words'

interface ContextMatchActivityProps {
  word: WordRow
  distractors: string[]
  isCompleted: boolean
  onComplete: () => void
}

export function ContextMatchActivity({
  word,
  distractors,
  isCompleted,
  onComplete,
}: ContextMatchActivityProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const options = useMemo(() => {
    const arr = [word.definition, ...distractors]
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [word.id, distractors]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasSelected = selectedIndex !== null

  function handleSelect(index: number) {
    if (hasSelected) return
    setSelectedIndex(index)
    if (options[index] === word.definition) {
      onComplete()
    }
  }

  function getButtonClassName(index: number): string {
    if (!hasSelected) return ''
    const isCorrectOption = options[index] === word.definition
    const isSelected = index === selectedIndex
    if (isCorrectOption) return 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
    if (isSelected) return 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
    return 'opacity-50'
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Context Match
          </p>
          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        </div>

        <p className="text-sm font-medium">
          Which definition matches &ldquo;{word.title}&rdquo;?
        </p>

        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto whitespace-normal text-left justify-start p-3 text-sm leading-snug ${getButtonClassName(index)}`}
              onClick={() => handleSelect(index)}
              disabled={hasSelected}
              aria-label={`Option ${index + 1}: ${option}`}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
