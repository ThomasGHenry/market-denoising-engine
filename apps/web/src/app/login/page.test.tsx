import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('../../lib/auth', () => ({
  signIn: vi.fn(),
}))

vi.mock('next/form', () => ({
  default: function Form({ children, action }: { children: React.ReactNode; action: string }) {
    return <form action={action}>{children}</form>
  },
}))

import LoginPage from './page'

describe('LoginPage', function () {
  it('renders a Sign in with GitHub button', function () {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeTruthy()
  })
})
