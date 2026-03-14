import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import webPush from 'web-push'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentHour = new Date().getUTCHours()
  const today = new Date().toISOString().slice(0, 10)

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: word } = await supabase
    .from('words')
    .select('title, definition, slug')
    .eq('daily_date', today)
    .maybeSingle()

  if (!word) return NextResponse.json({ sent: 0 })

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, auth, p256dh')
    .eq('notify_hour', currentHour)

  if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ sent: 0 })

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const payload = JSON.stringify({
    title: word.title,
    body: word.definition.slice(0, 100),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/word/${word.slug}`,
  })

  let sent = 0
  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
        payload
      )
      sent++
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      }
    }
  }

  return NextResponse.json({ sent })
}
