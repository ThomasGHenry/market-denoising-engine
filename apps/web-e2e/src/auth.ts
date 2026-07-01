import type { Page } from '@playwright/test'
import { prisma } from '@template/db'

async function readVerificationToken(identifier: string): Promise<string> {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: 'desc' },
  })
  if (!record) {
    throw new Error(`No verification token found for ${identifier}`)
  }
  return record.token
}

function buildCallbackUrl(baseUrl: string, identifier: string, token: string): string {
  const params = new URLSearchParams({ callbackUrl: '/', token, email: identifier })
  return `${baseUrl}/api/auth/callback/resend?${params.toString()}`
}

export async function loginWithMagicLink(page: Page, email: string): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

  const csrfResponse = await page.request.get(`${baseUrl}/api/auth/csrf`)
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }

  await page.request.post(`${baseUrl}/api/auth/signin/resend`, {
    form: { email, csrfToken },
  })

  const token = await readVerificationToken(email)
  await page.goto(buildCallbackUrl(baseUrl, email, token))
}
