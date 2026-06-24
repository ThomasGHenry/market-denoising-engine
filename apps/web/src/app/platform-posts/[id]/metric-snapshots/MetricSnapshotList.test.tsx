import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import MetricSnapshotList from './MetricSnapshotList'
import type { MetricSnapshot } from '@prisma/client'

function makeSnapshot(overrides: Partial<MetricSnapshot> = {}): MetricSnapshot {
  return {
    id: 'snap-1',
    platformPostId: 'pp-1',
    capturedAt: new Date('2024-01-15T10:00:00Z'),
    hoursSincePost: null,
    impressions: null,
    views: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    follows: null,
    profileClicks: null,
    linkClicks: null,
    leads: null,
    qualitativeScore: null,
    notes: null,
    ...overrides,
  }
}

afterEach(cleanup)

describe('MetricSnapshotList', function () {
  it('renders empty-state message when no snapshots', function () {
    render(<MetricSnapshotList snapshots={[]} />)

    expect(screen.getByText('No snapshots yet.')).toBeTruthy()
  })

  it('renders capturedAt timestamp for each snapshot', function () {
    const snapshots = [makeSnapshot({ capturedAt: new Date('2024-01-15T10:00:00Z') })]

    render(<MetricSnapshotList snapshots={snapshots} />)

    expect(screen.getByText('2024-01-15T10:00:00.000Z')).toBeTruthy()
  })

  it('renders impressions when present', function () {
    const snapshots = [makeSnapshot({ impressions: 1500 })]

    render(<MetricSnapshotList snapshots={snapshots} />)

    expect(screen.getByText('Impressions: 1500')).toBeTruthy()
  })

  it('renders likes when present', function () {
    const snapshots = [makeSnapshot({ likes: 42 })]

    render(<MetricSnapshotList snapshots={snapshots} />)

    expect(screen.getByText('Likes: 42')).toBeTruthy()
  })

  it('does not render impressions label when impressions is null', function () {
    const snapshots = [makeSnapshot({ impressions: null })]

    render(<MetricSnapshotList snapshots={snapshots} />)

    expect(screen.queryByText(/Impressions:/)).toBeNull()
  })

  it('renders multiple snapshots', function () {
    const snapshots = [
      makeSnapshot({ id: 'snap-1', impressions: 100 }),
      makeSnapshot({ id: 'snap-2', impressions: 200 }),
    ]

    render(<MetricSnapshotList snapshots={snapshots} />)

    expect(screen.getByText('Impressions: 100')).toBeTruthy()
    expect(screen.getByText('Impressions: 200')).toBeTruthy()
  })
})
