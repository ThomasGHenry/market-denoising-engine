# Tasks: Domain Types

## Phase 1 — Enums

- [x] RED: Write test importing `GenerationStatus` from `@template/domain`, asserting `GenerationStatus.DRAFT === 'DRAFT'`
- [x] GREEN: Create `enums.ts` with `GenerationStatus`, update `index.ts` to export it
- [x] REFACTOR: Add remaining 7 enums to `enums.ts`, update `index.ts`, verify tests pass
- [x] COMMIT: `feat: add domain enums`

## Phase 2 — Interfaces

- [x] RED: Write test importing `Generation` and `GenerationStatus` from `@template/domain`, confirming `Generation` shape is accessible at runtime
- [x] GREEN: Create `interfaces.ts` with `Generation` only, update `index.ts`
- [x] REFACTOR: Add remaining 6 interfaces (`Probe`, `PlatformPost`, `MetricSnapshot`, `SignalReview`, `GenerationReview`, `Mutation`), update `index.ts`, verify tests pass
- [x] COMMIT: `feat: add domain interfaces`

## Phase 3 — Transition Guards

- [x] RED 1: Write test `isValidGenerationTransition(GenerationStatus.DRAFT, GenerationStatus.ACTIVE)` returns `true`
- [x] GREEN 1: Create `transitions.ts` with `isValidGenerationTransition` returning hardcoded `true`
- [x] RED 2: Add test `isValidGenerationTransition(GenerationStatus.ACTIVE, GenerationStatus.DRAFT)` returns `false`
- [x] GREEN 2: Implement Set-based generation transitions
- [x] RED 3: Add test `isValidProbeTransition(ProbeStatus.DRAFT, ProbeStatus.READY)` returns `true`
- [x] GREEN 3: Add `isValidProbeTransition` with Set-based probe transitions
- [x] REFACTOR: Add all RETIRED pairs for both guards, add edge-case tests, verify all pass
- [x] COMMIT: `feat: add transition guards`

## Phase 4 — Final Barrel

- [x] Verify `index.ts` re-exports all 8 enums, 7 interfaces, 2 guard functions
- [x] Run `npx nx run domain:test` — all pass
- [x] Run `npm run typecheck` — clean
- [x] Run `npm run lint` — no violations
- [x] Run `rg "from '@prisma/client'" packages/domain/` — zero results
- [x] COMMIT: `feat: implement domain types, enums, and transition guards`
