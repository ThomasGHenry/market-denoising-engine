import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from './route'

vi.mock('../../../../lib/auth', () => ({
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}))

describe('auth route handler', function () {
  it('exports GET handler', function () {
    expect(GET).toBeDefined()
  })

  it('exports POST handler', function () {
    expect(POST).toBeDefined()
  })
})
