import { describe, it, expect, vi } from 'vitest'
import { isAllowedEmail } from './auth'

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

vi.mock('next-auth/providers/resend', () => ({
  default: vi.fn(),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(),
}))

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(),
}))

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn(),
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
