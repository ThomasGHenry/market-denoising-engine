# Implementation Tasks: Issue #16 Fitness Computation

Strict RED → GREEN → REFACTOR per each task group. Run `npx vitest run` after every
implementation step to confirm state before moving to the next task.

New files:
- `apps/web/src/app/generations/[id]/aggregation.ts` — pure helper, no DB
- `apps/web/src/app/generations/[id]/aggregation.test.ts` — Vitest unit tests
- `apps/web/src/app/generations/[id]/computeProbesFitness.ts` — server-side DB + scoring
- `e2e/generations-fitness.spec.ts` — Playwright E2E for sort order and display

Modified files:
- `apps/web/src/app/generations/[id]/page.tsx` — use computeProbesFitness, update display

---

## Phase 1 — Pure aggregation helper

The aggregation function is a pure TypeScript function with no database or framework
dependency. It lives in `aggregation.ts` and is tested in isolation.

- [x] T-01 RED: In `aggregation.test.ts`, write a failing import test that imports
  `aggregateSnapshotsToFitnessInput` from `./aggregation`. The file does not exist yet.
  Run vitest — expect a module-not-found error (this counts as RED).

- [x] T-02 GREEN: Create `aggregation.ts` and export a stub
  `aggregateSnapshotsToFitnessInput` that accepts `(snapshots: unknown[], effortMinutes: number)`
  and returns `{}`. The import test passes. Run vitest — GREEN.

- [x] T-03 RED: Add test: calling `aggregateSnapshotsToFitnessInput([], 10)` returns a
  `FitnessInput` with `effortMinutes === 10` and all other fields `undefined`. Run vitest
  — this test fails because the stub returns `{}`.

- [x] T-04 GREEN: Implement the minimal return to pass T-03 (hardcode `{ effortMinutes: 10 }`
  or derive from parameter). Run vitest — GREEN.

- [x] T-05 RED: Add test: a single snapshot with `{ likes: 3, comments: 1 }` and
  `effortMinutes = 20` returns `FitnessInput` with `likes === 3`, `comments === 1`,
  `effortMinutes === 20`, and all other metric fields `undefined` or 0. Run vitest — FAIL.

- [x] T-06 GREEN: Implement field-by-field accumulation for all `FitnessInput` metric
  fields from the snapshot array. Run vitest — GREEN.

- [x] T-07 RED: Add test: two snapshots — `{ likes: 3 }` and `{ likes: 5, impressions: 100 }` —
  return `likes === 8`, `impressions === 100`. Run vitest — FAIL (only if sum logic is
  missing; skip to T-08 if T-06 already handles this).

- [x] T-08 GREEN + REFACTOR: Ensure null snapshot values are treated as 0 for each metric.
  Clean up the accumulator function so all eleven metric fields (`likes`, `comments`,
  `shares`, `saves`, `follows`, `profileClicks`, `linkClicks`, `leads`,
  `qualitativeScore`, `impressions`, and `effortMinutes` from probe) are handled
  explicitly. Run vitest — all GREEN.

- [x] T-09 RED: Add test: a snapshot with a `views` field set does NOT produce a `views`
  key in the returned `FitnessInput` (since `views` has no weight in `computeFitness`).
  Run vitest — this test fails if `views` leaks through.

- [x] T-10 GREEN: Confirm or enforce that `views` is excluded from the returned object.
  Run vitest — GREEN.

---

## Phase 2 — computeProbesFitness server function

`computeProbesFitness.ts` queries the database and calls both `aggregateSnapshotsToFitnessInput`
and `computeFitness`. It is a server-only module (no `'use client'`).

Testing strategy: the DB-calling function is tested via E2E (Phase 3). In this phase,
write a unit test that mocks only the Prisma call at the module boundary using Vitest
module mocking — acceptable here because `computeProbesFitness` is an adapter, not a
domain repository.

- [x] T-11 RED: In `aggregation.test.ts` (or a new `computeProbesFitness.test.ts`),
  write a test that imports `computeProbesFitness` from `./computeProbesFitness`. The
  file does not exist yet. Run vitest — module-not-found RED.

- [x] T-12 GREEN: Create `computeProbesFitness.ts` exporting a stub async function
  `computeProbesFitness(generationId: string)` returning `[]`. Run vitest — GREEN.

- [x] T-13 RED: Add a unit test using `vi.mock('@template/db')` to simulate two probes
  — one with snapshots and one without. Assert that the returned array has two items,
  that the probe with snapshots has a non-zero `fitness.rawScore`, and that the probe
  without snapshots has `fitness.rawScore === 0`. Run vitest — FAIL (stub returns []).

- [x] T-14 GREEN: Implement `computeProbesFitness`:
  1. Query `prisma.probe.findMany` where `generationId` matches, including
     `platformPosts.snapshots`.
  2. For each probe, call `aggregateSnapshotsToFitnessInput` over all snapshots from
     all platformPosts, passing `probe.effortMinutes`.
  3. Call `computeFitness` with the aggregated input.
  4. Return probes paired with their `FitnessResult`.
  Run vitest — GREEN.

- [x] T-15 RED: Add test: the returned array is sorted by `fitness.rawScore` descending,
  with a `createdAt` ascending tiebreaker. Run vitest — FAIL if sort is absent.

- [x] T-16 GREEN: Add sort step to `computeProbesFitness`. Run vitest — GREEN.

- [x] T-17 REFACTOR: Extract the sort comparator as a named function. Confirm the return
  type of `computeProbesFitness` is explicit (an array of objects pairing
  `Probe` fields with a `FitnessResult`). Run vitest — GREEN.

---

## Phase 3 — Generation detail page UI

- [x] T-18 RED: In `e2e/generations-fitness.spec.ts`, write a Playwright test that:
  - Seeds a generation with 3 probes having different snapshot totals.
  - Navigates to `/generations/[id]`.
  - Asserts the probe with the highest rawScore appears first in the table.
  Run `npm run e2e` — FAIL (current page does not compute fitness from snapshots).

- [x] T-19 GREEN: Update `loadGeneration` in `page.tsx` (or replace it with a call to
  `computeProbesFitness`) so that probes are ordered by computed rawScore. Remove the
  `orderBy: fitnessScore` Prisma clause. Run e2e — GREEN.

- [x] T-20 RED: Add Playwright assertion: each probe row displays a rawScore formatted
  to two decimal places. Run e2e — FAIL (current table shows stored `fitnessScore` or `—`).

- [x] T-21 GREEN: Update the probe table in `page.tsx` to render `fitness.rawScore.toFixed(2)`
  for each row using the `FitnessResult` from `computeProbesFitness`. Run e2e — GREEN.

- [x] T-22 RED: Add Playwright assertion: a probe row with `effortMinutes > 0` shows
  `scorePerEffortMinute` formatted to two decimal places; a probe row whose
  `scorePerEffortMinute` is null shows no effort rate cell (or displays `—`). Run e2e — FAIL.

- [x] T-23 GREEN: Add conditional rendering of `scorePerEffortMinute` in the probe table.
  Run e2e — GREEN.

- [x] T-24 RED: Add Playwright assertion: a probe row whose aggregated impressions total
  is greater than 0 shows `scorePerImpression` formatted to two decimal places; a probe
  row whose impressions total is 0 does not show a value for that field. Run e2e — FAIL.

- [x] T-25 GREEN: Add conditional rendering of `scorePerImpression` in the probe table.
  Run e2e — GREEN.

- [x] T-26 RED: Add Playwright assertion: a badge or element containing `default_v0` is
  visible on the page (once per table or once per row — either is acceptable). Run e2e — FAIL.

- [x] T-27 GREEN: Render `fitness.formulaVersion` as a badge in the probe table header
  or in each probe row. The value is taken from `FitnessResult.formulaVersion`, not
  hardcoded. Run e2e — GREEN.

- [x] T-28 RED: Add Playwright assertion: the heading or label for the probes section
  contains "best observed fitness" and does not contain "best content". Run e2e — FAIL.

- [x] T-29 GREEN: Update the section heading in `page.tsx` from "Probes" or equivalent
  to "Probes — best observed fitness". Run e2e — GREEN.

- [x] T-30 REFACTOR: Extract the per-probe fitness display into a named component
  `ProbeRow` or similar so `page.tsx` stays at a consistent level of abstraction.
  Run `npm run typecheck && npm run lint && npm run e2e` — all GREEN.

---

## Done criteria

- [x] `npx nx run web:test` passes with no failures
- [x] `npm run e2e` passes T-18 through T-29 assertions
- [x] `npm run typecheck` clean across all packages
- [x] `npm run lint` clean
- [x] No file marked `'use client'` imports from `@template/scoring` or `@template/domain`
- [x] The phrase "best content" does not appear in `apps/web/src/app/generations/`
