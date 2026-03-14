import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { POINTS, computeStreak, deriveMasteryLevel } from '@/lib/activities'

const VALID_ACTIVITY_TYPES = ['flashcard', 'fill_blank', 'sentence', 'context_match'] as const
type ActivityType = typeof VALID_ACTIVITY_TYPES[number]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { wordId, activityType } = body
  if (!wordId || !activityType || !VALID_ACTIVITY_TYPES.includes(activityType)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Idempotent insert — UNIQUE(user_id, word_id, activity_type, completed_date)
  const { error: activityError, count } = await supabase.from('user_activity').upsert(
    { user_id: user.id, word_id: wordId, activity_type: activityType, completed_date: today },
    { onConflict: 'user_id,word_id,activity_type,completed_date', ignoreDuplicates: true, count: 'exact' }
  )
  if (activityError) return NextResponse.json({ error: activityError.message }, { status: 500 })

  const isNewCompletion = (count ?? 0) > 0

  // Points only awarded on first (new) completion
  const pointsAwarded = isNewCompletion ? POINTS[activityType as ActivityType] : 0

  // Check if all 4 activities now complete for this word today
  const { data: completions } = await supabase
    .from('user_activity')
    .select('activity_type')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .eq('completed_date', today)

  const completedTypes = new Set(completions?.map(r => r.activity_type) ?? [])
  const allComplete = VALID_ACTIVITY_TYPES.every(t => completedTypes.has(t))
  const bonusAwarded = isNewCompletion && allComplete && completedTypes.size === 4 ? POINTS.all_complete_bonus : 0
  const totalPointsAwarded = pointsAwarded + bonusAwarded

  // Upsert user_stats
  if (totalPointsAwarded > 0) {
    const { data: existing } = await supabase.from('user_stats').select('total_points').eq('user_id', user.id).maybeSingle()
    const newTotal = (existing?.total_points ?? 0) + totalPointsAwarded
    const streak = await computeStreak(user.id, supabase)
    await supabase.from('user_stats').upsert({
      user_id: user.id,
      total_points: newTotal,
      streak_count: streak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Upsert word_mastery
    const { data: mastery } = await supabase.from('word_mastery').select('activity_count').eq('user_id', user.id).eq('word_id', wordId).maybeSingle()
    const newCount = (mastery?.activity_count ?? 0) + 1
    await supabase.from('word_mastery').upsert({
      user_id: user.id,
      word_id: wordId,
      activity_count: newCount,
      mastery_level: deriveMasteryLevel(newCount),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,word_id' })

    const { data: statsRow } = await supabase.from('user_stats').select('total_points, streak_count').eq('user_id', user.id).maybeSingle()
    return NextResponse.json({ ok: true, points_awarded: totalPointsAwarded, new_total: statsRow?.total_points ?? newTotal, streak: statsRow?.streak_count ?? streak, all_complete: allComplete })
  }

  const { data: statsRow } = await supabase.from('user_stats').select('total_points, streak_count').eq('user_id', user.id).maybeSingle()
  return NextResponse.json({ ok: true, points_awarded: 0, new_total: statsRow?.total_points ?? 0, streak: statsRow?.streak_count ?? 0, all_complete: allComplete })
}
