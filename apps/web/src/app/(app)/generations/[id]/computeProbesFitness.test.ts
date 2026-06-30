import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { computeProbesFitness } from './computeProbesFitness'

vi.mock('@template/db', () => ({
  prisma: {
    generation: {
      findUnique: vi.fn(),
    },
  },
}))

beforeEach(function () {
  vi.clearAllMocks()
})

type GenerationResult = Awaited<ReturnType<typeof prisma.generation.findUnique>>

describe('computeProbesFitness', function () {
  it('exists', function () {
    expect(computeProbesFitness).toBeDefined()
  })

  it('returns empty array when generation is not found', async function () {
    const mockFind = vi.mocked(prisma.generation.findUnique)
    mockFind.mockResolvedValueOnce(null)

    const result = await computeProbesFitness('gen-missing')

    expect(result).toEqual([])
  })

  it('returns empty array when generation has no probes', async function () {
    const mockFind = vi.mocked(prisma.generation.findUnique)
    mockFind.mockResolvedValueOnce({ probes: [] } as unknown as GenerationResult)

    const result = await computeProbesFitness('gen-1')

    expect(result).toEqual([])
  })

  it('computes scorePerEffortMinute when effortMinutes is set', async function () {
    const mockFind = vi.mocked(prisma.generation.findUnique)
    mockFind.mockResolvedValueOnce({
      probes: [
        {
          id: 'probe-1',
          title: 'Effort Probe',
          format: 'SHORT_TEXT',
          status: 'READY',
          effortMinutes: 30,
          createdAt: new Date('2024-01-01'),
          platformPosts: [
            { snapshots: [{ impressions: null, likes: 6, comments: null, shares: null, saves: null, follows: null, profileClicks: null, linkClicks: null, leads: null, qualitativeScore: null }] },
          ],
        },
      ],
    } as unknown as GenerationResult)

    const result = await computeProbesFitness('gen-1')

    expect(result[0]!.fitnessResult.rawScore).toBe(6)
    expect(result[0]!.fitnessResult.scorePerEffortMinute).toBe(0.2)
  })

  it('sorts probes by rawScore descending', async function () {
    const mockFind = vi.mocked(prisma.generation.findUnique)
    mockFind.mockResolvedValueOnce({
      probes: [
        {
          id: 'low-probe',
          title: 'Low Scorer',
          format: 'SHORT_TEXT',
          status: 'DRAFT',
          effortMinutes: null,
          createdAt: new Date('2024-01-01'),
          platformPosts: [
            { snapshots: [{ impressions: null, likes: 1, comments: null, shares: null, saves: null, follows: null, profileClicks: null, linkClicks: null, leads: null, qualitativeScore: null }] },
          ],
        },
        {
          id: 'high-probe',
          title: 'High Scorer',
          format: 'SHORT_TEXT',
          status: 'DRAFT',
          effortMinutes: null,
          createdAt: new Date('2024-01-02'),
          platformPosts: [
            { snapshots: [{ impressions: null, likes: 10, comments: null, shares: null, saves: null, follows: null, profileClicks: null, linkClicks: null, leads: null, qualitativeScore: null }] },
          ],
        },
      ],
    } as unknown as GenerationResult)

    const result = await computeProbesFitness('gen-1')

    expect(result[0]!.id).toBe('high-probe')
    expect(result[1]!.id).toBe('low-probe')
  })

  it('sorts probes with equal rawScore by createdAt ascending', async function () {
    const mockFind = vi.mocked(prisma.generation.findUnique)
    mockFind.mockResolvedValueOnce({
      probes: [
        {
          id: 'newer-probe',
          title: 'Newer',
          format: 'SHORT_TEXT',
          status: 'DRAFT',
          effortMinutes: null,
          createdAt: new Date('2024-01-02'),
          platformPosts: [],
        },
        {
          id: 'older-probe',
          title: 'Older',
          format: 'SHORT_TEXT',
          status: 'DRAFT',
          effortMinutes: null,
          createdAt: new Date('2024-01-01'),
          platformPosts: [],
        },
      ],
    } as unknown as GenerationResult)

    const result = await computeProbesFitness('gen-1')

    expect(result[0]!.id).toBe('older-probe')
    expect(result[1]!.id).toBe('newer-probe')
  })

  it('returns probe with rawScore 0 when probe has no platform posts', async function () {
    const mockFind = vi.mocked(prisma.generation.findUnique)
    mockFind.mockResolvedValueOnce({
      probes: [
        {
          id: 'probe-1',
          title: 'Test Probe',
          format: 'SHORT_TEXT',
          status: 'DRAFT',
          effortMinutes: null,
          createdAt: new Date('2024-01-01'),
          platformPosts: [],
        },
      ],
    } as unknown as GenerationResult)

    const result = await computeProbesFitness('gen-1')

    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('probe-1')
    expect(result[0]!.fitnessResult.rawScore).toBe(0)
  })
})
