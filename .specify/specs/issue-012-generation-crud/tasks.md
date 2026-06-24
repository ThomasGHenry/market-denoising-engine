# Tasks: Generation CRUD — Issue #12

## Phase 1: Schema & Domain Foundations

- [ ] T01: Add ARCHIVED to GenerationStatus in prisma/schema.prisma
- [ ] T02: Add fitnessScore Float? to Probe model in prisma/schema.prisma
- [ ] T03: Add ARCHIVED to GenerationStatus in packages/domain/src/enums.ts
- [ ] T04: Add fitnessScore: number | null to Probe interface in packages/domain/src/interfaces.ts
- [ ] T05: Run typecheck to confirm schema+domain changes compile

## Phase 2: Server Actions — Test First

- [ ] T06: Create apps/web/src/app/generations/actions.test.ts — write failing test: createGeneration returns error when title is empty
- [ ] T07: Create apps/web/src/app/generations/actions.ts — stub createGeneration to make T06 pass (red → green)
- [ ] T08: Refactor: implement full createGeneration validation (title, theme, fitnessFunction, parentId lookup)
- [ ] T09: Write failing test: createGeneration happy path creates generation with DRAFT status
- [ ] T10: Implement prisma.generation.create call to make T09 pass
- [ ] T11: Write failing test: updateGenerationStatus rejects invalid transitions (DRAFT→RETIRED)
- [ ] T12: Stub updateGenerationStatus to make T11 pass
- [ ] T13: Write failing test: updateGenerationStatus valid transitions (DRAFT→ACTIVE, ACTIVE→ARCHIVED, ACTIVE→RETIRED)
- [ ] T14: Implement full updateGenerationStatus with valid transition map
- [ ] T15: Run npx nx run web:test — all tests green

## Phase 3: Pages

- [ ] T16: Create apps/web/src/app/generations/loading.tsx
- [ ] T17: Create apps/web/src/app/generations/error.tsx
- [ ] T18: Create apps/web/src/app/generations/page.tsx — list page (empty state + table)
- [ ] T19: Create apps/web/src/app/generations/new/GenerationForm.tsx — client form with useActionState
- [ ] T20: Create apps/web/src/app/generations/new/page.tsx — loads eligible parents, renders GenerationForm
- [ ] T21: Create apps/web/src/app/generations/[id]/loading.tsx
- [ ] T22: Create apps/web/src/app/generations/[id]/error.tsx
- [ ] T23: Create apps/web/src/app/generations/[id]/StatusControls.tsx — client component for status transitions
- [ ] T24: Create apps/web/src/app/generations/[id]/page.tsx — detail page with probes ranked by fitness

## Phase 4: Quality Gates

- [ ] T25: npm run typecheck — must pass with 0 errors
- [ ] T26: npm run lint — must pass with 0 errors
- [ ] T27: npm run build — must pass
- [ ] T28: Mark all tasks complete, commit with message: feat: Generation CRUD — server actions and pages (#12)
