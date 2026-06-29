'use client'

import { useActionState } from 'react'
import { Button } from '@template/ui'
import { createProbe } from '../actions'
import { Format } from '@template/domain'

interface ProbeFormProps {
  generations: { id: string; title: string }[]
  defaultGenerationId: string
  parentProbeCandidates: { id: string; title: string }[]
}

export default function ProbeForm({ generations, defaultGenerationId, parentProbeCandidates }: ProbeFormProps) {
  const [error, formAction, isPending] = useActionState(createProbe, null)

  return (
    <form action={formAction}>
      {error && <p>{error}</p>}

      <label htmlFor="generationId">Generation</label>
      <select id="generationId" name="generationId" defaultValue={defaultGenerationId} required>
        <option value="">Select a generation</option>
        {generations.map(function (gen) {
          return <option key={gen.id} value={gen.id}>{gen.title}</option>
        })}
      </select>

      <label htmlFor="title">Title</label>
      <input id="title" name="title" type="text" required />

      <label htmlFor="rawInput">Raw Input</label>
      <textarea id="rawInput" name="rawInput" required />

      <label htmlFor="contentText">Content Text (optional)</label>
      <textarea id="contentText" name="contentText" />

      <label htmlFor="format">Format</label>
      <select id="format" name="format" required>
        {Object.values(Format).map(function (f) {
          return <option key={f} value={f}>{f}</option>
        })}
      </select>

      <label htmlFor="tags">Tags (comma-separated)</label>
      <input id="tags" name="tags" type="text" />

      <label htmlFor="effortMinutes">Effort Minutes</label>
      <input id="effortMinutes" name="effortMinutes" type="number" defaultValue={10} />

      <label htmlFor="parentProbeId">Parent Probe (optional)</label>
      <select id="parentProbeId" name="parentProbeId">
        <option value="">None</option>
        {parentProbeCandidates.map(function (p) {
          return <option key={p.id} value={p.id}>{p.title}</option>
        })}
      </select>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Probe'}
      </Button>
    </form>
  )
}
