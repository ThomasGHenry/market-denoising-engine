import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { createGeneration, updateGenerationStatus } from './actions'

vi.mock('@template/db', () => ({
  prisma: {
    generation: {
      create: vi.fn(),
      findUnique: vi.fn(),
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

describe('createGeneration', function () {
  it('returns error when title is empty', async function () {
    const formData = new FormData()
    formData.set('title', '')
    formData.set('theme', 'test theme')
    formData.set('fitnessFunction', 'default_v0')

    const result = await createGeneration(null, formData)

    expect(result).toBe('Title is required')
  })

  it('creates generation with DRAFT status on happy path', async function () {
    type GenerationRecord = Awaited<ReturnType<typeof prisma.generation.create>>
    const mockCreate = vi.mocked(prisma.generation.create)
    mockCreate.mockResolvedValueOnce({
      id: 'gen-1',
      title: 'Test Gen',
      theme: 'test',
      status: 'DRAFT',
      fitnessFunction: 'default_v0',
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as GenerationRecord)

    const formData = new FormData()
    formData.set('title', 'Test Gen')
    formData.set('theme', 'test theme')
    formData.set('fitnessFunction', 'default_v0')

    await createGeneration(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: 'Test Gen',
        theme: 'test theme',
        fitnessFunction: 'default_v0',
        status: 'DRAFT',
        parentId: null,
      },
    })
  })
})

describe('updateGenerationStatus', function () {
  it('rejects PUBLISHED to DRAFT transition', async function () {
    const result = await updateGenerationStatus('gen-1', 'PUBLISHED', 'DRAFT')

    expect(result).toMatch(/invalid/i)
  })

  it('allows DRAFT to RETIRED transition', async function () {
    type GenerationRecord = Awaited<ReturnType<typeof prisma.generation.update>>
    const mockUpdate = vi.mocked(prisma.generation.update)
    mockUpdate.mockResolvedValueOnce({ id: 'gen-1' } as GenerationRecord)

    const result = await updateGenerationStatus('gen-1', 'DRAFT', 'RETIRED')

    expect(result).toBeNull()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'gen-1' },
      data: { status: 'RETIRED' },
    })
  })

  it('allows DRAFT to ACTIVE transition', async function () {
    type GenerationRecord = Awaited<ReturnType<typeof prisma.generation.update>>
    const mockUpdate = vi.mocked(prisma.generation.update)
    mockUpdate.mockResolvedValueOnce({ id: 'gen-1' } as GenerationRecord)

    const result = await updateGenerationStatus('gen-1', 'DRAFT', 'ACTIVE')

    expect(result).toBeNull()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'gen-1' },
      data: { status: 'ACTIVE' },
    })
  })
})
