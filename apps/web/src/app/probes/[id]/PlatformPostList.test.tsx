import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import PlatformPostList from './PlatformPostList'

describe('PlatformPostList', function () {
  it('renders platform name and URL for each post', function () {
    const posts = [
      { id: 'pp-1', platform: 'LINKEDIN', url: 'https://linkedin.com/post/123' },
    ]

    render(<PlatformPostList posts={posts} />)

    expect(screen.getByText('LINKEDIN')).toBeTruthy()
    expect(screen.getByText('https://linkedin.com/post/123')).toBeTruthy()
  })

  it('renders external link with target="_blank" and rel="noopener noreferrer"', function () {
    const posts = [
      { id: 'pp-2', platform: 'X', url: 'https://x.com/post/456' },
    ]

    render(<PlatformPostList posts={posts} />)

    const link = screen.getByRole('link', { name: 'https://x.com/post/456' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
