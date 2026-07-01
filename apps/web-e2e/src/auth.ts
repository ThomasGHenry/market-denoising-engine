import type { Page } from '@playwright/test'
import { prisma } from '@template/db'

const E2E_SENTINEL_PREFIX = '__e2e__'
const POLL_INTERVAL_MS = 500
const POLL_MAX_ATTEMPTS = 10

async function triggerMagicLink(page: Page, baseUrl: string, email: string): Promise<void> {
  await page.request.post(`${baseUrl}/api/auth/sign-in/magic-link`, {
    data: { email, callbackURL: '/' },
    headers: { 'Content-Type': 'application/json' },
  })
}

async function pollMagicLinkUrl(email: string): Promise<string> {
  const sentinel = E2E_SENTINEL_PREFIX + email
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const record = await prisma.verification.findFirst({
      where: { identifier: sentinel },
      orderBy: { expiresAt: 'desc' },
    })
    if (record) return record.value
    await new Promise<void>(function (resolve) {
      setTimeout(resolve, POLL_INTERVAL_MS)
    })
  }
  throw new Error(`No E2E magic link record found for ${email} after ${POLL_MAX_ATTEMPTS} attempts`)
}

export async function loginWithMagicLink(page: Page, email: string): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
  await triggerMagicLink(page, baseUrl, email)
  const magicUrl = await pollMagicLinkUrl(email)
  await page.goto(magicUrl)
}
