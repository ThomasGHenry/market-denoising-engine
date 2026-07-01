// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

const { mockSignInSocial } = vi.hoisted(function () {
  return { mockSignInSocial: vi.fn() }
})

vi.mock('../../lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: mockSignInSocial,
    },
  },
}))

import GitHubSignInButton from './github-sign-in-button'

describe('GitHubSignInButton', function () {
  afterEach(function () {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders a sign in with github button', function () {
    render(<GitHubSignInButton />)
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeTruthy()
  })

  it('calls authClient.signIn.social with github provider on click', function () {
    render(<GitHubSignInButton />)
    fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }))
    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: 'github',
      callbackURL: '/',
    })
  })
})
