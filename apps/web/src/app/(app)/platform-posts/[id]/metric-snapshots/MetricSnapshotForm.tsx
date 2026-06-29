'use client'

import React from 'react'
import { useActionState } from 'react'
import { createMetricSnapshot } from './actions'

interface MetricSnapshotFormProps {
  platformPostId: string
}

export default function MetricSnapshotForm({ platformPostId }: MetricSnapshotFormProps) {
  const [error, formAction, isPending] = useActionState(createMetricSnapshot, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="platformPostId" value={platformPostId} />
      {error && <p role="alert">{error}</p>}
      <label>
        Captured At
        <input type="datetime-local" name="capturedAt" required />
      </label>
      <label>
        Impressions
        <input type="number" name="impressions" />
      </label>
      <label>
        Views
        <input type="number" name="views" />
      </label>
      <label>
        Likes
        <input type="number" name="likes" />
      </label>
      <label>
        Comments
        <input type="number" name="comments" />
      </label>
      <label>
        Shares
        <input type="number" name="shares" />
      </label>
      <label>
        Saves
        <input type="number" name="saves" />
      </label>
      <label>
        Follows
        <input type="number" name="follows" />
      </label>
      <label>
        Profile Clicks
        <input type="number" name="profileClicks" />
      </label>
      <label>
        Link Clicks
        <input type="number" name="linkClicks" />
      </label>
      <label>
        Leads
        <input type="number" name="leads" />
      </label>
      <label>
        Qualitative Score
        <input type="number" name="qualitativeScore" />
      </label>
      <label>
        Hours Since Post
        <input type="number" name="hoursSincePost" />
      </label>
      <label>
        Notes
        <textarea name="notes" />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Add Snapshot'}
      </button>
    </form>
  )
}
