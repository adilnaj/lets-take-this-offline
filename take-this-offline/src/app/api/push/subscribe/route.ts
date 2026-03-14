import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { endpoint, auth, p256dh, timezone, notifyHour } = body as {
    endpoint: string
    auth: string
    p256dh: string
    timezone: string
    notifyHour: number
  }

  if (
    typeof notifyHour !== 'number' ||
    !Number.isInteger(notifyHour) ||
    notifyHour < 0 ||
    notifyHour > 23
  ) {
    return NextResponse.json({ error: 'invalid_hour' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      auth,
      p256dh,
      timezone: timezone ?? 'UTC',
      notify_hour: notifyHour,
    },
    { onConflict: 'user_id,endpoint' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
