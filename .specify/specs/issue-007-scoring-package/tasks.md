# Tasks: packages/scoring

## Phase 1 — Package scaffold

- [x] T01: Create `packages/scoring/package.json`
- [x] T02: Create `packages/scoring/project.json`
- [x] T03: Create `packages/scoring/tsconfig.json`
- [x] T04: Create `packages/scoring/vitest.config.ts`
- [x] T05: Create `packages/scoring/src/index.ts` (empty barrel)

## Phase 2 — Types + TDD loop

- [x] T06: Write failing test — `computeFitness` import fails (red: module does not exist)
- [x] T07: Create `packages/scoring/src/fitness.ts` with type stubs only — make T06 green
- [x] T08: Write failing test — all-null input returns `rawScore: 0`
- [x] T09: Implement `computeFitness` minimally to pass T08 (hardcode ok)
- [x] T10: Write failing test — happy path with all metrics set returns correct rawScore
- [x] T11: Implement formula correctly to pass T10
- [x] T12: Refactor — extract `metric()` helper, clean up
- [x] T13: Write failing test — partial inputs (only likes + leads set)
- [x] T14: Verify T13 passes with existing implementation (no code change expected)
- [x] T15: Write failing test — `effortMinutes: 0` → `scorePerEffortMinute: null`
- [x] T16: Implement `scorePerEffortMinute` logic to pass T15
- [x] T17: Write failing test — `effortMinutes` absent → `scorePerEffortMinute: null`
- [x] T18: Verify T17 passes (no code change expected)
- [x] T19: Write failing test — `effortMinutes: 10` with rawScore 20 → `scorePerEffortMinute: 2`
- [x] T20: Verify T19 passes (no code change expected)
- [x] T21: Write failing test — `impressions: 0` → `scorePerImpression: null`
- [x] T22: Implement `scorePerImpression` logic to pass T21
- [x] T23: Write failing test — `impressions` absent → `scorePerImpression: null`
- [x] T24: Verify T23 passes (no code change expected)
- [x] T25: Write failing test — `formulaVersion` is `"default_v0"` on every result
- [x] T26: Verify T25 passes (literal already in return)

## Phase 3 — Wire up barrel + quality gates

- [x] T27: Update `packages/scoring/src/index.ts` to export all from `fitness.ts`
- [x] T28: Run `npx nx run scoring:test` — all tests green
- [x] T29: Run `npm run typecheck` — all packages pass
- [x] T30: Run `npm run lint` — passes
- [x] T31: Mark all spec tasks `[x]`
- [x] T32: Commit: `feat: add packages/scoring with default_v0 fitness function (#7)`
