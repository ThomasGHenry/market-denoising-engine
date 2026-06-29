import { describe, it, expect, vi } from 'vitest'

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('next-auth/providers/github', () => ({
  default: vi.fn(),
}))

import { isAllowedLogin } from './auth'

describe('isAllowedLogin', function () {
  it('permits ThomasGHenry', function () {
    expect(isAllowedLogin('ThomasGHenry')).toBe(true)
  })

  it('rejects any other username', function () {
    expect(isAllowedLogin('someoneelse')).toBe(false)
  })

  it('rejects empty string', function () {
    expect(isAllowedLogin('')).toBe(false)
  })
})
