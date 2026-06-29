import { test, expect, type Page } from '@playwright/test'

function extractIdFromUrl(url: string): string {
  const parts = url.split('/')
  return parts[parts.length - 1] ?? ''
}

async function fillDatetimeLocal(page: Page, label: string, value: string): Promise<void> {
  await page.getByLabel(label).fill(value)
}

test('full learning loop: create generation → probe → post → metrics → fitness', async ({ page }) => {
  const generationTitle = 'Smoke Gen ' + Date.now()
  const probeTitle = 'Smoke Probe ' + Date.now()

  await page.goto('/generations/new')
  await page.fill('#title', generationTitle)
  await page.fill('#theme', 'test theme')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/generations')

  await page.getByRole('link', { name: generationTitle }).click()
  await page.waitForURL('**/generations/**')
  const generationId = extractIdFromUrl(page.url())

  await page.click('button:has-text("Activate")')
  await page.waitForSelector('button:has-text("Publish")')

  await page.goto('/probes/new?generationId=' + generationId)
  await page.fill('#title', probeTitle)
  await page.fill('#rawInput', 'Smoke test probe content')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/generations/' + generationId)

  await page.getByRole('link', { name: probeTitle }).click()
  await page.waitForURL('**/probes/**')
  const probeId = extractIdFromUrl(page.url())

  await page.selectOption('#platform', 'LINKEDIN')
  await page.fill('#url', 'https://www.linkedin.com/posts/smoke-test')
  await fillDatetimeLocal(page, 'Published At', '2025-01-01T12:00')
  await page.click('button:has-text("Record Post")')
  await page.waitForURL('**/probes/' + probeId)

  const postLink = page.getByRole('link', { name: 'LINKEDIN' })
  const postHref = await postLink.getAttribute('href')
  const postId = extractIdFromUrl(postHref ?? '')

  await page.goto('/platform-posts/' + postId)
  await fillDatetimeLocal(page, 'Captured At', '2025-01-02T12:00')
  await page.getByLabel('Likes').fill('5')
  await page.click('button:has-text("Add Snapshot")')
  await page.waitForURL('**/platform-posts/' + postId)

  await page.goto('/generations/' + generationId)
  const probeRow = page.getByRole('row').filter({ hasText: probeTitle })
  const fitnessCell = probeRow.locator('td').nth(3)
  const fitnessText = await fitnessCell.textContent()
  expect(parseFloat(fitnessText ?? '0')).toBeGreaterThan(0)
})
