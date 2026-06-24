# Tasks: Domain Types

## Phase 1 — Enums

- [ ] RED: Write test importing `GenerationStatus` from `@template/domain`, asserting `GenerationStatus.DRAFT === 'DRAFT'`
- [ ] GREEN: Create `enums.ts` with `GenerationStatus`, update `index.ts` to export it
- [ ] REFACTOR: Add remaining 7 enums to `enums.ts`, update `index.ts`, verify tests pass
- [ ] COMMIT: `feat: add domain enums`

## Phase 2 — Interfaces

- [ ] RED: Write test importing `Generation` and `GenerationStatus` from `@template/domain`, confirming `Generation` shape is accessible at runtime
- [ ] GREEN: Create `interfaces.ts` with `Generation` only, update `index.ts`
- [ ] REFACTOR: Add remaining 6 interfaces (`Probe`, `PlatformPost`, `MetricSnapshot`, `SignalReview`, `GenerationReview`, `Mutation`), update `index.ts`, verify tests pass
- [ ] COMMIT: `feat: add domain interfaces`

## Phase 3 — Transition Guards

- [ ] RED 1: Write test `isValidGenerationTransition(GenerationStatus.DRAFT, GenerationStatus.ACTIVE)` returns `true`
- [ ] GREEN 1: Create `transitions.ts` with `isValidGenerationTransition` returning hardcoded `true`
- [ ] RED 2: Add test `isValidGenerationTransition(GenerationStatus.ACTIVE, GenerationStatus.DRAFT)` returns `false`
- [ ] GREEN 2: Implement Set-based generation transitions
- [ ] RED 3: Add test `isValidProbeTransition(ProbeStatus.DRAFT, ProbeStatus.READY)` returns `true`
- [ ] GREEN 3: Add `isValidProbeTransition` with Set-based probe transitions
- [ ] REFACTOR: Add all RETIRED pairs for both guards, add edge-case tests, verify all pass
- [ ] COMMIT: `feat: add transition guards`

## Phase 4 — Final Barrel

- [ ] Verify `index.ts` re-exports all 8 enums, 7 interfaces, 2 guard functions
- [ ] Run `npx nx run domain:test` — all pass
- [ ] Run `npm run typecheck` — clean
- [ ] Run `npm run lint` — no violations
- [ ] Run `rg "from '@prisma/client'" packages/domain/` — zero results
- [ ] COMMIT: `feat: implement domain types, enums, and transition guards`
