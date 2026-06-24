import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { createProbe, updateProbeStatus } from './actions'

vi.mock('@template/db', () => ({
  prisma: {
    probe: {
      create: vi.fn(),
      update: vi.fn(),
    },
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

describe('createProbe', function () {
  it('returns error when title is empty', async function () {
    const formData = new FormData()
    formData.set('generationId', 'gen-1')
    formData.set('title', '')
    formData.set('rawInput', 'some raw input')

    const result = await createProbe(null, formData)

    expect(result).toBe('Title is required')
  })

  it('returns error when generationId is empty', async function () {
    const formData = new FormData()
    formData.set('generationId', '')
    formData.set('title', 'My Probe')
    formData.set('rawInput', 'some raw input')

    const result = await createProbe(null, formData)

    expect(result).toBe('Generation is required')
  })

  it('returns error when rawInput is empty', async function () {
    const formData = new FormData()
    formData.set('generationId', 'gen-1')
    formData.set('title', 'My Probe')
    formData.set('rawInput', '')

    const result = await createProbe(null, formData)

    expect(result).toBe('Raw input is required')
  })

  it('creates probe with DRAFT status on happy path', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.create>>
    const mockCreate = vi.mocked(prisma.probe.create)
    mockCreate.mockResolvedValueOnce({ id: 'probe-1' } as ProbeRecord)

    const formData = new FormData()
    formData.set('generationId', 'gen-1')
    formData.set('title', 'My Probe')
    formData.set('rawInput', 'raw content here')
    formData.set('contentText', '')
    formData.set('format', 'SHORT_TEXT')
    formData.set('tags', '')
    formData.set('effortMinutes', '15')

    await createProbe(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        generationId: 'gen-1',
        title: 'My Probe',
        rawInput: 'raw content here',
        contentText: null,
        format: 'SHORT_TEXT',
        status: 'DRAFT',
        tags: [],
        effortMinutes: 15,
        parentProbeId: null,
      },
    })
  })

  it('splits tags on comma and trims whitespace', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.create>>
    const mockCreate = vi.mocked(prisma.probe.create)
    mockCreate.mockResolvedValueOnce({ id: 'probe-2' } as ProbeRecord)

    const formData = new FormData()
    formData.set('generationId', 'gen-1')
    formData.set('title', 'Tagged Probe')
    formData.set('rawInput', 'raw content')
    formData.set('format', 'SHORT_TEXT')
    formData.set('tags', ' marketing , growth , ,  social ')
    formData.set('effortMinutes', '10')

    await createProbe(null, formData)

    expect(mockCreate).toHaveBeenCalledOnce()
    const [callArg] = mockCreate.mock.calls[0] as Parameters<typeof prisma.probe.create>[]
    expect((callArg as Parameters<typeof prisma.probe.create>[0]).data.tags).toEqual(['marketing', 'growth', 'social'])
  })
})

describe('updateProbeStatus', function () {
  it('rejects invalid transition (PUBLISHED to DRAFT)', async function () {
    const result = await updateProbeStatus('probe-1', 'PUBLISHED', 'DRAFT')

    expect(result).toMatch(/invalid/i)
  })

  it('allows valid transition DRAFT to READY', async function () {
    type ProbeRecord = Awaited<ReturnType<typeof prisma.probe.update>>
    const mockUpdate = vi.mocked(prisma.probe.update)
    mockUpdate.mockResolvedValueOnce({ id: 'probe-1' } as ProbeRecord)

    const result = await updateProbeStatus('probe-1', 'DRAFT', 'READY')

    expect(result).toBeNull()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'probe-1' },
      data: { status: 'READY' },
    })
  })
})
