import { describe, it, expect, vi } from 'vitest'

vi.mock('@template/db', () => ({
  prisma: {
    generation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('createGeneration', function () {
  it('returns error when title is empty', async function () {
    const { createGeneration } = await import('./actions')
    const formData = new FormData()
    formData.set('title', '')
    formData.set('theme', 'test theme')
    formData.set('fitnessFunction', 'default_v0')

    const result = await createGeneration(null, formData)

    expect(result).toBe('Title is required')
  })
})
