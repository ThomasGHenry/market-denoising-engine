# Spec: Scoring Package — default_v0 Fitness Function

## Feature
Issue #7: `packages/scoring` — initial fitness scoring package

## User Stories

**US-1 — Score a probe's engagement signals**
As a system computing generation fitness, I need to reduce a probe's raw engagement metrics to a single numeric score so that probes within a generation can be ranked comparatively.

**US-2 — Handle missing metrics gracefully**
As a system where metrics are collected incrementally, I need null or missing metric fields to count as zero so that partial data does not block scoring.

**US-3 — Understand per-effort and per-impression efficiency**
As a reviewer evaluating probe ROI, I need to see score normalised by effort minutes and by impressions so that high-spend or high-reach probes are not automatically ranked highest on raw score alone.

**US-4 — Know which formula version produced the score**
As a system archiving generations for future recomputation, I need every result to carry a `formulaVersion` string so that old generations can always be recomputed with the exact formula that was active when they were created.

## Acceptance Criteria

1. `packages/scoring` exports `computeFitness`, `FitnessInput`, and `FitnessResult` from its public barrel.
2. `computeFitness(input: FitnessInput): FitnessResult` is a pure function with no I/O or side effects.
3. All fields in `FitnessInput` are optional; absent or null fields contribute zero to the score.
4. `FitnessResult` contains: `rawScore` (number), `scorePerEffortMinute` (number | null), `scorePerImpression` (number | null), `formulaVersion` ("default_v0" literal).
5. `rawScore` is computed as: `likes×1 + comments×5 + shares×4 + saves×4 + follows×8 + profileClicks×4 + linkClicks×6 + leads×20 + qualitativeScore×10`.
6. When `effortMinutes` is absent or ≤ 0, `scorePerEffortMinute` is `null`.
7. When `impressions` is absent or ≤ 0, `scorePerImpression` is `null`.
8. `formulaVersion` on every result is the literal `"default_v0"`.
9. No imports from `@prisma/client`, React, or any UI package.
10. Package carries NX tag `scope:domain`.
11. Vitest tests cover: all-null input, zero-effort, zero-impressions, happy path, partial inputs.
12. Adding a second formula requires a new named export (`computeFitnessV1`), not modifying this function.

## Out of Scope

- Database persistence of scores (belongs in `packages/db` / API layer)
- Score normalisation across a generation population (future feature)
- Automatic recomputation triggers
- Non-TypeScript runtimes
