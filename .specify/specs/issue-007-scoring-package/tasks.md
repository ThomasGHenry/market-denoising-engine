# Tasks: packages/scoring

## Phase 1 — Package scaffold

- [ ] T01: Create `packages/scoring/package.json`
- [ ] T02: Create `packages/scoring/project.json`
- [ ] T03: Create `packages/scoring/tsconfig.json`
- [ ] T04: Create `packages/scoring/vitest.config.ts`
- [ ] T05: Create `packages/scoring/src/index.ts` (empty barrel)

## Phase 2 — Types + TDD loop

- [ ] T06: Write failing test — `computeFitness` import fails (red: module does not exist)
- [ ] T07: Create `packages/scoring/src/fitness.ts` with type stubs only — make T06 green
- [ ] T08: Write failing test — all-null input returns `rawScore: 0`
- [ ] T09: Implement `computeFitness` minimally to pass T08 (hardcode ok)
- [ ] T10: Write failing test — happy path with all metrics set returns correct rawScore
- [ ] T11: Implement formula correctly to pass T10
- [ ] T12: Refactor — extract `metric()` helper, clean up
- [ ] T13: Write failing test — partial inputs (only likes + leads set)
- [ ] T14: Verify T13 passes with existing implementation (no code change expected)
- [ ] T15: Write failing test — `effortMinutes: 0` → `scorePerEffortMinute: null`
- [ ] T16: Implement `scorePerEffortMinute` logic to pass T15
- [ ] T17: Write failing test — `effortMinutes` absent → `scorePerEffortMinute: null`
- [ ] T18: Verify T17 passes (no code change expected)
- [ ] T19: Write failing test — `effortMinutes: 10` with rawScore 20 → `scorePerEffortMinute: 2`
- [ ] T20: Verify T19 passes (no code change expected)
- [ ] T21: Write failing test — `impressions: 0` → `scorePerImpression: null`
- [ ] T22: Implement `scorePerImpression` logic to pass T21
- [ ] T23: Write failing test — `impressions` absent → `scorePerImpression: null`
- [ ] T24: Verify T23 passes (no code change expected)
- [ ] T25: Write failing test — `formulaVersion` is `"default_v0"` on every result
- [ ] T26: Verify T25 passes (literal already in return)

## Phase 3 — Wire up barrel + quality gates

- [ ] T27: Update `packages/scoring/src/index.ts` to export all from `fitness.ts`
- [ ] T28: Run `npx nx run scoring:test` — all tests green
- [ ] T29: Run `npm run typecheck` — all packages pass
- [ ] T30: Run `npm run lint` — passes
- [ ] T31: Mark all spec tasks `[x]`
- [ ] T32: Commit: `feat: add packages/scoring with default_v0 fitness function (#7)`
