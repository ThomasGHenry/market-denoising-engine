import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@template/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSignalReview } from './actions'

vi.mock('@template/db', () => ({
  prisma: {
    signalReview: {
      create: vi.fn(),
    },
  },
}))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const mockCreate = vi.mocked(prisma.signalReview.create)

beforeEach(function () {
  vi.clearAllMocks()
})

describe('createSignalReview', function () {
  it('returns error when probeId is missing', async function () {
    const formData = new FormData()
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBe('Probe ID is required')
    expect(mockCreate).not.toHaveBeenCalled()
    expect(vi.mocked(redirect)).not.toHaveBeenCalled()
  })

  it('returns error when signal is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBe('Signal strength is required')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when confidence is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBe('Confidence is required')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when observation is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'MEDIUM')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBe('Observation is required')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when interpretation is missing', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Post reached 2k people')

    const result = await createSignalReview(null, formData)

    expect(result).toBe('Interpretation is required')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('calls prisma.signalReview.create with all three separate text fields', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')
    formData.set('decision', 'Run a variant with stronger CTA')

    await createSignalReview(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        probeId: 'probe-1',
        signal: 'PROMISING',
        confidence: 'MEDIUM',
        observation: 'Post reached 2k people',
        interpretation: 'Audience responds to pain framing',
        decision: 'Run a variant with stronger CTA',
      },
    })
  })

  it('passes null for decision when omitted', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'WEAK')
    formData.set('confidence', 'LOW')
    formData.set('observation', 'Low reach')
    formData.set('interpretation', 'Hook did not land')

    await createSignalReview(null, formData)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ decision: null }),
    })
  })

  it('returns error when signal is not a valid enum value', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'BOGUS')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBeTruthy()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error when confidence is not a valid enum value', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'BOGUS')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBeTruthy()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns error string when prisma throws', async function () {
    mockCreate.mockRejectedValueOnce(new Error('DB down'))
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Post reached 2k people')
    formData.set('interpretation', 'Audience responds to pain framing')

    const result = await createSignalReview(null, formData)

    expect(result).toBeTruthy()
  })

  it('calls revalidatePath with probe path and redirects', async function () {
    const formData = new FormData()
    formData.set('probeId', 'probe-1')
    formData.set('signal', 'PROMISING')
    formData.set('confidence', 'MEDIUM')
    formData.set('observation', 'Good reach')
    formData.set('interpretation', 'Works')

    await createSignalReview(null, formData)

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/probes/probe-1')
    expect(vi.mocked(redirect)).toHaveBeenCalledWith('/probes/probe-1')
  })
})
