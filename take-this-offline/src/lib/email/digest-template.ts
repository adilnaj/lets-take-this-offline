import type { Database } from '@/lib/types/database.types'

type Word = Database['public']['Tables']['words']['Row']

export function renderDigestEmail(word: Word, appUrl: string): { subject: string; html: string } {
  const wordUrl = `${appUrl}/word/${word.slug}`
  const subject = `Today's word: ${word.title}`
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff">
    <tr>
      <td style="padding:24px 32px 12px;border-bottom:1px solid #e5e7eb">
        <p style="margin:0;font-size:13px;color:#6b7280;font-weight:500">Let's Take This Offline</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 32px 0">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">${word.category ?? ''}</p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#18181b;line-height:1.2">${word.title}</h1>
        <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6">${word.definition}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 24px">
        <div style="background:#f9fafb;border-radius:8px;padding:20px">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;font-weight:500">Quick Take</p>
          <p style="margin:0;font-size:15px;color:#374151;line-height:1.6">${word.exec_summary ?? ''}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 32px">
        <a href="${wordUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500">See examples &rarr;</a>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px;border-top:1px solid #e5e7eb">
        <p style="margin:0;font-size:12px;color:#9ca3af">
          You're receiving this because you subscribed to the daily digest.
          <a href="${appUrl}/profile" style="color:#6b7280">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
  return { subject, html }
}
