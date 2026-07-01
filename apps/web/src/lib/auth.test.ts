import { describe, it, expect, vi } from 'vitest'
import { isAllowedEmail } from './auth'

vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({})),
}))

vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: vi.fn(),
}))

vi.mock('better-auth/plugins', () => ({
  magicLink: vi.fn(),
}))

vi.mock('@template/db', () => ({
  prisma: {},
}))

vi.mock('resend', () => ({
  Resend: vi.fn(),
}))

describe('isAllowedEmail', function () {
  it('permits thomasghenry@gmail.com', function () {
    expect(isAllowedEmail('thomasghenry@gmail.com')).toBe(true)
  })

  it('rejects any other email', function () {
    expect(isAllowedEmail('other@example.com')).toBe(false)
  })

  it('rejects empty string', function () {
    expect(isAllowedEmail('')).toBe(false)
  })
})
