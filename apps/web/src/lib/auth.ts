import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { prisma } from '@template/db'

const ALLOWED_EMAIL = 'thomasghenry@gmail.com'

export function isAllowedEmail(email: string): boolean {
  return email === ALLOWED_EMAIL
}

function resolveSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET or AUTH_SECRET must be set')
  return secret
}

function buildGithubProvider(): Record<string, unknown> {
  if (!process.env.AUTH_GITHUB_ID) return {}
  return {
    github: {
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    },
  }
}

async function storeMagicLinkForE2E(email: string, url: string): Promise<void> {
  const id = `__e2e__${email}`
  await prisma.verification.upsert({
    where: { id },
    create: { id, identifier: id, value: url, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    update: { value: url, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
  })
}

async function sendRealEmail(email: string, url: string): Promise<void> {
  const resend = new Resend(process.env.AUTH_RESEND_KEY)
  await resend.emails.send({
    from: process.env.AUTH_EMAIL_FROM ?? 'MDE <onboarding@resend.dev>',
    to: email,
    subject: 'Sign in to MDE',
    html: `<a href="${url}">Click here to sign in</a>`,
  })
}

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string
  url: string
  token: string
}): Promise<void> {
  if (process.env.E2E_MODE === 'true' && isAllowedEmail(email)) {
    await storeMagicLinkForE2E(email, url)
  }
  await sendRealEmail(email, url)
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: resolveSecret(),
  emailAndPassword: { enabled: false },
  socialProviders: buildGithubProvider(),
  plugins: [magicLink({ sendMagicLink: sendMagicLinkEmail })],
})
