import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import React from 'react'
import MutationForm from './MutationForm'

vi.mock('../../mutations/actions', () => ({
  createMutation: vi.fn(),
}))

let mockActionState: unknown = null
let mockIsPending = false

vi.mock('react', async function () {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useActionState: function (action: unknown, _initial: unknown) {
      return [mockActionState, action, mockIsPending]
    },
  }
})

afterEach(function () {
  mockActionState = null
  mockIsPending = false
  cleanup()
})

describe('MutationForm', function () {
  it('renders a form with a hidden sourceProbeId input, mutationType select, and description textarea', function () {
    render(<MutationForm probeId="probe-1" />)

    const hiddenInput = document.querySelector('input[name="sourceProbeId"]') as HTMLInputElement
    expect(hiddenInput).toBeTruthy()
    expect(hiddenInput.type).toBe('hidden')
    expect(hiddenInput.value).toBe('probe-1')

    const select = document.querySelector('select[name="mutationType"]')
    expect(select).toBeTruthy()

    const textarea = document.querySelector('textarea[name="description"]')
    expect(textarea).toBeTruthy()
  })

  it('renders one option per MutationType value plus a default empty option', function () {
    render(<MutationForm probeId="probe-1" />)

    const select = document.querySelector('select[name="mutationType"]') as HTMLSelectElement
    const values = Array.from(select.options).map(function (o) { return o.value })
    expect(values).toContain('')
    expect(values).toContain('HOOK')
    expect(values).toContain('AUDIENCE')
    expect(values).toContain('PAIN')
    expect(values).toContain('PROMISE')
    expect(values).toContain('FORMAT')
    expect(values).toContain('PLATFORM')
    expect(values).toContain('CTA')
    expect(values).toContain('TONE')
    expect(values).toContain('PROOF')
    expect(values).toContain('VISUAL')
    expect(values).toContain('OTHER')
  })

  it('displays error message when action state is non-null', function () {
    mockActionState = 'Mutation type is required'
    render(<MutationForm probeId="probe-1" />)

    const alert = document.querySelector('[role="alert"]')
    expect(alert).toBeTruthy()
    expect(alert?.textContent).toBe('Mutation type is required')
  })

  it('disables submit button when isPending is true', function () {
    mockIsPending = true
    render(<MutationForm probeId="probe-1" />)

    const button = document.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.disabled).toBe(true)
  })
})
