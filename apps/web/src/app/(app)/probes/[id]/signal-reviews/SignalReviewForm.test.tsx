import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import SignalReviewForm from './SignalReviewForm'

vi.mock('./actions', () => ({
  createSignalReview: vi.fn(),
}))

vi.mock('react', async function () {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useActionState: function (action: unknown, initial: unknown) {
      return [initial, action, false]
    },
  }
})

afterEach(cleanup)

describe('SignalReviewForm', function () {
  it('renders hidden probeId input with correct value', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    const input = document.querySelector('input[name="probeId"]') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('probe-1')
    expect(input.type).toBe('hidden')
  })

  it('renders signal select with all SignalStrength options', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    const select = document.querySelector('select[name="signal"]') as HTMLSelectElement
    expect(select).toBeTruthy()
    expect(select.required).toBe(true)
    const values = Array.from(select.options).map(function (o) { return o.value })
    expect(values).toContain('NONE')
    expect(values).toContain('WEAK')
    expect(values).toContain('PROMISING')
    expect(values).toContain('STRONG')
  })

  it('renders confidence select with all Confidence options', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    const select = document.querySelector('select[name="confidence"]') as HTMLSelectElement
    expect(select).toBeTruthy()
    expect(select.required).toBe(true)
    const values = Array.from(select.options).map(function (o) { return o.value })
    expect(values).toContain('LOW')
    expect(values).toContain('MEDIUM')
    expect(values).toContain('HIGH')
  })

  it('renders observation textarea with Observation label', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    expect(screen.getByLabelText('Observation')).toBeTruthy()
    const textarea = document.querySelector('textarea[name="observation"]')
    expect(textarea).toBeTruthy()
  })

  it('renders interpretation textarea with Interpretation label', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    expect(screen.getByLabelText('Interpretation')).toBeTruthy()
    const textarea = document.querySelector('textarea[name="interpretation"]')
    expect(textarea).toBeTruthy()
  })

  it('renders decision textarea with Decision label', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    expect(screen.getByLabelText('Decision')).toBeTruthy()
    const textarea = document.querySelector('textarea[name="decision"]')
    expect(textarea).toBeTruthy()
  })

  it('renders submit button', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    const button = screen.getByRole('button', { name: 'Add Review' })
    expect(button).toBeTruthy()
  })

  it('renders observation, interpretation, and decision as separate controls', function () {
    render(<SignalReviewForm probeId="probe-1" />)

    const observation = document.querySelector('textarea[name="observation"]')
    const interpretation = document.querySelector('textarea[name="interpretation"]')
    const decision = document.querySelector('textarea[name="decision"]')

    expect(observation).toBeTruthy()
    expect(interpretation).toBeTruthy()
    expect(decision).toBeTruthy()
    expect(observation).not.toBe(interpretation)
    expect(interpretation).not.toBe(decision)
  })
})
