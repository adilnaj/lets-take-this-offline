import { test } from '@playwright/test'

test.describe('Activity History (GAME-05)', () => {
  test.todo('/profile page requires login — redirects anonymous user to /auth/sign-in')
  test.todo('/profile shows list of past words the user practiced with mastery levels')
  test.todo('/profile shows mastery rating badge (seen/learning/mastered) per word')
  test.todo('/profile shows total points and streak counter with flame icon')
})
