'use client'

import { useActionState } from 'react'
import { Platform } from '@template/domain'
import { createPlatformPost } from '../../platform-posts/actions'

interface PlatformPostFormProps {
  probeId: string
}

export default function PlatformPostForm({ probeId }: PlatformPostFormProps) {
  const [error, formAction, isPending] = useActionState(createPlatformPost, null)

  return (
    <form action={formAction}>
      {error && <p>{error}</p>}

      <input type="hidden" name="probeId" value={probeId} />

      <label htmlFor="platform">Platform</label>
      <select id="platform" name="platform" required>
        <option value="">Select a platform</option>
        {Object.values(Platform).map(function (p) {
          return <option key={p} value={p}>{p}</option>
        })}
      </select>

      <label htmlFor="url">URL</label>
      <input id="url" name="url" type="url" required />

      <label htmlFor="publishedAt">Published At</label>
      <input id="publishedAt" name="publishedAt" type="datetime-local" required />

      <label htmlFor="caption">Caption (optional)</label>
      <textarea id="caption" name="caption" />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Recording...' : 'Record Post'}
      </button>
    </form>
  )
}
