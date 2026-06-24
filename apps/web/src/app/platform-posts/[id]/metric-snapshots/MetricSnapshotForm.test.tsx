import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import MetricSnapshotForm from './MetricSnapshotForm'

vi.mock('./actions', () => ({
  createMetricSnapshot: vi.fn(),
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

describe('MetricSnapshotForm', function () {
  it('renders hidden platformPostId input with correct value', function () {
    render(<MetricSnapshotForm platformPostId="pp-1" />)

    const input = document.querySelector('input[name="platformPostId"]') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('pp-1')
    expect(input.type).toBe('hidden')
  })

  it('renders required capturedAt datetime-local input', function () {
    render(<MetricSnapshotForm platformPostId="pp-1" />)

    const input = document.querySelector('input[name="capturedAt"]') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.type).toBe('datetime-local')
    expect(input.required).toBe(true)
  })

  it('renders submit button', function () {
    render(<MetricSnapshotForm platformPostId="pp-1" />)

    const button = screen.getByRole('button', { name: 'Add Snapshot' })
    expect(button).toBeTruthy()
  })

  it('renders impressions number input', function () {
    render(<MetricSnapshotForm platformPostId="pp-1" />)

    const input = document.querySelector('input[name="impressions"]') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.type).toBe('number')
  })

  it('renders notes textarea', function () {
    render(<MetricSnapshotForm platformPostId="pp-1" />)

    const textarea = document.querySelector('textarea[name="notes"]')
    expect(textarea).toBeTruthy()
  })
})
