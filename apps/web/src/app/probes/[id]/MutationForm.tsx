'use client'

import React from 'react'
import { useActionState } from 'react'
import { MutationType } from '@template/domain'
import { createMutation } from '../../mutations/actions'

interface MutationFormProps {
  probeId: string
}

export default function MutationForm({ probeId }: MutationFormProps) {
  const [error, formAction, isPending] = useActionState(createMutation, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="sourceProbeId" value={probeId} />
      {error && <p role="alert">{error}</p>}

      <label htmlFor="mutationType">Mutation Type</label>
      <select id="mutationType" name="mutationType">
        <option value="">Select type</option>
        {Object.values(MutationType).map(function (t) {
          return <option key={t} value={t}>{t}</option>
        })}
      </select>

      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" required />

      <button type="submit" disabled={isPending}>
        Create Mutation
      </button>
    </form>
  )
}
