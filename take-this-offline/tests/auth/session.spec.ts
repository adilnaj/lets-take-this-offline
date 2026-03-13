import { test, expect } from '@playwright/test'

const SESSION_EMAIL = 'session-test@example.com' // pre-create in Supabase
const SESSION_PASSWORD = 'TestPassword123!'

test.describe('AUTH-04: Session persistence', () => {
  test('session persists across browser refresh after sign-in', async ({ page }) => {
    // Sign in
    await page.goto('/auth/sign-in')
    await page.fill('input[type="email"]', SESSION_EMAIL)
    await page.fill('input[type="password"]', SESSION_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).not.toHaveURL('/auth/sign-in', { timeout: 5000 })

    // Reload and verify still authenticated (root page shows email, not redirect to sign-in)
    await page.reload()
    await expect(page).not.toHaveURL('/auth/sign-in')
    // Root page shows the signed-in user's email (per page.tsx implementation in Plan 03)
    await expect(page.getByText(SESSION_EMAIL)).toBeVisible()
  })
})
