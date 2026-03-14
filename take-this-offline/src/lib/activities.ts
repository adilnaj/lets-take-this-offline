import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { WordRow } from '@/lib/words'

export const POINTS = {
  flashcard: 10,
  fill_blank: 10,
  sentence: 10,
  context_match: 10,
  all_complete_bonus: 20,
} as const

/**
 * Derives mastery level from total activity count for a word.
 * 0 activities = 'seen', 1-3 = 'learning', 4+ = 'mastered'
 */
export function deriveMasteryLevel(activityCount: number): 'seen' | 'learning' | 'mastered' {
  if (activityCount >= 4) return 'mastered'
  if (activityCount >= 1) return 'learning'
  return 'seen'
}

/**
 * Generates fill-in-the-blank exercise from word data.
 * Replaces the first case-insensitive occurrence of the word title
 * in the definition with '___________'.
 */
export function generateFillBlank(word: WordRow): { text: string; answer: string } {
  const blank = '___________'
  const text = word.definition.replace(new RegExp(word.title, 'i'), blank)
  return { text, answer: word.title }
}

/**
 * Returns the list of activity_type values completed today for a given user and word.
 * Uses the server Supabase client internally.
 */
export async function getCompletionsToday(userId: string, wordId: string): Promise<string[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('user_activity')
    .select('activity_type')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .eq('completed_date', today)

  if (error) throw error
  return (data ?? []).map(r => r.activity_type)
}

/**
 * Returns the user's stats row, or null if no stats row exists yet.
 */
export async function getUserStats(
  userId: string
): Promise<{ total_points: number; streak_count: number; last_active_date: string | null } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_stats')
    .select('total_points, streak_count, last_active_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Returns up to 3 definitions from the same category as the given word,
 * from different words. Used as distractors in the Context Match activity.
 * Accepts a Supabase client as a parameter so it can be reused in route handlers.
 */
export async function getDisstractors(word: WordRow, supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from('words')
    .select('definition')
    .eq('category', word.category)
    .neq('id', word.id)
    .limit(3)
  return (data ?? []).map(r => r.definition)
}

/**
 * Computes the current streak for a user: the number of consecutive days
 * (ending today or yesterday) with at least one completed activity.
 * Returns 0 if no activity exists or if the streak is broken.
 */
export async function computeStreak(userId: string, supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from('user_activity')
    .select('completed_date')
    .eq('user_id', userId)
    .order('completed_date', { ascending: false })

  if (!data || data.length === 0) return 0

  // Deduplicate dates and sort newest first
  const dates = [...new Set(data.map(r => r.completed_date))].sort().reverse()
  const today = new Date().toISOString().split('T')[0]

  // Streak only counts if user was active today or yesterday
  if (dates[0] !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dates[0] !== yesterday) return 0
  }

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}
