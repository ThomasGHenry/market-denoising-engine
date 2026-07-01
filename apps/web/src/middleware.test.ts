import { describe, it, expect, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { middleware, config } from './middleware'

vi.mock('better-auth/cookies', () => ({
  getSessionCookie: vi.fn(),
}))

import { getSessionCookie } from 'better-auth/cookies'

const mockGetSessionCookie = vi.mocked(getSessionCookie)

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(`http://localhost${pathname}`))
}

describe('middleware config', function () {
  it('exports a matcher array', function () {
    const matchers = Array.isArray(config.matcher) ? config.matcher : [config.matcher]
    expect(matchers.length).toBeGreaterThan(0)
  })
})

describe('middleware behaviour', function () {
  it('redirects unauthenticated request to /login', function () {
    mockGetSessionCookie.mockReturnValue(null)
    const result = middleware(makeRequest('/'))
    expect(result.status).toBe(307)
    expect(result.headers.get('location')).toContain('/login')
  })

  it('passes through authenticated request', function () {
    mockGetSessionCookie.mockReturnValue('session-token')
    const result = middleware(makeRequest('/'))
    expect(result.status).toBe(200)
  })

  it('passes through /login without session', function () {
    mockGetSessionCookie.mockReturnValue(null)
    const result = middleware(makeRequest('/login'))
    expect(result.status).toBe(200)
  })

  it('passes through /api/auth paths without session', function () {
    mockGetSessionCookie.mockReturnValue(null)
    const result = middleware(makeRequest('/api/auth/sign-in/magic-link'))
    expect(result.status).toBe(200)
  })

  it('protects /login-admin — bare startsWith must not match /login prefix', function () {
    mockGetSessionCookie.mockReturnValue(null)
    const result = middleware(makeRequest('/login-admin'))
    expect(result.status).toBe(307)
  })

  it('protects /api/authorization — must not match /api/auth prefix', function () {
    mockGetSessionCookie.mockReturnValue(null)
    const result = middleware(makeRequest('/api/authorization'))
    expect(result.status).toBe(307)
  })
})
