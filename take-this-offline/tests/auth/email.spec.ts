import { test, expect } from '@playwright/test'

const TEST_EMAIL = `test+${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('AUTH-01: Email sign-up and sign-in', () => {
  test('user can sign up with email and password', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    // Fill confirm password if present
    const confirmInput = page.locator('input[placeholder*="confirm"], input[name="confirmPassword"]')
    if (await confirmInput.count() > 0) {
      await confirmInput.fill(TEST_PASSWORD)
    }
    await page.click('button[type="submit"]')
    // Either redirected (if email confirm is OFF) or sees a "check your email" message
    await expect(page).not.toHaveURL('/auth/sign-up', { timeout: 5000 })
      .catch(() => expect(page.getByText(/check your email/i)).toBeVisible())
  })

  test('user can sign in with email and password', async ({ page }) => {
    // Sign in with known test credentials (pre-created in Supabase or from prior test)
    await page.goto('/auth/sign-in')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    // Should redirect away from sign-in on success
    await expect(page).not.toHaveURL('/auth/sign-in', { timeout: 5000 })
  })

  test('sign-up with duplicate email shows error', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.fill('input[type="email"]', TEST_EMAIL) // already registered above
    await page.fill('input[type="password"]', TEST_PASSWORD)
    const confirmInput = page.locator('input[placeholder*="confirm"], input[name="confirmPassword"]')
    if (await confirmInput.count() > 0) await confirmInput.fill(TEST_PASSWORD)
    await page.click('button[type="submit"]')
    // Should show an error message (not redirect)
    await expect(page.locator('text=/already|exists|registered|error/i')).toBeVisible({ timeout: 5000 })
  })
})
