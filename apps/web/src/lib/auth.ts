import NextAuth, { type NextAuthResult } from 'next-auth'
import GitHub from 'next-auth/providers/github'

const ALLOWED_LOGIN = 'ThomasGHenry'
const ALLOWED_EMAIL = 'thomasghenry@gmail.com'

export function isAllowedLogin(login: string): boolean {
  return login === ALLOWED_LOGIN
}

export function isAllowedEmail(email: string): boolean {
  return email === ALLOWED_EMAIL
}

function isAuthorized({ auth }: { auth: { user?: { login?: string } } | null }): boolean {
  const login = auth?.user?.login
  if (!login) return false
  return isAllowedLogin(login)
}

const nextAuth: NextAuthResult = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: function jwtCallback({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login
      }
      return token
    },
    session: function sessionCallback({ session, token }) {
      if (token.login) {
        (session.user as typeof session.user & { login: string }).login = token.login as string
      }
      return session
    },
    authorized: function authorizedCallback({ auth: session }) {
      return isAuthorized({ auth: session as { user?: { login?: string } } | null })
    },
  },
})

export const handlers: NextAuthResult['handlers'] = nextAuth.handlers
export const auth: NextAuthResult['auth'] = nextAuth.auth
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut
