import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const FEEDBACK_MODEL = 'claude-haiku-3-5'
const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    return NextResponse.json({ feedback })
  } catch (err) {
    console.error('[sentence-feedback] Anthropic error:', err)
    return NextResponse.json({ error: 'AI feedback unavailable' }, { status: 502 })
  }
}
