import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const FEEDBACK_MODEL = 'claude-haiku-4-5-20251001'
const DAILY_LIMIT = 10
const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate-limit check: read today's call count before any AI call
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const { data: callRow } = await supabase
    .from('sentence_feedback_calls')
    .select('call_count')
    .eq('user_id', user.id)
    .eq('call_date', today)
    .single()

  if ((callRow?.call_count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: 'Daily feedback limit reached. Come back tomorrow!' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { wordTitle, definition, sentence } = body
  if (!wordTitle || !definition || !sentence) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const message = await anthropic.messages.create({
      model: FEEDBACK_MODEL,
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Word: "${wordTitle}" — Definition: "${definition}"
User's sentence: "${sentence}"

Give 2-3 sentences of feedback. Be witty, tongue-in-cheek, like a clever colleague who actually enjoyed reading their sentence. Confirm correct usage or gently correct it with personality. No generic "Good job!" openers. No bullet points. Plain prose only.`,
      }],
    })

    const feedback = (message.content[0] as { text: string }).text

    // Upsert incremented call count after successful AI response
    await supabase.from('sentence_feedback_calls').upsert({
      user_id: user.id,
      call_date: today,
      call_count: (callRow?.call_count ?? 0) + 1,
    })

    return NextResponse.json({ feedback })
  } catch (err) {
    console.error('[sentence-feedback] Anthropic error:', err)
    return NextResponse.json({ error: 'AI feedback unavailable' }, { status: 502 })
  }
}
