'use client'

import React from 'react'
import { authClient } from '../../lib/auth-client'

export default function GitHubSignInButton() {
  function handleClick() {
    authClient.signIn.social({ provider: 'github', callbackURL: '/' })
  }

  return <button onClick={handleClick}>Sign in with GitHub</button>
}
