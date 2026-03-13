import Anthropic from '@anthropic-ai/sdk'
import { VoyageAIClient } from 'voyageai'
import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'
import { WORD_LIST } from './word-list'

// IMPORTANT: Use service role key — anon key will be blocked by RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })

// Fixed category enum values — must match the word_category enum in the migration exactly
const VALID_CATEGORIES = ['Strategy', 'Tech', 'Finance', 'HR', 'Operations', 'Marketing', 'Legal', 'Other'] as const
type Category = typeof VALID_CATEGORIES[number]

// Generate daily_date values: spread across the last ~100 days from today
// Each date is unique (enforced by DB UNIQUE constraint)
function generateDates(count: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = count; i >= 1; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0]) // 'YYYY-MM-DD'
  }
  return dates
}

interface WordContent {
  definition: string
  exec_summary: string
  where_used: string
  usage_examples: string[]
  heard_in_wild: string | null
  heard_source_url: string | null
  category: Category
}

async function generateWordContent(title: string): Promise<WordContent> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate editorial content for the business/tech jargon term: "${title}"

Return a JSON object with exactly these fields:
{
  "definition": "A 1-2 sentence clear definition of what the term means",
  "exec_summary": "A 2-3 sentence executive summary explaining the term in plain language — what it is and why it matters",
  "where_used": "A 1-2 sentence description of the context or industry where this term appears most often",
  "usage_examples": ["Example sentence 1 using the term naturally", "Example sentence 2 using the term naturally"],
  "heard_in_wild": "A paraphrased real-world citation or example of this term being used (or null if none comes to mind)",
  "heard_source_url": "A real URL to a public article, document, or post where this term appears in context (or null)",
  "category": "One of: Strategy, Tech, Finance, HR, Operations, Marketing, Legal, Other"
}

Return only valid JSON. No markdown fences.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text) as WordContent

  // Validate category is in the enum
  if (!VALID_CATEGORIES.includes(parsed.category)) {
    parsed.category = 'Other'
  }

  return parsed
}

async function generateEmbedding(title: string, definition: string, execSummary: string): Promise<number[]> {
  // Combine key fields into the text to embed — same pattern Phase 5 will use for dedup
  const text = `${title}: ${definition} ${execSummary}`
  const result = await voyage.embed({
    input: [text],
    model: 'voyage-3.5', // 1024 dimensions — matches vector(1024) column
    inputType: 'document',
  })
  return result.data![0].embedding as number[]
}

async function seedWord(title: string, dailyDate: string): Promise<void> {
  const slug = slugify(title, { lower: true, strict: true })

  // Idempotency check: skip if this slug already exists
  const { data: existing } = await supabase
    .from('words')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    console.log(`  [SKIP] "${title}" — already exists`)
    return
  }

  console.log(`  [GEN]  "${title}"...`)

  // Generate content and embedding in parallel where possible
  const content = await generateWordContent(title)
  const embedding = await generateEmbedding(title, content.definition, content.exec_summary)

  const { error } = await supabase.from('words').insert({
    title,
    slug,
    daily_date: dailyDate,
    category: content.category,
    definition: content.definition,
    exec_summary: content.exec_summary,
    where_used: content.where_used,
    usage_examples: content.usage_examples,
    heard_in_wild: content.heard_in_wild,
    heard_source_url: content.heard_source_url,
    embedding: `[${embedding.join(',')}]`, // pgvector expects '[1,2,3,...]' string format
  })

  if (error) {
    console.error(`  [ERR]  "${title}": ${error.message}`)
    throw error
  }

  console.log(`  [OK]   "${title}" → ${dailyDate} (${content.category})`)
}

async function main() {
  console.log(`Starting seed: ${WORD_LIST.length} words`)

  const dates = generateDates(WORD_LIST.length)

  let seeded = 0
  let skipped = 0
  let errored = 0

  for (let i = 0; i < WORD_LIST.length; i++) {
    try {
      const before = skipped
      await seedWord(WORD_LIST[i], dates[i])
      if (skipped === before) seeded++
      else skipped++
    } catch (e) {
      errored++
      console.error(`Failed to seed "${WORD_LIST[i]}":`, e)
    }

    // Rate limit: 1 word per second to avoid Claude API rate limits
    if (i < WORD_LIST.length - 1) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log(`\nSeed complete: ${seeded} inserted, ${skipped} skipped, ${errored} errors`)
}

main().catch(console.error)
