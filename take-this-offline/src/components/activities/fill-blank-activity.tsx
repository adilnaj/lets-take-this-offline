'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2 } from 'lucide-react'
import type { WordRow } from '@/lib/words'

export function generateFillBlank(word: WordRow): { text: string; answer: string } {
  const text = word.definition.replace(new RegExp(word.title, 'i'), '___________')
  return { text, answer: word.title }
}

interface FillBlankActivityProps {
  word: WordRow
  isCompleted: boolean
  onComplete: () => void
}

export function FillBlankActivity({ word, isCompleted, onComplete }: FillBlankActivityProps) {
  const { text: blankedText } = generateFillBlank(word)
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const isCorrect = feedback === 'correct' || isCompleted

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return

    const isMatch = inputValue.trim().toLowerCase() === word.title.toLowerCase()
    if (isMatch) {
      setFeedback('correct')
      onComplete()
    } else {
      setFeedback('incorrect')
      setInputValue('')
    }
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fill in the Blank
          </p>
          {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        </div>

        <blockquote className="border-l-4 border-muted pl-4 text-sm italic leading-relaxed">
          {blankedText}
        </blockquote>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Type the missing word..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={isCorrect}
            aria-label="Fill in the blank answer"
          />

          <Button
            type="submit"
            disabled={!inputValue.trim() || isCorrect}
          >
            Submit
          </Button>
        </form>

        {feedback === 'correct' && (
          <p className="text-sm font-medium text-green-600">
            Correct! The answer is {word.title}
          </p>
        )}
        {feedback === 'incorrect' && (
          <p className="text-sm font-medium text-red-600">
            Not quite — try again
          </p>
        )}
      </CardContent>
    </Card>
  )
}
