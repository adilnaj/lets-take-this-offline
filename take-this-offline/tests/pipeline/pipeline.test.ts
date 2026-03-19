import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildPrompt, fetchHNSignals, checkDuplicate } from '@/lib/pipeline'

describe('buildPrompt', () => {
  it('includes headlines as context in prompt', () => {
    const prompt = buildPrompt('AI is booming\nCloud spending up', [])
    expect(prompt).toContain('AI is booming')
  })

  it('instructs Claude not to pick a term that mirrors a headline topic', () => {
    const prompt = buildPrompt('Quarterly earnings disappoint', [])
    expect(prompt).toContain('do NOT pick a term that directly mirrors a headline topic')
  })

  it('includes existing titles in exclusion list', () => {
    const prompt = buildPrompt('', ['ROI', 'KPI'])
    expect(prompt).toContain('ROI')
    expect(prompt).toContain('KPI')
  })

  it('returns non-empty prompt even with no headlines', () => {
    const prompt = buildPrompt('', [])
    expect(prompt.length).toBeGreaterThan(20)
  })

  it('prompts for category diversity', () => {
    const prompt = buildPrompt('', [])
    expect(prompt).toContain('Strategy, Tech, Finance, HR, Operations, Marketing, Legal')
  })
})

describe('fetchHNSignals', () => {
  it('returns array of title strings from HN API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ hits: [{ title: 'Story A' }, { title: 'Story B' }] })
    })
    const titles = await fetchHNSignals(mockFetch as unknown as typeof fetch)
    expect(titles).toEqual(['Story A', 'Story B'])
  })

  it('returns empty array when hits is empty', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ hits: [] })
    })
    const titles = await fetchHNSignals(mockFetch as unknown as typeof fetch)
    expect(titles).toEqual([])
  })

  it('returns empty array on network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network'))
    const titles = await fetchHNSignals(mockFetch as unknown as typeof fetch)
    expect(titles).toEqual([])
  })
})

describe('checkDuplicate', () => {
  it('returns true when RPC returns matching rows', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: [{ id: 'abc', title: 'ROI', distance: 0.08 }], error: null
    })
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient
    expect(await checkDuplicate(mockSupabase, [0.1, 0.2, 0.3])).toBe(true)
  })

  it('returns false when RPC returns empty array', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient
    expect(await checkDuplicate(mockSupabase, [0.1, 0.2, 0.3])).toBe(false)
  })

  it('returns false (safe) when RPC returns an error', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } })
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient
    expect(await checkDuplicate(mockSupabase, [0.1, 0.2, 0.3])).toBe(false)
  })
})
