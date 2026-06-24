import { test, expect } from '@playwright/test';

test('home page has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/tgh-template/);
});

test('home page heading is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'tgh-template' })).toBeVisible();
});
