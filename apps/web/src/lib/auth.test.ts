import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAllowedEmail, sendMagicLinkEmail } from './auth'

const { mockUpsert, mockEmailSend } = vi.hoisted(function () {
  return {
    mockUpsert: vi.fn(),
    mockEmailSend: vi.fn(),
  }
})

vi.hoisted(function () {
  process.env.AUTH_SECRET = 'test-secret-for-vitest'
})

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
  prisma: {
    verification: {
      upsert: mockUpsert,
    },
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockEmailSend } }
  }),
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

describe('sendMagicLinkEmail', function () {
  beforeEach(function () {
    vi.clearAllMocks()
    delete process.env.E2E_MODE
    mockEmailSend.mockResolvedValue({ data: { id: 'msg-1' }, error: null })
    mockUpsert.mockResolvedValue({})
  })

  it('writes sentinel AND sends real email for allowed email when E2E_MODE is true', async function () {
    process.env.E2E_MODE = 'true'

    await sendMagicLinkEmail({ email: 'thomasghenry@gmail.com', url: 'https://example.com/magic', token: 'tok' })

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '__e2e__thomasghenry@gmail.com' } }),
    )
    expect(mockEmailSend).toHaveBeenCalled()
  })

  it('falls through to real email for non-allowed email even when E2E_MODE is true', async function () {
    process.env.E2E_MODE = 'true'

    await sendMagicLinkEmail({ email: 'attacker@evil.com', url: 'https://example.com/magic', token: 'tok' })

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(mockEmailSend).toHaveBeenCalled()
  })

  it('sends real email when E2E_MODE is not set', async function () {
    await sendMagicLinkEmail({ email: 'thomasghenry@gmail.com', url: 'https://example.com/magic', token: 'tok' })

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(mockEmailSend).toHaveBeenCalled()
  })
})
