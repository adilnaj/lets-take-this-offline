import { describe, it } from 'vitest'

describe('POST /api/sentence-feedback', () => {
  it.todo('returns 401 when user is not authenticated')
  it.todo('returns 400 when sentence is missing from request body')
  it.todo('returns feedback string when authenticated and sentence provided')
  it.todo('feedback is 2-3 sentences in length')
})

describe('SentenceActivity', () => {
  it.todo('shows inline login prompt when user is not logged in')
  it.todo('shows textarea when user is logged in')
  it.todo('shows loading state while waiting for feedback')
  it.todo('displays feedback below textarea after submission')
  it.todo('calls onComplete after receiving feedback')
})
