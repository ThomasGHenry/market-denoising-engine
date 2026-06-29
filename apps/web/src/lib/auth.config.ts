import type { NextAuthConfig } from 'next-auth'

const ALLOWED_EMAIL = 'thomasghenry@gmail.com'

export function isAllowedEmail(email: string): boolean {
  return email === ALLOWED_EMAIL
}

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    authorized: function authorizedCallback({ auth }) {
      const email = auth?.user?.email
      if (!email) return false
      return isAllowedEmail(email)
    },
  },
}
