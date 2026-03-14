import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getWordBySlug } from '@/lib/words'

export const runtime = 'edge'   // next/og runs on Edge runtime

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const word = await getWordBySlug(params.slug)

  if (!word) {
    return new Response('Not found', { status: 404 })
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '60px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand header */}
        <div style={{ display: 'flex', color: '#a5b4fc', fontSize: '20px', fontWeight: 600 }}>
          Let&apos;s Take This Offline
        </div>

        {/* Word title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ color: '#e0e7ff', fontSize: '18px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '2px' }}>
            {word.category}
          </div>
          <div style={{ color: '#ffffff', fontSize: '72px', fontWeight: 800, lineHeight: 1.1, wordBreak: 'break-word' }}>
            {word.title}
          </div>
          <div style={{ color: '#c7d2fe', fontSize: '24px', lineHeight: 1.4, maxWidth: '800px' }}>
            {word.exec_summary.length > 120 ? word.exec_summary.slice(0, 117) + '...' : word.exec_summary}
          </div>
        </div>

        {/* Date */}
        <div style={{ display: 'flex', color: '#818cf8', fontSize: '18px' }}>
          {new Date(word.daily_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
