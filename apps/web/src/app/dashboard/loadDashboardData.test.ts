import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { computeProbesFitness } from '../generations/[id]/computeProbesFitness'
import { loadDashboardData } from './loadDashboardData'

vi.mock('@template/db', () => ({
  prisma: {
    generation: {
      findFirst: vi.fn(),
    },
    mutation: {
      count: vi.fn(),
    },
    probe: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../generations/[id]/computeProbesFitness', () => ({
  computeProbesFitness: vi.fn(),
}))

beforeEach(function () {
  vi.clearAllMocks()
})

describe('loadDashboardData', function () {
  it('returns null activeGeneration when no generations exist', async function () {
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    vi.mocked(prisma.probe.findMany).mockResolvedValue([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.activeGeneration).toBeNull()
  })

  it('returns generation data when ACTIVE generation exists', async function () {
    type GenerationRow = Awaited<ReturnType<typeof prisma.generation.findFirst>>
    const activeGen = { id: 'gen-1', title: 'Gen One', status: 'ACTIVE' } as unknown as GenerationRow
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(activeGen)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    vi.mocked(prisma.probe.findMany).mockResolvedValue([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.activeGeneration).toEqual({ id: 'gen-1', title: 'Gen One', status: 'ACTIVE' })
  })

  it('returns openMutationCount from count query', async function () {
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.mutation.count).mockResolvedValue(5)
    vi.mocked(prisma.probe.findMany).mockResolvedValue([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.openMutationCount).toBe(5)
  })

  it('returns needsMetricsProbes for probes with no posts', async function () {
    type ProbeResult = Awaited<ReturnType<typeof prisma.probe.findMany>>
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    vi.mocked(prisma.probe.findMany)
      .mockResolvedValueOnce([{ id: 'probe-1', title: 'No Posts Probe' }] as unknown as ProbeResult)
      .mockResolvedValueOnce([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.needsMetricsProbes).toEqual([{ id: 'probe-1', title: 'No Posts Probe' }])
  })

  it('returns needsReviewProbes for probes with no reviews', async function () {
    type ProbeResult = Awaited<ReturnType<typeof prisma.probe.findMany>>
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    vi.mocked(prisma.probe.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'probe-2', title: 'No Reviews Probe' }] as unknown as ProbeResult)
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.needsReviewProbes).toEqual([{ id: 'probe-2', title: 'No Reviews Probe' }])
  })

  it('returns latest generation when no ACTIVE generation exists', async function () {
    type GenerationRow = Awaited<ReturnType<typeof prisma.generation.findFirst>>
    const latestGen = { id: 'gen-2', title: 'Gen Two', status: 'DRAFT' } as unknown as GenerationRow
    vi.mocked(prisma.generation.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(latestGen)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    vi.mocked(prisma.probe.findMany).mockResolvedValue([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.activeGeneration).toEqual({ id: 'gen-2', title: 'Gen Two', status: 'DRAFT' })
  })

  it('uses some condition so probe with one post-with-snapshots and one without is included', async function () {
    const mockFind = vi.mocked(prisma.probe.findMany)
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    type ProbeResult = Awaited<ReturnType<typeof prisma.probe.findMany>>
    mockFind
      .mockResolvedValueOnce([{ id: 'probe-mixed', title: 'Mixed' }] as unknown as ProbeResult)
      .mockResolvedValueOnce([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    const call = mockFind.mock.calls[0]![0] as { where: { OR: unknown[] } }
    const orClause = call.where.OR[1] as { platformPosts: { some: unknown } }
    expect(orClause.platformPosts.some).toBeDefined()
  })

  it('returns empty rankedProbes when activeGeneration is null', async function () {
    vi.mocked(prisma.generation.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.mutation.count).mockResolvedValue(0)
    vi.mocked(prisma.probe.findMany).mockResolvedValue([])
    vi.mocked(computeProbesFitness).mockResolvedValue([])

    const result = await loadDashboardData()

    expect(result.rankedProbes).toEqual([])
    expect(computeProbesFitness).not.toHaveBeenCalled()
  })
})
