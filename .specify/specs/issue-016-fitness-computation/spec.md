# Feature Spec: Fitness Computation and Probe Ranking
Issue #16

## Purpose

Integrate `packages/scoring` into the generation detail view so that observed market
fitness is calculated from recorded metric data and used to rank probes within a generation.

This satisfies the constitution's mandate: "Make fitness functions explicit and versioned;
never hide the formula." It closes the gap between the data capture layer (MetricSnapshot)
and the evaluation layer (computeFitness).

## Context

The `computeFitness` function in `packages/scoring` accepts a `FitnessInput` and returns
a `FitnessResult` containing a weighted `rawScore`, normalized rates, and a versioned
formula identifier. `MetricSnapshot` records capture the raw platform signals. As of this
issue, no path exists from stored snapshots to a displayed fitness score.

The generation detail page at `/generations/[id]` already orders probes by a stored
`Probe.fitnessScore` column, which is not populated by any current code path. This spec
replaces that placeholder sort with a live computation from snapshot data.

## Functional Requirements

### FR-001 — Metric aggregation across all snapshots

For each probe in a generation, all `MetricSnapshot` rows across all `PlatformPost`
records belonging to that probe are summed field-by-field to produce a single aggregate
signal. No snapshot is excluded on the basis of age, platform, or position.

Summed fields: `likes`, `comments`, `shares`, `saves`, `follows`, `profileClicks`,
`linkClicks`, `leads`, `qualitativeScore`, `impressions`.

The `views` field from `MetricSnapshot` has no corresponding weight in `computeFitness`
and is excluded from aggregation.

`effortMinutes` is taken from `Probe.effortMinutes` (a probe-level field), not from any
snapshot.

### FR-002 — Fitness computation via @template/scoring

After aggregation, `computeFitness` from `@template/scoring` is called with the
aggregated `FitnessInput`. This is the sole code path for computing fitness. No inline
formulas or alternative calculations are introduced.

### FR-003 — Probe ranking by rawScore descending

Probes on `/generations/[id]` are ordered by computed `rawScore` highest-first. Probes
with equal rawScore are ordered by `createdAt` ascending as a tiebreaker. The ordering
is determined in application code from the computed results, not by a database `ORDER BY`
on `Probe.fitnessScore`.

### FR-004 — Display of fitness scores

Each probe row in the generation detail view shows:

- **Raw fitness score** — the `rawScore` value from `FitnessResult`, formatted to two
  decimal places.
- **Score per effort minute** — `scorePerEffortMinute` from `FitnessResult`, formatted
  to two decimal places. Displayed only when `scorePerEffortMinute` is not null
  (i.e. `Probe.effortMinutes` is greater than zero).
- **Score per impression** — `scorePerImpression` from `FitnessResult`, formatted to
  two decimal places. Displayed only when `scorePerImpression` is not null (i.e. total
  aggregated `impressions` is greater than zero).

### FR-005 — Formula version badge

A badge or label displaying `default_v0` (the `formulaVersion` value from `FitnessResult`)
appears alongside or beneath the fitness scores in the probe table. The badge value is
read from `FitnessResult.formulaVersion`, not hardcoded in the UI.

### FR-006 — Fitness language

Any heading or label that describes the fitness ranking or the top-performing probe uses
the phrase "best observed fitness". The phrase "best content" is not used anywhere in
this view.

### FR-007 — Zero score for probes without snapshots

A probe that has no `MetricSnapshot` records (directly or through any `PlatformPost`)
produces `rawScore = 0`, `scorePerEffortMinute = null`, and `scorePerImpression = null`
from `computeFitness`. These probes appear at the bottom of the ranking (after all probes
with rawScore > 0) and before any probes tied at zero by `createdAt` ascending.

## Acceptance Scenarios

**Scenario A — Ranked display**
Given 3 probes in a generation with different metric totals.
When the user views `/generations/[id]`.
Then probes are sorted by `rawScore` descending with the formula version badge visible.

**Scenario B — Zero score**
Given a probe that has no MetricSnapshot records.
When fitness is computed for that probe.
Then `rawScore` equals 0 and the probe renders at the bottom of the list.

**Scenario C — Score per effort minute**
Given a probe with `effortMinutes = 30` and a computed `rawScore = 60`.
When `scorePerEffortMinute` is displayed.
Then it shows `2.00`.

**Scenario D — Score per impression hidden when no impressions**
Given a probe whose aggregated `impressions` total is 0 (or all snapshots have null impressions).
When the probe row is rendered.
Then the score per impression field is not displayed.

**Scenario E — Score per impression shown when impressions present**
Given a probe whose aggregated `impressions` total is 1000 and `rawScore = 60`.
When the probe row is rendered.
Then score per impression shows `0.06`.

## Constraints

- All data fetching happens in async Server Components per ADR 0105. No client-side
  fetch, SWR, or React Query is introduced.
- `packages/scoring` and `packages/domain` are imported only in server-side files
  (files without `'use client'`), per ADR 0105 and ADR 0100.
- `Probe.fitnessScore` (the stored column) is not written to in this issue. The computed
  score is derived at page-load time from snapshot data. Persistence of computed fitness
  to `Probe.fitnessScore` is deferred.
- Real-time score updates are out of scope. Page-load computation is sufficient for MVP.

## Out of Scope

- Real-time fitness updates (WebSocket, polling, incremental SSR)
- Writing computed fitness back to `Probe.fitnessScore`
- Fitness comparison across generations
- Weighting or filtering snapshots by recency or platform
- Changing the `computeFitness` formula or adding a new formula version
