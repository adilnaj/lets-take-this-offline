'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import type { WordRow } from '@/lib/words'

interface FlashcardActivityProps {
  word: WordRow
  isCompleted: boolean
  onComplete: () => void
}

export function FlashcardActivity({ word, isCompleted, onComplete }: FlashcardActivityProps) {
  const [flipped, setFlipped] = useState(false)
  const completedOnce = useRef(false)

  function handleFlip() {
    setFlipped(prev => !prev)
    if (!completedOnce.current) {
      completedOnce.current = true
      onComplete()
    }
  }

  return (
    <div className="relative w-full">
      {isCompleted && (
        <div className="absolute top-2 right-2 z-10 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}
      {/* 3D flip container */}
      <div
        className="h-48 w-full cursor-pointer [perspective:1000px]"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Click to see word' : 'Click to see definition'}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleFlip() }}
      >
        <div
          className={`relative h-full w-full [transform-style:preserve-3d] transition-transform duration-500 ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front face */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Flashcard
                </p>
                <p className="text-2xl font-bold text-center">{word.title}</p>
              </CardContent>
            </Card>
          </div>

          {/* Back face */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Card className="h-full">
              <CardContent className="flex h-full items-center justify-center p-6">
                <p className="text-center text-sm leading-relaxed">{word.definition}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
