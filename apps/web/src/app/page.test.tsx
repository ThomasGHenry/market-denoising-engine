import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { redirect } from 'next/navigation'
import HomePage from './page'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('HomePage', function () {
  it('calls redirect to /dashboard on render', function () {
    HomePage()
    expect(vi.mocked(redirect)).toHaveBeenCalledWith('/dashboard')
  })
})
