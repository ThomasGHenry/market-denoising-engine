import React from 'react'
import { signIn } from '../../lib/auth'

async function signInWithResend(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  await signIn('resend', { email, redirectTo: '/' })
}

async function signInWithGitHub() {
  'use server'
  await signIn('github', { redirectTo: '/' })
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
      <form action={signInWithResend}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required />
        <button type="submit">Send magic link</button>
      </form>
      <GitHubSignInForm />
    </main>
  )
}
