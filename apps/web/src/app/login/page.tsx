import React from 'react'
import { signIn } from '../../lib/auth'

async function signInWithGitHub() {
  'use server'
  await signIn('github')
}

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <form action={signInWithGitHub}>
        <button type="submit">Sign in with GitHub</button>
      </form>
    </main>
  )
}
