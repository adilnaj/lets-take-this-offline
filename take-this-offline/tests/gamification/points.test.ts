import { describe, it, expect } from 'vitest'
import { POINTS, deriveMasteryLevel } from '@/lib/activities'

describe('POINTS constant (GAME-01)', () => {
  it('awards 10 points per activity', () => {
    expect(POINTS.flashcard).toBe(10)
    expect(POINTS.fill_blank).toBe(10)
    expect(POINTS.sentence).toBe(10)
    expect(POINTS.context_match).toBe(10)
  })
  it('all_complete_bonus is 20', () => {
    expect(POINTS.all_complete_bonus).toBe(20)
  })
  it('max per day is 60 (4 activities + bonus)', () => {
    const max = POINTS.flashcard + POINTS.fill_blank + POINTS.sentence + POINTS.context_match + POINTS.all_complete_bonus
    expect(max).toBe(60)
  })
})
