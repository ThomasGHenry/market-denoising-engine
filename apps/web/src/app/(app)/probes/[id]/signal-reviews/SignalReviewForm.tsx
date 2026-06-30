'use client'

import React from 'react'
import { useActionState } from 'react'
import { Button } from '@template/ui'
import { SignalStrength, Confidence } from '@template/domain'
import { createSignalReview } from './actions'

interface SignalReviewFormProps {
  probeId: string
}

export default function SignalReviewForm({ probeId }: SignalReviewFormProps) {
  const [error, formAction, isPending] = useActionState(createSignalReview, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="probeId" value={probeId} />
      {error && <p role="alert">{error}</p>}

      <label htmlFor="signal">Signal Strength</label>
      <select id="signal" name="signal" required>
        <option value="">Select signal strength</option>
        {Object.values(SignalStrength).map(function (s) {
          return <option key={s} value={s}>{s}</option>
        })}
      </select>

      <label htmlFor="confidence">Confidence</label>
      <select id="confidence" name="confidence" required>
        <option value="">Select confidence</option>
        {Object.values(Confidence).map(function (c) {
          return <option key={c} value={c}>{c}</option>
        })}
      </select>

      <label htmlFor="observation">Observation</label>
      <textarea id="observation" name="observation" required />

      <label htmlFor="interpretation">Interpretation</label>
      <textarea id="interpretation" name="interpretation" required />

      <label htmlFor="decision">Decision</label>
      <textarea id="decision" name="decision" />

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Add Review'}
      </Button>
    </form>
  )
}
