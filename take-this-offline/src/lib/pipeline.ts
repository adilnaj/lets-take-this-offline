import type { SupabaseClient } from '@supabase/supabase-js'

export const DEDUP_THRESHOLD = 0.15

export const WORD_CONTENT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    definition: { type: 'string' },
    exec_summary: { type: 'string' },
    where_used: { type: 'string' },
    usage_examples: { type: 'array', items: { type: 'string' } },
    heard_in_wild: { type: ['string', 'null'] },
    heard_source_url: { type: ['string', 'null'] },
    category: {
      type: 'string',
      enum: ['Strategy', 'Tech', 'Finance', 'HR', 'Operations', 'Marketing', 'Legal', 'Other'],
    },
  },
  required: [
    'title', 'definition', 'exec_summary', 'where_used',
    'usage_examples', 'heard_in_wild', 'heard_source_url', 'category',
  ],
  additionalProperties: false,
} as const

/**
 * Build the Claude prompt for word generation.
 * Pass existing titles so Claude avoids re-generating already-covered terms.
 */
export function buildPrompt(headlines: string, existingTitles: string[]): string {
  const headlinesSection = headlines.trim().length > 0
    ? `Here are today's trending Hacker News headlines for context:\n${headlines}`
    : 'No trending stories available — use recent business/tech trends from 2025-2026.'

  const exclusionSection = existingTitles.length > 0
    ? `\n\nDo not choose any of the following already-covered terms: ${existingTitles.join(', ')}.`
    : ''

  return `You are a content writer for "Let's Take This Offline", a daily vocabulary app that teaches business and tech jargon.

${headlinesSection}

Choose ONE specific business or technology jargon term that:
- A professional would encounter in meetings, emails, or presentations
- Is currently trending or widely used in corporate/startup environments
- Has not been covered yet${exclusionSection}

Generate comprehensive educational content for this term. Return JSON matching the required schema exactly.`
}

/**
 * Fetch top HN stories from the last 24 hours as trending signals.
 * Accepts optional fetch param for testability.
 * Returns empty array on any error — the caller provides a fallback prompt.
 */
export async function fetchHNSignals(fetchFn: typeof fetch = fetch): Promise<string[]> {
  try {
    const since = Math.floor((Date.now() - 86_400_000) / 1000)
    const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${since},points>10&hitsPerPage=10`
    const res = await fetchFn(url)
    const { hits } = (await res.json()) as { hits: Array<{ title: string }> }
    return (hits ?? []).map((h) => h.title)
  } catch {
    return []
  }
}

/**
 * Check if the candidate embedding is too similar to an existing word.
 * Uses the match_similar_words Postgres RPC (cosine distance < DEDUP_THRESHOLD).
 * Returns false (safe — allow insert) on RPC error to avoid blocking on DB issues.
 */
export async function checkDuplicate(
  supabase: SupabaseClient,
  embedding: number[]
): Promise<boolean> {
  const { data, error } = await supabase.rpc('match_similar_words', {
    query_embedding: `[${embedding.join(',')}]`,
    similarity_threshold: DEDUP_THRESHOLD,
  })
  if (error || !data) return false
  return Array.isArray(data) && data.length > 0
}
