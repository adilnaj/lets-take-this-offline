import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { endpoint } = body as { endpoint: string }

  const { error, count } = await supabase
    .from('push_subscriptions')
    .delete({ count: 'exact' })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if ((count ?? 0) === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
