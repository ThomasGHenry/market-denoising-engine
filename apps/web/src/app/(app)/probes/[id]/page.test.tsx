import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { prisma } from '@template/db'
import { notFound } from 'next/navigation'
import ProbeDetailPage from './page'

vi.mock('@template/db', () => ({
  prisma: {
    probe: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(function () { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('next/link', () => ({
  default: function Link({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>
  },
}))

vi.mock('./MutationForm', () => ({
  default: function MutationForm({ probeId }: { probeId: string }) {
    return <div data-testid="mutation-form" data-probe-id={probeId} />
  },
}))

vi.mock('./PlatformPostForm', () => ({
  default: function PlatformPostForm() {
    return <div data-testid="platform-post-form" />
  },
}))

vi.mock('./PlatformPostList', () => ({
  default: function PlatformPostList() {
    return <div data-testid="platform-post-list" />
  },
}))

vi.mock('./ProbeStatusControls', () => ({
  default: function ProbeStatusControls() {
    return <div data-testid="probe-status-controls" />
  },
}))

vi.mock('./signal-reviews/SignalReviewList', () => ({
  default: function SignalReviewList() {
    return <div data-testid="signal-review-list" />
  },
}))

vi.mock('./signal-reviews/SignalReviewForm', () => ({
  default: function SignalReviewForm() {
    return <div data-testid="signal-review-form" />
  },
}))

const mockProbe = {
  id: 'probe-1',
  title: 'Test Probe',
  status: 'DRAFT',
  format: 'SHORT_TEXT',
  effortMinutes: 30,
  fitnessScore: null,
  tags: [],
  rawInput: 'Some raw input',
  contentText: null,
  generation: { id: 'gen-1', title: 'Generation 1' },
  parentProbe: null,
  platformPosts: [],
  reviews: [],
  mutations: [],
}

describe('ProbeDetailPage', function () {
  it('calls notFound when prisma.probe.findUnique returns null', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    vi.mocked(prisma.probe.findUnique).mockResolvedValueOnce(null as unknown as ProbeRecord)

    await expect(
      ProbeDetailPage({ params: Promise.resolve({ id: 'probe-missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(vi.mocked(notFound)).toHaveBeenCalled()
  })

  it('renders MutationForm with probeId when probe has no mutations', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    vi.mocked(prisma.probe.findUnique).mockResolvedValueOnce(mockProbe as unknown as ProbeRecord)

    const jsx = await ProbeDetailPage({ params: Promise.resolve({ id: 'probe-1' }) })
    render(jsx)

    const mutationForm = document.querySelector('[data-testid="mutation-form"]')
    expect(mutationForm).toBeTruthy()
    expect(mutationForm?.getAttribute('data-probe-id')).toBe('probe-1')
  })

  it('renders a Create probe from mutation link for each mutation with correct href', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    vi.mocked(prisma.probe.findUnique).mockResolvedValueOnce({
      ...mockProbe,
      mutations: [
        {
          id: 'mut-1',
          mutationType: 'HOOK',
          description: 'Shorter hook',
          status: 'OPEN',
          sourceProbeId: 'probe-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    } as unknown as ProbeRecord)

    const jsx = await ProbeDetailPage({ params: Promise.resolve({ id: 'probe-1' }) })
    render(jsx)

    const link = screen.getByText('Create probe from mutation')
    expect(link.getAttribute('href')).toBe(
      '/probes/new?rawInput=Shorter%20hook&parentProbeId=probe-1'
    )
  })
})
