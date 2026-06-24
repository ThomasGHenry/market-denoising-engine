import React from 'react'
import { type MetricSnapshot } from '@prisma/client'

interface MetricSnapshotListProps {
  snapshots: MetricSnapshot[]
}

export default function MetricSnapshotList({ snapshots }: MetricSnapshotListProps) {
  if (snapshots.length === 0) {
    return <p>No snapshots yet.</p>
  }

  return (
    <ul>
      {snapshots.map(renderSnapshot)}
    </ul>
  )
}

function renderSnapshot(snapshot: MetricSnapshot) {
  return (
    <li key={snapshot.id}>
      <time>{snapshot.capturedAt.toISOString()}</time>
      {snapshot.impressions !== null && <span>Impressions: {snapshot.impressions}</span>}
      {snapshot.likes !== null && <span>Likes: {snapshot.likes}</span>}
    </li>
  )
}
