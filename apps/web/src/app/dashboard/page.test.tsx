import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('./loadDashboardData', () => ({
  loadDashboardData: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: function Link({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>
  },
}))

import { loadDashboardData } from './loadDashboardData'
import DashboardPage from './page'

afterEach(function () {
  cleanup()
})

function makeDefaultData() {
  return {
    activeGeneration: null,
    rankedProbes: [],
    openMutationCount: 0,
    needsMetricsProbes: [],
    needsReviewProbes: [],
  }
}

describe('DashboardPage', function () {
  it('renders without throwing', async function () {
    vi.mocked(loadDashboardData).mockResolvedValue(makeDefaultData())

    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('renders "No active generation" when activeGeneration is null', async function () {
    vi.mocked(loadDashboardData).mockResolvedValue(makeDefaultData())

    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('No active generation')).toBeTruthy()
  })

  it('renders generation title when activeGeneration exists', async function () {
    vi.mocked(loadDashboardData).mockResolvedValue({
      ...makeDefaultData(),
      activeGeneration: { id: 'gen-1', title: 'My Generation', status: 'ACTIVE' },
    })

    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText(/My Generation/)).toBeTruthy()
  })

  it('renders open mutation count', async function () {
    vi.mocked(loadDashboardData).mockResolvedValue({
      ...makeDefaultData(),
      openMutationCount: 7,
    })

    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText(/7 open mutations/)).toBeTruthy()
  })

  it('renders probe title in Needs Metrics Capture section', async function () {
    vi.mocked(loadDashboardData).mockResolvedValue({
      ...makeDefaultData(),
      needsMetricsProbes: [{ id: 'probe-1', title: 'Probe Needs Metrics' }],
    })

    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('Probe Needs Metrics')).toBeTruthy()
  })

  it('renders probe title in Needs Review section', async function () {
    vi.mocked(loadDashboardData).mockResolvedValue({
      ...makeDefaultData(),
      needsReviewProbes: [{ id: 'probe-2', title: 'Probe Needs Review' }],
    })

    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('Probe Needs Review')).toBeTruthy()
  })

  it('exports dynamic as force-dynamic', async function () {
    const mod = await import('./page')
    expect(mod.dynamic).toBe('force-dynamic')
  })
})
