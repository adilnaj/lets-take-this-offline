import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { VoyageAIClient } from 'voyageai'
import slugify from 'slugify'
import {
  buildPrompt,
  fetchHNSignals,
  checkDuplicate,
  WORD_CONTENT_SCHEMA,
} from '@/lib/pipeline'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // 1. Auth guard
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 2. Idempotency: skip if today's word already exists
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('words')
    .select('id')
    .eq('daily_date', today)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ skipped: true, reason: 'word already exists for today' })
  }

  // 3. Fetch existing titles for title-level dedup prompt
  const { data: existingWords } = await supabase.from('words').select('title')
  const existingTitles = (existingWords ?? []).map((w: { title: string }) => w.title)

  // 4. Fetch HN trending signals
  const headlines = await fetchHNSignals()
  const headlineText = headlines.join('\n')

  // 5. Build Claude prompt
  const prompt = buildPrompt(headlineText, existingTitles)

  // 6. Generate word content via Claude structured outputs
  const anthropic = new Anthropic()
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: WORD_CONTENT_SCHEMA,
      },
    },
  })
  const wordContent = JSON.parse(
    (response.content[0] as { type: 'text'; text: string }).text
  ) as {
    title: string; definition: string; exec_summary: string; where_used: string;
    usage_examples: string[]; heard_in_wild: string | null; heard_source_url: string | null;
    category: string;
  }

  // 7. Generate embedding — format MUST match seed script: "title: definition exec_summary"
  const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! })
  const embedText = `${wordContent.title}: ${wordContent.definition} ${wordContent.exec_summary}`
  const embedResult = await voyage.embed({
    input: [embedText],
    model: 'voyage-3.5',
    inputType: 'document',
  })
  const embedding = embedResult.data![0].embedding as number[]

  // 8. Semantic dedup check (cosine distance < 0.15 via match_similar_words RPC)
  const isDuplicate = await checkDuplicate(supabase, embedding)
  if (isDuplicate) {
    return NextResponse.json({
      skipped: true,
      reason: 'too similar to an existing word (cosine distance below threshold)',
    })
  }

  // 9. Insert word
  const slug = slugify(wordContent.title, { lower: true, strict: true })
  const { error: insertError } = await supabase.from('words').insert({
    ...wordContent,
    slug,
    daily_date: today,
    embedding: `[${embedding.join(',')}]`,
  })
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 10. Success
  return NextResponse.json({ inserted: true, title: wordContent.title, date: today })
}
