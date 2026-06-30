import type { Page } from '@playwright/test'
import { prisma } from '@template/db'

async function consumeVerificationToken(identifier: string): Promise<string> {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: 'desc' },
  })
  if (!record) {
    throw new Error(`No verification token found for ${identifier}`)
  }
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: record.token } },
  })
  return record.token
}

function buildCallbackUrl(baseUrl: string, identifier: string, token: string): string {
  const params = new URLSearchParams({ callbackUrl: '/', token, email: identifier })
  return `${baseUrl}/api/auth/callback/email?${params.toString()}`
}

export async function loginWithMagicLink(page: Page, email: string): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

  await page.goto(`${baseUrl}/api/auth/signin/resend`, { method: 'POST' })
  await page.request.post(`${baseUrl}/api/auth/signin/resend`, {
    form: { email, csrfToken: '' },
  })

  const token = await consumeVerificationToken(email)
  const callbackUrl = buildCallbackUrl(baseUrl, email, token)

  await page.goto(callbackUrl)
}
