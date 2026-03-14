import { describe, it, expect } from 'vitest'
import { generateFillBlank } from '@/components/activities/fill-blank-activity'

describe('generateFillBlank', () => {
  it('replaces first occurrence of word title in definition with ___________', () => {
    const word = { title: 'Synergy', definition: 'Synergy is the idea that combined efforts...' } as any
    const result = generateFillBlank(word)
    expect(result.text).toContain('___________')
    expect(result.text).not.toContain('Synergy')
    expect(result.answer).toBe('Synergy')
  })
  it('replacement is case-insensitive', () => {
    const word = { title: 'KPI', definition: 'A kpi is a measurable value...' } as any
    const result = generateFillBlank(word)
    expect(result.text).toContain('___________')
    expect(result.text).not.toContain('kpi')
  })
  it('returns the word title as the answer', () => {
    const word = { title: 'ROI', definition: 'ROI stands for return on investment' } as any
    const result = generateFillBlank(word)
    expect(result.answer).toBe('ROI')
  })
})

describe('FillBlankActivity', () => {
  it.todo('shows blank text with ___________ placeholder')
  it.todo('marks correct when submitted answer matches word title (case-insensitive)')
  it.todo('marks incorrect when submitted answer does not match')
  it.todo('calls onComplete when answer is submitted')
  it.todo('shows checkmark state when isCompleted prop is true')
})
