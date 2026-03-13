import { test, expect } from '@playwright/test'

test.describe('AUTH-04: Session persistence', () => {
  test('session persists across browser refresh after sign-in', async ({ page }) => {
    await page.goto('/auth/sign-in')
    // TODO: implement — sign in, reload page, verify still authenticated (no redirect to sign-in)
    expect(false).toBe(true) // stub: replace with real assertions
  })
})
