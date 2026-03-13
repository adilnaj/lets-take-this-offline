import { test, expect } from '@playwright/test'

test.describe('AUTH-01: Email sign-up and sign-in', () => {
  test('user can sign up with email and password', async ({ page }) => {
    await page.goto('/auth/sign-up')
    // TODO: implement — sign up with test email, expect redirect or success state
    expect(false).toBe(true) // stub: replace with real assertions
  })

  test('user can sign in with email and password', async ({ page }) => {
    await page.goto('/auth/sign-in')
    // TODO: implement — sign in with seeded test credentials, expect session established
    expect(false).toBe(true) // stub: replace with real assertions
  })

  test('sign-up with duplicate email returns error', async ({ page }) => {
    await page.goto('/auth/sign-up')
    // TODO: implement — attempt duplicate email sign-up, expect error message visible
    expect(false).toBe(true) // stub: replace with real assertions
  })
})
