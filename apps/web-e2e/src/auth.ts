import type { Page } from '@playwright/test'
import { prisma } from '@template/db'

const E2E_SENTINEL_PREFIX = '__e2e__'

async function triggerMagicLink(page: Page, baseUrl: string, email: string): Promise<void> {
  await page.request.post(`${baseUrl}/api/auth/sign-in/magic-link`, {
    data: { email, callbackURL: '/' },
    headers: { 'Content-Type': 'application/json' },
  })
}

async function readMagicLinkUrl(email: string): Promise<string> {
  const sentinel = E2E_SENTINEL_PREFIX + email
  const record = await prisma.verification.findFirst({
    where: { identifier: sentinel },
    orderBy: { expiresAt: 'desc' },
  })
  if (!record) throw new Error(`No E2E magic link record found for ${email}`)
  return record.value
}

export async function loginWithMagicLink(page: Page, email: string): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
  await triggerMagicLink(page, baseUrl, email)
  const magicUrl = await readMagicLinkUrl(email)
  await page.goto(magicUrl)
}
