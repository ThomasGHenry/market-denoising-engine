import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createMutation, listMutations, updateMutationStatus } from './actions'

vi.mock('@template/db', () => ({
  prisma: {
    mutation: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const mockCreate = vi.mocked(prisma.mutation.create)
const mockFindMany = vi.mocked(prisma.mutation.findMany)
const mockUpdate = vi.mocked(prisma.mutation.update)

beforeEach(function () {
  vi.clearAllMocks()
})

describe('actions module exports', function () {
  it('exports createMutation', function () {
    expect(createMutation).toBeDefined()
  })

  it('exports listMutations', function () {
    expect(listMutations).toBeDefined()
  })

  it('exports updateMutationStatus', function () {
    expect(updateMutationStatus).toBeDefined()
  })
})

describe('createMutation', function () {
  it('returns error when sourceProbeId is empty', async function () {
    const formData = new FormData()
    formData.set('sourceProbeId', '')
    formData.set('mutationType', 'HOOK')
    formData.set('description', 'Try a new angle')

    const result = await createMutation(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when mutationType is not a valid enum value', async function () {
    const formData = new FormData()
    formData.set('sourceProbeId', 'probe-1')
    formData.set('mutationType', 'BOGUS')
    formData.set('description', 'Try a new angle')

    const result = await createMutation(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when description is blank', async function () {
    const formData = new FormData()
    formData.set('sourceProbeId', 'probe-1')
    formData.set('mutationType', 'HOOK')
    formData.set('description', '   ')

    const result = await createMutation(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when mutationType is absent from FormData', async function () {
    const formData = new FormData()
    formData.set('sourceProbeId', 'probe-1')
    formData.set('description', 'Try a new angle')

    const result = await createMutation(null, formData)

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('does not redirect when prisma.mutation.create throws', async function () {
    mockCreate.mockRejectedValueOnce(new Error('DB error'))

    const formData = new FormData()
    formData.set('sourceProbeId', 'probe-1')
    formData.set('mutationType', 'HOOK')
    formData.set('description', 'Try a shorter hook')

    await createMutation(null, formData)

    expect(vi.mocked(redirect)).not.toHaveBeenCalled()
  })

  it('calls prisma.mutation.create with correct data and redirects when all fields valid', async function () {
    const formData = new FormData()
    formData.set('sourceProbeId', 'probe-1')
    formData.set('mutationType', 'HOOK')
    formData.set('description', 'Try a shorter hook')

    await createMutation(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        sourceProbeId: 'probe-1',
        mutationType: 'HOOK',
        description: 'Try a shorter hook',
        status: 'OPEN',
      },
    })
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/mutations')
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/probes/probe-1')
    expect(vi.mocked(redirect)).toHaveBeenCalledWith('/probes/probe-1')
  })
})

describe('updateMutationStatus', function () {
  it('returns error when id is empty', async function () {
    const result = await updateMutationStatus('', 'DONE')

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns error when newStatus is not a valid MutationStatus value', async function () {
    const result = await updateMutationStatus('mut-1', 'BOGUS')

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls prisma.mutation.update and revalidatePath when inputs are valid', async function () {
    mockUpdate.mockResolvedValueOnce({ sourceProbeId: 'probe-42' } as Awaited<ReturnType<typeof prisma.mutation.update>>)

    const result = await updateMutationStatus('mut-1', 'DONE')

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'mut-1' },
      data: { status: 'DONE' },
      select: { sourceProbeId: true },
    })
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/mutations')
    expect(result).toBeNull()
  })

  it('calls revalidatePath for both /mutations and /probes/<sourceProbeId>', async function () {
    mockUpdate.mockResolvedValueOnce({ sourceProbeId: 'probe-1' } as Awaited<ReturnType<typeof prisma.mutation.update>>)

    await updateMutationStatus('mut-1', 'DONE')

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/mutations')
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/probes/probe-1')
  })

  it('does not throw when prisma.mutation.update throws', async function () {
    mockUpdate.mockRejectedValueOnce(new Error('DB error'))

    await expect(updateMutationStatus('mut-1', 'DONE')).resolves.not.toThrow()
  })
})

describe('listMutations', function () {
  it('calls prisma.mutation.findMany with OPEN filter, desc order, and sourceProbe include', async function () {
    mockFindMany.mockResolvedValueOnce([])

    await listMutations()

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { status: 'OPEN' },
      include: { sourceProbe: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
  })
})
