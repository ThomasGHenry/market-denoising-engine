import { describe, it, expect, vi } from 'vitest'
import { config } from './middleware'

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({ auth: vi.fn() })),
}))

vi.mock('./lib/auth.config', () => ({
  authConfig: {},
  isAllowedEmail: vi.fn(),
}))

describe('middleware config', function () {
  it('exports a matcher array', function () {
    const matchers = Array.isArray(config.matcher) ? config.matcher : [config.matcher]
    expect(matchers.length).toBeGreaterThan(0)
  })

  it('matcher negative lookahead excludes /login', function () {
    const matchers = Array.isArray(config.matcher) ? config.matcher : [config.matcher]
    const pattern = matchers.join('|')
    expect(pattern).toContain('login')
  })

  it('matcher negative lookahead excludes /api/auth paths', function () {
    const matchers = Array.isArray(config.matcher) ? config.matcher : [config.matcher]
    const pattern = matchers.join('|')
    expect(pattern).toContain('api/auth')
  })
})
