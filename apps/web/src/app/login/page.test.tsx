import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import LoginPage from './page'

vi.mock('../../lib/auth', () => ({
  signIn: vi.fn(),
}))

describe('LoginPage', function () {
  beforeEach(function () {
    delete process.env.AUTH_GITHUB_ID
  })

  afterEach(function () {
    cleanup()
    delete process.env.AUTH_GITHUB_ID
  })

  it('renders an email input field', function () {
    render(<LoginPage />)
    expect(screen.getByRole('textbox', { name: /email/i })).toBeTruthy()
  })

  it('renders a send magic link button', function () {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeTruthy()
  })

  it('renders GitHub sign-in button when AUTH_GITHUB_ID is present', function () {
    process.env.AUTH_GITHUB_ID = 'test-client-id'
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeTruthy()
  })

  it('omits GitHub sign-in button when AUTH_GITHUB_ID is absent', function () {
    render(<LoginPage />)
    expect(screen.queryByRole('button', { name: /sign in with github/i })).toBeNull()
  })
})
