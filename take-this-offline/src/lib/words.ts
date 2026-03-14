import { createClient } from '@/lib/supabase/server'
import type { Tables, Enums } from '@/lib/types/database.types'

export type WordRow = Tables<'words'>
export type WordCategory = Enums<'word_category'>
export const WORD_CATEGORIES: WordCategory[] = [
  'Strategy', 'Tech', 'Finance', 'HR', 'Operations', 'Marketing', 'Legal', 'Other'
]

/**
 * Returns today's word by matching daily_date = today in UTC.
 * Returns null if no word is scheduled for today.
 */
export async function getTodaysWord(): Promise<WordRow | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('daily_date', today)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Returns a single word by slug. Returns null if not found.
 */
export async function getWordBySlug(slug: string): Promise<WordRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Returns paginated archive: past words (daily_date <= today), sorted newest first.
 * page is 1-indexed. pageSize defaults to 20.
 * Returns { words, total } where total is the unfiltered count.
 */
export async function getArchive(
  page: number,
  pageSize = 20
): Promise<{ words: WordRow[]; total: number }> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const offset = (page - 1) * pageSize

  const { count, error: countError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .lte('daily_date', today)
  if (countError) throw countError

  const { data, error } = await supabase
    .from('words')
    .select('*')
    .lte('daily_date', today)
    .order('daily_date', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  return { words: data ?? [], total: count ?? 0 }
}

/**
 * Returns words matching the search/filter criteria, paginated.
 * keyword: matches against title, definition, exec_summary (ilike %keyword%)
 * category: filters by exact word_category enum value
 * dateFrom / dateTo: filter by daily_date range (YYYY-MM-DD strings)
 * All filter params are optional; pass undefined to skip that filter.
 */
export async function searchArchive(params: {
  keyword?: string
  category?: WordCategory
  dateFrom?: string
  dateTo?: string
  page: number
  pageSize?: number
}): Promise<{ words: WordRow[]; total: number }> {
  const { keyword, category, dateFrom, dateTo, page, pageSize = 20 } = params
  const supabase = await createClient()
  const offset = (page - 1) * pageSize

  // Build base query with filters
  let countQuery = supabase.from('words').select('*', { count: 'exact', head: true })
  let dataQuery = supabase.from('words').select('*')

  if (keyword) {
    const likeFilter = `title.ilike.%${keyword}%,definition.ilike.%${keyword}%,exec_summary.ilike.%${keyword}%`
    countQuery = countQuery.or(likeFilter)
    dataQuery = dataQuery.or(likeFilter)
  }
  if (category) {
    countQuery = countQuery.eq('category', category)
    dataQuery = dataQuery.eq('category', category)
  }
  if (dateFrom) {
    countQuery = countQuery.gte('daily_date', dateFrom)
    dataQuery = dataQuery.gte('daily_date', dateFrom)
  }
  if (dateTo) {
    countQuery = countQuery.lte('daily_date', dateTo)
    dataQuery = dataQuery.lte('daily_date', dateTo)
  }

  const { count, error: countError } = await countQuery
  if (countError) throw countError

  const { data, error } = await dataQuery
    .order('daily_date', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  return { words: data ?? [], total: count ?? 0 }
}
