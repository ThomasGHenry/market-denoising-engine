import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { listMutations } from './actions'
import MutationsPage from './page'

vi.mock('./actions', () => ({
  listMutations: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: function Link({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>
  },
}))

describe('MutationsPage', function () {
  it('renders empty-state message when no mutations exist', async function () {
    vi.mocked(listMutations).mockResolvedValueOnce([])

    const jsx = await MutationsPage()
    render(jsx)

    expect(screen.getByText('No open mutations.')).toBeTruthy()
  })

  it('renders one row per mutation with probe title, type, description, status, and promote link', async function () {
    type MutationRecord = Awaited<ReturnType<typeof listMutations>>[number]
    vi.mocked(listMutations).mockResolvedValueOnce([
      {
        id: 'mut-1',
        mutationType: 'HOOK',
        description: 'Try a shorter hook',
        status: 'OPEN',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        sourceProbeId: 'probe-1',
        sourceProbe: { id: 'probe-1', title: 'Probe Alpha' },
      } as MutationRecord,
    ])

    const jsx = await MutationsPage()
    render(jsx)

    expect(screen.getByText('Probe Alpha')).toBeTruthy()
    expect(screen.getByText('HOOK')).toBeTruthy()
    expect(screen.getByText('Try a shorter hook')).toBeTruthy()
    expect(screen.getByText('OPEN')).toBeTruthy()

    const promoteLink = screen.getByText('Create probe from mutation')
    expect(promoteLink.getAttribute('href')).toBe(
      '/probes/new?rawInput=Try%20a%20shorter%20hook&parentProbeId=probe-1'
    )
  })
})
