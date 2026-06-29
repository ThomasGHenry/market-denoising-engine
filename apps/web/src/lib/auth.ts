import NextAuth, { type NextAuthResult } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Provider } from '@auth/core/providers'
import { authConfig, isAllowedEmail } from './auth.config'

export { isAllowedEmail }

function buildAuthPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ''
  const pgAdapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter: pgAdapter })
}

function buildProviders(): Provider[] {
  const from = process.env.AUTH_EMAIL_FROM ?? 'MDE <onboarding@resend.dev>'
  const providers: Provider[] = [Resend({ from })]
  if (process.env.AUTH_GITHUB_ID) {
    providers.push(GitHub as Provider)
  }
  return providers
}

const nextAuth: NextAuthResult = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(buildAuthPrismaClient()),
  providers: buildProviders(),
})

export const handlers: NextAuthResult['handlers'] = nextAuth.handlers
export const auth: NextAuthResult['auth'] = nextAuth.auth
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut
