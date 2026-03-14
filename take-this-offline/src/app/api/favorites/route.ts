import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wordId } = await req.json()
  if (!wordId) return NextResponse.json({ error: 'wordId required' }, { status: 400 })

  // Check existing
  const { data: existing } = await supabase
    .from('user_favorites')
    .select('word_id')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .maybeSingle()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('word_id', wordId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ favorited: false })
  } else {
    // Add favorite
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: user.id, word_id: wordId })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ favorited: true })
  }
}
