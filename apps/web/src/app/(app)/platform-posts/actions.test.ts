import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { Prisma } from '@prisma/client'
import { createPlatformPost } from './actions'

vi.mock('@template/db', () => ({
  prisma: {
    probe: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    platformPost: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

beforeEach(function () {
  vi.clearAllMocks()
})

describe('createPlatformPost', function () {
  it('returns error when probeId is missing', async function () {
    const formData = new FormData()
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    const result = await createPlatformPost(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns error when platform is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    const result = await createPlatformPost(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns error when url is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('publishedAt', '2024-01-15T10:00')

    const result = await createPlatformPost(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns error when publishedAt is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')

    const result = await createPlatformPost(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns error when probe does not exist', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    const mockFindUnique = vi.mocked(prisma.probe.findUnique)
    mockFindUnique.mockResolvedValueOnce(null as ProbeRecord)

    const formData = new FormData()
    formData.set('probeId', 'probe-nonexistent')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    const result = await createPlatformPost(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('calls prisma.platformPost.create with correct data when all fields are valid', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    const mockFindUnique = vi.mocked(prisma.probe.findUnique)
    mockFindUnique.mockResolvedValueOnce({
      id: 'probe-1',
      status: 'PUBLISHED',
      generationId: 'gen-1',
    } as ProbeRecord)

    type PlatformPostRecord = Awaited<ReturnType<typeof prisma.platformPost.create>>
    const mockCreate = vi.mocked(prisma.platformPost.create)
    mockCreate.mockResolvedValueOnce({ id: 'pp-1' } as PlatformPostRecord)

    vi.mocked(prisma.$transaction).mockImplementation(async function (fn) {
      return fn(prisma as Prisma.TransactionClient)
    })

    const { redirect } = await import('next/navigation')
    const mockRedirect = vi.mocked(redirect)

    const { revalidatePath } = await import('next/cache')
    const mockRevalidatePath = vi.mocked(revalidatePath)

    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    await createPlatformPost(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        probeId: 'probe-1',
        platform: 'LINKEDIN',
        url: 'https://linkedin.com/post/123',
        publishedAt: new Date('2024-01-15T10:00'),
        caption: null,
      },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/probes/probe-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/generations/gen-1')
    expect(mockRedirect).toHaveBeenCalledWith('/probes/probe-1')
  })

  it('writes caption to database when provided', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    const mockFindUnique = vi.mocked(prisma.probe.findUnique)
    mockFindUnique.mockResolvedValueOnce({
      id: 'probe-1',
      status: 'PUBLISHED',
      generationId: 'gen-1',
    } as ProbeRecord)

    type PlatformPostRecord = Awaited<ReturnType<typeof prisma.platformPost.create>>
    const mockCreate = vi.mocked(prisma.platformPost.create)
    mockCreate.mockResolvedValueOnce({ id: 'pp-1' } as PlatformPostRecord)

    vi.mocked(prisma.$transaction).mockImplementation(async function (fn) {
      return fn(prisma as Prisma.TransactionClient)
    })

    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')
    formData.set('caption', 'test caption')

    await createPlatformPost(null, formData)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ caption: 'test caption' }),
      })
    )
  })

  it('calls probe.update twice when probe is DRAFT (DRAFT→READY then READY→PUBLISHED)', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    const mockFindUnique = vi.mocked(prisma.probe.findUnique)
    mockFindUnique.mockResolvedValueOnce({
      id: 'probe-1',
      status: 'DRAFT',
      generationId: 'gen-1',
    } as ProbeRecord)

    type ProbeUpdateRecord = Awaited<ReturnType<typeof prisma.probe.update>>
    const mockUpdate = vi.mocked(prisma.probe.update)
    mockUpdate.mockResolvedValue({ id: 'probe-1' } as ProbeUpdateRecord)

    type PlatformPostRecord = Awaited<ReturnType<typeof prisma.platformPost.create>>
    const mockCreate = vi.mocked(prisma.platformPost.create)
    mockCreate.mockResolvedValueOnce({ id: 'pp-1' } as PlatformPostRecord)

    vi.mocked(prisma.$transaction).mockImplementation(async function (fn) {
      return fn(prisma as Prisma.TransactionClient)
    })

    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    await createPlatformPost(null, formData)

    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: 'probe-1' },
      data: { status: 'READY' },
    })
    expect(mockUpdate).toHaveBeenNthCalledWith(2, {
      where: { id: 'probe-1' },
      data: { status: 'PUBLISHED' },
    })
  })

  it('calls probe.update once when probe is READY (READY→PUBLISHED)', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    const mockFindUnique = vi.mocked(prisma.probe.findUnique)
    mockFindUnique.mockResolvedValueOnce({
      id: 'probe-1',
      status: 'READY',
      generationId: 'gen-1',
    } as ProbeRecord)

    type ProbeUpdateRecord = Awaited<ReturnType<typeof prisma.probe.update>>
    const mockUpdate = vi.mocked(prisma.probe.update)
    mockUpdate.mockResolvedValue({ id: 'probe-1' } as ProbeUpdateRecord)

    type PlatformPostRecord = Awaited<ReturnType<typeof prisma.platformPost.create>>
    const mockCreate = vi.mocked(prisma.platformPost.create)
    mockCreate.mockResolvedValueOnce({ id: 'pp-1' } as PlatformPostRecord)

    vi.mocked(prisma.$transaction).mockImplementation(async function (fn) {
      return fn(prisma as Prisma.TransactionClient)
    })

    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    await createPlatformPost(null, formData)

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'probe-1' },
      data: { status: 'PUBLISHED' },
    })
  })

  it('does not call probe.update when probe is already PUBLISHED', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.findUnique>>
    const mockFindUnique = vi.mocked(prisma.probe.findUnique)
    mockFindUnique.mockResolvedValueOnce({
      id: 'probe-1',
      status: 'PUBLISHED',
      generationId: 'gen-1',
    } as ProbeRecord)

    const mockUpdate = vi.mocked(prisma.probe.update)

    type PlatformPostRecord = Awaited<ReturnType<typeof prisma.platformPost.create>>
    const mockCreate = vi.mocked(prisma.platformPost.create)
    mockCreate.mockResolvedValueOnce({ id: 'pp-1' } as PlatformPostRecord)

    vi.mocked(prisma.$transaction).mockImplementation(async function (fn) {
      return fn(prisma as Prisma.TransactionClient)
    })

    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('platform', 'LINKEDIN')
    formData.set('url', 'https://linkedin.com/post/123')
    formData.set('publishedAt', '2024-01-15T10:00')

    await createPlatformPost(null, formData)

    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
