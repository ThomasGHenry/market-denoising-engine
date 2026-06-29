import type { FitnessInput } from '@template/scoring'

interface SnapshotFields {
  impressions: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  follows: number | null
  profileClicks: number | null
  linkClicks: number | null
  leads: number | null
  qualitativeScore: number | null
}

type MetricKey = keyof SnapshotFields

const METRIC_KEYS: MetricKey[] = [
  'impressions',
  'likes',
  'comments',
  'shares',
  'saves',
  'follows',
  'profileClicks',
  'linkClicks',
  'leads',
  'qualitativeScore',
]

export function aggregateSnapshotsToFitnessInput(
  snapshots: SnapshotFields[],
  effortMinutes: number | null
): FitnessInput {
  const result: FitnessInput = { effortMinutes }
  for (const key of METRIC_KEYS) {
    result[key] = sumField(snapshots, key)
  }
  return result
}

function sumField(snapshots: SnapshotFields[], key: MetricKey): number | null {
  const allNull = snapshots.every(function (s) { return s[key] === null })
  if (allNull) return null
  return snapshots.reduce(function (acc, s) { return acc + (s[key] ?? 0) }, 0)
}
