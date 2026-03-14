'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WordRow } from '@/lib/words'
import type { User } from '@supabase/supabase-js'

interface SentenceActivityProps {
  word: WordRow
  user: User | null
  isCompleted: boolean
  onComplete: () => void
}

export function SentenceActivity({ word, user, isCompleted, onComplete }: SentenceActivityProps) {
  const [sentence, setSentence] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  async function handleSubmit() {
    if (!sentence.trim() || isLoading || hasSubmitted) return

    setIsLoading(true)
    setFeedback(null)
    setError(null)

    try {
      const res = await fetch('/api/sentence-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: word.id,
          wordTitle: word.title,
          definition: word.definition,
          sentence,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      const data = await res.json()
      setFeedback(data.feedback)
      setHasSubmitted(true)
      onComplete()
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = sentence.trim().length === 0 || isLoading || hasSubmitted

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Use It in a Sentence</span>
          {(isCompleted || hasSubmitted) && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>

        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link href="/auth/sign-in" className="underline font-medium text-foreground">
              Sign in
            </Link>{' '}
            to practice writing a sentence.
          </p>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full min-h-[4rem] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              rows={2}
              placeholder={`Write a sentence using '${word.title}'...`}
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              disabled={isLoading || hasSubmitted}
            />

            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              size="sm"
            >
              Submit
            </Button>

            {isLoading && (
              <p className="text-sm text-muted-foreground italic">Reading your sentence...</p>
            )}

            {feedback && (
              <blockquote className="border-l-4 border-primary/40 pl-3 text-sm text-muted-foreground">
                {feedback}
              </blockquote>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
