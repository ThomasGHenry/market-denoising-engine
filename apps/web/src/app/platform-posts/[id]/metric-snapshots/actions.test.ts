import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createMetricSnapshot, updateMetricSnapshot, deleteMetricSnapshot } from './actions'

vi.mock('@template/db', () => ({
  prisma: {
    metricSnapshot: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const mockCreate = vi.mocked(prisma.metricSnapshot.create)
const mockUpdate = vi.mocked(prisma.metricSnapshot.update)
const mockDelete = vi.mocked(prisma.metricSnapshot.delete)

beforeEach(function () {
  vi.clearAllMocks()
})

describe('createMetricSnapshot', function () {
  it('returns error when platformPostId is missing', async function () {
    const formData = new FormData()
    formData.set('capturedAt', '2024-01-15T10:00')

    const result = await createMetricSnapshot(null, formData)

    expect(result).toBe('Platform post ID is required')
    expect(mockCreate).not.toHaveBeenCalled()
    expect(vi.mocked(redirect)).not.toHaveBeenCalled()
  })

  it('returns error when capturedAt is missing', async function () {
    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')

    const result = await createMetricSnapshot(null, formData)

    expect(result).toBe('Captured at is required')
    expect(mockCreate).not.toHaveBeenCalled()
    expect(vi.mocked(redirect)).not.toHaveBeenCalled()
  })

  it('returns error when capturedAt is not a valid date', async function () {
    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', 'not-a-date')

    const result = await createMetricSnapshot(null, formData)

    expect(result).toBe('capturedAt must be a valid date')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('calls prisma.metricSnapshot.create with correct data', async function () {
    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')
    formData.set('impressions', '1000')
    formData.set('likes', '50')

    await createMetricSnapshot(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        platformPostId: 'pp-1',
        capturedAt: new Date('2024-01-15T10:00'),
        impressions: 1000,
        likes: 50,
        views: null,
        comments: null,
        shares: null,
        saves: null,
        follows: null,
        profileClicks: null,
        linkClicks: null,
        leads: null,
        qualitativeScore: null,
        hoursSincePost: null,
        notes: null,
      },
    })
  })

  it('calls revalidatePath and redirect after create', async function () {
    const mockRedirect = vi.mocked(redirect)
    const mockRevalidate = vi.mocked(revalidatePath)

    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')

    await createMetricSnapshot(null, formData)

    expect(mockRevalidate).toHaveBeenCalledWith('/platform-posts/pp-1')
    expect(mockRedirect).toHaveBeenCalledWith('/platform-posts/pp-1')
  })

  it('ignores non-numeric values for optional int fields', async function () {
    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')
    formData.set('impressions', 'abc')

    await createMetricSnapshot(null, formData)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ impressions: null }),
      })
    )
  })
})

describe('updateMetricSnapshot', function () {
  it('returns error when id is missing', async function () {
    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')

    const result = await updateMetricSnapshot(null, formData)

    expect(result).toBe('Snapshot ID is required')
  })

  it('returns error when platformPostId is missing', async function () {
    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('capturedAt', '2024-01-15T10:00')

    const result = await updateMetricSnapshot(null, formData)

    expect(result).toBe('Platform post ID is required')
  })

  it('returns error when capturedAt is missing', async function () {
    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('platformPostId', 'pp-1')

    const result = await updateMetricSnapshot(null, formData)

    expect(result).toBe('Captured at is required')
  })

  it('passes platformPostId in where clause to scope the update', async function () {
    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')

    await updateMetricSnapshot(null, formData)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'snap-1', platformPostId: 'pp-1' } })
    )
  })

  it('calls prisma.metricSnapshot.update with correct data', async function () {
    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')
    formData.set('impressions', '2000')

    await updateMetricSnapshot(null, formData)

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'snap-1', platformPostId: 'pp-1' },
      data: {
        capturedAt: new Date('2024-01-15T10:00'),
        impressions: 2000,
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
        hoursSincePost: null,
        notes: null,
      },
    })
  })

  it('revalidates path and returns null on success', async function () {
    const mockRevalidate = vi.mocked(revalidatePath)

    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('platformPostId', 'pp-1')
    formData.set('capturedAt', '2024-01-15T10:00')

    const result = await updateMetricSnapshot(null, formData)

    expect(mockRevalidate).toHaveBeenCalledWith('/platform-posts/pp-1')
    expect(result).toBeNull()
  })
})

describe('deleteMetricSnapshot', function () {
  it('returns error when id is missing', async function () {
    const formData = new FormData()
    formData.set('platformPostId', 'pp-1')

    const result = await deleteMetricSnapshot(null, formData)

    expect(result).toBe('Snapshot ID is required')
  })

  it('returns error when platformPostId is missing', async function () {
    const formData = new FormData()
    formData.set('id', 'snap-1')

    const result = await deleteMetricSnapshot(null, formData)

    expect(result).toBe('Platform post ID is required')
  })

  it('passes platformPostId in where clause to scope the delete', async function () {
    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('platformPostId', 'pp-1')

    await deleteMetricSnapshot(null, formData)

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'snap-1', platformPostId: 'pp-1' } })
    )
  })

  it('calls prisma.metricSnapshot.delete and returns null on success', async function () {
    const mockRevalidate = vi.mocked(revalidatePath)

    const formData = new FormData()
    formData.set('id', 'snap-1')
    formData.set('platformPostId', 'pp-1')

    const result = await deleteMetricSnapshot(null, formData)

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'snap-1', platformPostId: 'pp-1' } })
    expect(mockRevalidate).toHaveBeenCalledWith('/platform-posts/pp-1')
    expect(result).toBeNull()
  })
})
