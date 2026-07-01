import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '../../lib/auth'

async function signInWithMagicLink(formData: FormData): Promise<void> {
  'use server'
  const raw = formData.get('email')
  if (typeof raw !== 'string' || !raw) return
  await auth.api.signInMagicLink({
    body: { email: raw, callbackURL: '/' },
    headers: await headers(),
  })
}

async function signInWithGitHub(): Promise<void> {
  'use server'
  const response = await auth.api.signInSocial({
    body: { provider: 'github', callbackURL: '/' },
    headers: await headers(),
  })
  if (response?.url) redirect(response.url)
}

function GitHubSignInForm() {
  if (!process.env.AUTH_GITHUB_ID) return null
  return (
    <form action={signInWithGitHub}>
      <button type="submit">Sign in with GitHub</button>
    </form>
  )
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
      <GitHubSignInForm />
    </main>
  )
}
