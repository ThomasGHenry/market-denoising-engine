import { test, expect } from '@playwright/test'

test('login page renders email input', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByLabel('Email address')).toBeVisible()
})
