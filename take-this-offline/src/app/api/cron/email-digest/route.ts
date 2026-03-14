import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { renderDigestEmail } from '@/lib/email/digest-template'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const today = new Date().toISOString().slice(0, 10)

  const { data: word } = await supabase
    .from('words')
    .select('*')
    .eq('daily_date', today)
    .single()

  if (!word) {
    return NextResponse.json({ sent: 0, reason: 'no_word_today' })
  }

  const { data: prefs } = await supabase
    .from('email_digest_prefs')
    .select('user_id')
    .eq('enabled', true)

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const { subject, html } = renderDigestEmail(word, appUrl)

  let sent = 0
  for (const pref of prefs) {
    const { data: userData } = await supabase.auth.admin.getUserById(pref.user_id)
    const email = userData?.user?.email
    if (!email) continue

    try {
      await resend.emails.send({
        from: `Let's Take This Offline <${process.env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject,
        html,
      })
      sent++
    } catch (err) {
      console.error(`Failed to send digest to ${email}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
