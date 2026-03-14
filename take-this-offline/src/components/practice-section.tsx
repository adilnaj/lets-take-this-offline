'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { WordRow } from '@/lib/words'
import { FlashcardActivity } from '@/components/activities/flashcard-activity'
import { FillBlankActivity } from '@/components/activities/fill-blank-activity'
import { SentenceActivity } from '@/components/activities/sentence-activity'
import { ContextMatchActivity } from '@/components/activities/context-match-activity'
import { StreakCounter } from '@/components/streak-counter'
import { CompletionBanner } from '@/components/completion-banner'

type ActivityType = 'flashcard' | 'fill_blank' | 'sentence' | 'context_match'
const ALL_ACTIVITY_TYPES: ActivityType[] = ['flashcard', 'fill_blank', 'sentence', 'context_match']

interface PracticeSectionProps {
  word: WordRow
  user: User | null
  initialCompletions: string[]  // activity_type values already complete today
  initialStats: { total_points: number; streak_count: number; last_active_date: string | null } | null
  distractors: string[]  // for ContextMatchActivity
}

export function PracticeSection({
  word,
  user,
  initialCompletions,
  initialStats,
  distractors,
}: PracticeSectionProps) {
  const [completions, setCompletions] = useState<Set<ActivityType>>(
    new Set(initialCompletions as ActivityType[])
  )
  const [stats, setStats] = useState(initialStats)
  const [isSubmitting, setIsSubmitting] = useState<ActivityType | null>(null)

  const allCompleted =
    completions.size >= 4 && ALL_ACTIVITY_TYPES.every(t => completions.has(t))

  async function handleComplete(activityType: ActivityType) {
    // Anonymous user: track locally only, no API call
    if (user === null) {
      setCompletions(prev => new Set([...prev, activityType]))
      return
    }

    // Already completed: no-op
    if (completions.has(activityType)) {
      return
    }

    // Optimistically add to set
    setCompletions(prev => new Set([...prev, activityType]))
    setIsSubmitting(activityType)

    try {
      const res = await fetch('/api/activity/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: word.id, activityType }),
      })

      if (!res.ok) {
        // Revert optimistic update
        setCompletions(prev => {
          const next = new Set(prev)
          next.delete(activityType)
          return next
        })
        return
      }

      const data = await res.json()
      setStats(prev => ({
        total_points: data.new_total,
        streak_count: data.streak,
        last_active_date: prev?.last_active_date ?? null,
      }))
    } catch {
      // Revert optimistic update on network error
      setCompletions(prev => {
        const next = new Set(prev)
        next.delete(activityType)
        return next
      })
    } finally {
      setIsSubmitting(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Practice Today</h2>
        {user && <StreakCounter streakCount={stats?.streak_count ?? 0} />}
      </div>

      {allCompleted && (
        <CompletionBanner
          totalPoints={stats?.total_points ?? 0}
          streakCount={stats?.streak_count ?? 0}
          allCompleted={allCompleted}
        />
      )}

      <div className="grid gap-4">
        <FlashcardActivity
          word={word}
          isCompleted={completions.has('flashcard')}
          onComplete={() => handleComplete('flashcard')}
        />
        <FillBlankActivity
          word={word}
          isCompleted={completions.has('fill_blank')}
          onComplete={() => handleComplete('fill_blank')}
        />
        <SentenceActivity
          word={word}
          user={user}
          isCompleted={completions.has('sentence')}
          onComplete={() => handleComplete('sentence')}
        />
        <ContextMatchActivity
          word={word}
          distractors={distractors}
          isCompleted={completions.has('context_match')}
          onComplete={() => handleComplete('context_match')}
        />
      </div>
    </section>
  )
}
