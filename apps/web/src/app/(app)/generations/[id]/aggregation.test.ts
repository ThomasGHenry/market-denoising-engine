import { describe, it, expect } from 'vitest'
import { aggregateSnapshotsToFitnessInput } from './aggregation'

describe('aggregateSnapshotsToFitnessInput', function () {
  it('exists', function () {
    expect(aggregateSnapshotsToFitnessInput).toBeDefined()
  })

  it('returns single snapshot likes and comments, nulls for all-null fields', function () {
    const snapshot = {
      impressions: null,
      likes: 5,
      comments: 2,
      shares: null,
      saves: null,
      follows: null,
      profileClicks: null,
      linkClicks: null,
      leads: null,
      qualitativeScore: null,
    }

    const result = aggregateSnapshotsToFitnessInput([snapshot], 15)

    expect(result.likes).toBe(5)
    expect(result.comments).toBe(2)
    expect(result.impressions).toBeNull()
    expect(result.shares).toBeNull()
  })

  it('sums two snapshots and returns null for all-null fields', function () {
    const s1 = { impressions: null, likes: 3, comments: 1, shares: null, saves: null, follows: null, profileClicks: null, linkClicks: null, leads: null, qualitativeScore: null }
    const s2 = { impressions: null, likes: 7, comments: null, shares: null, saves: null, follows: null, profileClicks: null, linkClicks: null, leads: null, qualitativeScore: null }

    const result = aggregateSnapshotsToFitnessInput([s1, s2], null)

    expect(result.likes).toBe(10)
    expect(result.comments).toBe(1)
    expect(result.impressions).toBeNull()
    expect(result.effortMinutes).toBeNull()
  })

  it('uses effortMinutes from parameter not from snapshots', function () {
    const snapshot = { impressions: 100, likes: 1, comments: null, shares: null, saves: null, follows: null, profileClicks: null, linkClicks: null, leads: null, qualitativeScore: null }

    const result = aggregateSnapshotsToFitnessInput([snapshot], 45)

    expect(result.effortMinutes).toBe(45)
    expect(result.impressions).toBe(100)
  })

  it('returns all metric fields null and passes effortMinutes when snapshots is empty', function () {
    const result = aggregateSnapshotsToFitnessInput([], 30)

    expect(result.effortMinutes).toBe(30)
    expect(result.impressions).toBeNull()
    expect(result.likes).toBeNull()
    expect(result.comments).toBeNull()
    expect(result.shares).toBeNull()
    expect(result.saves).toBeNull()
    expect(result.follows).toBeNull()
    expect(result.profileClicks).toBeNull()
    expect(result.linkClicks).toBeNull()
    expect(result.leads).toBeNull()
    expect(result.qualitativeScore).toBeNull()
  })
})
