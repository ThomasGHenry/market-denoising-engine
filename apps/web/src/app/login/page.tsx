import React from 'react'
import { headers } from 'next/headers'
import { auth } from '../../lib/auth'
import GitHubSignInButton from './github-sign-in-button'

async function signInWithMagicLink(formData: FormData): Promise<void> {
  'use server'
  const raw = formData.get('email')
  if (typeof raw !== 'string' || !raw) return
  await auth.api.signInMagicLink({
    body: { email: raw, callbackURL: '/' },
    headers: await headers(),
  })
}

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <form action={signInWithMagicLink}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required />
        <button type="submit">Send magic link</button>
      </form>
      {process.env.AUTH_GITHUB_ID && <GitHubSignInButton />}
    </main>
  )
}
